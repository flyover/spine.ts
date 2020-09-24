import * as Spine from "@spine";
import * as Atlas from "./atlas.js";
export declare class RenderWebGL {
    gl: WebGLRenderingContext;
    bone_map: Spine.Map<string, RenderBone>;
    skin_map: Spine.Map<string, RenderSkin>;
    textures: Spine.Map<string, RenderTexture>;
    projection: Float32Array;
    modelview: Float32Array;
    texmatrix: Float32Array;
    color: Float32Array;
    mesh_shader: RenderShader;
    ffd_mesh_shader: RenderShader;
    skin_shader_modelview_count: number;
    skin_shader_modelview_array: Float32Array;
    skin_shader_blenders_count: number;
    skin_shader: RenderShader;
    ffd_skin_shader: RenderShader;
    region_vertex_position: RenderVertex;
    region_vertex_texcoord: RenderVertex;
    constructor(gl: WebGLRenderingContext);
    loadData(spine_data: Spine.Data, atlas_data: Atlas.Data | null, images: Spine.Map<string, HTMLImageElement>): void;
    dropData(spine_data: Spine.Data, atlas_data?: Atlas.Data | null): void;
    drawPose(spine_pose: Spine.Pose, atlas_data?: Atlas.Data | null): void;
}
declare class RenderBone {
    setup_space: Spine.Space;
}
declare class RenderSkin {
    slot_map: Spine.Map<string, RenderSlot>;
}
declare class RenderSlot {
    attachment_map: Spine.Map<string, RenderAttachment>;
}
interface RenderAttachment {
    loadData(spine_data: Spine.Data, skin_key: string, slot_key: string, attachment_key: string, attachment: Spine.Attachment): RenderAttachment;
    dropData(spine_data: Spine.Data, skin_key: string, slot_key: string, attachment_key: string, attachment: Spine.Attachment): RenderAttachment;
    drawPose(spine_pose: Spine.Pose, atlas_data: Atlas.Data | null, skin_key: string, slot_key: string, slot: Spine.Slot, attachment_key: string, attachment: Spine.Attachment): void;
}
declare class RenderShader {
    vs_src: string[];
    fs_src: string[];
    vs: WebGLShader | null;
    fs: WebGLShader | null;
    program: WebGLProgram | null;
    uniforms: Map<string, WebGLUniformLocation>;
    attribs: Map<string, GLint>;
}
declare type RenderVertexType = Float32Array | Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array;
declare class RenderVertex {
    type: number;
    size: number;
    count: number;
    data: RenderVertexType;
    buffer: WebGLBuffer | null;
    buffer_type: number;
    buffer_draw: number;
}
declare class RenderTexture {
    texture: WebGLTexture | null;
}
export declare function vec4Identity(v: Float32Array): Float32Array;
export declare function vec4CopyColor(v: Float32Array, color: Spine.Color): Float32Array;
export declare function vec4ApplyColor(v: Float32Array, color: Spine.Color): Float32Array;
export declare function mat3x3Identity(m: Float32Array): Float32Array;
export declare function mat3x3Copy(m: Float32Array, other: Float32Array): Float32Array;
export declare function mat3x3Ortho(m: Float32Array, l: number, r: number, b: number, t: number): Float32Array;
export declare function mat3x3Translate(m: Float32Array, x: number, y: number): Float32Array;
export declare function mat3x3RotateCosSin(m: Float32Array, c: number, s: number): Float32Array;
export declare function mat3x3Rotate(m: Float32Array, angle: number): Float32Array;
export declare function mat3x3Scale(m: Float32Array, x: number, y: number): Float32Array;
export declare function mat3x3Transform(m: Float32Array, v: Float32Array, out: Float32Array): Float32Array;
export declare function mat3x3ApplySpace(m: Float32Array, space: Spine.Space): Float32Array;
export declare function mat3x3ApplyAtlasPageTexcoord(m: Float32Array, page: Atlas.Page | null): Float32Array;
export declare function mat3x3ApplyAtlasSiteTexcoord(m: Float32Array, site: Atlas.Site | null): Float32Array;
export declare function mat3x3ApplyAtlasSitePosition(m: Float32Array, site: Atlas.Site | null): Float32Array;
export declare function mat4x4Identity(m: Float32Array): Float32Array;
export declare function mat4x4Copy(m: Float32Array, other: Float32Array): Float32Array;
export declare function mat4x4Ortho(m: Float32Array, l: number, r: number, b: number, t: number, n: number, f: number): Float32Array;
export declare function mat4x4Translate(m: Float32Array, x: number, y: number, z?: number): Float32Array;
export declare function mat4x4RotateCosSinZ(m: Float32Array, c: number, s: number): Float32Array;
export declare function mat4x4RotateZ(m: Float32Array, angle: number): Float32Array;
export declare function mat4x4Scale(m: Float32Array, x: number, y: number, z?: number): Float32Array;
export declare function mat4x4ApplySpace(m: Float32Array, space: Spine.Space): Float32Array;
export declare function mat4x4ApplyAtlasPageTexcoord(m: Float32Array, page: Atlas.Page | null): Float32Array;
export declare function mat4x4ApplyAtlasSiteTexcoord(m: Float32Array, site: Atlas.Site | null): Float32Array;
export declare function mat4x4ApplyAtlasSitePosition(m: Float32Array, site: Atlas.Site | null): Float32Array;
export declare function glCompileShader(gl: WebGLRenderingContext, src: string[], type: number): WebGLShader | null;
export declare function glLinkProgram(gl: WebGLRenderingContext, vs: WebGLShader | null, fs: WebGLShader | null): WebGLProgram | null;
export declare function glGetUniforms(gl: WebGLRenderingContext, program: WebGLProgram | null, uniforms?: Map<string, WebGLUniformLocation>): Map<string, WebGLUniformLocation>;
export declare function glGetAttribs(gl: WebGLRenderingContext, program: WebGLProgram | null, attribs?: Map<string, number>): Map<string, number>;
export declare function glMakeShader(gl: WebGLRenderingContext, vs_src: (string | string[])[], fs_src: (string | string[])[]): RenderShader;
export declare function glDropShader(gl: WebGLRenderingContext, shader: RenderShader): void;
export declare function glMakeVertex(gl: WebGLRenderingContext, data: RenderVertexType, size: number, buffer_type: number, buffer_draw: number): RenderVertex;
export declare function glDropVertex(gl: WebGLRenderingContext, vertex: RenderVertex): void;
export declare function glMakeTexture(gl: WebGLRenderingContext, image: HTMLImageElement | undefined, min_filter: GLenum, mag_filter: GLenum, wrap_s: GLenum, wrap_t: GLenum): RenderTexture;
export declare function glDropTexture(gl: WebGLRenderingContext, texture: RenderTexture): void;
export declare function glSetupAttribute(gl: WebGLRenderingContext, shader: RenderShader, format: string, vertex: RenderVertex, count?: number): void;
export declare function glResetAttribute(gl: WebGLRenderingContext, shader: RenderShader, format: string, vertex: RenderVertex, count?: number): void;
export declare function glResetAttributes(gl: WebGLRenderingContext, shader: RenderShader): void;
export {};
