import * as spine from '../spine.ts';
import * as atlas from './atlas.ts';
import { mat3x3Identity, mat3x3Scale, mat3x3Transform, mat3x3ApplyAtlasPageTexcoord, mat3x3ApplyAtlasSiteTexcoord } from './render-webgl.ts';

class BoneInfo {
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
  public vertex_count: number;
  public vertex_position: Float32Array;
  public vertex_texcoord: Float32Array;
  public vertex_triangle: Uint16Array;
  constructor() {
    super('mesh');
  }
}

class SkinnedMeshAttachmentInfo extends AttachmentInfo {
  public vertex_count: number;
  public vertex_setup_position: Float32Array;
  public vertex_blend_position: Float32Array;
  public vertex_texcoord: Float32Array;
  public vertex_triangle: Uint16Array;
  constructor() {
    super('skinnedmesh');
  }
}

export class RenderCtx2D {
  public ctx: CanvasRenderingContext2D;
  public images: {[key: string]: HTMLImageElement} = {};
  public skin_info_map: {[key: string]: SkinInfo} = {};
  public region_vertex_position: Float32Array = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]); // [ x, y ]
  public region_vertex_texcoord: Float32Array = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]); // [ u, v ]
  public region_vertex_triangle: Uint16Array = new Uint16Array([0, 1, 2, 0, 2, 3]); // [ i0, i1, i2 ]

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public dropData(spine_data: spine.Data, atlas_data: atlas.Data): void {
    const render: RenderCtx2D = this;
    render.images = {};
    render.skin_info_map = {};
  }

  public loadData(spine_data: spine.Data, atlas_data: atlas.Data, images: {[key: string]: HTMLImageElement}): void {
    const render: RenderCtx2D = this;
    spine_data.iterateSkins(function(skin_key: string, skin: spine.Skin): void {
      const skin_info: SkinInfo = render.skin_info_map[skin_key] = new SkinInfo();
      skin.iterateAttachments(function(slot_key: string, skin_slot: spine.SkinSlot, attachment_key: string, attachment: spine.Attachment): void {
        if (!attachment) { return; }
        const slot_info: SlotInfo = skin_info.slot_info_map[slot_key] = skin_info.slot_info_map[slot_key] || new SlotInfo();
        switch (attachment.type) {
          case 'mesh': {
            const mesh_attachment: spine.MeshAttachment = <spine.MeshAttachment>attachment;
            const mesh_attachment_info: MeshAttachmentInfo = slot_info.attachment_info_map[attachment_key] = new MeshAttachmentInfo();
            const vertex_count: number = mesh_attachment_info.vertex_count = mesh_attachment.vertices.length / 2;
            const vertex_position: Float32Array = mesh_attachment_info.vertex_position = new Float32Array(mesh_attachment.vertices);
            const vertex_texcoord: Float32Array = mesh_attachment_info.vertex_texcoord = new Float32Array(mesh_attachment.uvs);
            const vertex_triangle: Uint16Array = mesh_attachment_info.vertex_triangle = new Uint16Array(mesh_attachment.triangles);
            break;
          }
          case 'skinnedmesh': {
            const skinned_mesh_attachment: spine.SkinnedMeshAttachment = <spine.SkinnedMeshAttachment>attachment;
            const skinned_mesh_attachment_info: SkinnedMeshAttachmentInfo = slot_info.attachment_info_map[attachment_key] = new SkinnedMeshAttachmentInfo();
            const vertex_count: number = skinned_mesh_attachment_info.vertex_count = skinned_mesh_attachment.uvs.length / 2;
            const vertex_setup_position: Float32Array = skinned_mesh_attachment_info.vertex_setup_position = new Float32Array(2 * vertex_count);
            const vertex_blend_position: Float32Array = skinned_mesh_attachment_info.vertex_blend_position = new Float32Array(2 * vertex_count);
            const vertex_texcoord: Float32Array = skinned_mesh_attachment_info.vertex_texcoord = new Float32Array(skinned_mesh_attachment.uvs);
            const vertex_triangle: Uint16Array = skinned_mesh_attachment_info.vertex_triangle = new Uint16Array(skinned_mesh_attachment.triangles);
            const position: spine.Vector = new spine.Vector();
            for (let vertex_index = 0, index = 0; vertex_index < vertex_count; ++vertex_index) {
              const blender_count: number = skinned_mesh_attachment.vertices[index++];
              let setup_position_x: number = 0;
              let setup_position_y: number = 0;
              for (let blender_index = 0; blender_index < blender_count; ++blender_index) {
                const bone_index: number = skinned_mesh_attachment.vertices[index++];
                const x: number = position.x = skinned_mesh_attachment.vertices[index++];
                const y: number = position.y = skinned_mesh_attachment.vertices[index++];
                const weight: number = skinned_mesh_attachment.vertices[index++];
                const bone_key: string = spine_data.bone_keys[bone_index];
                const bone: spine.Bone = spine_data.bones[bone_key];
                spine.Space.transform(bone.world_space, position, position);
                setup_position_x += position.x * weight;
                setup_position_y += position.y * weight;
              }
              let vertex_setup_position_offset: number = vertex_index * 2;
              vertex_setup_position[vertex_setup_position_offset++] = setup_position_x;
              vertex_setup_position[vertex_setup_position_offset++] = setup_position_y;
            }
            vertex_blend_position.set(vertex_setup_position);
            break;
          }
          default:
            break;
        }
      });
    });
    render.images = images;
  }

  public updatePose(spine_pose: spine.Pose, atlas_data: atlas.Data): void {
    const render: RenderCtx2D = this;
    spine_pose.iterateAttachments(function(slot_key: string, slot: spine.Slot, skin_slot: spine.SkinSlot, attachment_key: string, attachment: spine.Attachment): void {
      if (!attachment) { return; }
      const skin_info: SkinInfo = render.skin_info_map[spine_pose.skin_key];
      const default_skin_info: SkinInfo = render.skin_info_map['default'];
      const slot_info: SlotInfo = skin_info.slot_info_map[slot_key] || default_skin_info.slot_info_map[slot_key];
      switch (attachment.type) {
        case 'mesh': {
          const mesh_attachment: spine.MeshAttachment = <spine.MeshAttachment>attachment;
          const mesh_attachment_info: MeshAttachmentInfo = <MeshAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          const anim: spine.Animation = spine_pose.data.anims[spine_pose.anim_key];
          const anim_ffd: spine.AnimFfd = anim && anim.ffds && anim.ffds[spine_pose.skin_key];
          const ffd_slot: spine.FfdSlot = anim_ffd && anim_ffd.ffd_slots[slot_key];
          const ffd_attachment: spine.FfdAttachment = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
          const ffd_keyframes: spine.FfdKeyframe[] = ffd_attachment && ffd_attachment.ffd_keyframes;
          const ffd_keyframe_index: number = spine.Keyframe.find(ffd_keyframes, spine_pose.time);
          if (ffd_keyframe_index !== -1) {
            // ffd
            let pct: number = 0;
            const ffd_keyframe0: spine.FfdKeyframe = ffd_keyframes[ffd_keyframe_index];
            let ffd_keyframe1: spine.FfdKeyframe = ffd_keyframes[ffd_keyframe_index + 1];
            if (ffd_keyframe1) {
              pct = ffd_keyframe0.curve.evaluate((spine_pose.time - ffd_keyframe0.time) / (ffd_keyframe1.time - ffd_keyframe0.time));
            }
            else {
              ffd_keyframe1 = ffd_keyframe0;
            }
            for (let index = 0; index < mesh_attachment_info.vertex_position.length; ++index) {
              const v0: number = ffd_keyframe0.vertices[index - ffd_keyframe0.offset] || 0;
              const v1: number = ffd_keyframe1.vertices[index - ffd_keyframe1.offset] || 0;
              mesh_attachment_info.vertex_position[index] = mesh_attachment.vertices[index] + spine.tween(v0, v1, pct);
            }
          }
          break;
        }
        case 'skinnedmesh': {
          const skinned_mesh_attachment: spine.SkinnedMeshAttachment = <spine.SkinnedMeshAttachment>attachment;
          const skinned_mesh_attachment_info: SkinnedMeshAttachmentInfo = <SkinnedMeshAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          const anim: spine.Animation = spine_pose.data.anims[spine_pose.anim_key];
          const anim_ffd: spine.AnimFfd = anim && anim.ffds && anim.ffds[spine_pose.skin_key];
          const ffd_slot: spine.FfdSlot = anim_ffd && anim_ffd.ffd_slots[slot_key];
          const ffd_attachment: spine.FfdAttachment = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
          const ffd_keyframes: spine.FfdKeyframe[] = ffd_attachment && ffd_attachment.ffd_keyframes;
          const ffd_keyframe_index: number = spine.Keyframe.find(ffd_keyframes, spine_pose.time);
          if (ffd_keyframe_index !== -1) {
            // ffd
            let pct: number = 0;
            const ffd_keyframe0: spine.FfdKeyframe = ffd_keyframes[ffd_keyframe_index];
            let ffd_keyframe1: spine.FfdKeyframe = ffd_keyframes[ffd_keyframe_index + 1];
            if (ffd_keyframe1) {
              pct = ffd_keyframe0.curve.evaluate((spine_pose.time - ffd_keyframe0.time) / (ffd_keyframe1.time - ffd_keyframe0.time));
            } else {
              ffd_keyframe1 = ffd_keyframe0;
            }
            const vertex_blend_position: Float32Array = skinned_mesh_attachment_info.vertex_blend_position;
            const position: spine.Vector = new spine.Vector();
            for (let vertex_index = 0, index = 0, ffd_index = 0; vertex_index < skinned_mesh_attachment_info.vertex_count; ++vertex_index) {
              const blender_count: number = skinned_mesh_attachment.vertices[index++];
              let blend_position_x: number = 0;
              let blend_position_y: number = 0;
              for (let blender_index = 0; blender_index < blender_count; ++blender_index) {
                const bone_index: number = skinned_mesh_attachment.vertices[index++];
                position.x = skinned_mesh_attachment.vertices[index++];
                position.y = skinned_mesh_attachment.vertices[index++];
                const weight: number = skinned_mesh_attachment.vertices[index++];
                const bone_key: string = spine_pose.bone_keys[bone_index];
                const bone: spine.Bone = spine_pose.bones[bone_key];
                const x0: number = ffd_keyframe0.vertices[ffd_index - ffd_keyframe0.offset] || 0;
                const x1: number = ffd_keyframe1.vertices[ffd_index - ffd_keyframe1.offset] || 0;
                position.x += spine.tween(x0, x1, pct); ++ffd_index;
                const y0: number = ffd_keyframe0.vertices[ffd_index - ffd_keyframe0.offset] || 0;
                const y1: number = ffd_keyframe1.vertices[ffd_index - ffd_keyframe1.offset] || 0;
                position.y += spine.tween(y0, y1, pct); ++ffd_index;
                spine.Space.transform(bone.world_space, position, position);
                blend_position_x += position.x * weight;
                blend_position_y += position.y * weight;
              }
              let vertex_position_offset: number = vertex_index * 2;
              vertex_blend_position[vertex_position_offset++] = blend_position_x;
              vertex_blend_position[vertex_position_offset++] = blend_position_y;
            }
          } else {
            // no ffd
            const vertex_blend_position: Float32Array = skinned_mesh_attachment_info.vertex_blend_position;
            const position: spine.Vector = new spine.Vector();
            for (let vertex_index = 0, index = 0; vertex_index < skinned_mesh_attachment_info.vertex_count; ++vertex_index) {
              const blender_count: number = skinned_mesh_attachment.vertices[index++];
              let blend_position_x: number = 0;
              let blend_position_y: number = 0;
              for (let blender_index = 0; blender_index < blender_count; ++blender_index) {
                const bone_index: number = skinned_mesh_attachment.vertices[index++];
                position.x = skinned_mesh_attachment.vertices[index++];
                position.y = skinned_mesh_attachment.vertices[index++];
                const weight: number = skinned_mesh_attachment.vertices[index++];
                const bone_key: string = spine_pose.bone_keys[bone_index];
                const bone: spine.Bone = spine_pose.bones[bone_key];
                spine.Space.transform(bone.world_space, position, position);
                blend_position_x += position.x * weight;
                blend_position_y += position.y * weight;
              }
              let vertex_position_offset: number = vertex_index * 2;
              vertex_blend_position[vertex_position_offset++] = blend_position_x;
              vertex_blend_position[vertex_position_offset++] = blend_position_y;
            }
          }
          break;
        }
        default:
          break;
      }
    });
  }

  public drawPose(spine_pose: spine.Pose, atlas_data: atlas.Data): void {
    const render: RenderCtx2D = this;
    const ctx: CanvasRenderingContext2D = render.ctx;
    render.updatePose(spine_pose, atlas_data);
    spine_pose.iterateAttachments(function(slot_key: string, slot: spine.Slot, skin_slot: spine.SkinSlot, attachment_key: string, attachment: spine.Attachment): void {
      if (!attachment) { return; }
      if (attachment.type === 'boundingbox') { return; }
      const site: atlas.Site = atlas_data && atlas_data.sites[attachment_key];
      const page: atlas.Page = site && site.page;
      const image_key: string = (page && page.name) || attachment_key;
      const image: HTMLImageElement = render.images[image_key];
      if (!image || !image.complete) { return; }
      ctx.save();
      // slot.color.rgb
      ctx.globalAlpha *= slot.color.a;
      switch (slot.blend) {
        default:
        case 'normal': ctx.globalCompositeOperation = 'source-over'; break;
        case 'additive': ctx.globalCompositeOperation = 'lighter'; break;
        case 'multiply': ctx.globalCompositeOperation = 'multiply'; break;
        case 'screen': ctx.globalCompositeOperation = 'screen'; break;
      }
      const skin_info: SkinInfo = render.skin_info_map[spine_pose.skin_key];
      const default_skin_info: SkinInfo = render.skin_info_map['default'];
      const slot_info: SlotInfo = skin_info.slot_info_map[slot_key] || default_skin_info.slot_info_map[slot_key];
      switch (attachment.type) {
        case 'region': {
          const bone: spine.Bone = spine_pose.bones[slot.bone_key];
          const region_attachment: spine.RegionAttachment = <spine.RegionAttachment>attachment;
          const region_attachment_info: RegionAttachmentInfo = <RegionAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          ctxApplySpace(ctx, bone.world_space);
          ctxApplySpace(ctx, region_attachment.local_space);
          ctxApplyAtlasSitePosition(ctx, site);
          ctx.scale(region_attachment.width / 2, region_attachment.height / 2);
          ctxDrawImageMesh(ctx, render.region_vertex_triangle, render.region_vertex_position, render.region_vertex_texcoord, image, site, page);
          break;
        }
        case 'mesh': {
          const bone: spine.Bone = spine_pose.bones[slot.bone_key];
          const mesh_attachment: spine.MeshAttachment = <spine.MeshAttachment>attachment;
          const mesh_attachment_info: MeshAttachmentInfo = <MeshAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          ctxApplySpace(ctx, bone.world_space);
          ctxApplyAtlasSitePosition(ctx, site);
          ctxDrawImageMesh(ctx, mesh_attachment_info.vertex_triangle, mesh_attachment_info.vertex_position, mesh_attachment_info.vertex_texcoord, image, site, page);
          break;
        }
        case 'skinnedmesh': {
          const skinned_mesh_attachment: spine.SkinnedMeshAttachment = <spine.SkinnedMeshAttachment>attachment;
          const skinned_mesh_attachment_info: SkinnedMeshAttachmentInfo = <SkinnedMeshAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          ctxApplyAtlasSitePosition(ctx, site);
          ctxDrawImageMesh(ctx, skinned_mesh_attachment_info.vertex_triangle, skinned_mesh_attachment_info.vertex_blend_position, skinned_mesh_attachment_info.vertex_texcoord, image, site, page);
          break;
        }
        default:
          break;
      }
      ctx.restore();
    });
  }

  public drawDebugPose(spine_pose: spine.Pose, atlas_data: atlas.Data): void {
    const render: RenderCtx2D = this;
    const ctx: CanvasRenderingContext2D = render.ctx;
    render.updatePose(spine_pose, atlas_data);
    spine_pose.iterateAttachments(function(slot_key: string, slot: spine.Slot, skin_slot: spine.SkinSlot, attachment_key: string, attachment: spine.Attachment): void {
      if (!attachment) { return; }
      ctx.save();
      const skin_info: SkinInfo = render.skin_info_map[spine_pose.skin_key];
      const default_skin_info: SkinInfo = render.skin_info_map['default'];
      const slot_info: SlotInfo = skin_info.slot_info_map[slot_key] || default_skin_info.slot_info_map[slot_key];
      switch (attachment.type) {
        case 'region': {
          const bone: spine.Bone = spine_pose.bones[slot.bone_key];
          const site: atlas.Site = atlas_data && atlas_data.sites[attachment_key];
          const region_attachment: spine.RegionAttachment = <spine.RegionAttachment>attachment;
          const region_attachment_info: RegionAttachmentInfo = <RegionAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          ctxApplySpace(ctx, bone.world_space);
          ctxApplySpace(ctx, region_attachment.local_space);
          ctxApplyAtlasSitePosition(ctx, site);
          ctx.beginPath();
          ctx.rect(-region_attachment.width / 2, -region_attachment.height / 2, region_attachment.width, region_attachment.height);
          ctx.fillStyle = 'rgba(127,127,127,0.25)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(127,127,127,1.0)';
          ctx.stroke();
          break;
        }
        case 'boundingbox': {
          const bone: spine.Bone = spine_pose.bones[slot.bone_key];
          const bounding_box_attachment: spine.BoundingBoxAttachment = <spine.BoundingBoxAttachment>attachment;
          const bounding_box_attachment_info: BoundingBoxAttachmentInfo = <BoundingBoxAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          ctxApplySpace(ctx, bone.world_space);
          ctx.beginPath();
          let x: number = 0;
          bounding_box_attachment.vertices.forEach(function(value: number, index: number): void {
            if (index & 1) { ctx.lineTo(x, value); } else { x = value; }
          });
          ctx.closePath();
          ctx.strokeStyle = 'yellow';
          ctx.stroke();
          break;
        }
        case 'mesh': {
          const bone: spine.Bone = spine_pose.bones[slot.bone_key];
          const site: atlas.Site = atlas_data && atlas_data.sites[attachment_key];
          const mesh_attachment: spine.MeshAttachment = <spine.MeshAttachment>attachment;
          const mesh_attachment_info: MeshAttachmentInfo = <MeshAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          ctxApplySpace(ctx, bone.world_space);
          ctxApplyAtlasSitePosition(ctx, site);
          ctxDrawMesh(ctx, mesh_attachment_info.vertex_triangle, mesh_attachment_info.vertex_position, 'rgba(127,127,127,1.0)', 'rgba(127,127,127,0.25)');
          break;
        }
        case 'skinnedmesh': {
          const site: atlas.Site = atlas_data && atlas_data.sites[attachment_key];
          const skinned_mesh_attachment: spine.SkinnedMeshAttachment = <spine.SkinnedMeshAttachment>attachment;
          const skinned_mesh_attachment_info: SkinnedMeshAttachmentInfo = <SkinnedMeshAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          ctxApplyAtlasSitePosition(ctx, site);
          ctxDrawMesh(ctx, skinned_mesh_attachment_info.vertex_triangle, skinned_mesh_attachment_info.vertex_blend_position, 'rgba(127,127,127,1.0)', 'rgba(127,127,127,0.25)');
          break;
        }
        default:
          break;
      }
      ctx.restore();
    });
    spine_pose.iterateBones(function(bone_key: string, bone: spine.Bone): void {
      ctx.save();
      ctxApplySpace(ctx, bone.world_space);
      ctxDrawPoint(ctx);
      ctx.restore();
    });
    ctxDrawIkConstraints(ctx, spine_pose.data, spine_pose.bones);
  }

  public drawDebugData(spine_pose: spine.Pose, atlas_data: atlas.Data): void {
    const render: RenderCtx2D = this;
    const ctx: CanvasRenderingContext2D = render.ctx;
    spine_pose.data.iterateAttachments(spine_pose.skin_key, function(slot_key: string, slot: spine.Slot, skin_slot: spine.SkinSlot, attachment_key: string, attachment: spine.Attachment): void {
      if (!attachment) { return; }
      ctx.save();
      const skin_info: SkinInfo = render.skin_info_map[spine_pose.skin_key];
      const default_skin_info: SkinInfo = render.skin_info_map['default'];
      const slot_info: SlotInfo = skin_info.slot_info_map[slot_key] || default_skin_info.slot_info_map[slot_key];
      switch (attachment.type) {
        case 'region': {
          const bone: spine.Bone = spine_pose.data.bones[slot.bone_key];
          const site: atlas.Site = atlas_data && atlas_data.sites[attachment_key];
          const region_attachment: spine.RegionAttachment = <spine.RegionAttachment>attachment;
          const region_attachment_info: RegionAttachmentInfo = <RegionAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          ctxApplySpace(ctx, bone.world_space);
          ctxApplySpace(ctx, region_attachment.local_space);
          ctxApplyAtlasSitePosition(ctx, site);
          ctx.beginPath();
          ctx.rect(-region_attachment.width / 2, -region_attachment.height / 2, region_attachment.width, region_attachment.height);
          ctx.fillStyle = 'rgba(127,127,127,0.25)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(127,127,127,1.0)';
          ctx.stroke();
          break;
        }
        case 'boundingbox': {
          const bone: spine.Bone = spine_pose.data.bones[slot.bone_key];
          const bounding_box_attachment: spine.BoundingBoxAttachment = <spine.BoundingBoxAttachment>attachment;
          const bounding_box_attachment_info: BoundingBoxAttachmentInfo = <BoundingBoxAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          ctxApplySpace(ctx, bone.world_space);
          ctx.beginPath();
          let x: number = 0;
          bounding_box_attachment.vertices.forEach(function(value: number, index: number): void {
            if (index & 1) { ctx.lineTo(x, value); } else { x = value; }
          });
          ctx.closePath();
          ctx.strokeStyle = 'yellow';
          ctx.stroke();
          break;
        }
        case 'mesh': {
          const bone: spine.Bone = spine_pose.data.bones[slot.bone_key];
          const site: atlas.Site = atlas_data && atlas_data.sites[attachment_key];
          const mesh_attachment: spine.MeshAttachment = <spine.MeshAttachment>attachment;
          const mesh_attachment_info: MeshAttachmentInfo = <MeshAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          ctxApplySpace(ctx, bone.world_space);
          ctxApplyAtlasSitePosition(ctx, site);
          ctxDrawMesh(ctx, mesh_attachment_info.vertex_triangle, mesh_attachment_info.vertex_position, 'rgba(127,127,127,1.0)', 'rgba(127,127,127,0.25)');
          break;
        }
        case 'skinnedmesh': {
          const site: atlas.Site = atlas_data && atlas_data.sites[attachment_key];
          const skinned_mesh_attachment: spine.SkinnedMeshAttachment = <spine.SkinnedMeshAttachment>attachment;
          const skinned_mesh_attachment_info: SkinnedMeshAttachmentInfo = <SkinnedMeshAttachmentInfo>slot_info.attachment_info_map[attachment_key];
          ctxApplyAtlasSitePosition(ctx, site);
          ctxDrawMesh(ctx, skinned_mesh_attachment_info.vertex_triangle, skinned_mesh_attachment_info.vertex_setup_position, 'rgba(127,127,127,1.0)', 'rgba(127,127,127,0.25)');
          break;
        }
        default:
          break;
      }
      ctx.restore();
    });
    spine_pose.data.iterateBones(function(bone_key: string, bone: spine.Bone): void {
      ctx.save();
      ctxApplySpace(ctx, bone.world_space);
      ctxDrawPoint(ctx);
      ctx.restore();
    });
    ctxDrawIkConstraints(ctx, spine_pose.data, spine_pose.data.bones);
  }
}

function ctxApplySpace(ctx: CanvasRenderingContext2D, space: spine.Space): void {
  if (space) {
    ctx.translate(space.position.x, space.position.y);
    ctx.rotate(space.rotation.rad);
    ctx.scale(space.scale.x, space.scale.y);
  }
}

function ctxApplyAtlasSitePosition(ctx: CanvasRenderingContext2D, site: atlas.Site): void {
  if (site) {
    ctx.scale(1 / site.original_w, 1 / site.original_h);
    ctx.translate(2 * site.offset_x - (site.original_w - site.w), (site.original_h - site.h) - 2 * site.offset_y);
    ctx.scale(site.w, site.h);
  }
}

function ctxDrawCircle(ctx: CanvasRenderingContext2D, color: string = 'grey', scale: number = 1): void {
  ctx.beginPath();
  ctx.arc(0, 0, 12 * scale, 0, 2 * Math.PI, false);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function ctxDrawPoint(ctx: CanvasRenderingContext2D, color: string = 'blue', scale: number = 1): void {
  ctx.beginPath();
  ctx.arc(0, 0, 12 * scale, 0, 2 * Math.PI, false);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(24 * scale, 0);
  ctx.strokeStyle = 'red';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 24 * scale);
  ctx.strokeStyle = 'green';
  ctx.stroke();
}

function ctxDrawMesh(ctx: CanvasRenderingContext2D, triangles: Float32Array, positions: Float32Array, stroke_style: string = 'grey', fill_style: string = ''): void {
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

function ctxDrawImageMesh(ctx: CanvasRenderingContext2D, triangles: Uint16Array, positions: Float32Array, texcoords: Float32Array, image: HTMLImageElement, site: atlas.Site, page: atlas.Page): void {
  const site_texmatrix: Float32Array = new Float32Array(9);
  const site_texcoord: Float32Array = new Float32Array(2);
  mat3x3Identity(site_texmatrix);
  mat3x3Scale(site_texmatrix, image.width, image.height);
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
    ctx.drawImage(image, 0, 0);
    ctx.restore();
  }
}

function ctxDrawIkConstraints(ctx: CanvasRenderingContext2D, data: spine.Data, bones: {[key: string]: spine.Bone}): void {
  data.ikc_keys.forEach(function(ikc_key: string): void {
    const ikc: spine.Ikc = data.ikcs[ikc_key];
    const target: spine.Bone = bones[ikc.target_key];
    switch (ikc.bone_keys.length) {
      case 1:
        const bone: spine.Bone = bones[ikc.bone_keys[0]];

        ctx.beginPath();
        ctx.moveTo(target.world_space.position.x, target.world_space.position.y);
        ctx.lineTo(bone.world_space.position.x, bone.world_space.position.y);
        ctx.strokeStyle = 'yellow';
        ctx.stroke();

        ctx.save();
        ctxApplySpace(ctx, target.world_space);
        ctxDrawCircle(ctx, 'yellow', 1.5);
        ctx.restore();

        ctx.save();
        ctxApplySpace(ctx, bone.world_space);
        ctxDrawCircle(ctx, 'yellow', 0.5);
        ctx.restore();
        break;
      case 2:
        const parent: spine.Bone = bones[ikc.bone_keys[0]];
        const child: spine.Bone = bones[ikc.bone_keys[1]];

        ctx.beginPath();
        ctx.moveTo(target.world_space.position.x, target.world_space.position.y);
        ctx.lineTo(child.world_space.position.x, child.world_space.position.y);
        ctx.lineTo(parent.world_space.position.x, parent.world_space.position.y);
        ctx.strokeStyle = 'yellow';
        ctx.stroke();

        ctx.save();
        ctxApplySpace(ctx, target.world_space);
        ctxDrawCircle(ctx, 'yellow', 1.5);
        ctx.restore();

        ctx.save();
        ctxApplySpace(ctx, child.world_space);
        ctxDrawCircle(ctx, 'yellow', 0.75);
        ctx.restore();

        ctx.save();
        ctxApplySpace(ctx, parent.world_space);
        ctxDrawCircle(ctx, 'yellow', 0.5);
        ctx.restore();
        break;
      default:
        break;
    }
  });
}
