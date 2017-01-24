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

export { SpineMap as Map }

class SpineMap<K, V> {
  public keys: K[] = [];
  public map: Map<K, V>;

  constructor(...args: any[]) {
    this.map = new Map<K, V>(args);
    this.map.forEach((value: V, key: K): void => {
      this.keys.push(key);
    });
  }

  public clear(): void {
    this.keys.length = 0;
    this.map.clear();
  }

  public has(key: K): boolean {
    return this.map.has(key);
  }

  public hasByIndex(index: number): boolean {
    return this.has(this.keys[index]);
  }

  public get(key: K): V | undefined {
    return this.map.get(key);
  }

  public getByIndex(index: number): V | undefined {
    return this.get(this.keys[index]);
  }

  public set(key: K, value: V): V {
    if (!this.map.has(key)) {
      this.keys.push(key);
    }
    this.map.set(key, value);
    return value;
  }

  public setByIndex(index: number, value: V): V {
    return this.set(this.keys[index], value);
  }

  public delete(key: K): void {
    this.keys.splice(this.keys.indexOf(key), 1);
    this.map.delete(key);
  }

  public deleteByIndex(index: number): void {
    this.delete(this.keys[index]);
  }

  public forEach(callback: (value: V, key: K, index: number, map: SpineMap<K, V>) => void): void {
    this.keys.forEach((key: K, index: number, array: K[]): void => {
      const value: V | undefined = this.map.get(key);
      if (!value) throw new Error();
      callback(value, key, index, this);
    });
  }
}

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

type ColorJSON = number | string;

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

  public load(json?: ColorJSON, def: number = 0xffffffff): Color {
    let rgba: number = def;
    if (typeof(json) === "string") rgba = parseInt(json, 16);
    if (typeof(json) === "number") rgba = 0 | json;
    this.r = ((rgba >> 24) & 0xff) / 0xff;
    this.g = ((rgba >> 16) & 0xff) / 0xff;
    this.b = ((rgba >> 8) & 0xff) / 0xff;
    this.a = (rgba & 0xff) / 0xff;
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

  public selfTween(other: Color, pct: number): Color {
    return Color.tween(this, other, pct, this);
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

type CurveJSON = string | number[];

export class Curve {
  public evaluate: (t: number) => number = function (t: number): number { return t; };

  public load(json?: CurveJSON): Curve {
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

export function signum(n: number): number { return (n < 0) ? (-1) : (n > 0) ? (1) : (n); }

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

export function tweenAngleRadians(a: number, b: number, t: number): number {
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
    out.rad = tweenAngleRadians(a.rad, b.rad, pct);
    return out;
  }

  public tween(other: Angle, pct: number, out: Angle = new Angle()): Angle {
    return Angle.tween(this, other, pct, out);
  }

  public selfTween(other: Angle, pct: number): Angle {
    return Angle.tween(this, other, pct, this);
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

  public selfTween(other: Vector, pct: number): Vector {
    return Vector.tween(this, other, pct, this);
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

  public selfRotate(cos: number, sin: number): Matrix {
    return Matrix.rotate(this, cos, sin, this);
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

  public selfTween(other: Matrix, pct: number): Matrix {
    return Matrix.tween(this, other, pct, this);
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

export class Scale extends Matrix {
  constructor() {
    super();
  }

  public get x(): number { return (Math.abs(this.c) < EPSILON) ? (this.a) : (signum(this.a) * Math.sqrt(this.a * this.a + this.c * this.c)); }
  public set x(value: number) { this.a = value; this.c = 0; }

  public get y(): number { return (Math.abs(this.b) < EPSILON) ? (this.d) : (signum(this.d) * Math.sqrt(this.b * this.b + this.d * this.d)); }
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

  public selfTween(other: Shear, pct: number): Shear {
    return Shear.tween(this, other, pct, this);
  }
}

interface SpaceJSON {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  shearX: number;
  shearY: number;
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

  public load(json: SpaceJSON): Space {
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

  public static combine(a: Space, b: Space, out: Space = new Space()): Space {
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

  public static extract(ab: Space, a: Space, out: Space = new Space()): Space {
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

  public static tween(a: Space, b: Space, pct: number, out: Space= new Space()): Space {
    a.position.tween(b.position, pct, out.position);
    a.rotation.tween(b.rotation, pct, out.rotation);
    a.scale.tween(b.scale, pct, out.scale);
    a.shear.tween(b.shear, pct, out.shear);
    return out;
  }

  public tween(other: Space, pct: number, out: Space = new Space()): Space {
    return Space.tween(this, other, pct, out);
  }

  public selfTween(other: Space, pct: number): Space {
    return Space.tween(this, other, pct, this);
  }
}

interface BoneJSON extends SpaceJSON {
  name: string;
  color?: ColorJSON;
  parent?: string;
  length?: number;
  inheritRotation?: boolean; // TODO: deprecate
  inheritScale?: boolean; // TODO: deprecate
  transform?: string;
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

  public load(json: BoneJSON): Bone {
    this.color.load(json.color, 0x989898ff);
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

  public static flatten(bone: Bone, bones: SpineMap<string, Bone>): Bone {
    const bls: Space = bone.local_space;
    const bws: Space = bone.world_space;
    let parent: Bone | undefined = bones.get(bone.parent_key);
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
          parent = bones.get(parent.parent_key);
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
          parent = bones.get(parent.parent_key);
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

interface ConstraintJSON {
  name: string;
  order: number;
}

export class Constraint {
  ///public name: string = "";
  public order: number = 0;

  public load(json: ConstraintJSON): Constraint {
    ///this.name = loadString(json, "name", "");
    this.order = loadInt(json, "order", 0);
    return this;
  }
}

interface IkcJSON extends ConstraintJSON {
  bones: string[];
  target: string;
  mix: number;
  bendPositive: boolean;
}

export class Ikc extends Constraint {
  public bone_keys: string[] = [];
  public target_key: string = "";
  public mix: number = 1;
  public bend_positive: boolean = true;

  public load(json: IkcJSON): Ikc {
    super.load(json);
    this.bone_keys = json["bones"] || [];
    this.target_key = loadString(json, "target", "");
    this.mix = loadFloat(json, "mix", 1);
    this.bend_positive = loadBool(json, "bendPositive", true);
    return this;
  }
}

interface XfcJSON extends ConstraintJSON {
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

export class Xfc extends Constraint {
  public bone_keys: string[] = [];
  public target_key: string = "";
  public position_mix: number = 1;
  public position: Position = new Position();
  public rotation_mix: number = 1;
  public rotation: Rotation = new Rotation();
  public scale_mix: number = 1;
  public scale: Scale = new Scale();
  public shear_mix: number = 1;
  public shear: Shear = new Shear();

  public load(json: XfcJSON): Xfc {
    super.load(json);
    this.bone_keys = json["bones"] || [];
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

interface PtcJSON extends ConstraintJSON {
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

export class Ptc extends Constraint {
  public bone_keys: string[] = [];
  public target_key: string = "";
  public spacing_mode: string = "length"; // "length", "fixed", "percent"
  public spacing: number = 0;
  public position_mode: string = "percent"; // "fixed", "percent"
  public position_mix: number = 1;
  public position: number = 0;
  public rotation_mode: string = "tangent"; // "tangent", "chain", "chainscale"
  public rotation_mix: number = 1;
  public rotation: Rotation = new Rotation();

  public load(json: PtcJSON): Ptc {
    super.load(json);
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

interface SlotJSON {
  name: string;
  bone: string;
  color?: ColorJSON;
  attachment: string;
  blend?: string;
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

  public load(json: SlotJSON): Slot {
    this.bone_key = loadString(json, "bone", "");
    this.color.load(json.color);
    this.attachment_key = loadString(json, "attachment", "");
    this.blend = loadString(json, "blend", "normal");
    return this;
  }
}

interface AttachmentJSON {
  type: string;
  name?: string;
  path?: string;
}

export class Attachment {
  public type: string = "";
  public name: string = "";
  public path: string = "";

  constructor(type: string) {
    this.type = type;
  }

  public load(json: AttachmentJSON): Attachment {
    const type: string = loadString(json, "type", "region");
    if (type !== this.type) {
      throw new Error();
    }
    this.name = loadString(json, "name", "");
    this.path = loadString(json, "path", "");
    return this;
  }
}

interface RegionAttachmentJSON extends AttachmentJSON, SpaceJSON {
  color?: ColorJSON;
  width?: number;
  height?: number;
}

export class RegionAttachment extends Attachment {
  public color: Color = new Color();
  public local_space: Space = new Space();
  public width: number = 0;
  public height: number = 0;

  constructor() {
    super("region");
  }

  public load(json: RegionAttachmentJSON): RegionAttachment {
    super.load(json);
    this.color.load(json.color);
    this.local_space.load(json);
    this.width = loadFloat(json, "width", 0);
    this.height = loadFloat(json, "height", 0);
    return this;
  }
}

interface BoundingBoxAttachmentJSON extends AttachmentJSON {
  color?: ColorJSON;
  vertices: number[];
}

export class BoundingBoxAttachment extends Attachment {
  public color: Color = new Color();
  public vertices: number[] = [];

  constructor() {
    super("boundingbox");
  }

  public load(json: BoundingBoxAttachmentJSON): BoundingBoxAttachment {
    super.load(json);
    this.color.load(json.color, 0x60f000ff);
    /// The x/y pairs that make up the vertices of the polygon.
    this.vertices = json.vertices;
    return this;
  }
}

interface MeshAttachmentJSON extends AttachmentJSON {
  color?: ColorJSON;
  triangles: number[];
  edges: number[];
  vertices: number[];
  uvs: number[];
  hull?: number;
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

  public load(json: MeshAttachmentJSON): MeshAttachment {
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

interface LinkedMeshAttachmentJSON extends AttachmentJSON {
  color?: ColorJSON;
  skin: string;
  parent: string;
  deform?: boolean;
  width?: number;
  height?: number;
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

  public load(json: LinkedMeshAttachmentJSON): LinkedMeshAttachment {
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

interface WeightedMeshAttachmentJSON extends AttachmentJSON {
  color?: ColorJSON;
  triangles: number[];
  edges: number[];
  vertices: number[];
  uvs: number[];
  hull: number;
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

  public load(json: WeightedMeshAttachmentJSON): WeightedMeshAttachment {
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

interface PathAttachmentJSON extends AttachmentJSON {
  color?: ColorJSON;
  constantSpeed?: boolean;
  lengths: number[];
  vertexCount: number;
  vertices: number[];
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

  public load(json: PathAttachmentJSON): PathAttachment {
    super.load(json);
    this.color.load(json.color, 0xff7f00ff);
    this.closed = loadBool(json, "closed", false);
    this.accurate = loadBool(json, "constantSpeed", true);
    this.lengths = json.lengths || [];
    this.vertex_count = loadInt(json, "vertexCount", 0);
    this.vertices = json.vertices || [];
    return this;
  }
}

type SkinSlotJSON = {[key: string]: AttachmentJSON};

export class SkinSlot {
  public attachments: SpineMap<string, Attachment> = new SpineMap<string, Attachment>();

  public load(json: SkinSlotJSON): SkinSlot {
    this.attachments.clear();
    Object.keys(json || {}).forEach((attachment_key: string): void => {
      const attachment_json: AttachmentJSON = json[attachment_key];
      switch (attachment_json.type) {
        default: case "region":
          this.attachments.set(attachment_key, new RegionAttachment().load(<RegionAttachmentJSON>attachment_json));
          break;
        case "boundingbox":
          this.attachments.set(attachment_key, new BoundingBoxAttachment().load(<BoundingBoxAttachmentJSON>attachment_json));
          break;
        case "mesh":
          if ((<MeshAttachmentJSON>attachment_json).vertices.length === (<MeshAttachmentJSON>attachment_json).uvs.length) {
            this.attachments.set(attachment_key, new MeshAttachment().load(<MeshAttachmentJSON>attachment_json));
          } else {
            attachment_json.type = "weightedmesh";
            this.attachments.set(attachment_key, new WeightedMeshAttachment().load(<WeightedMeshAttachmentJSON>attachment_json));
          }
          break;
        case "linkedmesh":
          this.attachments.set(attachment_key, new LinkedMeshAttachment().load(<LinkedMeshAttachmentJSON>attachment_json));
          break;
        case "skinnedmesh":
          attachment_json.type = "weightedmesh";
        case "weightedmesh":
          this.attachments.set(attachment_key, new WeightedMeshAttachment().load(<WeightedMeshAttachmentJSON>attachment_json));
          break;
        case "path":
          this.attachments.set(attachment_key, new PathAttachment().load(<PathAttachmentJSON>attachment_json));
          break;
      }
    });
    return this;
  }
}

type SkinJSON = {[key: string]: SkinSlotJSON};

export class Skin {
  public name: string = "";
  public slots: SpineMap<string, SkinSlot> = new SpineMap<string, SkinSlot>();

  public load(json: SkinJSON): Skin {
    this.name = loadString(json, "name", "");
    Object.keys(json || {}).forEach((slot_key: string): void => {
      this.slots.set(slot_key, new SkinSlot().load(json[slot_key]));
    });
    return this;
  }

  public iterateAttachments(callback: (slot_key: string, skin_slot: SkinSlot, attachment_key: string, attachment: Attachment) => void): void {
    this.slots.forEach((skin_slot: SkinSlot, slot_key: string): void => {
      skin_slot.attachments.forEach((attachment: Attachment, attachment_key: string): void => {
        callback(slot_key, skin_slot, (attachment && attachment.name) || attachment_key, attachment);
      });
    });
  }
}

interface EventJSON {
  name: string;
  int?: number;
  float?: number;
  string?: string;
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

  public load(json: EventJSON): Event {
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

interface KeyframeJSON {
  time: number;
}

export class Keyframe {
  public time: number = 0;

  public drop(): Keyframe {
    this.time = 0;
    return this;
  }

  public load(json: KeyframeJSON): Keyframe {
    this.time = 1000 * loadFloat(json, "time", 0); // convert to ms
    return this;
  }

  public save(json: KeyframeJSON): Keyframe {
    saveFloat(json, "time", this.time / 1000, 0); // convert to s
    return this;
  }

  public static find(array: Keyframe[] | undefined, time: number): number {
    if (!array) return -1;
    if (array.length <= 0) return -1;
    if (time < array[0].time) return -1;
    const last: number = array.length - 1;
    if (time >= array[last].time) return last;
    let lo: number = 0;
    let hi: number = last;
    if (hi === 0) return 0;
    let current: number = hi >> 1;
    while (true) {
      if (array[current + 1].time <= time) {
        lo = current + 1;
      } else {
        hi = current;
      }
      if (lo === hi) return lo;
      current = (lo + hi) >> 1;
    }
  }

  public static compare(a: Keyframe, b: Keyframe): number {
    return a.time - b.time;
  }

  public static evaluate(keyframes: Keyframe[], time: number, callback: (keyframe0: Keyframe, keyframe1: Keyframe, k: number, keyframe0_index: number, keyframe1_index: number) => void): void {
    const keyframe0_index: number = Keyframe.find(keyframes, time);
    if (keyframe0_index !== -1) {
      const keyframe1_index: number = keyframe0_index + 1;
      const keyframe0: Keyframe = keyframes[keyframe0_index];
      const keyframe1: Keyframe = keyframes[keyframe1_index] || keyframe0;
      const k: number = (keyframe0.time === keyframe1.time) ? 0 : (time - keyframe0.time) / (keyframe1.time - keyframe0.time);
      callback(keyframe0, keyframe1, k, keyframe0_index, keyframe1_index);
    }
  }
}

export class Timeline {
  public min_time: number = 0;
  public max_time: number = 0;

  public get length(): number { return this.max_time - this.min_time; }

  protected _expandTimeline(timeline: Timeline): Timeline {
    this.min_time = Math.min(this.min_time, timeline.min_time);
    this.max_time = Math.max(this.max_time, timeline.max_time);
    return timeline;
  }

  protected _expandKeyframe(keyframe: Keyframe): Keyframe {
    this.min_time = Math.min(this.min_time, keyframe.time);
    this.max_time = Math.max(this.max_time, keyframe.time);
    return keyframe;
  }

  protected _expandKeyframes(keyframes: Keyframe[]): Keyframe[] {
    keyframes.forEach((keyframe: Keyframe) => { this._expandKeyframe(keyframe); });
    return keyframes;
  }
}

interface BoneKeyframeJSON extends KeyframeJSON {
  curve?: CurveJSON;
}

export class BoneKeyframe extends Keyframe {
  public curve: Curve = new Curve();

  constructor() {
    super();
  }

  public load(json: BoneKeyframeJSON): BoneKeyframe {
    super.load(json);
    this.curve.load(json.curve);
    return this;
  }
}

interface BonePositionKeyframeJSON extends BoneKeyframeJSON {
  x?: number;
  y?: number;
}

export class BonePositionKeyframe extends BoneKeyframe {
  public position: Position = new Position();

  constructor() {
    super();
  }

  public load(json: BonePositionKeyframeJSON): BonePositionKeyframe {
    super.load(json);
    this.position.x = loadFloat(json, "x", 0);
    this.position.y = loadFloat(json, "y", 0);
    return this;
  }
}

interface BoneRotationKeyframeJSON extends BoneKeyframeJSON {
  angle?: number;
}

export class BoneRotationKeyframe extends BoneKeyframe {
  public rotation: Rotation = new Rotation();

  constructor() {
    super();
  }

  public load(json: BoneRotationKeyframeJSON): BoneRotationKeyframe {
    super.load(json);
    this.rotation.deg = loadFloat(json, "angle", 0);
    return this;
  }
}

interface BoneScaleKeyframeJSON extends BoneKeyframeJSON {
  x?: number;
  y?: number;
}

export class BoneScaleKeyframe extends BoneKeyframe {
  public scale: Scale = new Scale();

  constructor() {
    super();
  }

  public load(json: BoneScaleKeyframeJSON): BoneScaleKeyframe {
    super.load(json);
    this.scale.x = loadFloat(json, "x", 1);
    this.scale.y = loadFloat(json, "y", 1);
    return this;
  }
}

interface BoneShearKeyframeJSON extends BoneKeyframeJSON {
  x?: number;
  y?: number;
}

export class BoneShearKeyframe extends BoneKeyframe {
  public shear: Shear = new Shear();

  constructor() {
    super();
  }

  public load(json: BoneShearKeyframeJSON): BoneShearKeyframe {
    super.load(json);
    this.shear.x.deg = loadFloat(json, "x", 0);
    this.shear.y.deg = loadFloat(json, "y", 0);
    return this;
  }
}

interface BoneTimelineJSON {
  translate: BonePositionKeyframeJSON[];
  rotate: BoneRotationKeyframeJSON[];
  scale: BoneScaleKeyframeJSON[];
  shear: BoneShearKeyframeJSON[];
}

export class BoneTimeline extends Timeline {
  public position_keyframes: BonePositionKeyframe[];
  public rotation_keyframes: BoneRotationKeyframe[];
  public scale_keyframes: BoneScaleKeyframe[];
  public shear_keyframes: BoneShearKeyframe[];

  public load(json: BoneTimelineJSON): BoneTimeline {
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
          json[key].forEach((keyframe_json: BonePositionKeyframeJSON): void => {
            this.position_keyframes.push(new BonePositionKeyframe().load(keyframe_json));
          });
          this.position_keyframes.sort(Keyframe.compare);
          this._expandKeyframes(this.position_keyframes);
          break;
        case "rotate":
          this.rotation_keyframes = [];
          json[key].forEach((keyframe_json: BoneRotationKeyframeJSON): void => {
            this.rotation_keyframes.push(new BoneRotationKeyframe().load(keyframe_json));
          });
          this.rotation_keyframes.sort(Keyframe.compare);
          this._expandKeyframes(this.rotation_keyframes);
          break;
        case "scale":
          this.scale_keyframes = [];
          json[key].forEach((keyframe_json: BoneScaleKeyframeJSON): void => {
            this.scale_keyframes.push(new BoneScaleKeyframe().load(keyframe_json));
          });
          this.scale_keyframes.sort(Keyframe.compare);
          this._expandKeyframes(this.scale_keyframes);
          break;
        case "shear":
          this.shear_keyframes = [];
          json[key].forEach((keyframe_json: BoneShearKeyframeJSON): void => {
            this.shear_keyframes.push(new BoneShearKeyframe().load(keyframe_json));
          });
          this.shear_keyframes.sort(Keyframe.compare);
          this._expandKeyframes(this.shear_keyframes);
          break;
        default:
          console.log("TODO: BoneTimeline::load", key);
          break;
      }
    });

    return this;
  }
}

interface SlotKeyframeJSON extends KeyframeJSON {}

export class SlotKeyframe extends Keyframe {
  constructor() {
    super();
  }

  public load(json: SlotKeyframeJSON): SlotKeyframe {
    super.load(json);
    return this;
  }
}

interface SlotColorKeyframeJSON extends SlotKeyframeJSON {
  curve?: CurveJSON;
  color?: ColorJSON;
}

export class SlotColorKeyframe extends SlotKeyframe {
  public curve: Curve = new Curve();
  public color: Color = new Color();

  constructor() {
    super();
  }

  public load(json: SlotColorKeyframeJSON): SlotColorKeyframe {
    super.load(json);
    this.curve.load(json.curve);
    this.color.load(json.color);
    return this;
  }
}

interface SlotAttachmentKeyframeJSON extends SlotKeyframeJSON {
  name: string;
}

export class SlotAttachmentKeyframe extends SlotKeyframe {
  public name: string = "";

  constructor() {
    super();
  }

  public load(json: SlotAttachmentKeyframeJSON): SlotAttachmentKeyframe {
    super.load(json);
    this.name = loadString(json, "name", "");
    return this;
  }
}

type SlotTimelineJSON = {[key: string]: SlotKeyframeJSON[]};

export class SlotTimeline extends Timeline {
  public color_keyframes: SlotColorKeyframe[];
  public attachment_keyframes: SlotAttachmentKeyframe[];

  public load(json: SlotTimelineJSON): SlotTimeline {
    this.min_time = 0;
    this.max_time = 0;
    delete this.color_keyframes;
    delete this.attachment_keyframes;

    Object.keys(json || {}).forEach((key: string): void => {
      switch (key) {
        case "color":
          this.color_keyframes = [];
          json[key].forEach((keyframe_json: SlotColorKeyframeJSON): void => {
            this.color_keyframes.push(new SlotColorKeyframe().load(keyframe_json));
          });
          this.color_keyframes.sort(Keyframe.compare);
          this._expandKeyframes(this.color_keyframes);
          break;
        case "attachment":
          this.attachment_keyframes = [];
          json[key].forEach((keyframe_json: SlotAttachmentKeyframeJSON): void => {
            this.attachment_keyframes.push(new SlotAttachmentKeyframe().load(keyframe_json));
          });
          this.attachment_keyframes.sort(Keyframe.compare);
          this._expandKeyframes(this.attachment_keyframes);
          break;
        default:
          console.log("TODO: SlotTimeline::load", key);
          break;
      }
    });

    return this;
  }
}

interface EventKeyframeJSON extends EventJSON, KeyframeJSON {}

export class EventKeyframe extends Keyframe {
  public name: string = "";
  public int_value: number = 0;
  public float_value: number = 0;
  public string_value: string = "";

  constructor() {
    super();
  }

  public load(json: EventKeyframeJSON): EventKeyframe {
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

type EventTimelineJSON = EventKeyframeJSON[];

export class EventTimeline extends Timeline {
  public event_keyframes: EventKeyframe[];

  public load(json: EventTimelineJSON): EventTimeline {
    this.min_time = 0;
    this.max_time = 0;
    this.event_keyframes = [];
    json.forEach((keyframe_json: EventKeyframeJSON): void => {
      this.event_keyframes.push(new EventKeyframe().load(keyframe_json));
    });
    this.event_keyframes.sort(Keyframe.compare);
    this._expandKeyframes(this.event_keyframes);
    return this;
  }
}

interface SlotOffsetJSON {
  slot: string;
  offset: number;
}

export class SlotOffset {
  public slot_key: string = "";
  public offset: number = 0;

  public load(json: SlotOffsetJSON): SlotOffset {
    this.slot_key = loadString(json, "slot", "");
    this.offset = loadInt(json, "offset", 0);
    return this;
  }
}

interface OrderKeyframeJSON extends KeyframeJSON {
  offsets: SlotOffsetJSON[];
}

export class OrderKeyframe extends Keyframe {
  public slot_offsets: SlotOffset[] = [];

  constructor() {
    super();
  }

  public load(json: OrderKeyframeJSON): OrderKeyframe {
    super.load(json);
    this.slot_offsets = [];

    Object.keys(json || {}).forEach((key: string): void => {
      switch (key) {
        case "offsets":
          json[key].forEach((offset_json: SlotOffsetJSON): void => {
            this.slot_offsets.push(new SlotOffset().load(offset_json));
          });
          break;
      }
    });

    return this;
  }
}

type OrderTimelineJSON = OrderKeyframeJSON[];

export class OrderTimeline extends Timeline {
  public order_keyframes: OrderKeyframe[];

  public load(json: OrderTimelineJSON): OrderTimeline {
    this.min_time = 0;
    this.max_time = 0;
    this.order_keyframes = [];
    json.forEach((keyframe_json: OrderKeyframeJSON): void => {
      this.order_keyframes.push(new OrderKeyframe().load(keyframe_json));
    });
    this.order_keyframes.sort(Keyframe.compare);
    this._expandKeyframes(this.order_keyframes);
    return this;
  }
}

interface IkcKeyframeJSON extends KeyframeJSON {
  curve?: CurveJSON;
  mix?: number;
  bendPositive?: boolean;
}

export class IkcKeyframe extends Keyframe {
  public curve: Curve = new Curve();
  public mix: number = 1;
  public bend_positive: boolean = true;

  constructor() {
    super();
  }

  public load(json: IkcKeyframeJSON): IkcKeyframe {
    super.load(json);
    this.curve.load(json.curve);
    this.mix = loadFloat(json, "mix", 1);
    this.bend_positive = loadBool(json, "bendPositive", true);
    return this;
  }
}

type IkcTimelineJSON = IkcKeyframeJSON[];

export class IkcTimeline extends Timeline {
  public ikc_keyframes: IkcKeyframe[];

  public load(json: IkcTimelineJSON): IkcTimeline {
    this.min_time = 0;
    this.max_time = 0;
    this.ikc_keyframes = [];
    json.forEach((keyframe_json: IkcKeyframeJSON): void => {
      this.ikc_keyframes.push(new IkcKeyframe().load(keyframe_json));
    });
    this.ikc_keyframes.sort(Keyframe.compare);
    this._expandKeyframes(this.ikc_keyframes);
    return this;
  }
}

interface XfcKeyframeJSON extends KeyframeJSON {
  curve?: CurveJSON;
  translateMix?: number;
  rotateMix?: number;
  scaleMix?: number;
  shearMix?: number;
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

  public load(json: XfcKeyframeJSON): XfcKeyframe {
    super.load(json);
    this.curve.load(json.curve);
    this.position_mix = loadFloat(json, "translateMix", 1);
    this.rotation_mix = loadFloat(json, "rotateMix", 1);
    this.scale_mix = loadFloat(json, "scaleMix", 1);
    this.shear_mix = loadFloat(json, "shearMix", 1);
    return this;
  }
}

type XfcTimelineJSON = XfcKeyframeJSON[];

export class XfcTimeline extends Timeline {
  public xfc_keyframes: XfcKeyframe[];

  public load(json: XfcTimelineJSON): XfcTimeline {
    this.min_time = 0;
    this.max_time = 0;
    this.xfc_keyframes = [];
    json.forEach((keyframe_json: XfcKeyframeJSON): void => {
      this.xfc_keyframes.push(new XfcKeyframe().load(keyframe_json));
    });
    this.xfc_keyframes.sort(Keyframe.compare);
    this._expandKeyframes(this.xfc_keyframes);
    return this;
  }
}

interface PtcKeyframeJSON extends KeyframeJSON {
  curve?: CurveJSON;
}

export class PtcKeyframe extends Keyframe {
  public curve: Curve = new Curve();

  constructor() {
    super();
  }

  public load(json: PtcKeyframeJSON): PtcKeyframe {
    super.load(json);
    this.curve.load(json.curve);
    return this;
  }
}

interface PtcMixKeyframeJSON extends PtcKeyframeJSON {
  translateMix?: number;
  rotateMix?: number;
}

export class PtcMixKeyframe extends PtcKeyframe {
  public position_mix: number = 0;
  public rotation_mix: number = 0;

  constructor() {
    super();
  }

  public load(json: PtcMixKeyframeJSON): PtcMixKeyframe {
    super.load(json);
    this.position_mix = loadFloat(json, "translateMix", 1);
    this.rotation_mix = loadFloat(json, "rotateMix", 1);
    return this;
  }
}

interface PtcSpacingKeyframeJSON extends PtcKeyframeJSON {
  spacing?: number;
}

export class PtcSpacingKeyframe extends PtcKeyframe {
  public spacing: number = 0;

  constructor() {
    super();
  }

  public load(json: PtcSpacingKeyframeJSON): PtcSpacingKeyframe {
    super.load(json);
    this.spacing = loadFloat(json, "spacing", 0);
    return this;
  }
}

interface PtcPositionKeyframeJSON extends PtcKeyframeJSON {
  position?: number;
}

export class PtcPositionKeyframe extends PtcKeyframe {
  public position: number = 0;

  constructor() {
    super();
  }

  public load(json: PtcPositionKeyframeJSON): PtcPositionKeyframe {
    super.load(json);
    this.position = loadFloat(json, "position", 0);
    return this;
  }
}

interface PtcRotationKeyframeJSON extends PtcKeyframeJSON {
  rotation?: number;
}

export class PtcRotationKeyframe extends PtcKeyframe {
  public rotation: Rotation = new Rotation();

  constructor() {
    super();
  }

  public load(json: PtcRotationKeyframeJSON): PtcRotationKeyframe {
    super.load(json);
    this.rotation.deg = loadFloat(json, "rotation", 0);
    return this;
  }
}

interface PtcTimelineJSON {
  mix: PtcMixKeyframeJSON[];
  spacing: PtcSpacingKeyframeJSON[];
  position: PtcPositionKeyframeJSON[];
  rotation: PtcRotationKeyframeJSON[];
}

export class PtcTimeline extends Timeline {
  public ptc_mix_keyframes: PtcMixKeyframe[];
  public ptc_spacing_keyframes: PtcSpacingKeyframe[];
  public ptc_position_keyframes: PtcPositionKeyframe[];
  public ptc_rotation_keyframes: PtcRotationKeyframe[];

  public load(json: PtcTimelineJSON): PtcTimeline {
    this.min_time = 0;
    this.max_time = 0;
    delete this.ptc_mix_keyframes;
    delete this.ptc_spacing_keyframes;
    delete this.ptc_position_keyframes;
    delete this.ptc_rotation_keyframes;

    Object.keys(json || {}).forEach((key: string): void => {
      switch (key) {
        case "mix":
          this.ptc_mix_keyframes = [];
          json[key].forEach((keyframe_json: PtcMixKeyframeJSON): void => {
            this.ptc_mix_keyframes.push(new PtcMixKeyframe().load(keyframe_json));
          });
          this.ptc_mix_keyframes.sort(Keyframe.compare);
          this._expandKeyframes(this.ptc_mix_keyframes);
          break;
        case "spacing":
          this.ptc_spacing_keyframes = [];
          json[key].forEach((keyframe_json: PtcSpacingKeyframeJSON): void => {
            this.ptc_spacing_keyframes.push(new PtcSpacingKeyframe().load(keyframe_json));
          });
          this.ptc_spacing_keyframes.sort(Keyframe.compare);
          this._expandKeyframes(this.ptc_spacing_keyframes);
          break;
        case "position":
          this.ptc_position_keyframes = [];
          json[key].forEach((keyframe_json: PtcPositionKeyframeJSON): void => {
            this.ptc_position_keyframes.push(new PtcPositionKeyframe().load(keyframe_json));
          });
          this.ptc_position_keyframes.sort(Keyframe.compare);
          this._expandKeyframes(this.ptc_position_keyframes);
          break;
        case "rotation":
          this.ptc_rotation_keyframes = [];
          json[key].forEach((keyframe_json: PtcRotationKeyframeJSON): void => {
            this.ptc_rotation_keyframes.push(new PtcRotationKeyframe().load(keyframe_json));
          });
          this.ptc_rotation_keyframes.sort(Keyframe.compare);
          this._expandKeyframes(this.ptc_rotation_keyframes);
          break;
        default:
          console.log("TODO: PtcTimeline::load", key);
          break;
      }
    });

    return this;
  }
}

interface FfdKeyframeJSON extends KeyframeJSON {
  curve?: CurveJSON;
  offset?: number;
  vertices: number[];
}

export class FfdKeyframe extends Keyframe {
  public curve = new Curve();
  public offset = 0;
  public vertices: number[] = [];

  constructor() {
    super();
  }

  public load(json: FfdKeyframeJSON): FfdKeyframe {
    super.load(json);
    this.curve.load(json.curve);
    this.offset = loadInt(json, "offset", 0);
    this.vertices = json.vertices || [];
    return this;
  }
}

type FfdTimelineJSON = FfdKeyframeJSON[];

export class FfdTimeline extends Timeline {
  public ffd_keyframes: FfdKeyframe[];

  public load(json: FfdTimelineJSON): FfdTimeline {
    this.min_time = 0;
    this.max_time = 0;
    this.ffd_keyframes = [];
    json.forEach((keyframe_json: FfdKeyframeJSON): void => {
      this.ffd_keyframes.push(new FfdKeyframe().load(keyframe_json));
    });
    this.ffd_keyframes.sort(Keyframe.compare);
    this._expandKeyframes(this.ffd_keyframes);
    return this;
  }
}

interface FfdAttachmentJSON extends FfdTimelineJSON {}

export class FfdAttachment {
  public ffd_timeline: FfdTimeline = new FfdTimeline();

  public load(json: FfdAttachmentJSON): FfdAttachment {
    this.ffd_timeline.load(json);
    return this;
  }
}

type FfdSlotJSON = {[key: string]: FfdAttachmentJSON};

export class FfdSlot {
  public ffd_attachments: SpineMap<string, FfdAttachment> = new SpineMap<string, FfdAttachment>();

  public load(json: FfdSlotJSON): FfdSlot {
    this.ffd_attachments.clear();
    Object.keys(json || {}).forEach((key: string): void => {
      this.ffd_attachments.set(key, new FfdAttachment().load(json[key]));
    });
    return this;
  }

  public iterateAttachments(callback: (ffd_attachment_key: string, ffd_attachment: FfdAttachment | undefined) => void): void {
    this.ffd_attachments.forEach((ffd_attachment: FfdAttachment, ffd_attachment_key: string): void => {
      callback(ffd_attachment_key, ffd_attachment);
    });
  }
}

type FfdSkinJSON = {[key: string]: FfdSlotJSON};

export class FfdSkin {
  public ffd_slots: SpineMap<string, FfdSlot> = new SpineMap<string, FfdSlot>();

  public load(json: FfdSkinJSON): FfdSkin {
    this.ffd_slots.clear();
    Object.keys(json || {}).forEach((key: string): void => {
      this.ffd_slots.set(key, new FfdSlot().load(json[key]));
    });
    return this;
  }

  public iterateAttachments(callback: (ffd_slot_key: string, ffd_slot: FfdSlot, ffd_attachment_key: string, ffd_attachment: FfdAttachment) => void): void {
    this.ffd_slots.forEach((ffd_slot: FfdSlot, ffd_slot_key: string): void => {
      ffd_slot.iterateAttachments((ffd_attachment_key: string, ffd_attachment: FfdAttachment): void => {
        callback(ffd_slot_key, ffd_slot, ffd_attachment_key, ffd_attachment);
      });
    });
  }
}

interface AnimationJSON {
  bones: {[key: string]: BoneTimelineJSON};
  slots: {[key: string]: SlotTimelineJSON};
  events: EventTimelineJSON;
  draworder: OrderTimelineJSON;
  drawOrder: OrderTimelineJSON; // TODO: deprecate
  ik: {[key: string]: IkcTimelineJSON};
  transform: {[key: string]: XfcTimelineJSON};
  paths: {[key: string]: PtcTimelineJSON};
  deform: {[key: string]: FfdSkinJSON};
  ffd: {[key: string]: FfdSkinJSON}; // TODO: deprecate
}

export class Animation extends Timeline {
  public name: string = "";
  public bone_timeline_map: SpineMap<string, BoneTimeline> = new SpineMap<string, BoneTimeline>();
  public slot_timeline_map: SpineMap<string, SlotTimeline> = new SpineMap<string, SlotTimeline>();
  public event_timeline: EventTimeline;
  public order_timeline: OrderTimeline;
  public ikc_timeline_map: SpineMap<string, IkcTimeline> = new SpineMap<string, IkcTimeline>();
  public xfc_timeline_map: SpineMap<string, XfcTimeline> = new SpineMap<string, XfcTimeline>();
  public ptc_timeline_map: SpineMap<string, PtcTimeline> = new SpineMap<string, PtcTimeline>();
  public ffd_skins: SpineMap<string, FfdSkin> = new SpineMap<string, FfdSkin>();

  public load(json: AnimationJSON): Animation {
    this.bone_timeline_map.clear();
    this.slot_timeline_map.clear();
    delete this.event_timeline;
    delete this.event_timeline;
    this.ikc_timeline_map.clear();
    this.xfc_timeline_map.clear();
    this.ptc_timeline_map.clear();
    this.ffd_skins.clear();

    this.min_time = 0;
    this.max_time = 0;

    Object.keys(json || {}).forEach((key: string): void => {
      switch (key) {
        case "bones":
          Object.keys(json[key] || {}).forEach((bone_key: string): void => {
            this._expandTimeline(this.bone_timeline_map.set(bone_key, new BoneTimeline().load(json[key][bone_key])));
          });
          break;
        case "slots":
          Object.keys(json[key] || {}).forEach((slot_key: string): void => {
            this._expandTimeline(this.slot_timeline_map.set(slot_key, new SlotTimeline().load(json[key][slot_key])));
          });
          break;
        case "events":
          this._expandTimeline(this.event_timeline = new EventTimeline().load(json[key]));
          break;
        case "draworder": case "drawOrder":
          this._expandTimeline(this.order_timeline = new OrderTimeline().load(json[key]));
          break;
        case "ik":
          Object.keys(json[key] || {}).forEach((ikc_key: string): void => {
            this._expandTimeline(this.ikc_timeline_map.set(ikc_key, new IkcTimeline().load(json[key][ikc_key])));
          });
          break;
        case "transform":
          Object.keys(json[key] || {}).forEach((xfc_key: string): void => {
            this._expandTimeline(this.xfc_timeline_map.set(xfc_key, new XfcTimeline().load(json[key][xfc_key])));
          });
          break;
        case "paths":
          Object.keys(json[key] || {}).forEach((ptc_key: string): void => {
            this._expandTimeline(this.ptc_timeline_map.set(ptc_key, new PtcTimeline().load(json[key][ptc_key])));
          });
          break;
        case "deform": case "ffd":
          Object.keys(json[key] || {}).forEach((ffd_key: string): void => {
            this.ffd_skins.set(ffd_key, new FfdSkin().load(json[key][ffd_key]));
          });
          break;
        default:
          console.log("TODO: Animation::load", key);
          break;
      }
    });

    return this;
  }
}

interface SkeletonJSON {
  hash?: string;
  spine?: string;
  width?: number;
  height?: number;
  images?: string;
}

export class Skeleton {
  public hash: string = "";
  public spine: string = "";
  public width: number = 0;
  public height: number = 0;
  public images: string = "";

  public load(json: SkeletonJSON): Skeleton {
    this.hash = loadString(json, "hash", "");
    this.spine = loadString(json, "spine", "");
    this.width = loadInt(json, "width", 0);
    this.height = loadInt(json, "height", 0);
    this.images = loadString(json, "images", "");
    return this;
  }
}

interface DataJSON {
  skeleton: SkeletonJSON;
  bones: BoneJSON[];
  ik: IkcJSON[];
  transform: XfcJSON[];
  path: PtcJSON[];
  slots: SlotJSON[];
  skins: {[key: string]: SkinJSON};
  events: {[key: string]: EventJSON};
  animations: {[key: string]: AnimationJSON};
}

export class Data {
  public name: string = "";
  public skeleton: Skeleton = new Skeleton();
  public bones: SpineMap<string, Bone> = new SpineMap<string, Bone>();
  public ikcs: SpineMap<string, Ikc> = new SpineMap<string, Ikc>();
  public xfcs: SpineMap<string, Xfc> = new SpineMap<string, Xfc>();
  public ptcs: SpineMap<string, Ptc> = new SpineMap<string, Ptc>();
  public slots: SpineMap<string, Slot> = new SpineMap<string, Slot>();
  public skins: SpineMap<string, Skin> = new SpineMap<string, Skin>();
  public events: SpineMap<string, Event> = new SpineMap<string, Event>();
  public anims: SpineMap<string, Animation> = new SpineMap<string, Animation>();

  public drop(): Data {
    this.bones.clear();
    this.ikcs.clear();
    this.xfcs.clear();
    this.ptcs.clear();
    this.slots.clear();
    this.skins.clear();
    this.events.clear();
    this.anims.clear();
    return this;
  }

  public load(json: DataJSON): Data {
    this.bones.clear();
    this.ikcs.clear();
    this.xfcs.clear();
    this.ptcs.clear();
    this.slots.clear();
    this.skins.clear();
    this.events.clear();
    this.anims.clear();

    Object.keys(json || {}).forEach((key: string): void => {
      switch (key) {
        case "skeleton":
          this.skeleton.load(json[key]);
          break;
        case "bones":
          json[key].forEach((bone_json: BoneJSON, bone_index: number): void => {
            this.bones.set(bone_json.name, new Bone().load(bone_json));
          });
          break;
        case "ik":
          json[key].forEach((ikc_json: IkcJSON, ikc_index: number): void => {
            this.ikcs.set(ikc_json.name, new Ikc().load(ikc_json));
          });
          // sort by order
          this.ikcs.keys.sort((a: string, b: string): number => {
            const ikc_a: Ikc | undefined = this.ikcs.get(a);
            const ikc_b: Ikc | undefined = this.ikcs.get(b);
            return (ikc_a && ikc_a.order || 0) - (ikc_b && ikc_b.order || 0);
          });
          break;
        case "transform":
          json[key].forEach((xfc_json: XfcJSON, xfc_index: number): void => {
            this.xfcs.set(xfc_json.name, new Xfc().load(xfc_json));
          });
          // sort by order
          this.xfcs.keys.sort((a: string, b: string): number => {
            const xfc_a: Xfc | undefined = this.xfcs.get(a);
            const xfc_b: Xfc | undefined = this.xfcs.get(b);
            return (xfc_a && xfc_a.order || 0) - (xfc_b && xfc_b.order || 0);
          });
          break;
        case "path":
          json[key].forEach((ptc_json: PtcJSON, ptc_index: number): void => {
            this.ptcs.set(ptc_json.name, new Ptc().load(ptc_json));
          });
          // sort by order
          this.ptcs.keys.sort((a: string, b: string): number => {
            const ptc_a: Ptc | undefined = this.ptcs.get(a);
            const ptc_b: Ptc | undefined = this.ptcs.get(b);
            return (ptc_a && ptc_a.order || 0) - (ptc_b && ptc_b.order || 0);
          });
          break;
        case "slots":
          json[key].forEach((slot_json: SlotJSON, slot_index: number): void => {
            this.slots.set(slot_json.name, new Slot().load(slot_json));
          });
          break;
        case "skins":
          Object.keys(json[key]).forEach((skin_key: string): void => {
            const skin: Skin = this.skins.set(skin_key, new Skin().load(json[key][skin_key]));
            skin.name = skin.name || skin_key;
          });
          break;
        case "events":
          Object.keys(json[key]).forEach((event_key: string): void => {
            const event: Event = this.events.set(event_key, new Event().load(json[key][event_key]));
            event.name = event.name || event_key;
          });
          break;
        case "animations":
          Object.keys(json[key]).forEach((anim_key: string): void => {
            const anim: Animation = this.anims.set(anim_key, new Animation().load(json[key][anim_key]));
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

  public loadSkeleton(json: SkeletonJSON): Data {
    this.skeleton.load(json);
    return this;
  }

  public loadEvent(name: string, json: EventJSON): Data {
    const event: Event = new Event().load(json);
    event.name = event.name || name;
    this.events.set(name, event);
    return this;
  }

  public loadAnimation(name: string, json: AnimationJSON): Data {
    const anim: Animation = new Animation().load(json);
    anim.name = anim.name || name;
    this.anims.set(name, anim);
    return this;
  }

  public getSkins(): SpineMap<string, Skin> {
    return this.skins;
  }

  public getEvents(): SpineMap<string, Event> {
    return this.events;
  }

  public getAnims(): SpineMap<string, Animation> {
    return this.anims;
  }

  public iterateBones(callback: (bone_key: string, bone: Bone) => void): void {
    this.bones.forEach((data_bone: Bone, bone_key: string): void => {
      callback(bone_key, data_bone);
    });
  }

  public iterateAttachments(skin_key: string, callback: (slot_key: string, data_slot: Slot, skin_slot: SkinSlot | undefined, attachment_key: string, attachment: Attachment | undefined) => void): void {
    const skin: Skin | undefined = this.skins.get(skin_key);
    const default_skin: Skin | undefined = this.skins.get("default");
    this.slots.forEach((data_slot: Slot, slot_key: string) => {
      const skin_slot: SkinSlot | undefined = (skin && skin.slots.get(slot_key)) || (default_skin && default_skin.slots.get(slot_key));
      let attachment: Attachment | undefined = skin_slot && skin_slot.attachments.get(data_slot.attachment_key);
      let attachment_key: string = (attachment && attachment.name) || data_slot.attachment_key;
      if (attachment && (attachment.type === "linkedmesh")) {
        attachment_key = (<LinkedMeshAttachment>attachment).parent_key;
        attachment = skin_slot && skin_slot.attachments.get(attachment_key);
      }
      callback(slot_key, data_slot, skin_slot, attachment_key, attachment);
    });
  }

  public iterateSkins(callback: (skin_key: string, skin: Skin) => void): void {
    this.skins.forEach((skin: Skin, skin_key: string): void => {
      callback(skin_key, skin);
    });
  }

  public iterateEvents(callback: (event_key: string, event: Event) => void): void {
    this.events.forEach((event: Event, event_key: string): void => {
      callback(event_key, event);
    });
  }

  public iterateAnims(callback: (anim_key: string, anim: Animation) => void): void {
    this.anims.forEach((anim: Animation, anim_key: string): void => {
      callback(anim_key, anim);
    });
  }
}

export class Pose {
  public data: Data;
  public skin_key: string = "";
  public anim_key: string = "";
  public time: number = 0;
  public prev_time: number = 0;
  public elapsed_time: number = 0;
  public wrapped_min: boolean = false;
  public wrapped_max: boolean = false;
  public dirty: boolean = true;
  public bones: SpineMap<string, Bone> = new SpineMap<string, Bone>();
  public slots: SpineMap<string, Slot> = new SpineMap<string, Slot>();
  public events: Event[] = [];

  constructor(data: Data) {
    this.data = data;
  }

  public drop(): Pose {
    this.bones.clear();
    this.slots.clear();
    this.events.length = 0;
    return this;
  }

  public curSkel(): Skeleton {
    return this.data.skeleton;
  }

  public getSkins(): SpineMap<string, Skin> {
    return this.data.skins;
  }

  public curSkin(): Skin | undefined {
    return this.data.skins.get(this.skin_key);
  }

  public getSkin(): string {
    return this.skin_key;
  }

  public setSkin(skin_key: string): void {
    if (this.skin_key !== skin_key) {
      this.skin_key = skin_key;
    }
  }

  public getAnims(): SpineMap<string, Animation> {
    return this.data.anims;
  }

  public curAnim(): Animation | undefined {
    return this.data.anims.get(this.anim_key);
  }

  public curAnimLength(): number {
    const anim: Animation | undefined = this.data.anims.get(this.anim_key);
    return (anim && anim.length) || 0;
  }

  public getAnim(): string {
    return this.anim_key;
  }

  public setAnim(anim_key: string): void {
    if (this.anim_key !== anim_key) {
      this.anim_key = anim_key;
      const anim: Animation | undefined = this.data.anims.get(this.anim_key);
      if (anim) {
        this.time = wrap(this.time, anim.min_time, anim.max_time);
      }
      this.prev_time = this.time;
      this.elapsed_time = 0;
      this.dirty = true;
    }
  }

  public getTime(): number {
    return this.time;
  }

  public setTime(time: number): void {
    const anim: Animation | undefined = this.data.anims.get(this.anim_key);
    if (anim) {
      time = wrap(time, anim.min_time, anim.max_time);
    }

    if (this.time !== time) {
      this.time = time;
      this.prev_time = this.time;
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

    this.prev_time = this.time; // save previous time
    this.time += this.elapsed_time; // accumulate elapsed time

    const anim: Animation | undefined = this.data.anims.get(this.anim_key);
    this.wrapped_min = false;
    this.wrapped_max = false;
    if (anim) {
      this.wrapped_min = (this.elapsed_time < 0) && (this.time <= anim.min_time);
      this.wrapped_max = (this.elapsed_time > 0) && (this.time >= anim.max_time);
      this.time = wrap(this.time, anim.min_time, anim.max_time);
    }

    this._strikeBones(anim);
    this._strikeIkcs(anim); // Inverse Kinematic Constraints
    this._strikeXfcs(anim); // Transform Constraints
    this._strikeSlots(anim);
    this._strikePtcs(anim); // Path Constraints
    this._strikeEvents(anim);

    this.elapsed_time = 0; // reset elapsed time for next strike
  }

  private _strikeBones(anim: Animation | undefined): void {
    this.data.bones.forEach((data_bone: Bone, bone_key: string): void => {
      const pose_bone: Bone = this.bones.get(bone_key) || this.bones.set(bone_key, new Bone());

      // start with a copy of the data bone
      pose_bone.copy(data_bone);

      // tween anim bone if keyframes are available
      const bone_timeline: BoneTimeline | undefined = anim && anim.bone_timeline_map.get(bone_key);
      if (bone_timeline) {
        Keyframe.evaluate(bone_timeline.position_keyframes, this.time, (keyframe0: BonePositionKeyframe, keyframe1: BonePositionKeyframe, k: number) => {
          const pct: number = keyframe0.curve.evaluate(k);
          pose_bone.local_space.position.x += tween(keyframe0.position.x, keyframe1.position.x, pct);
          pose_bone.local_space.position.y += tween(keyframe0.position.y, keyframe1.position.y, pct);
        });

        Keyframe.evaluate(bone_timeline.rotation_keyframes, this.time, (keyframe0: BoneRotationKeyframe, keyframe1: BoneRotationKeyframe, k: number) => {
          const pct: number = keyframe0.curve.evaluate(k);
          pose_bone.local_space.rotation.rad += tweenAngleRadians(keyframe0.rotation.rad, keyframe1.rotation.rad, pct);
        });

        Keyframe.evaluate(bone_timeline.scale_keyframes, this.time, (keyframe0: BoneScaleKeyframe, keyframe1: BoneScaleKeyframe, k: number) => {
          const pct: number = keyframe0.curve.evaluate(k);
          pose_bone.local_space.scale.a *= tween(keyframe0.scale.a, keyframe1.scale.a, pct);
          pose_bone.local_space.scale.d *= tween(keyframe0.scale.d, keyframe1.scale.d, pct);
        });

        Keyframe.evaluate(bone_timeline.shear_keyframes, this.time, (keyframe0: BoneShearKeyframe, keyframe1: BoneShearKeyframe, k: number) => {
          const pct: number = keyframe0.curve.evaluate(k);
          pose_bone.local_space.shear.x.rad += tweenAngleRadians(keyframe0.shear.x.rad, keyframe1.shear.x.rad, pct);
          pose_bone.local_space.shear.y.rad += tweenAngleRadians(keyframe0.shear.y.rad, keyframe1.shear.y.rad, pct);
        });
      }
    });

    this.iterateBones((bone_key: string, bone: Bone): void => {
      Bone.flatten(bone, this.bones);
    });
  }

  private _strikeIkcs(anim: Animation | undefined): void {
    this.data.ikcs.forEach((ikc: Ikc, ikc_key: string): void => {
      const ikc_target: Bone | undefined = this.bones.get(ikc.target_key);
      if (!ikc_target) return;
      Bone.flatten(ikc_target, this.bones);

      let ikc_mix: number = ikc.mix;
      let ikc_bend_positive: boolean = ikc.bend_positive;

      const ikc_timeline: IkcTimeline | undefined = anim && anim.ikc_timeline_map.get(ikc_key);
      if (ikc_timeline) {
        Keyframe.evaluate(ikc_timeline.ikc_keyframes, this.time, (keyframe0: IkcKeyframe, keyframe1: IkcKeyframe, k: number) => {
          ikc_mix = tween(keyframe0.mix, keyframe1.mix, keyframe0.curve.evaluate(k));
          // no tweening ik bend direction
          ikc_bend_positive = keyframe0.bend_positive;
        });
      }

      const alpha: number = ikc_mix;
      const bendDir: number = (ikc_bend_positive) ? (1) : (-1);

      if (alpha === 0) {
        return;
      }

      switch (ikc.bone_keys.length) {
        case 1: {
          const bone: Bone | undefined = this.bones.get(ikc.bone_keys[0]);
          if (!bone) return;
          Bone.flatten(bone, this.bones);
          let a1: number = Math.atan2(ikc_target.world_space.position.y - bone.world_space.position.y, ikc_target.world_space.position.x - bone.world_space.position.x);
          const bone_parent: Bone | undefined = this.bones.get(bone.parent_key);
          if (bone_parent) {
            Bone.flatten(bone_parent, this.bones);
            if (Matrix.determinant(bone_parent.world_space.scale) < 0) {
              a1 += bone_parent.world_space.rotation.rad;
            } else {
              a1 -= bone_parent.world_space.rotation.rad;
            }
          }
          bone.local_space.rotation.rad = tweenAngleRadians(bone.local_space.rotation.rad, a1, alpha);
          break;
        }
        case 2: {
          const parent: Bone | undefined = this.bones.get(ikc.bone_keys[0]);
          if (!parent) return;
          Bone.flatten(parent, this.bones);
          const child: Bone | undefined = this.bones.get(ikc.bone_keys[1]);
          if (!child) return;
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
          const t: Vector = Vector.copy(ikc_target.world_space.position, new Vector());
          const d: Vector = Vector.copy(child.world_space.position, new Vector());
          const pp: Bone | undefined = this.bones.get(parent.parent_key);
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
          parent.local_space.rotation.rad = tweenAngleRadians(parent.local_space.rotation.rad, a1, alpha);
          child.local_space.rotation.rad = tweenAngleRadians(child.local_space.rotation.rad, a2, alpha);
          break;
        }
      }
    });

    this.iterateBones((bone_key: string, bone: Bone): void => {
      Bone.flatten(bone, this.bones);
    });
  }

  private _strikeXfcs(anim: Animation | undefined): void {
    this.data.xfcs.forEach((xfc: Xfc, xfc_key: string): void => {
      const xfc_target: Bone | undefined = this.bones.get(xfc.target_key);
      if (!xfc_target) return;

      let xfc_position_mix: number = xfc.position_mix;
      let xfc_rotation_mix: number = xfc.rotation_mix;
      let xfc_scale_mix: number = xfc.scale_mix;
      let xfc_shear_mix: number = xfc.shear_mix;

      const xfc_timeline: XfcTimeline | undefined = anim && anim.xfc_timeline_map.get(xfc_key);
      if (xfc_timeline) {
        Keyframe.evaluate(xfc_timeline.xfc_keyframes, this.time, (keyframe0: XfcKeyframe, keyframe1: XfcKeyframe, k: number) => {
          const pct: number = keyframe0.curve.evaluate(k);
          xfc_position_mix = tween(keyframe0.position_mix, keyframe1.position_mix, pct);
          xfc_rotation_mix = tween(keyframe0.rotation_mix, keyframe1.rotation_mix, pct);
          xfc_scale_mix = tween(keyframe0.scale_mix, keyframe1.scale_mix, pct);
          xfc_shear_mix = tween(keyframe0.shear_mix, keyframe1.shear_mix, pct);
        });
      }

      const xfc_position: Position = xfc.position;
      const xfc_rotation: Rotation = xfc.rotation;
      const xfc_scale: Scale = xfc.scale;
      const xfc_shear: Shear = xfc.shear;

      let ta = xfc_target.world_space.affine.matrix.a, tb = xfc_target.world_space.affine.matrix.b;
      let tc = xfc_target.world_space.affine.matrix.c, td = xfc_target.world_space.affine.matrix.d;
      ///let degRadReflect = ta * td - tb * tc > 0 ? MathUtils.degRad : -MathUtils.degRad;
      ///let offsetRotation = this.data.offsetRotation * degRadReflect;
      ///let offsetShearY = this.data.offsetShearY * degRadReflect;

      xfc.bone_keys.forEach((bone_key: string) => {
        const xfc_bone: Bone | undefined = this.bones.get(bone_key);
        if (!xfc_bone) return;

        if (xfc_position_mix !== 0) {
          ///let temp = this.temp;
          ///xfc_target.localToWorld(temp.set(xfc_position.x, xfc_position.y));
          ///xfc_bone.world_space.affine.vector.x += (temp.x - xfc_bone.world_space.affine.vector.x) * xfc_position_mix;
          ///xfc_bone.world_space.affine.vector.y += (temp.y - xfc_bone.world_space.affine.vector.y) * xfc_position_mix;
          const xfc_world_position: Vector = Space.transform(xfc_target.world_space, xfc_position, new Vector());
          xfc_bone.world_space.position.tween(xfc_world_position, xfc_position_mix, xfc_bone.world_space.position);
        }

        if (xfc_rotation_mix !== 0) {
          let a = xfc_bone.world_space.affine.matrix.a; ///, b = xfc_bone.world_space.affine.matrix.b;
          let c = xfc_bone.world_space.affine.matrix.c; ///, d = xfc_bone.world_space.affine.matrix.d;
          let r = Math.atan2(tc, ta) - Math.atan2(c, a) + xfc_rotation.rad;
          r = wrapAngleRadians(r);
          r *= xfc_rotation_mix;
          let cos = Math.cos(r), sin = Math.sin(r);
          xfc_bone.world_space.affine.matrix.selfRotate(cos, sin);
        }

        if (xfc_scale_mix !== 0) {
          let s = Math.sqrt(xfc_bone.world_space.affine.matrix.a * xfc_bone.world_space.affine.matrix.a + xfc_bone.world_space.affine.matrix.c * xfc_bone.world_space.affine.matrix.c);
          let ts = Math.sqrt(ta * ta + tc * tc);
          if (s > 0.00001) s = (s + (ts - s + xfc_scale.x) * xfc_scale_mix) / s;
          xfc_bone.world_space.affine.matrix.a *= s;
          xfc_bone.world_space.affine.matrix.c *= s;
          s = Math.sqrt(xfc_bone.world_space.affine.matrix.b * xfc_bone.world_space.affine.matrix.b + xfc_bone.world_space.affine.matrix.d * xfc_bone.world_space.affine.matrix.d);
          ts = Math.sqrt(tb * tb + td * td);
          if (s > 0.00001) s = (s + (ts - s + xfc_scale.y) * xfc_scale_mix) / s;
          xfc_bone.world_space.affine.matrix.b *= s;
          xfc_bone.world_space.affine.matrix.d *= s;
        }

        if (xfc_shear_mix !== 0) {
          let b = xfc_bone.world_space.affine.matrix.b, d = xfc_bone.world_space.affine.matrix.d;
          let by = Math.atan2(d, b);
          let r = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(xfc_bone.world_space.affine.matrix.c, xfc_bone.world_space.affine.matrix.a));
          r = wrapAngleRadians(r);
          r = by + (r + xfc_shear.y.rad) * xfc_shear_mix;
          let s = Math.sqrt(b * b + d * d);
          xfc_bone.world_space.affine.matrix.b = Math.cos(r) * s;
          xfc_bone.world_space.affine.matrix.d = Math.sin(r) * s;
        }
      });
    });
  }

  private _strikeSlots(anim: Animation | undefined): void {
    this.data.slots.forEach((data_slot: Slot, slot_key: string): void => {
      const pose_slot: Slot = this.slots.get(slot_key) || this.slots.set(slot_key, new Slot());

      // start with a copy of the data slot
      pose_slot.copy(data_slot);

      // tween anim slot if keyframes are available
      const slot_timeline: SlotTimeline | undefined = anim && anim.slot_timeline_map.get(slot_key);
      if (slot_timeline) {
        Keyframe.evaluate(slot_timeline.color_keyframes, this.time, (keyframe0: SlotColorKeyframe, keyframe1: SlotColorKeyframe, k: number) => {
          keyframe0.color.tween(keyframe1.color, keyframe0.curve.evaluate(k), pose_slot.color);
        });

        Keyframe.evaluate(slot_timeline.attachment_keyframes, this.time, (keyframe0: SlotAttachmentKeyframe, keyframe1: SlotAttachmentKeyframe, k: number) => {
          // no tweening attachments
          pose_slot.attachment_key = keyframe0.name;
        });
      }
    });

    this.data.slots.keys.forEach((key: string, index: number) => { this.slots.keys[index] = key; });

    const order_timeline: OrderTimeline | undefined = anim && anim.order_timeline;
    if (order_timeline) {
      Keyframe.evaluate(order_timeline.order_keyframes, this.time, (keyframe0: OrderKeyframe, keyframe1: OrderKeyframe, k: number) => {
        keyframe0.slot_offsets.forEach((slot_offset: SlotOffset): void => {
          const slot_index: number = this.slots.keys.indexOf(slot_offset.slot_key);
          if (slot_index !== -1) {
            // delete old position
            this.slots.keys.splice(slot_index, 1);
            // insert new position
            this.slots.keys.splice(slot_index + slot_offset.offset, 0, slot_offset.slot_key);
          }
        });
      });
    }
  }

  private _strikePtcs(anim: Animation | undefined): void {
    const skin: Skin | undefined = this.data.skins.get(this.skin_key);
    const default_skin: Skin | undefined = this.data.skins.get("default");

    this.data.ptcs.forEach((ptc: Ptc, ptc_key: string): void => {
      const slot_key: string = ptc.target_key;
      const slot: Slot | undefined = this.slots.get(slot_key);
      const skin_slot: SkinSlot | undefined = (skin && skin.slots.get(slot_key)) || (default_skin && default_skin.slots.get(slot_key));
      const ptc_target: Attachment | undefined = slot && skin_slot && skin_slot.attachments.get(slot.attachment_key);

      if (!(ptc_target instanceof PathAttachment)) return;

      const ptc_spacing_mode: string = ptc.spacing_mode;
      let ptc_spacing: number = ptc.spacing;

      const ptc_position_mode: string = ptc.position_mode;
      let ptc_position_mix: number = ptc.position_mix;
      let ptc_position: number = ptc.position;

      const ptc_rotation_mode: string = ptc.rotation_mode;
      let ptc_rotation_mix: number = ptc.rotation_mix;
      const ptc_rotation: Rotation = ptc.rotation;

      const ptc_timeline: PtcTimeline | undefined = anim && anim.ptc_timeline_map.get(ptc_key);
      if (ptc_timeline) {
        Keyframe.evaluate(ptc_timeline.ptc_mix_keyframes, this.time, (keyframe0: PtcMixKeyframe, keyframe1: PtcMixKeyframe, k: number) => {
          const pct: number = keyframe0.curve.evaluate(k);
          ptc_position_mix = tween(keyframe0.position_mix, keyframe1.position_mix, pct);
          ptc_rotation_mix = tween(keyframe0.rotation_mix, keyframe1.rotation_mix, pct);
        });

        Keyframe.evaluate(ptc_timeline.ptc_spacing_keyframes, this.time, (keyframe0: PtcSpacingKeyframe, keyframe1: PtcSpacingKeyframe, k: number) => {
          ptc_spacing = tween(keyframe0.spacing, keyframe1.spacing, keyframe0.curve.evaluate(k));
        });

        Keyframe.evaluate(ptc_timeline.ptc_position_keyframes, this.time, (keyframe0: PtcPositionKeyframe, keyframe1: PtcPositionKeyframe, k: number) => {
          ptc_position = tween(keyframe0.position, keyframe1.position, keyframe0.curve.evaluate(k));
        });

        Keyframe.evaluate(ptc_timeline.ptc_rotation_keyframes, this.time, (keyframe0: PtcRotationKeyframe, keyframe1: PtcRotationKeyframe, k: number) => {
          ptc_rotation.rad = tweenAngleRadians(keyframe0.rotation.rad, keyframe1.rotation.rad, keyframe0.curve.evaluate(k));
        });
      }

      ptc.bone_keys.forEach((bone_key: string): void => {
        const ptc_bone: Bone | undefined = this.bones.get(bone_key);

        if (!ptc_bone) return;

        // TODO: solve path constraint for ptc_bone (Bone) using ptc_target (PathAttachment)

        switch (ptc_spacing_mode) {
          case "length":
          case "fixed":
          case "percent":
            break;
        }

        switch (ptc_position_mode) {
          case "fixed":
          case "percent":
            break;
        }

        switch (ptc_rotation_mode) {
          case "tangent":
          case "chain":
          case "chainscale":
            break;
        }
      });
    });
  }

  private _strikeEvents(anim: Animation | undefined): void {
    this.events.length = 0;

    if (anim && anim.event_timeline) {
      const make_event = (event_keyframe: EventKeyframe): Event => {
        const pose_event: Event = new Event();
        const data_event: Event | undefined = this.data.events.get(event_keyframe.name);
        if (data_event) {
          pose_event.copy(data_event);
        }
        pose_event.int_value = event_keyframe.int_value || pose_event.int_value;
        pose_event.float_value = event_keyframe.float_value || pose_event.float_value;
        pose_event.string_value = event_keyframe.string_value || pose_event.string_value;
        return pose_event;
      };

      if (this.elapsed_time < 0) {
        if (this.wrapped_min) {
          // min    prev_time           time      max
          //  |         |                |         |
          //  ----------x                o<---------
          // all events between min_time and prev_time, not including prev_time
          // all events between max_time and time
          anim.event_timeline.event_keyframes.forEach((event_keyframe: EventKeyframe): void => {
            if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time < this.prev_time)) ||
              ((this.time <= event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
              this.events.push(make_event(event_keyframe));
            }
          });
        } else {
          // min       time          prev_time    max
          //  |         |                |         |
          //            o<---------------x
          // all events between time and prev_time, not including prev_time
          anim.event_timeline.event_keyframes.forEach((event_keyframe: EventKeyframe): void => {
            if ((this.time <= event_keyframe.time) && (event_keyframe.time < this.prev_time)) {
              this.events.push(make_event(event_keyframe));
            }
          });
        }
      } else {
        if (this.wrapped_max) {
          // min       time          prev_time    max
          //  |         |                |         |
          //  --------->o                x----------
          // all events between prev_time and max_time, not including prev_time
          // all events between min_time and time
          anim.event_timeline.event_keyframes.forEach((event_keyframe: EventKeyframe): void => {
            if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time <= this.time)) ||
              ((this.prev_time < event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
                this.events.push(make_event(event_keyframe));
            }
          });
        } else {
          // min    prev_time           time      max
          //  |         |                |         |
          //            x--------------->o
          // all events between prev_time and time, not including prev_time
          anim.event_timeline.event_keyframes.forEach((event_keyframe: EventKeyframe): void => {
            if ((this.prev_time < event_keyframe.time) && (event_keyframe.time <= this.time)) {
              this.events.push(make_event(event_keyframe));
            }
          });
        }
      }
    }
  }

  public iterateBones(callback: (bone_key: string, bone: Bone) => void): void {
    this.bones.forEach((bone: Bone, bone_key: string): void => {
      callback(bone_key, bone);
    });
  }

  public iterateAttachments(callback: (slot_key: string, pose_slot: Slot, skin_slot: SkinSlot | undefined, attachment_key: string, attachment: Attachment | undefined) => void): void {
    const skin: Skin | undefined = this.data.skins.get(this.skin_key);
    const default_skin: Skin | undefined = this.data.skins.get("default");
    this.slots.forEach((pose_slot: Slot, slot_key: string): void => {
      const skin_slot: SkinSlot | undefined = (skin && skin.slots.get(slot_key)) || (default_skin && default_skin.slots.get(slot_key));
      let attachment: Attachment | undefined = skin_slot && skin_slot.attachments.get(pose_slot.attachment_key);
      let attachment_key: string = (attachment && attachment.name) || pose_slot.attachment_key;
      if (attachment && (attachment.type === "linkedmesh")) {
        attachment_key = (<LinkedMeshAttachment>attachment).parent_key;
        attachment = skin_slot && skin_slot.attachments.get(attachment_key);
      }
      callback(slot_key, pose_slot, skin_slot, attachment_key, attachment);
    });
  }
}
