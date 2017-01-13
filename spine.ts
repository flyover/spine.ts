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

export let EPSILON: number = 1e-6;

export function loadBool(json: any, key: string | number, def: boolean = false): boolean {
  const value: any = json[key];
  switch (typeof(value)) {
    case "string": return (value === "true") ? true : false;
    case "boolean": return value;
    default: return def;
  }
}

export function saveBool(json: any, key: string | number, value: boolean, def: boolean = false): void {
  if ((typeof(def) !== "boolean") || (value !== def)) {
    json[key] = value;
  }
}

export function loadFloat(json: any, key: string | number, def: number = 0): number {
  const value: any = json[key];
  switch (typeof(value)) {
    case "string": return parseFloat(value);
    case "number": return value;
    default: return def;
  }
}

export function saveFloat(json: any, key: string | number, value: number, def: number = 0): void {
  if ((typeof(def) !== "number") || (value !== def)) {
    json[key] = value;
  }
}

export function loadInt(json: any, key: string | number, def: number = 0): number {
  const value: any = json[key];
  switch (typeof(value)) {
    case "string": return parseInt(value, 10);
    case "number": return 0 | value;
    default: return def;
  }
}

export function saveInt(json: any, key: string | number, value: number, def: number = 0): void {
  if ((typeof(def) !== "number") || (value !== def)) {
    json[key] = value;
  }
}

export function loadString(json: any, key: string | number, def: string = ""): string {
  const value: any = json[key];
  switch (typeof(value)) {
    case "string": return value;
    default: return def;
  }
}

export function saveString(json: any, key: string | number, value: string, def: string = ""): void {
  if ((typeof(def) !== "string") || (value !== def)) {
    json[key] = value;
  }
}

export class Color {
  public r: number = 1;
  public g: number = 1;
  public b: number = 1;
  public a: number = 1;

  public static copy(color: Color, out: Color = new Color()): Color {
    out.r = color.r;
    out.g = color.g;
    out.b = color.b;
    out.a = color.a;
    return out;
  }

  public copy(other: Color): Color {
    return Color.copy(other, this);
  }

  public load(json: any): Color {
    let rgba: number = 0xffffffff;
    switch (typeof(json)) {
      case "string": rgba = parseInt(json, 16); break;
      case "number": rgba = 0 | json; break;
    }
    this.r = ((rgba >> 24) & 0xff) / 255;
    this.g = ((rgba >> 16) & 0xff) / 255;
    this.b = ((rgba >> 8) & 0xff) / 255;
    this.a = (rgba & 0xff) / 255;
    return this;
  }

  public toString(): string {
    return "rgba(" + (this.r * 255).toFixed(0) + "," + (this.g * 255).toFixed(0) + "," + (this.b * 255).toFixed(0) + "," + this.a + ")";
  }

  public static tween(a: Color, b: Color, pct: number, out: Color = new Color()): Color {
    out.r = tween(a.r, b.r, pct);
    out.g = tween(a.g, b.g, pct);
    out.b = tween(a.b, b.b, pct);
    out.a = tween(a.a, b.a, pct);
    return out;
  }

  public tween(other: Color, pct: number, out: Color = new Color()): Color {
    return Color.tween(this, other, pct, out);
  }
}

// from: http://github.com/arian/cubic-bezier
export function BezierCurve(x1: number, y1: number, x2: number, y2: number, epsilon: number = EPSILON): (t: number) => number {

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
  }

  function curveY(t: number): number {
    const t2: number = t * t;
    const t3: number = t2 * t;
    const v: number = 1 - t;
    const v2: number = v * v;
    return 3 * y1 * v2 * t + 3 * y2 * v * t2 + t3;
  }

  function derivativeCurveX(t: number): number {
    const t2: number = t * t;
    const t3: number = t2 * t;
    return 3 * x1 * t - 3 * (2 * x1 - x2) * t2 + (3 * x1 - 3 * x2 + 1) * t3;
  }

  return function(percent: number): number {
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

    let x: number = dfx, y: number = dfy;
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

export class Angle {
  public _rad: number = 0;
  public _cos: number = 1;
  public _sin: number = 0;

  constructor (rad: number = 0) {
    this.rad = rad;
  }

  public get rad(): number { return this._rad; }
  public set rad(value: number) {
    if (this._rad !== value) {
      this._rad = value;
      this._cos = Math.cos(value);
      this._sin = Math.sin(value);
    }
  }
  public get deg(): number { return this.rad * 180 / Math.PI; }
  public set deg(value: number) { this.rad = value * Math.PI / 180; }
  public get cos(): number { return this._cos; }
  public get sin(): number { return this._sin; }

  public static copy(angle: Angle, out: Angle = new Angle()) {
    out._rad = angle._rad;
    out._cos = angle._cos;
    out._sin = angle._sin;
    return out;
  }

  public copy(other: Angle): Angle {
    return Angle.copy(other, this);
  }

  public static equal(a: Angle, b: Angle, epsilon: number = EPSILON): boolean {
    if (Math.abs(wrapAngleRadians(a.rad - b.rad)) > epsilon) { return false; }
    return true;
  }

  public equal(other: Angle, epsilon: number = EPSILON): boolean {
    return Angle.equal(this, other, epsilon);
  }

  public static tween(a: Angle, b: Angle, pct: number, out: Angle = new Angle()): Angle {
    out.rad = tweenAngle(a.rad, b.rad, pct);
    return out;
  }

  public tween(other: Angle, pct: number, out: Angle = new Angle()): Angle {
    return Angle.tween(this, other, pct, out);
  }
}

export class Vector {
  public x: number = 0;
  public y: number = 0;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public static copy(v: Vector, out: Vector = new Vector()): Vector {
    out.x = v.x;
    out.y = v.y;
    return out;
  }

  public copy(other: Vector): Vector {
    return Vector.copy(other, this);
  }

  public static equal(a: Vector, b: Vector, epsilon: number = EPSILON): boolean {
    if (Math.abs(a.x - b.x) > epsilon) { return false; }
    if (Math.abs(a.y - b.y) > epsilon) { return false; }
    return true;
  }

  public equal(other: Vector, epsilon: number = EPSILON): boolean {
    return Vector.equal(this, other, epsilon);
  }

  public static negate(v: Vector, out: Vector = new Vector()): Vector {
    out.x = -v.x;
    out.y = -v.y;
    return out;
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
    ///return Vector.add(this, other, this);
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  public static subtract(a: Vector, b: Vector, out: Vector = new Vector()): Vector {
    out.x = a.x - b.x;
    out.y = a.y - b.y;
    return out;
  }

  public subtract(other: Vector, out: Vector = new Vector()): Vector {
    return Vector.subtract(this, other, out);
  }

  public selfSubtract(other: Vector): Vector {
    ///return Vector.subtract(this, other, this);
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  public static scale(v: Vector, x: number, y: number = x, out: Vector = new Vector()): Vector {
    out.x = v.x * x;
    out.y = v.y * y;
    return out;
  }

  public scale(x: number, y: number = x, out: Vector = new Vector()): Vector {
    return Vector.scale(this, x, y, out);
  }

  public selfScale(x: number, y: number = x): Vector {
    return Vector.scale(this, x, y, this);
  }

  public static tween(a: Vector, b: Vector, pct: number, out: Vector = new Vector()): Vector {
    out.x = tween(a.x, b.x, pct);
    out.y = tween(a.y, b.y, pct);
    return out;
  }

  public tween(other: Vector, pct: number, out: Vector = new Vector()): Vector {
    return Vector.tween(this, other, pct, out);
  }
}

export class Matrix {
  public a: number = 1; public b: number = 0;
  public c: number = 0; public d: number = 1;

  public static copy(m: Matrix, out: Matrix = new Matrix()): Matrix {
    out.a = m.a;
    out.b = m.b;
    out.c = m.c;
    out.d = m.d;
    return out;
  }

  public copy(other: Matrix): Matrix {
    return Matrix.copy(other, this);
  }

  public static equal(a: Matrix, b: Matrix, epsilon: number = EPSILON): boolean {
    if (Math.abs(a.a - b.a) > epsilon) { return false; }
    if (Math.abs(a.b - b.b) > epsilon) { return false; }
    if (Math.abs(a.c - b.c) > epsilon) { return false; }
    if (Math.abs(a.d - b.d) > epsilon) { return false; }
    return true;
  }

  public equal(other: Matrix, epsilon: number = EPSILON): boolean {
    return Matrix.equal(this, other, epsilon);
  }

  public static determinant(m: Matrix): number {
    return m.a * m.d - m.b * m.c;
  }

  public static identity(out: Matrix = new Matrix()): Matrix {
    out.a = 1; out.b = 0;
    out.c = 0; out.d = 1;
    return out;
  }

  public static multiply(a: Matrix, b: Matrix, out: Matrix = new Matrix()): Matrix {
    const a_a: number = a.a, a_b: number = a.b, a_c: number = a.c, a_d: number = a.d;
    const b_a: number = b.a, b_b: number = b.b, b_c: number = b.c, b_d: number = b.d;
    out.a = a_a * b_a + a_b * b_c;
    out.b = a_a * b_b + a_b * b_d;
    out.c = a_c * b_a + a_d * b_c;
    out.d = a_c * b_b + a_d * b_d;
    return out;
  }

  public static invert(m: Matrix, out: Matrix = new Matrix()): Matrix {
    const a: number = m.a, b: number = m.b, c: number = m.c, d: number = m.d;
    const inv_det: number = 1 / (a * d - b * c);
    out.a = inv_det * d;
    out.b = -inv_det * b;
    out.c = -inv_det * c;
    out.d = inv_det * a;
    return out;
  }

  public static combine(a: Matrix, b: Matrix, out: Matrix): Matrix {
    return Matrix.multiply(a, b, out);
  }

  public static extract(ab: Matrix, a: Matrix, out: Matrix): Matrix {
    return Matrix.multiply(Matrix.invert(a, out), ab, out);
  }

  public static rotate(m: Matrix, cos: number, sin: number, out: Matrix = new Matrix()): Matrix {
    const a: number = m.a, b: number = m.b, c: number = m.c, d: number = m.d;
    out.a = a * cos + b * sin; out.b = b * cos - a * sin;
    out.c = c * cos + d * sin; out.d = d * cos - c * sin;
    return out;
  }

  public static scale(m: Matrix, x: number, y: number, out: Matrix = new Matrix()): Matrix {
    out.a = m.a * x; out.b = m.b * y;
    out.c = m.c * x; out.d = m.d * y;
    return out;
  }

  public static transform(m: Matrix, v: Vector, out: Vector = new Vector()): Vector {
    const x: number = v.x, y: number = v.y;
    out.x = m.a * x + m.b * y;
    out.y = m.c * x + m.d * y;
    return out;
  }

  public static untransform(m: Matrix, v: Vector, out: Vector = new Vector()): Vector {
    const a: number = m.a, b: number = m.b, c: number = m.c, d: number = m.d;
    const x: number = v.x, y: number = v.y;
    const inv_det: number = 1 / (a * d - b * c);
    out.x = inv_det * (d * x - b * y);
    out.y = inv_det * (a * y - c * x);
    return out;
  }

  public static tween(a: Matrix, b: Matrix, pct: number, out: Matrix = new Matrix()): Matrix {
    out.a = tween(a.a, b.a, pct);
    out.b = tween(a.b, b.b, pct);
    out.c = tween(a.c, b.c, pct);
    out.d = tween(a.d, b.d, pct);
    return out;
  }

  public tween(other: Matrix, pct: number, out: Matrix = new Matrix()): Matrix {
    return Matrix.tween(this, other, pct, out);
  }
}

export class Affine {
  public vector: Vector = new Vector();
  public matrix: Matrix = new Matrix();

  public static copy(affine: Affine, out: Affine = new Affine()): Affine {
    Vector.copy(affine.vector, out.vector);
    Matrix.copy(affine.matrix, out.matrix);
    return out;
  }

  public copy(other: Affine): Affine {
    return Affine.copy(other, this);
  }

  public static equal(a: Affine, b: Affine, epsilon: number = EPSILON): boolean {
    if (!a.vector.equal(b.vector, epsilon)) { return false; }
    if (!a.matrix.equal(b.matrix, epsilon)) { return false; }
    return true;
  }

  public equal(other: Affine, epsilon: number = EPSILON): boolean {
    return Affine.equal(this, other, epsilon);
  }

  public static identity(out: Affine = new Affine()): Affine {
    Matrix.identity(out.matrix);
    out.vector.x = 0;
    out.vector.y = 0;
    return out;
  }

  public static invert(affine: Affine, out: Affine = new Affine()): Affine {
    Matrix.invert(affine.matrix, out.matrix);
    Vector.negate(affine.vector, out.vector);
    Matrix.transform(out.matrix, out.vector, out.vector);
    return out;
  }

  public static combine(a: Affine, b: Affine, out: Affine = new Affine()): Affine {
    Affine.transform(a, b.vector, out.vector);
    Matrix.combine(a.matrix, b.matrix, out.matrix);
    return out;
  }

  public static extract(ab: Affine, a: Affine, out: Affine = new Affine()): Affine {
    Matrix.extract(ab.matrix, a.matrix, out.matrix);
    Affine.untransform(a, ab.vector, out.vector);
    return out;
  }

  public static transform(affine: Affine, v: Vector, out: Vector = new Vector()): Vector {
    Matrix.transform(affine.matrix, v, out);
    Vector.add(affine.vector, out, out);
    return out;
  }

  public static untransform(affine: Affine, v: Vector, out: Vector = new Vector()): Vector {
    Vector.subtract(v, affine.vector, out);
    Matrix.untransform(affine.matrix, out, out);
    return out;
  }
}

export class Position extends Vector {
  constructor() {
    super(0, 0);
  }
}

export class Rotation extends Angle {
  public matrix: Matrix = new Matrix();

  constructor() {
    super(0);
  }

  public updateMatrix(m: Matrix = this.matrix): Matrix {
    m.a = this.cos; m.b = -this.sin;
    m.c = this.sin; m.d = this.cos;
    return m;
  }
}

export function signum(n: number): number { return (n < 0) ? (-1) : (n > 0) ? (1) : (n); }

export class Scale extends Matrix {
  constructor() {
    super();
  }

  public get x(): number { return (this.c === 0) ? (this.a) : (signum(this.a) * Math.sqrt(this.a * this.a + this.c * this.c)); }
  public set x(value: number) { this.a = value; this.c = 0; }

  public get y(): number { return (this.b === 0) ? (this.d) : (signum(this.d) * Math.sqrt(this.b * this.b + this.d * this.d)); }
  public set y(value: number) { this.b = 0; this.d = value; }
}

export class Shear {
  public x: Angle = new Angle();
  public y: Angle = new Angle();
  public matrix: Matrix = new Matrix();

  public updateMatrix(m: Matrix = this.matrix): Matrix {
    m.a = this.x.cos; m.b = -this.y.sin;
    m.c = this.x.sin; m.d = this.y.cos;
    return m;
  }

  public static copy(shear: Shear, out: Shear = new Shear()): Shear {
    out.x.copy(shear.x);
    out.y.copy(shear.y);
    return out;
  }

  public copy(other: Shear): Shear {
    return Shear.copy(other, this);
  }

  public static equal(a: Shear, b: Shear, epsilon: number = EPSILON): boolean {
    if (!a.x.equal(b.x, epsilon)) { return false; }
    if (!a.y.equal(b.y, epsilon)) { return false; }
    return true;
  }

  public equal(other: Shear, epsilon: number = EPSILON): boolean {
    return Shear.equal(this, other, epsilon);
  }

  public static tween(a: Shear, b: Shear, pct: number, out: Shear = new Shear()): Shear {
    Angle.tween(a.x, b.x, pct, out.x);
    Angle.tween(a.y, b.y, pct, out.y);
    return out;
  }

  public tween(other: Shear, pct: number, out: Shear = new Shear()): Shear {
    return Shear.tween(this, other, pct, out);
  }
}

export class Space {
  public position: Position = new Position();
  public rotation: Rotation = new Rotation();
  public scale: Scale = new Scale();
  public shear: Shear = new Shear();
  public affine: Affine = new Affine();

  public updateAffine(affine: Affine = this.affine): Affine {
    Vector.copy(this.position, affine.vector);
    Matrix.copy(this.rotation.updateMatrix(), affine.matrix);
    Matrix.multiply(affine.matrix, this.shear.updateMatrix(), affine.matrix);
    Matrix.multiply(affine.matrix, this.scale, affine.matrix);
    return affine;
  }

  public static copy(space: Space, out: Space = new Space()): Space {
    out.position.copy(space.position);
    out.rotation.copy(space.rotation);
    out.scale.copy(space.scale);
    out.shear.copy(space.shear);
    return out;
  }

  public copy(other: Space): Space {
    return Space.copy(other, this);
  }

  public load(json: any): Space {
    this.position.x = loadFloat(json, "x", 0);
    this.position.y = loadFloat(json, "y", 0);
    this.rotation.deg = loadFloat(json, "rotation", 0);
    this.scale.x = loadFloat(json, "scaleX", 1);
    this.scale.y = loadFloat(json, "scaleY", 1);
    this.shear.x.deg = loadFloat(json, "shearX", 0);
    this.shear.y.deg = loadFloat(json, "shearY", 0);
    return this;
  }

  public static equal(a: Space, b: Space, epsilon: number = EPSILON): boolean {
    if (!a.position.equal(b.position, epsilon)) { return false; }
    if (!a.rotation.equal(b.rotation, epsilon)) { return false; }
    if (!a.scale.equal(b.scale, epsilon)) { return false; }
    if (!a.shear.equal(b.shear, epsilon)) { return false; }
    return true;
  }

  public equal(other: Space, epsilon: number = EPSILON): boolean {
    return Space.equal(this, other, epsilon);
  }

  public static identity(out: Space = new Space()): Space {
    out.position.x = 0;
    out.position.y = 0;
    out.rotation.rad = 0;
    out.scale.x = 1;
    out.scale.y = 1;
    out.shear.x.rad = 0;
    out.shear.y.rad = 0;
    return out;
  }

  public static translate(space: Space, x: number, y: number): Space {
    Space.transform(space, new Vector(x, y), space.position);
    return space;
  }

  public static rotate(space: Space, rad: number): Space {
    if (Matrix.determinant(space.scale) < 0.0) {
      space.rotation.rad = wrapAngleRadians(space.rotation.rad - rad);
    } else {
      space.rotation.rad = wrapAngleRadians(space.rotation.rad + rad);
    }
    return space;
  }

  public static scale(space: Space, x: number, y: number): Space {
    Matrix.scale(space.scale, x, y, space.scale);
    return space;
  }

  public static invert(space: Space, out: Space = new Space()): Space {
    if (space === out) { space = Space.copy(space, new Space()); }
    Affine.invert(space.updateAffine(), out.affine);
    out.position.copy(out.affine.vector);
    out.shear.x.rad = -space.shear.x.rad;
    out.shear.y.rad = -space.shear.y.rad;
    const x_axis_rad = Math.atan2(out.affine.matrix.c, out.affine.matrix.a);
    out.rotation.rad = wrapAngleRadians(x_axis_rad - out.shear.x.rad);
    Matrix.combine(out.rotation.updateMatrix(), out.shear.updateMatrix(), out.scale);
    Matrix.extract(out.affine.matrix, out.scale, out.scale);
    return out;
  }

  public static combine(a: Space, b: Space, out: Space= new Space()): Space {
    if (a === out) { a = Space.copy(a, new Space()); }
    if (b === out) { b = Space.copy(b, new Space()); }
    Affine.combine(a.updateAffine(), b.updateAffine(), out.affine);
    out.position.copy(out.affine.vector);
    out.shear.x.rad = wrapAngleRadians(a.shear.x.rad + b.shear.x.rad);
    out.shear.y.rad = wrapAngleRadians(a.shear.y.rad + b.shear.y.rad);
    const x_axis_rad = Math.atan2(out.affine.matrix.c, out.affine.matrix.a);
    out.rotation.rad = wrapAngleRadians(x_axis_rad - out.shear.x.rad);
    Matrix.combine(out.rotation.updateMatrix(), out.shear.updateMatrix(), out.scale);
    Matrix.extract(out.affine.matrix, out.scale, out.scale);
    return out;
  }

  public static extract(ab: Space, a: Space, out: Space= new Space()): Space {
    if (ab === out) { ab = Space.copy(ab, new Space()); }
    if (a === out) { a = Space.copy(a, new Space()); }
    Affine.extract(ab.updateAffine(), a.updateAffine(), out.affine);
    out.position.copy(out.affine.vector);
    out.shear.x.rad = wrapAngleRadians(ab.shear.x.rad - a.shear.x.rad);
    out.shear.y.rad = wrapAngleRadians(ab.shear.y.rad - a.shear.y.rad);
    const x_axis_rad = Math.atan2(out.affine.matrix.c, out.affine.matrix.a);
    out.rotation.rad = wrapAngleRadians(x_axis_rad - out.shear.x.rad);
    Matrix.combine(out.rotation.updateMatrix(), out.shear.updateMatrix(), out.scale);
    Matrix.extract(out.affine.matrix, out.scale, out.scale);
    return out;
  }

  public static transform(space: Space, v: Vector, out: Vector = new Vector()): Vector {
    return Affine.transform(space.updateAffine(), v, out);
  }

  public static untransform(space: Space, v: Vector, out: Vector = new Vector()): Vector {
    return Affine.untransform(space.updateAffine(), v, out);
  }

  public static tween(a: Space, b: Space, tween: number, out: Space= new Space()): Space {
    a.position.tween(b.position, tween, out.position);
    a.rotation.tween(b.rotation, tween, out.rotation);
    a.scale.tween(b.scale, tween, out.scale);
    a.shear.tween(b.shear, tween, out.shear);
    return out;
  }
}

export class Bone {
  public color: Color = new Color();
  public parent_key: string = "";
  public length: number = 0;
  public local_space: Space = new Space();
  public world_space: Space = new Space();
  public inherit_rotation: boolean = true;
  public inherit_scale: boolean = true;
  public transform: string = "normal";

  public copy(other: Bone): Bone {
    this.color.copy(other.color);
    this.parent_key = other.parent_key;
    this.length = other.length;
    this.local_space.copy(other.local_space);
    this.world_space.copy(other.world_space);
    this.inherit_rotation = other.inherit_rotation;
    this.inherit_scale = other.inherit_scale;
    this.transform = other.transform;
    return this;
  }

  public load(json: any): Bone {
    this.color.load(json.color || 0x9b9b9bff);
    this.parent_key = loadString(json, "parent", "");
    this.length = loadFloat(json, "length", 0);
    this.local_space.load(json);
    this.inherit_rotation = loadBool(json, "inheritRotation", true);
    this.inherit_scale = loadBool(json, "inheritScale", true);
    this.transform = loadString(json, "transform", "normal");
    if (json.transform) {
      switch (json.transform) {
        case "normal": this.inherit_rotation = this.inherit_scale = true; break;
        case "onlyTranslation": this.inherit_rotation = this.inherit_scale = false; break;
        case "noRotationOrReflection": this.inherit_rotation = false; break;
        case "noScale": this.inherit_scale = false; break;
        case "noScaleOrReflection": this.inherit_scale = false; break;
        default: console.log("TODO: Space.transform", json.transform); break;
      }
    }
    return this;
  }

  public static flatten(bone: Bone, bones: {[key: string]: Bone}): Bone {
    const bls: Space = bone.local_space;
    const bws: Space = bone.world_space;
    let parent: Bone = bones[bone.parent_key];
    if (!parent) {
      bws.copy(bls);
      bws.updateAffine();
    } else {
      Bone.flatten(parent, bones);
      const pws: Space = parent.world_space;
      // compute bone world space position vector
      Space.transform(pws, bls.position, bws.position);
      // compute bone world affine rotation/scale matrix based in inheritance
      if (bone.inherit_rotation && bone.inherit_scale) {
        Matrix.copy(pws.affine.matrix, bws.affine.matrix);
      } else if (bone.inherit_rotation) {
        Matrix.identity(bws.affine.matrix);
        while (parent && parent.inherit_rotation) {
          const pls: Space = parent.local_space;
          Matrix.rotate(bws.affine.matrix, pls.rotation.cos, pls.rotation.sin, bws.affine.matrix);
          parent = bones[parent.parent_key];
        }
      } else if (bone.inherit_scale) {
        Matrix.identity(bws.affine.matrix);
        while (parent && parent.inherit_scale) {
          const pls: Space = parent.local_space;
          let cos: number = pls.rotation.cos, sin: number = pls.rotation.sin;
          Matrix.rotate(bws.affine.matrix, cos, sin, bws.affine.matrix);
          Matrix.multiply(bws.affine.matrix, pls.scale, bws.affine.matrix);
          if (pls.scale.x >= 0) { sin = -sin; }
          Matrix.rotate(bws.affine.matrix, cos, sin, bws.affine.matrix);
          parent = bones[parent.parent_key];
        }
      } else {
        Matrix.identity(bws.affine.matrix);
      }
      // apply bone local space
      bls.updateAffine();
      Matrix.multiply(bws.affine.matrix, bls.affine.matrix, bws.affine.matrix);
      // update bone world space
      bws.shear.x.rad = wrapAngleRadians(pws.shear.x.rad + bls.shear.x.rad);
      bws.shear.y.rad = wrapAngleRadians(pws.shear.y.rad + bls.shear.y.rad);
      const x_axis_rad: number = Math.atan2(bws.affine.matrix.c, bws.affine.matrix.a);
      bws.rotation.rad = wrapAngleRadians(x_axis_rad - bws.shear.x.rad);
      Matrix.combine(bws.rotation.updateMatrix(), bws.shear.updateMatrix(), bws.scale);
      Matrix.extract(bws.affine.matrix, bws.scale, bws.scale);
    }
    return bone;
  }
}

export class Ikc {
  public name: string = "";
  public order: number = 0;
  public bone_keys: string[] = [];
  public target_key: string = "";
  public mix: number = 1;
  public bend_positive: boolean = true;

  public load(json: any): Ikc {
    this.name = loadString(json, "name", "");
    this.order = loadInt(json, "order", 0);
    this.bone_keys = json["bones"] || [];
    this.target_key = loadString(json, "target", "");
    this.mix = loadFloat(json, "mix", 1);
    this.bend_positive = loadBool(json, "bendPositive", true);
    return this;
  }
}

export class Xfc {
  public name: string = "";
  public order: number = 0;
  public bone_key: string = "";
  public target_key: string = "";
  public position_mix: number = 1;
  public position: Position = new Position();
  public rotation_mix: number = 1;
  public rotation: Rotation = new Rotation();
  public scale_mix: number = 1;
  public scale: Scale = new Scale();
  public shear_mix: number = 1;
  public shear: Shear = new Shear();

  public load(json: any): Xfc {
    this.name = loadString(json, "name", "");
    this.order = loadInt(json, "order", 0);
    this.bone_key = loadString(json, "bone", "");
    this.target_key = loadString(json, "target", "");
    this.position_mix = loadFloat(json, "translateMix", 1);
    this.position.x = loadFloat(json, "x", 0);
    this.position.y = loadFloat(json, "y", 0);
    this.rotation_mix = loadFloat(json, "rotateMix", 1);
    this.rotation.deg = loadFloat(json, "rotation", 0);
    this.scale_mix = loadFloat(json, "scaleMix", 1);
    this.scale.x = loadFloat(json, "scaleX", 1);
    this.scale.y = loadFloat(json, "scaleY", 1);
    this.shear_mix = loadFloat(json, "shearMix", 1);
    this.shear.x.deg = loadFloat(json, "shearX", 0);
    this.shear.y.deg = loadFloat(json, "shearY", 0);
    return this;
  }
}

export class Ptc {
  public name: string = "";
  public order: number = 0;
  public bone_keys: string[] = [];
  public target_key: string = "";
  public spacing_mode: string = "length"; // "length", "fixed", "percent"
  public spacing: number = 0;
  public position_mode: string = "percent"; // "fixed", "percent"
  public position_mix: number = 1;
  public position: number = 0;
  public rotation_mode: string = "tangent"; // "tangent", "chain", "chainScale"
  public rotation_mix: number = 1;
  public rotation: Rotation = new Rotation();

  public load(json: any): Ptc {
    this.name = loadString(json, "name", "");
    this.order = loadInt(json, "order", 0);
    this.bone_keys = json["bones"] || [];
    this.target_key = loadString(json, "target", "");
    this.spacing_mode = loadString(json, "spacingMode", "length");
    this.spacing = loadFloat(json, "spacing", 0);
    this.position_mode = loadString(json, "positionMode", "percent");
    this.position_mix = loadFloat(json, "translateMix", 1);
    this.position = loadFloat(json, "position", 0);
    this.rotation_mode = loadString(json, "rotateMode", "tangent");
    this.rotation_mix = loadFloat(json, "rotateMix", 1);
    this.rotation.deg = loadFloat(json, "rotation", 0);
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
  public type: string = "";
  public name: string = "";
  public path: string = "";

  constructor(type: string) {
    this.type = type;
  }

  public load(json: any): Attachment {
    const attachment_type = loadString(json, "type", "region");
    if (attachment_type !== this.type) {
      throw new Error();
    }
    this.name = loadString(json, "name", "");
    this.path = loadString(json, "path", "");
    return this;
  }
}

export class RegionAttachment extends Attachment {
  public color: Color = new Color();
  public local_space: Space = new Space();
  public width: number = 0;
  public height: number = 0;

  constructor() {
    super("region");
  }

  public load(json: any): RegionAttachment {
    super.load(json);
    this.color.load(json.color);
    this.local_space.load(json);
    this.width = loadFloat(json, "width", 0);
    this.height = loadFloat(json, "height", 0);
    return this;
  }
}

export class BoundingBoxAttachment extends Attachment {
  public vertices: number[] = [];

  constructor() {
    super("boundingbox");
  }

  public load(json: any): BoundingBoxAttachment {
    super.load(json);
    /// The x/y pairs that make up the vertices of the polygon.
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

export class LinkedMeshAttachment extends Attachment {
  public color: Color = new Color();
  public skin_key: string = "";
  public parent_key: string = "";
  public inherit_deform: boolean = true;
  public width: number = 0;
  public height: number = 0;

  constructor() {
    super("linkedmesh");
  }

  public load(json: any): LinkedMeshAttachment {
    super.load(json);
    this.color.load(json.color);
    this.skin_key = loadString(json, "skin", "");
    this.parent_key = loadString(json, "parent", "");
    this.inherit_deform = loadBool(json, "deform", true);
    this.width = loadInt(json, "width", 0);
    this.height = loadInt(json, "height", 0);
    return this;
  }
}

export class WeightedMeshAttachment extends Attachment {
  public color: Color = new Color();
  public triangles: number[] = [];
  public edges: number[] = [];
  public vertices: number[] = [];
  public uvs: number[] = [];
  public hull: number = 0;

  constructor() {
    super("weightedmesh");
  }

  public load(json: any): any {
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

export class WeightedLinkedMeshAttachment extends Attachment {
  public skin_key: string = "";
  public parent_key: string = "";
  public inherit_deform: boolean = true;
  public width: number = 0;
  public height: number = 0;

  constructor() {
    super("weightedlinkedmesh");
  }

  public load(json: any): WeightedLinkedMeshAttachment {
    super.load(json);
    this.skin_key = loadString(json, "skin", "");
    this.parent_key = loadString(json, "parent", "");
    this.inherit_deform = loadBool(json, "ffd", true);
    this.width = loadInt(json, "width", 0);
    this.height = loadInt(json, "height", 0);
    return this;
  }
}

export class PathAttachment extends Attachment {
  public color: Color = new Color();
  public closed: boolean = false;
  public accurate: boolean = true;
  public lengths: number[] = [];
  public vertex_count: number = 0;
  public vertices: number[] = [];

  constructor() {
    super("path");
  }

  public load(json: any): PathAttachment {
    super.load(json);
    this.color.load(json.color);
    this.closed = loadBool(json, "closed", false);
    this.accurate = loadBool(json, "constantSpeed", true);
    this.lengths = json.lengths || [];
    this.vertex_count = loadInt(json, "vertexCount", 0);
    this.vertices = json.vertices || [];
    return this;
  }
}

export class SkinSlot {
  public attachments: {[key: string]: Attachment} = {};
  public attachment_keys: string[] = [];

  public load(json: any): SkinSlot {
    this.attachment_keys = Object.keys(json || {});
    this.attachment_keys.forEach((attachment_key: string): void => {
      const json_attachment = json[attachment_key];
      switch (json_attachment.type) {
        default: case "region":
          this.attachments[attachment_key] = new RegionAttachment().load(json_attachment);
          break;
        case "boundingbox":
          this.attachments[attachment_key] = new BoundingBoxAttachment().load(json_attachment);
          break;
        case "mesh":
          if (json_attachment.vertices.length === json_attachment.uvs.length) {
            this.attachments[attachment_key] = new MeshAttachment().load(json_attachment);
          } else {
            json_attachment.type = "weightedmesh";
            this.attachments[attachment_key] = new WeightedMeshAttachment().load(json_attachment);
          }
          break;
        case "linkedmesh":
          if (json_attachment.vertices.length === json_attachment.uvs.length) {
            this.attachments[attachment_key] = new LinkedMeshAttachment().load(json_attachment);
          } else {
            json_attachment.type = "weightedlinkedmesh";
            this.attachments[attachment_key] = new WeightedLinkedMeshAttachment().load(json_attachment);
          }
          break;
        case "skinnedmesh":
          json_attachment.type = "weightedmesh";
        case "weightedmesh":
          this.attachments[attachment_key] = new WeightedMeshAttachment().load(json_attachment);
          break;
        case "weightedlinkedmesh":
          this.attachments[attachment_key] = new WeightedLinkedMeshAttachment().load(json_attachment);
          break;
        case "path":
          this.attachments[attachment_key] = new PathAttachment().load(json_attachment);
          break;
      }
    });
    return this;
  }
}

export class Skin {
  public name: string = "";
  public slots: {[key: string]: SkinSlot} = {};
  public slot_keys: string[] = [];

  public load(json: any): Skin {
    this.name = loadString(json, "name", "");
    this.slot_keys = Object.keys(json || {});
    this.slot_keys.forEach((slot_key: string): void => {
      this.slots[slot_key] = new SkinSlot().load(json[slot_key]);
    });
    return this;
  }

  public iterateAttachments(callback: (slot_key: string, skin_slot: SkinSlot, attachment_key: string, attachment: Attachment) => void): void {
    this.slot_keys.forEach((slot_key: string): void => {
      const skin_slot = this.slots[slot_key];
      skin_slot.attachment_keys.forEach((attachment_key: string): void => {
        const attachment = skin_slot.attachments[attachment_key];
        callback(slot_key, skin_slot, attachment.name || attachment_key, attachment);
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
    if (!array) {
      return -1;
    }
    if (array.length <= 0) {
      return -1;
    }
    if (time < array[0].time) {
      return -1;
    }
    const last = array.length - 1;
    if (time >= array[last].time) {
      return last;
    }
    let lo = 0;
    let hi = last;
    if (hi === 0) {
      return 0;
    }
    let current = hi >> 1;
    while (true) {
      if (array[current + 1].time <= time) {
        lo = current + 1;
      } else {
        hi = current;
      }
      if (lo === hi) {
        return lo;
      }
      current = (lo + hi) >> 1;
    }
  }

  public static compare(a: Keyframe, b: Keyframe): number {
    return a.time - b.time;
  }
}

export class BoneKeyframe extends Keyframe {
  public curve: Curve = new Curve();

  constructor() {
    super();
  }

  public load(json: any): BoneKeyframe {
    super.load(json);
    this.curve.load(json.curve);
    return this;
  }
}

export class PositionKeyframe extends BoneKeyframe {
  public position: Position = new Position();

  constructor() {
    super();
  }

  public load(json: any): PositionKeyframe {
    super.load(json);
    this.position.x = loadFloat(json, "x", 0);
    this.position.y = loadFloat(json, "y", 0);
    return this;
  }
}

export class RotationKeyframe extends BoneKeyframe {
  public rotation: Rotation = new Rotation();

  constructor() {
    super();
  }

  public load(json: any): RotationKeyframe {
    super.load(json);
    this.rotation.deg = loadFloat(json, "angle", 0);
    return this;
  }
}

export class ScaleKeyframe extends BoneKeyframe {
  public scale: Scale = new Scale();

  constructor() {
    super();
  }

  public load(json: any): ScaleKeyframe {
    super.load(json);
    this.scale.x = loadFloat(json, "x", 1);
    this.scale.y = loadFloat(json, "y", 1);
    return this;
  }
}

export class ShearKeyframe extends BoneKeyframe {
  public shear: Shear = new Shear();

  constructor() {
    super();
  }

  public load(json: any): ShearKeyframe {
    super.load(json);
    this.shear.x.deg = loadFloat(json, "x", 0);
    this.shear.y.deg = loadFloat(json, "y", 0);
    return this;
  }
}

export class BoneTimeline {
  public min_time: number = 0;
  public max_time: number = 0;
  public position_keyframes: PositionKeyframe[];
  public rotation_keyframes: RotationKeyframe[];
  public scale_keyframes: ScaleKeyframe[];
  public shear_keyframes: ShearKeyframe[];

  public load(json: any): BoneTimeline {
    this.min_time = 0;
    this.max_time = 0;
    delete this.position_keyframes;
    delete this.rotation_keyframes;
    delete this.scale_keyframes;
    delete this.shear_keyframes;

    Object.keys(json || {}).forEach((key: string): void => {
      switch (key) {
        case "translate":
          this.position_keyframes = [];
          json.translate.forEach((translate_json: any): void => {
            const position_keyframe = new PositionKeyframe().load(translate_json);
            this.position_keyframes.push(position_keyframe);
            this.min_time = Math.min(this.min_time, position_keyframe.time);
            this.max_time = Math.max(this.max_time, position_keyframe.time);
          });
          this.position_keyframes.sort(Keyframe.compare);
          break;
        case "rotate":
          this.rotation_keyframes = [];
          json.rotate.forEach((rotate_json: any): void => {
            const rotation_keyframe = new RotationKeyframe().load(rotate_json);
            this.rotation_keyframes.push(rotation_keyframe);
            this.min_time = Math.min(this.min_time, rotation_keyframe.time);
            this.max_time = Math.max(this.max_time, rotation_keyframe.time);
          });
          this.rotation_keyframes.sort(Keyframe.compare);
          break;
        case "scale":
          this.scale_keyframes = [];
          json.scale.forEach((scale_json: any): void => {
            const scale_keyframe = new ScaleKeyframe().load(scale_json);
            this.scale_keyframes.push(scale_keyframe);
            this.min_time = Math.min(this.min_time, scale_keyframe.time);
            this.max_time = Math.max(this.max_time, scale_keyframe.time);
          });
          this.scale_keyframes.sort(Keyframe.compare);
          break;
        case "shear":
          this.shear_keyframes = [];
          json.shear.forEach((shear_json: any): void => {
            const shear_keyframe = new ShearKeyframe().load(shear_json);
            this.shear_keyframes.push(shear_keyframe);
            this.min_time = Math.min(this.min_time, shear_keyframe.time);
            this.max_time = Math.max(this.max_time, shear_keyframe.time);
          });
          this.shear_keyframes.sort(Keyframe.compare);
          break;
        default:
          console.log("TODO: BoneTimeline::load", key);
          break;
      }
    });

    return this;
  }
}

export class SlotKeyframe extends Keyframe {
  constructor() {
    super();
  }

  public load(json: any): SlotKeyframe {
    super.load(json);
    return this;
  }
}

export class ColorKeyframe extends SlotKeyframe {
  public curve: Curve = new Curve();
  public color: Color = new Color();

  constructor() {
    super();
  }

  public load(json: any): ColorKeyframe {
    super.load(json);
    this.curve.load(json.curve);
    this.color.load(json.color);
    return this;
  }
}

export class AttachmentKeyframe extends SlotKeyframe {
  public name: string = "";

  constructor() {
    super();
  }

  public load(json: any): AttachmentKeyframe {
    super.load(json);
    this.name = loadString(json, "name", "");
    return this;
  }
}

export class SlotTimeline {
  public min_time: number = 0;
  public max_time: number = 0;
  public color_keyframes: ColorKeyframe[];
  public attachment_keyframes: AttachmentKeyframe[];

  public load(json: any): SlotTimeline {
    this.min_time = 0;
    this.max_time = 0;
    delete this.color_keyframes;
    delete this.attachment_keyframes;

    Object.keys(json || {}).forEach((key: string): void => {
      switch (key) {
        case "color":
          this.color_keyframes = [];
          json[key].forEach((color: any): void => {
            const color_keyframe = new ColorKeyframe().load(color);
            this.min_time = Math.min(this.min_time, color_keyframe.time);
            this.max_time = Math.max(this.max_time, color_keyframe.time);
            this.color_keyframes.push(color_keyframe);
          });
          this.color_keyframes.sort(Keyframe.compare);
          break;
        case "attachment":
          this.attachment_keyframes = [];
          json[key].forEach((attachment: any): void => {
            const attachment_keyframe = new AttachmentKeyframe().load(attachment);
            this.min_time = Math.min(this.min_time, attachment_keyframe.time);
            this.max_time = Math.max(this.max_time, attachment_keyframe.time);
            this.attachment_keyframes.push(attachment_keyframe);
          });
          this.attachment_keyframes.sort(Keyframe.compare);
          break;
        default:
          console.log("TODO: SlotTimeline::load", key);
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

  constructor() {
    super();
  }

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

  constructor() {
    super();
  }

  public load(json: any): OrderKeyframe {
    super.load(json);
    this.slot_offsets = [];

    Object.keys(json || {}).forEach((key: string): void => {
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

  constructor() {
    super();
  }

  public load(json: any): IkcKeyframe {
    super.load(json);
    this.curve.load(json.curve);
    this.mix = loadFloat(json, "mix", 1);
    this.bend_positive = loadBool(json, "bendPositive", true);
    return this;
  }
}

export class IkcTimeline {
  public min_time: number = 0;
  public max_time: number = 0;
  public ikc_keyframes: IkcKeyframe[];

  public load(json: any): IkcTimeline {
    this.min_time = 0;
    this.max_time = 0;
    this.ikc_keyframes = [];

    json.forEach((ikc: any): void => {
      const ikc_keyframe = new IkcKeyframe().load(ikc);
      this.min_time = Math.min(this.min_time, ikc_keyframe.time);
      this.max_time = Math.max(this.max_time, ikc_keyframe.time);
      this.ikc_keyframes.push(ikc_keyframe);
    });
    this.ikc_keyframes.sort(Keyframe.compare);

    return this;
  }
}

export class XfcKeyframe extends Keyframe {
  public curve: Curve = new Curve();
  public position_mix: number = 1;
  public rotation_mix: number = 1;
  public scale_mix: number = 1;
  public shear_mix: number = 1;

  constructor() {
    super();
  }

  public load(json: any): XfcKeyframe {
    super.load(json);
    this.curve.load(json.curve);
    this.position_mix = loadFloat(json, "translateMix", 1);
    this.rotation_mix = loadFloat(json, "rotateMix", 1);
    this.scale_mix = loadFloat(json, "scaleMix", 1);
    this.shear_mix = loadFloat(json, "shearMix", 1);
    return this;
  }
}

export class XfcTimeline {
  public min_time: number = 0;
  public max_time: number = 0;
  public xfc_keyframes: XfcKeyframe[];

  public load(json: any): XfcTimeline {
    this.min_time = 0;
    this.max_time = 0;
    this.xfc_keyframes = [];

    json.forEach((xfc: any): void => {
      const xfc_keyframe = new XfcKeyframe().load(xfc);
      this.min_time = Math.min(this.min_time, xfc_keyframe.time);
      this.max_time = Math.max(this.max_time, xfc_keyframe.time);
      this.xfc_keyframes.push(xfc_keyframe);
    });
    this.xfc_keyframes.sort(Keyframe.compare);

    return this;
  }
}

export class PtcKeyframe extends Keyframe {
  public curve: Curve = new Curve();

  constructor() {
    super();
  }

  public load(json: any): PtcKeyframe {
    super.load(json);
    this.curve.load(json.curve);
    return this;
  }
}

export class PtcSpacingKeyframe extends PtcKeyframe {
  public spacing: number = 0;

  constructor() {
    super();
  }

  public load(json: any): PtcSpacingKeyframe {
    super.load(json);
    this.spacing = loadFloat(json, "spacing", 0);
    return this;
  }
}

export class PtcPositionKeyframe extends PtcKeyframe {
  public position_mix: number = 1;
  public position: number = 0;

  constructor() {
    super();
  }

  public load(json: any): PtcPositionKeyframe {
    super.load(json);
    this.position_mix = loadFloat(json, "positionMix", 1);
    this.position = loadFloat(json, "position", 0);
    return this;
  }
}

export class PtcRotationKeyframe extends PtcKeyframe {
  public rotation_mix = 1;
  public rotation = 0;

  constructor() {
    super();
  }

  public load(json: any): PtcRotationKeyframe {
    super.load(json);
    this.rotation_mix = loadFloat(json, "rotationMix", 1);
    this.rotation = loadFloat(json, "rotation", 0);
    return this;
  }
}

export class PtcTimeline {
  public min_time = 0;
  public max_time = 0;
  public ptc_spacing_keyframes: PtcSpacingKeyframe[];
  public ptc_position_keyframes: PtcPositionKeyframe[];
  public ptc_rotation_keyframes: PtcRotationKeyframe[];

  public load(json: any): PtcTimeline {
    this.min_time = 0;
    this.max_time = 0;
    this.ptc_spacing_keyframes = [];
    this.ptc_position_keyframes = [];
    this.ptc_rotation_keyframes = [];

    Object.keys(json || {}).forEach((key: string): void => {
      switch (key) {
        case "spacing":
          json[key].forEach((spacing_json: any): void => {
            const ptc_spacing_keyframe = new PtcSpacingKeyframe().load(spacing_json);
            this.min_time = Math.min(this.min_time, ptc_spacing_keyframe.time);
            this.max_time = Math.max(this.max_time, ptc_spacing_keyframe.time);
            this.ptc_spacing_keyframes.push(ptc_spacing_keyframe);
          });
          this.ptc_spacing_keyframes.sort(Keyframe.compare);
          break;
        case "position":
          json[key].forEach((position_json: any): void => {
            const ptc_position_keyframe = new PtcPositionKeyframe().load(position_json);
            this.min_time = Math.min(this.min_time, ptc_position_keyframe.time);
            this.max_time = Math.max(this.max_time, ptc_position_keyframe.time);
            this.ptc_position_keyframes.push(ptc_position_keyframe);
          });
          this.ptc_position_keyframes.sort(Keyframe.compare);
          break;
        case "rotation":
          json[key].forEach((rotation_json: any): void => {
            const ptc_rotation_keyframe = new PtcRotationKeyframe().load(rotation_json);
            this.min_time = Math.min(this.min_time, ptc_rotation_keyframe.time);
            this.max_time = Math.max(this.max_time, ptc_rotation_keyframe.time);
            this.ptc_rotation_keyframes.push(ptc_rotation_keyframe);
          });
          this.ptc_rotation_keyframes.sort(Keyframe.compare);
          break;
        default:
          console.log("TODO: PtcTimeline::load", key);
          break;
      }
    });

    return this;
  }
}

export class FfdKeyframe extends Keyframe {
  public curve = new Curve();
  public offset = 0;
  public vertices: number[] = [];

  constructor() {
    super();
  }

  public load(json: any): FfdKeyframe {
    super.load(json);
    this.curve.load(json.curve);
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
      const ffd_keyframe = new FfdKeyframe().load(ffd_keyframe_json);
      this.min_time = Math.min(this.min_time, ffd_keyframe.time);
      this.max_time = Math.max(this.max_time, ffd_keyframe.time);
      this.ffd_keyframes.push(ffd_keyframe);
    });
    this.ffd_keyframes.sort(Keyframe.compare);
    return this;
  }
}

export class FfdSlot {
  public ffd_attachments: {[key: string]: FfdAttachment} = {};
  public ffd_attachment_keys: string[] = [];

  public load(json: any): FfdSlot {
    this.ffd_attachments = {};
    this.ffd_attachment_keys = Object.keys(json || {});
    this.ffd_attachment_keys.forEach((key: string): void => {
      this.ffd_attachments[key] = new FfdAttachment().load(json[key]);
    });
    return this;
  }

  public iterateAttachments(callback: (ffd_attachment_key: string, ffd_attachment: FfdAttachment) => void): void {
    this.ffd_attachment_keys.forEach((ffd_attachment_key: string): void => {
      const ffd_attachment = this.ffd_attachments[ffd_attachment_key];
      callback(ffd_attachment_key, ffd_attachment);
    });
  }
}

export class FfdTimeline {
  public min_time: number = 0;
  public max_time: number = 0;
  public ffd_slots: {[key: string]: FfdSlot} = {};
  public ffd_slot_keys: string[] = [];

  public load(json: any): FfdTimeline {
    this.min_time = 0;
    this.max_time = 0;
    this.ffd_slots = {};
    this.ffd_slot_keys = Object.keys(json || {});
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
    this.ffd_slot_keys.forEach((ffd_slot_key: string): void => {
      const ffd_slot = this.ffd_slots[ffd_slot_key];
      ffd_slot.iterateAttachments((ffd_attachment_key: string, ffd_attachment: FfdAttachment): void => {
        callback(ffd_slot_key, ffd_slot, ffd_attachment_key, ffd_attachment);
      });
    });
  }
}

export class Animation {
  public name: string = "";
  public bone_timeline_map: {[key: string]: BoneTimeline} = {};
  public slot_timeline_map: {[key: string]: SlotTimeline} = {};
  public event_keyframes: EventKeyframe[];
  public order_keyframes: OrderKeyframe[];
  public ikc_timeline_map: {[key: string]: IkcTimeline} = {};
  public xfc_timeline_map: {[key: string]: XfcTimeline} = {};
  public ptc_timeline_map: {[key: string]: PtcTimeline} = {};
  public ffd_timeline_map: {[key: string]: FfdTimeline} = {};
  public min_time = 0;
  public max_time = 0;
  public length = 0;

  public load(json: any): Animation {
    this.bone_timeline_map = {};
    this.slot_timeline_map = {};
    delete this.event_keyframes;
    delete this.order_keyframes;
    this.ikc_timeline_map = {};
    this.xfc_timeline_map = {};
    this.ptc_timeline_map = {};
    this.ffd_timeline_map = {};

    this.min_time = 0;
    this.max_time = 0;

    Object.keys(json || {}).forEach((key: string): void => {
      switch (key) {
        case "bones":
          Object.keys(json[key] || {}).forEach((bone_key: string): void => {
            const bone_timeline = new BoneTimeline().load(json[key][bone_key]);
            this.min_time = Math.min(this.min_time, bone_timeline.min_time);
            this.max_time = Math.max(this.max_time, bone_timeline.max_time);
            this.bone_timeline_map[bone_key] = bone_timeline;
          });
          break;
        case "slots":
          Object.keys(json[key] || {}).forEach((slot_key: string): void => {
            const slot_timeline = new SlotTimeline().load(json[key][slot_key]);
            this.min_time = Math.min(this.min_time, slot_timeline.min_time);
            this.max_time = Math.max(this.max_time, slot_timeline.max_time);
            this.slot_timeline_map[slot_key] = slot_timeline;
          });
          break;
        case "events":
          this.event_keyframes = [];
          json[key].forEach((event: any): void => {
            const event_keyframe = new EventKeyframe().load(event);
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
            const order_keyframe = new OrderKeyframe().load(order);
            this.min_time = Math.min(this.min_time, order_keyframe.time);
            this.max_time = Math.max(this.max_time, order_keyframe.time);
            this.order_keyframes.push(order_keyframe);
          });
          this.order_keyframes.sort(Keyframe.compare);
          break;
        case "ik":
          Object.keys(json[key] || {}).forEach((ikc_key: string): void => {
            const ikc_timeline = new IkcTimeline().load(json[key][ikc_key]);
            this.min_time = Math.min(this.min_time, ikc_timeline.min_time);
            this.max_time = Math.max(this.max_time, ikc_timeline.max_time);
            this.ikc_timeline_map[ikc_key] = ikc_timeline;
          });
          break;
        case "transform":
          Object.keys(json[key] || {}).forEach((xfc_key: string): void => {
            const xfc_timeline = new XfcTimeline().load(json[key][xfc_key]);
            this.min_time = Math.min(this.min_time, xfc_timeline.min_time);
            this.max_time = Math.max(this.max_time, xfc_timeline.max_time);
            this.xfc_timeline_map[xfc_key] = xfc_timeline;
          });
          break;
        case "paths":
          Object.keys(json[key] || {}).forEach((ptc_key: string): void => {
            const ptc_timeline = new PtcTimeline().load(json[key][ptc_key]);
            this.min_time = Math.min(this.min_time, ptc_timeline.min_time);
            this.max_time = Math.max(this.max_time, ptc_timeline.max_time);
            this.ptc_timeline_map[ptc_key] = ptc_timeline;
          });
          break;
        case "ffd":
        case "deform":
          Object.keys(json[key] || {}).forEach((ffd_key: string): void => {
            const ffd_timeline = new FfdTimeline().load(json[key][ffd_key]);
            this.min_time = Math.min(this.min_time, ffd_timeline.min_time);
            this.max_time = Math.max(this.max_time, ffd_timeline.max_time);
            this.ffd_timeline_map[ffd_key] = ffd_timeline;
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

  public load(json: any): any {
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
  public bones: {[key: string]: Bone} = {};
  public bone_keys: string[] = [];
  public ikcs: {[key: string]: Ikc} = {};
  public ikc_keys: string[] = [];
  public xfcs: {[key: string]: Xfc} = {};
  public xfc_keys: string[] = [];
  public ptcs: {[key: string]: Ptc} = {};
  public ptc_keys: string[] = [];
  public slots: {[key: string]: Slot} = {};
  public slot_keys: string[] = [];
  public skins: {[key: string]: Skin} = {};
  public skin_keys: string[] = [];
  public events: {[key: string]: Event} = {};
  public event_keys: string[] = [];
  public anims: {[key: string]: Animation} = {};
  public anim_keys: string[] = [];

  public load(json: any): Data {
    this.bones = {};
    this.bone_keys = [];
    this.ikcs = {};
    this.ikc_keys = [];
    this.xfcs = {};
    this.xfc_keys = [];
    this.ptcs = {};
    this.ptc_keys = [];
    this.slots = {};
    this.slot_keys = [];
    this.skins = {};
    this.skin_keys = [];
    this.events = {};
    this.event_keys = [];
    this.anims = {};
    this.anim_keys = [];

    Object.keys(json || {}).forEach((key: string): void => {
      switch (key) {
        case "skeleton":
          this.skeleton.load(json[key]);
          break;
        case "bones":
          const json_bones: any[] = json[key];
          json_bones.forEach((bone: any, bone_index: number): void => {
            this.bones[bone.name] = new Bone().load(bone);
            this.bone_keys[bone_index] = bone.name;
          });
          break;
        case "ik":
          const json_ik: any[] = json[key];
          json_ik.forEach((ikc: any, ikc_index: number): void => {
            this.ikcs[ikc.name] = new Ikc().load(ikc);
            this.ikc_keys[ikc_index] = ikc.name;
          });
          // sort by order
          this.ikc_keys.sort((a: string, b: string): number => {
            const ikc_a: Ikc = this.ikcs[a];
            const ikc_b: Ikc = this.ikcs[b];
            return ikc_a.order - ikc_b.order;
          });
          break;
        case "transform":
          const json_transform: any[] = json[key];
          json_transform.forEach((xfc: any, xfc_index: number): void => {
            this.xfcs[xfc.name] = new Xfc().load(xfc);
            this.xfc_keys[xfc_index] = xfc.name;
          });
          // sort by order
          this.xfc_keys.sort((a: string, b: string): number => {
            const xfc_a: Xfc = this.xfcs[a];
            const xfc_b: Xfc = this.xfcs[b];
            return xfc_a.order - xfc_b.order;
          });
          break;
        case "path":
          const json_path: any[] = json[key];
          json_path.forEach((ptc: any, ptc_index: number): void => {
            this.ptcs[ptc.name] = new Ptc().load(ptc);
            this.ptc_keys[ptc_index] = ptc.name;
          });
          break;
        case "slots":
          const json_slots: any[] = json[key];
          json_slots.forEach((slot: any, slot_index: number): void => {
            this.slots[slot.name] = new Slot().load(slot);
            this.slot_keys[slot_index] = slot.name;
          });
          break;
        case "skins":
          const json_skins: any = json[key] || {};
          this.skin_keys = Object.keys(json_skins);
          this.skin_keys.forEach((skin_key: string): void => {
            const skin = this.skins[skin_key] = new Skin().load(json_skins[skin_key]);
            skin.name = skin.name || skin_key;
          });
          break;
        case "events":
          const json_events: any = json[key] || {};
          this.event_keys = Object.keys(json_events);
          this.event_keys.forEach((event_key: string): void => {
            const event: Event = this.events[event_key] = new Event().load(json_events[event_key]);
            event.name = event.name || event_key;
          });
          break;
        case "animations":
          const json_animations: any = json[key] || {};
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
    const anim = this.anims[name] = new Animation().load(json);
    anim.name = anim.name || name;
    return this;
  }

  public getSkins(): {[key: string]: Skin} {
    return this.skins;
  }

  public getEvents(): {[key: string]: Event} {
    return this.events;
  }

  public getAnims(): {[key: string]: Animation} {
    return this.anims;
  }

  public iterateBones(callback: (bone_key: string, bone: Bone) => void): void {
    this.bone_keys.forEach((bone_key: string): void => {
      const data_bone: Bone = this.bones[bone_key];
      callback(bone_key, data_bone);
    });
  }

  public iterateAttachments(skin_key: string, callback: (slot_key: string, data_slot: Slot, skin_slot: SkinSlot, attachment_key: string, attachment: Attachment) => void): void {
    const skin: Skin = this.skins[skin_key];
    const default_skin: Skin = this.skins["default"];
    this.slot_keys.forEach((slot_key: string): void => {
      const data_slot: Slot = this.slots[slot_key];
      const skin_slot: SkinSlot = skin && (skin.slots[slot_key] || default_skin.slots[slot_key]);
      let attachment: Attachment = skin_slot && skin_slot.attachments[data_slot.attachment_key];
      let attachment_key: string = (attachment && attachment.name) || data_slot.attachment_key;
      if (attachment && ((attachment.type === "linkedmesh") || (attachment.type === "weightedlinkedmesh"))) {
        attachment_key = attachment && (<LinkedMeshAttachment>attachment).parent_key;
        attachment = skin_slot && skin_slot.attachments[attachment_key];
      }
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
  public bones: {[key: string]: Bone} = {};
  public bone_keys: string[] = [];
  public slots: {[key: string]: Slot} = {};
  public slot_keys: string[] = [];
  public events: Event[] = [];

  constructor(data: Data) {
    this.data = data;
  }

  public curSkel(): Skeleton {
    const data: Data = this.data;
    return data && data.skeleton;
  }

  public getSkins(): {[key: string]: Skin} {
    const data: Data = this.data;
    return data && data.skins;
  }

  public curSkin(): Skin {
    const data: Data = this.data;
    return data && data.skins[this.skin_key];
  }

  public getSkin(): string {
    return this.skin_key;
  }

  public setSkin(skin_key: string): void {
    if (this.skin_key !== skin_key) {
      this.skin_key = skin_key;
    }
  }

  public getEvents(): {[key: string]: Event} {
    const data: Data = this.data;
    return data && data.events;
  }

  public getAnims(): {[key: string]: Animation} {
    const data: Data = this.data;
    return data && data.anims;
  }

  public curAnim(): Animation {
    const data: Data = this.data;
    return data && data.anims[this.anim_key];
  }

  public curAnimLength(): number {
    const data: Data = this.data;
    const anim: Animation = data && data.anims[this.anim_key];
    return (anim && anim.length) || 0;
  }

  public getAnim(): string {
    return this.anim_key;
  }

  public setAnim(anim_key: string): void {
    if (this.anim_key !== anim_key) {
      this.anim_key = anim_key;
      const data: Data = this.data;
      const anim: Animation = data && data.anims[this.anim_key];
      if (anim) {
        this.time = wrap(this.time, anim.min_time, anim.max_time);
      }
      this.elapsed_time = 0;
      this.dirty = true;
    }
  }

  public getTime(): number {
    return this.time;
  }

  public setTime(time: number): void {
    const data: Data = this.data;
    const anim: Animation = data && data.anims[this.anim_key];
    if (anim) {
      time = wrap(time, anim.min_time, anim.max_time);
    }

    if (this.time !== time) {
      this.time = time;
      this.elapsed_time = 0;
      this.dirty = true;
    }
  }

  public update(elapsed_time: number): void {
    this.elapsed_time += elapsed_time;
    this.dirty = true;
  }

  public strike(): void {
    if (!this.dirty) {
      return;
    }
    this.dirty = false;

    const data: Data = this.data;

    const anim: Animation = data && data.anims[this.anim_key];

    const prev_time: number = this.time;
    const elapsed_time: number = this.elapsed_time;

    this.time = this.time + this.elapsed_time; // accumulate elapsed time
    this.elapsed_time = 0; // reset elapsed time for next strike

    let wrapped_min: boolean = false;
    let wrapped_max: boolean = false;
    if (anim) {
      wrapped_min = (elapsed_time < 0) && (this.time <= anim.min_time);
      wrapped_max = (elapsed_time > 0) && (this.time >= anim.max_time);
      this.time = wrap(this.time, anim.min_time, anim.max_time);
    }

    const time: number = this.time;

    let keyframe_index: number;
    let pct: number;

    // bones

    data.bone_keys.forEach((bone_key: string): void => {
      const data_bone: Bone = data.bones[bone_key];
      const pose_bone: Bone = this.bones[bone_key] || (this.bones[bone_key] = new Bone());

      // start with a copy of the data bone
      pose_bone.copy(data_bone);

      // tween anim bone if keyframes are available
      const bone_timeline: BoneTimeline = anim && anim.bone_timeline_map[bone_key];
      if (bone_timeline) {
        keyframe_index = Keyframe.find(bone_timeline.position_keyframes, time);
        if (keyframe_index !== -1) {
          const position_keyframe0: PositionKeyframe = bone_timeline.position_keyframes[keyframe_index];
          const position_keyframe1: PositionKeyframe = bone_timeline.position_keyframes[keyframe_index + 1];
          if (position_keyframe1) {
            pct = position_keyframe0.curve.evaluate((time - position_keyframe0.time) / (position_keyframe1.time - position_keyframe0.time));
            pose_bone.local_space.position.x += tween(position_keyframe0.position.x, position_keyframe1.position.x, pct);
            pose_bone.local_space.position.y += tween(position_keyframe0.position.y, position_keyframe1.position.y, pct);
          } else {
            pose_bone.local_space.position.x += position_keyframe0.position.x;
            pose_bone.local_space.position.y += position_keyframe0.position.y;
          }
        }

        keyframe_index = Keyframe.find(bone_timeline.rotation_keyframes, time);
        if (keyframe_index !== -1) {
          const rotation_keyframe0: RotationKeyframe = bone_timeline.rotation_keyframes[keyframe_index];
          const rotation_keyframe1: RotationKeyframe = bone_timeline.rotation_keyframes[keyframe_index + 1];
          if (rotation_keyframe1) {
            pct = rotation_keyframe0.curve.evaluate((time - rotation_keyframe0.time) / (rotation_keyframe1.time - rotation_keyframe0.time));
            pose_bone.local_space.rotation.rad += tweenAngle(rotation_keyframe0.rotation.rad, rotation_keyframe1.rotation.rad, pct);
          } else {
            pose_bone.local_space.rotation.rad += rotation_keyframe0.rotation.rad;
          }
        }

        keyframe_index = Keyframe.find(bone_timeline.scale_keyframes, time);
        if (keyframe_index !== -1) {
          const scale_keyframe0: ScaleKeyframe = bone_timeline.scale_keyframes[keyframe_index];
          const scale_keyframe1: ScaleKeyframe = bone_timeline.scale_keyframes[keyframe_index + 1];
          if (scale_keyframe1) {
            pct = scale_keyframe0.curve.evaluate((time - scale_keyframe0.time) / (scale_keyframe1.time - scale_keyframe0.time));
            pose_bone.local_space.scale.a *= tween(scale_keyframe0.scale.a, scale_keyframe1.scale.a, pct);
            pose_bone.local_space.scale.d *= tween(scale_keyframe0.scale.d, scale_keyframe1.scale.d, pct);
          } else {
            pose_bone.local_space.scale.a *= scale_keyframe0.scale.a;
            pose_bone.local_space.scale.d *= scale_keyframe0.scale.d;
          }
        }

        keyframe_index = Keyframe.find(bone_timeline.shear_keyframes, time);
        if (keyframe_index !== -1) {
          const shear_keyframe0: ShearKeyframe = bone_timeline.shear_keyframes[keyframe_index];
          const shear_keyframe1: ShearKeyframe = bone_timeline.shear_keyframes[keyframe_index + 1];
          if (shear_keyframe1) {
            pct = shear_keyframe0.curve.evaluate((time - shear_keyframe0.time) / (shear_keyframe1.time - shear_keyframe0.time));
            pose_bone.local_space.shear.x.rad += tweenAngle(shear_keyframe0.shear.x.rad, shear_keyframe1.shear.x.rad, pct);
            pose_bone.local_space.shear.y.rad += tweenAngle(shear_keyframe0.shear.y.rad, shear_keyframe1.shear.y.rad, pct);
          } else {
            pose_bone.local_space.shear.x.rad += shear_keyframe0.shear.x.rad;
            pose_bone.local_space.shear.y.rad += shear_keyframe0.shear.y.rad;
          }
        }
      }
    });

    this.bone_keys = data.bone_keys;

    // ik constraints

    data.ikc_keys.forEach((ikc_key: string): void => {
      const ikc: Ikc = data.ikcs[ikc_key];
      let ikc_mix: number = ikc.mix;
      let ikc_bend_positive: boolean = ikc.bend_positive;

      const ikc_timeline: IkcTimeline = anim && anim.ikc_timeline_map[ikc_key];
      if (ikc_timeline) {
        keyframe_index = Keyframe.find(ikc_timeline.ikc_keyframes, time);
        if (keyframe_index !== -1) {
          const ikc_keyframe0: IkcKeyframe = ikc_timeline.ikc_keyframes[keyframe_index];
          const ikc_keyframe1: IkcKeyframe = ikc_timeline.ikc_keyframes[keyframe_index + 1];
          if (ikc_keyframe1) {
            pct = ikc_keyframe0.curve.evaluate((time - ikc_keyframe0.time) / (ikc_keyframe1.time - ikc_keyframe0.time));
            ikc_mix = tween(ikc_keyframe0.mix, ikc_keyframe1.mix, pct);
          } else {
            ikc_mix = ikc_keyframe0.mix;
          }
          // no tweening ik bend direction
          ikc_bend_positive = ikc_keyframe0.bend_positive;
        }
      }

      const alpha: number = ikc_mix;
      const bendDir: number = (ikc_bend_positive) ? (1) : (-1);

      if (alpha === 0) {
        return;
      }

      const target: Bone = this.bones[ikc.target_key];
      Bone.flatten(target, this.bones);

      switch (ikc.bone_keys.length) {
        case 1: {
          const bone: Bone = this.bones[ikc.bone_keys[0]];
          Bone.flatten(bone, this.bones);
          let a1: number = Math.atan2(target.world_space.position.y - bone.world_space.position.y, target.world_space.position.x - bone.world_space.position.x);
          const bone_parent: Bone = this.bones[bone.parent_key];
          if (bone_parent) {
            Bone.flatten(bone_parent, this.bones);
            if (Matrix.determinant(bone_parent.world_space.scale) < 0) {
              a1 += bone_parent.world_space.rotation.rad;
            } else {
              a1 -= bone_parent.world_space.rotation.rad;
            }
          }
          bone.local_space.rotation.rad = tweenAngle(bone.local_space.rotation.rad, a1, alpha);
          break;
        }
        case 2: {
          const parent: Bone = this.bones[ikc.bone_keys[0]];
          Bone.flatten(parent, this.bones);
          const child: Bone = this.bones[ikc.bone_keys[1]];
          Bone.flatten(child, this.bones);
          ///const px: number = parent.local_space.position.x;
          ///const py: number = parent.local_space.position.y;
          let psx: number = parent.local_space.scale.x;
          let psy: number = parent.local_space.scale.y;
          let cy: number = child.local_space.position.y;
          let csx: number = child.local_space.scale.x;
          let offset1: number = 0, offset2: number = 0, sign2: number = 1;
          if (psx < 0) {
            psx = -psx;
            offset1 = Math.PI;
            sign2 = -1;
          }
          if (psy < 0) {
            psy = -psy;
            sign2 = -sign2;
          }
          if (csx < 0) {
            csx = -csx;
            offset2 = Math.PI;
          }
          const t: Vector = Vector.copy(target.world_space.position, new Vector());
          const d: Vector = Vector.copy(child.world_space.position, new Vector());
          const pp: Bone = this.bones[parent.parent_key];
          if (pp) {
            Bone.flatten(pp, this.bones);
            Space.untransform(pp.world_space, t, t);
            Space.untransform(pp.world_space, d, d);
          }
          Vector.subtract(t, parent.local_space.position, t);
          Vector.subtract(d, parent.local_space.position, d);
          const tx: number = t.x, ty: number = t.y;
          const dx: number = d.x, dy: number = d.y;
          let l1: number = Math.sqrt(dx * dx + dy * dy), l2: number = child.length * csx, a1: number, a2: number;
          outer:
          if (Math.abs(psx - psy) <= 0.0001) {
            l2 *= psx;
            let cos: number = (tx * tx + ty * ty - l1 * l1 - l2 * l2) / (2 * l1 * l2);
            if (cos < -1) cos = -1; else if (cos > 1) cos = 1; // clamp
            a2 = Math.acos(cos) * bendDir;
            const adj: number = l1 + l2 * cos;
            const opp: number = l2 * Math.sin(a2);
            a1 = Math.atan2(ty * adj - tx * opp, tx * adj + ty * opp);
          } else {
            cy = 0;
            const a: number = psx * l2;
            const b: number = psy * l2;
            const ta: number = Math.atan2(ty, tx);
            const aa: number = a * a;
            const bb: number = b * b;
            const ll: number = l1 * l1;
            const dd: number = tx * tx + ty * ty;
            const c0: number = bb * ll + aa * dd - aa * bb;
            const c1: number = -2 * bb * l1;
            const c2: number = bb - aa;
            const _d: number = c1 * c1 - 4 * c2 * c0;
            if (_d >= 0) {
              let q: number = Math.sqrt(_d);
              if (c1 < 0) q = -q;
              q = -(c1 + q) / 2;
              const r0: number = q / c2, r1 = c0 / q;
              const r: number = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
              if (r * r <= dd) {
                const y: number = Math.sqrt(dd - r * r) * bendDir;
                a1 = ta - Math.atan2(y, r);
                a2 = Math.atan2(y / psy, (r - l1) / psx);
                break outer;
              }
            }
            let minAngle: number = 0, minDist: number = Number.MAX_VALUE, minX: number = 0, minY: number = 0;
            let maxAngle: number = 0, maxDist: number = 0, maxX: number = 0, maxY: number = 0;
            let angle: number, dist: number, x: number, y: number;
            x = l1 + a; dist = x * x;
            if (dist > maxDist) { maxAngle = 0; maxDist = dist; maxX = x; }
            x = l1 - a; dist = x * x;
            if (dist < minDist) { minAngle = Math.PI; minDist = dist; minX = x; }
            angle = Math.acos(-a * l1 / (aa - bb));
            x = a * Math.cos(angle) + l1;
            y = b * Math.sin(angle);
            dist = x * x + y * y;
            if (dist < minDist) { minAngle = angle; minDist = dist; minX = x; minY = y; }
            if (dist > maxDist) { maxAngle = angle; maxDist = dist; maxX = x; maxY = y; }
            if (dd <= (minDist + maxDist) / 2) {
              a1 = ta - Math.atan2(minY * bendDir, minX);
              a2 = minAngle * bendDir;
            } else {
              a1 = ta - Math.atan2(maxY * bendDir, maxX);
              a2 = maxAngle * bendDir;
            }
          }
          const offset: number = Math.atan2(cy, child.local_space.position.x) * sign2;
          a1 = (a1 - offset) + offset1;
          a2 = (a2 + offset) * sign2 + offset2;
          parent.local_space.rotation.rad = tweenAngle(parent.local_space.rotation.rad, a1, alpha);
          child.local_space.rotation.rad = tweenAngle(child.local_space.rotation.rad, a2, alpha);
          break;
        }
      }
    });

    this.iterateBones((bone_key: string, bone: Bone): void => {
      Bone.flatten(bone, this.bones);
    });

    // transform constraints

    data.xfc_keys.forEach((xfc_key: string): void => {
      const xfc: Xfc = data.xfcs[xfc_key];
      let xfc_position_mix: number = xfc.position_mix;
      let xfc_rotation_mix: number = xfc.rotation_mix;
      let xfc_scale_mix: number = xfc.scale_mix;
      let xfc_shear_mix: number = xfc.shear_mix;

      const xfc_timeline: XfcTimeline = anim && anim.xfc_timeline_map[xfc_key];
      if (xfc_timeline) {
        keyframe_index = Keyframe.find(xfc_timeline.xfc_keyframes, time);
        if (keyframe_index !== -1) {
          const xfc_keyframe0: XfcKeyframe = xfc_timeline.xfc_keyframes[keyframe_index];
          const xfc_keyframe1: XfcKeyframe = xfc_timeline.xfc_keyframes[keyframe_index + 1];
          if (xfc_keyframe1) {
            pct = xfc_keyframe0.curve.evaluate((time - xfc_keyframe0.time) / (xfc_keyframe1.time - xfc_keyframe0.time));
            xfc_position_mix = tween(xfc_keyframe0.position_mix, xfc_keyframe1.position_mix, pct);
            xfc_rotation_mix = tween(xfc_keyframe0.rotation_mix, xfc_keyframe1.rotation_mix, pct);
            xfc_scale_mix = tween(xfc_keyframe0.scale_mix, xfc_keyframe1.scale_mix, pct);
            xfc_shear_mix = tween(xfc_keyframe0.shear_mix, xfc_keyframe1.shear_mix, pct);
          } else {
            xfc_position_mix = xfc_keyframe0.position_mix;
            xfc_rotation_mix = xfc_keyframe0.rotation_mix;
            xfc_scale_mix = xfc_keyframe0.scale_mix;
            xfc_shear_mix = xfc_keyframe0.shear_mix;
          }
        }
      }

      const xfc_bone: Bone = this.bones[xfc.bone_key];
      const xfc_target: Bone = this.bones[xfc.target_key];
      const xfc_position: Vector = xfc.position;
      ///const xfc_rotation = xfc.rotation;
      ///const xfc_scale = xfc.scale;
      ///const xfc_shear = xfc.shear;
      const xfc_world_position: Vector = Space.transform(xfc_target.world_space, xfc_position, new Vector());
      // TODO
      xfc_bone.world_space.position.tween(xfc_world_position, xfc_position_mix, xfc_bone.world_space.position);
    });

    // slots

    data.slot_keys.forEach((slot_key: string): void => {
      const data_slot: Slot = data.slots[slot_key];
      const pose_slot: Slot = this.slots[slot_key] || (this.slots[slot_key] = new Slot());

      // start with a copy of the data slot
      pose_slot.copy(data_slot);

      // tween anim slot if keyframes are available
      const slot_timeline: SlotTimeline = anim && anim.slot_timeline_map[slot_key];
      if (slot_timeline) {
        keyframe_index = Keyframe.find(slot_timeline.color_keyframes, time);
        if (keyframe_index !== -1) {
          const color_keyframe0: ColorKeyframe = slot_timeline.color_keyframes[keyframe_index];
          const color_keyframe1: ColorKeyframe = slot_timeline.color_keyframes[keyframe_index + 1];
          if (color_keyframe1) {
            pct = color_keyframe0.curve.evaluate((time - color_keyframe0.time) / (color_keyframe1.time - color_keyframe0.time));
            color_keyframe0.color.tween(color_keyframe1.color, pct, pose_slot.color);
          } else {
            pose_slot.color.copy(color_keyframe0.color);
          }
        }

        keyframe_index = Keyframe.find(slot_timeline.attachment_keyframes, time);
        if (keyframe_index !== -1) {
          const attachment_keyframe0: AttachmentKeyframe = slot_timeline.attachment_keyframes[keyframe_index];
          // no tweening attachments
          pose_slot.attachment_key = attachment_keyframe0.name;
        }
      }
    });

    this.slot_keys = data.slot_keys;

    if (anim) {
      keyframe_index = Keyframe.find(anim.order_keyframes, time);
      if (keyframe_index !== -1) {
        const order_keyframe: OrderKeyframe = anim.order_keyframes[keyframe_index];
        this.slot_keys = data.slot_keys.slice(0); // copy array before reordering
        order_keyframe.slot_offsets.forEach((slot_offset: SlotOffset): void => {
          const slot_index: number = this.slot_keys.indexOf(slot_offset.slot_key);
          if (slot_index !== -1) {
            // delete old position
            this.slot_keys.splice(slot_index, 1);
            // insert new position
            this.slot_keys.splice(slot_index + slot_offset.offset, 0, slot_offset.slot_key);
          }
        });
      }
    }

    // path constraints

    data.ptc_keys.forEach((ptc_key: string): void => {
      const ptc: Ptc = data.ptcs[ptc_key];
      ///const ptc_spacing_mode: string = ptc.spacing_mode;
      let ptc_spacing: number = ptc.spacing;
      ///const ptc_position_mode: string = ptc.position_mode;
      let ptc_position_mix: number = ptc.position_mix;
      let ptc_position: number = ptc.position;
      ///const ptc_rotation_mode: string = ptc.rotation_mode;
      let ptc_rotation_mix: number = ptc.rotation_mix;
      const ptc_rotation: Rotation = ptc.rotation;

      const ptc_timeline: PtcTimeline = anim && anim.ptc_timeline_map[ptc_key];
      if (ptc_timeline) {
        keyframe_index = Keyframe.find(ptc_timeline.ptc_spacing_keyframes, time);
        if (keyframe_index !== -1) {
          const ptc_spacing_keyframe0: PtcSpacingKeyframe = ptc_timeline.ptc_spacing_keyframes[keyframe_index];
          const ptc_spacing_keyframe1: PtcSpacingKeyframe = ptc_timeline.ptc_spacing_keyframes[keyframe_index + 1];
          if (ptc_spacing_keyframe1) {
            pct = ptc_spacing_keyframe0.curve.evaluate((time - ptc_spacing_keyframe0.time) / (ptc_spacing_keyframe1.time - ptc_spacing_keyframe0.time));
            ptc_spacing = tween(ptc_spacing_keyframe0.spacing, ptc_spacing_keyframe1.spacing, pct);
          } else {
            ptc_spacing = ptc_spacing_keyframe0.spacing;
          }
        }

        keyframe_index = Keyframe.find(ptc_timeline.ptc_position_keyframes, time);
        if (keyframe_index !== -1) {
          const ptc_position_keyframe0: PtcPositionKeyframe = ptc_timeline.ptc_position_keyframes[keyframe_index];
          const ptc_position_keyframe1: PtcPositionKeyframe = ptc_timeline.ptc_position_keyframes[keyframe_index + 1];
          if (ptc_position_keyframe1) {
            pct = ptc_position_keyframe0.curve.evaluate((time - ptc_position_keyframe0.time) / (ptc_position_keyframe1.time - ptc_position_keyframe0.time));
            ptc_position_mix = tween(ptc_position_keyframe0.position_mix, ptc_position_keyframe1.position_mix, pct);
            ptc_position = tween(ptc_position_keyframe0.position, ptc_position_keyframe1.position, pct);
          } else {
            ptc_position_mix = ptc_position_keyframe0.position_mix;
            ptc_position = ptc_position_keyframe0.position;
          }
        }

        keyframe_index = Keyframe.find(ptc_timeline.ptc_rotation_keyframes, time);
        if (keyframe_index !== -1) {
          const ptc_rotation_keyframe0: PtcRotationKeyframe = ptc_timeline.ptc_rotation_keyframes[keyframe_index];
          const ptc_rotation_keyframe1: PtcRotationKeyframe = ptc_timeline.ptc_rotation_keyframes[keyframe_index + 1];
          if (ptc_rotation_keyframe1) {
            pct = ptc_rotation_keyframe0.curve.evaluate((time - ptc_rotation_keyframe0.time) / (ptc_rotation_keyframe1.time - ptc_rotation_keyframe0.time));
            ptc_rotation_mix = tween(ptc_rotation_keyframe0.rotation_mix, ptc_rotation_keyframe1.rotation_mix, pct);
            ptc_rotation.deg = tween(ptc_rotation_keyframe0.rotation, ptc_rotation_keyframe1.rotation, pct);
          } else {
            ptc_rotation_mix = ptc_rotation_keyframe0.rotation_mix;
            ptc_rotation.deg = ptc_rotation_keyframe0.rotation;
          }
        }
      }

      ///const skin = data && data.skins[pose.skin_key];
      ///const default_skin = data && data.skins["default"];
      ///const slot_key = ptc.target_key;
      ///const pose_slot = pose.slots[slot_key];
      ///const skin_slot = skin && (skin.slots[slot_key] || default_skin.slots[slot_key]);
      ///const ptc_target = skin_slot && skin_slot.attachments[pose_slot.attachment_key];

      ///ptc.bone_keys.forEach(function(bone_key) {
      ///  const ptc_bone = pose.bones[bone_key];
      ///  // TODO
      ///});
    });

    // events

    this.events.length = 0;

    if (anim && anim.event_keyframes) {
      const make_event = function(event_keyframe: EventKeyframe): Event {
        const pose_event: Event = new Event();
        const data_event: Event = data.events[event_keyframe.name];
        if (data_event) {
          pose_event.copy(data_event);
        }
        pose_event.int_value = event_keyframe.int_value || pose_event.int_value;
        pose_event.float_value = event_keyframe.float_value || pose_event.float_value;
        pose_event.string_value = event_keyframe.string_value || pose_event.string_value;
        return pose_event;
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
              this.events.push(make_event(event_keyframe));
            }
          });
        } else {
          // min       time          prev_time    max
          //  |         |                |         |
          //            o<---------------x
          // all events between time and prev_time, not including prev_time
          anim.event_keyframes.forEach((event_keyframe: EventKeyframe): void => {
            if ((time <= event_keyframe.time) && (event_keyframe.time < prev_time)) {
              this.events.push(make_event(event_keyframe));
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
                this.events.push(make_event(event_keyframe));
            }
          });
        } else {
          // min    prev_time           time      max
          //  |         |                |         |
          //            x--------------->o
          // all events between prev_time and time, not including prev_time
          anim.event_keyframes.forEach((event_keyframe: EventKeyframe): void => {
            if ((prev_time < event_keyframe.time) && (event_keyframe.time <= time)) {
              this.events.push(make_event(event_keyframe));
            }
          });
        }
      }
    }
  }

  public iterateBones(callback: (bone_key: string, bone: Bone) => void): void {
    this.bone_keys.forEach((bone_key: string): void => {
      const bone: Bone = this.bones[bone_key];
      callback(bone_key, bone);
    });
  }

  public iterateAttachments(callback: (slot_key: string, pose_slot: Slot, skin_slot: SkinSlot, attachment_key: string, attachment: Attachment) => void): void {
    const data: Data = this.data;
    const skin: Skin = data && data.skins[this.skin_key];
    const default_skin: Skin = data && data.skins["default"];
    this.slot_keys.forEach((slot_key: string): void => {
      const pose_slot: Slot = this.slots[slot_key];
      const skin_slot: SkinSlot = skin && (skin.slots[slot_key] || default_skin.slots[slot_key]);
      let attachment: Attachment = skin_slot && skin_slot.attachments[pose_slot.attachment_key];
      let attachment_key: string = (attachment && attachment.name) || pose_slot.attachment_key;
      if (attachment && ((attachment.type === "linkedmesh") || (attachment.type === "weightedlinkedmesh"))) {
        attachment_key = attachment && (<LinkedMeshAttachment>attachment).parent_key;
        attachment = skin_slot && skin_slot.attachments[attachment_key];
      }
      callback(slot_key, pose_slot, skin_slot, attachment_key, attachment);
    });
  }
}
