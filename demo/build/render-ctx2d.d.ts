import * as Spine from "@spine";
import * as Atlas from "./atlas.js";
export declare class RenderCtx2D {
    ctx: CanvasRenderingContext2D;
    images: Spine.Map<string, HTMLImageElement>;
    skin_map: Spine.Map<string, RenderSkin>;
    region_vertex_position: Float32Array;
    region_vertex_texcoord: Float32Array;
    region_vertex_triangle: Uint16Array;
    constructor(ctx: CanvasRenderingContext2D);
    loadData(spine_data: Spine.Data, atlas_data: Atlas.Data | null | undefined, images: Spine.Map<string, HTMLImageElement>): void;
    dropData(spine_data: Spine.Data, atlas_data?: Atlas.Data | null): void;
    updatePose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null): void;
    drawPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null): void;
    drawDebugPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null): void;
    drawDebugData(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null): void;
}
declare class RenderSkin {
    slot_map: Spine.Map<string, RenderSlot>;
}
declare class RenderSlot {
    attachment_map: Spine.Map<string, RenderAttachment>;
}
interface RenderAttachment {
    loadData(spine_data: Spine.Data, attachment: Spine.Attachment): RenderAttachment;
    dropData(spine_data: Spine.Data, attachment: Spine.Attachment): RenderAttachment;
    updatePose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot_key: string, attachment_key: string, attachment: Spine.Attachment): void;
    drawPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.Attachment): void;
    drawDebugPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.Attachment): void;
    drawDebugData(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, slot: Spine.Slot, attachment_key: string, attachment: Spine.Attachment): void;
}
export {};
