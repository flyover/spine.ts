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
System.register([], function (exports_1, context_1) {
    "use strict";
    var EPSILON, SpineMap, Color, Curve, Angle, Vector, Matrix, Affine, Position, Rotation, Scale, Shear, Space, Bone, Constraint, Ikc, Xfc, Ptc, Slot, Attachment, RegionAttachment, BoundingBoxAttachment, MeshAttachment, LinkedMeshAttachment, WeightedMeshAttachment, PathAttachment, ClippingAttachment, SkinSlot, Skin, Event, Range, Keyframe, Timeline, CurveKeyframe, BonePositionKeyframe, BonePositionTimeline, BoneRotationKeyframe, BoneRotationTimeline, BoneScaleKeyframe, BoneScaleTimeline, BoneShearKeyframe, BoneShearTimeline, BoneTimeline, SlotColorKeyframe, SlotColorTimeline, SlotAttachmentKeyframe, SlotAttachmentTimeline, SlotTimeline, EventKeyframe, EventTimeline, SlotOffset, OrderKeyframe, OrderTimeline, IkcKeyframe, IkcTimeline, XfcKeyframe, XfcTimeline, PtcMixKeyframe, PtcMixTimeline, PtcSpacingKeyframe, PtcSpacingTimeline, PtcPositionKeyframe, PtcPositionTimeline, PtcRotationKeyframe, PtcRotationTimeline, PtcTimeline, FfdKeyframe, FfdTimeline, FfdAttachment, FfdSlot, FfdSkin, Animation, Skeleton, Data, Pose;
    var __moduleName = context_1 && context_1.id;
    function loadBool(json, key, def = false) {
        const value = json[key];
        switch (typeof (value)) {
            case "string": return (value === "true") ? true : false;
            case "boolean": return value;
            default: return def;
        }
    }
    exports_1("loadBool", loadBool);
    function saveBool(json, key, value, def = false) {
        if ((typeof (def) !== "boolean") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveBool", saveBool);
    function loadFloat(json, key, def = 0) {
        const value = json[key];
        switch (typeof (value)) {
            case "string": return parseFloat(value);
            case "number": return value;
            default: return def;
        }
    }
    exports_1("loadFloat", loadFloat);
    function saveFloat(json, key, value, def = 0) {
        if ((typeof (def) !== "number") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveFloat", saveFloat);
    function loadInt(json, key, def = 0) {
        const value = json[key];
        switch (typeof (value)) {
            case "string": return parseInt(value, 10);
            case "number": return 0 | value;
            default: return def;
        }
    }
    exports_1("loadInt", loadInt);
    function saveInt(json, key, value, def = 0) {
        if ((typeof (def) !== "number") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveInt", saveInt);
    function loadString(json, key, def = "") {
        const value = json[key];
        switch (typeof (value)) {
            case "string": return value;
            default: return def;
        }
    }
    exports_1("loadString", loadString);
    function saveString(json, key, value, def = "") {
        if ((typeof (def) !== "string") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveString", saveString);
    // from: http://github.com/arian/cubic-bezier
    function BezierCurve(x1, y1, x2, y2, epsilon = EPSILON) {
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
        function curveX(t) {
            const t2 = t * t;
            const t3 = t2 * t;
            const v = 1 - t;
            const v2 = v * v;
            return 3 * x1 * v2 * t + 3 * x2 * v * t2 + t3;
        }
        function curveY(t) {
            const t2 = t * t;
            const t3 = t2 * t;
            const v = 1 - t;
            const v2 = v * v;
            return 3 * y1 * v2 * t + 3 * y2 * v * t2 + t3;
        }
        function derivativeCurveX(t) {
            const t2 = t * t;
            const t3 = t2 * t;
            return 3 * x1 * t - 3 * (2 * x1 - x2) * t2 + (3 * x1 - 3 * x2 + 1) * t3;
        }
        return function (percent) {
            const x = percent;
            let t0, t1, t2, x2, d2, i;
            // First try a few iterations of Newton"s method -- normally very fast.
            for (t2 = x, i = 0; i < 8; ++i) {
                x2 = curveX(t2) - x;
                if (Math.abs(x2) < epsilon)
                    return curveY(t2);
                d2 = derivativeCurveX(t2);
                if (Math.abs(d2) < epsilon)
                    break;
                t2 = t2 - (x2 / d2);
            }
            t0 = 0, t1 = 1, t2 = x;
            if (t2 < t0)
                return curveY(t0);
            if (t2 > t1)
                return curveY(t1);
            // Fallback to the bisection method for reliability.
            while (t0 < t1) {
                x2 = curveX(t2);
                if (Math.abs(x2 - x) < epsilon)
                    return curveY(t2);
                if (x > x2)
                    t0 = t2;
                else
                    t1 = t2;
                t2 = (t1 - t0) * 0.5 + t0;
            }
            // Failure
            return curveY(t2);
        };
    }
    exports_1("BezierCurve", BezierCurve);
    // from: spine-libgdx/src/com/esotericsoftware/spine/Animation.java
    function StepBezierCurve(cx1, cy1, cx2, cy2) {
        const bezierSegments = 10;
        const subdiv_step = 1 / bezierSegments;
        const subdiv_step2 = subdiv_step * subdiv_step;
        const subdiv_step3 = subdiv_step2 * subdiv_step;
        const pre1 = 3 * subdiv_step;
        const pre2 = 3 * subdiv_step2;
        const pre4 = 6 * subdiv_step2;
        const pre5 = 6 * subdiv_step3;
        const tmp1x = -cx1 * 2 + cx2;
        const tmp1y = -cy1 * 2 + cy2;
        const tmp2x = (cx1 - cx2) * 3 + 1;
        const tmp2y = (cy1 - cy2) * 3 + 1;
        const curves_0 = (cx1 * pre1 + tmp1x * pre2 + tmp2x * subdiv_step3);
        const curves_1 = (cy1 * pre1 + tmp1y * pre2 + tmp2y * subdiv_step3);
        const curves_2 = (tmp1x * pre4 + tmp2x * pre5);
        const curves_3 = (tmp1y * pre4 + tmp2y * pre5);
        const curves_4 = (tmp2x * pre5);
        const curves_5 = (tmp2y * pre5);
        return function (percent) {
            let dfx = curves_0;
            let dfy = curves_1;
            let ddfx = curves_2;
            let ddfy = curves_3;
            const dddfx = curves_4;
            const dddfy = curves_5;
            let x = dfx, y = dfy;
            let i = bezierSegments - 2;
            while (true) {
                if (x >= percent) {
                    const lastX = x - dfx;
                    const lastY = y - dfy;
                    return lastY + (y - lastY) * (percent - lastX) / (x - lastX);
                }
                if (i === 0)
                    break;
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
    exports_1("StepBezierCurve", StepBezierCurve);
    function sign(n) { return (n < 0) ? (-1) : (n > 0) ? (1) : (n); }
    exports_1("sign", sign);
    function wrap(num, min, max) {
        if (min < max) {
            if (num < min) {
                return max - ((min - num) % (max - min));
            }
            else {
                return min + ((num - min) % (max - min));
            }
        }
        else if (min === max) {
            return min;
        }
        else {
            return num;
        }
    }
    exports_1("wrap", wrap);
    function tween(a, b, t) {
        return a + ((b - a) * t);
    }
    exports_1("tween", tween);
    function wrapAngleRadians(angle) {
        if (angle <= 0) {
            return ((angle - Math.PI) % (2 * Math.PI)) + Math.PI;
        }
        else {
            return ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
        }
    }
    exports_1("wrapAngleRadians", wrapAngleRadians);
    function tweenAngleRadians(a, b, t) {
        return wrapAngleRadians(a + (wrapAngleRadians(b - a) * t));
    }
    exports_1("tweenAngleRadians", tweenAngleRadians);
    return {
        setters: [],
        execute: function () {
            /**
             * A TypeScript API for the Spine JSON animation data format.
             */
            exports_1("EPSILON", EPSILON = 1e-6);
            SpineMap = class SpineMap {
                constructor(...args) {
                    this._keys = [];
                    this._map = new Map(args);
                    this._map.forEach((value, key) => {
                        this._keys.push(key);
                    });
                }
                clear() {
                    this._keys.length = 0;
                    this._map.clear();
                }
                key(index) {
                    return this._keys[index];
                }
                has(key) {
                    return this._map.has(key);
                }
                hasByIndex(index) {
                    return this.has(this._keys[index]);
                }
                get(key) {
                    return this._map.get(key);
                }
                getByIndex(index) {
                    return this.get(this._keys[index]);
                }
                set(key, value) {
                    if (!this._map.has(key)) {
                        this._keys.push(key);
                    }
                    this._map.set(key, value);
                    return value;
                }
                setByIndex(index, value) {
                    return this.set(this._keys[index], value);
                }
                delete(key) {
                    this._keys.splice(this._keys.indexOf(key), 1);
                    this._map.delete(key);
                }
                deleteByIndex(index) {
                    this.delete(this._keys[index]);
                }
                forEach(callback) {
                    this._keys.forEach((key, index, array) => {
                        const value = this._map.get(key);
                        if (!value)
                            throw new Error();
                        callback(value, key, index, this);
                    });
                }
                map(callback) {
                    const array = [];
                    this.forEach((value, key, index, map) => {
                        array.push(callback(value, key, index, map));
                    });
                    return array;
                }
                sortKeys(callback) {
                    this._keys.sort(callback);
                }
            };
            exports_1("Map", SpineMap);
            Color = class Color {
                constructor() {
                    this.r = 1;
                    this.g = 1;
                    this.b = 1;
                    this.a = 1;
                }
                static copy(color, out = new Color()) {
                    out.r = color.r;
                    out.g = color.g;
                    out.b = color.b;
                    out.a = color.a;
                    return out;
                }
                copy(other) {
                    return Color.copy(other, this);
                }
                load(json, def = 0xffffffff) {
                    let rgba = def;
                    if (typeof (json) === "string")
                        rgba = parseInt(json, 16);
                    if (typeof (json) === "number")
                        rgba = 0 | json;
                    this.r = ((rgba >> 24) & 0xff) / 0xff;
                    this.g = ((rgba >> 16) & 0xff) / 0xff;
                    this.b = ((rgba >> 8) & 0xff) / 0xff;
                    this.a = (rgba & 0xff) / 0xff;
                    return this;
                }
                toString() {
                    return "rgba(" + (this.r * 255).toFixed(0) + "," + (this.g * 255).toFixed(0) + "," + (this.b * 255).toFixed(0) + "," + this.a + ")";
                }
                static tween(a, b, pct, out = new Color()) {
                    out.r = tween(a.r, b.r, pct);
                    out.g = tween(a.g, b.g, pct);
                    out.b = tween(a.b, b.b, pct);
                    out.a = tween(a.a, b.a, pct);
                    return out;
                }
                tween(other, pct, out = new Color()) {
                    return Color.tween(this, other, pct, out);
                }
                selfTween(other, pct) {
                    return Color.tween(this, other, pct, this);
                }
            };
            exports_1("Color", Color);
            Curve = class Curve {
                constructor() {
                    this.evaluate = function (t) { return t; };
                }
                load(json) {
                    // default: linear
                    this.evaluate = function (t) { return t; };
                    if ((typeof (json) === "string") && (json === "stepped")) {
                        // stepped
                        this.evaluate = function (t) { return 0; };
                    }
                    else if ((typeof (json) === "object") && (typeof (json.length) === "number") && (json.length === 4)) {
                        // bezier
                        const x1 = loadFloat(json, 0, 0);
                        const y1 = loadFloat(json, 1, 0);
                        const x2 = loadFloat(json, 2, 1);
                        const y2 = loadFloat(json, 3, 1);
                        // curve.evaluate = BezierCurve(x1, y1, x2, y2);
                        this.evaluate = StepBezierCurve(x1, y1, x2, y2);
                    }
                    return this;
                }
            };
            exports_1("Curve", Curve);
            Angle = class Angle {
                constructor(rad = 0) {
                    this._rad = 0;
                    this._cos = 1;
                    this._sin = 0;
                    this.rad = rad;
                }
                get rad() { return this._rad; }
                set rad(value) {
                    if (this._rad !== value) {
                        this._rad = value;
                        this._cos = Math.cos(value);
                        this._sin = Math.sin(value);
                    }
                }
                get deg() { return this.rad * 180 / Math.PI; }
                set deg(value) { this.rad = value * Math.PI / 180; }
                get cos() { return this._cos; }
                get sin() { return this._sin; }
                static copy(angle, out = new Angle()) {
                    out._rad = angle._rad;
                    out._cos = angle._cos;
                    out._sin = angle._sin;
                    return out;
                }
                copy(other) {
                    return Angle.copy(other, this);
                }
                static equal(a, b, epsilon = EPSILON) {
                    if (Math.abs(wrapAngleRadians(a.rad - b.rad)) > epsilon) {
                        return false;
                    }
                    return true;
                }
                equal(other, epsilon = EPSILON) {
                    return Angle.equal(this, other, epsilon);
                }
                static tween(a, b, pct, out = new Angle()) {
                    out.rad = tweenAngleRadians(a.rad, b.rad, pct);
                    return out;
                }
                tween(other, pct, out = new Angle()) {
                    return Angle.tween(this, other, pct, out);
                }
                selfTween(other, pct) {
                    return Angle.tween(this, other, pct, this);
                }
            };
            exports_1("Angle", Angle);
            Vector = class Vector {
                constructor(x = 0, y = 0) {
                    this.x = 0;
                    this.y = 0;
                    this.x = x;
                    this.y = y;
                }
                static copy(v, out = new Vector()) {
                    out.x = v.x;
                    out.y = v.y;
                    return out;
                }
                copy(other) {
                    return Vector.copy(other, this);
                }
                static equal(a, b, epsilon = EPSILON) {
                    if (Math.abs(a.x - b.x) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.y - b.y) > epsilon) {
                        return false;
                    }
                    return true;
                }
                equal(other, epsilon = EPSILON) {
                    return Vector.equal(this, other, epsilon);
                }
                static negate(v, out = new Vector()) {
                    out.x = -v.x;
                    out.y = -v.y;
                    return out;
                }
                static add(a, b, out = new Vector()) {
                    out.x = a.x + b.x;
                    out.y = a.y + b.y;
                    return out;
                }
                add(other, out = new Vector()) {
                    return Vector.add(this, other, out);
                }
                selfAdd(other) {
                    // return Vector.add(this, other, this);
                    this.x += other.x;
                    this.y += other.y;
                    return this;
                }
                static subtract(a, b, out = new Vector()) {
                    out.x = a.x - b.x;
                    out.y = a.y - b.y;
                    return out;
                }
                subtract(other, out = new Vector()) {
                    return Vector.subtract(this, other, out);
                }
                selfSubtract(other) {
                    // return Vector.subtract(this, other, this);
                    this.x -= other.x;
                    this.y -= other.y;
                    return this;
                }
                static scale(v, x, y = x, out = new Vector()) {
                    out.x = v.x * x;
                    out.y = v.y * y;
                    return out;
                }
                scale(x, y = x, out = new Vector()) {
                    return Vector.scale(this, x, y, out);
                }
                selfScale(x, y = x) {
                    return Vector.scale(this, x, y, this);
                }
                static tween(a, b, pct, out = new Vector()) {
                    out.x = tween(a.x, b.x, pct);
                    out.y = tween(a.y, b.y, pct);
                    return out;
                }
                tween(other, pct, out = new Vector()) {
                    return Vector.tween(this, other, pct, out);
                }
                selfTween(other, pct) {
                    return Vector.tween(this, other, pct, this);
                }
            };
            exports_1("Vector", Vector);
            Matrix = class Matrix {
                constructor() {
                    this.a = 1;
                    this.b = 0;
                    this.c = 0;
                    this.d = 1;
                }
                static copy(m, out = new Matrix()) {
                    out.a = m.a;
                    out.b = m.b;
                    out.c = m.c;
                    out.d = m.d;
                    return out;
                }
                copy(other) {
                    return Matrix.copy(other, this);
                }
                static equal(a, b, epsilon = EPSILON) {
                    if (Math.abs(a.a - b.a) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.b - b.b) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.c - b.c) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.d - b.d) > epsilon) {
                        return false;
                    }
                    return true;
                }
                equal(other, epsilon = EPSILON) {
                    return Matrix.equal(this, other, epsilon);
                }
                static determinant(m) {
                    return m.a * m.d - m.b * m.c;
                }
                static identity(out = new Matrix()) {
                    out.a = 1;
                    out.b = 0;
                    out.c = 0;
                    out.d = 1;
                    return out;
                }
                static multiply(a, b, out = new Matrix()) {
                    const a_a = a.a, a_b = a.b, a_c = a.c, a_d = a.d;
                    const b_a = b.a, b_b = b.b, b_c = b.c, b_d = b.d;
                    out.a = a_a * b_a + a_b * b_c;
                    out.b = a_a * b_b + a_b * b_d;
                    out.c = a_c * b_a + a_d * b_c;
                    out.d = a_c * b_b + a_d * b_d;
                    return out;
                }
                static invert(m, out = new Matrix()) {
                    const a = m.a, b = m.b, c = m.c, d = m.d;
                    const inv_det = 1 / (a * d - b * c);
                    out.a = inv_det * d;
                    out.b = -inv_det * b;
                    out.c = -inv_det * c;
                    out.d = inv_det * a;
                    return out;
                }
                static combine(a, b, out) {
                    return Matrix.multiply(a, b, out);
                }
                static extract(ab, a, out) {
                    return Matrix.multiply(Matrix.invert(a, out), ab, out);
                }
                selfRotate(cos, sin) {
                    return Matrix.rotate(this, cos, sin, this);
                }
                static rotate(m, cos, sin, out = new Matrix()) {
                    const a = m.a, b = m.b, c = m.c, d = m.d;
                    out.a = a * cos + b * sin;
                    out.b = b * cos - a * sin;
                    out.c = c * cos + d * sin;
                    out.d = d * cos - c * sin;
                    return out;
                }
                static scale(m, x, y, out = new Matrix()) {
                    out.a = m.a * x;
                    out.b = m.b * y;
                    out.c = m.c * x;
                    out.d = m.d * y;
                    return out;
                }
                static transform(m, v, out = new Vector()) {
                    const x = v.x, y = v.y;
                    out.x = m.a * x + m.b * y;
                    out.y = m.c * x + m.d * y;
                    return out;
                }
                static untransform(m, v, out = new Vector()) {
                    const a = m.a, b = m.b, c = m.c, d = m.d;
                    const x = v.x, y = v.y;
                    const inv_det = 1 / (a * d - b * c);
                    out.x = inv_det * (d * x - b * y);
                    out.y = inv_det * (a * y - c * x);
                    return out;
                }
                static tween(a, b, pct, out = new Matrix()) {
                    out.a = tween(a.a, b.a, pct);
                    out.b = tween(a.b, b.b, pct);
                    out.c = tween(a.c, b.c, pct);
                    out.d = tween(a.d, b.d, pct);
                    return out;
                }
                tween(other, pct, out = new Matrix()) {
                    return Matrix.tween(this, other, pct, out);
                }
                selfTween(other, pct) {
                    return Matrix.tween(this, other, pct, this);
                }
            };
            exports_1("Matrix", Matrix);
            Affine = class Affine {
                constructor() {
                    this.vector = new Vector();
                    this.matrix = new Matrix();
                }
                static copy(affine, out = new Affine()) {
                    Vector.copy(affine.vector, out.vector);
                    Matrix.copy(affine.matrix, out.matrix);
                    return out;
                }
                copy(other) {
                    return Affine.copy(other, this);
                }
                static equal(a, b, epsilon = EPSILON) {
                    if (!a.vector.equal(b.vector, epsilon)) {
                        return false;
                    }
                    if (!a.matrix.equal(b.matrix, epsilon)) {
                        return false;
                    }
                    return true;
                }
                equal(other, epsilon = EPSILON) {
                    return Affine.equal(this, other, epsilon);
                }
                static identity(out = new Affine()) {
                    Matrix.identity(out.matrix);
                    out.vector.x = 0;
                    out.vector.y = 0;
                    return out;
                }
                static invert(affine, out = new Affine()) {
                    Matrix.invert(affine.matrix, out.matrix);
                    Vector.negate(affine.vector, out.vector);
                    Matrix.transform(out.matrix, out.vector, out.vector);
                    return out;
                }
                static combine(a, b, out = new Affine()) {
                    Affine.transform(a, b.vector, out.vector);
                    Matrix.combine(a.matrix, b.matrix, out.matrix);
                    return out;
                }
                static extract(ab, a, out = new Affine()) {
                    Matrix.extract(ab.matrix, a.matrix, out.matrix);
                    Affine.untransform(a, ab.vector, out.vector);
                    return out;
                }
                static transform(affine, v, out = new Vector()) {
                    Matrix.transform(affine.matrix, v, out);
                    Vector.add(affine.vector, out, out);
                    return out;
                }
                static untransform(affine, v, out = new Vector()) {
                    Vector.subtract(v, affine.vector, out);
                    Matrix.untransform(affine.matrix, out, out);
                    return out;
                }
            };
            exports_1("Affine", Affine);
            Position = class Position extends Vector {
                constructor() {
                    super(0, 0);
                }
            };
            exports_1("Position", Position);
            Rotation = class Rotation extends Angle {
                constructor() {
                    super(...arguments);
                    this.matrix = new Matrix();
                }
                updateMatrix(m = this.matrix) {
                    m.a = this.cos;
                    m.b = -this.sin;
                    m.c = this.sin;
                    m.d = this.cos;
                    return m;
                }
            };
            exports_1("Rotation", Rotation);
            Scale = class Scale extends Matrix {
                get x() { return (Math.abs(this.c) < EPSILON) ? (this.a) : (sign(this.a) * Math.sqrt(this.a * this.a + this.c * this.c)); }
                set x(value) { this.a = value; this.c = 0; }
                get y() { return (Math.abs(this.b) < EPSILON) ? (this.d) : (sign(this.d) * Math.sqrt(this.b * this.b + this.d * this.d)); }
                set y(value) { this.b = 0; this.d = value; }
            };
            exports_1("Scale", Scale);
            Shear = class Shear {
                constructor() {
                    this.x = new Angle();
                    this.y = new Angle();
                    this.matrix = new Matrix();
                }
                updateMatrix(m = this.matrix) {
                    m.a = this.x.cos;
                    m.b = -this.y.sin;
                    m.c = this.x.sin;
                    m.d = this.y.cos;
                    return m;
                }
                static copy(shear, out = new Shear()) {
                    out.x.copy(shear.x);
                    out.y.copy(shear.y);
                    return out;
                }
                copy(other) {
                    return Shear.copy(other, this);
                }
                static equal(a, b, epsilon = EPSILON) {
                    if (!a.x.equal(b.x, epsilon)) {
                        return false;
                    }
                    if (!a.y.equal(b.y, epsilon)) {
                        return false;
                    }
                    return true;
                }
                equal(other, epsilon = EPSILON) {
                    return Shear.equal(this, other, epsilon);
                }
                static tween(a, b, pct, out = new Shear()) {
                    Angle.tween(a.x, b.x, pct, out.x);
                    Angle.tween(a.y, b.y, pct, out.y);
                    return out;
                }
                tween(other, pct, out = new Shear()) {
                    return Shear.tween(this, other, pct, out);
                }
                selfTween(other, pct) {
                    return Shear.tween(this, other, pct, this);
                }
            };
            exports_1("Shear", Shear);
            Space = class Space {
                constructor() {
                    this.position = new Position();
                    this.rotation = new Rotation();
                    this.scale = new Scale();
                    this.shear = new Shear();
                    this.affine = new Affine();
                }
                updateAffine(affine = this.affine) {
                    Vector.copy(this.position, affine.vector);
                    Matrix.copy(this.rotation.updateMatrix(), affine.matrix);
                    Matrix.multiply(affine.matrix, this.shear.updateMatrix(), affine.matrix);
                    Matrix.multiply(affine.matrix, this.scale, affine.matrix);
                    return affine;
                }
                static copy(space, out = new Space()) {
                    out.position.copy(space.position);
                    out.rotation.copy(space.rotation);
                    out.scale.copy(space.scale);
                    out.shear.copy(space.shear);
                    return out;
                }
                copy(other) {
                    return Space.copy(other, this);
                }
                load(json) {
                    this.position.x = loadFloat(json, "x", 0);
                    this.position.y = loadFloat(json, "y", 0);
                    this.rotation.deg = loadFloat(json, "rotation", 0);
                    this.scale.x = loadFloat(json, "scaleX", 1);
                    this.scale.y = loadFloat(json, "scaleY", 1);
                    this.shear.x.deg = loadFloat(json, "shearX", 0);
                    this.shear.y.deg = loadFloat(json, "shearY", 0);
                    return this;
                }
                static equal(a, b, epsilon = EPSILON) {
                    if (!a.position.equal(b.position, epsilon)) {
                        return false;
                    }
                    if (!a.rotation.equal(b.rotation, epsilon)) {
                        return false;
                    }
                    if (!a.scale.equal(b.scale, epsilon)) {
                        return false;
                    }
                    if (!a.shear.equal(b.shear, epsilon)) {
                        return false;
                    }
                    return true;
                }
                equal(other, epsilon = EPSILON) {
                    return Space.equal(this, other, epsilon);
                }
                static identity(out = new Space()) {
                    out.position.x = 0;
                    out.position.y = 0;
                    out.rotation.rad = 0;
                    out.scale.x = 1;
                    out.scale.y = 1;
                    out.shear.x.rad = 0;
                    out.shear.y.rad = 0;
                    return out;
                }
                static translate(space, x, y) {
                    Space.transform(space, new Vector(x, y), space.position);
                    return space;
                }
                static rotate(space, rad) {
                    if (Matrix.determinant(space.scale) < 0.0) {
                        space.rotation.rad = wrapAngleRadians(space.rotation.rad - rad);
                    }
                    else {
                        space.rotation.rad = wrapAngleRadians(space.rotation.rad + rad);
                    }
                    return space;
                }
                static scale(space, x, y) {
                    Matrix.scale(space.scale, x, y, space.scale);
                    return space;
                }
                static invert(space, out = new Space()) {
                    if (space === out) {
                        space = Space.copy(space, new Space());
                    }
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
                static combine(a, b, out = new Space()) {
                    if (a === out) {
                        a = Space.copy(a, new Space());
                    }
                    if (b === out) {
                        b = Space.copy(b, new Space());
                    }
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
                static extract(ab, a, out = new Space()) {
                    if (ab === out) {
                        ab = Space.copy(ab, new Space());
                    }
                    if (a === out) {
                        a = Space.copy(a, new Space());
                    }
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
                static transform(space, v, out = new Vector()) {
                    return Affine.transform(space.updateAffine(), v, out);
                }
                static untransform(space, v, out = new Vector()) {
                    return Affine.untransform(space.updateAffine(), v, out);
                }
                static tween(a, b, pct, out = new Space()) {
                    a.position.tween(b.position, pct, out.position);
                    a.rotation.tween(b.rotation, pct, out.rotation);
                    a.scale.tween(b.scale, pct, out.scale);
                    a.shear.tween(b.shear, pct, out.shear);
                    return out;
                }
                tween(other, pct, out = new Space()) {
                    return Space.tween(this, other, pct, out);
                }
                selfTween(other, pct) {
                    return Space.tween(this, other, pct, this);
                }
            };
            exports_1("Space", Space);
            Bone = class Bone {
                constructor() {
                    this.color = new Color();
                    this.parent_key = "";
                    this.length = 0;
                    this.local_space = new Space();
                    this.world_space = new Space();
                    this.inherit_rotation = true;
                    this.inherit_scale = true;
                    this.transform = "normal";
                }
                copy(other) {
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
                load(json) {
                    this.color.load(json.color, 0x989898ff);
                    this.parent_key = loadString(json, "parent", "");
                    this.length = loadFloat(json, "length", 0);
                    this.local_space.load(json);
                    this.inherit_rotation = loadBool(json, "inheritRotation", true);
                    this.inherit_scale = loadBool(json, "inheritScale", true);
                    this.transform = loadString(json, "transform", "normal");
                    if (json.transform) {
                        switch (json.transform) {
                            case "normal":
                                this.inherit_rotation = this.inherit_scale = true;
                                break;
                            case "onlyTranslation":
                                this.inherit_rotation = this.inherit_scale = false;
                                break;
                            case "noRotationOrReflection":
                                this.inherit_rotation = false;
                                break;
                            case "noScale":
                                this.inherit_scale = false;
                                break;
                            case "noScaleOrReflection":
                                this.inherit_scale = false;
                                break;
                            default: throw new Error("TODO: Space.transform: " + json.transform);
                        }
                    }
                    return this;
                }
                static flatten(bone, bones) {
                    const bls = bone.local_space;
                    const bws = bone.world_space;
                    let parent = bones.get(bone.parent_key);
                    if (!parent) {
                        bws.copy(bls);
                        bws.updateAffine();
                    }
                    else {
                        Bone.flatten(parent, bones);
                        const pws = parent.world_space;
                        // compute bone world space position vector
                        Space.transform(pws, bls.position, bws.position);
                        // compute bone world affine rotation/scale matrix based in inheritance
                        if (bone.inherit_rotation && bone.inherit_scale) {
                            Matrix.copy(pws.affine.matrix, bws.affine.matrix);
                        }
                        else if (bone.inherit_rotation) {
                            Matrix.identity(bws.affine.matrix);
                            while (parent && parent.inherit_rotation) {
                                const pls = parent.local_space;
                                Matrix.rotate(bws.affine.matrix, pls.rotation.cos, pls.rotation.sin, bws.affine.matrix);
                                parent = bones.get(parent.parent_key);
                            }
                        }
                        else if (bone.inherit_scale) {
                            Matrix.identity(bws.affine.matrix);
                            while (parent && parent.inherit_scale) {
                                const pls = parent.local_space;
                                let cos = pls.rotation.cos, sin = pls.rotation.sin;
                                Matrix.rotate(bws.affine.matrix, cos, sin, bws.affine.matrix);
                                Matrix.multiply(bws.affine.matrix, pls.scale, bws.affine.matrix);
                                if (pls.scale.x >= 0) {
                                    sin = -sin;
                                }
                                Matrix.rotate(bws.affine.matrix, cos, sin, bws.affine.matrix);
                                parent = bones.get(parent.parent_key);
                            }
                        }
                        else {
                            Matrix.identity(bws.affine.matrix);
                        }
                        // apply bone local space
                        bls.updateAffine();
                        Matrix.multiply(bws.affine.matrix, bls.affine.matrix, bws.affine.matrix);
                        // update bone world space
                        bws.shear.x.rad = wrapAngleRadians(pws.shear.x.rad + bls.shear.x.rad);
                        bws.shear.y.rad = wrapAngleRadians(pws.shear.y.rad + bls.shear.y.rad);
                        const x_axis_rad = Math.atan2(bws.affine.matrix.c, bws.affine.matrix.a);
                        bws.rotation.rad = wrapAngleRadians(x_axis_rad - bws.shear.x.rad);
                        Matrix.combine(bws.rotation.updateMatrix(), bws.shear.updateMatrix(), bws.scale);
                        Matrix.extract(bws.affine.matrix, bws.scale, bws.scale);
                    }
                    return bone;
                }
            };
            exports_1("Bone", Bone);
            Constraint = class Constraint {
                constructor() {
                    // public name: string = "";
                    this.order = 0;
                }
                load(json) {
                    // this.name = loadString(json, "name", "");
                    this.order = loadInt(json, "order", 0);
                    return this;
                }
            };
            exports_1("Constraint", Constraint);
            Ikc = class Ikc extends Constraint {
                constructor() {
                    super(...arguments);
                    this.bone_keys = [];
                    this.target_key = "";
                    this.mix = 1;
                    this.bend_positive = true;
                }
                load(json) {
                    super.load(json);
                    this.bone_keys = json["bones"] || [];
                    this.target_key = loadString(json, "target", "");
                    this.mix = loadFloat(json, "mix", 1);
                    this.bend_positive = loadBool(json, "bendPositive", true);
                    return this;
                }
            };
            exports_1("Ikc", Ikc);
            Xfc = class Xfc extends Constraint {
                constructor() {
                    super(...arguments);
                    this.bone_keys = [];
                    this.target_key = "";
                    this.position_mix = 1;
                    this.position = new Position();
                    this.rotation_mix = 1;
                    this.rotation = new Rotation();
                    this.scale_mix = 1;
                    this.scale = new Scale();
                    this.shear_mix = 1;
                    this.shear = new Shear();
                }
                load(json) {
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
            };
            exports_1("Xfc", Xfc);
            Ptc = class Ptc extends Constraint {
                constructor() {
                    super(...arguments);
                    this.bone_keys = [];
                    this.target_key = "";
                    this.spacing_mode = "length"; // "length", "fixed", "percent"
                    this.spacing = 0;
                    this.position_mode = "percent"; // "fixed", "percent"
                    this.position_mix = 1;
                    this.position = 0;
                    this.rotation_mode = "tangent"; // "tangent", "chain", "chainscale"
                    this.rotation_mix = 1;
                    this.rotation = new Rotation();
                }
                load(json) {
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
            };
            exports_1("Ptc", Ptc);
            Slot = class Slot {
                constructor() {
                    this.bone_key = "";
                    this.color = new Color();
                    this.attachment_key = "";
                    this.blend = "normal";
                }
                copy(other) {
                    this.bone_key = other.bone_key;
                    this.color.copy(other.color);
                    this.attachment_key = other.attachment_key;
                    this.blend = other.blend;
                    return this;
                }
                load(json) {
                    this.bone_key = loadString(json, "bone", "");
                    this.color.load(json.color);
                    this.attachment_key = loadString(json, "attachment", "");
                    this.blend = loadString(json, "blend", "normal");
                    return this;
                }
            };
            exports_1("Slot", Slot);
            Attachment = class Attachment {
                constructor(type) {
                    this.type = "";
                    this.name = "";
                    this.type = type;
                }
                load(json) {
                    const type = loadString(json, "type", "region");
                    if (type !== this.type) {
                        throw new Error();
                    }
                    this.name = loadString(json, "name", "");
                    return this;
                }
            };
            exports_1("Attachment", Attachment);
            RegionAttachment = class RegionAttachment extends Attachment {
                constructor() {
                    super("region");
                    this.path = "";
                    this.color = new Color();
                    this.local_space = new Space();
                    this.width = 0;
                    this.height = 0;
                }
                load(json) {
                    super.load(json);
                    this.path = loadString(json, "path", "");
                    this.color.load(json.color);
                    this.local_space.load(json);
                    this.width = loadFloat(json, "width", 0);
                    this.height = loadFloat(json, "height", 0);
                    return this;
                }
            };
            exports_1("RegionAttachment", RegionAttachment);
            BoundingBoxAttachment = class BoundingBoxAttachment extends Attachment {
                constructor() {
                    super("boundingbox");
                    this.color = new Color();
                    this.vertex_count = 0;
                    this.vertices = [];
                }
                load(json) {
                    super.load(json);
                    this.color.load(json.color, 0x60f000ff);
                    this.vertex_count = loadInt(json, "vertexCount", 0);
                    /// The x/y pairs that make up the vertices of the polygon.
                    this.vertices = json.vertices;
                    return this;
                }
            };
            exports_1("BoundingBoxAttachment", BoundingBoxAttachment);
            MeshAttachment = class MeshAttachment extends Attachment {
                constructor() {
                    super("mesh");
                    this.path = "";
                    this.color = new Color();
                    this.triangles = [];
                    this.edges = [];
                    this.vertices = [];
                    this.uvs = [];
                    this.hull = 0;
                }
                load(json) {
                    super.load(json);
                    this.path = loadString(json, "path", "");
                    this.color.load(json.color);
                    this.triangles = json.triangles || [];
                    this.edges = json.edges || [];
                    this.vertices = json.vertices || [];
                    this.uvs = json.uvs || [];
                    this.hull = loadInt(json, "hull", 0);
                    return this;
                }
            };
            exports_1("MeshAttachment", MeshAttachment);
            LinkedMeshAttachment = class LinkedMeshAttachment extends Attachment {
                constructor() {
                    super("linkedmesh");
                    this.color = new Color();
                    this.skin_key = "";
                    this.parent_key = "";
                    this.inherit_deform = true;
                    this.width = 0;
                    this.height = 0;
                }
                load(json) {
                    super.load(json);
                    this.color.load(json.color);
                    this.skin_key = loadString(json, "skin", "");
                    this.parent_key = loadString(json, "parent", "");
                    this.inherit_deform = loadBool(json, "deform", true);
                    this.width = loadInt(json, "width", 0);
                    this.height = loadInt(json, "height", 0);
                    return this;
                }
            };
            exports_1("LinkedMeshAttachment", LinkedMeshAttachment);
            WeightedMeshAttachment = class WeightedMeshAttachment extends Attachment {
                constructor() {
                    super("weightedmesh");
                    this.path = "";
                    this.color = new Color();
                    this.triangles = [];
                    this.edges = [];
                    this.vertices = [];
                    this.uvs = [];
                    this.hull = 0;
                }
                load(json) {
                    super.load(json);
                    this.path = loadString(json, "path", "");
                    this.color.load(json.color);
                    this.triangles = json.triangles || [];
                    this.edges = json.edges || [];
                    this.vertices = json.vertices || [];
                    this.uvs = json.uvs || [];
                    this.hull = loadInt(json, "hull", 0);
                    return this;
                }
            };
            exports_1("WeightedMeshAttachment", WeightedMeshAttachment);
            PathAttachment = class PathAttachment extends Attachment {
                constructor() {
                    super("path");
                    this.color = new Color();
                    this.closed = false;
                    this.accurate = true;
                    this.lengths = [];
                    this.vertex_count = 0;
                    this.vertices = [];
                }
                load(json) {
                    super.load(json);
                    this.color.load(json.color, 0xff7f00ff);
                    this.closed = loadBool(json, "closed", false);
                    this.accurate = loadBool(json, "constantSpeed", true);
                    this.lengths = json.lengths || [];
                    this.vertex_count = loadInt(json, "vertexCount", 0);
                    this.vertices = json.vertices || [];
                    return this;
                }
            };
            exports_1("PathAttachment", PathAttachment);
            ClippingAttachment = class ClippingAttachment extends Attachment {
                constructor() {
                    super("clipping");
                    this.color = new Color();
                    this.end = "";
                    this.vertex_count = 0;
                    this.vertices = [];
                }
                load(json) {
                    super.load(json);
                    this.color.load(json.color, 0xff7f00ff);
                    this.end = loadString(json, "end", "");
                    this.vertex_count = loadInt(json, "vertexCount", 0);
                    this.vertices = json.vertices || [];
                    return this;
                }
            };
            exports_1("ClippingAttachment", ClippingAttachment);
            SkinSlot = class SkinSlot {
                constructor() {
                    this.attachments = new SpineMap();
                }
                load(json) {
                    this.attachments.clear();
                    Object.keys(json || {}).forEach((key) => {
                        switch (json[key].type) {
                            default:
                            case "region":
                                this.attachments.set(key, new RegionAttachment().load(json[key]));
                                break;
                            case "boundingbox":
                                this.attachments.set(key, new BoundingBoxAttachment().load(json[key]));
                                break;
                            case "mesh":
                                if (json[key].vertices.length === json[key].uvs.length) {
                                    this.attachments.set(key, new MeshAttachment().load(json[key]));
                                }
                                else {
                                    json[key].type = "weightedmesh";
                                    this.attachments.set(key, new WeightedMeshAttachment().load(json[key]));
                                }
                                break;
                            case "linkedmesh":
                                this.attachments.set(key, new LinkedMeshAttachment().load(json[key]));
                                break;
                            case "skinnedmesh":
                                json[key].type = "weightedmesh";
                            case "weightedmesh":
                                this.attachments.set(key, new WeightedMeshAttachment().load(json[key]));
                                break;
                            case "path":
                                this.attachments.set(key, new PathAttachment().load(json[key]));
                                break;
                            case "clipping":
                                this.attachments.set(key, new ClippingAttachment().load(json[key]));
                                break;
                        }
                    });
                    return this;
                }
            };
            exports_1("SkinSlot", SkinSlot);
            Skin = class Skin {
                constructor() {
                    this.name = "";
                    this.slots = new SpineMap();
                }
                load(json) {
                    this.name = loadString(json, "name", "");
                    Object.keys(json || {}).forEach((key) => {
                        this.slots.set(key, new SkinSlot().load(json[key]));
                    });
                    return this;
                }
                iterateAttachments(callback) {
                    this.forEachAttachment((attachment, attachment_key, skin_slot, slot_key) => {
                        callback(slot_key, skin_slot, (attachment && attachment.name) || attachment_key, attachment);
                    });
                }
                forEachAttachment(callback) {
                    this.slots.forEach((skin_slot, slot_key) => {
                        skin_slot.attachments.forEach((attachment, attachment_key) => {
                            callback(attachment, (attachment && attachment.name) || attachment_key, skin_slot, slot_key);
                        });
                    });
                }
                mapAttachments(callback) {
                    const array = [];
                    this.slots.forEach((skin_slot, slot_key) => {
                        skin_slot.attachments.forEach((attachment, attachment_key) => {
                            array.push(callback(attachment, (attachment && attachment.name) || attachment_key, skin_slot, slot_key));
                        });
                    });
                    return array;
                }
            };
            exports_1("Skin", Skin);
            Event = class Event {
                constructor() {
                    this.int_value = 0;
                    this.float_value = 0;
                    this.string_value = "";
                }
                copy(other) {
                    this.int_value = other.int_value;
                    this.float_value = other.float_value;
                    this.string_value = other.string_value;
                    return this;
                }
                load(json) {
                    if (typeof (json["int"]) === "number") {
                        this.int_value = loadInt(json, "int", 0);
                    }
                    if (typeof (json["float"]) === "number") {
                        this.float_value = loadFloat(json, "float", 0);
                    }
                    if (typeof (json["string"]) === "string") {
                        this.string_value = loadString(json, "string", "");
                    }
                    return this;
                }
            };
            exports_1("Event", Event);
            Range = class Range {
                constructor() {
                    this.min = 0;
                    this.max = 0;
                }
                get length() { return this.max - this.min; }
                reset() {
                    this.min = 0;
                    this.max = 0;
                    return this;
                }
                wrap(value) {
                    return wrap(value, this.min, this.max);
                }
                expandPoint(value) {
                    this.min = Math.min(this.min, value);
                    this.max = Math.max(this.max, value);
                    return value;
                }
                expandRange(range) {
                    this.min = Math.min(this.min, range.min);
                    this.max = Math.max(this.max, range.max);
                    return range;
                }
            };
            exports_1("Range", Range);
            Keyframe = class Keyframe {
                constructor() {
                    this.time = 0;
                }
                free() {
                    this.time = 0;
                }
                load(json) {
                    this.time = 1000 * loadFloat(json, "time", 0); // convert to ms
                    return this;
                }
                save(json) {
                    saveFloat(json, "time", this.time / 1000, 0); // convert to s
                    return this;
                }
                static find(array, time) {
                    if (!array)
                        return -1;
                    if (array.length <= 0)
                        return -1;
                    if (time < array[0].time)
                        return -1;
                    const last = array.length - 1;
                    if (time >= array[last].time)
                        return last;
                    let lo = 0;
                    let hi = last;
                    if (hi === 0)
                        return 0;
                    let current = hi >> 1;
                    while (true) {
                        if (array[current + 1].time <= time) {
                            lo = current + 1;
                        }
                        else {
                            hi = current;
                        }
                        if (lo === hi)
                            return lo;
                        current = (lo + hi) >> 1;
                    }
                }
                static compare(a, b) {
                    return a.time - b.time;
                }
                static interpolate(keyframe0, keyframe1, time) {
                    return (!keyframe0 || !keyframe1 || keyframe0.time === keyframe1.time) ? 0 : (time - keyframe0.time) / (keyframe1.time - keyframe0.time);
                }
                static evaluate(keyframes, time, callback) {
                    const keyframe0_index = Keyframe.find(keyframes, time);
                    if (keyframe0_index !== -1) {
                        const keyframe1_index = keyframe0_index + 1;
                        const keyframe0 = keyframes[keyframe0_index];
                        const keyframe1 = keyframes[keyframe1_index] || keyframe0;
                        const k = Keyframe.interpolate(keyframe0, keyframe1, time);
                        callback(keyframe0, keyframe1, k, keyframe0_index, keyframe1_index);
                    }
                }
            };
            exports_1("Keyframe", Keyframe);
            Timeline = class Timeline {
                constructor() {
                    this.range = new Range();
                    this.keyframes = [];
                }
                load(json, ctor) {
                    this.range.reset();
                    this.keyframes.length = 0;
                    json.forEach((keyframe_json, index) => {
                        this.range.expandPoint((this.keyframes[index] = new ctor().load(keyframe_json)).time);
                    });
                    this.keyframes.sort(Keyframe.compare);
                    return this;
                }
                static evaluate(timeline, time, callback) {
                    timeline && Keyframe.evaluate(timeline.keyframes, time, callback);
                }
            };
            exports_1("Timeline", Timeline);
            CurveKeyframe = class CurveKeyframe extends Keyframe {
                constructor() {
                    super(...arguments);
                    this.curve = new Curve();
                }
                load(json) {
                    super.load(json);
                    this.curve.load(json.curve);
                    return this;
                }
                static interpolate(curve_keyframe0, curve_keyframe1, time) {
                    return curve_keyframe0 && curve_keyframe0.curve.evaluate(Keyframe.interpolate(curve_keyframe0, curve_keyframe1, time)) || 0;
                }
            };
            exports_1("CurveKeyframe", CurveKeyframe);
            BonePositionKeyframe = class BonePositionKeyframe extends CurveKeyframe {
                constructor() {
                    super(...arguments);
                    this.position = new Position();
                }
                load(json) {
                    super.load(json);
                    this.position.x = loadFloat(json, "x", 0);
                    this.position.y = loadFloat(json, "y", 0);
                    return this;
                }
            };
            exports_1("BonePositionKeyframe", BonePositionKeyframe);
            BonePositionTimeline = class BonePositionTimeline extends Timeline {
                load(json) {
                    return super.load(json, BonePositionKeyframe);
                }
            };
            exports_1("BonePositionTimeline", BonePositionTimeline);
            BoneRotationKeyframe = class BoneRotationKeyframe extends CurveKeyframe {
                constructor() {
                    super(...arguments);
                    this.rotation = new Rotation();
                }
                load(json) {
                    super.load(json);
                    this.rotation.deg = loadFloat(json, "angle", 0);
                    return this;
                }
            };
            exports_1("BoneRotationKeyframe", BoneRotationKeyframe);
            BoneRotationTimeline = class BoneRotationTimeline extends Timeline {
                load(json) {
                    return super.load(json, BoneRotationKeyframe);
                }
            };
            exports_1("BoneRotationTimeline", BoneRotationTimeline);
            BoneScaleKeyframe = class BoneScaleKeyframe extends CurveKeyframe {
                constructor() {
                    super(...arguments);
                    this.scale = new Scale();
                }
                load(json) {
                    super.load(json);
                    this.scale.x = loadFloat(json, "x", 1);
                    this.scale.y = loadFloat(json, "y", 1);
                    return this;
                }
            };
            exports_1("BoneScaleKeyframe", BoneScaleKeyframe);
            BoneScaleTimeline = class BoneScaleTimeline extends Timeline {
                load(json) {
                    return super.load(json, BoneScaleKeyframe);
                }
            };
            exports_1("BoneScaleTimeline", BoneScaleTimeline);
            BoneShearKeyframe = class BoneShearKeyframe extends CurveKeyframe {
                constructor() {
                    super(...arguments);
                    this.shear = new Shear();
                }
                load(json) {
                    super.load(json);
                    this.shear.x.deg = loadFloat(json, "x", 0);
                    this.shear.y.deg = loadFloat(json, "y", 0);
                    return this;
                }
            };
            exports_1("BoneShearKeyframe", BoneShearKeyframe);
            BoneShearTimeline = class BoneShearTimeline extends Timeline {
                load(json) {
                    return super.load(json, BoneShearKeyframe);
                }
            };
            exports_1("BoneShearTimeline", BoneShearTimeline);
            BoneTimeline = class BoneTimeline {
                constructor() {
                    this.range = new Range();
                }
                load(json) {
                    this.range.reset();
                    delete this.position_timeline;
                    delete this.rotation_timeline;
                    delete this.scale_timeline;
                    delete this.shear_timeline;
                    json.translate && this.range.expandRange((this.position_timeline = new BonePositionTimeline().load(json.translate)).range);
                    json.rotate && this.range.expandRange((this.rotation_timeline = new BoneRotationTimeline().load(json.rotate)).range);
                    json.scale && this.range.expandRange((this.scale_timeline = new BoneScaleTimeline().load(json.scale)).range);
                    json.shear && this.range.expandRange((this.shear_timeline = new BoneShearTimeline().load(json.shear)).range);
                    return this;
                }
            };
            exports_1("BoneTimeline", BoneTimeline);
            SlotColorKeyframe = class SlotColorKeyframe extends CurveKeyframe {
                constructor() {
                    super(...arguments);
                    this.color = new Color();
                }
                load(json) {
                    super.load(json);
                    this.color.load(json.color);
                    return this;
                }
            };
            exports_1("SlotColorKeyframe", SlotColorKeyframe);
            SlotColorTimeline = class SlotColorTimeline extends Timeline {
                load(json) {
                    return super.load(json, SlotColorKeyframe);
                }
            };
            exports_1("SlotColorTimeline", SlotColorTimeline);
            SlotAttachmentKeyframe = class SlotAttachmentKeyframe extends Keyframe {
                constructor() {
                    super(...arguments);
                    this.name = "";
                }
                load(json) {
                    super.load(json);
                    this.name = loadString(json, "name", "");
                    return this;
                }
            };
            exports_1("SlotAttachmentKeyframe", SlotAttachmentKeyframe);
            SlotAttachmentTimeline = class SlotAttachmentTimeline extends Timeline {
                load(json) {
                    return super.load(json, SlotAttachmentKeyframe);
                }
            };
            exports_1("SlotAttachmentTimeline", SlotAttachmentTimeline);
            SlotTimeline = class SlotTimeline {
                constructor() {
                    this.range = new Range();
                }
                load(json) {
                    this.range.reset();
                    delete this.color_timeline;
                    delete this.attachment_timeline;
                    json.color && this.range.expandRange((this.color_timeline = new SlotColorTimeline().load(json.color)).range);
                    json.attachment && this.range.expandRange((this.attachment_timeline = new SlotAttachmentTimeline().load(json.attachment)).range);
                    return this;
                }
            };
            exports_1("SlotTimeline", SlotTimeline);
            EventKeyframe = class EventKeyframe extends Keyframe {
                constructor() {
                    super(...arguments);
                    this.name = "";
                    this.event = new Event();
                }
                load(json) {
                    super.load(json);
                    this.name = loadString(json, "name", "");
                    this.event.load(json);
                    return this;
                }
            };
            exports_1("EventKeyframe", EventKeyframe);
            EventTimeline = class EventTimeline extends Timeline {
                load(json) {
                    return super.load(json, EventKeyframe);
                }
            };
            exports_1("EventTimeline", EventTimeline);
            SlotOffset = class SlotOffset {
                constructor() {
                    this.slot_key = "";
                    this.offset = 0;
                }
                load(json) {
                    this.slot_key = loadString(json, "slot", "");
                    this.offset = loadInt(json, "offset", 0);
                    return this;
                }
            };
            exports_1("SlotOffset", SlotOffset);
            OrderKeyframe = class OrderKeyframe extends Keyframe {
                constructor() {
                    super(...arguments);
                    this.slot_offsets = [];
                }
                load(json) {
                    super.load(json);
                    this.slot_offsets.length = 0;
                    json.offsets && json.offsets.forEach((offset_json) => {
                        this.slot_offsets.push(new SlotOffset().load(offset_json));
                    });
                    return this;
                }
            };
            exports_1("OrderKeyframe", OrderKeyframe);
            OrderTimeline = class OrderTimeline extends Timeline {
                load(json) {
                    return super.load(json, OrderKeyframe);
                }
            };
            exports_1("OrderTimeline", OrderTimeline);
            IkcKeyframe = class IkcKeyframe extends CurveKeyframe {
                constructor() {
                    super(...arguments);
                    this.mix = 1;
                    this.bend_positive = true;
                }
                load(json) {
                    super.load(json);
                    this.mix = loadFloat(json, "mix", 1);
                    this.bend_positive = loadBool(json, "bendPositive", true);
                    return this;
                }
            };
            exports_1("IkcKeyframe", IkcKeyframe);
            IkcTimeline = class IkcTimeline extends Timeline {
                load(json) {
                    return super.load(json, IkcKeyframe);
                }
            };
            exports_1("IkcTimeline", IkcTimeline);
            XfcKeyframe = class XfcKeyframe extends CurveKeyframe {
                constructor() {
                    super(...arguments);
                    this.position_mix = 1;
                    this.rotation_mix = 1;
                    this.scale_mix = 1;
                    this.shear_mix = 1;
                }
                load(json) {
                    super.load(json);
                    this.position_mix = loadFloat(json, "translateMix", 1);
                    this.rotation_mix = loadFloat(json, "rotateMix", 1);
                    this.scale_mix = loadFloat(json, "scaleMix", 1);
                    this.shear_mix = loadFloat(json, "shearMix", 1);
                    return this;
                }
            };
            exports_1("XfcKeyframe", XfcKeyframe);
            XfcTimeline = class XfcTimeline extends Timeline {
                load(json) {
                    return super.load(json, XfcKeyframe);
                }
            };
            exports_1("XfcTimeline", XfcTimeline);
            PtcMixKeyframe = class PtcMixKeyframe extends CurveKeyframe {
                constructor() {
                    super(...arguments);
                    this.position_mix = 0;
                    this.rotation_mix = 0;
                }
                load(json) {
                    super.load(json);
                    this.position_mix = loadFloat(json, "translateMix", 1);
                    this.rotation_mix = loadFloat(json, "rotateMix", 1);
                    return this;
                }
            };
            exports_1("PtcMixKeyframe", PtcMixKeyframe);
            PtcMixTimeline = class PtcMixTimeline extends Timeline {
                load(json) {
                    return super.load(json, PtcMixKeyframe);
                }
            };
            exports_1("PtcMixTimeline", PtcMixTimeline);
            PtcSpacingKeyframe = class PtcSpacingKeyframe extends CurveKeyframe {
                constructor() {
                    super(...arguments);
                    this.spacing = 0;
                }
                load(json) {
                    super.load(json);
                    this.spacing = loadFloat(json, "spacing", 0);
                    return this;
                }
            };
            exports_1("PtcSpacingKeyframe", PtcSpacingKeyframe);
            PtcSpacingTimeline = class PtcSpacingTimeline extends Timeline {
                load(json) {
                    return super.load(json, PtcSpacingKeyframe);
                }
            };
            exports_1("PtcSpacingTimeline", PtcSpacingTimeline);
            PtcPositionKeyframe = class PtcPositionKeyframe extends CurveKeyframe {
                constructor() {
                    super(...arguments);
                    this.position = 0;
                }
                load(json) {
                    super.load(json);
                    this.position = loadFloat(json, "position", 0);
                    return this;
                }
            };
            exports_1("PtcPositionKeyframe", PtcPositionKeyframe);
            PtcPositionTimeline = class PtcPositionTimeline extends Timeline {
                load(json) {
                    return super.load(json, PtcPositionKeyframe);
                }
            };
            exports_1("PtcPositionTimeline", PtcPositionTimeline);
            PtcRotationKeyframe = class PtcRotationKeyframe extends CurveKeyframe {
                constructor() {
                    super(...arguments);
                    this.rotation = new Rotation();
                }
                load(json) {
                    super.load(json);
                    this.rotation.deg = loadFloat(json, "rotation", 0);
                    return this;
                }
            };
            exports_1("PtcRotationKeyframe", PtcRotationKeyframe);
            PtcRotationTimeline = class PtcRotationTimeline extends Timeline {
                load(json) {
                    return super.load(json, PtcRotationKeyframe);
                }
            };
            exports_1("PtcRotationTimeline", PtcRotationTimeline);
            PtcTimeline = class PtcTimeline {
                constructor() {
                    this.range = new Range();
                }
                load(json) {
                    this.range.reset();
                    delete this.ptc_mix_timeline;
                    delete this.ptc_spacing_timeline;
                    delete this.ptc_position_timeline;
                    delete this.ptc_rotation_timeline;
                    json.mix && this.range.expandRange((this.ptc_mix_timeline = new PtcMixTimeline().load(json.mix)).range);
                    json.spacing && this.range.expandRange((this.ptc_spacing_timeline = new PtcSpacingTimeline().load(json.spacing)).range);
                    json.position && this.range.expandRange((this.ptc_position_timeline = new PtcPositionTimeline().load(json.position)).range);
                    json.rotation && this.range.expandRange((this.ptc_rotation_timeline = new PtcRotationTimeline().load(json.rotation)).range);
                    return this;
                }
            };
            exports_1("PtcTimeline", PtcTimeline);
            FfdKeyframe = class FfdKeyframe extends CurveKeyframe {
                constructor() {
                    super(...arguments);
                    this.offset = 0;
                    this.vertices = [];
                }
                load(json) {
                    super.load(json);
                    this.offset = loadInt(json, "offset", 0);
                    this.vertices = json.vertices || [];
                    return this;
                }
            };
            exports_1("FfdKeyframe", FfdKeyframe);
            FfdTimeline = class FfdTimeline extends Timeline {
                load(json) {
                    return super.load(json, FfdKeyframe);
                }
            };
            exports_1("FfdTimeline", FfdTimeline);
            FfdAttachment = class FfdAttachment {
                constructor() {
                    this.ffd_timeline = new FfdTimeline();
                }
                load(json) {
                    this.ffd_timeline.load(json);
                    return this;
                }
            };
            exports_1("FfdAttachment", FfdAttachment);
            FfdSlot = class FfdSlot {
                constructor() {
                    this.ffd_attachments = new SpineMap();
                }
                load(json) {
                    this.ffd_attachments.clear();
                    Object.keys(json || {}).forEach((key) => {
                        this.ffd_attachments.set(key, new FfdAttachment().load(json[key]));
                    });
                    return this;
                }
                iterateAttachments(callback) {
                    this.forEachAttachment((ffd_attachment, ffd_attachment_key) => {
                        callback(ffd_attachment_key, ffd_attachment);
                    });
                }
                forEachAttachment(callback) {
                    this.ffd_attachments.forEach((ffd_attachment, ffd_attachment_key) => {
                        callback(ffd_attachment, ffd_attachment_key);
                    });
                }
            };
            exports_1("FfdSlot", FfdSlot);
            FfdSkin = class FfdSkin {
                constructor() {
                    this.ffd_slots = new SpineMap();
                }
                load(json) {
                    this.ffd_slots.clear();
                    Object.keys(json || {}).forEach((key) => {
                        this.ffd_slots.set(key, new FfdSlot().load(json[key]));
                    });
                    return this;
                }
                iterateAttachments(callback) {
                    this.forEachAttachment((ffd_attachment, ffd_attachment_key, ffd_slot, ffd_slot_key) => {
                        callback(ffd_slot_key, ffd_slot, ffd_attachment_key, ffd_attachment);
                    });
                }
                forEachAttachment(callback) {
                    this.ffd_slots.forEach((ffd_slot, ffd_slot_key) => {
                        ffd_slot.forEachAttachment((ffd_attachment, ffd_attachment_key) => {
                            callback(ffd_attachment, ffd_attachment_key, ffd_slot, ffd_slot_key);
                        });
                    });
                }
            };
            exports_1("FfdSkin", FfdSkin);
            Animation = class Animation {
                constructor() {
                    // public name: string = "";
                    this.range = new Range();
                    this.bone_timeline_map = new SpineMap();
                    this.slot_timeline_map = new SpineMap();
                    this.ikc_timeline_map = new SpineMap();
                    this.xfc_timeline_map = new SpineMap();
                    this.ptc_timeline_map = new SpineMap();
                    this.ffd_skins = new SpineMap();
                }
                load(json) {
                    this.range.reset();
                    this.bone_timeline_map.clear();
                    this.slot_timeline_map.clear();
                    delete this.event_timeline;
                    delete this.order_timeline;
                    this.ikc_timeline_map.clear();
                    this.xfc_timeline_map.clear();
                    this.ptc_timeline_map.clear();
                    this.ffd_skins.clear();
                    json.bones && Object.keys(json.bones).forEach((key) => {
                        this.range.expandRange(this.bone_timeline_map.set(key, new BoneTimeline().load(json.bones[key])).range);
                    });
                    json.slots && Object.keys(json.slots).forEach((key) => {
                        this.range.expandRange(this.slot_timeline_map.set(key, new SlotTimeline().load(json.slots[key])).range);
                    });
                    json.events && this.range.expandRange((this.event_timeline = new EventTimeline().load(json.events)).range);
                    json.draworder = json.draworder || json.drawOrder;
                    json.draworder && this.range.expandRange((this.order_timeline = new OrderTimeline().load(json.draworder)).range);
                    json.ik && Object.keys(json.ik).forEach((key) => {
                        this.range.expandRange(this.ikc_timeline_map.set(key, new IkcTimeline().load(json.ik[key])).range);
                    });
                    json.transform && Object.keys(json.transform).forEach((key) => {
                        this.range.expandRange(this.xfc_timeline_map.set(key, new XfcTimeline().load(json.transform[key])).range);
                    });
                    json.paths && Object.keys(json.paths).forEach((key) => {
                        this.range.expandRange(this.ptc_timeline_map.set(key, new PtcTimeline().load(json.paths[key])).range);
                    });
                    json.deform = json.deform || json.ffd;
                    json.deform && Object.keys(json.deform).forEach((key) => {
                        this.ffd_skins.set(key, new FfdSkin().load(json.deform[key]));
                    });
                    return this;
                }
            };
            exports_1("Animation", Animation);
            Skeleton = class Skeleton {
                constructor() {
                    this.hash = "";
                    this.spine = "";
                    this.width = 0;
                    this.height = 0;
                    this.images = "";
                }
                load(json) {
                    this.hash = loadString(json, "hash", "");
                    this.spine = loadString(json, "spine", "");
                    this.width = loadInt(json, "width", 0);
                    this.height = loadInt(json, "height", 0);
                    this.images = loadString(json, "images", "");
                    return this;
                }
            };
            exports_1("Skeleton", Skeleton);
            Data = class Data {
                constructor() {
                    this.name = "";
                    this.skeleton = new Skeleton();
                    this.bones = new SpineMap();
                    this.ikcs = new SpineMap();
                    this.xfcs = new SpineMap();
                    this.ptcs = new SpineMap();
                    this.slots = new SpineMap();
                    this.skins = new SpineMap();
                    this.events = new SpineMap();
                    this.anims = new SpineMap();
                }
                free() {
                    this.bones.clear();
                    this.ikcs.clear();
                    this.xfcs.clear();
                    this.ptcs.clear();
                    this.slots.clear();
                    this.skins.clear();
                    this.events.clear();
                    this.anims.clear();
                }
                load(json) {
                    this.bones.clear();
                    this.ikcs.clear();
                    this.xfcs.clear();
                    this.ptcs.clear();
                    this.slots.clear();
                    this.skins.clear();
                    this.events.clear();
                    this.anims.clear();
                    json.skeleton && this.skeleton.load(json.skeleton);
                    json.bones && json.bones.forEach((bone_json) => {
                        this.bones.set(bone_json.name, new Bone().load(bone_json));
                    });
                    json.ik && json.ik.forEach((ikc_json) => {
                        this.ikcs.set(ikc_json.name, new Ikc().load(ikc_json));
                    });
                    // sort by order
                    this.ikcs.sortKeys((a, b) => {
                        const ikc_a = this.ikcs.get(a);
                        const ikc_b = this.ikcs.get(b);
                        return (ikc_a && ikc_a.order || 0) - (ikc_b && ikc_b.order || 0);
                    });
                    json.transform && json.transform.forEach((xfc_json) => {
                        this.xfcs.set(xfc_json.name, new Xfc().load(xfc_json));
                    });
                    // sort by order
                    this.xfcs.sortKeys((a, b) => {
                        const xfc_a = this.xfcs.get(a);
                        const xfc_b = this.xfcs.get(b);
                        return (xfc_a && xfc_a.order || 0) - (xfc_b && xfc_b.order || 0);
                    });
                    json.path && json.path.forEach((ptc_json) => {
                        this.ptcs.set(ptc_json.name, new Ptc().load(ptc_json));
                    });
                    // sort by order
                    this.ptcs.sortKeys((a, b) => {
                        const ptc_a = this.ptcs.get(a);
                        const ptc_b = this.ptcs.get(b);
                        return (ptc_a && ptc_a.order || 0) - (ptc_b && ptc_b.order || 0);
                    });
                    json.slots && json.slots.forEach((slot_json) => {
                        this.slots.set(slot_json.name, new Slot().load(slot_json));
                    });
                    json.skins && Object.keys(json.skins).forEach((key) => {
                        const skin = this.skins.set(key, new Skin().load(json.skins[key]));
                        skin.name = skin.name || key;
                    });
                    json.events && Object.keys(json.events).forEach((key) => {
                        this.events.set(key, new Event().load(json.events[key]));
                    });
                    json.animations && Object.keys(json.animations).forEach((key) => {
                        this.anims.set(key, new Animation().load(json.animations[key]));
                    });
                    this.iterateBones((bone_key, bone) => {
                        Bone.flatten(bone, this.bones);
                    });
                    return this;
                }
                save(json = {}) {
                    // TODO
                    return json;
                }
                loadSkeleton(json) {
                    this.skeleton.load(json);
                    return this;
                }
                loadEvent(name, json) {
                    this.events.set(name, new Event().load(json));
                    return this;
                }
                loadAnimation(name, json) {
                    this.anims.set(name, new Animation().load(json));
                    return this;
                }
                getSkins() {
                    return this.skins;
                }
                getEvents() {
                    return this.events;
                }
                getAnims() {
                    return this.anims;
                }
                iterateBones(callback) {
                    this.forEachBone((bone, bone_key) => {
                        callback(bone_key, bone);
                    });
                }
                forEachBone(callback) {
                    this.bones.forEach(callback);
                }
                iterateAttachments(skin_key, callback) {
                    this.forEachAttachment(skin_key, (attachment, attachment_key, slot, slot_key, skin_slot) => {
                        callback(slot_key, slot, skin_slot, attachment_key, attachment);
                    });
                }
                forEachAttachment(skin_key, callback) {
                    const skin = this.skins.get(skin_key);
                    const default_skin = this.skins.get("default");
                    this.slots.forEach((slot, slot_key) => {
                        const skin_slot = (skin && skin.slots.get(slot_key)) || (default_skin && default_skin.slots.get(slot_key));
                        let attachment = skin_slot && skin_slot.attachments.get(slot.attachment_key);
                        let attachment_key = (attachment && attachment.name) || slot.attachment_key;
                        if (attachment && (attachment.type === "linkedmesh")) {
                            attachment_key = attachment.parent_key;
                            attachment = skin_slot && skin_slot.attachments.get(attachment_key);
                        }
                        if (attachment && skin_slot) {
                            callback(attachment, attachment_key, slot, slot_key, skin_slot);
                        }
                    });
                }
                iterateSkins(callback) {
                    this.forEachSkin((skin, skin_key) => {
                        callback(skin_key, skin);
                    });
                }
                forEachSkin(callback) {
                    this.skins.forEach(callback);
                }
                mapSkins(callback) {
                    return this.skins.map(callback);
                }
                iterateEvents(callback) {
                    this.forEachEvent((event, event_key) => {
                        callback(event_key, event);
                    });
                }
                forEachEvent(callback) {
                    this.events.forEach(callback);
                }
                mapEvents(callback) {
                    return this.events.map(callback);
                }
                iterateAnims(callback) {
                    this.forEachAnim((anim, anim_key) => {
                        callback(anim_key, anim);
                    });
                }
                forEachAnim(callback) {
                    this.anims.forEach(callback);
                }
                mapAnims(callback) {
                    return this.anims.map(callback);
                }
            };
            exports_1("Data", Data);
            Pose = class Pose {
                constructor(data) {
                    this.skin_key = "";
                    this.anim_key = "";
                    this.time = 0;
                    this.prev_time = 0;
                    this.elapsed_time = 0;
                    this.wrapped_min = false;
                    this.wrapped_max = false;
                    this.dirty = true;
                    this.bones = new SpineMap();
                    this.slots = new SpineMap();
                    this.events = new SpineMap();
                    this.data = data;
                }
                free() {
                    this.bones.clear();
                    this.slots.clear();
                    this.events.clear();
                }
                curSkel() {
                    return this.data.skeleton;
                }
                getSkins() {
                    return this.data.skins;
                }
                curSkin() {
                    return this.data.skins.get(this.skin_key);
                }
                getSkin() {
                    return this.skin_key;
                }
                setSkin(skin_key) {
                    if (this.skin_key !== skin_key) {
                        this.skin_key = skin_key;
                    }
                    return this;
                }
                getAnims() {
                    return this.data.anims;
                }
                curAnim() {
                    return this.data.anims.get(this.anim_key);
                }
                curAnimLength() {
                    const anim = this.data.anims.get(this.anim_key);
                    return (anim && anim.range.length) || 0;
                }
                getAnim() {
                    return this.anim_key;
                }
                setAnim(anim_key) {
                    if (this.anim_key !== anim_key) {
                        this.anim_key = anim_key;
                        const anim = this.data.anims.get(this.anim_key);
                        if (anim) {
                            this.time = anim.range.wrap(this.time);
                        }
                        this.prev_time = this.time;
                        this.elapsed_time = 0;
                        this.dirty = true;
                    }
                    return this;
                }
                getTime() {
                    return this.time;
                }
                setTime(time) {
                    const anim = this.data.anims.get(this.anim_key);
                    if (anim) {
                        time = anim.range.wrap(time);
                    }
                    if (this.time !== time) {
                        this.time = time;
                        this.prev_time = this.time;
                        this.elapsed_time = 0;
                        this.dirty = true;
                    }
                    return this;
                }
                update(elapsed_time) {
                    this.elapsed_time += elapsed_time;
                    this.dirty = true;
                }
                strike() {
                    if (!this.dirty) {
                        return;
                    }
                    this.dirty = false;
                    this.prev_time = this.time; // save previous time
                    this.time += this.elapsed_time; // accumulate elapsed time
                    const anim = this.data.anims.get(this.anim_key);
                    this.wrapped_min = false;
                    this.wrapped_max = false;
                    if (anim) {
                        this.wrapped_min = (this.elapsed_time < 0) && (this.time <= anim.range.min);
                        this.wrapped_max = (this.elapsed_time > 0) && (this.time >= anim.range.max);
                        this.time = anim.range.wrap(this.time);
                    }
                    this._strikeBones(anim);
                    this._strikeIkcs(anim); // Inverse Kinematic Constraints
                    this._strikeXfcs(anim); // Transform Constraints
                    this._strikeSlots(anim);
                    this._strikePtcs(anim); // Path Constraints
                    this._strikeEvents(anim);
                    this.elapsed_time = 0; // reset elapsed time for next strike
                }
                _strikeBones(anim) {
                    this.data.bones.forEach((data_bone, bone_key) => {
                        const pose_bone = this.bones.get(bone_key) || this.bones.set(bone_key, new Bone());
                        // start with a copy of the data bone
                        pose_bone.copy(data_bone);
                        // tween anim bone if keyframes are available
                        const bone_timeline = anim && anim.bone_timeline_map.get(bone_key);
                        if (bone_timeline) {
                            if (bone_timeline.position_timeline) {
                                Timeline.evaluate(bone_timeline.position_timeline, this.time, (keyframe0, keyframe1, k) => {
                                    const pct = keyframe0.curve.evaluate(k);
                                    pose_bone.local_space.position.x += tween(keyframe0.position.x, keyframe1.position.x, pct);
                                    pose_bone.local_space.position.y += tween(keyframe0.position.y, keyframe1.position.y, pct);
                                });
                            }
                            if (bone_timeline.rotation_timeline) {
                                Timeline.evaluate(bone_timeline.rotation_timeline, this.time, (keyframe0, keyframe1, k) => {
                                    const pct = keyframe0.curve.evaluate(k);
                                    pose_bone.local_space.rotation.rad += tweenAngleRadians(keyframe0.rotation.rad, keyframe1.rotation.rad, pct);
                                });
                            }
                            if (bone_timeline.scale_timeline) {
                                Timeline.evaluate(bone_timeline.scale_timeline, this.time, (keyframe0, keyframe1, k) => {
                                    const pct = keyframe0.curve.evaluate(k);
                                    pose_bone.local_space.scale.a *= tween(keyframe0.scale.a, keyframe1.scale.a, pct);
                                    pose_bone.local_space.scale.d *= tween(keyframe0.scale.d, keyframe1.scale.d, pct);
                                });
                            }
                            if (bone_timeline.shear_timeline) {
                                Timeline.evaluate(bone_timeline.shear_timeline, this.time, (keyframe0, keyframe1, k) => {
                                    const pct = keyframe0.curve.evaluate(k);
                                    pose_bone.local_space.shear.x.rad += tweenAngleRadians(keyframe0.shear.x.rad, keyframe1.shear.x.rad, pct);
                                    pose_bone.local_space.shear.y.rad += tweenAngleRadians(keyframe0.shear.y.rad, keyframe1.shear.y.rad, pct);
                                });
                            }
                        }
                    });
                    this.forEachBone((bone, bone_key) => {
                        Bone.flatten(bone, this.bones);
                    });
                }
                _strikeIkcs(anim) {
                    this.data.ikcs.forEach((ikc, ikc_key) => {
                        const ikc_target = this.bones.get(ikc.target_key);
                        if (!ikc_target)
                            return;
                        Bone.flatten(ikc_target, this.bones);
                        let ikc_mix = ikc.mix;
                        let ikc_bend_positive = ikc.bend_positive;
                        const ikc_timeline = anim && anim.ikc_timeline_map.get(ikc_key);
                        if (ikc_timeline) {
                            Timeline.evaluate(ikc_timeline, this.time, (keyframe0, keyframe1, k) => {
                                ikc_mix = tween(keyframe0.mix, keyframe1.mix, keyframe0.curve.evaluate(k));
                                // no tweening ik bend direction
                                ikc_bend_positive = keyframe0.bend_positive;
                            });
                        }
                        const alpha = ikc_mix;
                        const bendDir = (ikc_bend_positive) ? (1) : (-1);
                        if (alpha === 0) {
                            return;
                        }
                        switch (ikc.bone_keys.length) {
                            case 1: {
                                const bone = this.bones.get(ikc.bone_keys[0]);
                                if (!bone)
                                    return;
                                Bone.flatten(bone, this.bones);
                                let a1 = Math.atan2(ikc_target.world_space.position.y - bone.world_space.position.y, ikc_target.world_space.position.x - bone.world_space.position.x);
                                const bone_parent = this.bones.get(bone.parent_key);
                                if (bone_parent) {
                                    Bone.flatten(bone_parent, this.bones);
                                    if (Matrix.determinant(bone_parent.world_space.scale) < 0) {
                                        a1 += bone_parent.world_space.rotation.rad;
                                    }
                                    else {
                                        a1 -= bone_parent.world_space.rotation.rad;
                                    }
                                }
                                bone.local_space.rotation.rad = tweenAngleRadians(bone.local_space.rotation.rad, a1, alpha);
                                break;
                            }
                            case 2: {
                                const parent = this.bones.get(ikc.bone_keys[0]);
                                if (!parent)
                                    return;
                                Bone.flatten(parent, this.bones);
                                const child = this.bones.get(ikc.bone_keys[1]);
                                if (!child)
                                    return;
                                Bone.flatten(child, this.bones);
                                // const px: number = parent.local_space.position.x;
                                // const py: number = parent.local_space.position.y;
                                let psx = parent.local_space.scale.x;
                                let psy = parent.local_space.scale.y;
                                let cy = child.local_space.position.y;
                                let csx = child.local_space.scale.x;
                                let offset1 = 0, offset2 = 0, sign2 = 1;
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
                                const t = Vector.copy(ikc_target.world_space.position, new Vector());
                                const d = Vector.copy(child.world_space.position, new Vector());
                                const pp = this.bones.get(parent.parent_key);
                                if (pp) {
                                    Bone.flatten(pp, this.bones);
                                    Space.untransform(pp.world_space, t, t);
                                    Space.untransform(pp.world_space, d, d);
                                }
                                Vector.subtract(t, parent.local_space.position, t);
                                Vector.subtract(d, parent.local_space.position, d);
                                const tx = t.x, ty = t.y;
                                const dx = d.x, dy = d.y;
                                let l1 = Math.sqrt(dx * dx + dy * dy), l2 = child.length * csx, a1, a2;
                                outer: if (Math.abs(psx - psy) <= 0.0001) {
                                    l2 *= psx;
                                    let cos = (tx * tx + ty * ty - l1 * l1 - l2 * l2) / (2 * l1 * l2);
                                    if (cos < -1)
                                        cos = -1;
                                    else if (cos > 1)
                                        cos = 1; // clamp
                                    a2 = Math.acos(cos) * bendDir;
                                    const adj = l1 + l2 * cos;
                                    const opp = l2 * Math.sin(a2);
                                    a1 = Math.atan2(ty * adj - tx * opp, tx * adj + ty * opp);
                                }
                                else {
                                    cy = 0;
                                    const a = psx * l2;
                                    const b = psy * l2;
                                    const ta = Math.atan2(ty, tx);
                                    const aa = a * a;
                                    const bb = b * b;
                                    const ll = l1 * l1;
                                    const dd = tx * tx + ty * ty;
                                    const c0 = bb * ll + aa * dd - aa * bb;
                                    const c1 = -2 * bb * l1;
                                    const c2 = bb - aa;
                                    const _d = c1 * c1 - 4 * c2 * c0;
                                    if (_d >= 0) {
                                        let q = Math.sqrt(_d);
                                        if (c1 < 0)
                                            q = -q;
                                        q = -(c1 + q) / 2;
                                        const r0 = q / c2, r1 = c0 / q;
                                        const r = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
                                        if (r * r <= dd) {
                                            const y = Math.sqrt(dd - r * r) * bendDir;
                                            a1 = ta - Math.atan2(y, r);
                                            a2 = Math.atan2(y / psy, (r - l1) / psx);
                                            break outer;
                                        }
                                    }
                                    let minAngle = 0, minDist = Number.MAX_VALUE, minX = 0, minY = 0;
                                    let maxAngle = 0, maxDist = 0, maxX = 0, maxY = 0;
                                    let angle, dist, x, y;
                                    x = l1 + a;
                                    dist = x * x;
                                    if (dist > maxDist) {
                                        maxAngle = 0;
                                        maxDist = dist;
                                        maxX = x;
                                    }
                                    x = l1 - a;
                                    dist = x * x;
                                    if (dist < minDist) {
                                        minAngle = Math.PI;
                                        minDist = dist;
                                        minX = x;
                                    }
                                    angle = Math.acos(-a * l1 / (aa - bb));
                                    x = a * Math.cos(angle) + l1;
                                    y = b * Math.sin(angle);
                                    dist = x * x + y * y;
                                    if (dist < minDist) {
                                        minAngle = angle;
                                        minDist = dist;
                                        minX = x;
                                        minY = y;
                                    }
                                    if (dist > maxDist) {
                                        maxAngle = angle;
                                        maxDist = dist;
                                        maxX = x;
                                        maxY = y;
                                    }
                                    if (dd <= (minDist + maxDist) / 2) {
                                        a1 = ta - Math.atan2(minY * bendDir, minX);
                                        a2 = minAngle * bendDir;
                                    }
                                    else {
                                        a1 = ta - Math.atan2(maxY * bendDir, maxX);
                                        a2 = maxAngle * bendDir;
                                    }
                                }
                                const offset = Math.atan2(cy, child.local_space.position.x) * sign2;
                                a1 = (a1 - offset) + offset1;
                                a2 = (a2 + offset) * sign2 + offset2;
                                parent.local_space.rotation.rad = tweenAngleRadians(parent.local_space.rotation.rad, a1, alpha);
                                child.local_space.rotation.rad = tweenAngleRadians(child.local_space.rotation.rad, a2, alpha);
                                break;
                            }
                        }
                    });
                    this.forEachBone((bone, bone_key) => {
                        Bone.flatten(bone, this.bones);
                    });
                }
                _strikeXfcs(anim) {
                    this.data.xfcs.forEach((xfc, xfc_key) => {
                        const xfc_target = this.bones.get(xfc.target_key);
                        if (!xfc_target)
                            return;
                        let xfc_position_mix = xfc.position_mix;
                        let xfc_rotation_mix = xfc.rotation_mix;
                        let xfc_scale_mix = xfc.scale_mix;
                        let xfc_shear_mix = xfc.shear_mix;
                        const xfc_timeline = anim && anim.xfc_timeline_map.get(xfc_key);
                        if (xfc_timeline) {
                            Timeline.evaluate(xfc_timeline, this.time, (keyframe0, keyframe1, k) => {
                                const pct = keyframe0.curve.evaluate(k);
                                xfc_position_mix = tween(keyframe0.position_mix, keyframe1.position_mix, pct);
                                xfc_rotation_mix = tween(keyframe0.rotation_mix, keyframe1.rotation_mix, pct);
                                xfc_scale_mix = tween(keyframe0.scale_mix, keyframe1.scale_mix, pct);
                                xfc_shear_mix = tween(keyframe0.shear_mix, keyframe1.shear_mix, pct);
                            });
                        }
                        const xfc_position = xfc.position;
                        const xfc_rotation = xfc.rotation;
                        const xfc_scale = xfc.scale;
                        const xfc_shear = xfc.shear;
                        let ta = xfc_target.world_space.affine.matrix.a, tb = xfc_target.world_space.affine.matrix.b;
                        let tc = xfc_target.world_space.affine.matrix.c, td = xfc_target.world_space.affine.matrix.d;
                        // let degRadReflect = ta * td - tb * tc > 0 ? MathUtils.degRad : -MathUtils.degRad;
                        // let offsetRotation = this.data.offsetRotation * degRadReflect;
                        // let offsetShearY = this.data.offsetShearY * degRadReflect;
                        xfc.bone_keys.forEach((bone_key) => {
                            const xfc_bone = this.bones.get(bone_key);
                            if (!xfc_bone)
                                return;
                            if (xfc_position_mix !== 0) {
                                // let temp = this.temp;
                                // xfc_target.localToWorld(temp.set(xfc_position.x, xfc_position.y));
                                // xfc_bone.world_space.affine.vector.x += (temp.x - xfc_bone.world_space.affine.vector.x) * xfc_position_mix;
                                // xfc_bone.world_space.affine.vector.y += (temp.y - xfc_bone.world_space.affine.vector.y) * xfc_position_mix;
                                const xfc_world_position = Space.transform(xfc_target.world_space, xfc_position, new Vector());
                                xfc_bone.world_space.position.tween(xfc_world_position, xfc_position_mix, xfc_bone.world_space.position);
                            }
                            if (xfc_rotation_mix !== 0) {
                                let a = xfc_bone.world_space.affine.matrix.a; // , b = xfc_bone.world_space.affine.matrix.b;
                                let c = xfc_bone.world_space.affine.matrix.c; // , d = xfc_bone.world_space.affine.matrix.d;
                                let r = Math.atan2(tc, ta) - Math.atan2(c, a) + xfc_rotation.rad;
                                r = wrapAngleRadians(r);
                                r *= xfc_rotation_mix;
                                let cos = Math.cos(r), sin = Math.sin(r);
                                xfc_bone.world_space.affine.matrix.selfRotate(cos, sin);
                            }
                            if (xfc_scale_mix !== 0) {
                                let s = Math.sqrt(xfc_bone.world_space.affine.matrix.a * xfc_bone.world_space.affine.matrix.a + xfc_bone.world_space.affine.matrix.c * xfc_bone.world_space.affine.matrix.c);
                                let ts = Math.sqrt(ta * ta + tc * tc);
                                if (s > 0.00001)
                                    s = (s + (ts - s + xfc_scale.x) * xfc_scale_mix) / s;
                                xfc_bone.world_space.affine.matrix.a *= s;
                                xfc_bone.world_space.affine.matrix.c *= s;
                                s = Math.sqrt(xfc_bone.world_space.affine.matrix.b * xfc_bone.world_space.affine.matrix.b + xfc_bone.world_space.affine.matrix.d * xfc_bone.world_space.affine.matrix.d);
                                ts = Math.sqrt(tb * tb + td * td);
                                if (s > 0.00001)
                                    s = (s + (ts - s + xfc_scale.y) * xfc_scale_mix) / s;
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
                _strikeSlots(anim) {
                    this.data.slots.forEach((data_slot, slot_key) => {
                        const pose_slot = this.slots.get(slot_key) || this.slots.set(slot_key, new Slot());
                        // start with a copy of the data slot
                        pose_slot.copy(data_slot);
                        // tween anim slot if keyframes are available
                        const slot_timeline = anim && anim.slot_timeline_map.get(slot_key);
                        if (slot_timeline) {
                            if (slot_timeline.color_timeline) {
                                Timeline.evaluate(slot_timeline.color_timeline, this.time, (keyframe0, keyframe1, k) => {
                                    keyframe0.color.tween(keyframe1.color, keyframe0.curve.evaluate(k), pose_slot.color);
                                });
                            }
                            if (slot_timeline.attachment_timeline) {
                                Timeline.evaluate(slot_timeline.attachment_timeline, this.time, (keyframe0, keyframe1, k) => {
                                    // no tweening attachments
                                    pose_slot.attachment_key = keyframe0.name;
                                });
                            }
                        }
                    });
                    this.data.slots._keys.forEach((key, index) => { this.slots._keys[index] = key; });
                    const order_timeline = anim && anim.order_timeline;
                    if (order_timeline) {
                        Timeline.evaluate(order_timeline, this.time, (keyframe0, keyframe1, k) => {
                            keyframe0.slot_offsets.forEach((slot_offset) => {
                                const slot_index = this.slots._keys.indexOf(slot_offset.slot_key);
                                if (slot_index !== -1) {
                                    // delete old position
                                    this.slots._keys.splice(slot_index, 1);
                                    // insert new position
                                    this.slots._keys.splice(slot_index + slot_offset.offset, 0, slot_offset.slot_key);
                                }
                            });
                        });
                    }
                }
                _strikePtcs(anim) {
                    const skin = this.data.skins.get(this.skin_key);
                    const default_skin = this.data.skins.get("default");
                    this.data.ptcs.forEach((ptc, ptc_key) => {
                        const slot_key = ptc.target_key;
                        const slot = this.slots.get(slot_key);
                        const skin_slot = (skin && skin.slots.get(slot_key)) || (default_skin && default_skin.slots.get(slot_key));
                        const ptc_target = slot && skin_slot && skin_slot.attachments.get(slot.attachment_key);
                        if (!(ptc_target instanceof PathAttachment))
                            return;
                        const ptc_spacing_mode = ptc.spacing_mode;
                        let ptc_spacing = ptc.spacing;
                        const ptc_position_mode = ptc.position_mode;
                        let ptc_position_mix = ptc.position_mix;
                        let ptc_position = ptc.position;
                        const ptc_rotation_mode = ptc.rotation_mode;
                        let ptc_rotation_mix = ptc.rotation_mix;
                        const ptc_rotation = ptc.rotation;
                        const ptc_timeline = anim && anim.ptc_timeline_map.get(ptc_key);
                        if (ptc_timeline) {
                            if (ptc_timeline.ptc_mix_timeline) {
                                Timeline.evaluate(ptc_timeline.ptc_mix_timeline, this.time, (keyframe0, keyframe1, k) => {
                                    const pct = keyframe0.curve.evaluate(k);
                                    ptc_position_mix = tween(keyframe0.position_mix, keyframe1.position_mix, pct);
                                    ptc_rotation_mix = tween(keyframe0.rotation_mix, keyframe1.rotation_mix, pct);
                                });
                            }
                            if (ptc_timeline.ptc_spacing_timeline) {
                                Timeline.evaluate(ptc_timeline.ptc_spacing_timeline, this.time, (keyframe0, keyframe1, k) => {
                                    ptc_spacing = tween(keyframe0.spacing, keyframe1.spacing, keyframe0.curve.evaluate(k));
                                });
                            }
                            if (ptc_timeline.ptc_position_timeline) {
                                Timeline.evaluate(ptc_timeline.ptc_position_timeline, this.time, (keyframe0, keyframe1, k) => {
                                    ptc_position = tween(keyframe0.position, keyframe1.position, keyframe0.curve.evaluate(k));
                                });
                            }
                            if (ptc_timeline.ptc_rotation_timeline) {
                                Timeline.evaluate(ptc_timeline.ptc_rotation_timeline, this.time, (keyframe0, keyframe1, k) => {
                                    ptc_rotation.rad = tweenAngleRadians(keyframe0.rotation.rad, keyframe1.rotation.rad, keyframe0.curve.evaluate(k));
                                });
                            }
                        }
                        ptc.bone_keys.forEach((bone_key) => {
                            const ptc_bone = this.bones.get(bone_key);
                            if (!ptc_bone)
                                return;
                            // TODO: solve path constraint for ptc_bone (Bone) using ptc_target (PathAttachment)
                            switch (ptc_spacing_mode) {
                                case "length":
                                case "fixed":
                                case "percent":
                                    break;
                                default:
                                    ptc_spacing;
                            }
                            switch (ptc_position_mode) {
                                case "fixed":
                                case "percent":
                                    break;
                                default:
                                    ptc_position;
                                    ptc_position_mix;
                            }
                            switch (ptc_rotation_mode) {
                                case "tangent":
                                case "chain":
                                case "chainscale":
                                    break;
                                default:
                                    ptc_rotation;
                                    ptc_rotation_mix;
                            }
                        });
                    });
                }
                _strikeEvents(anim) {
                    this.events.clear();
                    if (anim && anim.event_timeline) {
                        const make_event = (event_keyframe) => {
                            const pose_event = new Event();
                            const data_event = this.data.events.get(event_keyframe.name);
                            if (data_event) {
                                pose_event.copy(data_event);
                            }
                            pose_event.int_value = event_keyframe.event.int_value || pose_event.int_value;
                            pose_event.float_value = event_keyframe.event.float_value || pose_event.float_value;
                            pose_event.string_value = event_keyframe.event.string_value || pose_event.string_value;
                            return pose_event;
                        };
                        if (this.elapsed_time < 0) {
                            if (this.wrapped_min) {
                                // min    prev_time           time      max
                                //  |         |                |         |
                                //  ----------x                o<---------
                                // all events between min and prev_time, not including prev_time
                                // all events between max and time
                                anim.event_timeline.keyframes.forEach((event_keyframe) => {
                                    if (((anim.range.min <= event_keyframe.time) && (event_keyframe.time < this.prev_time)) ||
                                        ((this.time <= event_keyframe.time) && (event_keyframe.time <= anim.range.max))) {
                                        this.events.set(event_keyframe.name, make_event(event_keyframe));
                                    }
                                });
                            }
                            else {
                                // min       time          prev_time    max
                                //  |         |                |         |
                                //            o<---------------x
                                // all events between time and prev_time, not including prev_time
                                anim.event_timeline.keyframes.forEach((event_keyframe) => {
                                    if ((this.time <= event_keyframe.time) && (event_keyframe.time < this.prev_time)) {
                                        this.events.set(event_keyframe.name, make_event(event_keyframe));
                                    }
                                });
                            }
                        }
                        else {
                            if (this.wrapped_max) {
                                // min       time          prev_time    max
                                //  |         |                |         |
                                //  --------->o                x----------
                                // all events between prev_time and max, not including prev_time
                                // all events between min and time
                                anim.event_timeline.keyframes.forEach((event_keyframe) => {
                                    if (((anim.range.min <= event_keyframe.time) && (event_keyframe.time <= this.time)) ||
                                        ((this.prev_time < event_keyframe.time) && (event_keyframe.time <= anim.range.max))) {
                                        this.events.set(event_keyframe.name, make_event(event_keyframe));
                                    }
                                });
                            }
                            else {
                                // min    prev_time           time      max
                                //  |         |                |         |
                                //            x--------------->o
                                // all events between prev_time and time, not including prev_time
                                anim.event_timeline.keyframes.forEach((event_keyframe) => {
                                    if ((this.prev_time < event_keyframe.time) && (event_keyframe.time <= this.time)) {
                                        this.events.set(event_keyframe.name, make_event(event_keyframe));
                                    }
                                });
                            }
                        }
                    }
                }
                iterateBones(callback) {
                    this.forEachBone((bone, bone_key) => {
                        callback(bone_key, bone);
                    });
                }
                forEachBone(callback) {
                    this.bones.forEach(callback);
                }
                iterateAttachments(callback) {
                    this.forEachAttachment((attachment, attachment_key, slot, slot_key, skin_slot) => {
                        callback(slot_key, slot, skin_slot, attachment_key, attachment);
                    });
                }
                forEachAttachment(callback) {
                    const skin = this.data.skins.get(this.skin_key);
                    const default_skin = this.data.skins.get("default");
                    this.slots.forEach((slot, slot_key) => {
                        const skin_slot = (skin && skin.slots.get(slot_key)) || (default_skin && default_skin.slots.get(slot_key));
                        let attachment = skin_slot && skin_slot.attachments.get(slot.attachment_key);
                        let attachment_key = (attachment && attachment.name) || slot.attachment_key;
                        if (attachment && (attachment.type === "linkedmesh")) {
                            attachment_key = attachment.parent_key;
                            attachment = skin_slot && skin_slot.attachments.get(attachment_key);
                        }
                        if (attachment && skin_slot) {
                            callback(attachment, attachment_key, slot, slot_key, skin_slot);
                        }
                    });
                }
                iterateEvents(callback) {
                    this.forEachEvent((event, event_key) => {
                        callback(event_key, event);
                    });
                }
                forEachEvent(callback) {
                    this.events.forEach(callback);
                }
            };
            exports_1("Pose", Pose);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwQkc7Ozs7O0lBd0ZILFNBQWdCLFFBQVEsQ0FBQyxJQUEwQixFQUFFLEdBQW9CLEVBQUUsTUFBZSxLQUFLO1FBQzdGLE1BQU0sS0FBSyxHQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixRQUFRLE9BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNyQixLQUFLLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3hELEtBQUssU0FBUyxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUM7WUFDN0IsT0FBTyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7U0FDckI7SUFDSCxDQUFDOztJQUVELFNBQWdCLFFBQVEsQ0FBQyxJQUEwQixFQUFFLEdBQW9CLEVBQUUsS0FBYyxFQUFFLE1BQWUsS0FBSztRQUM3RyxJQUFJLENBQUMsT0FBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDbkI7SUFDSCxDQUFDOztJQUVELFNBQWdCLFNBQVMsQ0FBQyxJQUEwQixFQUFFLEdBQW9CLEVBQUUsTUFBYyxDQUFDO1FBQ3pGLE1BQU0sS0FBSyxHQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixRQUFRLE9BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNyQixLQUFLLFFBQVEsQ0FBQyxDQUFDLE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLEtBQUssUUFBUSxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUM7WUFDNUIsT0FBTyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7U0FDckI7SUFDSCxDQUFDOztJQUVELFNBQWdCLFNBQVMsQ0FBQyxJQUEwQixFQUFFLEdBQW9CLEVBQUUsS0FBYSxFQUFFLE1BQWMsQ0FBQztRQUN4RyxJQUFJLENBQUMsT0FBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDbkI7SUFDSCxDQUFDOztJQUVELFNBQWdCLE9BQU8sQ0FBQyxJQUEwQixFQUFFLEdBQW9CLEVBQUUsTUFBYyxDQUFDO1FBQ3ZGLE1BQU0sS0FBSyxHQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixRQUFRLE9BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNyQixLQUFLLFFBQVEsQ0FBQyxDQUFDLE9BQU8sUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNoQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQztTQUNyQjtJQUNILENBQUM7O0lBRUQsU0FBZ0IsT0FBTyxDQUFDLElBQTBCLEVBQUUsR0FBb0IsRUFBRSxLQUFhLEVBQUUsTUFBYyxDQUFDO1FBQ3RHLElBQUksQ0FBQyxPQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDakQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztTQUNuQjtJQUNILENBQUM7O0lBRUQsU0FBZ0IsVUFBVSxDQUFDLElBQTBCLEVBQUUsR0FBb0IsRUFBRSxNQUFjLEVBQUU7UUFDM0YsTUFBTSxLQUFLLEdBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLFFBQVEsT0FBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLEtBQUssUUFBUSxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUM7WUFDNUIsT0FBTyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7U0FDckI7SUFDSCxDQUFDOztJQUVELFNBQWdCLFVBQVUsQ0FBQyxJQUEwQixFQUFFLEdBQW9CLEVBQUUsS0FBYSxFQUFFLE1BQWMsRUFBRTtRQUMxRyxJQUFJLENBQUMsT0FBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDbkI7SUFDSCxDQUFDOztJQXNERCw2Q0FBNkM7SUFDN0MsU0FBZ0IsV0FBVyxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVUsRUFBRSxVQUFrQixPQUFPO1FBRW5HOzs7Ozs7Ozs7Ozs7Ozs7VUFlRTtRQUVGOzs7Ozs7Ozs7VUFTRTtRQUVGLFNBQVMsTUFBTSxDQUFDLENBQVM7WUFDdkIsTUFBTSxFQUFFLEdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QixNQUFNLEVBQUUsR0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxHQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsTUFBTSxFQUFFLEdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QixPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2hELENBQUM7UUFFRCxTQUFTLE1BQU0sQ0FBQyxDQUFTO1lBQ3ZCLE1BQU0sRUFBRSxHQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsTUFBTSxFQUFFLEdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsR0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sRUFBRSxHQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNoRCxDQUFDO1FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxDQUFTO1lBQ2pDLE1BQU0sRUFBRSxHQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsTUFBTSxFQUFFLEdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMxQixPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMxRSxDQUFDO1FBRUQsT0FBTyxVQUFTLE9BQWU7WUFDN0IsTUFBTSxDQUFDLEdBQVcsT0FBTyxDQUFDO1lBQUMsSUFBSSxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVSxFQUFFLENBQVMsQ0FBQztZQUVyRyx1RUFBdUU7WUFDdkUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtnQkFDOUIsRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPO29CQUFFLE9BQU8sTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzFCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPO29CQUFFLE1BQU07Z0JBQ2xDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7YUFDckI7WUFFRCxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUV2QixJQUFJLEVBQUUsR0FBRyxFQUFFO2dCQUFFLE9BQU8sTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9CLElBQUksRUFBRSxHQUFHLEVBQUU7Z0JBQUUsT0FBTyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFL0Isb0RBQW9EO1lBQ3BELE9BQU8sRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFDZCxFQUFFLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNoQixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU87b0JBQUUsT0FBTyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7b0JBQ2YsRUFBRSxHQUFHLEVBQUUsQ0FBQztnQkFDYixFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQzthQUMzQjtZQUVELFVBQVU7WUFDVixPQUFPLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQixDQUFDLENBQUM7SUFDSixDQUFDOztJQUVELG1FQUFtRTtJQUNuRSxTQUFnQixlQUFlLENBQUMsR0FBVyxFQUFFLEdBQVcsRUFBRSxHQUFXLEVBQUUsR0FBVztRQUNoRixNQUFNLGNBQWMsR0FBVyxFQUFFLENBQUM7UUFDbEMsTUFBTSxXQUFXLEdBQVcsQ0FBQyxHQUFHLGNBQWMsQ0FBQztRQUMvQyxNQUFNLFlBQVksR0FBVyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQ3ZELE1BQU0sWUFBWSxHQUFXLFlBQVksR0FBRyxXQUFXLENBQUM7UUFDeEQsTUFBTSxJQUFJLEdBQVcsQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUNyQyxNQUFNLElBQUksR0FBVyxDQUFDLEdBQUcsWUFBWSxDQUFDO1FBQ3RDLE1BQU0sSUFBSSxHQUFXLENBQUMsR0FBRyxZQUFZLENBQUM7UUFDdEMsTUFBTSxJQUFJLEdBQVcsQ0FBQyxHQUFHLFlBQVksQ0FBQztRQUN0QyxNQUFNLEtBQUssR0FBVyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQ3JDLE1BQU0sS0FBSyxHQUFXLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDckMsTUFBTSxLQUFLLEdBQVcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQyxNQUFNLEtBQUssR0FBVyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLE1BQU0sUUFBUSxHQUFXLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxZQUFZLENBQUMsQ0FBQztRQUM1RSxNQUFNLFFBQVEsR0FBVyxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsWUFBWSxDQUFDLENBQUM7UUFDNUUsTUFBTSxRQUFRLEdBQVcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN2RCxNQUFNLFFBQVEsR0FBVyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sUUFBUSxHQUFXLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sUUFBUSxHQUFXLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRXhDLE9BQU8sVUFBVSxPQUFlO1lBQzlCLElBQUksR0FBRyxHQUFXLFFBQVEsQ0FBQztZQUMzQixJQUFJLEdBQUcsR0FB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SUFBSSxDQUFDO3dDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7cUNBQUU7b0NBQy9ELENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29DQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29DQUN6QixJQUFJLElBQUksR0FBRyxPQUFPLEVBQUU7d0NBQUUsUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7d0NBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzt3Q0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO3FDQUFFO29DQUNyRSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztvQ0FDdkMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQ0FDN0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO29DQUN4QixJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29DQUNyQixJQUFJLElBQUksR0FBRyxPQUFPLEVBQUU7d0NBQUUsUUFBUSxHQUFHLEtBQUssQ0FBQzt3Q0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO3dDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7d0NBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztxQ0FBRTtvQ0FDN0UsSUFBSSxJQUFJLEdBQUcsT0FBTyxFQUFFO3dDQUFFLFFBQVEsR0FBRyxLQUFLLENBQUM7d0NBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzt3Q0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO3dDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7cUNBQUU7b0NBQzdFLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTt3Q0FDakMsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7d0NBQzNDLEVBQUUsR0FBRyxRQUFRLEdBQUcsT0FBTyxDQUFDO3FDQUN6Qjt5Q0FBTTt3Q0FDTCxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzt3Q0FDM0MsRUFBRSxHQUFHLFFBQVEsR0FBRyxPQUFPLENBQUM7cUNBQ3pCO2lDQUNGO2dDQUNELE1BQU0sTUFBTSxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQ0FDNUUsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQ0FDN0IsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUM7Z0NBQ3JDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dDQUNoRyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztnQ0FDOUYsTUFBTTs2QkFDUDt5QkFDRjtvQkFDSCxDQUFDLENBQUMsQ0FBQztvQkFFSCxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBVSxFQUFFLFFBQWdCLEVBQVEsRUFBRTt3QkFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNqQyxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO2dCQUVPLFdBQVcsQ0FBQyxJQUEyQjtvQkFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBUSxFQUFFLE9BQWUsRUFBUSxFQUFFO3dCQUN6RCxNQUFNLFVBQVUsR0FBcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUNwRSxJQUFJLENBQUMsVUFBVTs0QkFBRSxPQUFPO3dCQUV4QixJQUFJLGdCQUFnQixHQUFXLEdBQUcsQ0FBQyxZQUFZLENBQUM7d0JBQ2hELElBQUksZ0JBQWdCLEdBQVcsR0FBRyxDQUFDLFlBQVksQ0FBQzt3QkFDaEQsSUFBSSxhQUFhLEdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQzt3QkFDMUMsSUFBSSxhQUFhLEdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQzt3QkFFMUMsTUFBTSxZQUFZLEdBQTRCLElBQUksSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUN6RixJQUFJLFlBQVksRUFBRTs0QkFDaEIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQXNCLEVBQUUsU0FBc0IsRUFBRSxDQUFTLEVBQVEsRUFBRTtnQ0FDN0csTUFBTSxHQUFHLEdBQVcsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ2hELGdCQUFnQixHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0NBQzlFLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0NBQzlFLGFBQWEsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dDQUNyRSxhQUFhLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDdkUsQ0FBQyxDQUFDLENBQUM7eUJBQ0o7d0JBRUQsTUFBTSxZQUFZLEdBQWEsR0FBRyxDQUFDLFFBQVEsQ0FBQzt3QkFDNUMsTUFBTSxZQUFZLEdBQWEsR0FBRyxDQUFDLFFBQVEsQ0FBQzt3QkFDNUMsTUFBTSxTQUFTLEdBQVUsR0FBRyxDQUFDLEtBQUssQ0FBQzt3QkFDbkMsTUFBTSxTQUFTLEdBQVUsR0FBRyxDQUFDLEtBQUssQ0FBQzt3QkFFbkMsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDN0YsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDN0Ysb0ZBQW9GO3dCQUNwRixpRUFBaUU7d0JBQ2pFLDZEQUE2RDt3QkFFN0QsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFnQixFQUFRLEVBQUU7NEJBQy9DLE1BQU0sUUFBUSxHQUFxQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzs0QkFDNUQsSUFBSSxDQUFDLFFBQVE7Z0NBQUUsT0FBTzs0QkFFdEIsSUFBSSxnQkFBZ0IsS0FBSyxDQUFDLEVBQUU7Z0NBQzFCLHdCQUF3QjtnQ0FDeEIscUVBQXFFO2dDQUNyRSw4R0FBOEc7Z0NBQzlHLDhHQUE4RztnQ0FDOUcsTUFBTSxrQkFBa0IsR0FBVyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztnQ0FDdkcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7NkJBQzFHOzRCQUVELElBQUksZ0JBQWdCLEtBQUssQ0FBQyxFQUFFO2dDQUMxQixJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsOENBQThDO2dDQUM1RixJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsOENBQThDO2dDQUM1RixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDO2dDQUNqRSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ3hCLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQztnQ0FDdEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDekMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7NkJBQ3pEOzRCQUVELElBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtnQ0FDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQzdLLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0NBQ3RDLElBQUksQ0FBQyxHQUFHLE9BQU87b0NBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dDQUN0RSxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQ0FDMUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQzFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDekssRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0NBQ2xDLElBQUksQ0FBQyxHQUFHLE9BQU87b0NBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dDQUN0RSxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQ0FDMUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7NkJBQzNDOzRCQUVELElBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtnQ0FDdkIsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQ0FDdkYsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0NBQzFCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDaEosQ0FBQyxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUN4QixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDO2dDQUMvQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dDQUNqQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dDQUN2RCxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDOzZCQUN4RDt3QkFDSCxDQUFDLENBQUMsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO2dCQUVPLFlBQVksQ0FBQyxJQUEyQjtvQkFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBZSxFQUFFLFFBQWdCLEVBQVEsRUFBRTt3QkFDbEUsTUFBTSxTQUFTLEdBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFFekYscUNBQXFDO3dCQUNyQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUUxQiw2Q0FBNkM7d0JBQzdDLE1BQU0sYUFBYSxHQUE2QixJQUFJLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDN0YsSUFBSSxhQUFhLEVBQUU7NEJBQ2pCLElBQUksYUFBYSxDQUFDLGNBQWMsRUFBRTtnQ0FDaEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUE0QixFQUFFLFNBQTRCLEVBQUUsQ0FBUyxFQUFRLEVBQUU7b0NBQ3pJLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dDQUN2RixDQUFDLENBQUMsQ0FBQzs2QkFDSjs0QkFFRCxJQUFJLGFBQWEsQ0FBQyxtQkFBbUIsRUFBRTtnQ0FDckMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQWlDLEVBQUUsU0FBaUMsRUFBRSxDQUFTLEVBQVEsRUFBRTtvQ0FDeEosMEJBQTBCO29DQUMxQixTQUFTLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7Z0NBQzVDLENBQUMsQ0FBQyxDQUFDOzZCQUNKO3lCQUNGO29CQUNILENBQUMsQ0FBQyxDQUFDO29CQUVILElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFXLEVBQUUsS0FBYSxFQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFeEcsTUFBTSxjQUFjLEdBQThCLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDO29CQUM5RSxJQUFJLGNBQWMsRUFBRTt3QkFDbEIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQXdCLEVBQUUsU0FBd0IsRUFBRSxDQUFTLEVBQVEsRUFBRTs0QkFDbkgsU0FBUyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUF1QixFQUFRLEVBQUU7Z0NBQy9ELE1BQU0sVUFBVSxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Z0NBQzFFLElBQUksVUFBVSxLQUFLLENBQUMsQ0FBQyxFQUFFO29DQUNyQixzQkFBc0I7b0NBQ3RCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0NBQ3ZDLHNCQUFzQjtvQ0FDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7aUNBQ25GOzRCQUNILENBQUMsQ0FBQyxDQUFDO3dCQUNMLENBQUMsQ0FBQyxDQUFDO3FCQUNKO2dCQUNILENBQUM7Z0JBRU8sV0FBVyxDQUFDLElBQTJCO29CQUM3QyxNQUFNLElBQUksR0FBcUIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDbEUsTUFBTSxZQUFZLEdBQXFCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFFdEUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBUSxFQUFFLE9BQWUsRUFBUSxFQUFFO3dCQUN6RCxNQUFNLFFBQVEsR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDO3dCQUN4QyxNQUFNLElBQUksR0FBcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3hELE1BQU0sU0FBUyxHQUF5QixDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQ2pJLE1BQU0sVUFBVSxHQUEyQixJQUFJLElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzt3QkFFL0csSUFBSSxDQUFDLENBQUMsVUFBVSxZQUFZLGNBQWMsQ0FBQzs0QkFBRSxPQUFPO3dCQUVwRCxNQUFNLGdCQUFnQixHQUFXLEdBQUcsQ0FBQyxZQUFZLENBQUM7d0JBQ2xELElBQUksV0FBVyxHQUFXLEdBQUcsQ0FBQyxPQUFPLENBQUM7d0JBRXRDLE1BQU0saUJBQWlCLEdBQVcsR0FBRyxDQUFDLGFBQWEsQ0FBQzt3QkFDcEQsSUFBSSxnQkFBZ0IsR0FBVyxHQUFHLENBQUMsWUFBWSxDQUFDO3dCQUNoRCxJQUFJLFlBQVksR0FBVyxHQUFHLENBQUMsUUFBUSxDQUFDO3dCQUV4QyxNQUFNLGlCQUFpQixHQUFXLEdBQUcsQ0FBQyxhQUFhLENBQUM7d0JBQ3BELElBQUksZ0JBQWdCLEdBQVcsR0FBRyxDQUFDLFlBQVksQ0FBQzt3QkFDaEQsTUFBTSxZQUFZLEdBQWEsR0FBRyxDQUFDLFFBQVEsQ0FBQzt3QkFFNUMsTUFBTSxZQUFZLEdBQTRCLElBQUksSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUN6RixJQUFJLFlBQVksRUFBRTs0QkFDaEIsSUFBSSxZQUFZLENBQUMsZ0JBQWdCLEVBQUU7Z0NBQ2pDLFFBQVEsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUF5QixFQUFFLFNBQXlCLEVBQUUsQ0FBUyxFQUFRLEVBQUU7b0NBQ3BJLE1BQU0sR0FBRyxHQUFXLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29DQUNoRCxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29DQUM5RSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dDQUNoRixDQUFDLENBQUMsQ0FBQzs2QkFDSjs0QkFFRCxJQUFJLFlBQVksQ0FBQyxvQkFBb0IsRUFBRTtnQ0FDckMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQTZCLEVBQUUsU0FBNkIsRUFBRSxDQUFTLEVBQVEsRUFBRTtvQ0FDaEosV0FBVyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDekYsQ0FBQyxDQUFDLENBQUM7NkJBQ0o7NEJBRUQsSUFBSSxZQUFZLENBQUMscUJBQXFCLEVBQUU7Z0NBQ3RDLFFBQVEsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUE4QixFQUFFLFNBQThCLEVBQUUsQ0FBUyxFQUFRLEVBQUU7b0NBQ25KLFlBQVksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQzVGLENBQUMsQ0FBQyxDQUFDOzZCQUNKOzRCQUVELElBQUksWUFBWSxDQUFDLHFCQUFxQixFQUFFO2dDQUN0QyxRQUFRLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBOEIsRUFBRSxTQUE4QixFQUFFLENBQVMsRUFBUSxFQUFFO29DQUNuSixZQUFZLENBQUMsR0FBRyxHQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ3BILENBQUMsQ0FBQyxDQUFDOzZCQUNKO3lCQUNGO3dCQUVELEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBZ0IsRUFBUSxFQUFFOzRCQUMvQyxNQUFNLFFBQVEsR0FBcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7NEJBRTVELElBQUksQ0FBQyxRQUFRO2dDQUFFLE9BQU87NEJBRXRCLG9GQUFvRjs0QkFFcEYsUUFBUSxnQkFBZ0IsRUFBRTtnQ0FDeEIsS0FBSyxRQUFRLENBQUM7Z0NBQ2QsS0FBSyxPQUFPLENBQUM7Z0NBQ2IsS0FBSyxTQUFTO29DQUNaLE1BQU07Z0NBQ1I7b0NBQ0UsV0FBVyxDQUFDOzZCQUNmOzRCQUVELFFBQVEsaUJBQWlCLEVBQUU7Z0NBQ3pCLEtBQUssT0FBTyxDQUFDO2dDQUNiLEtBQUssU0FBUztvQ0FDWixNQUFNO2dDQUNSO29DQUNFLFlBQVksQ0FBQztvQ0FDYixnQkFBZ0IsQ0FBQzs2QkFDcEI7NEJBRUQsUUFBUSxpQkFBaUIsRUFBRTtnQ0FDekIsS0FBSyxTQUFTLENBQUM7Z0NBQ2YsS0FBSyxPQUFPLENBQUM7Z0NBQ2IsS0FBSyxZQUFZO29DQUNmLE1BQU07Z0NBQ1I7b0NBQ0UsWUFBWSxDQUFDO29DQUNiLGdCQUFnQixDQUFDOzZCQUN0Qjt3QkFDRCxDQUFDLENBQUMsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO2dCQUVPLGFBQWEsQ0FBQyxJQUEyQjtvQkFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFFcEIsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTt3QkFDL0IsTUFBTSxVQUFVLEdBQUcsQ0FBQyxjQUE2QixFQUFTLEVBQUU7NEJBQzFELE1BQU0sVUFBVSxHQUFVLElBQUksS0FBSyxFQUFFLENBQUM7NEJBQ3RDLE1BQU0sVUFBVSxHQUFzQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNoRixJQUFJLFVBQVUsRUFBRTtnQ0FDZCxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDOzZCQUM3Qjs0QkFDRCxVQUFVLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUM7NEJBQzlFLFVBQVUsQ0FBQyxXQUFXLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksVUFBVSxDQUFDLFdBQVcsQ0FBQzs0QkFDcEYsVUFBVSxDQUFDLFlBQVksR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLFlBQVksSUFBSSxVQUFVLENBQUMsWUFBWSxDQUFDOzRCQUN2RixPQUFPLFVBQVUsQ0FBQzt3QkFDcEIsQ0FBQyxDQUFDO3dCQUVGLElBQUksSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLEVBQUU7NEJBQ3pCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQ0FDcEIsMkNBQTJDO2dDQUMzQywwQ0FBMEM7Z0NBQzFDLDBDQUEwQztnQ0FDMUMsZ0VBQWdFO2dDQUNoRSxrQ0FBa0M7Z0NBQ2xDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGNBQTZCLEVBQVEsRUFBRTtvQ0FDNUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7d0NBQ3JGLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO3dDQUNqRixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO3FDQUNsRTtnQ0FDSCxDQUFDLENBQUMsQ0FBQzs2QkFDSjtpQ0FBTTtnQ0FDTCwyQ0FBMkM7Z0NBQzNDLDBDQUEwQztnQ0FDMUMsZ0NBQWdDO2dDQUNoQyxpRUFBaUU7Z0NBQ2pFLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGNBQTZCLEVBQVEsRUFBRTtvQ0FDNUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7d0NBQ2hGLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7cUNBQ2xFO2dDQUNILENBQUMsQ0FBQyxDQUFDOzZCQUNKO3lCQUNGOzZCQUFNOzRCQUNMLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQ0FDcEIsMkNBQTJDO2dDQUMzQywwQ0FBMEM7Z0NBQzFDLDBDQUEwQztnQ0FDMUMsZ0VBQWdFO2dDQUNoRSxrQ0FBa0M7Z0NBQ2xDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGNBQTZCLEVBQVEsRUFBRTtvQ0FDNUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0NBQ2pGLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO3dDQUNuRixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO3FDQUNwRTtnQ0FDSCxDQUFDLENBQUMsQ0FBQzs2QkFDSjtpQ0FBTTtnQ0FDTCwyQ0FBMkM7Z0NBQzNDLDBDQUEwQztnQ0FDMUMsZ0NBQWdDO2dDQUNoQyxpRUFBaUU7Z0NBQ2pFLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGNBQTZCLEVBQVEsRUFBRTtvQ0FDNUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7d0NBQ2hGLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7cUNBQ2xFO2dDQUNILENBQUMsQ0FBQyxDQUFDOzZCQUNKO3lCQUNGO3FCQUNGO2dCQUNILENBQUM7Z0JBRU0sWUFBWSxDQUFDLFFBQWdEO29CQUNsRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBVSxFQUFFLFFBQWdCLEVBQVEsRUFBRTt3QkFDdEQsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDM0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQztnQkFFTSxXQUFXLENBQUMsUUFBZ0Q7b0JBQ2pFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMvQixDQUFDO2dCQUVNLGtCQUFrQixDQUFDLFFBQXFIO29CQUM3SSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxVQUFzQixFQUFFLGNBQXNCLEVBQUUsSUFBVSxFQUFFLFFBQWdCLEVBQUUsU0FBbUIsRUFBUSxFQUFFO3dCQUNqSSxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUNsRSxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO2dCQUVNLGlCQUFpQixDQUFDLFFBQXFIO29CQUM1SSxNQUFNLElBQUksR0FBcUIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDbEUsTUFBTSxZQUFZLEdBQXFCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDdEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFVLEVBQUUsUUFBZ0IsRUFBUSxFQUFFO3dCQUN4RCxNQUFNLFNBQVMsR0FBeUIsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUNqSSxJQUFJLFVBQVUsR0FBMkIsU0FBUyxJQUFJLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzt3QkFDckcsSUFBSSxjQUFjLEdBQVcsQ0FBQyxVQUFVLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUM7d0JBQ3BGLElBQUksVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsRUFBRTs0QkFDcEQsY0FBYyxHQUEwQixVQUFXLENBQUMsVUFBVSxDQUFDOzRCQUMvRCxVQUFVLEdBQUcsU0FBUyxJQUFJLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO3lCQUNyRTt3QkFDRCxJQUFJLFVBQVUsSUFBSSxTQUFTLEVBQUU7NEJBQzNCLFFBQVEsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7eUJBQ2pFO29CQUNILENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUM7Z0JBRU0sYUFBYSxDQUFDLFFBQW1EO29CQUN0RSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBWSxFQUFFLFNBQWlCLEVBQVEsRUFBRTt3QkFDMUQsUUFBUSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDN0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQztnQkFFTSxZQUFZLENBQUMsUUFBbUQ7b0JBQ3JFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNoQyxDQUFDO2FBQ0YsQ0FBQSJ9