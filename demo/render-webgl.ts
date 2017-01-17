import * as Spine from "../spine";
import * as Atlas from "./atlas";

export class RenderWebGL {
  public gl: WebGLRenderingContext;
  public bone_map: {[key: string]: RenderBone} = {};
  public skin_map: {[key: string]: RenderSkin} = {};
  public textures: {[key: string]: RenderTexture} = {};
  public projection: Float32Array = mat4x4Identity(new Float32Array(16));
  public modelview: Float32Array = mat4x4Identity(new Float32Array(16));
  public texmatrix: Float32Array = mat3x3Identity(new Float32Array(9));
  public color: Float32Array = vec4Identity(new Float32Array(4));
  public mesh_shader: RenderShader;
  public ffd_mesh_shader: RenderShader;
  public skin_shader_modelview_count: number = 16; // mat4
  public skin_shader_modelview_array: Float32Array = new Float32Array(16 * this.skin_shader_modelview_count);
  public skin_shader_blenders_count: number = 8; // vec2
  public skin_shader: RenderShader;
  public ffd_skin_shader: RenderShader;
  public region_vertex_position: RenderVertex;
  public region_vertex_texcoord: RenderVertex;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;

    const mesh_shader_vs_src: string[] = [
      "uniform mat4 uProjection;",
      "uniform mat4 uModelview;",
      "uniform mat3 uTexMatrix;",
      "attribute vec2 aPosition;", // [ x, y ]
      "attribute vec2 aTexCoord;", // [ u, v ]
      "varying vec3 vTexCoord;",
      "void main(void) {",
      " gl_Position = uProjection * uModelview * vec4(aPosition, 0.0, 1.0);",
      " vTexCoord = uTexMatrix * vec3(aTexCoord, 1.0);",
      "}"
    ];
    const ffd_mesh_shader_vs_src: string[] = [
      "uniform mat4 uProjection;",
      "uniform mat4 uModelview;",
      "uniform mat3 uTexMatrix;",
      "uniform float uMorphWeight;",
      "attribute vec2 aPosition;", // [ x, y ]
      "attribute vec2 aTexCoord;", // [ u, v ]
      "attribute vec2 aPositionMorph0;", // [ dx, dy ]
      "attribute vec2 aPositionMorph1;", // [ dx, dy ]
      "varying vec3 vTexCoord;",
      "void main(void) {",
      " gl_Position = uProjection * uModelview * vec4(aPosition + mix(aPositionMorph0, aPositionMorph1, uMorphWeight), 0.0, 1.0);",
      " vTexCoord = uTexMatrix * vec3(aTexCoord, 1.0);",
      "}"
    ];
    const mesh_shader_fs_src: string[] = [
      "uniform sampler2D uSampler;",
      "uniform vec4 uColor;",
      "varying vec3 vTexCoord;",
      "void main(void) {",
      " gl_FragColor = uColor * texture2D(uSampler, vTexCoord.st);",
      "}"
    ];
    this.mesh_shader = glMakeShader(gl, mesh_shader_vs_src, mesh_shader_fs_src);
    this.ffd_mesh_shader = glMakeShader(gl, ffd_mesh_shader_vs_src, mesh_shader_fs_src);

    const skin_shader_vs_src: (string|string[])[] = [
      "uniform mat4 uProjection;",
      "uniform mat4 uModelviewArray[" + this.skin_shader_modelview_count + "];",
      "uniform mat3 uTexMatrix;",
      "attribute vec2 aPosition;", // [ x, y ]
      "attribute vec2 aTexCoord;", // [ u, v ]
      repeat("attribute vec2 aBlenders{index};", this.skin_shader_blenders_count), // [ i0, w0, i1, w1, ... ]
      "varying vec3 vTexCoord;",
      "void main(void) {",
      " vec4 position = vec4(aPosition, 0.0, 1.0);",
      " vec4 blendPosition = vec4(0.0);",
      repeat(" blendPosition += (uModelviewArray[int(aBlenders{index}.x)] * position) * aBlenders{index}.y;", this.skin_shader_blenders_count),
      " gl_Position = uProjection * vec4(blendPosition.xy, 0.0, 1.0);",
      " vTexCoord = uTexMatrix * vec3(aTexCoord, 1.0);",
      "}"
    ];
    const ffd_skin_shader_vs_src: (string|string[])[] = [
      "uniform mat4 uProjection;",
      "uniform mat4 uModelviewArray[" + this.skin_shader_modelview_count + "];",
      "uniform mat3 uTexMatrix;",
      "uniform float uMorphWeight;",
      "attribute vec2 aPosition;", // [ x, y ]
      "attribute vec2 aTexCoord;", // [ u, v ]
      "attribute vec2 aPositionMorph0;", // [ dx, dy ]
      "attribute vec2 aPositionMorph1;", // [ dx, dy ]
      repeat("attribute vec2 aBlenders{index};", this.skin_shader_blenders_count), // [ i0, w0, i1, w1, ... ]
      "varying vec3 vTexCoord;",
      "void main(void) {",
      " vec4 position = vec4(aPosition + mix(aPositionMorph0, aPositionMorph1, uMorphWeight), 0.0, 1.0);",
      " vec4 blendPosition = vec4(0.0);",
      repeat(" blendPosition += (uModelviewArray[int(aBlenders{index}.x)] * position) * aBlenders{index}.y;", this.skin_shader_blenders_count),
      " gl_Position = uProjection * vec4(blendPosition.xy, 0.0, 1.0);",
      " vTexCoord = uTexMatrix * vec3(aTexCoord, 1.0);",
      "}"
    ];
    const skin_shader_fs_src: string[] = [
      "uniform sampler2D uSampler;",
      "uniform vec4 uColor;",
      "varying vec3 vTexCoord;",
      "void main(void) {",
      " gl_FragColor = uColor * texture2D(uSampler, vTexCoord.st);",
      "}"
    ];
    this.skin_shader = glMakeShader(gl, skin_shader_vs_src, skin_shader_fs_src);
    this.ffd_skin_shader = glMakeShader(gl, ffd_skin_shader_vs_src, skin_shader_fs_src);

    this.region_vertex_position = glMakeVertex(gl, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW); // [ x, y ]
    this.region_vertex_texcoord = glMakeVertex(gl, new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]), 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW); // [ u, v ]
  }

  public loadData(spine_data: Spine.Data, atlas_data: Atlas.Data | null, images: {[key: string]: HTMLImageElement}): void {
    spine_data.iterateBones((bone_key: string, bone: Spine.Bone): void => {
      const render_bone: RenderBone = this.bone_map[bone_key] = new RenderBone();
      Spine.Space.invert(bone.world_space, render_bone.setup_space);
    });
    spine_data.iterateSkins((skin_key: string, skin: Spine.Skin): void => {
      const render_skin: RenderSkin = this.skin_map[skin_key] = new RenderSkin();
      skin.iterateAttachments((slot_key: string, skin_slot: Spine.SkinSlot, attachment_key: string, attachment: Spine.Attachment): void => {
        if (!attachment) { return; }
        const render_slot: RenderSlot = render_skin.slot_map[slot_key] || (render_skin.slot_map[slot_key] = new RenderSlot());
        switch (attachment.type) {
          case "region":
            render_slot.attachment_map[attachment_key] = new RenderRegionAttachment(this).loadData(spine_data, skin_key, slot_key, attachment_key, <Spine.RegionAttachment> attachment);
            break;
          case "mesh":
            render_slot.attachment_map[attachment_key] = new RenderMeshAttachment(this).loadData(spine_data, skin_key, slot_key, attachment_key, <Spine.MeshAttachment> attachment);
            break;
          case "weightedmesh":
            render_slot.attachment_map[attachment_key] = new RenderWeightedMeshAttachment(this).loadData(spine_data, skin_key, slot_key, attachment_key, <Spine.WeightedMeshAttachment> attachment);
            break;
        }
      });
    });
    if (atlas_data) {
      const gl: WebGLRenderingContext = this.gl;
      atlas_data.pages.forEach((page: Atlas.Page): void => {
        if (page.format !== "RGBA8888") {
          throw new Error(page.format);
        }
        let min_filter: number = gl.NONE;
        switch (page.min_filter) {
          case "Nearest": min_filter = gl.NEAREST; break;
          default: case "Linear": min_filter = gl.LINEAR; break;
          case "MipMapNearestNearest": min_filter = gl.NEAREST_MIPMAP_NEAREST; break;
          case "MipMapLinearNearest": min_filter = gl.LINEAR_MIPMAP_NEAREST; break;
          case "MipMapNearestLinear": min_filter = gl.NEAREST_MIPMAP_LINEAR; break;
          case "MipMapLinearLinear": min_filter = gl.LINEAR_MIPMAP_LINEAR; break;
        }
        let mag_filter: number = gl.NONE;
        switch (page.mag_filter) {
          case "Nearest": mag_filter = gl.NEAREST; break;
          default: case "Linear": mag_filter = gl.LINEAR; break;
        }
        let wrap_s: number = gl.NONE;
        switch (page.wrap_s) {
          case "Repeat": wrap_s = gl.REPEAT; break;
          default: case "ClampToEdge": wrap_s = gl.CLAMP_TO_EDGE; break;
          case "MirroredRepeat": wrap_s = gl.MIRRORED_REPEAT; break;
        }
        let wrap_t: number = gl.NONE;
        switch (page.wrap_t) {
          case "Repeat": wrap_t = gl.REPEAT; break;
          default: case "ClampToEdge": wrap_t = gl.CLAMP_TO_EDGE; break;
          case "MirroredRepeat": wrap_t = gl.MIRRORED_REPEAT; break;
        }
        const image_key: string = page.name;
        this.textures[image_key] = glMakeTexture(gl, images[image_key], min_filter, mag_filter, wrap_s, wrap_t);
      });
    } else {
      const gl: WebGLRenderingContext = this.gl;
      spine_data.iterateSkins((skin_key: string, skin: Spine.Skin): void => {
        skin.iterateAttachments((slot_key: string, skin_slot: Spine.SkinSlot, attachment_key: string, attachment: Spine.Attachment): void => {
          if (!attachment) { return; }
          switch (attachment.type) {
            case "region":
            case "mesh":
            case "weightedmesh":
              const image_key: string = attachment_key;
              this.textures[image_key] = glMakeTexture(gl, images[image_key], gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
              break;
          }
        });
      });
    }
  }

  public dropData(spine_data: Spine.Data, atlas_data: Atlas.Data | null = null): void {
    const gl: WebGLRenderingContext = this.gl;
    Object.keys(this.textures).forEach((image_key: string): void => {
      const texture: RenderTexture = this.textures[image_key];
      gl.deleteTexture(texture.texture);
    });
    this.textures = {};
    this.bone_map = {};
    spine_data.iterateSkins((skin_key: string, skin: Spine.Skin): void => {
      const render_skin: RenderSkin = this.skin_map[skin_key] = new RenderSkin();
      skin.iterateAttachments((slot_key: string, skin_slot: Spine.SkinSlot, attachment_key: string, attachment: Spine.Attachment): void => {
        if (!attachment) { return; }
        const render_slot: RenderSlot = render_skin.slot_map[slot_key] || (render_skin.slot_map[slot_key] = new RenderSlot());
        const render_attachment: RenderAttachment = render_slot.attachment_map[attachment_key];
        if (render_attachment) {
          render_attachment.dropData(spine_data, skin_key, slot_key, attachment_key, attachment);
        }
      });
    });
    this.skin_map = {};
  }

  public drawPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null = null): void {
    const gl: WebGLRenderingContext = this.gl;
    const alpha: number = this.color[3];
    spine_pose.iterateAttachments((slot_key: string, slot: Spine.Slot, skin_slot: Spine.SkinSlot, attachment_key: string, attachment: Spine.Attachment): void => {
      if (!attachment) { return; }
      if (attachment.type === "boundingbox") { return; }
      const site: Atlas.Site | null = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
      const page: Atlas.Page | null = site && site.page;
      const image_key: string = (page && page.name) || attachment.path || attachment.name || attachment_key;
      const texture: RenderTexture = this.textures[image_key];
      if (!texture) { return; }
      mat4x4Identity(this.modelview);
      mat3x3Identity(this.texmatrix);
      mat3x3ApplyAtlasPageTexcoord(this.texmatrix, page);
      mat3x3ApplyAtlasSiteTexcoord(this.texmatrix, site);
      vec4CopyColor(this.color, slot.color);
      this.color[3] *= alpha;
      gl.enable(gl.BLEND);
      switch (slot.blend) {
        default:
        case "normal": gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); break;
        case "additive": gl.blendFunc(gl.SRC_ALPHA, gl.ONE); break;
        case "multiply": gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA); break;
        case "screen": gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR); break;
      }
      const render_skin: RenderSkin = this.skin_map[spine_pose.skin_key];
      const render_slot: RenderSlot = render_skin.slot_map[slot_key] || this.skin_map["default"].slot_map[slot_key];
      const render_attachment: RenderAttachment = render_slot.attachment_map[attachment_key];
      if (render_attachment) {
        render_attachment.drawPose(spine_pose, spine_pose.skin_key, slot_key, slot, attachment_key, attachment, texture, site);
      }
    });
    this.color[3] = alpha;
  }
}

class RenderBone {
  public setup_space: Spine.Space = new Spine.Space();
}

class RenderSkin {
  public slot_map: {[key: string]: RenderSlot} = {};
}

class RenderSlot {
  public attachment_map: {[key: string]: RenderAttachment} = {};
}

interface RenderAttachment {
  loadData(spine_data: Spine.Data, skin_key: string, slot_key: string, attachment_key: string, attachment: Spine.Attachment): RenderAttachment;
  dropData(spine_data: Spine.Data, skin_key: string, slot_key: string, attachment_key: string, attachment: Spine.Attachment): RenderAttachment;
  drawPose(spine_pose: Spine.Pose, skin_key: string, slot_key: string, slot: Spine.Slot, attachment_key: string, attachment: Spine.Attachment, texture: RenderTexture, site: Atlas.Site | null): void;
}

class RenderRegionAttachment implements RenderAttachment {
  public render: RenderWebGL;

  constructor(render: RenderWebGL) {
    this.render = render;
  }

  loadData(spine_data: Spine.Data, skin_key: string, slot_key: string, attachment_key: string, attachment: Spine.RegionAttachment): RenderRegionAttachment {
    return this;
  }

  dropData(spine_data: Spine.Data, skin_key: string, slot_key: string, attachment_key: string, attachment: Spine.RegionAttachment): RenderRegionAttachment {
    return this;
  }

  drawPose(spine_pose: Spine.Pose, skin_key: string, slot_key: string, slot: Spine.Slot, attachment_key: string, attachment: Spine.RegionAttachment, texture: RenderTexture, site: Atlas.Site | null): void {
    const gl: WebGLRenderingContext = this.render.gl;
    const bone: Spine.Bone = spine_pose.bones[slot.bone_key];
    mat4x4ApplySpace(this.render.modelview, bone.world_space);
    mat4x4ApplySpace(this.render.modelview, attachment.local_space);
    mat4x4Scale(this.render.modelview, attachment.width / 2, attachment.height / 2);
    mat4x4ApplyAtlasSitePosition(this.render.modelview, site);
    const shader: RenderShader = this.render.mesh_shader;
    gl.useProgram(shader.program);
    gl.uniformMatrix4fv(shader.uniforms["uProjection"], false, this.render.projection);
    gl.uniformMatrix4fv(shader.uniforms["uModelview"], false, this.render.modelview);
    gl.uniformMatrix3fv(shader.uniforms["uTexMatrix"], false, this.render.texmatrix);
    gl.uniform4fv(shader.uniforms["uColor"], this.render.color);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
    gl.uniform1i(shader.uniforms["uSampler"], 0);
    glSetupAttribute(gl, shader, "aPosition", this.render.region_vertex_position);
    glSetupAttribute(gl, shader, "aTexCoord", this.render.region_vertex_texcoord);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, this.render.region_vertex_position.count);
  }
}

class RenderMeshAttachment implements RenderAttachment {
  public render: RenderWebGL;
  public vertex_position: RenderVertex;
  public vertex_texcoord: RenderVertex;
  public vertex_triangle: RenderVertex;
  public ffd_attachment_map: {[key: string]: RenderFfdAttachment} = {};

  constructor(render: RenderWebGL) {
    this.render = render;
  }

  loadData(spine_data: Spine.Data, skin_key: string, slot_key: string, attachment_key: string, attachment: Spine.MeshAttachment): RenderMeshAttachment {
    const gl: WebGLRenderingContext = this.render.gl;
    const vertex_count: number = attachment.vertices.length / 2;
    const vertex_position: Float32Array = new Float32Array(attachment.vertices);
    const vertex_texcoord: Float32Array = new Float32Array(attachment.uvs);
    const vertex_triangle: Uint16Array = new Uint16Array(attachment.triangles);
    this.vertex_position = glMakeVertex(gl, vertex_position, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    this.vertex_texcoord = glMakeVertex(gl, vertex_texcoord, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    this.vertex_triangle = glMakeVertex(gl, vertex_triangle, 1, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
    spine_data.iterateAnims((anim_key: string, anim: Spine.Animation): void => {
      const ffd_skin: Spine.FfdSkin = anim.ffd_skins && anim.ffd_skins[skin_key];
      const ffd_slot: Spine.FfdSlot = ffd_skin && ffd_skin.ffd_slots[slot_key];
      const ffd_attachment: Spine.FfdAttachment = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
      if (ffd_attachment) {
        const render_ffd_attachment: RenderFfdAttachment = this.ffd_attachment_map[anim_key] = new RenderFfdAttachment();
        ffd_attachment.ffd_timeline.ffd_keyframes.forEach((ffd_keyframe: Spine.FfdKeyframe, ffd_keyframe_index: number): void => {
          const render_ffd_keyframe: RenderFfdKeyframe = render_ffd_attachment.ffd_keyframes[ffd_keyframe_index] = new RenderFfdKeyframe();
          const vertex_position_morph: Float32Array = new Float32Array(2 * vertex_count);
          vertex_position_morph.subarray(ffd_keyframe.offset, ffd_keyframe.offset + ffd_keyframe.vertices.length).set(new Float32Array(ffd_keyframe.vertices));
          render_ffd_keyframe.vertex_position_morph = glMakeVertex(gl, vertex_position_morph, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        });
      }
    });
    return this;
  }

  dropData(spine_data: Spine.Data, skin_key: string, slot_key: string, attachment_key: string, attachment: Spine.MeshAttachment): RenderMeshAttachment {
    const gl: WebGLRenderingContext = this.render.gl;
    gl.deleteBuffer(this.vertex_position.buffer);
    gl.deleteBuffer(this.vertex_texcoord.buffer);
    gl.deleteBuffer(this.vertex_triangle.buffer);
    Object.keys(this.ffd_attachment_map).forEach((anim_key: string): void => {
      const render_ffd_attachment: RenderFfdAttachment = this.ffd_attachment_map[anim_key];
      render_ffd_attachment.ffd_keyframes.forEach((ffd_keyframe: RenderFfdKeyframe): void => {
        gl.deleteBuffer(ffd_keyframe.vertex_position_morph.buffer);
      });
    });
    return this;
  }

  drawPose(spine_pose: Spine.Pose, skin_key: string, slot_key: string, slot: Spine.Slot, attachment_key: string, attachment: Spine.MeshAttachment, texture: RenderTexture, site: Atlas.Site | null): void {
    const gl: WebGLRenderingContext = this.render.gl;
    const bone: Spine.Bone = spine_pose.bones[slot.bone_key];
    mat4x4ApplySpace(this.render.modelview, bone.world_space);
    mat4x4ApplyAtlasSitePosition(this.render.modelview, site);
    const anim: Spine.Animation | undefined = spine_pose.data.anims[spine_pose.anim_key];
    const ffd_skin: Spine.FfdSkin | undefined = anim && anim.ffd_skins && anim.ffd_skins[spine_pose.skin_key];
    const ffd_slot: Spine.FfdSlot | undefined = ffd_skin && ffd_skin.ffd_slots[slot_key];
    const ffd_attachment: Spine.FfdAttachment | undefined = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
    const ffd_timeline: Spine.FfdTimeline | undefined = ffd_attachment && ffd_attachment.ffd_timeline;
    const ffd_keyframes: Spine.FfdKeyframe[] | undefined = ffd_timeline && ffd_timeline.ffd_keyframes;
    const ffd_keyframe0_index: number = Spine.Keyframe.find(ffd_keyframes, spine_pose.time);
    const ffd_keyframe1_index: number = ffd_keyframe0_index + 1 || ffd_keyframe0_index;
    const ffd_keyframe0: Spine.FfdKeyframe | undefined = ffd_keyframes && ffd_keyframes[ffd_keyframe0_index];
    const ffd_keyframe1: Spine.FfdKeyframe | undefined = ffd_keyframes && ffd_keyframes[ffd_keyframe1_index] || ffd_keyframe0;
    const shader: RenderShader = (ffd_keyframe0) ? this.render.ffd_mesh_shader : this.render.mesh_shader;
    gl.useProgram(shader.program);
    gl.uniformMatrix4fv(shader.uniforms["uProjection"], false, this.render.projection);
    gl.uniformMatrix4fv(shader.uniforms["uModelview"], false, this.render.modelview);
    gl.uniformMatrix3fv(shader.uniforms["uTexMatrix"], false, this.render.texmatrix);
    gl.uniform4fv(shader.uniforms["uColor"], this.render.color);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
    gl.uniform1i(shader.uniforms["uSampler"], 0);
    glSetupAttribute(gl, shader, "aPosition", this.vertex_position);
    glSetupAttribute(gl, shader, "aTexCoord", this.vertex_texcoord);
    if (ffd_keyframe0) {
      const weight: number = (ffd_keyframe0.time === ffd_keyframe1.time) ? 0 : ffd_keyframe0.curve.evaluate((spine_pose.time - ffd_keyframe0.time) / (ffd_keyframe1.time - ffd_keyframe0.time));
      const render_ffd_attachment: RenderFfdAttachment = this.ffd_attachment_map[spine_pose.anim_key];
      const render_ffd_keyframe0: RenderFfdKeyframe = render_ffd_attachment.ffd_keyframes[ffd_keyframe0_index];
      const render_ffd_keyframe1: RenderFfdKeyframe = render_ffd_attachment.ffd_keyframes[ffd_keyframe1_index] || render_ffd_keyframe0;
      gl.uniform1f(shader.uniforms["uMorphWeight"], weight);
      glSetupAttribute(gl, shader, "aPositionMorph0", render_ffd_keyframe0.vertex_position_morph);
      glSetupAttribute(gl, shader, "aPositionMorph1", render_ffd_keyframe1.vertex_position_morph);
    }
    const vertex_triangle: RenderVertex = this.vertex_triangle;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertex_triangle.buffer);
    gl.drawElements(gl.TRIANGLES, vertex_triangle.count, vertex_triangle.type, 0);
  }
}

class RenderWeightedMeshAttachment implements RenderAttachment {
  public render: RenderWebGL;
  public vertex_position: RenderVertex;
  public vertex_blenders: RenderVertex;
  public vertex_texcoord: RenderVertex;
  public vertex_triangle: RenderVertex;
  public blend_bone_index_array: number[] = [];
  public ffd_attachment_map: {[key: string]: RenderFfdAttachment} = {};

  constructor(render: RenderWebGL) {
    this.render = render;
  }

  loadData(spine_data: Spine.Data, skin_key: string, slot_key: string, attachment_key: string, attachment: Spine.WeightedMeshAttachment): RenderWeightedMeshAttachment {
    function parseBlenders(vertices: number[], index: number, callback: (blender: Blender, blender_index: number) => void): number {
      const blender_count: number = vertices[index++];
      for (let blender_index: number = 0; blender_index < blender_count; ++blender_index) {
        const blender: Blender = new Blender();
        blender.bone_index = vertices[index++];
        blender.position.x = vertices[index++];
        blender.position.y = vertices[index++];
        blender.weight = vertices[index++];
        callback(blender, blender_index);
      }
      return index;
    }
    const gl: WebGLRenderingContext = this.render.gl;
    const vertex_count: number = attachment.uvs.length / 2;
    const vertex_position: Float32Array = new Float32Array(2 * vertex_count); // [ x, y ]
    const vertex_texcoord: Float32Array = new Float32Array(attachment.uvs); // [ u, v ]
    const vertex_blenders: Float32Array = new Float32Array(2 * vertex_count * this.render.skin_shader_blenders_count); // [ i0, w0, i1, w1, ... ]
    const vertex_triangle: Uint16Array = new Uint16Array(attachment.triangles);
    const blend_bone_index_array: number[] = this.blend_bone_index_array;
    for (let vertex_index: number = 0, parse_index: number = 0; vertex_index < vertex_count; ++vertex_index) {
      const blender_array: Blender[] = [];
      parse_index = parseBlenders(attachment.vertices, parse_index, (blender: Blender): void => { blender_array.push(blender); });
      // sort descending by weight
      blender_array.sort((a: Blender, b: Blender): number => { return b.weight - a.weight; });
      // clamp to limit
      if (blender_array.length > this.render.skin_shader_blenders_count) {
        console.log("blend array length for", attachment_key, "is", blender_array.length, "so clamp to", this.render.skin_shader_blenders_count);
        blender_array.length = this.render.skin_shader_blenders_count;
      }
      // normalize weights
      let weight_sum: number = 0;
      blender_array.forEach((blender: Blender): void => { weight_sum += blender.weight; });
      blender_array.forEach((blender: Blender): void => { blender.weight /= weight_sum; });
      const position: Spine.Vector = new Spine.Vector();
      blender_array.forEach((blender: Blender, blender_index: number): void => {
        const bone_key: string = spine_data.bone_keys[blender.bone_index];
        const bone: Spine.Bone = spine_data.bones[bone_key];
        const blend_position: Spine.Vector = new Spine.Vector();
        Spine.Space.transform(bone.world_space, blender.position, blend_position);
        position.selfAdd(blend_position.selfScale(blender.weight));
        // keep track of which bones are used for blending
        if (blend_bone_index_array.indexOf(blender.bone_index) === -1) {
          blend_bone_index_array.push(blender.bone_index);
        }
        // index into skin_shader_modelview_array, not spine_pose.data.bone_keys
        vertex_blenders[vertex_index * 2 * this.render.skin_shader_blenders_count + blender_index * 2 + 0] = blend_bone_index_array.indexOf(blender.bone_index);
        vertex_blenders[vertex_index * 2 * this.render.skin_shader_blenders_count + blender_index * 2 + 1] = blender.weight;
      });
      vertex_position[vertex_index * 2 + 0] = position.x;
      vertex_position[vertex_index * 2 + 1] = position.y;
      if (blend_bone_index_array.length > this.render.skin_shader_modelview_count) {
        console.log("blend bone index array length for", attachment_key, "is", blend_bone_index_array.length, "greater than", this.render.skin_shader_modelview_count);
      }
    }
    this.vertex_position = glMakeVertex(gl, vertex_position, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    this.vertex_texcoord = glMakeVertex(gl, vertex_texcoord, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    this.vertex_blenders = glMakeVertex(gl, vertex_blenders, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    this.vertex_triangle = glMakeVertex(gl, vertex_triangle, 1, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
    spine_data.iterateAnims((anim_key: string, anim: Spine.Animation): void => {
      const ffd_skin: Spine.FfdSkin = anim.ffd_skins && anim.ffd_skins[skin_key];
      const ffd_slot: Spine.FfdSlot = ffd_skin && ffd_skin.ffd_slots[slot_key];
      const ffd_attachment: Spine.FfdAttachment = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
      if (ffd_attachment) {
        const render_ffd_attachment: RenderFfdAttachment = this.ffd_attachment_map[anim_key] = new RenderFfdAttachment();
        ffd_attachment.ffd_timeline.ffd_keyframes.forEach((ffd_keyframe: Spine.FfdKeyframe, ffd_keyframe_index: number): void => {
          const render_ffd_keyframe: RenderFfdKeyframe = render_ffd_attachment.ffd_keyframes[ffd_keyframe_index] = new RenderFfdKeyframe();
          const vertex_position_morph: Float32Array = new Float32Array(2 * vertex_count);
          for (let vertex_index: number = 0, parse_index: number = 0, ffd_index: number = 0; vertex_index < vertex_count; ++vertex_index) {
            const blender_array: Blender[] = [];
            parse_index = parseBlenders(attachment.vertices, parse_index, (blender: Blender): void => { blender_array.push(blender); });
            const position_morph: Spine.Vector = new Spine.Vector();
            blender_array.forEach((blender: Blender): void => {
              const bone_key = spine_data.bone_keys[blender.bone_index];
              const bone = spine_data.bones[bone_key];
              const blend_position = new Spine.Vector();
              blend_position.x = ffd_keyframe.vertices[ffd_index - ffd_keyframe.offset] || 0; ++ffd_index;
              blend_position.y = ffd_keyframe.vertices[ffd_index - ffd_keyframe.offset] || 0; ++ffd_index;
              Spine.Matrix.transform(bone.world_space.affine.matrix, blend_position, blend_position);
              position_morph.selfAdd(blend_position.selfScale(blender.weight));
            });
            vertex_position_morph[vertex_index * 2 + 0] = position_morph.x;
            vertex_position_morph[vertex_index * 2 + 1] = position_morph.y;
          }
          render_ffd_keyframe.vertex_position_morph = glMakeVertex(gl, vertex_position_morph, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        });
      }
    });
    return this;
  }

  dropData(spine_data: Spine.Data, skin_key: string, slot_key: string, attachment_key: string, attachment: Spine.WeightedMeshAttachment): RenderWeightedMeshAttachment {
    const gl: WebGLRenderingContext = this.render.gl;
    gl.deleteBuffer(this.vertex_position.buffer);
    gl.deleteBuffer(this.vertex_blenders.buffer);
    gl.deleteBuffer(this.vertex_texcoord.buffer);
    gl.deleteBuffer(this.vertex_triangle.buffer);
    Object.keys(this.ffd_attachment_map).forEach((anim_key: string): void => {
      const render_ffd_attachment: RenderFfdAttachment = this.ffd_attachment_map[anim_key];
      render_ffd_attachment.ffd_keyframes.forEach((ffd_keyframe: RenderFfdKeyframe): void => {
        gl.deleteBuffer(ffd_keyframe.vertex_position_morph.buffer);
      });
    });
    return this;
  }

  drawPose(spine_pose: Spine.Pose, skin_key: string, slot_key: string, slot: Spine.Slot, attachment_key: string, attachment: Spine.WeightedMeshAttachment, texture: RenderTexture, site: Atlas.Site | null): void {
    const gl: WebGLRenderingContext = this.render.gl;
    // update skin shader modelview array
    const blend_bone_index_array: number[] = this.blend_bone_index_array;
    for (let index: number = 0; index < blend_bone_index_array.length; ++index) {
      if (index < this.render.skin_shader_modelview_count) {
        const bone_index: number = blend_bone_index_array[index];
        const bone_key: string = spine_pose.bone_keys[bone_index];
        const bone: Spine.Bone = spine_pose.bones[bone_key];
        const render_bone: RenderBone = this.render.bone_map[bone_key];
        const modelview: Float32Array = this.render.skin_shader_modelview_array.subarray(index * 16, (index + 1) * 16);
        mat4x4Copy(modelview, this.render.modelview);
        mat4x4ApplySpace(modelview, bone.world_space);
        mat4x4ApplySpace(modelview, render_bone.setup_space);
        mat4x4ApplyAtlasSitePosition(modelview, site);
      }
    }
    const anim: Spine.Animation | undefined = spine_pose.data.anims[spine_pose.anim_key];
    const ffd_skin: Spine.FfdSkin | undefined = anim && anim.ffd_skins && anim.ffd_skins[spine_pose.skin_key];
    const ffd_slot: Spine.FfdSlot | undefined = ffd_skin && ffd_skin.ffd_slots[slot_key];
    const ffd_attachment: Spine.FfdAttachment | undefined = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
    const ffd_timeline: Spine.FfdTimeline | undefined = ffd_attachment && ffd_attachment.ffd_timeline;
    const ffd_keyframes: Spine.FfdKeyframe[] | undefined = ffd_timeline && ffd_timeline.ffd_keyframes;
    const ffd_keyframe0_index: number = Spine.Keyframe.find(ffd_keyframes, spine_pose.time);
    const ffd_keyframe1_index: number = ffd_keyframe0_index + 1 || ffd_keyframe0_index;
    const ffd_keyframe0: Spine.FfdKeyframe | undefined = ffd_keyframes && ffd_keyframes[ffd_keyframe0_index];
    const ffd_keyframe1: Spine.FfdKeyframe | undefined = ffd_keyframes && ffd_keyframes[ffd_keyframe1_index] || ffd_keyframe0;
    const shader: RenderShader = (ffd_keyframe0) ? this.render.ffd_skin_shader : this.render.skin_shader;
    gl.useProgram(shader.program);
    gl.uniformMatrix4fv(shader.uniforms["uProjection"], false, this.render.projection);
    gl.uniformMatrix4fv(shader.uniforms["uModelviewArray[0]"], false, this.render.skin_shader_modelview_array);
    gl.uniformMatrix3fv(shader.uniforms["uTexMatrix"], false, this.render.texmatrix);
    gl.uniform4fv(shader.uniforms["uColor"], this.render.color);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
    gl.uniform1i(shader.uniforms["uSampler"], 0);
    glSetupAttribute(gl, shader, "aPosition", this.vertex_position);
    glSetupAttribute(gl, shader, "aTexCoord", this.vertex_texcoord);
    glSetupAttribute(gl, shader, "aBlenders{index}", this.vertex_blenders, this.render.skin_shader_blenders_count);
    if (ffd_keyframe0) {
      const weight: number = (ffd_keyframe0.time === ffd_keyframe1.time) ? 0 : ffd_keyframe0.curve.evaluate((spine_pose.time - ffd_keyframe0.time) / (ffd_keyframe1.time - ffd_keyframe0.time));
      const render_ffd_attachment: RenderFfdAttachment = this.ffd_attachment_map[spine_pose.anim_key];
      const render_ffd_keyframe0: RenderFfdKeyframe = render_ffd_attachment.ffd_keyframes[ffd_keyframe0_index];
      const render_ffd_keyframe1: RenderFfdKeyframe = render_ffd_attachment.ffd_keyframes[ffd_keyframe1_index] || render_ffd_keyframe0;
      gl.uniform1f(shader.uniforms["uMorphWeight"], weight);
      glSetupAttribute(gl, shader, "aPositionMorph0", render_ffd_keyframe0.vertex_position_morph);
      glSetupAttribute(gl, shader, "aPositionMorph1", render_ffd_keyframe1.vertex_position_morph);
    }
    const vertex_triangle: RenderVertex = this.vertex_triangle;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertex_triangle.buffer);
    gl.drawElements(gl.TRIANGLES, vertex_triangle.count, vertex_triangle.type, 0);
  }
}

class Blender {
  position: Spine.Vector = new Spine.Vector();
  bone_index: number = -1;
  weight: number = 0;
}

class RenderFfdAttachment {
  ffd_keyframes: RenderFfdKeyframe[] = [];
}

class RenderFfdKeyframe {
  vertex_position_morph: RenderVertex;
}

function repeat(format: string, count: number): string[] {
  const array: string[] = [];
  for (let index: number = 0; index < count; ++index) {
    array.push(format.replace(/{index}/g, index.toString()));
  }
  return array;
}

function flatten(array: (string|string[])[], out: string[] = []): string[] {
  array.forEach((value: string|string[]): void => {
    if (Array.isArray(value)) { flatten(value, out); } else { out.push(value); }
  });
  return out;
}

class RenderShader {
  public vs_src: string[];
  public fs_src: string[];
  public vs: WebGLShader | null;
  public fs: WebGLShader | null;
  public program: WebGLProgram | null;
  public uniforms: {[key: string]: WebGLUniformLocation};
  public attribs: {[key: string]: number};
}

type RenderVertexType = Float32Array | Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array;

class RenderVertex {
  public type: number; // FLOAT, BYTE, UNSIGNED_BYTE, SHORT, UNSIGNED_SHORT, INT, UNSIGNED_INT
  public size: number; // size in elements per vertex
  public count: number; // number of vertices
  public type_array: RenderVertexType;
  public buffer: WebGLBuffer | null;
  public buffer_type: number; // ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER
  public buffer_draw: number; // STREAM_DRAW, STATIC_DRAW or DYNAMIC_DRAW
}

class RenderTexture {
  public texture: WebGLTexture | null;
}

export function vec4Identity(v: Float32Array): Float32Array {
  v[0] = v[1] = v[2] = v[3] = 1.0;
  return v;
}

export function vec4CopyColor(v: Float32Array, color: Spine.Color): Float32Array {
  v[0] = color.r;
  v[1] = color.g;
  v[2] = color.b;
  v[3] = color.a;
  return v;
}

export function vec4ApplyColor(v: Float32Array, color: Spine.Color): Float32Array {
  v[0] *= color.r;
  v[1] *= color.g;
  v[2] *= color.b;
  v[3] *= color.a;
  return v;
}

export function mat3x3Identity(m: Float32Array): Float32Array {
  m[1] = m[2] = m[3] =
  m[5] = m[6] = m[7] = 0.0;
  m[0] = m[4] = m[8] = 1.0;
  return m;
}

export function mat3x3Copy(m: Float32Array, other: Float32Array): Float32Array {
  m.set(other);
  return m;
}

export function mat3x3Ortho(m: Float32Array, l: number, r: number, b: number, t: number): Float32Array {
  const lr: number = 1 / (l - r);
  const bt: number = 1 / (b - t);
  m[0] *= -2 * lr;
  m[4] *= -2 * bt;
  m[6] += (l + r) * lr;
  m[7] += (t + b) * bt;
  return m;
}

export function mat3x3Translate(m: Float32Array, x: number, y: number): Float32Array {
  m[6] += m[0] * x + m[3] * y;
  m[7] += m[1] * x + m[4] * y;
  return m;
}

export function mat3x3RotateCosSin(m: Float32Array, c: number, s: number): Float32Array {
  const m0: number = m[0]; const m1: number = m[1];
  const m3: number = m[3]; const m4: number = m[4];
  m[0] = m0 * c + m3 * s;
  m[1] = m1 * c + m4 * s;
  m[3] = m3 * c - m0 * s;
  m[4] = m4 * c - m1 * s;
  return m;
}

export function mat3x3Rotate(m: Float32Array, angle: number): Float32Array {
  return mat3x3RotateCosSin(m, Math.cos(angle), Math.sin(angle));
}

export function mat3x3Scale(m: Float32Array, x: number, y: number): Float32Array {
  m[0] *= x; m[1] *= x; m[2] *= x;
  m[3] *= y; m[4] *= y; m[5] *= y;
  return m;
}

export function mat3x3Transform(m: Float32Array, v: Float32Array, out: Float32Array): Float32Array {
  const x: number = m[0] * v[0] + m[3] * v[1] + m[6];
  const y: number = m[1] * v[0] + m[4] * v[1] + m[7];
  const w: number = m[2] * v[0] + m[5] * v[1] + m[8];
  const iw: number = (w) ? (1 / w) : (1);
  out[0] = x * iw;
  out[1] = y * iw;
  return out;
}

export function mat3x3ApplySpace(m: Float32Array, space: Spine.Space): Float32Array {
  if (space) {
    mat3x3Translate(m, space.position.x, space.position.y);
    mat3x3Rotate(m, space.rotation.rad);
    mat3x3Scale(m, space.scale.x, space.scale.y);
  }
  return m;
}

export function mat3x3ApplyAtlasPageTexcoord(m: Float32Array, page: Atlas.Page | null): Float32Array {
  if (page) {
    mat3x3Scale(m, 1 / page.w, 1 / page.h);
  }
  return m;
}

export function mat3x3ApplyAtlasSiteTexcoord(m: Float32Array, site: Atlas.Site | null): Float32Array {
  if (site) {
    mat3x3Translate(m, site.x, site.y);
    if (site.rotate === -1) {
      mat3x3Translate(m, 0, site.w); // bottom-left corner
      mat3x3RotateCosSin(m, 0, -1); // -90 degrees
    } else if (site.rotate === 1) {
      mat3x3Translate(m, site.h, 0); // top-right corner
      mat3x3RotateCosSin(m, 0, 1); // 90 degrees
    }
    mat3x3Scale(m, site.w, site.h);
  }
  return m;
}

export function mat3x3ApplyAtlasSitePosition(m: Float32Array, site: Atlas.Site | null): Float32Array {
  if (site) {
    mat3x3Scale(m, 1 / site.original_w, 1 / site.original_h);
    mat3x3Translate(m, 2 * site.offset_x - (site.original_w - site.w), (site.original_h - site.h) - 2 * site.offset_y);
    mat3x3Scale(m, site.w, site.h);
  }
  return m;
}

export function mat4x4Identity(m: Float32Array): Float32Array {
  m[1] = m[2] = m[3] = m[4] =
  m[6] = m[7] = m[8] = m[9] =
  m[11] = m[12] = m[13] = m[14] = 0.0;
  m[0] = m[5] = m[10] = m[15] = 1.0;
  return m;
}

export function mat4x4Copy(m: Float32Array, other: Float32Array): Float32Array {
  m.set(other);
  return m;
}

export function mat4x4Ortho(m: Float32Array, l: number, r: number, b: number, t: number, n: number, f: number): Float32Array {
  const lr: number = 1 / (l - r);
  const bt: number = 1 / (b - t);
  const nf: number = 1 / (n - f);
  m[0] = -2 * lr;
  m[5] = -2 * bt;
  m[10] = 2 * nf;
  m[12] = (l + r) * lr;
  m[13] = (t + b) * bt;
  m[14] = (f + n) * nf;
  return m;
}

export function mat4x4Translate(m: Float32Array, x: number, y: number, z: number = 0): Float32Array {
  m[12] += m[0] * x + m[4] * y + m[8] * z;
  m[13] += m[1] * x + m[5] * y + m[9] * z;
  m[14] += m[2] * x + m[6] * y + m[10] * z;
  m[15] += m[3] * x + m[7] * y + m[11] * z;
  return m;
}

export function mat4x4RotateCosSinZ(m: Float32Array, c: number, s: number): Float32Array {
  const a_x: number = m[0]; const a_y: number = m[1]; const a_z: number = m[2]; const a_w: number = m[3];
  const b_x: number = m[4]; const b_y: number = m[5]; const b_z: number = m[6]; const b_w: number = m[7];
  m[0] = a_x * c + b_x * s;
  m[1] = a_y * c + b_y * s;
  m[2] = a_z * c + b_z * s;
  m[3] = a_w * c + b_w * s;
  m[4] = b_x * c - a_x * s;
  m[5] = b_y * c - a_y * s;
  m[6] = b_z * c - a_z * s;
  m[7] = b_w * c - a_w * s;
  return m;
}

export function mat4x4RotateZ(m: Float32Array, angle: number): Float32Array {
  return mat4x4RotateCosSinZ(m, Math.cos(angle), Math.sin(angle));
}

export function mat4x4Scale(m: Float32Array, x: number, y: number, z: number = 1): Float32Array {
  m[0] *= x; m[1] *= x; m[2] *= x; m[3] *= x;
  m[4] *= y; m[5] *= y; m[6] *= y; m[7] *= y;
  m[8] *= z; m[9] *= z; m[10] *= z; m[11] *= z;
  return m;
}

export function mat4x4ApplySpace(m: Float32Array, space: Spine.Space): Float32Array {
  if (space) {
    mat4x4Translate(m, space.position.x, space.position.y);
    mat4x4RotateZ(m, space.rotation.rad);
    mat4x4Scale(m, space.scale.x, space.scale.y);
  }
  return m;
}

export function mat4x4ApplyAtlasPageTexcoord(m: Float32Array, page: Atlas.Page | null): Float32Array {
  if (page) {
    mat4x4Scale(m, 1 / page.w, 1 / page.h);
  }
  return m;
}

export function mat4x4ApplyAtlasSiteTexcoord(m: Float32Array, site: Atlas.Site | null): Float32Array {
  if (site) {
    mat4x4Translate(m, site.x, site.y);
    if (site.rotate === -1) {
      mat4x4Translate(m, 0, site.w); // bottom-left corner
      mat4x4RotateCosSinZ(m, 0, -1); // -90 degrees
    } else if (site.rotate === 1) {
      mat4x4Translate(m, site.h, 0); // top-right corner
      mat4x4RotateCosSinZ(m, 0, 1); // 90 degrees
    }
    mat4x4Scale(m, site.w, site.h);
  }
  return m;
}

export function mat4x4ApplyAtlasSitePosition(m: Float32Array, site: Atlas.Site | null): Float32Array {
  if (site) {
    mat4x4Scale(m, 1 / site.original_w, 1 / site.original_h);
    mat4x4Translate(m, 2 * site.offset_x - (site.original_w - site.w), (site.original_h - site.h) - 2 * site.offset_y);
    mat4x4Scale(m, site.w, site.h);
  }
  return m;
}

export function glCompileShader(gl: WebGLRenderingContext, src: string[], type: number): WebGLShader | null {
  let shader: WebGLShader | null = gl.createShader(type);
  gl.shaderSource(shader, src.join("\n"));
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    src.forEach((line: string, index: number): void => { console.log(index + 1, line); });
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    shader = null;
  }
  return shader;
}

export function glLinkProgram(gl: WebGLRenderingContext, vs: WebGLShader | null, fs: WebGLShader | null): WebGLProgram | null {
  let program: WebGLProgram | null = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log("could not link shader program");
    gl.detachShader(program, vs);
    gl.detachShader(program, fs);
    gl.deleteProgram(program);
    program = null;
  }
  return program;
}

export function glGetUniforms(gl: WebGLRenderingContext, program: WebGLProgram | null, uniforms: {[key: string]: WebGLUniformLocation}): {[key: string]: WebGLUniformLocation} {
  const count: number = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let index: number = 0; index < count; ++index) {
    const uniform: WebGLActiveInfo | null = gl.getActiveUniform(program, index);
    if (!uniform) continue;
    const uniform_location: WebGLUniformLocation | null = gl.getUniformLocation(program, uniform.name);
    if (!uniform_location) continue;
    uniforms[uniform.name] = uniform_location;
  }
  return uniforms;
}

export function glGetAttribs(gl: WebGLRenderingContext, program: WebGLProgram | null, attribs: {[key: string]: number}): {[key: string]: number} {
  const count: number = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let index: number = 0; index < count; ++index) {
    const attrib: WebGLActiveInfo | null = gl.getActiveAttrib(program, index);
    if (!attrib) continue;
    attribs[attrib.name] = gl.getAttribLocation(program, attrib.name);
  }
  return attribs;
}

export function glMakeShader(gl: WebGLRenderingContext, vs_src: (string|string[])[], fs_src: (string|string[])[]): RenderShader {
  const shader: RenderShader = new RenderShader();
  const header: string[] = [
    "precision mediump int;",
    "precision mediump float;"
  ];
  shader.vs_src = header.concat(flatten(vs_src));
  shader.fs_src = header.concat(flatten(fs_src));
  shader.vs = glCompileShader(gl, shader.vs_src, gl.VERTEX_SHADER);
  shader.fs = glCompileShader(gl, shader.fs_src, gl.FRAGMENT_SHADER);
  shader.program = glLinkProgram(gl, shader.vs, shader.fs);
  shader.uniforms = glGetUniforms(gl, shader.program, {});
  shader.attribs = glGetAttribs(gl, shader.program, {});
  return shader;
}

export function glMakeVertex(gl: WebGLRenderingContext, type_array: RenderVertexType, size: number, buffer_type: number, buffer_draw: number): RenderVertex {
  const vertex: RenderVertex = new RenderVertex();
  if (type_array instanceof Float32Array) { vertex.type = gl.FLOAT; }
  else if (type_array instanceof Int8Array) { vertex.type = gl.BYTE; }
  else if (type_array instanceof Uint8Array) { vertex.type = gl.UNSIGNED_BYTE; }
  else if (type_array instanceof Int16Array) { vertex.type = gl.SHORT; }
  else if (type_array instanceof Uint16Array) { vertex.type = gl.UNSIGNED_SHORT; }
  else if (type_array instanceof Int32Array) { vertex.type = gl.INT; }
  else if (type_array instanceof Uint32Array) { vertex.type = gl.UNSIGNED_INT; }
  else { vertex.type = gl.NONE; throw new Error(); }
  vertex.size = size;
  vertex.count = type_array.length / vertex.size;
  vertex.type_array = type_array;
  vertex.buffer = gl.createBuffer();
  vertex.buffer_type = buffer_type;
  vertex.buffer_draw = buffer_draw;
  gl.bindBuffer(vertex.buffer_type, vertex.buffer);
  gl.bufferData(vertex.buffer_type, vertex.type_array, vertex.buffer_draw);
  return vertex;
}

export function glMakeTexture(gl: WebGLRenderingContext, image: HTMLImageElement, min_filter: GLenum, mag_filter: GLenum, wrap_s: GLenum, wrap_t: GLenum): RenderTexture {
  const texture: RenderTexture = new RenderTexture();
  texture.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min_filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag_filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_s);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_t);
  return texture;
}

export function glSetupAttribute(gl: WebGLRenderingContext, shader: RenderShader, format: string, vertex: RenderVertex, count: number = 0): void {
  gl.bindBuffer(vertex.buffer_type, vertex.buffer);
  if (count > 0) {
    const sizeof_vertex: number = vertex.type_array.BYTES_PER_ELEMENT * vertex.size; // in bytes
    const stride: number = sizeof_vertex * count;
    for (let index: number = 0; index < count; ++index) {
      const offset: number = sizeof_vertex * index;
      const attrib: number = shader.attribs[format.replace(/{index}/g, index.toString())];
      gl.vertexAttribPointer(attrib, vertex.size, vertex.type, false, stride, offset);
      gl.enableVertexAttribArray(attrib);
    }
  } else {
    const attrib: number = shader.attribs[format];
    gl.vertexAttribPointer(attrib, vertex.size, vertex.type, false, 0, 0);
    gl.enableVertexAttribArray(attrib);
  }
}

export function glResetAttribute(gl: WebGLRenderingContext, shader: RenderShader, format: string, vertex: RenderVertex, count: number = 0): void {
  if (count > 0) {
    for (let index = 0; index < count; ++index) {
      const attrib: number = shader.attribs[format.replace(/{index}/g, index.toString())];
      gl.disableVertexAttribArray(attrib);
    }
  } else {
    const attrib: number = shader.attribs[format];
    gl.disableVertexAttribArray(attrib);
  }
}
