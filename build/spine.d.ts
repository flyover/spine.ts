/**
 * Copyright (c) Flyover Games, LLC
 *
 * Isaac Burns isaacburns@gmail.com
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to
 * whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall
 * be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
 * KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * A TypeScript API for the Spine JSON animation data format.
 */
export declare let EPSILON: number;
export { SpineMap as Map };
declare class SpineMap<K, V> {
    private _keys;
    private _map;
    constructor(...args: any[]);
    get keys(): K[];
    get size(): number;
    [Symbol.iterator](): IterableIterator<[K, V]>;
    clear(): void;
    key(index: number): K;
    has(key: K): boolean;
    hasByIndex(index: number): boolean;
    get(key: K): V | undefined;
    getByIndex(index: number): V | undefined;
    set(key: K, value: V): V;
    setByIndex(index: number, value: V): V;
    delete(key: K): boolean;
    deleteByIndex(index: number): void;
    forEach(callback: (value: V, key: K, index: number, map: SpineMap<K, V>) => void): void;
    map<T>(callback: (value: V, key: K, index: number, map: SpineMap<K, V>) => T): T[];
    sortKeys(callback: (a: K, b: K) => number): void;
}
export declare function loadBool(json: {
    [key: string]: any;
}, key: string | number, def?: boolean): boolean;
export declare function saveBool(json: {
    [key: string]: any;
}, key: string | number, value: boolean, def?: boolean): void;
export declare function loadFloat(json: {
    [key: string]: any;
}, key: string | number, def?: number): number;
export declare function saveFloat(json: {
    [key: string]: any;
}, key: string | number, value: number, def?: number): void;
export declare function loadInt(json: {
    [key: string]: any;
}, key: string | number, def?: number): number;
export declare function saveInt(json: {
    [key: string]: any;
}, key: string | number, value: number, def?: number): void;
export declare function loadString(json: {
    [key: string]: any;
}, key: string | number, def?: string): string;
export declare function saveString(json: {
    [key: string]: any;
}, key: string | number, value: string, def?: string): void;
export declare class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    static copy(color: Color, out?: Color): Color;
    copy(other: Color): this;
    load(json?: ColorJSON, def?: number): this;
    toString(): string;
    static tween(a: Color, b: Color, pct: number, out?: Color): Color;
    tween(other: Color, pct: number, out?: Color): Color;
    selfTween(other: Color, pct: number): this;
}
export declare type ColorJSON = number | string;
export declare function BezierCurve(x1: number, y1: number, x2: number, y2: number, epsilon?: number): (t: number) => number;
export declare function StepBezierCurve(cx1: number, cy1: number, cx2: number, cy2: number): (t: number) => number;
export declare class Curve {
    evaluate: (t: number) => number;
    load(json?: CurveJSON): this;
}
export declare type CurveJSON = string | number[];
export declare function sign(n: number): number;
export declare function wrap(num: number, min: number, max: number): number;
export declare function tween(a: number, b: number, t: number): number;
export declare function wrapAngleRadians(angle: number): number;
export declare function tweenAngleRadians(a: number, b: number, t: number): number;
export declare class Angle {
    _rad: number;
    _cos: number;
    _sin: number;
    constructor(rad?: number);
    get rad(): number;
    set rad(value: number);
    get deg(): number;
    set deg(value: number);
    get cos(): number;
    get sin(): number;
    static copy(angle: Angle, out?: Angle): Angle;
    copy(other: Angle): Angle;
    static equal(a: Angle, b: Angle, epsilon?: number): boolean;
    equal(other: Angle, epsilon?: number): boolean;
    static tween(a: Angle, b: Angle, pct: number, out?: Angle): Angle;
    tween(other: Angle, pct: number, out?: Angle): Angle;
    selfTween(other: Angle, pct: number): this;
}
export declare class Vector {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    static copy(v: Vector, out?: Vector): Vector;
    copy(other: Vector): Vector;
    static equal(a: Vector, b: Vector, epsilon?: number): boolean;
    equal(other: Vector, epsilon?: number): boolean;
    static negate(v: Vector, out?: Vector): Vector;
    static add(a: Vector, b: Vector, out?: Vector): Vector;
    add(other: Vector, out?: Vector): Vector;
    selfAdd(other: Vector): this;
    static subtract(a: Vector, b: Vector, out?: Vector): Vector;
    subtract(other: Vector, out?: Vector): Vector;
    selfSubtract(other: Vector): this;
    static scale(v: Vector, x: number, y?: number, out?: Vector): Vector;
    scale(x: number, y?: number, out?: Vector): Vector;
    selfScale(x: number, y?: number): this;
    static tween(a: Vector, b: Vector, pct: number, out?: Vector): Vector;
    tween(other: Vector, pct: number, out?: Vector): Vector;
    selfTween(other: Vector, pct: number): this;
}
export declare class Matrix {
    a: number;
    b: number;
    c: number;
    d: number;
    static copy(m: Matrix, out?: Matrix): Matrix;
    copy(other: Matrix): Matrix;
    static equal(a: Matrix, b: Matrix, epsilon?: number): boolean;
    equal(other: Matrix, epsilon?: number): boolean;
    static determinant(m: Matrix): number;
    static identity(out?: Matrix): Matrix;
    static multiply(a: Matrix, b: Matrix, out?: Matrix): Matrix;
    static invert(m: Matrix, out?: Matrix): Matrix;
    static combine(a: Matrix, b: Matrix, out: Matrix): Matrix;
    static extract(ab: Matrix, a: Matrix, out: Matrix): Matrix;
    selfRotate(cos: number, sin: number): this;
    static rotate(m: Matrix, cos: number, sin: number, out?: Matrix): Matrix;
    static scale(m: Matrix, x: number, y: number, out?: Matrix): Matrix;
    static transform(m: Matrix, v: Vector, out?: Vector): Vector;
    static untransform(m: Matrix, v: Vector, out?: Vector): Vector;
    static tween(a: Matrix, b: Matrix, pct: number, out?: Matrix): Matrix;
    tween(other: Matrix, pct: number, out?: Matrix): Matrix;
    selfTween(other: Matrix, pct: number): this;
}
export declare class Affine {
    readonly vector: Vector;
    readonly matrix: Matrix;
    static copy(affine: Affine, out?: Affine): Affine;
    copy(other: Affine): Affine;
    static equal(a: Affine, b: Affine, epsilon?: number): boolean;
    equal(other: Affine, epsilon?: number): boolean;
    static identity(out?: Affine): Affine;
    static invert(affine: Affine, out?: Affine): Affine;
    static combine(a: Affine, b: Affine, out?: Affine): Affine;
    static extract(ab: Affine, a: Affine, out?: Affine): Affine;
    static transform(affine: Affine, v: Vector, out?: Vector): Vector;
    static untransform(affine: Affine, v: Vector, out?: Vector): Vector;
}
export declare class Position extends Vector {
    constructor();
}
export declare class Rotation extends Angle {
    readonly matrix: Matrix;
    updateMatrix(m?: Matrix): Matrix;
}
export declare class Scale extends Matrix {
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
}
export declare class Shear {
    readonly x: Angle;
    readonly y: Angle;
    readonly matrix: Matrix;
    updateMatrix(m?: Matrix): Matrix;
    static copy(shear: Shear, out?: Shear): Shear;
    copy(other: Shear): Shear;
    static equal(a: Shear, b: Shear, epsilon?: number): boolean;
    equal(other: Shear, epsilon?: number): boolean;
    static tween(a: Shear, b: Shear, pct: number, out?: Shear): Shear;
    tween(other: Shear, pct: number, out?: Shear): Shear;
    selfTween(other: Shear, pct: number): this;
}
export declare class Space {
    readonly position: Position;
    readonly rotation: Rotation;
    readonly scale: Scale;
    readonly shear: Shear;
    readonly affine: Affine;
    updateAffine(affine?: Affine): Affine;
    static copy(space: Space, out?: Space): Space;
    copy(other: Space): Space;
    load(json: SpaceJSON): this;
    static equal(a: Space, b: Space, epsilon?: number): boolean;
    equal(other: Space, epsilon?: number): boolean;
    static identity(out?: Space): Space;
    static translate(space: Space, x: number, y: number): Space;
    static rotate(space: Space, rad: number): Space;
    static scale(space: Space, x: number, y: number): Space;
    static invert(space: Space, out?: Space): Space;
    static combine(a: Space, b: Space, out?: Space): Space;
    static extract(ab: Space, a: Space, out?: Space): Space;
    static transform(space: Space, v: Vector, out?: Vector): Vector;
    static untransform(space: Space, v: Vector, out?: Vector): Vector;
    static tween(a: Space, b: Space, pct: number, out?: Space): Space;
    tween(other: Space, pct: number, out?: Space): Space;
    selfTween(other: Space, pct: number): this;
}
export interface SpaceJSON {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    shearX: number;
    shearY: number;
}
export declare class Bone {
    readonly color: Color;
    parent_key: string;
    length: number;
    readonly local_space: Space;
    readonly world_space: Space;
    inherit_rotation: boolean;
    inherit_scale: boolean;
    transform: string;
    copy(other: Bone): this;
    load(json: BoneJSON): this;
    static flatten(bone: Bone, bones: SpineMap<string, Bone>): Bone;
}
export interface BoneJSON extends SpaceJSON {
    name: string;
    color?: ColorJSON;
    parent?: string;
    length?: number;
    inheritRotation?: boolean;
    inheritScale?: boolean;
    transform?: string;
}
export declare class Constraint {
    order: number;
    load(json: ConstraintJSON): this;
}
export interface ConstraintJSON {
    name: string;
    order: number;
}
export declare class Ikc extends Constraint {
    bone_keys: string[];
    target_key: string;
    mix: number;
    bend_positive: boolean;
    load(json: IkcJSON): this;
}
export interface IkcJSON extends ConstraintJSON {
    bones: string[];
    target: string;
    mix: number;
    bendPositive: boolean;
}
export declare class Xfc extends Constraint {
    bone_keys: string[];
    target_key: string;
    position_mix: number;
    readonly position: Position;
    rotation_mix: number;
    readonly rotation: Rotation;
    scale_mix: number;
    readonly scale: Scale;
    shear_mix: number;
    readonly shear: Shear;
    load(json: XfcJSON): this;
}
export interface XfcJSON extends ConstraintJSON {
    bones: string[];
    target: string;
    translateMix: number;
    x: number;
    y: number;
    rotateMix: number;
    rotation: number;
    scaleMix: number;
    scaleX: number;
    scaleY: number;
    shearMix: number;
    shearX: number;
    shearY: number;
}
export declare class Ptc extends Constraint {
    bone_keys: string[];
    target_key: string;
    spacing_mode: string;
    spacing: number;
    position_mode: string;
    position_mix: number;
    position: number;
    rotation_mode: string;
    rotation_mix: number;
    readonly rotation: Rotation;
    load(json: PtcJSON): this;
}
export interface PtcJSON extends ConstraintJSON {
    bones: string[];
    target: string;
    spacingMode: string;
    spacing: number;
    positionMode: string;
    translateMix: number;
    position: number;
    rotateMode: string;
    rotateMix: number;
    rotation: number;
}
export declare type BlendMode = "normal" | "additive" | "multiply" | "screen";
export declare class Slot {
    bone_key: string;
    readonly color: Color;
    attachment_key: string;
    blend: BlendMode;
    copy(other: Slot): this;
    load(json: SlotJSON): this;
}
export interface SlotJSON {
    name: string;
    bone: string;
    color?: ColorJSON;
    attachment: string;
    blend?: BlendMode;
}
export declare type AttachmentType = "region" | "boundingbox" | "mesh" | "linkedmesh" | "skinnedmesh" | "weightedmesh" | "path" | "clipping";
export declare class Attachment {
    type: AttachmentType | "";
    name: string;
    constructor(type: AttachmentType);
    load(json: AttachmentJSON): this;
}
export interface AttachmentJSON {
    type: AttachmentType;
    name?: string;
}
export declare class RegionAttachment extends Attachment {
    path: string;
    readonly color: Color;
    readonly local_space: Space;
    width: number;
    height: number;
    constructor();
    load(json: RegionAttachmentJSON): this;
}
export interface RegionAttachmentJSON extends AttachmentJSON, SpaceJSON {
    path?: string;
    color?: ColorJSON;
    width?: number;
    height?: number;
}
export declare class BoundingBoxAttachment extends Attachment {
    readonly color: Color;
    vertex_count: number;
    vertices: number[];
    constructor();
    load(json: BoundingBoxAttachmentJSON): this;
}
export interface BoundingBoxAttachmentJSON extends AttachmentJSON {
    color?: ColorJSON;
    vertexCount: number;
    vertices: number[];
}
export declare class MeshAttachment extends Attachment {
    path: string;
    readonly color: Color;
    triangles: number[];
    edges: number[];
    vertices: number[];
    uvs: number[];
    hull: number;
    constructor();
    load(json: MeshAttachmentJSON): this;
}
export interface MeshAttachmentJSON extends AttachmentJSON {
    path?: string;
    color?: ColorJSON;
    triangles: number[];
    edges?: number[];
    vertices: number[];
    uvs: number[];
    hull: number;
}
export declare class LinkedMeshAttachment extends Attachment {
    readonly color: Color;
    skin_key: string;
    parent_key: string;
    inherit_deform: boolean;
    width: number;
    height: number;
    constructor();
    load(json: LinkedMeshAttachmentJSON): this;
}
export interface LinkedMeshAttachmentJSON extends AttachmentJSON {
    color?: ColorJSON;
    skin?: string;
    parent: string;
    deform?: boolean;
    width?: number;
    height?: number;
}
export declare class WeightedMeshAttachment extends Attachment {
    path: string;
    readonly color: Color;
    triangles: number[];
    edges: number[];
    vertices: number[];
    uvs: number[];
    hull: number;
    constructor();
    load(json: WeightedMeshAttachmentJSON): this;
}
export interface WeightedMeshAttachmentJSON extends AttachmentJSON {
    path?: string;
    color?: ColorJSON;
    triangles: number[];
    edges: number[];
    vertices: number[];
    uvs: number[];
    hull: number;
}
export declare class PathAttachment extends Attachment {
    readonly color: Color;
    closed: boolean;
    accurate: boolean;
    lengths: number[];
    vertex_count: number;
    vertices: number[];
    constructor();
    load(json: PathAttachmentJSON): this;
}
export interface PathAttachmentJSON extends AttachmentJSON {
    color?: ColorJSON;
    closed?: boolean;
    constantSpeed?: boolean;
    lengths: number[];
    vertexCount: number;
    vertices: number[];
}
export declare class ClippingAttachment extends Attachment {
    readonly color: Color;
    end: string;
    vertex_count: number;
    vertices: number[];
    constructor();
    load(json: ClippingAttachmentJSON): this;
}
export interface ClippingAttachmentJSON extends AttachmentJSON {
    color?: ColorJSON;
    end: string;
    vertexCount: number;
    vertices: number[];
}
export declare class SkinSlot {
    readonly attachments: SpineMap<string, Attachment>;
    load(json: SkinSlotJSON): this;
}
export declare type SkinSlotJSON = {
    [key: string]: AttachmentJSON;
};
export declare class Skin {
    name: string;
    readonly slots: SpineMap<string, SkinSlot>;
    load(json: SkinJSON): this;
    iterateAttachments(callback: (slot_key: string, skin_slot: SkinSlot, attachment_key: string, attachment: Attachment) => void): void;
    forEachAttachment(callback: (attachment: Attachment, attachment_key: string, skin_slot: SkinSlot, slot_key: string) => void): void;
    mapAttachments<T>(callback: (attachment: Attachment, attachment_key: string, skin_slot: SkinSlot, slot_key: string) => T): T[];
}
export declare type SkinJSON = {
    [key: string]: SkinSlotJSON;
};
export declare class Event {
    int_value: number;
    float_value: number;
    string_value: string;
    copy(other: Event): this;
    load(json: EventJSON): this;
}
export interface EventJSON {
    int?: number;
    float?: number;
    string?: string;
}
export declare class Range {
    min: number;
    max: number;
    get length(): number;
    reset(): this;
    wrap(value: number): number;
    expandPoint(value: number): number;
    expandRange(range: Range): Range;
}
export declare abstract class Keyframe {
    time: number;
    free(): void;
    load(json: KeyframeJSON): this;
    save(json: KeyframeJSON): this;
    static find(array: Keyframe[] | undefined, time: number): number;
    static compare(a: Keyframe, b: Keyframe): number;
    static interpolate(keyframe0: Keyframe | undefined, keyframe1: Keyframe | undefined, time: number): number;
    static evaluate<T extends Keyframe>(keyframes: T[], time: number, callback: (keyframe0: T, keyframe1: T, k: number, keyframe0_index: number, keyframe1_index: number) => void): void;
}
export interface KeyframeJSON {
    time: number;
}
export declare type KeyframeConstructor<T extends Keyframe> = {
    new (): T;
};
export declare class Timeline<T extends Keyframe> {
    readonly range: Range;
    keyframes: T[];
    load(json: KeyframeJSON[], ctor: KeyframeConstructor<T>): this;
    static evaluate<T extends Keyframe>(timeline: Timeline<T>, time: number, callback: (keyframe0: T, keyframe1: T, k: number, keyframe0_index: number, keyframe1_index: number) => void): void;
}
export declare class CurveKeyframe extends Keyframe {
    readonly curve: Curve;
    load(json: CurveKeyframeJSON): this;
    static interpolate(curve_keyframe0: CurveKeyframe | undefined, curve_keyframe1: CurveKeyframe | undefined, time: number): number;
}
export interface CurveKeyframeJSON extends KeyframeJSON {
    curve?: CurveJSON;
}
export declare class BonePositionKeyframe extends CurveKeyframe {
    readonly position: Position;
    load(json: BonePositionKeyframeJSON): this;
}
export interface BonePositionKeyframeJSON extends CurveKeyframeJSON {
    x?: number;
    y?: number;
}
export declare class BonePositionTimeline extends Timeline<BonePositionKeyframe> {
    load(json: BonePositionTimelineJSON): this;
}
export declare type BonePositionTimelineJSON = BonePositionKeyframeJSON[];
export declare class BoneRotationKeyframe extends CurveKeyframe {
    readonly rotation: Rotation;
    load(json: BoneRotationKeyframeJSON): this;
}
export interface BoneRotationKeyframeJSON extends CurveKeyframeJSON {
    angle?: number;
}
export declare class BoneRotationTimeline extends Timeline<BoneRotationKeyframe> {
    load(json: BoneRotationTimelineJSON): this;
}
export declare type BoneRotationTimelineJSON = BoneRotationKeyframeJSON[];
export declare class BoneScaleKeyframe extends CurveKeyframe {
    readonly scale: Scale;
    load(json: BoneScaleKeyframeJSON): this;
}
export interface BoneScaleKeyframeJSON extends CurveKeyframeJSON {
    x?: number;
    y?: number;
}
export declare class BoneScaleTimeline extends Timeline<BoneScaleKeyframe> {
    load(json: BoneScaleTimelineJSON): this;
}
export declare type BoneScaleTimelineJSON = BoneScaleKeyframeJSON[];
export declare class BoneShearKeyframe extends CurveKeyframe {
    readonly shear: Shear;
    load(json: BoneShearKeyframeJSON): this;
}
export interface BoneShearKeyframeJSON extends CurveKeyframeJSON {
    x?: number;
    y?: number;
}
export declare class BoneShearTimeline extends Timeline<BoneShearKeyframe> {
    load(json: BoneShearTimelineJSON): this;
}
export declare type BoneShearTimelineJSON = BoneShearKeyframeJSON[];
export declare class BoneTimeline {
    readonly range: Range;
    position_timeline?: BonePositionTimeline;
    rotation_timeline?: BoneRotationTimeline;
    scale_timeline?: BoneScaleTimeline;
    shear_timeline?: BoneShearTimeline;
    load(json: BoneTimelineJSON): this;
}
export interface BoneTimelineJSON {
    translate: BonePositionTimelineJSON;
    rotate: BoneRotationTimelineJSON;
    scale: BoneScaleTimelineJSON;
    shear: BoneShearTimelineJSON;
}
export declare class SlotColorKeyframe extends CurveKeyframe {
    readonly color: Color;
    load(json: SlotColorKeyframeJSON): this;
}
export interface SlotColorKeyframeJSON extends CurveKeyframeJSON {
    color?: ColorJSON;
}
export declare class SlotColorTimeline extends Timeline<SlotColorKeyframe> {
    load(json: SlotColorTimelineJSON): this;
}
export declare type SlotColorTimelineJSON = SlotColorKeyframeJSON[];
export declare class SlotAttachmentKeyframe extends Keyframe {
    name: string;
    load(json: SlotAttachmentKeyframeJSON): this;
}
export interface SlotAttachmentKeyframeJSON extends KeyframeJSON {
    name: string;
}
export declare class SlotAttachmentTimeline extends Timeline<SlotAttachmentKeyframe> {
    load(json: SlotAttachmentTimelineJSON): this;
}
export declare type SlotAttachmentTimelineJSON = SlotAttachmentKeyframeJSON[];
export declare class SlotTimeline {
    readonly range: Range;
    color_timeline?: SlotColorTimeline;
    attachment_timeline?: SlotAttachmentTimeline;
    load(json: SlotTimelineJSON): this;
}
export interface SlotTimelineJSON {
    color: SlotColorTimelineJSON;
    attachment: SlotAttachmentTimelineJSON;
}
export declare class EventKeyframe extends Keyframe {
    name: string;
    readonly event: Event;
    load(json: EventKeyframeJSON): this;
}
export interface EventKeyframeJSON extends EventJSON, KeyframeJSON {
}
export declare class EventTimeline extends Timeline<EventKeyframe> {
    load(json: EventTimelineJSON): this;
}
export declare type EventTimelineJSON = EventKeyframeJSON[];
export declare class SlotOffset {
    slot_key: string;
    offset: number;
    load(json: SlotOffsetJSON): this;
}
export interface SlotOffsetJSON {
    slot: string;
    offset: number;
}
export declare class OrderKeyframe extends Keyframe {
    slot_offsets: SlotOffset[];
    load(json: OrderKeyframeJSON): this;
}
export interface OrderKeyframeJSON extends KeyframeJSON {
    offsets?: SlotOffsetJSON[];
}
export declare class OrderTimeline extends Timeline<OrderKeyframe> {
    load(json: OrderTimelineJSON): this;
}
export declare type OrderTimelineJSON = OrderKeyframeJSON[];
export declare class IkcKeyframe extends CurveKeyframe {
    mix: number;
    bend_positive: boolean;
    load(json: IkcKeyframeJSON): this;
}
export interface IkcKeyframeJSON extends CurveKeyframeJSON {
    mix?: number;
    bendPositive?: boolean;
}
export declare class IkcTimeline extends Timeline<IkcKeyframe> {
    load(json: IkcTimelineJSON): this;
}
export declare type IkcTimelineJSON = IkcKeyframeJSON[];
export declare class XfcKeyframe extends CurveKeyframe {
    position_mix: number;
    rotation_mix: number;
    scale_mix: number;
    shear_mix: number;
    load(json: XfcKeyframeJSON): this;
}
export interface XfcKeyframeJSON extends CurveKeyframeJSON {
    translateMix?: number;
    rotateMix?: number;
    scaleMix?: number;
    shearMix?: number;
}
export declare class XfcTimeline extends Timeline<XfcKeyframe> {
    load(json: XfcTimelineJSON): this;
}
export declare type XfcTimelineJSON = XfcKeyframeJSON[];
export declare class PtcMixKeyframe extends CurveKeyframe {
    position_mix: number;
    rotation_mix: number;
    load(json: PtcMixKeyframeJSON): this;
}
export interface PtcMixKeyframeJSON extends CurveKeyframeJSON {
    translateMix?: number;
    rotateMix?: number;
}
export declare class PtcMixTimeline extends Timeline<PtcMixKeyframe> {
    load(json: PtcMixTimelineJSON): this;
}
export declare type PtcMixTimelineJSON = PtcMixKeyframeJSON[];
export declare class PtcSpacingKeyframe extends CurveKeyframe {
    spacing: number;
    load(json: PtcSpacingKeyframeJSON): this;
}
export interface PtcSpacingKeyframeJSON extends CurveKeyframeJSON {
    spacing?: number;
}
export declare class PtcSpacingTimeline extends Timeline<PtcSpacingKeyframe> {
    load(json: PtcSpacingTimelineJSON): this;
}
export declare type PtcSpacingTimelineJSON = PtcSpacingKeyframeJSON[];
export declare class PtcPositionKeyframe extends CurveKeyframe {
    position: number;
    load(json: PtcPositionKeyframeJSON): this;
}
export interface PtcPositionKeyframeJSON extends CurveKeyframeJSON {
    position?: number;
}
export declare class PtcPositionTimeline extends Timeline<PtcPositionKeyframe> {
    load(json: PtcPositionTimelineJSON): this;
}
export declare type PtcPositionTimelineJSON = PtcPositionKeyframeJSON[];
export declare class PtcRotationKeyframe extends CurveKeyframe {
    readonly rotation: Rotation;
    load(json: PtcRotationKeyframeJSON): this;
}
export interface PtcRotationKeyframeJSON extends CurveKeyframeJSON {
    rotation?: number;
}
export declare class PtcRotationTimeline extends Timeline<PtcRotationKeyframe> {
    load(json: PtcRotationTimelineJSON): this;
}
export declare type PtcRotationTimelineJSON = PtcRotationKeyframeJSON[];
export interface PtcTimelineJSON {
    mix: PtcMixTimelineJSON;
    spacing: PtcSpacingTimelineJSON;
    position: PtcPositionTimelineJSON;
    rotation: PtcRotationTimelineJSON;
}
export declare class PtcTimeline {
    readonly range: Range;
    ptc_mix_timeline?: PtcMixTimeline;
    ptc_spacing_timeline?: PtcSpacingTimeline;
    ptc_position_timeline?: PtcPositionTimeline;
    ptc_rotation_timeline?: PtcRotationTimeline;
    load(json: PtcTimelineJSON): this;
}
export declare class FfdKeyframe extends CurveKeyframe {
    offset: number;
    vertices: number[];
    load(json: FfdKeyframeJSON): this;
}
export interface FfdKeyframeJSON extends CurveKeyframeJSON {
    offset?: number;
    vertices: number[];
}
export declare class FfdTimeline extends Timeline<FfdKeyframe> {
    load(json: FfdTimelineJSON): this;
}
export declare type FfdTimelineJSON = FfdKeyframeJSON[];
export declare class FfdAttachment {
    readonly ffd_timeline: FfdTimeline;
    load(json: FfdAttachmentJSON): this;
}
export interface FfdAttachmentJSON extends FfdTimelineJSON {
}
export declare class FfdSlot {
    readonly ffd_attachments: SpineMap<string, FfdAttachment>;
    load(json: FfdSlotJSON): this;
    iterateAttachments(callback: (ffd_attachment_key: string, ffd_attachment: FfdAttachment) => void): void;
    forEachAttachment(callback: (ffd_attachment: FfdAttachment, ffd_attachment_key: string) => void): void;
}
export declare type FfdSlotJSON = {
    [key: string]: FfdAttachmentJSON;
};
export declare class FfdSkin {
    readonly ffd_slots: SpineMap<string, FfdSlot>;
    load(json: FfdSkinJSON): this;
    iterateAttachments(callback: (ffd_slot_key: string, ffd_slot: FfdSlot, ffd_attachment_key: string, ffd_attachment: FfdAttachment) => void): void;
    forEachAttachment(callback: (ffd_attachment: FfdAttachment, ffd_attachment_key: string, ffd_slot: FfdSlot, ffd_slot_key: string) => void): void;
}
export declare type FfdSkinJSON = {
    [key: string]: FfdSlotJSON;
};
export declare class Animation {
    readonly range: Range;
    readonly bone_timeline_map: SpineMap<string, BoneTimeline>;
    readonly slot_timeline_map: SpineMap<string, SlotTimeline>;
    event_timeline?: EventTimeline;
    order_timeline?: OrderTimeline;
    readonly ikc_timeline_map: SpineMap<string, IkcTimeline>;
    readonly xfc_timeline_map: SpineMap<string, XfcTimeline>;
    readonly ptc_timeline_map: SpineMap<string, PtcTimeline>;
    readonly ffd_skins: SpineMap<string, FfdSkin>;
    load(json: AnimationJSON): this;
}
export interface AnimationJSON {
    bones: {
        [key: string]: BoneTimelineJSON;
    };
    slots: {
        [key: string]: SlotTimelineJSON;
    };
    events: EventTimelineJSON;
    draworder: OrderTimelineJSON;
    drawOrder: OrderTimelineJSON;
    ik: {
        [key: string]: IkcTimelineJSON;
    };
    transform: {
        [key: string]: XfcTimelineJSON;
    };
    paths: {
        [key: string]: PtcTimelineJSON;
    };
    deform: {
        [key: string]: FfdSkinJSON;
    };
    ffd: {
        [key: string]: FfdSkinJSON;
    };
}
export declare class Skeleton {
    hash: string;
    spine: string;
    width: number;
    height: number;
    images: string;
    load(json: SkeletonJSON): this;
}
export interface SkeletonJSON {
    hash?: string;
    spine?: string;
    width?: number;
    height?: number;
    images?: string;
}
export declare class Data {
    name: string;
    readonly skeleton: Skeleton;
    readonly bones: SpineMap<string, Bone>;
    readonly ikcs: SpineMap<string, Ikc>;
    readonly xfcs: SpineMap<string, Xfc>;
    readonly ptcs: SpineMap<string, Ptc>;
    readonly slots: SpineMap<string, Slot>;
    readonly skins: SpineMap<string, Skin>;
    readonly events: SpineMap<string, Event>;
    readonly anims: SpineMap<string, Animation>;
    free(): void;
    load(json: DataJSON): this;
    save(json?: DataJSON): DataJSON;
    loadSkeleton(json: SkeletonJSON): this;
    loadEvent(name: string, json: EventJSON): this;
    loadAnimation(name: string, json: AnimationJSON): this;
    getSkins(): SpineMap<string, Skin>;
    getEvents(): SpineMap<string, Event>;
    getAnims(): SpineMap<string, Animation>;
    iterateBones(callback: (bone_key: string, bone: Bone) => void): void;
    forEachBone(callback: (bone: Bone, bone_key: string) => void): void;
    iterateAttachments(skin_key: string, callback: (slot_key: string, slot: Slot, skin_slot: SkinSlot, attachment_key: string, attachment: Attachment) => void): void;
    forEachAttachment(skin_key: string, callback: (attachment: Attachment, attachment_key: string, slot: Slot, slot_key: string, skin_slot: SkinSlot) => void): void;
    iterateSkins(callback: (skin_key: string, skin: Skin) => void): void;
    forEachSkin(callback: (skin: Skin, skin_key: string) => void): void;
    mapSkins<T>(callback: (skin: Skin, skin_key: string) => T): T[];
    iterateEvents(callback: (event_key: string, event: Event) => void): void;
    forEachEvent(callback: (event: Event, event_key: string) => void): void;
    mapEvents<T>(callback: (event: Event, event_key: string) => T): T[];
    iterateAnims(callback: (anim_key: string, anim: Animation) => void): void;
    forEachAnim(callback: (anim: Animation, anim_key: string) => void): void;
    mapAnims<T>(callback: (anim: Animation, anim_key: string) => T): T[];
}
export interface DataJSON {
    skeleton: SkeletonJSON;
    bones: BoneJSON[];
    ik: IkcJSON[];
    transform: XfcJSON[];
    path: PtcJSON[];
    slots: SlotJSON[];
    skins: {
        [key: string]: SkinJSON;
    };
    events: {
        [key: string]: EventJSON;
    };
    animations: {
        [key: string]: AnimationJSON;
    };
}
export declare class Pose {
    data: Data;
    skin_key: string;
    anim_key: string;
    time: number;
    prev_time: number;
    elapsed_time: number;
    wrapped_min: boolean;
    wrapped_max: boolean;
    dirty: boolean;
    readonly bones: SpineMap<string, Bone>;
    readonly slots: SpineMap<string, Slot>;
    readonly events: SpineMap<string, Event>;
    constructor(data: Data);
    free(): void;
    curSkel(): Skeleton;
    getSkins(): SpineMap<string, Skin>;
    curSkin(): Skin | undefined;
    getSkin(): string;
    setSkin(skin_key: string): this;
    getAnims(): SpineMap<string, Animation>;
    curAnim(): Animation | undefined;
    curAnimLength(): number;
    getAnim(): string;
    setAnim(anim_key: string): this;
    getTime(): number;
    setTime(time: number): this;
    update(elapsed_time: number): void;
    strike(): void;
    private _strikeBones;
    private _strikeIkcs;
    private _strikeXfcs;
    private _strikeSlots;
    private _strikePtcs;
    private _strikeEvents;
    iterateBones(callback: (bone_key: string, bone: Bone) => void): void;
    forEachBone(callback: (bone: Bone, bone_key: string) => void): void;
    iterateAttachments(callback: (slot_key: string, slot: Slot, skin_slot: SkinSlot, attachment_key: string, attachment: Attachment) => void): void;
    forEachAttachment(callback: (attachment: Attachment, attachment_key: string, slot: Slot, slot_key: string, skin_slot: SkinSlot) => void): void;
    iterateEvents(callback: (event_key: string, event: Event) => void): void;
    forEachEvent(callback: (event: Event, event_key: string) => void): void;
}
