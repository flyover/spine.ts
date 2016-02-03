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

export function loadBool(json: any, key: string|number, def?: boolean): boolean {
  const value: any = json[key];
  switch (typeof(value)) {
    case "string": return (value === "true") ? true : false;
    case "boolean": return value;
    default: return def || false;
  }
}

export function saveBool(json: any, key: string|number, value: boolean, def?: boolean): void {
  if ((typeof(def) !== "boolean") || (value !== def)) {
    json[key] = value;
  }
}

export function loadFloat(json: any, key: string|number, def?: number): number {
  const value: any = json[key];
  switch (typeof(value)) {
    case "string": return parseFloat(value);
    case "number": return value;
    default: return def || 0;
  }
}

export function saveFloat(json: any, key: string|number, value: number, def?: number): void {
  if ((typeof(def) !== "number") || (value !== def)) {
    json[key] = value;
  }
}

export function loadInt(json: any, key: string|number, def?: number): number {
  const value: any = json[key];
  switch (typeof(value)) {
    case "string": return parseInt(value, 10);
    case "number": return 0 | value;
    default: return def || 0;
  }
}

export function saveInt(json: any, key: string|number, value: number, def?: number): void {
  if ((typeof(def) !== "number") || (value !== def)) {
    json[key] = value;
  }
}

export function loadString(json: any, key: string|number, def?: string): string {
  const value: any = json[key];
  switch (typeof(value)) {
    case "string": return value;
    default: return def || "";
  }
}

export function saveString(json: any, key: string|number, value: string, def?: string): void {
  if ((typeof(def) !== "string") || (value !== def)) {
    json[key] = value;
  }
}

export class Color {
  public r: number = 1.0;
  public g: number = 1.0;
  public b: number = 1.0;
  public a: number = 1.0;
  public copy(other: Color): Color {
    this.r = other.r;
    this.g = other.g;
    this.b = other.b;
    this.a = other.a;
    return this;
  }
  public load(json: any): Color {
    const color: Color = this;
    let rgba: number = 0xffffffff;
    switch (typeof(json)) {
      case "string": rgba = parseInt(json, 16); break;
      case "number": rgba = 0 | json; break;
      default: rgba = 0xffffffff; break;
    }
    color.r = ((rgba >> 24) & 0xff) / 255;
    color.g = ((rgba >> 16) & 0xff) / 255;
    color.b = ((rgba >> 8) & 0xff) / 255;
    color.a = (rgba & 0xff) / 255;
    return color;
  }
  public toString(): string {
    const color: Color = this;
    return "rgba(" + (color.r * 255).toFixed(0) + "," + (color.g * 255).toFixed(0) + "," + (color.b * 255).toFixed(0) + "," + color.a + ")";
  }
}

// from: http://github.com/arian/cubic-bezier
function BezierCurve(x1: number, y1: number, x2: number, y2: number, epsilon: number = 1e-6): (t: number) => number {

  /*
  function orig_curveX(t) {
    const v = 1 - t;
    return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
  }

  function orig_curveY(t) {
    const v = 1 - t;
    return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
  }

  function orig_derivativeCurveX(t) {
    const v = 1 - t;
    return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
  }
  */

  /*

  B(t) = P0*(1-t)^3 + 3*P1*(1-t)^2*t + 3*P2*(1-t)*t^2 + P3*t^3
  B'(t) = P0 - 3*(P0 - P1)*t + 3*(P0 - 2*P1 + P2)*t^2 - (P0 - 3*P1 + 3*P2 - P3)*t^3

  if P0:(0,0) and P3:(1,1)
  B(t) = 3*P1*(1-t)^2*t + 3*P2*(1-t)*t^2 + t^3
  B'(t) = 3*P1*t - 3*(2*P1 - P2)*t^2 + (3*P1 - 3*P2 + 1)*t^3

  */

  function curveX(t: number): number {
    const t2: number = t * t;
    const t3: number = t2 * t;
    const v: number = 1 - t;
    const v2: number = v * v;
    return 3 * x1 * v2 * t + 3 * x2 * v * t2 + t3;
  };

  function curveY(t: number): number {
    const t2: number = t * t;
    const t3: number = t2 * t;
    const v: number = 1 - t;
    const v2: number = v * v;
    return 3 * y1 * v2 * t + 3 * y2 * v * t2 + t3;
  };

  function derivativeCurveX(t: number): number {
    const t2: number = t * t;
    const t3: number = t2 * t;
    return 3 * x1 * t - 3 * (2 * x1 - x2) * t2 + (3 * x1 - 3 * x2 + 1) * t3;
  };

  return function (percent: number): number {
    const x: number = percent; let t0: number, t1: number, t2: number, x2: number, d2: number, i: number;

    // First try a few iterations of Newton"s method -- normally very fast.
    for (t2 = x, i = 0; i < 8; ++i) {
      x2 = curveX(t2) - x;
      if (Math.abs(x2) < epsilon) return curveY(t2);
      d2 = derivativeCurveX(t2);
      if (Math.abs(d2) < epsilon) break;
      t2 = t2 - (x2 / d2);
    }

    t0 = 0, t1 = 1, t2 = x;

    if (t2 < t0) return curveY(t0);
    if (t2 > t1) return curveY(t1);

    // Fallback to the bisection method for reliability.
    while (t0 < t1) {
      x2 = curveX(t2);
      if (Math.abs(x2 - x) < epsilon) return curveY(t2);
      if (x > x2) t0 = t2;
      else t1 = t2;
      t2 = (t1 - t0) * 0.5 + t0;
    }

    // Failure
    return curveY(t2);
  };
}

// from: spine-libgdx/src/com/esotericsoftware/spine/Animation.java
export function StepBezierCurve(cx1: number, cy1: number, cx2: number, cy2: number): (t: number) => number {
  const bezierSegments: number = 10;
  const subdiv_step: number = 1 / bezierSegments;
  const subdiv_step2: number = subdiv_step * subdiv_step;
  const subdiv_step3: number = subdiv_step2 * subdiv_step;
  const pre1: number = 3 * subdiv_step;
  const pre2: number = 3 * subdiv_step2;
  const pre4: number = 6 * subdiv_step2;
  const pre5: number = 6 * subdiv_step3;
  const tmp1x: number = -cx1 * 2 + cx2;
  const tmp1y: number = -cy1 * 2 + cy2;
  const tmp2x: number = (cx1 - cx2) * 3 + 1;
  const tmp2y: number = (cy1 - cy2) * 3 + 1;
  const curves_0: number = (cx1 * pre1 + tmp1x * pre2 + tmp2x * subdiv_step3);
  const curves_1: number = (cy1 * pre1 + tmp1y * pre2 + tmp2y * subdiv_step3);
  const curves_2: number = (tmp1x * pre4 + tmp2x * pre5);
  const curves_3: number = (tmp1y * pre4 + tmp2y * pre5);
  const curves_4: number = (tmp2x * pre5);
  const curves_5: number = (tmp2y * pre5);

  return function (percent: number): number {
    let dfx: number = curves_0;
    let dfy: number = curves_1;
    let ddfx: number = curves_2;
    let ddfy: number = curves_3;
    const dddfx: number = curves_4;
    const dddfy: number = curves_5;

    let x: number = dfx, y = dfy;
    let i: number = bezierSegments - 2;
    while (true) {
      if (x >= percent) {
        const lastX: number = x - dfx;
        const lastY: number = y - dfy;
        return lastY + (y - lastY) * (percent - lastX) / (x - lastX);
      }
      if (i === 0) break;
      i--;
      dfx += ddfx;
      dfy += ddfy;
      ddfx += dddfx;
      ddfy += dddfy;
      x += dfx;
      y += dfy;
    }
    return y + (1 - y) * (percent - x) / (1 - x); // Last point is 1,1.
  };
}

export class Curve {
  public evaluate: (t: number) => number = function (t: number): number { return t; };
  public load(json: any): Curve {
    // default: linear
    this.evaluate = function (t: number): number { return t; };
    if ((typeof(json) === "string") && (json === "stepped")) {
      // stepped
      this.evaluate = function (t: number): number { return 0; };
    } else if ((typeof(json) === "object") && (typeof(json.length) === "number") && (json.length === 4)) {
      // bezier
      const x1: number = loadFloat(json, 0, 0);
      const y1: number = loadFloat(json, 1, 0);
      const x2: number = loadFloat(json, 2, 1);
      const y2: number = loadFloat(json, 3, 1);
      // curve.evaluate = BezierCurve(x1, y1, x2, y2);
      this.evaluate = StepBezierCurve(x1, y1, x2, y2);
    }
    return this;
  }
}

export function wrap(num: number, min: number, max: number): number {
  if (min < max) {
    if (num < min) {
      return max - ((min - num) % (max - min));
    } else {
      return min + ((num - min) % (max - min));
    }
  } else if (min === max) {
    return min;
  } else {
    return num;
  }
}

export function tween(a: number, b: number, t: number): number {
  return a + ((b - a) * t);
}

export function wrapAngleRadians(angle: number): number {
  if (angle <= 0) {
    return ((angle - Math.PI) % (2 * Math.PI)) + Math.PI;
  } else {
    return ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
  }
}

export function tweenAngle(a: number, b: number, t: number): number {
  return wrapAngleRadians(a + (wrapAngleRadians(b - a) * t));
}

class Angle {
  public rad: number = 0.0;
  constructor(rad?: number) {
    this.rad = rad || 0.0;
  }
  get deg(): number { return this.rad * 180.0 / Math.PI; }
  set deg(value: number){ this.rad = value * Math.PI / 180.0; }
  get cos(): number { return Math.cos(this.rad); }
  get sin(): number { return Math.sin(this.rad); }
  selfIdentity(): Angle { this.rad = 0.0; return this; }
  copy(other: Angle): Angle { this.rad = other.rad; return this; }
}

export class Vector {
  public x: number = 0.0;
  public y: number = 0.0;
  constructor(x: number = 0.0, y: number = 0.0) {
    this.x = x;
    this.y = y;
  }
  public copy(other: Vector): Vector {
    this.x = other.x;
    this.y = other.y;
    return this;
  }
  public static equal(a: Vector, b: Vector, epsilon: number = 1e-6): boolean {
    if (Math.abs(a.x - b.x) > epsilon) { return false; }
    if (Math.abs(a.y - b.y) > epsilon) { return false; }
    return true;
  }
  public static add(a: Vector, b: Vector, out: Vector = new Vector()): Vector {
    out.x = a.x + b.x;
    out.y = a.y + b.y;
    return out;
  }
  public add(other: Vector, out: Vector = new Vector()): Vector {
    return Vector.add(this, other, out);
  }
  public selfAdd(other: Vector): Vector {
    // return Vector.add(this, other, this);
    this.x += other.x;
    this.y += other.y;
    return this;
  }
  public static tween(a: Vector, b: Vector, pct: number, out: Vector = new Vector()) {
    out.x = tween(a.x, b.x, pct);
    out.y = tween(a.y, b.y, pct);
    return out;
  }
  public tween(other: Vector, pct: number, out: Vector = new Vector()): Vector {
    return Vector.tween(this, other, pct, out);
  }
  public selfTween(other: Vector, pct: number): Vector {
    return Vector.tween(this, other, pct, this);
  }
}

export class Position extends Vector {
  constructor() {
    super(0.0, 0.0);
  }
}

export class Rotation extends Angle {
  constructor() {
    super(0.0);
  }
}

export class Scale extends Vector {
  constructor() {
    super(1.0, 1.0);
  }
  public selfIdentity(): Scale {
    this.x = 1.0;
    this.y = 1.0;
    return this;
  }
}

export class Space {
  public position: Position = new Position();
  public rotation: Rotation = new Rotation();
  public scale: Scale = new Scale();
  public copy(other: Space): Space {
    this.position.copy(other.position);
    this.rotation.copy(other.rotation);
    this.scale.copy(other.scale);
    return this;
  }
  public load(json: any): Space {
    this.position.x = loadFloat(json, "x", 0);
    this.position.y = loadFloat(json, "y", 0);
    this.rotation.deg = loadFloat(json, "rotation", 0);
    this.scale.x = loadFloat(json, "scaleX", 1);
    this.scale.y = loadFloat(json, "scaleY", 1);
    return this;
  }
  public static equal(a: Space, b: Space, epsilon: number = 1e-6): boolean {
    if (Math.abs(a.position.x - b.position.x) > epsilon) { return false; }
    if (Math.abs(a.position.y - b.position.y) > epsilon) { return false; }
    if (Math.abs(a.rotation.rad - b.rotation.rad) > epsilon) { return false; }
    if (Math.abs(a.scale.x - b.scale.x) > epsilon) { return false; }
    if (Math.abs(a.scale.y - b.scale.y) > epsilon) { return false; }
    return true;
  }
  public static identity(out: Space = new Space()): Space {
    out.position.x = 0;
    out.position.y = 0;
    out.rotation.rad = 0;
    out.scale.x = 1;
    out.scale.y = 1;
    return out;
  }
  public static translate(space: Space, x: number, y: number): Space {
    x *= space.scale.x;
    y *= space.scale.y;
    const rad: number = space.rotation.rad;
    const c: number = Math.cos(rad);
    const s: number = Math.sin(rad);
    const tx: number = c * x - s * y;
    const ty: number = s * x + c * y;
    space.position.x += tx;
    space.position.y += ty;
    return space;
  }
  public static rotate(space: Space, rad: number): Space {
    space.rotation.rad += rad;
    space.rotation.rad = wrapAngleRadians(space.rotation.rad);
    return space;
  }
  public static scale(space: Space, x: number, y: number): Space {
    space.scale.x *= x;
    space.scale.y *= y;
    return space;
  }
  public static invert(space: Space, out: Space = new Space()): Space {
    // invert
    // out.sca = space.sca.inv();
    // out.rot = space.rot.inv();
    // out.pos = space.pos.neg().rotate(space.rot.inv()).mul(space.sca.inv());
    const inv_scale_x: number = 1 / space.scale.x;
    const inv_scale_y: number = 1 / space.scale.y;
    const inv_rotation: number = -space.rotation.rad;
    const inv_x: number = -space.position.x;
    const inv_y: number = -space.position.y;
    out.scale.x = inv_scale_x;
    out.scale.y = inv_scale_y;
    out.rotation.rad = inv_rotation;
    const x: number = inv_x;
    const y: number = inv_y;
    const rad: number = inv_rotation;
    const c: number = Math.cos(rad);
    const s: number = Math.sin(rad);
    const tx: number = c * x - s * y;
    const ty: number = s * x + c * y;
    out.position.x = tx * inv_scale_x;
    out.position.y = ty * inv_scale_y;
    return out;
  }
  public static combine(a: Space, b: Space, out: Space = new Space()): Space {
    // combine
    // out.pos = b.pos.mul(a.sca).rotate(a.rot).add(a.pos);
    // out.rot = b.rot.mul(a.rot);
    // out.sca = b.sca.mul(a.sca);
    const x: number = b.position.x * a.scale.x;
    const y: number = b.position.y * a.scale.y;
    const rad: number = a.rotation.rad;
    const c: number = Math.cos(rad);
    const s: number = Math.sin(rad);
    const tx: number = c * x - s * y;
    const ty: number = s * x + c * y;
    out.position.x = tx + a.position.x;
    out.position.y = ty + a.position.y;
    out.rotation.rad = wrapAngleRadians(b.rotation.rad + a.rotation.rad);
    out.scale.x = b.scale.x * a.scale.x;
    out.scale.y = b.scale.y * a.scale.y;
    return out;
  }
  public static extract(ab: Space, a: Space, out: Space = new Space()): Space {
    // extract
    // out.sca = ab.sca.mul(a.sca.inv());
    // out.rot = ab.rot.mul(a.rot.inv());
    // out.pos = ab.pos.add(a.pos.neg()).rotate(a.rot.inv()).mul(a.sca.inv());
    out.scale.x = ab.scale.x / a.scale.x;
    out.scale.y = ab.scale.y / a.scale.y;
    out.rotation.rad = wrapAngleRadians(ab.rotation.rad - a.rotation.rad);
    const x: number = ab.position.x - a.position.x;
    const y: number = ab.position.y - a.position.y;
    const rad: number = -a.rotation.rad;
    const c: number = Math.cos(rad);
    const s: number = Math.sin(rad);
    const tx: number = c * x - s * y;
    const ty: number = s * x + c * y;
    out.position.x = tx / a.scale.x;
    out.position.y = ty / a.scale.y;
    return out;
  }
  public static transform(space: Space, v: Vector, out: Vector = new Vector()): Vector {
    const x: number = v.x * space.scale.x;
    const y: number = v.y * space.scale.y;
    const rad: number = space.rotation.rad;
    const c: number = Math.cos(rad);
    const s: number = Math.sin(rad);
    const tx: number = c * x - s * y;
    const ty: number = s * x + c * y;
    out.x = tx + space.position.x;
    out.y = ty + space.position.y;
    return out;
  }
  public static untransform(space: Space, v: Vector, out: Vector = new Vector()): Vector {
    const x: number = v.x - space.position.x;
    const y: number = v.y - space.position.y;
    const rad: number = -space.rotation.rad;
    const c: number = Math.cos(rad);
    const s: number = Math.sin(rad);
    const tx: number = c * x - s * y;
    const ty: number = s * x + c * y;
    out.x = tx / space.scale.x;
    out.y = ty / space.scale.y;
    return out;
  }
  public static tween(a: Space, b: Space, t: number, out: Space = new Space()): Space {
    out.position.x = tween(a.position.x, b.position.x, t);
    out.position.y = tween(a.position.y, b.position.y, t);
    out.rotation.rad = tweenAngle(a.rotation.rad, b.rotation.rad, t);
    out.scale.x = tween(a.scale.x, b.scale.x, t);
    out.scale.y = tween(a.scale.y, b.scale.y, t);
    return out;
  }
}

export class Bone {
  public parent_key: string = "";
  public length: number = 0;
  public local_space: Space = new Space();
  public world_space: Space = new Space();
  public inherit_rotation: boolean = true;
  public inherit_scale: boolean = true;
  public copy(other: Bone): Bone {
    this.parent_key = other.parent_key;
    this.length = other.length;
    this.local_space.copy(other.local_space);
    this.world_space.copy(other.world_space);
    this.inherit_rotation = other.inherit_rotation;
    this.inherit_scale = other.inherit_scale;
    return this;
  }
  public load(json: any): Bone {
    this.parent_key = loadString(json, "parent", "");
    this.length = loadFloat(json, "length", 0);
    this.local_space.load(json);
    this.world_space.copy(this.local_space);
    this.inherit_rotation = loadBool(json, "inheritRotation", true);
    this.inherit_scale = loadBool(json, "inheritScale", true);
    return this;
  }
  public static flatten(bone: Bone, bones: { [ key: string ]: Bone }): Bone {
    const parent_bone: Bone = bones[bone.parent_key];
    if (parent_bone) {
      Bone.flatten(parent_bone, bones);
      // Space.combine(parent_bone.world_space, bone.local_space, bone.world_space);
      const a: Space = parent_bone.world_space;
      const b: Space = bone.local_space;
      const out: Space = bone.world_space;
      const x: number = b.position.x * a.scale.x;
      const y: number = b.position.y * a.scale.y;
      const rad: number = a.rotation.rad;
      const c: number = Math.cos(rad);
      const s: number = Math.sin(rad);
      const tx: number = c * x - s * y;
      const ty: number = s * x + c * y;
      out.position.x = tx + a.position.x;
      out.position.y = ty + a.position.y;
      if (bone.inherit_rotation) {
        out.rotation.rad = wrapAngleRadians(b.rotation.rad + a.rotation.rad);
      } else {
        out.rotation.rad = b.rotation.rad;
      }
      if (bone.inherit_scale) {
        out.scale.x = b.scale.x * a.scale.x;
        out.scale.y = b.scale.y * a.scale.y;
      } else {
        out.scale.x = b.scale.x;
        out.scale.y = b.scale.y;
      }
    } else {
      bone.world_space.copy(bone.local_space);
    }
    return bone;
  }
}

export class Ikc {
  public name: string = "";
  public bone_keys: string[] = [];
  public target_key: string = "";
  public mix: number = 1;
  public bend_positive: boolean = true;
  public load(json: any): Ikc {
    this.name = loadString(json, "name", "");
    this.bone_keys = json["bones"] || [];
    this.target_key = loadString(json, "target", "");
    this.mix = loadFloat(json, "mix", 1);
    this.bend_positive = loadBool(json, "bendPositive", true);
    return this;
  }
}

export class Slot {
  public bone_key: string = "";
  public color: Color = new Color();
  public attachment_key: string = "";
  public blend: string = "normal";
  public copy(other: Slot): Slot {
    this.bone_key = other.bone_key;
    this.color.copy(other.color);
    this.attachment_key = other.attachment_key;
    this.blend = other.blend;
    return this;
  }
  public load(json: any): Slot {
    this.bone_key = loadString(json, "bone", "");
    this.color.load(json.color);
    this.attachment_key = loadString(json, "attachment", "");
    this.blend = loadString(json, "blend", "normal");
    return this;
  }
}

export class Attachment {
  public type: string = "region";
  public name: string = "";
  public path: string = "";
  constructor(type: string) {
    this.type = type;
  }
  public load(json: any): Attachment {
    const type = loadString(json, "type", "region");
    if (type !== this.type) { throw new Error(); }
    this.name = loadString(json, "name", "");
    this.path = loadString(json, "path", "");
    return this;
  }
}

export class RegionAttachment extends Attachment {
  public local_space: Space = new Space();
  public width: number = 0;
  public height: number = 0;
  constructor() {
    super("region");
  }
  public load(json: any): RegionAttachment {
    super.load(json);
    this.local_space.load(json);
    this.width = loadFloat(json, "width", 0);
    this.height = loadFloat(json, "height", 0);
    return this;
  }
}

export class BoundingBoxAttachment extends Attachment {
  public vertices: number[] = []; /// The x/y pairs that make up the vertices of the polygon.
  constructor() {
    super("boundingbox");
  }
  public load(json: any): BoundingBoxAttachment {
    super.load(json);
    this.vertices = json.vertices || [];
    return this;
  }
}

export class MeshAttachment extends Attachment {
  public color: Color = new Color();
  public triangles: number[] = [];
  public edges: number[] = [];
  public vertices: number[] = [];
  public uvs: number[] = [];
  public hull: number = 0;
  constructor() {
    super("mesh");
  }
  public load(json: any): MeshAttachment {
    super.load(json);
    this.color.load(json.color);
    this.triangles = json.triangles || [];
    this.edges = json.edges || [];
    this.vertices = json.vertices || [];
    this.uvs = json.uvs || [];
    this.hull = loadInt(json, "hull", 0);
    return this;
  }
}

export class SkinnedMeshAttachment extends Attachment {
  public color: Color = new Color();
  public triangles: number[] = [];
  public edges: number[] = [];
  public vertices: number[] = [];
  public uvs: number[] = [];
  public hull: number = 0;
  constructor() {
    super("skinnedmesh");
  }
  public load(json: any): SkinnedMeshAttachment {
    super.load(json);
    this.color.load(json.color);
    this.triangles = json.triangles || [];
    this.edges = json.edges || [];
    this.vertices = json.vertices || [];
    this.uvs = json.uvs || [];
    this.hull = loadInt(json, "hull", 0);
    return this;
  }
}

export class SkinSlot {
  public attachments: { [ key: string ]: Attachment } = {};
  public attachment_keys: string[] = [];
  public load(json: any): SkinSlot {
    this.attachment_keys = Object.keys(json);
    this.attachment_keys.forEach((attachment_key: string): void => {
      const json_attachment = json[attachment_key];
      switch (json_attachment.type) {
        case "region":
        default:
          this.attachments[attachment_key] = new RegionAttachment().load(json_attachment);
          break;
        case "boundingbox":
          this.attachments[attachment_key] = new BoundingBoxAttachment().load(json_attachment);
          break;
        case "mesh":
          this.attachments[attachment_key] = new MeshAttachment().load(json_attachment);
          break;
        case "skinnedmesh":
          this.attachments[attachment_key] = new SkinnedMeshAttachment().load(json_attachment);
          break;
      }
    });
    return this;
  }
}

export class Skin {
  public name: string = "";
  public slots: { [key: string]: SkinSlot } = {};
  public slot_keys: string[] = [];
  public load(json): Skin {
    this.name = loadString(json, "name", "");
    this.slot_keys = Object.keys(json);
    this.slot_keys.forEach((slot_key: string): void => {
      this.slots[slot_key] = new SkinSlot().load(json[slot_key]);
    });
    return this;
  }
  public iterateAttachments(callback: (slot_key: string, skin_slot: SkinSlot, attachment_key: string, attachment: Attachment) => void): void {
    this.slot_keys.forEach((slot_key: string): void => {
      const skin_slot: SkinSlot = this.slots[slot_key];
      skin_slot.attachment_keys.forEach((attachment_key: string): void => {
        const attachment: Attachment = skin_slot.attachments[attachment_key];
        callback(slot_key, skin_slot, attachment.path || attachment.name || attachment_key, attachment);
      });
    });
  }
}

export class Event {
  public name: string = "";
  public int_value: number = 0;
  public float_value: number = 0;
  public string_value: string = "";
  public copy(other: Event): Event {
    this.name = other.name;
    this.int_value = other.int_value;
    this.float_value = other.float_value;
    this.string_value = other.string_value;
    return this;
  }
  public load(json: any): Event {
    this.name = loadString(json, "name", "");
    if (typeof(json["int"]) === "number") {
      this.int_value = loadInt(json, "int", 0);
    }
    if (typeof(json["float"]) === "number") {
      this.float_value = loadFloat(json, "float", 0);
    }
    if (typeof(json["string"]) === "string") {
      this.string_value = loadString(json, "string", "");
    }
    return this;
  }
}

export class Keyframe {
  public time: number = 0;
  public drop(): Keyframe {
    this.time = 0;
    return this;
  }
  public load(json: any): Keyframe {
    this.time = 1000 * loadFloat(json, "time", 0); // convert to ms
    return this;
  }
  public save(json: any): Keyframe {
    saveFloat(json, "time", this.time / 1000, 0); // convert to s
    return this;
  }
  public static find(array: Keyframe[], time: number): number {
    if (!array) { return -1; }
    if (array.length <= 0) { return -1; }
    if (time < array[0].time) { return -1; }
    const last = array.length - 1;
    if (time >= array[last].time) { return last; }
    let lo = 0;
    let hi = last;
    if (hi === 0) { return 0; }
    let current = hi >> 1;
    while (true) {
      if (array[current + 1].time <= time) { lo = current + 1; } else { hi = current; }
      if (lo === hi) { return lo; }
      current = (lo + hi) >> 1;
    }
  }
  public static compare(a: Keyframe, b: Keyframe): number {
    return a.time - b.time;
  }
}

export class BoneKeyframe extends Keyframe {
  public curve: Curve = new Curve();
  public load(json: any): BoneKeyframe {
    super.load(json);
    this.curve.load(json.curve);
    return this;
  }
}

export class TranslateKeyframe extends BoneKeyframe {
  public position: Position = new Position();
  public load(json: any): TranslateKeyframe {
    super.load(json);
    this.position.x = loadFloat(json, "x", 0);
    this.position.y = loadFloat(json, "y", 0);
    return this;
  }
}

export class RotateKeyframe extends BoneKeyframe {
  public rotation: Rotation = new Rotation();
  public load(json: any): RotateKeyframe {
    super.load(json);
    this.rotation.deg = loadFloat(json, "angle", 0);
    return this;
  }
}

export class ScaleKeyframe extends BoneKeyframe {
  public scale: Scale = new Scale();
  public load(json: any): ScaleKeyframe {
    super.load(json);
    this.scale.x = loadFloat(json, "x", 1);
    this.scale.y = loadFloat(json, "y", 1);
    return this;
  }
}

export class AnimBone {
  public min_time: number = 0;
  public max_time: number = 0;
  public translate_keyframes: TranslateKeyframe[];
  public rotate_keyframes: RotateKeyframe[];
  public scale_keyframes: ScaleKeyframe[];
  public load(json: any): AnimBone {
    this.min_time = 0;
    this.max_time = 0;
    this.translate_keyframes = null;
    this.rotate_keyframes = null;
    this.scale_keyframes = null;
    Object.keys(json).forEach((key: string): void => {
      switch (key) {
        case "translate":
          this.translate_keyframes = [];
          json.translate.forEach((translate_json: any): void => {
            const translate_keyframe: TranslateKeyframe = new TranslateKeyframe().load(translate_json);
            this.translate_keyframes.push(translate_keyframe);
            this.min_time = Math.min(this.min_time, translate_keyframe.time);
            this.max_time = Math.max(this.max_time, translate_keyframe.time);
          });
          this.translate_keyframes.sort(Keyframe.compare);
          break;
        case "rotate":
          this.rotate_keyframes = [];
          json.rotate.forEach((rotate_json: any): void => {
            const rotate_keyframe: RotateKeyframe = new RotateKeyframe().load(rotate_json);
            this.rotate_keyframes.push(rotate_keyframe);
            this.min_time = Math.min(this.min_time, rotate_keyframe.time);
            this.max_time = Math.max(this.max_time, rotate_keyframe.time);
          });
          this.rotate_keyframes.sort(Keyframe.compare);
          break;
        case "scale":
          this.scale_keyframes = [];
          json.scale.forEach((scale_json: any): void => {
            const scale_keyframe: ScaleKeyframe = new ScaleKeyframe().load(scale_json);
            this.scale_keyframes.push(scale_keyframe);
            this.min_time = Math.min(this.min_time, scale_keyframe.time);
            this.max_time = Math.max(this.max_time, scale_keyframe.time);
          });
          this.scale_keyframes.sort(Keyframe.compare);
          break;
        default:
          console.log("TODO: AnimBone::load", key);
          break;
      }
    });
    return this;
  }
}

export class SlotKeyframe extends Keyframe {}

export class ColorKeyframe extends SlotKeyframe {
  public color: Color = new Color();
  public curve: Curve = new Curve();
  public load(json: any): ColorKeyframe {
    super.load(json);
    this.color.load(json.color);
    this.curve.load(json.curve);
    return this;
  }
}

export class AttachmentKeyframe extends SlotKeyframe {
  public name: string = "";
  public load(json: any): AttachmentKeyframe {
    super.load(json);
    this.name = loadString(json, "name", "");
    return this;
  }
}

export class AnimSlot {
  public min_time: number = 0;
  public max_time: number = 0;
  public color_keyframes: ColorKeyframe[];
  public attachment_keyframes: AttachmentKeyframe[];
  public load(json: any): AnimSlot {
    this.min_time = 0;
    this.max_time = 0;
    this.color_keyframes = null;
    this.attachment_keyframes = null;
    Object.keys(json).forEach((key: string): void => {
      switch (key) {
        case "color":
          this.color_keyframes = [];
          json[key].forEach((color: any): void => {
            const color_keyframe: ColorKeyframe = new ColorKeyframe().load(color);
            this.min_time = Math.min(this.min_time, color_keyframe.time);
            this.max_time = Math.max(this.max_time, color_keyframe.time);
            this.color_keyframes.push(color_keyframe);
          });
          this.color_keyframes.sort(Keyframe.compare);
          break;
        case "attachment":
          this.attachment_keyframes = [];
          json[key].forEach((attachment: any): void => {
            const attachment_keyframe: AttachmentKeyframe = new AttachmentKeyframe().load(attachment);
            this.min_time = Math.min(this.min_time, attachment_keyframe.time);
            this.max_time = Math.max(this.max_time, attachment_keyframe.time);
            this.attachment_keyframes.push(attachment_keyframe);
          });
          this.attachment_keyframes.sort(Keyframe.compare);
          break;
        default:
          console.log("TODO: AnimSlot::load", key);
          break;
      }
    });
    return this;
  }
}

export class EventKeyframe extends Keyframe {
  public name: string = "";
  public int_value: number = 0;
  public float_value: number = 0;
  public string_value: string = "";
  public load(json: any): EventKeyframe {
    super.load(json);
    this.name = loadString(json, "name", "");
    if (typeof(json["int"]) === "number") {
      this.int_value = loadInt(json, "int", 0);
    }
    if (typeof(json["float"]) === "number") {
      this.float_value = loadFloat(json, "float", 0);
    }
    if (typeof(json["string"]) === "string") {
      this.string_value = loadString(json, "string", "");
    }
    return this;
  }
}

export class SlotOffset {
  public slot_key: string = "";
  public offset: number = 0;
  public load(json: any): SlotOffset {
    this.slot_key = loadString(json, "slot", "");
    this.offset = loadInt(json, "offset", 0);
    return this;
  }
}

export class OrderKeyframe extends Keyframe {
  public slot_offsets: SlotOffset[] = [];
  public load(json: any): OrderKeyframe {
    super.load(json);
    this.slot_offsets = [];
    Object.keys(json).forEach((key: string): void => {
      switch (key) {
        case "offsets":
          json[key].forEach((offset: any): void => {
            this.slot_offsets.push(new SlotOffset().load(offset));
          });
          break;
      }
    });
    return this;
  }
}

export class IkcKeyframe extends Keyframe {
  public curve: Curve = new Curve();
  public mix: number = 1;
  public bend_positive: boolean = true;
  public load(json: any): IkcKeyframe {
    super.load(json);
    this.curve.load(json);
    this.mix = loadFloat(json, "mix", 1);
    this.bend_positive = loadBool(json, "bendPositive", true);
    return this;
  }
}

export class AnimIkc {
  public min_time: number = 0;
  public max_time: number = 0;
  public ikc_keyframes: IkcKeyframe[];
  public load(json: any): AnimIkc {
    this.min_time = 0;
    this.max_time = 0;
    this.ikc_keyframes = [];
    json.forEach((ikc: any): void => {
      const ikc_keyframe: IkcKeyframe = new IkcKeyframe().load(ikc);
      this.min_time = Math.min(this.min_time, ikc_keyframe.time);
      this.max_time = Math.max(this.max_time, ikc_keyframe.time);
      this.ikc_keyframes.push(ikc_keyframe);
    });
    this.ikc_keyframes.sort(Keyframe.compare);
    return this;
  }
}

export class FfdKeyframe extends Keyframe {
  public curve: Curve = new Curve();
  public offset: number = 0;
  public vertices: number[];
  public load(json: any): FfdKeyframe {
    super.load(json);
    this.curve.load(json);
    this.offset = loadInt(json, "offset", 0);
    this.vertices = json.vertices || [];
    return this;
  }
}

export class FfdAttachment {
  public min_time: number = 0;
  public max_time: number = 0;
  public ffd_keyframes: FfdKeyframe[];
  public load(json: any): FfdAttachment {
    this.min_time = 0;
    this.max_time = 0;
    this.ffd_keyframes = [];
    json.forEach((ffd_keyframe_json: any): void => {
      const ffd_keyframe: FfdKeyframe = new FfdKeyframe().load(ffd_keyframe_json);
      this.min_time = Math.min(this.min_time, ffd_keyframe.time);
      this.max_time = Math.max(this.max_time, ffd_keyframe.time);
      this.ffd_keyframes.push(ffd_keyframe);
    });
    this.ffd_keyframes.sort(Keyframe.compare);
    return this;
  }
}

export class FfdSlot {
  public ffd_attachments: { [ key: string ]: FfdAttachment };
  public ffd_attachment_keys: string[];
  public load(json: any): FfdSlot {
    this.ffd_attachments = {};
    this.ffd_attachment_keys = Object.keys(json);
    this.ffd_attachment_keys.forEach((key: string): void => {
      this.ffd_attachments[key] = new FfdAttachment().load(json[key]);
    });
    return this;
  }
  public iterateAttachments(callback: (ffd_attachment_key: string, ffd_attachment: FfdAttachment) => void): void {
    this.ffd_attachment_keys.forEach((ffd_attachment_key: string): void => {
      const ffd_attachment: FfdAttachment = this.ffd_attachments[ffd_attachment_key];
      callback(ffd_attachment_key, ffd_attachment);
    });
  }
}

export class AnimFfd {
  public min_time: number = 0;
  public max_time: number = 0;
  public ffd_slots: { [ key: string ]: FfdSlot };
  public ffd_slot_keys: string[];
  public load(json: any): AnimFfd {
    this.min_time = 0;
    this.max_time = 0;
    this.ffd_slots = {};
    this.ffd_slot_keys = Object.keys(json);
    this.ffd_slot_keys.forEach((key: string): void => {
      this.ffd_slots[key] = new FfdSlot().load(json[key]);
    });
    this.iterateAttachments((ffd_slot_key: string, ffd_slot: FfdSlot, ffd_attachment_key: string, ffd_attachment: FfdAttachment): void => {
      this.min_time = Math.min(this.min_time, ffd_attachment.min_time);
      this.max_time = Math.max(this.max_time, ffd_attachment.max_time);
    });
    return this;
  }
  public iterateAttachments(callback: (ffd_slot_key: string, ffd_slot: FfdSlot, ffd_attachment_key: string, ffd_attachment: FfdAttachment) => void): void {
    let ffd_slot_key: string;
    let ffd_slot: FfdSlot;
    this.ffd_slot_keys.forEach((ffd_slot_key: string): void => {
      ffd_slot = this.ffd_slots[ffd_slot_key];
      ffd_slot.iterateAttachments((ffd_attachment_key: string, ffd_attachment: FfdAttachment): void => {
        callback(ffd_slot_key, ffd_slot, ffd_attachment_key, ffd_attachment);
      });
    });
  }
}

export class Animation {
  public name: string = "";
  public bones: { [ key: string ]: AnimBone };
  public slots: { [ key: string ]: AnimSlot };
  public event_keyframes: EventKeyframe[];
  public order_keyframes: OrderKeyframe[];
  public ikcs: { [ key: string ]: AnimIkc };
  public ffds: { [ key: string ]: AnimFfd };
  public min_time: number = 0;
  public max_time: number = 0;
  public length: number = 0;
  public load(json: any): Animation {
    this.bones = {};
    this.slots = {};
    this.event_keyframes = null;
    this.order_keyframes = null;
    this.ikcs = {};
    this.ffds = {};
    this.min_time = 0;
    this.max_time = 0;
    Object.keys(json).forEach((key: string): void => {
      switch (key) {
        case "bones":
          Object.keys(json[key]).forEach((bone_key: string): void => {
            const anim_bone: AnimBone = new AnimBone().load(json[key][bone_key]);
            this.min_time = Math.min(this.min_time, anim_bone.min_time);
            this.max_time = Math.max(this.max_time, anim_bone.max_time);
            this.bones[bone_key] = anim_bone;
          });
          break;
        case "slots":
          Object.keys(json[key]).forEach((slot_key: string): void => {
            const anim_slot: AnimSlot = new AnimSlot().load(json[key][slot_key]);
            this.min_time = Math.min(this.min_time, anim_slot.min_time);
            this.max_time = Math.max(this.max_time, anim_slot.max_time);
            this.slots[slot_key] = anim_slot;
          });
          break;
        case "events":
          this.event_keyframes = [];
          json[key].forEach((event: any): void => {
            const event_keyframe: EventKeyframe = new EventKeyframe().load(event);
            this.min_time = Math.min(this.min_time, event_keyframe.time);
            this.max_time = Math.max(this.max_time, event_keyframe.time);
            this.event_keyframes.push(event_keyframe);
          });
          this.event_keyframes.sort(Keyframe.compare);
          break;
        case "drawOrder":
        case "draworder":
          this.order_keyframes = [];
          json[key].forEach((order: any): void => {
            const order_keyframe: OrderKeyframe = new OrderKeyframe().load(order);
            this.min_time = Math.min(this.min_time, order_keyframe.time);
            this.max_time = Math.max(this.max_time, order_keyframe.time);
            this.order_keyframes.push(order_keyframe);
          });
          this.order_keyframes.sort(Keyframe.compare);
          break;
        case "ik":
          Object.keys(json[key]).forEach((ikc_key: string): void => {
            const anim_ikc: AnimIkc = new AnimIkc().load(json[key][ikc_key]);
            this.min_time = Math.min(this.min_time, anim_ikc.min_time);
            this.max_time = Math.max(this.max_time, anim_ikc.max_time);
            this.ikcs[ikc_key] = anim_ikc;
          });
          break;
        case "ffd":
          Object.keys(json[key]).forEach((ffd_key: string): void => {
            const anim_ffd: AnimFfd = new AnimFfd().load(json[key][ffd_key]);
            this.min_time = Math.min(this.min_time, anim_ffd.min_time);
            this.max_time = Math.max(this.max_time, anim_ffd.max_time);
            this.ffds[ffd_key] = anim_ffd;
          });
          break;
        default:
          console.log("TODO: Animation::load", key);
          break;
      }
    });
    this.length = this.max_time - this.min_time;
    return this;
  }
}

export class Skeleton {
  public hash: string = "";
  public spine: string = "";
  public width: number = 0;
  public height: number = 0;
  public images: string = "";
  public load(json: any): Skeleton {
    this.hash = loadString(json, "hash", "");
    this.spine = loadString(json, "spine", "");
    this.width = loadInt(json, "width", 0);
    this.height = loadInt(json, "height", 0);
    this.images = loadString(json, "images", "");
    return this;
  }
}

export class Data {
  public name: string = "";
  public skeleton: Skeleton = new Skeleton();
  public bones: { [ key: string ]: Bone } = {};
  public bone_keys: string[] = [];
  public ikcs: { [ key: string ]: Ikc } = {};
  public ikc_keys: string[] = [];
  public slots: { [ key: string ]: Slot } = {};
  public slot_keys: string[] = [];
  public skins: { [ key: string ]: Skin } = {};
  public skin_keys: string[] = [];
  public events: { [ key: string ]: Event } = {};
  public event_keys: string[] = [];
  public anims: { [ key: string ]: Animation } = {};
  public anim_keys: string[] = [];
  public load(json: any): Data {
    this.bones = {};
    this.bone_keys = [];
    this.ikcs = {};
    this.ikc_keys = [];
    this.slots = {};
    this.slot_keys = [];
    this.skins = {};
    this.skin_keys = [];
    this.events = {};
    this.event_keys = [];
    this.anims = {};
    this.anim_keys = [];
    Object.keys(json).forEach((key: string): void => {
      switch (key) {
        case "skeleton":
          this.skeleton.load(json[key]);
          break;
        case "bones":
          const json_bones = json[key];
          json_bones.forEach((bone: any, bone_index: number): void => {
            this.bones[bone.name] = new Bone().load(bone);
            this.bone_keys[bone_index] = bone.name;
          });
          break;
        case "ik":
          const json_ik = json[key];
          json_ik.forEach((ikc: any, ikc_index: number): void => {
            this.ikcs[ikc.name] = new Ikc().load(ikc);
            this.ikc_keys[ikc_index] = ikc.name;
          });
          break;
        case "slots":
          const json_slots = json[key];
          json_slots.forEach((slot: any, slot_index: number): void => {
            this.slots[slot.name] = new Slot().load(slot);
            this.slot_keys[slot_index] = slot.name;
          });
          break;
        case "skins":
          const json_skins = json[key];
          this.skin_keys = Object.keys(json_skins);
          this.skin_keys.forEach((skin_key: string): void => {
            const skin: Skin = this.skins[skin_key] = new Skin().load(json_skins[skin_key]);
            skin.name = skin.name || skin_key;
          });
          break;
        case "events":
          const json_events = json[key];
          this.event_keys = Object.keys(json_events);
          this.event_keys.forEach((event_key: string): void => {
            const event: Event = this.events[event_key] = new Event().load(json_events[event_key]);
            event.name = event.name || event_key;
          });
          break;
        case "animations":
          const json_animations = json[key];
          this.anim_keys = Object.keys(json_animations);
          this.anim_keys.forEach((anim_key: string): void => {
            const anim: Animation = this.anims[anim_key] = new Animation().load(json_animations[anim_key]);
            anim.name = anim.name || anim_key;
          });
          break;
        default:
          console.log("TODO: Skeleton::load", key);
          break;
      }
    });

    this.iterateBones((bone_key: string, bone: Bone): void => {
      Bone.flatten(bone, this.bones);
    });
    return this;
  }
  public loadSkeleton(json: any): Data {
    this.skeleton.load(json);
    return this;
  }
  public loadEvent(name: string, json: any): Data {
    const event: Event = this.events[name] = new Event().load(json);
    event.name = event.name || name;
    return this;
  }
  public loadAnimation(name: string, json: any): Data {
    const anim: Animation = this.anims[name] = new Animation().load(json);
    anim.name = anim.name || name;
    return this;
  }
  public getSkins(): { [ key: string ]: Skin } { return this.skins; }
  public getEvents(): { [ key: string ]: Event } { return this.events; }
  public getAnims(): { [ key: string ]: Animation } { return this.anims; }
  public iterateBones(callback): void {
    this.bone_keys.forEach((bone_key: string): void => {
      const data_bone: Bone = this.bones[bone_key];
      callback(bone_key, data_bone);
    });
  }
  public iterateAttachments(skin_key, callback: (slot_key: string, data_slot: Slot, skin_slot: SkinSlot, attachment_key: string, attachment: Attachment) => void): void {
    const skin: Skin = this.skins[skin_key];
    const default_skin: Skin = this.skins["default"];
    this.slot_keys.forEach((slot_key: string): void => {
      const data_slot: Slot = this.slots[slot_key];
      const skin_slot: SkinSlot = skin && (skin.slots[slot_key] || default_skin.slots[slot_key]);
      const attachment: Attachment = skin_slot && skin_slot.attachments[data_slot.attachment_key];
      const attachment_key: string = (attachment && (attachment.path || attachment.name)) || data_slot.attachment_key;
      callback(slot_key, data_slot, skin_slot, attachment_key, attachment);
    });
  }
  public iterateSkins(callback: (skin_key: string, skin: Skin) => void): void {
    this.skin_keys.forEach((skin_key: string): void => {
      const skin: Skin = this.skins[skin_key];
      callback(skin_key, skin);
    });
  }
  public iterateEvents(callback: (event_key: string, event: Event) => void): void {
    this.event_keys.forEach((event_key: string): void => {
      const event: Event = this.events[event_key];
      callback(event_key, event);
    });
  }
  public iterateAnims(callback: (anim_key: string, anim: Animation) => void): void {
    this.anim_keys.forEach((anim_key: string): void => {
      const anim: Animation = this.anims[anim_key];
      callback(anim_key, anim);
    });
  }
}

export class Pose {
  public data: Data;
  public skin_key: string = "";
  public anim_key: string = "";
  public time: number = 0;
  public elapsed_time: number = 0;
  public dirty: boolean = true;
  public bones: { [ key: string ]: Bone } = {};
  public bone_keys: string[] = [];
  public slots: { [ key: string ]: Slot } = {};
  public slot_keys: string[] = [];
  public events: Event[] = [];
  constructor(data?: Data) {
    this.data = data;
  }
  public curSkel(): Skeleton {
    const pose: Pose = this;
    const data: Data = pose.data;
    return data && data.skeleton;
  }
  public getSkins(): { [ key: string ]: Skin } {
    const pose: Pose = this;
    const data: Data = pose.data;
    return data && data.skins;
  }
  public curSkin(): Skin {
    const pose: Pose = this;
    const data: Data = pose.data;
    return data && data.skins[pose.skin_key];
  }
  public getSkin(): string {
    const pose: Pose = this;
    return pose.skin_key;
  }
  public setSkin(skin_key: string): void {
    const pose: Pose = this;
    if (pose.skin_key !== skin_key) {
      pose.skin_key = skin_key;
    }
  }
  public getEvents(): { [ key: string ]: Event } {
    const pose: Pose = this;
    const data: Data = pose.data;
    return data && data.events;
  }
  public getAnims(): { [ key: string ]: Animation } {
    const pose: Pose = this;
    const data: Data = pose.data;
    return data && data.anims;
  }
  public curAnim(): Animation {
    const pose: Pose = this;
    const data: Data = pose.data;
    return data && data.anims[pose.anim_key];
  }
  public curAnimLength(): number {
    const pose: Pose = this;
    const data: Data = pose.data;
    const anim: Animation = data && data.anims[pose.anim_key];
    return (anim && anim.length) || 0;
  }
  public getAnim(): string {
    const pose: Pose = this;
    return pose.anim_key;
  }
  public setAnim(anim_key: string): void {
    const pose: Pose = this;
    if (pose.anim_key !== anim_key) {
      pose.anim_key = anim_key;
      const data: Data = pose.data;
      const anim: Animation = data && data.anims[pose.anim_key];
      if (anim) {
        pose.time = wrap(pose.time, anim.min_time, anim.max_time);
      }
      pose.elapsed_time = 0;
      pose.dirty = true;
    }
  }
  public getTime(): number {
    const pose: Pose = this;
    return pose.time;
  }
  public setTime(time: number): void {
    const pose: Pose = this;
    const data: Data = pose.data;
    const anim: Animation = data && data.anims[pose.anim_key];
    if (anim) {
      time = wrap(time, anim.min_time, anim.max_time);
    }
    if (pose.time !== time) {
      pose.time = time;
      pose.elapsed_time = 0;
      pose.dirty = true;
    }
  }
  public update(elapsed_time: number): void {
    const pose: Pose = this;
    pose.elapsed_time += elapsed_time;
    pose.dirty = true;
  }
  public strike(): void {
    const pose: Pose = this;
    if (!pose.dirty) { return; }
    pose.dirty = false;

    const data: Data = pose.data;

    const anim: Animation = data && data.anims[pose.anim_key];

    const prev_time: number = pose.time;
    const elapsed_time: number = pose.elapsed_time;

    pose.time = pose.time + pose.elapsed_time; // accumulate elapsed time
    pose.elapsed_time = 0; // reset elapsed time for next strike

    let wrapped_min: boolean = false;
    let wrapped_max: boolean = false;
    if (anim) {
      wrapped_min = (elapsed_time < 0) && (pose.time <= anim.min_time);
      wrapped_max = (elapsed_time > 0) && (pose.time >= anim.max_time);
      pose.time = wrap(pose.time, anim.min_time, anim.max_time);
    }

    const time: number = pose.time;
    let keyframe_index: number;

    data.bone_keys.forEach((bone_key: string): void => {
      const data_bone: Bone = data.bones[bone_key];
      const pose_bone: Bone = pose.bones[bone_key] || (pose.bones[bone_key] = new Bone());

      // start with a copy of the data bone
      pose_bone.copy(data_bone);

      // tween anim bone if keyframes are available
      const anim_bone: AnimBone = anim && anim.bones[bone_key];
      if (anim_bone) {
        keyframe_index = Keyframe.find(anim_bone.translate_keyframes, time);
        if (keyframe_index !== -1) {
          const translate_keyframe0: TranslateKeyframe = anim_bone.translate_keyframes[keyframe_index];
          const translate_keyframe1: TranslateKeyframe = anim_bone.translate_keyframes[keyframe_index + 1];
          if (translate_keyframe1) {
            const pct: number = translate_keyframe0.curve.evaluate((time - translate_keyframe0.time) / (translate_keyframe1.time - translate_keyframe0.time));
            pose_bone.local_space.position.x += tween(translate_keyframe0.position.x, translate_keyframe1.position.x, pct);
            pose_bone.local_space.position.y += tween(translate_keyframe0.position.y, translate_keyframe1.position.y, pct);
          } else {
            pose_bone.local_space.position.x += translate_keyframe0.position.x;
            pose_bone.local_space.position.y += translate_keyframe0.position.y;
          }
        }

        keyframe_index = Keyframe.find(anim_bone.rotate_keyframes, time);
        if (keyframe_index !== -1) {
          const rotate_keyframe0: RotateKeyframe = anim_bone.rotate_keyframes[keyframe_index];
          const rotate_keyframe1: RotateKeyframe = anim_bone.rotate_keyframes[keyframe_index + 1];
          if (rotate_keyframe1) {
            const pct: number = rotate_keyframe0.curve.evaluate((time - rotate_keyframe0.time) / (rotate_keyframe1.time - rotate_keyframe0.time));
            pose_bone.local_space.rotation.rad += tweenAngle(rotate_keyframe0.rotation.rad, rotate_keyframe1.rotation.rad, pct);
          } else {
            pose_bone.local_space.rotation.rad += rotate_keyframe0.rotation.rad;
          }
        }

        keyframe_index = Keyframe.find(anim_bone.scale_keyframes, time);
        if (keyframe_index !== -1) {
          const scale_keyframe0: ScaleKeyframe = anim_bone.scale_keyframes[keyframe_index];
          const scale_keyframe1: ScaleKeyframe = anim_bone.scale_keyframes[keyframe_index + 1];
          if (scale_keyframe1) {
            const pct: number = scale_keyframe0.curve.evaluate((time - scale_keyframe0.time) / (scale_keyframe1.time - scale_keyframe0.time));
            pose_bone.local_space.scale.x += tween(scale_keyframe0.scale.x, scale_keyframe1.scale.x, pct) - 1;
            pose_bone.local_space.scale.y += tween(scale_keyframe0.scale.y, scale_keyframe1.scale.y, pct) - 1;
          } else {
            pose_bone.local_space.scale.x += scale_keyframe0.scale.x - 1;
            pose_bone.local_space.scale.y += scale_keyframe0.scale.y - 1;
          }
        }
      }
    });

    pose.bone_keys = data.bone_keys;

    // ik constraints

    data.ikc_keys.forEach((ikc_key: string): void => {
      function clamp (n: number, lo: number, hi: number): number { return (n < lo) ? lo : ((n > hi) ? hi : n); }

      const ikc: Ikc = data.ikcs[ikc_key];
      let ikc_mix: number = ikc.mix;
      let ikc_bend_positive: boolean = ikc.bend_positive;

      const anim_ikc: AnimIkc = anim && anim.ikcs[ikc_key];
      if (anim_ikc) {
        keyframe_index = Keyframe.find(anim_ikc.ikc_keyframes, time);
        if (keyframe_index !== -1) {
          const ikc_keyframe0: IkcKeyframe = anim_ikc.ikc_keyframes[keyframe_index];
          const ikc_keyframe1: IkcKeyframe = anim_ikc.ikc_keyframes[keyframe_index + 1];
          if (ikc_keyframe1) {
            const pct: number = ikc_keyframe0.curve.evaluate((time - ikc_keyframe0.time) / (ikc_keyframe1.time - ikc_keyframe0.time));
            ikc_mix = tween(ikc_keyframe0.mix, ikc_keyframe1.mix, pct);
          } else {
            ikc_mix = ikc_keyframe0.mix;
          }
          // no tweening ik bend direction
          ikc_bend_positive = ikc_keyframe0.bend_positive;
        }
      }

      const target: Bone = pose.bones[ikc.target_key];
      Bone.flatten(target, pose.bones);
      let target_x: number = target.world_space.position.x;
      let target_y: number = target.world_space.position.y;
      const alpha: number = ikc_mix;
      const bend_direction: number = ikc_bend_positive ? 1 : -1;

      if (alpha === 0) { return; }

      switch (ikc.bone_keys.length) {
      case 1:
        const bone: Bone = pose.bones[ikc.bone_keys[0]];
        Bone.flatten(bone, pose.bones);
        let parent_rotation: number = 0;
        const bone_parent: Bone = pose.bones[bone.parent_key];
        if (bone_parent && bone.inherit_rotation) {
          Bone.flatten(bone_parent, pose.bones);
          parent_rotation = bone_parent.world_space.rotation.rad;
        }
        target_x -= bone.world_space.position.x;
        target_y -= bone.world_space.position.y;
        bone.local_space.rotation.rad = tweenAngle(bone.local_space.rotation.rad, Math.atan2(target_y, target_x) - parent_rotation, alpha);
        break;
      case 2:
        const parent: Bone = pose.bones[ikc.bone_keys[0]];
        Bone.flatten(parent, pose.bones);
        const child: Bone = pose.bones[ikc.bone_keys[1]];
        Bone.flatten(child, pose.bones);
        const position: Vector = new Vector();
        const parent_parent: Bone = pose.bones[parent.parent_key];
        if (parent_parent) {
          position.x = target_x;
          position.y = target_y;
          Bone.flatten(parent_parent, pose.bones);
          Space.untransform(parent_parent.world_space, position, position); // world to local
          target_x = (position.x - parent.local_space.position.x) * parent_parent.world_space.scale.x;
          target_y = (position.y - parent.local_space.position.y) * parent_parent.world_space.scale.y;
        } else {
          target_x -= parent.local_space.position.x;
          target_y -= parent.local_space.position.y;
        }
        position.copy(child.local_space.position);
        const child_parent: Bone = pose.bones[child.parent_key];
        if (child_parent !== parent) {
          Bone.flatten(child_parent, pose.bones);
          Space.transform(child_parent.world_space, position, position); // local to world
          Space.untransform(parent.world_space, position, position); // world to local
        }
        const child_x: number = position.x * parent.world_space.scale.x;
        const child_y: number = position.y * parent.world_space.scale.y;
        const offset: number = Math.atan2(child_y, child_x);
        const len1: number = Math.sqrt(child_x * child_x + child_y * child_y);
        const len2: number = child.length * child.world_space.scale.x;
        const cos_denom: number = 2 * len1 * len2;
        if (cos_denom < 0.0001) {
          child.local_space.rotation.rad = tweenAngle(child.local_space.rotation.rad, Math.atan2(target_y, target_x) - parent.local_space.rotation.rad, alpha);
          return;
        }
        const cos: number = clamp((target_x * target_x + target_y * target_y - len1 * len1 - len2 * len2) / cos_denom, -1, 1);
        const rad: number = Math.acos(cos) * bend_direction;
        const sin: number = Math.sin(rad);
        const adjacent: number = len2 * cos + len1;
        const opposite: number = len2 * sin;
        const parent_angle: number = Math.atan2(target_y * adjacent - target_x * opposite, target_x * adjacent + target_y * opposite);
        parent.local_space.rotation.rad = tweenAngle(parent.local_space.rotation.rad, (parent_angle - offset), alpha);
        let child_angle: number = rad;
        if (child_parent !== parent) {
          child_angle += parent.world_space.rotation.rad - child_parent.world_space.rotation.rad;
        }
        child.local_space.rotation.rad = tweenAngle(child.local_space.rotation.rad, (child_angle + offset), alpha);
        break;
      }
    });

    pose.iterateBones((bone_key: string, bone: Bone): void => {
      Bone.flatten(bone, pose.bones);
    });

    data.slot_keys.forEach((slot_key: string): void => {
      const data_slot: Slot = data.slots[slot_key];
      const pose_slot: Slot = pose.slots[slot_key] || (pose.slots[slot_key] = new Slot());

      // start with a copy of the data slot
      pose_slot.copy(data_slot);

      // tween anim slot if keyframes are available
      const anim_slot: AnimSlot = anim && anim.slots[slot_key];
      if (anim_slot) {
        keyframe_index = Keyframe.find(anim_slot.color_keyframes, time);
        if (keyframe_index !== -1) {
          const color_keyframe0: ColorKeyframe = anim_slot.color_keyframes[keyframe_index];
          const color_keyframe1: ColorKeyframe = anim_slot.color_keyframes[keyframe_index + 1];
          if (color_keyframe1) {
            const pct: number = color_keyframe0.curve.evaluate((time - color_keyframe0.time) / (color_keyframe1.time - color_keyframe0.time));
            pose_slot.color.r = tween(color_keyframe0.color.r, color_keyframe1.color.r, pct);
            pose_slot.color.g = tween(color_keyframe0.color.g, color_keyframe1.color.g, pct);
            pose_slot.color.b = tween(color_keyframe0.color.b, color_keyframe1.color.b, pct);
            pose_slot.color.a = tween(color_keyframe0.color.a, color_keyframe1.color.a, pct);
          } else {
            pose_slot.color.r = color_keyframe0.color.r;
            pose_slot.color.g = color_keyframe0.color.g;
            pose_slot.color.b = color_keyframe0.color.b;
            pose_slot.color.a = color_keyframe0.color.a;
          }
        }

        keyframe_index = Keyframe.find(anim_slot.attachment_keyframes, time);
        if (keyframe_index !== -1) {
          const attachment_keyframe0: AttachmentKeyframe = anim_slot.attachment_keyframes[keyframe_index];
          // no tweening attachments
          pose_slot.attachment_key = attachment_keyframe0.name;
        }
      }
    });

    pose.slot_keys = data.slot_keys;

    if (anim) {
      keyframe_index = Keyframe.find(anim.order_keyframes, time);
      if (keyframe_index !== -1) {
        const order_keyframe: OrderKeyframe = anim.order_keyframes[keyframe_index];
        pose.slot_keys = data.slot_keys.slice(0); // copy array before reordering
        order_keyframe.slot_offsets.forEach((slot_offset: SlotOffset): void => {
          const slot_index: number = pose.slot_keys.indexOf(slot_offset.slot_key);
          if (slot_index !== -1) {
            // delete old position
            pose.slot_keys.splice(slot_index, 1);
            // insert new position
            pose.slot_keys.splice(slot_index + slot_offset.offset, 0, slot_offset.slot_key);
          }
        });
      }
    }

    pose.events.length = 0;

    if (anim && anim.event_keyframes) {
      const add_event = function (event_keyframe: EventKeyframe): void {
        const pose_event: Event = new Event();
        const data_event: Event = data.events[event_keyframe.name];
        if (data_event) {
          pose_event.copy(data_event);
        }
        pose_event.int_value = event_keyframe.int_value || pose_event.int_value;
        pose_event.float_value = event_keyframe.float_value || pose_event.float_value;
        pose_event.string_value = event_keyframe.string_value || pose_event.string_value;
        pose.events.push(pose_event);
      };

      if (elapsed_time < 0) {
        if (wrapped_min) {
          // min    prev_time           time      max
          //  |         |                |         |
          //  ----------x                o<---------
          // all events between min_time and prev_time, not including prev_time
          // all events between max_time and time
          anim.event_keyframes.forEach((event_keyframe: EventKeyframe): void => {
            if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time < prev_time)) ||
              ((time <= event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
              add_event(event_keyframe);
            }
          });
        } else {
          // min       time          prev_time    max
          //  |         |                |         |
          //            o<---------------x
          // all events between time and prev_time, not including prev_time
          anim.event_keyframes.forEach((event_keyframe: EventKeyframe): void => {
            if ((time <= event_keyframe.time) && (event_keyframe.time < prev_time)) {
              add_event(event_keyframe);
            }
          });
        }
      } else {
        if (wrapped_max) {
          // min       time          prev_time    max
          //  |         |                |         |
          //  --------->o                x----------
          // all events between prev_time and max_time, not including prev_time
          // all events between min_time and time
          anim.event_keyframes.forEach((event_keyframe: EventKeyframe): void => {
            if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time <= time)) ||
              ((prev_time < event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
              add_event(event_keyframe);
            }
          });
        } else {
          // min    prev_time           time      max
          //  |         |                |         |
          //            x--------------->o
          // all events between prev_time and time, not including prev_time
          anim.event_keyframes.forEach((event_keyframe: EventKeyframe): void => {
            if ((prev_time < event_keyframe.time) && (event_keyframe.time <= time)) {
              add_event(event_keyframe);
            }
          });
        }
      }
    }
  }

  public iterateBones(callback: (bone_key: string, bone: Bone) => void): void {
    const pose: Pose = this;
    pose.bone_keys.forEach((bone_key: string): void => {
      const bone: Bone = pose.bones[bone_key];
      callback(bone_key, bone);
    });
  }

  public iterateAttachments(callback: (slot_key: string, pose_slot: Slot, skin_slot: SkinSlot, attachment_key: string, attachment: Attachment) => void): void {
    const pose: Pose = this;
    const data: Data = pose.data;
    const skin: Skin = data && data.skins[pose.skin_key];
    const default_skin: Skin = data && data.skins["default"];
    pose.slot_keys.forEach((slot_key: string): void => {
      const pose_slot: Slot = pose.slots[slot_key];
      const skin_slot: SkinSlot = skin && (skin.slots[slot_key] || default_skin.slots[slot_key]);
      const attachment: Attachment = skin_slot && skin_slot.attachments[pose_slot.attachment_key];
      const attachment_key: string = (attachment && (attachment.path || attachment.name)) || pose_slot.attachment_key;
      callback(slot_key, pose_slot, skin_slot, attachment_key, attachment);
    });
  }
}
