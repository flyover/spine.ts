import * as Spine from "@spine";
import * as Atlas from "./atlas.js";
import { mat3x3Identity, mat3x3Scale, mat3x3Transform, mat3x3ApplyAtlasPageTexcoord, mat3x3ApplyAtlasSiteTexcoord } from "./render-webgl.js";

export class RenderCtx2D {
  public ctx: CanvasRenderingContext2D;
  public images: Spine.Map<string, HTMLImageElement> = new Spine.Map<string, HTMLImageElement>();
  public skin_map: Spine.Map<string, RenderSkin> = new Spine.Map<string, RenderSkin>();
  public region_vertex_position: Float32Array = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]); // [ x, y ]
  public region_vertex_texcoord: Float32Array = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]); // [ u, v ]
  public region_vertex_triangle: Uint16Array = new Uint16Array([0, 1, 2, 0, 2, 3]); // [ i0, i1, i2 ]

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public loadData(spine_data: Spine.Data, atlas_data: Atlas.Data | null = null, images: Spine.Map<string, HTMLImageElement>): void {
    this.images = images;
    spine_data.iterateSkins((skin_key: string, skin: Spine.Skin): void => {
      const render_skin: RenderSkin = this.skin_map.get(skin_key) || this.skin_map.set(skin_key, new RenderSkin());
      skin.iterateAttachments((slot_key: string, skin_slot: Spine.SkinSlot, attachment_key: string, attachment: Spine.Attachment): void => {
        if (!attachment) { return; }
        const render_slot: RenderSlot = render_skin.slot_map.get(slot_key) || render_skin.slot_map.set(slot_key, new RenderSlot());
        switch (attachment.type) {
          case "region":
            render_slot.attachment_map.set(attachment_key, new RenderRegionAttachment(this).loadData(spine_data, <Spine.RegionAttachment> attachment));
            break;
          case "boundingbox":
            render_slot.attachment_map.set(attachment_key, new RenderBoundingBoxAttachment(this).loadData(spine_data, <Spine.BoundingBoxAttachment> attachment));
            break;
          case "mesh":
            render_slot.attachment_map.set(attachment_key, new RenderMeshAttachment(this).loadData(spine_data, <Spine.MeshAttachment> attachment));
            break;
          case "weightedmesh":
            render_slot.attachment_map.set(attachment_key, new RenderWeightedMeshAttachment(this).loadData(spine_data, <Spine.WeightedMeshAttachment> attachment));
            break;
          case "path":
            render_slot.attachment_map.set(attachment_key, new RenderPathAttachment(this).loadData(spine_data, <Spine.PathAttachment> attachment));
            break;
        }
      });
    });
  }

  public dropData(spine_data: Spine.Data, atlas_data: Atlas.Data | null = null): void {
    this.images.clear();
    spine_data.iterateSkins((skin_key: string, skin: Spine.Skin): void => {
      const render_skin: RenderSkin | undefined = this.skin_map.get(skin_key);
      skin.iterateAttachments((slot_key: string, skin_slot: Spine.SkinSlot, attachment_key: string, attachment: Spine.Attachment): void => {
        if (!attachment) { return; }
        const render_slot: RenderSlot | undefined = render_skin && render_skin.slot_map.get(slot_key);
        const render_attachment: RenderAttachment | undefined = render_slot && render_slot.attachment_map.get(attachment_key);
        if (render_attachment) {
          render_attachment.dropData(spine_data, attachment);
        }
      });
    });
    this.skin_map.clear();
  }

  public updatePose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null): void {
    spine_pose.iterateAttachments((slot_key: string, slot: Spine.Slot, skin_slot: Spine.SkinSlot, attachment_key: string, attachment: Spine.Attachment): void => {
      if (!attachment) { return; }
      const render_skin: RenderSkin | undefined = this.skin_map.get(spine_pose.skin_key);
      const render_skin_default: RenderSkin | undefined = this.skin_map.get("default");
      const render_slot: RenderSlot | undefined = (render_skin && render_skin.slot_map.get(slot_key)) || (render_skin_default && render_skin_default.slot_map.get(slot_key));
      const render_attachment: RenderAttachment | undefined = render_slot && render_slot.attachment_map.get(attachment_key);
      if (render_attachment) {
        render_attachment.updatePose(spine_pose, atlas_data, slot_key, attachment_key, attachment);
      }
    });
  }

  public drawPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null): void {
    const ctx: CanvasRenderingContext2D = this.ctx;
    this.updatePose(spine_pose, atlas_data);
    spine_pose.iterateAttachments((slot_key: string, slot: Spine.Slot, skin_slot: Spine.SkinSlot, attachment_key: string, attachment: Spine.Attachment): void => {
      if (!attachment) { return; }
      const render_skin: RenderSkin | undefined = this.skin_map.get(spine_pose.skin_key);
      const render_skin_default: RenderSkin | undefined = this.skin_map.get("default");
      const render_slot: RenderSlot | undefined = (render_skin && render_skin.slot_map.get(slot_key)) || (render_skin_default && render_skin_default.slot_map.get(slot_key));
      const render_attachment: RenderAttachment | undefined = render_slot && render_slot.attachment_map.get(attachment_key);
      if (render_attachment) {
        ctx.save();
        // slot.color.rgb
        ctx.globalAlpha *= slot.color.a;
        switch (slot.blend) {
          default: case "normal": ctx.globalCompositeOperation = "source-over"; break;
          case "additive": ctx.globalCompositeOperation = "lighter"; break;
          case "multiply": ctx.globalCompositeOperation = "multiply"; break;
          case "screen": ctx.globalCompositeOperation = "screen"; break;
        }
        render_attachment.drawPose(spine_pose, atlas_data, slot, attachment_key, attachment);
        ctx.restore();
      }
    });
  }

  public drawDebugPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null): void {
    const ctx: CanvasRenderingContext2D = this.ctx;
    this.updatePose(spine_pose, atlas_data);
    spine_pose.iterateAttachments((slot_key: string, slot: Spine.Slot, skin_slot: Spine.SkinSlot, attachment_key: string, attachment: Spine.Attachment): void => {
      if (!attachment) { return; }
      const render_skin: RenderSkin | undefined = this.skin_map.get(spine_pose.skin_key);
      const render_skin_default: RenderSkin | undefined = this.skin_map.get("default");
      const render_slot: RenderSlot | undefined = (render_skin && render_skin.slot_map.get(slot_key)) || (render_skin_default && render_skin_default.slot_map.get(slot_key));
      const render_attachment: RenderAttachment | undefined = render_slot && render_slot.attachment_map.get(attachment_key);
      if (render_attachment) {
        render_attachment.drawDebugPose(spine_pose, atlas_data, slot, attachment_key, attachment);
      }
    });
    spine_pose.iterateBones((bone_key: string, bone: Spine.Bone): void => {
      ctx.save();
      ctxApplySpace(ctx, bone.world_space);
      ctxDrawPoint(ctx);
      ctx.restore();
    });
    ctxDrawIkConstraints(ctx, spine_pose.data, spine_pose.bones);
  }

  public drawDebugData(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null): void {
    const ctx: CanvasRenderingContext2D = this.ctx;
    spine_pose.data.iterateAttachments(spine_pose.skin_key, (slot_key: string, slot: Spine.Slot, skin_slot: Spine.SkinSlot, attachment_key: string, attachment: Spine.Attachment): void => {
      if (!attachment) { return; }
      const render_skin: RenderSkin | undefined = this.skin_map.get(spine_pose.skin_key);
      const render_skin_default: RenderSkin | undefined = this.skin_map.get("default");
      const render_slot: RenderSlot | undefined = (render_skin && render_skin.slot_map.get(slot_key)) || (render_skin_default && render_skin_default.slot_map.get(slot_key));
      const render_attachment: RenderAttachment | undefined = render_slot && render_slot.attachment_map.get(attachment_key);
      if (render_attachment) {
        render_attachment.drawDebugData(spine_pose, atlas_data, slot, attachment_key, attachment);
      }
    });
    spine_pose.data.iterateBones((bone_key: string, bone: Spine.Bone): void => {
      ctx.save();
      ctxApplySpace(ctx, bone.world_space);
      ctxDrawPoint(ctx);
      ctx.restore();
    });
    ctxDrawIkConstraints(ctx, spine_pose.data, spine_pose.data.bones);
  }
}

class RenderSkin {
  public slot_map: Spine.Map<string, RenderSlot> = new Spine.Map<string, RenderSlot>();
}

class RenderSlot {
  public attachment_map: Spine.Map<string, RenderAttachment> = new Spine.Map<string, RenderAttachment>();
}

interface RenderAttachment {
  loadData(spine_data: Spine.Data, attachment: Spine.Attachment): RenderAttachment;
  dropData(spine_data: Spine.Data, attachment: Spine.Attachment): RenderAttachment;
  updatePose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot_key: string, attachment_key: string, attachment: Spine.Attachment): void;
  drawPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.Attachment): void;
  drawDebugPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.Attachment): void;
  drawDebugData(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.Attachment): void;
}

class RenderRegionAttachment implements RenderAttachment {
  public render: RenderCtx2D;

  constructor(render: RenderCtx2D) {
    this.render = render;
  }

  loadData(spine_data: Spine.Data, attachment: Spine.RegionAttachment): RenderRegionAttachment {
    return this;
  }

  dropData(spine_data: Spine.Data, attachment: Spine.RegionAttachment): RenderRegionAttachment {
    return this;
  }

  updatePose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot_key: string, attachment_key: string, attachment: Spine.Attachment): void {
  }

  drawPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.RegionAttachment): void {
    const ctx: CanvasRenderingContext2D = this.render.ctx;
    const bone: Spine.Bone | undefined = spine_pose.bones.get(slot.bone_key);
    const site: Atlas.Site | null = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
    const page: Atlas.Page | null = site && site.page;
    const image_key: string = (page && page.name) || attachment.path || attachment.name || attachment_key;
    const image: HTMLImageElement | undefined = this.render.images.get(image_key);
    if (!image || !image.complete) { return; }
    ctx.save();
    bone && ctxApplySpace(ctx, bone.world_space);
    ctxApplySpace(ctx, attachment.local_space);
    ctxApplyAtlasSitePosition(ctx, site);
    ctx.scale(attachment.width / 2, attachment.height / 2);
    ctxDrawImageMesh(ctx, this.render.region_vertex_triangle, this.render.region_vertex_position, this.render.region_vertex_texcoord, image, site);
    ctx.restore();
  }

  drawDebugPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.RegionAttachment): void {
    const ctx: CanvasRenderingContext2D = this.render.ctx;
    const bone: Spine.Bone | undefined = spine_pose.bones.get(slot.bone_key);
    const site: Atlas.Site | null = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
    ctx.save();
    bone && ctxApplySpace(ctx, bone.world_space);
    ctxApplySpace(ctx, attachment.local_space);
    ctxApplyAtlasSitePosition(ctx, site);
    ctx.beginPath();
    ctx.rect(-attachment.width / 2, -attachment.height / 2, attachment.width, attachment.height);
    ctx.fillStyle = "rgba(127,127,127,0.25)";
    ctx.fill();
    ctx.strokeStyle = "rgba(127,127,127,1.0)";
    ctx.stroke();
    ctx.restore();
  }

  drawDebugData(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.RegionAttachment): void {
    const ctx: CanvasRenderingContext2D = this.render.ctx;
    const bone: Spine.Bone | undefined = spine_pose.data.bones.get(slot.bone_key);
    const site: Atlas.Site | null = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
    ctx.save();
    bone && ctxApplySpace(ctx, bone.world_space);
    ctxApplySpace(ctx, attachment.local_space);
    ctxApplyAtlasSitePosition(ctx, site);
    ctx.beginPath();
    ctx.rect(-attachment.width / 2, -attachment.height / 2, attachment.width, attachment.height);
    ctx.fillStyle = "rgba(127,127,127,0.25)";
    ctx.fill();
    ctx.strokeStyle = "rgba(127,127,127,1.0)";
    ctx.stroke();
    ctx.restore();
  }
}

class RenderBoundingBoxAttachment implements RenderAttachment {
  public render: RenderCtx2D;

  constructor(render: RenderCtx2D) {
    this.render = render;
  }

  loadData(spine_data: Spine.Data, attachment: Spine.BoundingBoxAttachment): RenderBoundingBoxAttachment {
    return this;
  }

  dropData(spine_data: Spine.Data, attachment: Spine.BoundingBoxAttachment): RenderBoundingBoxAttachment {
    return this;
  }

  updatePose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot_key: string, attachment_key: string, attachment: Spine.Attachment): void {
  }

  drawPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.BoundingBoxAttachment): void {
  }

  drawDebugPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.BoundingBoxAttachment): void {
    const ctx: CanvasRenderingContext2D = this.render.ctx;
    const bone: Spine.Bone | undefined = spine_pose.bones.get(slot.bone_key);
    ctx.save();
    bone && ctxApplySpace(ctx, bone.world_space);
    ctx.beginPath();
    let x: number = 0;
    attachment.vertices.forEach((value: number, index: number): void => {
      if (index & 1) { ctx.lineTo(x, value); } else { x = value; }
    });
    ctx.closePath();
    ctx.strokeStyle = attachment.color.toString();
    ctx.stroke();
    ctx.restore();
  }

  drawDebugData(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.BoundingBoxAttachment): void {
    const ctx: CanvasRenderingContext2D = this.render.ctx;
    const bone: Spine.Bone | undefined = spine_pose.data.bones.get(slot.bone_key);
    ctx.save();
    bone && ctxApplySpace(ctx, bone.world_space);
    ctx.beginPath();
    let x: number = 0;
    attachment.vertices.forEach((value: number, index: number): void => {
      if (index & 1) { ctx.lineTo(x, value); } else { x = value; }
    });
    ctx.closePath();
    ctx.strokeStyle = attachment.color.toString();
    ctx.stroke();
    ctx.restore();
  }
}

class RenderMeshAttachment implements RenderAttachment {
  public render: RenderCtx2D;
  public vertex_count!: number;
  public vertex_position!: Float32Array;
  public vertex_texcoord!: Float32Array;
  public vertex_triangle!: Uint16Array;

  constructor(render: RenderCtx2D) {
    this.render = render;
  }

  loadData(spine_data: Spine.Data, attachment: Spine.MeshAttachment): RenderMeshAttachment {
    this.vertex_count = attachment.vertices.length / 2;
    this.vertex_position = new Float32Array(attachment.vertices);
    this.vertex_texcoord = new Float32Array(attachment.uvs);
    this.vertex_triangle = new Uint16Array(attachment.triangles);
    return this;
  }

  dropData(spine_data: Spine.Data, attachment: Spine.MeshAttachment): RenderMeshAttachment {
    return this;
  }

  updatePose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot_key: string, attachment_key: string, attachment: Spine.MeshAttachment): void {
    const anim: Spine.Animation | undefined = spine_pose.data.anims.get(spine_pose.anim_key);
    const ffd_skin: Spine.FfdSkin | undefined = anim && anim.ffd_skins && anim.ffd_skins.get(spine_pose.skin_key);
    const ffd_slot: Spine.FfdSlot | undefined = ffd_skin && ffd_skin.ffd_slots.get(slot_key);
    const ffd_attachment: Spine.FfdAttachment | undefined = ffd_slot && ffd_slot.ffd_attachments.get(attachment_key);
    const ffd_timeline: Spine.FfdTimeline | undefined = ffd_attachment && ffd_attachment.ffd_timeline;
    const ffd_keyframes: Spine.FfdKeyframe[] | undefined = ffd_timeline && ffd_timeline.keyframes;
    const ffd_keyframe0_index: number = Spine.Keyframe.find(ffd_keyframes, spine_pose.time);
    const ffd_keyframe1_index: number = ffd_keyframe0_index + 1 || ffd_keyframe0_index;
    const ffd_keyframe0: Spine.FfdKeyframe | undefined = (ffd_keyframes && ffd_keyframes[ffd_keyframe0_index]);
    const ffd_keyframe1: Spine.FfdKeyframe | undefined = (ffd_keyframes && ffd_keyframes[ffd_keyframe1_index]) || ffd_keyframe0;
    const ffd_weight: number = Spine.FfdKeyframe.interpolate(ffd_keyframe0, ffd_keyframe1, spine_pose.time);
    if (ffd_keyframe0 && ffd_keyframe1) {
      for (let index = 0; index < this.vertex_position.length; ++index) {
        const v0: number = ffd_keyframe0.vertices[index - ffd_keyframe0.offset] || 0;
        const v1: number = ffd_keyframe1.vertices[index - ffd_keyframe1.offset] || 0;
        this.vertex_position[index] = attachment.vertices[index] + Spine.tween(v0, v1, ffd_weight);
      }
    }
  }

  drawPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.MeshAttachment): void {
    const ctx: CanvasRenderingContext2D = this.render.ctx;
    const bone: Spine.Bone | undefined = spine_pose.bones.get(slot.bone_key);
    const site: Atlas.Site | null = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
    const page: Atlas.Page | null = site && site.page;
    const image_key: string = (page && page.name) || attachment.path || attachment.name || attachment_key;
    const image: HTMLImageElement | undefined = this.render.images.get(image_key);
    if (!image || !image.complete) { return; }
    ctx.save();
    bone && ctxApplySpace(ctx, bone.world_space);
    ctxApplyAtlasSitePosition(ctx, site);
    ctxDrawImageMesh(ctx, this.vertex_triangle, this.vertex_position, this.vertex_texcoord, image, site);
    ctx.restore();
  }

  drawDebugPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.MeshAttachment): void {
    const ctx: CanvasRenderingContext2D = this.render.ctx;
    const bone: Spine.Bone | undefined = spine_pose.bones.get(slot.bone_key);
    const site: Atlas.Site | null = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
    ctx.save();
    bone && ctxApplySpace(ctx, bone.world_space);
    ctxApplyAtlasSitePosition(ctx, site);
    ctxDrawMesh(ctx, this.vertex_triangle, this.vertex_position, "rgba(127,127,127,1.0)", "rgba(127,127,127,0.25)");
    ctx.restore();
  }

  drawDebugData(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.MeshAttachment): void {
    const ctx: CanvasRenderingContext2D = this.render.ctx;
    const bone: Spine.Bone | undefined = spine_pose.data.bones.get(slot.bone_key);
    const site: Atlas.Site | null = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
    ctx.save();
    bone && ctxApplySpace(ctx, bone.world_space);
    ctxApplyAtlasSitePosition(ctx, site);
    ctxDrawMesh(ctx, this.vertex_triangle, this.vertex_position, "rgba(127,127,127,1.0)", "rgba(127,127,127,0.25)");
    ctx.restore();
  }
}

class RenderWeightedMeshAttachment implements RenderAttachment {
  public render: RenderCtx2D;
  public vertex_count!: number;
  public vertex_setup_position!: Float32Array;
  public vertex_blend_position!: Float32Array;
  public vertex_texcoord!: Float32Array;
  public vertex_triangle!: Uint16Array;

  constructor(render: RenderCtx2D) {
    this.render = render;
  }

  loadData(spine_data: Spine.Data, attachment: Spine.WeightedMeshAttachment): RenderWeightedMeshAttachment {
    const vertex_count: number = this.vertex_count = attachment.uvs.length / 2;
    const vertex_setup_position: Float32Array = this.vertex_setup_position = new Float32Array(2 * vertex_count);
    const vertex_blend_position: Float32Array = this.vertex_blend_position = new Float32Array(2 * vertex_count);
    this.vertex_texcoord = new Float32Array(attachment.uvs);
    this.vertex_triangle = new Uint16Array(attachment.triangles);
    const position: Spine.Vector = new Spine.Vector();
    for (let vertex_index = 0, index = 0; vertex_index < vertex_count; ++vertex_index) {
      const blender_count: number = attachment.vertices[index++];
      let setup_position_x: number = 0;
      let setup_position_y: number = 0;
      for (let blender_index = 0; blender_index < blender_count; ++blender_index) {
        const bone_index: number = attachment.vertices[index++];
        position.x = attachment.vertices[index++];
        position.y = attachment.vertices[index++];
        const weight: number = attachment.vertices[index++];
        ///const bone_key: string = spine_data.bones._keys[bone_index];
        ///const bone: Spine.Bone | undefined = spine_data.bones.get(bone_key);
        const bone: Spine.Bone | undefined = spine_data.bones.getByIndex(bone_index);
        bone && Spine.Space.transform(bone.world_space, position, position);
        setup_position_x += position.x * weight;
        setup_position_y += position.y * weight;
      }
      let vertex_setup_position_offset: number = vertex_index * 2;
      vertex_setup_position[vertex_setup_position_offset++] = setup_position_x;
      vertex_setup_position[vertex_setup_position_offset++] = setup_position_y;
    }
    vertex_blend_position.set(vertex_setup_position);
    return this;
  }

  dropData(spine_data: Spine.Data, attachment: Spine.WeightedMeshAttachment): RenderWeightedMeshAttachment {
    return this;
  }

  updatePose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot_key: string, attachment_key: string, attachment: Spine.WeightedMeshAttachment): void {
    const anim: Spine.Animation | undefined = spine_pose.data.anims.get(spine_pose.anim_key);
    const ffd_skin: Spine.FfdSkin | undefined = anim && anim.ffd_skins && anim.ffd_skins.get(spine_pose.skin_key);
    const ffd_slot: Spine.FfdSlot | undefined = ffd_skin && ffd_skin.ffd_slots.get(slot_key);
    const ffd_attachment: Spine.FfdAttachment | undefined = ffd_slot && ffd_slot.ffd_attachments.get(attachment_key);
    const ffd_timeline: Spine.FfdTimeline | undefined = ffd_attachment && ffd_attachment.ffd_timeline;
    const ffd_keyframes: Spine.FfdKeyframe[] | undefined = ffd_timeline && ffd_timeline.keyframes;
    const ffd_keyframe0_index: number = Spine.Keyframe.find(ffd_keyframes, spine_pose.time);
    const ffd_keyframe1_index: number = ffd_keyframe0_index + 1 || ffd_keyframe0_index;
    const ffd_keyframe0: Spine.FfdKeyframe | undefined = (ffd_keyframes && ffd_keyframes[ffd_keyframe0_index]);
    const ffd_keyframe1: Spine.FfdKeyframe | undefined = (ffd_keyframes && ffd_keyframes[ffd_keyframe1_index]) || ffd_keyframe0;
    const ffd_weight: number = Spine.FfdKeyframe.interpolate(ffd_keyframe0, ffd_keyframe1, spine_pose.time);
    if (ffd_keyframe0 && ffd_keyframe1) {
      const vertex_blend_position: Float32Array = this.vertex_blend_position;
      const position: Spine.Vector = new Spine.Vector();
      for (let vertex_index = 0, index = 0, ffd_index = 0; vertex_index < this.vertex_count; ++vertex_index) {
        const blender_count: number = attachment.vertices[index++];
        let blend_position_x: number = 0;
        let blend_position_y: number = 0;
        for (let blender_index = 0; blender_index < blender_count; ++blender_index) {
          const bone_index: number = attachment.vertices[index++];
          position.x = attachment.vertices[index++];
          position.y = attachment.vertices[index++];
          const weight: number = attachment.vertices[index++];
          ///const bone_key: string = spine_pose.bones._keys[bone_index];
          ///const bone: Spine.Bone | undefined = spine_pose.bones.get(bone_key);
          const bone: Spine.Bone | undefined = spine_pose.bones.getByIndex(bone_index);
          const x0: number = ffd_keyframe0.vertices[ffd_index - ffd_keyframe0.offset] || 0;
          const x1: number = ffd_keyframe1.vertices[ffd_index - ffd_keyframe1.offset] || 0;
          position.x += Spine.tween(x0, x1, ffd_weight); ++ffd_index;
          const y0: number = ffd_keyframe0.vertices[ffd_index - ffd_keyframe0.offset] || 0;
          const y1: number = ffd_keyframe1.vertices[ffd_index - ffd_keyframe1.offset] || 0;
          position.y += Spine.tween(y0, y1, ffd_weight); ++ffd_index;
          bone && Spine.Space.transform(bone.world_space, position, position);
          blend_position_x += position.x * weight;
          blend_position_y += position.y * weight;
        }
        vertex_blend_position[vertex_index * 2 + 0] = blend_position_x;
        vertex_blend_position[vertex_index * 2 + 1] = blend_position_y;
      }
    }
    else {
      const vertex_blend_position: Float32Array = this.vertex_blend_position;
      const position: Spine.Vector = new Spine.Vector();
      for (let vertex_index = 0, index = 0; vertex_index < this.vertex_count; ++vertex_index) {
        const blender_count: number = attachment.vertices[index++];
        let blend_position_x: number = 0;
        let blend_position_y: number = 0;
        for (let blender_index = 0; blender_index < blender_count; ++blender_index) {
          const bone_index: number = attachment.vertices[index++];
          position.x = attachment.vertices[index++];
          position.y = attachment.vertices[index++];
          const weight: number = attachment.vertices[index++];
          ///const bone_key: string = spine_pose.bones._keys[bone_index];
          ///const bone: Spine.Bone | undefined = spine_pose.bones.get(bone_key);
          const bone: Spine.Bone | undefined = spine_pose.bones.getByIndex(bone_index);
          bone && Spine.Space.transform(bone.world_space, position, position);
          blend_position_x += position.x * weight;
          blend_position_y += position.y * weight;
        }
        let vertex_position_offset: number = vertex_index * 2;
        vertex_blend_position[vertex_position_offset++] = blend_position_x;
        vertex_blend_position[vertex_position_offset++] = blend_position_y;
      }
    }
  }

  drawPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.WeightedMeshAttachment): void {
    const ctx: CanvasRenderingContext2D = this.render.ctx;
    const site: Atlas.Site | null = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
    const page: Atlas.Page | null = site && site.page;
    const image_key: string = (page && page.name) || attachment.path || attachment.name || attachment_key;
    const image: HTMLImageElement | undefined = this.render.images.get(image_key);
    if (!image || !image.complete) { return; }
    ctx.save();
    ctxApplyAtlasSitePosition(ctx, site);
    ctxDrawImageMesh(ctx, this.vertex_triangle, this.vertex_blend_position, this.vertex_texcoord, image, site);
    ctx.restore();
  }

  drawDebugPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.WeightedMeshAttachment): void {
    const ctx: CanvasRenderingContext2D = this.render.ctx;
    const site: Atlas.Site | null = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
    ctx.save();
    ctxApplyAtlasSitePosition(ctx, site);
    ctxDrawMesh(ctx, this.vertex_triangle, this.vertex_blend_position, "rgba(127,127,127,1.0)", "rgba(127,127,127,0.25)");
    ctx.restore();
  }

  drawDebugData(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.WeightedMeshAttachment): void {
    const ctx: CanvasRenderingContext2D = this.render.ctx;
    const site: Atlas.Site | null = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
    ctx.save();
    ctxApplyAtlasSitePosition(ctx, site);
    ctxDrawMesh(ctx, this.vertex_triangle, this.vertex_setup_position, "rgba(127,127,127,1.0)", "rgba(127,127,127,0.25)");
    ctx.restore();
  }
}

class RenderPathAttachment implements RenderAttachment {
  public render: RenderCtx2D;

  constructor(render: RenderCtx2D) {
    this.render = render;
  }

  loadData(spine_data: Spine.Data, attachment: Spine.BoundingBoxAttachment): RenderPathAttachment {
    return this;
  }

  dropData(spine_data: Spine.Data, attachment: Spine.BoundingBoxAttachment): RenderPathAttachment {
    return this;
  }

  updatePose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot_key: string, attachment_key: string, attachment: Spine.Attachment): void {
  }

  drawPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.PathAttachment): void {
  }

  drawDebugPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.PathAttachment): void {
    const ctx: CanvasRenderingContext2D = this.render.ctx;
    const bone: Spine.Bone | undefined = spine_pose.bones.get(slot.bone_key);
    ctx.save();
    bone && ctxApplySpace(ctx, bone.world_space);
    ctx.beginPath();
    let x: number = 0;
    attachment.vertices.forEach((value: number, index: number): void => {
      if (index & 1) { ctx.lineTo(x, value); } else { x = value; }
    });
    ctx.closePath();
    ctx.strokeStyle = attachment.color.toString();
    ctx.stroke();
    ctx.restore();
  }

  drawDebugData(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.PathAttachment): void {
    const ctx: CanvasRenderingContext2D = this.render.ctx;
    const bone: Spine.Bone | undefined = spine_pose.data.bones.get(slot.bone_key);
    ctx.save();
    bone && ctxApplySpace(ctx, bone.world_space);
    ctx.beginPath();
    let x: number = 0;
    attachment.vertices.forEach((value: number, index: number): void => {
      if (index & 1) { ctx.lineTo(x, value); } else { x = value; }
    });
    ctx.closePath();
    ctx.strokeStyle = attachment.color.toString();
    ctx.stroke();
    ctx.restore();
  }
}

function ctxApplySpace(ctx: CanvasRenderingContext2D, space: Spine.Space): void {
  if (space) {
    ctx.translate(space.position.x, space.position.y);
    ctx.rotate(space.rotation.rad);
    ctx.scale(space.scale.x, space.scale.y);
  }
}

function ctxApplyAtlasSitePosition(ctx: CanvasRenderingContext2D, site: Atlas.Site | null): void {
  if (site) {
    ctx.scale(1 / site.original_w, 1 / site.original_h);
    ctx.translate(2 * site.offset_x - (site.original_w - site.w), (site.original_h - site.h) - 2 * site.offset_y);
    ctx.scale(site.w, site.h);
  }
}

function ctxDrawCircle(ctx: CanvasRenderingContext2D, color: string = "grey", scale: number = 1): void {
  ctx.beginPath();
  ctx.arc(0, 0, 12 * scale, 0, 2 * Math.PI, false);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function ctxDrawPoint(ctx: CanvasRenderingContext2D, color: string = "blue", scale: number = 1): void {
  ctx.beginPath();
  ctx.arc(0, 0, 12 * scale, 0, 2 * Math.PI, false);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(24 * scale, 0);
  ctx.strokeStyle = "red";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 24 * scale);
  ctx.strokeStyle = "green";
  ctx.stroke();
}

function ctxDrawMesh(ctx: CanvasRenderingContext2D, triangles: Uint16Array, positions: Float32Array, stroke_style: string = "grey", fill_style: string = ""): void {
  ctx.beginPath();
  for (let index = 0; index < triangles.length; ) {
    const triangle0: number = triangles[index++] * 2;
    const x0: number = positions[triangle0];
    const y0: number = positions[triangle0 + 1];
    const triangle1: number = triangles[index++] * 2;
    const x1: number = positions[triangle1];
    const y1: number = positions[triangle1 + 1];
    const triangle2: number = triangles[index++] * 2;
    const x2: number = positions[triangle2];
    const y2: number = positions[triangle2 + 1];
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x0, y0);
  }
  if (fill_style) {
    ctx.fillStyle = fill_style;
    ctx.fill();
  }
  ctx.strokeStyle = stroke_style;
  ctx.stroke();
}

function ctxDrawImageMesh(ctx: CanvasRenderingContext2D, triangles: Uint16Array, positions: Float32Array, texcoords: Float32Array, image: HTMLImageElement | undefined, site: Atlas.Site | null): void {
  const page: Atlas.Page | null = site && site.page;
  const site_texmatrix: Float32Array = new Float32Array(9);
  const site_texcoord: Float32Array = new Float32Array(2);
  mat3x3Identity(site_texmatrix);
  image && mat3x3Scale(site_texmatrix, image.width, image.height);
  mat3x3ApplyAtlasPageTexcoord(site_texmatrix, page);
  mat3x3ApplyAtlasSiteTexcoord(site_texmatrix, site);

  // http://www.irrlicht3d.org/pivot/entry.php?id=1329
  for (let index = 0; index < triangles.length; ) {
    const triangle0: number = triangles[index++] * 2;
    const position0: Float32Array = positions.subarray(triangle0, triangle0 + 2);
    const x0: number = position0[0];
    const y0: number = position0[1];
    const texcoord0: Float32Array = mat3x3Transform(site_texmatrix, texcoords.subarray(triangle0, triangle0 + 2), site_texcoord);
    const u0: number = texcoord0[0];
    const v0: number = texcoord0[1];

    const triangle1: number = triangles[index++] * 2;
    const position1: Float32Array = positions.subarray(triangle1, triangle1 + 2);
    let x1: number = position1[0];
    let y1: number = position1[1];
    const texcoord1: Float32Array = mat3x3Transform(site_texmatrix, texcoords.subarray(triangle1, triangle1 + 2), site_texcoord);
    let u1: number = texcoord1[0];
    let v1: number = texcoord1[1];

    const triangle2: number = triangles[index++] * 2;
    const position2: Float32Array = positions.subarray(triangle2, triangle2 + 2);
    let x2: number = position2[0];
    let y2: number = position2[1];
    const texcoord2: Float32Array = mat3x3Transform(site_texmatrix, texcoords.subarray(triangle2, triangle2 + 2), site_texcoord);
    let u2: number = texcoord2[0];
    let v2: number = texcoord2[1];

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.clip();
    x1 -= x0; y1 -= y0;
    x2 -= x0; y2 -= y0;
    u1 -= u0; v1 -= v0;
    u2 -= u0; v2 -= v0;
    const id: number = 1 / (u1 * v2 - u2 * v1);
    const a: number = id * (v2 * x1 - v1 * x2);
    const b: number = id * (v2 * y1 - v1 * y2);
    const c: number = id * (u1 * x2 - u2 * x1);
    const d: number = id * (u1 * y2 - u2 * y1);
    const e: number = x0 - (a * u0 + c * v0);
    const f: number = y0 - (b * u0 + d * v0);
    ctx.transform(a, b, c, d, e, f);
    image && ctx.drawImage(image, 0, 0);
    ctx.restore();
  }
}

function ctxDrawIkConstraints(ctx: CanvasRenderingContext2D, spine_data: Spine.Data, bones: Spine.Map<string, Spine.Bone>): void {
  spine_data.ikcs.forEach((ikc: Spine.Ikc, ikc_key: string): void => {
    const target: Spine.Bone | undefined = bones.get(ikc.target_key);
    switch (ikc.bone_keys.length) {
      case 1:
        const bone: Spine.Bone | undefined = bones.get(ikc.bone_keys[0]);

        ctx.beginPath();
        target && ctx.moveTo(target.world_space.position.x, target.world_space.position.y);
        bone && ctx.lineTo(bone.world_space.position.x, bone.world_space.position.y);
        ctx.strokeStyle = "yellow";
        ctx.stroke();

        ctx.save();
        target && ctxApplySpace(ctx, target.world_space);
        ctxDrawCircle(ctx, "yellow", 1.5);
        ctx.restore();

        ctx.save();
        bone && ctxApplySpace(ctx, bone.world_space);
        ctxDrawCircle(ctx, "yellow", 0.5);
        ctx.restore();
        break;
      case 2:
        const parent: Spine.Bone | undefined = bones.get(ikc.bone_keys[0]);
        const child: Spine.Bone | undefined = bones.get(ikc.bone_keys[1]);

        ctx.beginPath();
        target && ctx.moveTo(target.world_space.position.x, target.world_space.position.y);
        child && ctx.lineTo(child.world_space.position.x, child.world_space.position.y);
        parent && ctx.lineTo(parent.world_space.position.x, parent.world_space.position.y);
        ctx.strokeStyle = "yellow";
        ctx.stroke();

        ctx.save();
        target && ctxApplySpace(ctx, target.world_space);
        ctxDrawCircle(ctx, "yellow", 1.5);
        ctx.restore();

        ctx.save();
        child && ctxApplySpace(ctx, child.world_space);
        ctxDrawCircle(ctx, "yellow", 0.75);
        ctx.restore();

        ctx.save();
        parent && ctxApplySpace(ctx, parent.world_space);
        ctxDrawCircle(ctx, "yellow", 0.5);
        ctx.restore();
        break;
    }
  });
}
