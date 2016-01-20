import * as spine from '../spine.ts';
import * as atlas from './atlas.ts';

function repeat(format: string, count: number): string[] {
  const array: string[] = [];
  for (let index = 0; index < count; ++index) {
    array.push(format.replace(/{index}/g, index.toString()));
  }
  return array;
}

function flatten(array: any[], out: any[] = []): any[] {
  array.forEach(function(value: any): void {
    if (Array.isArray(value)) { flatten(value, out); } else { out.push(value); }
  });
  return out;
}

class glShader {
  public vs_src: string[];
  public fs_src: string[];
  public vs: WebGLShader;
  public fs: WebGLShader;
  public program: WebGLProgram;
  public uniforms: {[key: string]: WebGLUniformLocation};
  public attribs: {[key: string]: number};
}

class glVertex {
  public type: number; // FLOAT, BYTE, UNSIGNED_BYTE, SHORT, UNSIGNED_SHORT, INT, UNSIGNED_INT
  public size: number; // size in elements per vertex
  public count: number; // number of vertices
  public type_array: any; // Float32Array, Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array
  public buffer: WebGLBuffer;
  public buffer_type: number; // ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER
  public buffer_draw: number; // STREAM_DRAW, STATIC_DRAW or DYNAMIC_DRAW
}

class BoneInfo {
  public setup_space: spine.Space;
}

class SkinInfo {
  public slot_info_map: {[key: string]: SlotInfo} = {};
}

class SlotInfo {
  public attachment_info_map: {[key: string]: AttachmentInfo} = {};
}

class AttachmentInfo {
  public type: string;
  constructor(type: string) {
    this.type = type;
  }
}

class RegionAttachmentInfo extends AttachmentInfo {
  constructor() {
    super('region');
  }
}

class BoundingBoxAttachmentInfo extends AttachmentInfo {
  constructor() {
    super('boundingbox');
  }
}

class MeshAttachmentInfo extends AttachmentInfo {
  public gl_vertex_position: glVertex;
  public gl_vertex_texcoord: glVertex;
  public gl_vertex_triangle: glVertex;
  public anim_ffd_attachments: any;
  constructor() {
    super('mesh');
  }
}

class SkinnedMeshAttachmentInfo extends AttachmentInfo {
  public gl_vertex_position: glVertex;
  public gl_vertex_blenders: glVertex;
  public gl_vertex_texcoord: glVertex;
  public gl_vertex_triangle: glVertex;
  public blend_bone_index_array: number[];
  public anim_ffd_attachments: any;
  constructor() {
    super('skinnedmesh');
  }
}

export class RenderWebGL {
  public gl: WebGLRenderingContext;
  public bone_info_map: {[key: string]: BoneInfo} = {};
  public skin_info_map: {[key: string]: SkinInfo} = {};
  public gl_textures: {[key: string]: WebGLTexture} = {};
  public gl_projection: Float32Array = mat4x4Identity(new Float32Array(16));
  public gl_modelview: Float32Array = mat3x3Identity(new Float32Array(9));
  public gl_tex_matrix: Float32Array = mat3x3Identity(new Float32Array(9));
  public gl_color: Float32Array = vec4Identity(new Float32Array(4));
  public gl_mesh_shader: glShader;
  public gl_ffd_mesh_shader: glShader;
  public gl_region_vertex_position: glVertex;
  public gl_region_vertex_texcoord: glVertex;
  public gl_skin_shader_modelview_count: number;
  public gl_skin_shader_modelview_array: Float32Array;
  public gl_skin_shader_blenders_count: number;
  public gl_skin_shader_vs_src: string;
  public gl_ffd_skin_shader_vs_src: string;
  public gl_skin_shader: glShader;
  public gl_ffd_skin_shader: glShader;

  constructor(gl: WebGLRenderingContext) {
    const render: RenderWebGL = this;
    render.gl = gl;
    if (!gl) { return; }
    const gl_mesh_shader_vs_src: any = [
      "precision mediump int;",
      "precision mediump float;",
      "uniform mat4 uProjection;",
      "uniform mat3 uModelview;",
      "uniform mat3 uTexMatrix;",
      "attribute vec2 aVertexPosition;", // [ x, y ]
      "attribute vec2 aVertexTexCoord;", // [ u, v ]
      "varying vec3 vTexCoord;",
      "void main(void) {",
      " vTexCoord = uTexMatrix * vec3(aVertexTexCoord, 1.0);",
      " gl_Position = uProjection * vec4(uModelview * vec3(aVertexPosition, 1.0), 1.0);",
      "}"
    ];
    const gl_ffd_mesh_shader_vs_src: any = [
      "precision mediump int;",
      "precision mediump float;",
      "uniform mat4 uProjection;",
      "uniform mat3 uModelview;",
      "uniform mat3 uTexMatrix;",
      "uniform float uMorphWeight;",
      "attribute vec2 aVertexPosition;", // [ x, y ]
      "attribute vec2 aVertexTexCoord;", // [ u, v ]
      "attribute vec2 aVertexMorph0Position;", // [ dx, dy ]
      "attribute vec2 aVertexMorph1Position;", // [ dx, dy ]
      "varying vec3 vTexCoord;",
      "void main(void) {",
      " vTexCoord = uTexMatrix * vec3(aVertexTexCoord, 1.0);",
      " gl_Position = uProjection * vec4(uModelview * vec3(aVertexPosition + mix(aVertexMorph0Position, aVertexMorph1Position, uMorphWeight), 1.0), 1.0);",
      "}"
    ];
    const gl_mesh_shader_fs_src: any = [
      "precision mediump int;",
      "precision mediump float;",
      "uniform sampler2D uSampler;",
      "uniform vec4 uColor;",
      "varying vec3 vTexCoord;",
      "void main(void) {",
      " gl_FragColor = uColor * texture2D(uSampler, vTexCoord.st);",
      "}"
    ];
    render.gl_mesh_shader = glMakeShader(gl, gl_mesh_shader_vs_src, gl_mesh_shader_fs_src);
    render.gl_ffd_mesh_shader = glMakeShader(gl, gl_ffd_mesh_shader_vs_src, gl_mesh_shader_fs_src);
    render.gl_region_vertex_position = glMakeVertex(gl, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW); // [ x, y ]
    render.gl_region_vertex_texcoord = glMakeVertex(gl, new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]), 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW); // [ u, v ]
    render.gl_skin_shader_modelview_count = 16; // * mat3
    render.gl_skin_shader_modelview_array = new Float32Array(9 * render.gl_skin_shader_modelview_count);
    render.gl_skin_shader_blenders_count = 8; // * vec2
    const gl_skin_shader_vs_src: any = [
      "precision mediump int;",
      "precision mediump float;",
      "uniform mat4 uProjection;",
      "uniform mat3 uModelviewArray[" + render.gl_skin_shader_modelview_count + "];",
      "uniform mat3 uTexMatrix;",
      "attribute vec2 aVertexPosition;", // [ x, y ]
      repeat("attribute vec2 aVertexBlenders{index};", render.gl_skin_shader_blenders_count), // [ i, w ]
      "attribute vec2 aVertexTexCoord;", // [ u, v ]
      "varying vec3 vTexCoord;",
      "void main(void) {",
      " vTexCoord = uTexMatrix * vec3(aVertexTexCoord, 1.0);",
      " vec3 position = vec3(aVertexPosition, 1.0);",
      " vec3 blendPosition = vec3(0.0);",
      repeat(" blendPosition += (uModelviewArray[int(aVertexBlenders{index}.x)] * position) * aVertexBlenders{index}.y;", render.gl_skin_shader_blenders_count),
      " gl_Position = uProjection * vec4(blendPosition, 1.0);",
      "}"
    ];
    const gl_ffd_skin_shader_vs_src: any = [
      "precision mediump int;",
      "precision mediump float;",
      "uniform mat4 uProjection;",
      "uniform mat3 uModelviewArray[" + render.gl_skin_shader_modelview_count + "];",
      "uniform mat3 uTexMatrix;",
      "uniform float uMorphWeight;",
      "attribute vec2 aVertexPosition;", // [ x, y ]
      repeat("attribute vec2 aVertexBlenders{index};", render.gl_skin_shader_blenders_count), // [ i, w ]
      "attribute vec2 aVertexTexCoord;", // [ u, v ]
      "attribute vec2 aVertexMorph0Position;", // [ dx, dy ]
      "attribute vec2 aVertexMorph1Position;", // [ dx, dy ]
      "varying vec3 vTexCoord;",
      "void main(void) {",
      " vTexCoord = uTexMatrix * vec3(aVertexTexCoord, 1.0);",
      " vec3 position = vec3(aVertexPosition + mix(aVertexMorph0Position, aVertexMorph1Position, uMorphWeight), 1.0);",
      " vec3 blendPosition = vec3(0.0);",
      repeat(" blendPosition += (uModelviewArray[int(aVertexBlenders{index}.x)] * position) * aVertexBlenders{index}.y;", render.gl_skin_shader_blenders_count),
      " gl_Position = uProjection * vec4(blendPosition, 1.0);",
      "}"
    ];
    const gl_skin_shader_fs_src: any = [
      "precision mediump int;",
      "precision mediump float;",
      "uniform sampler2D uSampler;",
      "uniform vec4 uColor;",
      "varying vec3 vTexCoord;",
      "void main(void) {",
      " gl_FragColor = uColor * texture2D(uSampler, vTexCoord.st);",
      "}"
    ];
    render.gl_skin_shader = glMakeShader(gl, gl_skin_shader_vs_src, gl_skin_shader_fs_src);
    render.gl_ffd_skin_shader = glMakeShader(gl, gl_ffd_skin_shader_vs_src, gl_skin_shader_fs_src);
  }

  public dropData(spine_data: spine.Data, atlas_data: atlas.Data): void {
    const render: RenderWebGL = this;
    const gl: WebGLRenderingContext = render.gl;
    if (!gl) { return; }
    Object.keys(render.gl_textures).forEach((image_key: string): void => {
      const gl_texture: WebGLTexture = render.gl_textures[image_key];
      gl.deleteTexture(gl_texture);
      delete render.gl_textures[image_key];
    });
    render.gl_textures = {};
    Object.keys(render.bone_info_map).forEach((bone_key: string): void => {
      const bone_info: BoneInfo = render.bone_info_map[bone_key];
    });
    render.bone_info_map = {};
    Object.keys(render.skin_info_map).forEach((skin_key: string): void => {
      const skin_info: SkinInfo = render.skin_info_map[skin_key];
      Object.keys(skin_info.slot_info_map).forEach((slot_key: string): void => {
        const slot_info: SlotInfo = skin_info.slot_info_map[slot_key];
        Object.keys(slot_info.attachment_info_map).forEach((attachment_key: string): void => {
          const attachment_info: AttachmentInfo = slot_info.attachment_info_map[attachment_key];
          switch (attachment_info.type) {
            case 'mesh': {
              const mesh_attachment_info = <MeshAttachmentInfo>attachment_info;
              gl.deleteBuffer(mesh_attachment_info.gl_vertex_position.buffer);
              gl.deleteBuffer(mesh_attachment_info.gl_vertex_texcoord.buffer);
              gl.deleteBuffer(mesh_attachment_info.gl_vertex_triangle.buffer);
              Object.keys(mesh_attachment_info.anim_ffd_attachments).forEach((anim_key: string): void => {
                const anim_ffd_attachment: any = mesh_attachment_info.anim_ffd_attachments[anim_key];
                anim_ffd_attachment.ffd_keyframes.forEach(function(ffd_keyframe) {
                  gl.deleteBuffer(ffd_keyframe.gl_vertex.buffer);
                });
              });
              break;
            }
            case 'skinnedmesh': {
              const skinned_mesh_attachment_info = <SkinnedMeshAttachmentInfo>attachment_info;
              gl.deleteBuffer(skinned_mesh_attachment_info.gl_vertex_position.buffer);
              gl.deleteBuffer(skinned_mesh_attachment_info.gl_vertex_blenders.buffer);
              gl.deleteBuffer(skinned_mesh_attachment_info.gl_vertex_texcoord.buffer);
              gl.deleteBuffer(skinned_mesh_attachment_info.gl_vertex_triangle.buffer);
              Object.keys(skinned_mesh_attachment_info.anim_ffd_attachments).forEach((anim_key: string): void => {
                const anim_ffd_attachment: any = skinned_mesh_attachment_info.anim_ffd_attachments[anim_key];
                anim_ffd_attachment.ffd_keyframes.forEach(function(ffd_keyframe) {
                  gl.deleteBuffer(ffd_keyframe.gl_vertex.buffer);
                });
              });
              break;
            }
            default:
              console.log("TODO", skin_key, slot_key, attachment_key, attachment_info.type);
              break;
          }
        });
      });
    });
    render.skin_info_map = {};
  };

  public loadData(spine_data: spine.Data, atlas_data: atlas.Data, images: {[key: string]: HTMLImageElement}): void {
    const render: RenderWebGL = this;
    const gl: WebGLRenderingContext = render.gl;
    if (!gl) { return; }
    spine_data.iterateBones(function(bone_key: string, bone: spine.Bone): void {
      const bone_info: BoneInfo = render.bone_info_map[bone_key] = new BoneInfo();
      bone_info.setup_space = spine.Space.invert(bone.world_space, new spine.Space());
    });
    spine_data.iterateSkins(function(skin_key: string, skin: spine.Skin): void {
      const skin_info: SkinInfo = render.skin_info_map[skin_key] = new SkinInfo();
      skin.iterateAttachments(function(slot_key: string, skin_slot: spine.SkinSlot, attachment_key: string, attachment: spine.Attachment): void {
        if (!attachment) { return; }
        const slot_info: SlotInfo = skin_info.slot_info_map[slot_key] = skin_info.slot_info_map[slot_key] || new SlotInfo();
        switch (attachment.type) {
          case 'mesh': {
            const mesh_attachment: spine.MeshAttachment = <spine.MeshAttachment>attachment;
            const mesh_attachment_info: MeshAttachmentInfo = slot_info.attachment_info_map[attachment_key] = new MeshAttachmentInfo();
            const vertex_count: number = mesh_attachment.vertices.length / 2;
            const vertex_position: Float32Array = new Float32Array(mesh_attachment.vertices);
            const vertex_texcoord: Float32Array = new Float32Array(mesh_attachment.uvs);
            const vertex_triangle: Uint16Array = new Uint16Array(mesh_attachment.triangles);
            mesh_attachment_info.gl_vertex_position = glMakeVertex(gl, vertex_position, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
            mesh_attachment_info.gl_vertex_texcoord = glMakeVertex(gl, vertex_texcoord, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
            mesh_attachment_info.gl_vertex_triangle = glMakeVertex(gl, vertex_triangle, 1, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
            const anim_ffd_attachments: any = mesh_attachment_info.anim_ffd_attachments = {};
            spine_data.iterateAnims(function(anim_key: string, anim: spine.Animation): void {
              const anim_ffd: spine.AnimFfd = anim.ffds && anim.ffds[skin_key];
              const ffd_slot: spine.FfdSlot = anim_ffd && anim_ffd.ffd_slots[slot_key];
              const ffd_attachment: spine.FfdAttachment = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
              if (ffd_attachment) {
                const anim_ffd_attachment: any = anim_ffd_attachments[anim_key] = {};
                const anim_ffd_keyframes: any = anim_ffd_attachment.ffd_keyframes = [];
                ffd_attachment.ffd_keyframes.forEach(function(ffd_keyframe: spine.FfdKeyframe, ffd_keyframe_index: number): void {
                  const anim_ffd_keyframe: any = anim_ffd_keyframes[ffd_keyframe_index] = {};
                  const vertex: Float32Array = new Float32Array(2 * vertex_count);
                  vertex.subarray(ffd_keyframe.offset, ffd_keyframe.offset + ffd_keyframe.vertices.length).set(new Float32Array(ffd_keyframe.vertices));
                  anim_ffd_keyframe.gl_vertex = glMakeVertex(gl, vertex, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
                });
              }
            });
            break;
          }
          case 'skinnedmesh': {
            const skinned_mesh_attachment: spine.SkinnedMeshAttachment = <spine.SkinnedMeshAttachment>attachment;
            const skinned_mesh_attachment_info: SkinnedMeshAttachmentInfo = slot_info.attachment_info_map[attachment_key] = new SkinnedMeshAttachmentInfo();
            const vertex_count: number = skinned_mesh_attachment.uvs.length / 2;
            const vertex_position: Float32Array = new Float32Array(2 * vertex_count); // [ x, y ]
            const vertex_blenders: Float32Array = new Float32Array(2 * render.gl_skin_shader_blenders_count * vertex_count); // [ i, w ]
            const vertex_texcoord: Float32Array = new Float32Array(skinned_mesh_attachment.uvs);
            const vertex_triangle: Uint16Array = new Uint16Array(skinned_mesh_attachment.triangles);
            const blend_bone_index_array: number[] = skinned_mesh_attachment_info.blend_bone_index_array = [];
            for (let vertex_index = 0, index = 0; vertex_index < vertex_count; ++vertex_index) {
              const blender_count: number = skinned_mesh_attachment.vertices[index++];
              let blender_array: any[] = [];
              for (let blender_index = 0; blender_index < blender_count; ++blender_index) {
                const bone_index: number = skinned_mesh_attachment.vertices[index++];
                const x: number = skinned_mesh_attachment.vertices[index++];
                const y: number = skinned_mesh_attachment.vertices[index++];
                const weight: number = skinned_mesh_attachment.vertices[index++];
                blender_array.push({ position: new spine.Vector(x, y), bone_index: bone_index, weight: weight });
              }
              // sort the blender array descending by weight
              blender_array = blender_array.sort(function(a: any, b: any): number { return b.weight - a.weight; });
              // clamp blender array and adjust weights
              if (blender_array.length > render.gl_skin_shader_blenders_count) {
                console.log("blend array length for", attachment_key, "is", blender_array.length, "so clamp to", render.gl_skin_shader_blenders_count);
                blender_array.length = render.gl_skin_shader_blenders_count;
                let weight_sum: number = 0;
                blender_array.forEach(function(blend: any): void { weight_sum += blend.weight; });
                blender_array.forEach(function(blend: any): void { blend.weight /= weight_sum; });
              }
              let position_x: number = 0;
              let position_y: number = 0;
              const blend_position: spine.Vector = new spine.Vector();
              let vertex_blenders_offset: number = vertex_index * 2 * render.gl_skin_shader_blenders_count;
              blender_array.forEach(function(blend: any, index: number): void {
                // keep track of which bones are used for blending
                if (blend_bone_index_array.indexOf(blend.bone_index) === -1) {
                  blend_bone_index_array.push(blend.bone_index);
                }
                const bone_key: string = spine_data.bone_keys[blend.bone_index];
                const bone: spine.Bone = spine_data.bones[bone_key];
                spine.Space.transform(bone.world_space, blend.position, blend_position);
                position_x += blend_position.x * blend.weight;
                position_y += blend_position.y * blend.weight;
                // index into gl_skin_shader_modelview_array, not spine_pose.data.bone_keys
                vertex_blenders[vertex_blenders_offset++] = blend_bone_index_array.indexOf(blend.bone_index);
                vertex_blenders[vertex_blenders_offset++] = blend.weight;
              });
              let vertex_position_offset: number = vertex_index * 2;
              vertex_position[vertex_position_offset++] = position_x;
              vertex_position[vertex_position_offset++] = position_y;
              if (blend_bone_index_array.length > render.gl_skin_shader_modelview_count) {
                console.log("blend bone index array length for", attachment_key, "is", blend_bone_index_array.length, "greater than", render.gl_skin_shader_modelview_count);
              }
            }
            skinned_mesh_attachment_info.gl_vertex_position = glMakeVertex(gl, vertex_position, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
            skinned_mesh_attachment_info.gl_vertex_blenders = glMakeVertex(gl, vertex_blenders, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
            skinned_mesh_attachment_info.gl_vertex_texcoord = glMakeVertex(gl, vertex_texcoord, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
            skinned_mesh_attachment_info.gl_vertex_triangle = glMakeVertex(gl, vertex_triangle, 1, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
            const anim_ffd_attachments: any = skinned_mesh_attachment_info.anim_ffd_attachments = {};
            spine_data.iterateAnims(function(anim_key: string, anim: spine.Animation): void {
              const anim_ffd: spine.AnimFfd = anim.ffds && anim.ffds[skin_key];
              const ffd_slot: spine.FfdSlot = anim_ffd && anim_ffd.ffd_slots[slot_key];
              const ffd_attachment: spine.FfdAttachment = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
              if (ffd_attachment) {
                const anim_ffd_attachment: any = anim_ffd_attachments[anim_key] = {};
                const anim_ffd_keyframes: any[] = anim_ffd_attachment.ffd_keyframes = [];
                ffd_attachment.ffd_keyframes.forEach(function(ffd_keyframe: spine.FfdKeyframe, ffd_keyframe_index: number): void {
                  const anim_ffd_keyframe: any = anim_ffd_keyframes[ffd_keyframe_index] = {};
                  const vertex: Float32Array = new Float32Array(2 * vertex_count);
                  for (let vertex_index = 0, index = 0, ffd_index = 0; vertex_index < vertex_count; ++vertex_index) {
                    const blender_count: number = skinned_mesh_attachment.vertices[index++];
                    let vertex_x: number = 0;
                    let vertex_y: number = 0;
                    for (let blender_index = 0; blender_index < blender_count; ++blender_index) {
                      const bone_index: number = skinned_mesh_attachment.vertices[index++];
                      const x: number = skinned_mesh_attachment.vertices[index++];
                      const y: number = skinned_mesh_attachment.vertices[index++];
                      const weight: number = skinned_mesh_attachment.vertices[index++];
                      const morph_position_x: number = ffd_keyframe.vertices[ffd_index - ffd_keyframe.offset] || 0; ++ffd_index;
                      const morph_position_y: number = ffd_keyframe.vertices[ffd_index - ffd_keyframe.offset] || 0; ++ffd_index;
                      vertex_x += morph_position_x * weight;
                      vertex_y += morph_position_y * weight;
                    }
                    let vertex_offset: number = vertex_index * 2;
                    vertex[vertex_offset++] = vertex_x;
                    vertex[vertex_offset++] = vertex_y;
                  }
                  anim_ffd_keyframe.gl_vertex = glMakeVertex(gl, vertex, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
                });
              }
            });
            break;
          }
          default:
            break;
        }
      });
    });
    if (atlas_data) {
      // load atlas page images
      atlas_data.pages.forEach(function(page) {
        if (page.format !== 'RGBA8888') {
          throw new Error(page.format);
        }
        let gl_min_filter: number = gl.NONE;
        switch (page.min_filter) {
          case 'Nearest': gl_min_filter = gl.NEAREST; break;
          default: case 'Linear': gl_min_filter = gl.LINEAR; break;
          case 'MipMapNearestNearest': gl_min_filter = gl.NEAREST_MIPMAP_NEAREST; break;
          case 'MipMapLinearNearest': gl_min_filter = gl.LINEAR_MIPMAP_NEAREST; break;
          case 'MipMapNearestLinear': gl_min_filter = gl.NEAREST_MIPMAP_LINEAR; break;
          case 'MipMapLinearLinear': gl_min_filter = gl.LINEAR_MIPMAP_LINEAR; break;
        }
        let gl_mag_filter: number = gl.NONE;
        switch (page.mag_filter) {
          case 'Nearest': gl_mag_filter = gl.NEAREST; break;
          default: case 'Linear': gl_mag_filter = gl.LINEAR; break;
        }
        let gl_wrap_s: number = gl.NONE;
        switch (page.wrap_s) {
          case 'Repeat': gl_wrap_s = gl.REPEAT; break;
          default: case 'ClampToEdge': gl_wrap_s = gl.CLAMP_TO_EDGE; break;
          case 'MirroredRepeat': gl_wrap_s = gl.MIRRORED_REPEAT; break;
        }
        let gl_wrap_t: number = gl.NONE;
        switch (page.wrap_t) {
          case 'Repeat': gl_wrap_t = gl.REPEAT; break;
          default: case 'ClampToEdge': gl_wrap_t = gl.CLAMP_TO_EDGE; break;
          case 'MirroredRepeat': gl_wrap_t = gl.MIRRORED_REPEAT; break;
        }
        const image_key: string = page.name;
        const image: HTMLImageElement = images[image_key];
        const gl_texture: WebGLTexture = render.gl_textures[image_key] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, gl_texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_min_filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl_mag_filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl_wrap_s);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl_wrap_t);
      });
    } else {
      // load attachment images
      spine_data.iterateSkins(function(skin_key, skin) {
        skin.iterateAttachments(function(slot_key, skin_slot, attachment_key, attachment) {
          if (!attachment) { return; }
          switch (attachment.type) {
            case 'region':
            case 'mesh':
            case 'skinnedmesh':
              const image_key: string = attachment_key;
              const image: HTMLImageElement = images[image_key];
              const gl_texture: WebGLTexture = render.gl_textures[image_key] = gl.createTexture();
              gl.bindTexture(gl.TEXTURE_2D, gl_texture);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
              break;
            default:
              break;
          }
        });
      });
    }
  };

  public drawPose(spine_pose: spine.Pose, atlas_data: atlas.Data): void {
    const render: RenderWebGL = this;
    const gl: WebGLRenderingContext = render.gl;
    if (!gl) { return; }
    const gl_projection: Float32Array = render.gl_projection;
    const gl_modelview: Float32Array = render.gl_modelview;
    const gl_tex_matrix: Float32Array = render.gl_tex_matrix;
    const gl_color: Float32Array = render.gl_color;
    const alpha: number = gl_color[3];
    spine_pose.iterateAttachments(function(slot_key: string, slot: spine.Slot, skin_slot: spine.SkinSlot, attachment_key: string, attachment: spine.Attachment): void {
      if (!attachment) { return; }
      if (attachment.type === 'boundingbox') { return; }
      const site: atlas.Site = atlas_data && atlas_data.sites[attachment_key];
      const page: atlas.Page = site && site.page;
      const image_key: string = (page && page.name) || attachment_key;
      const gl_texture: WebGLTexture = render.gl_textures[image_key];
      if (!gl_texture) { return; }
      mat3x3Identity(gl_modelview);
      mat3x3Identity(gl_tex_matrix);
      mat3x3ApplyAtlasPageTexcoord(gl_tex_matrix, page);
      mat3x3ApplyAtlasSiteTexcoord(gl_tex_matrix, site);
      vec4CopyColor(gl_color, slot.color);
      gl_color[3] *= alpha;
      gl.enable(gl.BLEND);
      switch (slot.blend) {
        default:
        case 'normal': gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); break;
        case 'additive': gl.blendFunc(gl.SRC_ALPHA, gl.ONE); break;
        case 'multiply': gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA); break;
        case 'screen': gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR); break;
      }
      const skin_info: SkinInfo = render.skin_info_map[spine_pose.skin_key];
      const default_skin_info: SkinInfo = render.skin_info_map['default'];
      const slot_info: SlotInfo = skin_info.slot_info_map[slot_key] || default_skin_info.slot_info_map[slot_key];
      switch (attachment.type) {
        case 'region': {
          const bone: spine.Bone = spine_pose.bones[slot.bone_key];
          const region_attachment: spine.RegionAttachment = <spine.RegionAttachment>attachment;
          const region_attachment_info: RegionAttachmentInfo = <RegionAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          mat3x3ApplySpace(gl_modelview, bone.world_space);
          mat3x3ApplySpace(gl_modelview, region_attachment.local_space);
          mat3x3Scale(gl_modelview, region_attachment.width / 2, region_attachment.height / 2);
          mat3x3ApplyAtlasSitePosition(gl_modelview, site);
          const gl_shader: glShader = render.gl_mesh_shader;
          const gl_vertex_position: glVertex = render.gl_region_vertex_position;
          const gl_vertex_texcoord: glVertex = render.gl_region_vertex_texcoord;
          gl.useProgram(gl_shader.program);
          gl.uniformMatrix4fv(gl_shader.uniforms['uProjection'], false, gl_projection);
          gl.uniformMatrix3fv(gl_shader.uniforms['uModelview'], false, gl_modelview);
          gl.uniformMatrix3fv(gl_shader.uniforms['uTexMatrix'], false, gl_tex_matrix);
          gl.uniform4fv(gl_shader.uniforms['uColor'], gl_color);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, gl_texture);
          gl.uniform1i(gl_shader.uniforms['uSampler'], 0);
          glSetupAttribute(gl, gl_shader, 'aVertexPosition', gl_vertex_position);
          glSetupAttribute(gl, gl_shader, 'aVertexTexCoord', gl_vertex_texcoord);
          gl.drawArrays(gl.TRIANGLE_FAN, 0, gl_vertex_position.count);
          glResetAttribute(gl, gl_shader, 'aVertexPosition', gl_vertex_position);
          glResetAttribute(gl, gl_shader, 'aVertexTexCoord', gl_vertex_texcoord);
          gl.bindTexture(gl.TEXTURE_2D, null);
          gl.useProgram(null);
          break;
        }
        case 'mesh': {
          const bone: spine.Bone = spine_pose.bones[slot.bone_key];
          const mesh_attachment: spine.MeshAttachment = <spine.MeshAttachment>attachment;
          const mesh_attachment_info: MeshAttachmentInfo = <MeshAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          mat3x3ApplySpace(gl_modelview, bone.world_space);
          mat3x3ApplyAtlasSitePosition(gl_modelview, site);
          const anim: spine.Animation = spine_pose.data.anims[spine_pose.anim_key];
          const anim_ffd: spine.AnimFfd = anim && anim.ffds && anim.ffds[spine_pose.skin_key];
          const ffd_slot: spine.FfdSlot = anim_ffd && anim_ffd.ffd_slots[slot_key];
          const ffd_attachment: spine.FfdAttachment = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
          const ffd_keyframes: spine.FfdKeyframe[] = ffd_attachment && ffd_attachment.ffd_keyframes;
          const ffd_keyframe0_index: number = spine.Keyframe.find(ffd_keyframes, spine_pose.time);
          if (ffd_keyframe0_index !== -1) {
            // ffd
            let pct: number = 0;
            const ffd_keyframe0: spine.FfdKeyframe = ffd_keyframes[ffd_keyframe0_index];
            let ffd_keyframe1_index: number = ffd_keyframe0_index + 1;
            let ffd_keyframe1: spine.FfdKeyframe = ffd_keyframes[ffd_keyframe1_index];
            if (ffd_keyframe1) {
              pct = ffd_keyframe0.curve.evaluate((spine_pose.time - ffd_keyframe0.time) / (ffd_keyframe1.time - ffd_keyframe0.time));
            } else {
              ffd_keyframe1_index = ffd_keyframe0_index;
              ffd_keyframe1 = ffd_keyframes[ffd_keyframe1_index];
            }
            const anim_ffd_attachment: any = mesh_attachment_info.anim_ffd_attachments[spine_pose.anim_key];
            const anim_ffd_keyframe0: any = anim_ffd_attachment.ffd_keyframes[ffd_keyframe0_index];
            const anim_ffd_keyframe1: any = anim_ffd_attachment.ffd_keyframes[ffd_keyframe1_index];
            const gl_shader: glShader = render.gl_ffd_mesh_shader;
            const gl_vertex_position: glVertex = mesh_attachment_info.gl_vertex_position;
            const gl_vertex_texcoord: glVertex = mesh_attachment_info.gl_vertex_texcoord;
            const gl_vertex_triangle: glVertex = mesh_attachment_info.gl_vertex_triangle;
            gl.useProgram(gl_shader.program);
            gl.uniformMatrix4fv(gl_shader.uniforms['uProjection'], false, gl_projection);
            gl.uniformMatrix3fv(gl_shader.uniforms['uModelview'], false, gl_modelview);
            gl.uniformMatrix3fv(gl_shader.uniforms['uTexMatrix'], false, gl_tex_matrix);
            gl.uniform4fv(gl_shader.uniforms['uColor'], gl_color);
            gl.uniform1f(gl_shader.uniforms['uMorphWeight'], pct);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, gl_texture);
            gl.uniform1i(gl_shader.uniforms['uSampler'], 0);
            glSetupAttribute(gl, gl_shader, 'aVertexPosition', gl_vertex_position);
            glSetupAttribute(gl, gl_shader, 'aVertexMorph0Position', anim_ffd_keyframe0.gl_vertex);
            glSetupAttribute(gl, gl_shader, 'aVertexMorph1Position', anim_ffd_keyframe1.gl_vertex);
            glSetupAttribute(gl, gl_shader, 'aVertexTexCoord', gl_vertex_texcoord);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl_vertex_triangle.buffer);
            gl.drawElements(gl.TRIANGLES, gl_vertex_triangle.count, gl_vertex_triangle.type, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            glResetAttribute(gl, gl_shader, 'aVertexPosition', gl_vertex_position);
            glResetAttribute(gl, gl_shader, 'aVertexMorph0Position', anim_ffd_keyframe0.gl_vertex);
            glResetAttribute(gl, gl_shader, 'aVertexMorph1Position', anim_ffd_keyframe1.gl_vertex);
            glResetAttribute(gl, gl_shader, 'aVertexTexCoord', gl_vertex_texcoord);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.useProgram(null);
          } else {
            // no ffd
            const gl_shader: glShader = render.gl_mesh_shader;
            const gl_vertex_position: glVertex = mesh_attachment_info.gl_vertex_position;
            const gl_vertex_texcoord: glVertex = mesh_attachment_info.gl_vertex_texcoord;
            const gl_vertex_triangle: glVertex = mesh_attachment_info.gl_vertex_triangle;
            gl.useProgram(gl_shader.program);
            gl.uniformMatrix4fv(gl_shader.uniforms['uProjection'], false, gl_projection);
            gl.uniformMatrix3fv(gl_shader.uniforms['uModelview'], false, gl_modelview);
            gl.uniformMatrix3fv(gl_shader.uniforms['uTexMatrix'], false, gl_tex_matrix);
            gl.uniform4fv(gl_shader.uniforms['uColor'], gl_color);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, gl_texture);
            gl.uniform1i(gl_shader.uniforms['uSampler'], 0);
            glSetupAttribute(gl, gl_shader, 'aVertexPosition', gl_vertex_position);
            glSetupAttribute(gl, gl_shader, 'aVertexTexCoord', gl_vertex_texcoord);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl_vertex_triangle.buffer);
            gl.drawElements(gl.TRIANGLES, gl_vertex_triangle.count, gl_vertex_triangle.type, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            glResetAttribute(gl, gl_shader, 'aVertexPosition', gl_vertex_position);
            glResetAttribute(gl, gl_shader, 'aVertexTexCoord', gl_vertex_texcoord);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.useProgram(null);
          }
          break;
        }
        case 'skinnedmesh': {
          const skinned_mesh_attachment: spine.SkinnedMeshAttachment = <spine.SkinnedMeshAttachment>attachment;
          const skinned_mesh_attachment_info: SkinnedMeshAttachmentInfo = <SkinnedMeshAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          // update skin shader modelview array
          const blend_bone_index_array: number[] = skinned_mesh_attachment_info.blend_bone_index_array;
          for (let index = 0; index < blend_bone_index_array.length; ++index) {
            const bone_index: number = blend_bone_index_array[index];
            const bone_key: string = spine_pose.bone_keys[bone_index];
            const bone: spine.Bone = spine_pose.bones[bone_key];
            const bone_info: BoneInfo = render.bone_info_map[bone_key];
            if (index < render.gl_skin_shader_modelview_count) {
              const modelview: Float32Array = render.gl_skin_shader_modelview_array.subarray(index * 9, (index + 1) * 9);
              mat3x3Copy(modelview, gl_modelview);
              mat3x3ApplySpace(modelview, bone.world_space);
              mat3x3ApplySpace(modelview, bone_info.setup_space);
              mat3x3ApplyAtlasSitePosition(modelview, site);
            }
          }
          const anim: spine.Animation = spine_pose.data.anims[spine_pose.anim_key];
          const anim_ffd: spine.AnimFfd = anim && anim.ffds && anim.ffds[spine_pose.skin_key];
          const ffd_slot: spine.FfdSlot = anim_ffd && anim_ffd.ffd_slots[slot_key];
          const ffd_attachment: spine.FfdAttachment = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
          const ffd_keyframes: spine.FfdKeyframe[] = ffd_attachment && ffd_attachment.ffd_keyframes;
          const ffd_keyframe0_index: number = spine.Keyframe.find(ffd_keyframes, spine_pose.time);
          if (ffd_keyframe0_index !== -1) {
            // ffd
            let pct: number = 0;
            const ffd_keyframe0: spine.FfdKeyframe = ffd_keyframes[ffd_keyframe0_index];
            let ffd_keyframe1_index: number = ffd_keyframe0_index + 1;
            let ffd_keyframe1: spine.FfdKeyframe = ffd_keyframes[ffd_keyframe1_index];
            if (ffd_keyframe1) {
              pct = ffd_keyframe0.curve.evaluate((spine_pose.time - ffd_keyframe0.time) / (ffd_keyframe1.time - ffd_keyframe0.time));
            } else {
              ffd_keyframe1_index = ffd_keyframe0_index;
              ffd_keyframe1 = ffd_keyframes[ffd_keyframe1_index];
            }
            const anim_ffd_attachment: any = skinned_mesh_attachment_info.anim_ffd_attachments[spine_pose.anim_key];
            const anim_ffd_keyframe0: any = anim_ffd_attachment.ffd_keyframes[ffd_keyframe0_index];
            const anim_ffd_keyframe1: any = anim_ffd_attachment.ffd_keyframes[ffd_keyframe1_index];
            const gl_shader: glShader = render.gl_ffd_skin_shader;
            const gl_vertex_position: glVertex = skinned_mesh_attachment_info.gl_vertex_position;
            const gl_vertex_blenders: glVertex = skinned_mesh_attachment_info.gl_vertex_blenders;
            const gl_vertex_texcoord: glVertex = skinned_mesh_attachment_info.gl_vertex_texcoord;
            const gl_vertex_triangle: glVertex = skinned_mesh_attachment_info.gl_vertex_triangle;
            gl.useProgram(gl_shader.program);
            gl.uniformMatrix4fv(gl_shader.uniforms['uProjection'], false, gl_projection);
            gl.uniformMatrix3fv(gl_shader.uniforms['uModelviewArray[0]'], false, render.gl_skin_shader_modelview_array);
            gl.uniformMatrix3fv(gl_shader.uniforms['uTexMatrix'], false, gl_tex_matrix);
            gl.uniform4fv(gl_shader.uniforms['uColor'], gl_color);
            gl.uniform1f(gl_shader.uniforms['uMorphWeight'], pct);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, gl_texture);
            gl.uniform1i(gl_shader.uniforms['uSampler'], 0);
            glSetupAttribute(gl, gl_shader, 'aVertexPosition', gl_vertex_position);
            glSetupAttribute(gl, gl_shader, 'aVertexBlenders{index}', gl_vertex_blenders, render.gl_skin_shader_blenders_count);
            glSetupAttribute(gl, gl_shader, 'aVertexMorph0Position', anim_ffd_keyframe0.gl_vertex);
            glSetupAttribute(gl, gl_shader, 'aVertexMorph1Position', anim_ffd_keyframe1.gl_vertex);
            glSetupAttribute(gl, gl_shader, 'aVertexTexCoord', gl_vertex_texcoord);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl_vertex_triangle.buffer);
            gl.drawElements(gl.TRIANGLES, gl_vertex_triangle.count, gl_vertex_triangle.type, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            glResetAttribute(gl, gl_shader, 'aVertexPosition', gl_vertex_position);
            glResetAttribute(gl, gl_shader, 'aVertexBlenders{index}', gl_vertex_blenders, render.gl_skin_shader_blenders_count);
            glResetAttribute(gl, gl_shader, 'aVertexMorph0Position', anim_ffd_keyframe0.gl_vertex);
            glResetAttribute(gl, gl_shader, 'aVertexMorph1Position', anim_ffd_keyframe1.gl_vertex);
            glResetAttribute(gl, gl_shader, 'aVertexTexCoord', gl_vertex_texcoord);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.useProgram(null);
          } else {
            // no ffd
            const gl_shader: glShader = render.gl_skin_shader;
            const gl_vertex_position: glVertex = skinned_mesh_attachment_info.gl_vertex_position;
            const gl_vertex_blenders: glVertex = skinned_mesh_attachment_info.gl_vertex_blenders;
            const gl_vertex_texcoord: glVertex = skinned_mesh_attachment_info.gl_vertex_texcoord;
            const gl_vertex_triangle: glVertex = skinned_mesh_attachment_info.gl_vertex_triangle;
            gl.useProgram(gl_shader.program);
            gl.uniformMatrix4fv(gl_shader.uniforms['uProjection'], false, gl_projection);
            gl.uniformMatrix3fv(gl_shader.uniforms['uModelviewArray[0]'], false, render.gl_skin_shader_modelview_array);
            gl.uniformMatrix3fv(gl_shader.uniforms['uTexMatrix'], false, gl_tex_matrix);
            gl.uniform4fv(gl_shader.uniforms['uColor'], gl_color);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, gl_texture);
            gl.uniform1i(gl_shader.uniforms['uSampler'], 0);
            glSetupAttribute(gl, gl_shader, 'aVertexPosition', gl_vertex_position);
            glSetupAttribute(gl, gl_shader, 'aVertexBlenders{index}', gl_vertex_blenders, render.gl_skin_shader_blenders_count);
            glSetupAttribute(gl, gl_shader, 'aVertexTexCoord', gl_vertex_texcoord);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl_vertex_triangle.buffer);
            gl.drawElements(gl.TRIANGLES, gl_vertex_triangle.count, gl_vertex_triangle.type, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            glResetAttribute(gl, gl_shader, 'aVertexPosition', gl_vertex_position);
            glResetAttribute(gl, gl_shader, 'aVertexBlenders{index}', gl_vertex_blenders, render.gl_skin_shader_blenders_count);
            glResetAttribute(gl, gl_shader, 'aVertexTexCoord', gl_vertex_texcoord);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.useProgram(null);
          }
          break;
        }
        default:
          break;
      }
    });
    gl_color[3] = alpha;
  }
}

export function vec4Identity(v: Float32Array): Float32Array {
  v[0] = v[1] = v[2] = v[3] = 1.0;
  return v;
}

export function vec4CopyColor(v: Float32Array, color: spine.Color): Float32Array {
  v[0] = color.r;
  v[1] = color.g;
  v[2] = color.b;
  v[3] = color.a;
  return v;
}

export function vec4ApplyColor(v: Float32Array, color: spine.Color): Float32Array {
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

export function mat3x3ApplySpace(m: Float32Array, space: spine.Space): Float32Array {
  if (space) {
    mat3x3Translate(m, space.position.x, space.position.y);
    mat3x3Rotate(m, space.rotation.rad * space.flip.x * space.flip.y);
    mat3x3Scale(m, space.scale.x * space.flip.x, space.scale.y * space.flip.y);
  }
  return m;
}

export function mat3x3ApplyAtlasPageTexcoord(m: Float32Array, page: atlas.Page): Float32Array {
  if (page) {
    mat3x3Scale(m, 1 / page.w, 1 / page.h);
  }
  return m;
}

export function mat3x3ApplyAtlasSiteTexcoord(m: Float32Array, site: atlas.Site): Float32Array {
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

export function mat3x3ApplyAtlasSitePosition(m: Float32Array, site: atlas.Site): Float32Array {
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

export function glCompileShader(gl: WebGLRenderingContext, src: string[], type: number): WebGLShader {
  src = flatten(src);
  let shader: WebGLShader = gl.createShader(type);
  gl.shaderSource(shader, src.join('\n'));
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    src.forEach(function(line: string, index: number): void { console.log(index + 1, line); });
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    shader = null;
  }
  return shader;
}

export function glLinkProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  let program: WebGLProgram = gl.createProgram();
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

export function glGetUniforms(gl: WebGLRenderingContext, program: WebGLProgram, uniforms: {[key: string]: WebGLUniformLocation}): {[key: string]: WebGLUniformLocation} {
  const count: number = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let index = 0; index < count; ++index) {
    const uniform: WebGLActiveInfo = gl.getActiveUniform(program, index);
    uniforms[uniform.name] = gl.getUniformLocation(program, uniform.name);
  }
  return uniforms;
}

export function glGetAttribs(gl: WebGLRenderingContext, program: WebGLProgram, attribs: {[key: string]: number}): {[key: string]: number} {
  const count: number = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let index = 0; index < count; ++index) {
    const attrib: WebGLActiveInfo = gl.getActiveAttrib(program, index);
    attribs[attrib.name] = gl.getAttribLocation(program, attrib.name);
  }
  return attribs;
}

export function glMakeShader(gl: WebGLRenderingContext, vs_src: string[], fs_src: string[]): glShader {
  const shader: glShader = new glShader();
  shader.vs_src = vs_src;
  shader.fs_src = fs_src;
  shader.vs = glCompileShader(gl, shader.vs_src, gl.VERTEX_SHADER);
  shader.fs = glCompileShader(gl, shader.fs_src, gl.FRAGMENT_SHADER);
  shader.program = glLinkProgram(gl, shader.vs, shader.fs);
  shader.uniforms = glGetUniforms(gl, shader.program, {});
  shader.attribs = glGetAttribs(gl, shader.program, {});
  return shader;
}

export function glMakeVertex(gl: WebGLRenderingContext, type_array: any, size: number, buffer_type: number, buffer_draw: number): glVertex {
  const vertex: glVertex = new glVertex();
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

export function glSetupAttribute(gl: WebGLRenderingContext, shader: glShader, format: string, vertex: glVertex, count: number = 0): void {
  gl.bindBuffer(vertex.buffer_type, vertex.buffer);
  if (count > 0) {
    const sizeof_vertex: number = vertex.type_array.BYTES_PER_ELEMENT * vertex.size; // in bytes
    const stride: number = sizeof_vertex * count;
    for (let index = 0; index < count; ++index) {
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

export function glResetAttribute(gl: WebGLRenderingContext, shader: glShader, format: string, vertex: glVertex, count: number = 0): void {
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
