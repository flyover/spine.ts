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
    function signum(n) { return (n < 0) ? (-1) : (n > 0) ? (1) : (n); }
    exports_1("signum", signum);
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
    var EPSILON, SpineMap, Color, Curve, Angle, Vector, Matrix, Affine, Position, Rotation, Scale, Shear, Space, Bone, Constraint, Ikc, Xfc, Ptc, Slot, Attachment, RegionAttachment, BoundingBoxAttachment, MeshAttachment, LinkedMeshAttachment, WeightedMeshAttachment, PathAttachment, SkinSlot, Skin, Event, Keyframe, Timeline, BoneKeyframe, BonePositionKeyframe, BoneRotationKeyframe, BoneScaleKeyframe, BoneShearKeyframe, BoneTimeline, SlotKeyframe, SlotColorKeyframe, SlotAttachmentKeyframe, SlotTimeline, EventKeyframe, EventTimeline, SlotOffset, OrderKeyframe, OrderTimeline, IkcKeyframe, IkcTimeline, XfcKeyframe, XfcTimeline, PtcKeyframe, PtcMixKeyframe, PtcSpacingKeyframe, PtcPositionKeyframe, PtcRotationKeyframe, PtcTimeline, FfdKeyframe, FfdTimeline, FfdAttachment, FfdSlot, FfdSkin, Animation, Skeleton, Data, Pose;
    return {
        setters: [],
        execute: function () {/**
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
            exports_1("EPSILON", EPSILON = 1e-6);
            SpineMap = class SpineMap {
                constructor(...args) {
                    this.keys = [];
                    this.map = new Map(args);
                    this.map.forEach((value, key) => {
                        this.keys.push(key);
                    });
                }
                clear() {
                    this.keys.length = 0;
                    this.map.clear();
                }
                has(key) {
                    return this.map.has(key);
                }
                hasByIndex(index) {
                    return this.has(this.keys[index]);
                }
                get(key) {
                    return this.map.get(key);
                }
                getByIndex(index) {
                    return this.get(this.keys[index]);
                }
                set(key, value) {
                    if (!this.map.has(key)) {
                        this.keys.push(key);
                    }
                    this.map.set(key, value);
                    return value;
                }
                setByIndex(index, value) {
                    return this.set(this.keys[index], value);
                }
                delete(key) {
                    this.keys.splice(this.keys.indexOf(key), 1);
                    this.map.delete(key);
                }
                deleteByIndex(index) {
                    this.delete(this.keys[index]);
                }
                forEach(callback) {
                    this.keys.forEach((key, index, array) => {
                        const value = this.map.get(key);
                        if (!value)
                            throw new Error();
                        callback(value, key, index, this);
                    });
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
                    ///return Vector.add(this, other, this);
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
                    ///return Vector.subtract(this, other, this);
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
                    super(0);
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
                constructor() {
                    super();
                }
                get x() { return (Math.abs(this.c) < EPSILON) ? (this.a) : (signum(this.a) * Math.sqrt(this.a * this.a + this.c * this.c)); }
                set x(value) { this.a = value; this.c = 0; }
                get y() { return (Math.abs(this.b) < EPSILON) ? (this.d) : (signum(this.d) * Math.sqrt(this.b * this.b + this.d * this.d)); }
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
                            default:
                                console.log("TODO: Space.transform", json.transform);
                                break;
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
                    ///public name: string = "";
                    this.order = 0;
                }
                load(json) {
                    ///this.name = loadString(json, "name", "");
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
                    this.path = "";
                    this.type = type;
                }
                load(json) {
                    const type = loadString(json, "type", "region");
                    if (type !== this.type) {
                        throw new Error();
                    }
                    this.name = loadString(json, "name", "");
                    this.path = loadString(json, "path", "");
                    return this;
                }
            };
            exports_1("Attachment", Attachment);
            RegionAttachment = class RegionAttachment extends Attachment {
                constructor() {
                    super("region");
                    this.color = new Color();
                    this.local_space = new Space();
                    this.width = 0;
                    this.height = 0;
                }
                load(json) {
                    super.load(json);
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
                    this.vertices = [];
                }
                load(json) {
                    super.load(json);
                    this.color.load(json.color, 0x60f000ff);
                    /// The x/y pairs that make up the vertices of the polygon.
                    this.vertices = json.vertices;
                    return this;
                }
            };
            exports_1("BoundingBoxAttachment", BoundingBoxAttachment);
            MeshAttachment = class MeshAttachment extends Attachment {
                constructor() {
                    super("mesh");
                    this.color = new Color();
                    this.triangles = [];
                    this.edges = [];
                    this.vertices = [];
                    this.uvs = [];
                    this.hull = 0;
                }
                load(json) {
                    super.load(json);
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
                    this.color = new Color();
                    this.triangles = [];
                    this.edges = [];
                    this.vertices = [];
                    this.uvs = [];
                    this.hull = 0;
                }
                load(json) {
                    super.load(json);
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
            SkinSlot = class SkinSlot {
                constructor() {
                    this.attachments = new SpineMap();
                }
                load(json) {
                    this.attachments.clear();
                    Object.keys(json || {}).forEach((attachment_key) => {
                        const attachment_json = json[attachment_key];
                        switch (attachment_json.type) {
                            default:
                            case "region":
                                this.attachments.set(attachment_key, new RegionAttachment().load(attachment_json));
                                break;
                            case "boundingbox":
                                this.attachments.set(attachment_key, new BoundingBoxAttachment().load(attachment_json));
                                break;
                            case "mesh":
                                if (attachment_json.vertices.length === attachment_json.uvs.length) {
                                    this.attachments.set(attachment_key, new MeshAttachment().load(attachment_json));
                                }
                                else {
                                    attachment_json.type = "weightedmesh";
                                    this.attachments.set(attachment_key, new WeightedMeshAttachment().load(attachment_json));
                                }
                                break;
                            case "linkedmesh":
                                this.attachments.set(attachment_key, new LinkedMeshAttachment().load(attachment_json));
                                break;
                            case "skinnedmesh":
                                attachment_json.type = "weightedmesh";
                            case "weightedmesh":
                                this.attachments.set(attachment_key, new WeightedMeshAttachment().load(attachment_json));
                                break;
                            case "path":
                                this.attachments.set(attachment_key, new PathAttachment().load(attachment_json));
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
                    Object.keys(json || {}).forEach((slot_key) => {
                        this.slots.set(slot_key, new SkinSlot().load(json[slot_key]));
                    });
                    return this;
                }
                iterateAttachments(callback) {
                    this.slots.forEach((skin_slot, slot_key) => {
                        skin_slot.attachments.forEach((attachment, attachment_key) => {
                            callback(slot_key, skin_slot, (attachment && attachment.name) || attachment_key, attachment);
                        });
                    });
                }
            };
            exports_1("Skin", Skin);
            Event = class Event {
                constructor() {
                    this.name = "";
                    this.int_value = 0;
                    this.float_value = 0;
                    this.string_value = "";
                }
                copy(other) {
                    this.name = other.name;
                    this.int_value = other.int_value;
                    this.float_value = other.float_value;
                    this.string_value = other.string_value;
                    return this;
                }
                load(json) {
                    this.name = loadString(json, "name", "");
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
            Keyframe = class Keyframe {
                constructor() {
                    this.time = 0;
                }
                drop() {
                    this.time = 0;
                    return this;
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
                static evaluate(keyframes, time, callback) {
                    const keyframe0_index = Keyframe.find(keyframes, time);
                    if (keyframe0_index !== -1) {
                        const keyframe1_index = keyframe0_index + 1;
                        const keyframe0 = keyframes[keyframe0_index];
                        const keyframe1 = keyframes[keyframe1_index] || keyframe0;
                        const k = (keyframe0.time === keyframe1.time) ? 0 : (time - keyframe0.time) / (keyframe1.time - keyframe0.time);
                        callback(keyframe0, keyframe1, k, keyframe0_index, keyframe1_index);
                    }
                }
            };
            exports_1("Keyframe", Keyframe);
            Timeline = class Timeline {
                constructor() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                get length() { return this.max_time - this.min_time; }
                _expandTimeline(timeline) {
                    this.min_time = Math.min(this.min_time, timeline.min_time);
                    this.max_time = Math.max(this.max_time, timeline.max_time);
                    return timeline;
                }
                _expandKeyframe(keyframe) {
                    this.min_time = Math.min(this.min_time, keyframe.time);
                    this.max_time = Math.max(this.max_time, keyframe.time);
                    return keyframe;
                }
                _expandKeyframes(keyframes) {
                    keyframes.forEach((keyframe) => { this._expandKeyframe(keyframe); });
                    return keyframes;
                }
            };
            exports_1("Timeline", Timeline);
            BoneKeyframe = class BoneKeyframe extends Keyframe {
                constructor() {
                    super();
                    this.curve = new Curve();
                }
                load(json) {
                    super.load(json);
                    this.curve.load(json.curve);
                    return this;
                }
            };
            exports_1("BoneKeyframe", BoneKeyframe);
            BonePositionKeyframe = class BonePositionKeyframe extends BoneKeyframe {
                constructor() {
                    super();
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
            BoneRotationKeyframe = class BoneRotationKeyframe extends BoneKeyframe {
                constructor() {
                    super();
                    this.rotation = new Rotation();
                }
                load(json) {
                    super.load(json);
                    this.rotation.deg = loadFloat(json, "angle", 0);
                    return this;
                }
            };
            exports_1("BoneRotationKeyframe", BoneRotationKeyframe);
            BoneScaleKeyframe = class BoneScaleKeyframe extends BoneKeyframe {
                constructor() {
                    super();
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
            BoneShearKeyframe = class BoneShearKeyframe extends BoneKeyframe {
                constructor() {
                    super();
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
            BoneTimeline = class BoneTimeline extends Timeline {
                load(json) {
                    this.min_time = 0;
                    this.max_time = 0;
                    delete this.position_keyframes;
                    delete this.rotation_keyframes;
                    delete this.scale_keyframes;
                    delete this.shear_keyframes;
                    Object.keys(json || {}).forEach((key) => {
                        switch (key) {
                            case "translate":
                                this.position_keyframes = [];
                                json[key].forEach((keyframe_json) => {
                                    this.position_keyframes.push(new BonePositionKeyframe().load(keyframe_json));
                                });
                                this.position_keyframes.sort(Keyframe.compare);
                                this._expandKeyframes(this.position_keyframes);
                                break;
                            case "rotate":
                                this.rotation_keyframes = [];
                                json[key].forEach((keyframe_json) => {
                                    this.rotation_keyframes.push(new BoneRotationKeyframe().load(keyframe_json));
                                });
                                this.rotation_keyframes.sort(Keyframe.compare);
                                this._expandKeyframes(this.rotation_keyframes);
                                break;
                            case "scale":
                                this.scale_keyframes = [];
                                json[key].forEach((keyframe_json) => {
                                    this.scale_keyframes.push(new BoneScaleKeyframe().load(keyframe_json));
                                });
                                this.scale_keyframes.sort(Keyframe.compare);
                                this._expandKeyframes(this.scale_keyframes);
                                break;
                            case "shear":
                                this.shear_keyframes = [];
                                json[key].forEach((keyframe_json) => {
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
            };
            exports_1("BoneTimeline", BoneTimeline);
            SlotKeyframe = class SlotKeyframe extends Keyframe {
                constructor() {
                    super();
                }
                load(json) {
                    super.load(json);
                    return this;
                }
            };
            exports_1("SlotKeyframe", SlotKeyframe);
            SlotColorKeyframe = class SlotColorKeyframe extends SlotKeyframe {
                constructor() {
                    super();
                    this.curve = new Curve();
                    this.color = new Color();
                }
                load(json) {
                    super.load(json);
                    this.curve.load(json.curve);
                    this.color.load(json.color);
                    return this;
                }
            };
            exports_1("SlotColorKeyframe", SlotColorKeyframe);
            SlotAttachmentKeyframe = class SlotAttachmentKeyframe extends SlotKeyframe {
                constructor() {
                    super();
                    this.name = "";
                }
                load(json) {
                    super.load(json);
                    this.name = loadString(json, "name", "");
                    return this;
                }
            };
            exports_1("SlotAttachmentKeyframe", SlotAttachmentKeyframe);
            SlotTimeline = class SlotTimeline extends Timeline {
                load(json) {
                    this.min_time = 0;
                    this.max_time = 0;
                    delete this.color_keyframes;
                    delete this.attachment_keyframes;
                    Object.keys(json || {}).forEach((key) => {
                        switch (key) {
                            case "color":
                                this.color_keyframes = [];
                                json[key].forEach((keyframe_json) => {
                                    this.color_keyframes.push(new SlotColorKeyframe().load(keyframe_json));
                                });
                                this.color_keyframes.sort(Keyframe.compare);
                                this._expandKeyframes(this.color_keyframes);
                                break;
                            case "attachment":
                                this.attachment_keyframes = [];
                                json[key].forEach((keyframe_json) => {
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
            };
            exports_1("SlotTimeline", SlotTimeline);
            EventKeyframe = class EventKeyframe extends Keyframe {
                constructor() {
                    super();
                    this.name = "";
                    this.int_value = 0;
                    this.float_value = 0;
                    this.string_value = "";
                }
                load(json) {
                    super.load(json);
                    this.name = loadString(json, "name", "");
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
            exports_1("EventKeyframe", EventKeyframe);
            EventTimeline = class EventTimeline extends Timeline {
                load(json) {
                    this.min_time = 0;
                    this.max_time = 0;
                    this.event_keyframes = [];
                    json.forEach((keyframe_json) => {
                        this.event_keyframes.push(new EventKeyframe().load(keyframe_json));
                    });
                    this.event_keyframes.sort(Keyframe.compare);
                    this._expandKeyframes(this.event_keyframes);
                    return this;
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
                    super();
                    this.slot_offsets = [];
                }
                load(json) {
                    super.load(json);
                    this.slot_offsets = [];
                    Object.keys(json || {}).forEach((key) => {
                        switch (key) {
                            case "offsets":
                                json[key].forEach((offset_json) => {
                                    this.slot_offsets.push(new SlotOffset().load(offset_json));
                                });
                                break;
                        }
                    });
                    return this;
                }
            };
            exports_1("OrderKeyframe", OrderKeyframe);
            OrderTimeline = class OrderTimeline extends Timeline {
                load(json) {
                    this.min_time = 0;
                    this.max_time = 0;
                    this.order_keyframes = [];
                    json.forEach((keyframe_json) => {
                        this.order_keyframes.push(new OrderKeyframe().load(keyframe_json));
                    });
                    this.order_keyframes.sort(Keyframe.compare);
                    this._expandKeyframes(this.order_keyframes);
                    return this;
                }
            };
            exports_1("OrderTimeline", OrderTimeline);
            IkcKeyframe = class IkcKeyframe extends Keyframe {
                constructor() {
                    super();
                    this.curve = new Curve();
                    this.mix = 1;
                    this.bend_positive = true;
                }
                load(json) {
                    super.load(json);
                    this.curve.load(json.curve);
                    this.mix = loadFloat(json, "mix", 1);
                    this.bend_positive = loadBool(json, "bendPositive", true);
                    return this;
                }
            };
            exports_1("IkcKeyframe", IkcKeyframe);
            IkcTimeline = class IkcTimeline extends Timeline {
                load(json) {
                    this.min_time = 0;
                    this.max_time = 0;
                    this.ikc_keyframes = [];
                    json.forEach((keyframe_json) => {
                        this.ikc_keyframes.push(new IkcKeyframe().load(keyframe_json));
                    });
                    this.ikc_keyframes.sort(Keyframe.compare);
                    this._expandKeyframes(this.ikc_keyframes);
                    return this;
                }
            };
            exports_1("IkcTimeline", IkcTimeline);
            XfcKeyframe = class XfcKeyframe extends Keyframe {
                constructor() {
                    super();
                    this.curve = new Curve();
                    this.position_mix = 1;
                    this.rotation_mix = 1;
                    this.scale_mix = 1;
                    this.shear_mix = 1;
                }
                load(json) {
                    super.load(json);
                    this.curve.load(json.curve);
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
                    this.min_time = 0;
                    this.max_time = 0;
                    this.xfc_keyframes = [];
                    json.forEach((keyframe_json) => {
                        this.xfc_keyframes.push(new XfcKeyframe().load(keyframe_json));
                    });
                    this.xfc_keyframes.sort(Keyframe.compare);
                    this._expandKeyframes(this.xfc_keyframes);
                    return this;
                }
            };
            exports_1("XfcTimeline", XfcTimeline);
            PtcKeyframe = class PtcKeyframe extends Keyframe {
                constructor() {
                    super();
                    this.curve = new Curve();
                }
                load(json) {
                    super.load(json);
                    this.curve.load(json.curve);
                    return this;
                }
            };
            exports_1("PtcKeyframe", PtcKeyframe);
            PtcMixKeyframe = class PtcMixKeyframe extends PtcKeyframe {
                constructor() {
                    super();
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
            PtcSpacingKeyframe = class PtcSpacingKeyframe extends PtcKeyframe {
                constructor() {
                    super();
                    this.spacing = 0;
                }
                load(json) {
                    super.load(json);
                    this.spacing = loadFloat(json, "spacing", 0);
                    return this;
                }
            };
            exports_1("PtcSpacingKeyframe", PtcSpacingKeyframe);
            PtcPositionKeyframe = class PtcPositionKeyframe extends PtcKeyframe {
                constructor() {
                    super();
                    this.position = 0;
                }
                load(json) {
                    super.load(json);
                    this.position = loadFloat(json, "position", 0);
                    return this;
                }
            };
            exports_1("PtcPositionKeyframe", PtcPositionKeyframe);
            PtcRotationKeyframe = class PtcRotationKeyframe extends PtcKeyframe {
                constructor() {
                    super();
                    this.rotation = new Rotation();
                }
                load(json) {
                    super.load(json);
                    this.rotation.deg = loadFloat(json, "rotation", 0);
                    return this;
                }
            };
            exports_1("PtcRotationKeyframe", PtcRotationKeyframe);
            PtcTimeline = class PtcTimeline extends Timeline {
                load(json) {
                    this.min_time = 0;
                    this.max_time = 0;
                    delete this.ptc_mix_keyframes;
                    delete this.ptc_spacing_keyframes;
                    delete this.ptc_position_keyframes;
                    delete this.ptc_rotation_keyframes;
                    Object.keys(json || {}).forEach((key) => {
                        switch (key) {
                            case "mix":
                                this.ptc_mix_keyframes = [];
                                json[key].forEach((keyframe_json) => {
                                    this.ptc_mix_keyframes.push(new PtcMixKeyframe().load(keyframe_json));
                                });
                                this.ptc_mix_keyframes.sort(Keyframe.compare);
                                this._expandKeyframes(this.ptc_mix_keyframes);
                                break;
                            case "spacing":
                                this.ptc_spacing_keyframes = [];
                                json[key].forEach((keyframe_json) => {
                                    this.ptc_spacing_keyframes.push(new PtcSpacingKeyframe().load(keyframe_json));
                                });
                                this.ptc_spacing_keyframes.sort(Keyframe.compare);
                                this._expandKeyframes(this.ptc_spacing_keyframes);
                                break;
                            case "position":
                                this.ptc_position_keyframes = [];
                                json[key].forEach((keyframe_json) => {
                                    this.ptc_position_keyframes.push(new PtcPositionKeyframe().load(keyframe_json));
                                });
                                this.ptc_position_keyframes.sort(Keyframe.compare);
                                this._expandKeyframes(this.ptc_position_keyframes);
                                break;
                            case "rotation":
                                this.ptc_rotation_keyframes = [];
                                json[key].forEach((keyframe_json) => {
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
            };
            exports_1("PtcTimeline", PtcTimeline);
            FfdKeyframe = class FfdKeyframe extends Keyframe {
                constructor() {
                    super();
                    this.curve = new Curve();
                    this.offset = 0;
                    this.vertices = [];
                }
                load(json) {
                    super.load(json);
                    this.curve.load(json.curve);
                    this.offset = loadInt(json, "offset", 0);
                    this.vertices = json.vertices || [];
                    return this;
                }
            };
            exports_1("FfdKeyframe", FfdKeyframe);
            FfdTimeline = class FfdTimeline extends Timeline {
                load(json) {
                    this.min_time = 0;
                    this.max_time = 0;
                    this.ffd_keyframes = [];
                    json.forEach((keyframe_json) => {
                        this.ffd_keyframes.push(new FfdKeyframe().load(keyframe_json));
                    });
                    this.ffd_keyframes.sort(Keyframe.compare);
                    this._expandKeyframes(this.ffd_keyframes);
                    return this;
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
                    this.ffd_attachments.forEach((ffd_attachment, ffd_attachment_key) => {
                        callback(ffd_attachment_key, ffd_attachment);
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
                    this.ffd_slots.forEach((ffd_slot, ffd_slot_key) => {
                        ffd_slot.iterateAttachments((ffd_attachment_key, ffd_attachment) => {
                            callback(ffd_slot_key, ffd_slot, ffd_attachment_key, ffd_attachment);
                        });
                    });
                }
            };
            exports_1("FfdSkin", FfdSkin);
            Animation = class Animation extends Timeline {
                constructor() {
                    super(...arguments);
                    this.name = "";
                    this.bone_timeline_map = new SpineMap();
                    this.slot_timeline_map = new SpineMap();
                    this.ikc_timeline_map = new SpineMap();
                    this.xfc_timeline_map = new SpineMap();
                    this.ptc_timeline_map = new SpineMap();
                    this.ffd_skins = new SpineMap();
                }
                load(json) {
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
                    Object.keys(json || {}).forEach((key) => {
                        switch (key) {
                            case "bones":
                                Object.keys(json[key] || {}).forEach((bone_key) => {
                                    this._expandTimeline(this.bone_timeline_map.set(bone_key, new BoneTimeline().load(json[key][bone_key])));
                                });
                                break;
                            case "slots":
                                Object.keys(json[key] || {}).forEach((slot_key) => {
                                    this._expandTimeline(this.slot_timeline_map.set(slot_key, new SlotTimeline().load(json[key][slot_key])));
                                });
                                break;
                            case "events":
                                this._expandTimeline(this.event_timeline = new EventTimeline().load(json[key]));
                                break;
                            case "draworder":
                            case "drawOrder":
                                this._expandTimeline(this.order_timeline = new OrderTimeline().load(json[key]));
                                break;
                            case "ik":
                                Object.keys(json[key] || {}).forEach((ikc_key) => {
                                    this._expandTimeline(this.ikc_timeline_map.set(ikc_key, new IkcTimeline().load(json[key][ikc_key])));
                                });
                                break;
                            case "transform":
                                Object.keys(json[key] || {}).forEach((xfc_key) => {
                                    this._expandTimeline(this.xfc_timeline_map.set(xfc_key, new XfcTimeline().load(json[key][xfc_key])));
                                });
                                break;
                            case "paths":
                                Object.keys(json[key] || {}).forEach((ptc_key) => {
                                    this._expandTimeline(this.ptc_timeline_map.set(ptc_key, new PtcTimeline().load(json[key][ptc_key])));
                                });
                                break;
                            case "deform":
                            case "ffd":
                                Object.keys(json[key] || {}).forEach((ffd_key) => {
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
                drop() {
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
                load(json) {
                    this.bones.clear();
                    this.ikcs.clear();
                    this.xfcs.clear();
                    this.ptcs.clear();
                    this.slots.clear();
                    this.skins.clear();
                    this.events.clear();
                    this.anims.clear();
                    Object.keys(json || {}).forEach((key) => {
                        switch (key) {
                            case "skeleton":
                                this.skeleton.load(json[key]);
                                break;
                            case "bones":
                                json[key].forEach((bone_json, bone_index) => {
                                    this.bones.set(bone_json.name, new Bone().load(bone_json));
                                });
                                break;
                            case "ik":
                                json[key].forEach((ikc_json, ikc_index) => {
                                    this.ikcs.set(ikc_json.name, new Ikc().load(ikc_json));
                                });
                                // sort by order
                                this.ikcs.keys.sort((a, b) => {
                                    const ikc_a = this.ikcs.get(a);
                                    const ikc_b = this.ikcs.get(b);
                                    return (ikc_a && ikc_a.order || 0) - (ikc_b && ikc_b.order || 0);
                                });
                                break;
                            case "transform":
                                json[key].forEach((xfc_json, xfc_index) => {
                                    this.xfcs.set(xfc_json.name, new Xfc().load(xfc_json));
                                });
                                // sort by order
                                this.xfcs.keys.sort((a, b) => {
                                    const xfc_a = this.xfcs.get(a);
                                    const xfc_b = this.xfcs.get(b);
                                    return (xfc_a && xfc_a.order || 0) - (xfc_b && xfc_b.order || 0);
                                });
                                break;
                            case "path":
                                json[key].forEach((ptc_json, ptc_index) => {
                                    this.ptcs.set(ptc_json.name, new Ptc().load(ptc_json));
                                });
                                // sort by order
                                this.ptcs.keys.sort((a, b) => {
                                    const ptc_a = this.ptcs.get(a);
                                    const ptc_b = this.ptcs.get(b);
                                    return (ptc_a && ptc_a.order || 0) - (ptc_b && ptc_b.order || 0);
                                });
                                break;
                            case "slots":
                                json[key].forEach((slot_json, slot_index) => {
                                    this.slots.set(slot_json.name, new Slot().load(slot_json));
                                });
                                break;
                            case "skins":
                                Object.keys(json[key]).forEach((skin_key) => {
                                    const skin = this.skins.set(skin_key, new Skin().load(json[key][skin_key]));
                                    skin.name = skin.name || skin_key;
                                });
                                break;
                            case "events":
                                Object.keys(json[key]).forEach((event_key) => {
                                    const event = this.events.set(event_key, new Event().load(json[key][event_key]));
                                    event.name = event.name || event_key;
                                });
                                break;
                            case "animations":
                                Object.keys(json[key]).forEach((anim_key) => {
                                    const anim = this.anims.set(anim_key, new Animation().load(json[key][anim_key]));
                                    anim.name = anim.name || anim_key;
                                });
                                break;
                            default:
                                console.log("TODO: Skeleton::load", key);
                                break;
                        }
                    });
                    this.iterateBones((bone_key, bone) => {
                        Bone.flatten(bone, this.bones);
                    });
                    return this;
                }
                loadSkeleton(json) {
                    this.skeleton.load(json);
                    return this;
                }
                loadEvent(name, json) {
                    const event = new Event().load(json);
                    event.name = event.name || name;
                    this.events.set(name, event);
                    return this;
                }
                loadAnimation(name, json) {
                    const anim = new Animation().load(json);
                    anim.name = anim.name || name;
                    this.anims.set(name, anim);
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
                    this.bones.forEach((data_bone, bone_key) => {
                        callback(bone_key, data_bone);
                    });
                }
                iterateAttachments(skin_key, callback) {
                    const skin = this.skins.get(skin_key);
                    const default_skin = this.skins.get("default");
                    this.slots.forEach((data_slot, slot_key) => {
                        const skin_slot = (skin && skin.slots.get(slot_key)) || (default_skin && default_skin.slots.get(slot_key));
                        let attachment = skin_slot && skin_slot.attachments.get(data_slot.attachment_key);
                        let attachment_key = (attachment && attachment.name) || data_slot.attachment_key;
                        if (attachment && (attachment.type === "linkedmesh")) {
                            attachment_key = attachment.parent_key;
                            attachment = skin_slot && skin_slot.attachments.get(attachment_key);
                        }
                        callback(slot_key, data_slot, skin_slot, attachment_key, attachment);
                    });
                }
                iterateSkins(callback) {
                    this.skins.forEach((skin, skin_key) => {
                        callback(skin_key, skin);
                    });
                }
                iterateEvents(callback) {
                    this.events.forEach((event, event_key) => {
                        callback(event_key, event);
                    });
                }
                iterateAnims(callback) {
                    this.anims.forEach((anim, anim_key) => {
                        callback(anim_key, anim);
                    });
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
                    this.events = [];
                    this.data = data;
                }
                drop() {
                    this.bones.clear();
                    this.slots.clear();
                    this.events.length = 0;
                    return this;
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
                }
                getAnims() {
                    return this.data.anims;
                }
                curAnim() {
                    return this.data.anims.get(this.anim_key);
                }
                curAnimLength() {
                    const anim = this.data.anims.get(this.anim_key);
                    return (anim && anim.length) || 0;
                }
                getAnim() {
                    return this.anim_key;
                }
                setAnim(anim_key) {
                    if (this.anim_key !== anim_key) {
                        this.anim_key = anim_key;
                        const anim = this.data.anims.get(this.anim_key);
                        if (anim) {
                            this.time = wrap(this.time, anim.min_time, anim.max_time);
                        }
                        this.prev_time = this.time;
                        this.elapsed_time = 0;
                        this.dirty = true;
                    }
                }
                getTime() {
                    return this.time;
                }
                setTime(time) {
                    const anim = this.data.anims.get(this.anim_key);
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
                _strikeBones(anim) {
                    this.data.bones.forEach((data_bone, bone_key) => {
                        const pose_bone = this.bones.get(bone_key) || this.bones.set(bone_key, new Bone());
                        // start with a copy of the data bone
                        pose_bone.copy(data_bone);
                        // tween anim bone if keyframes are available
                        const bone_timeline = anim && anim.bone_timeline_map.get(bone_key);
                        if (bone_timeline) {
                            Keyframe.evaluate(bone_timeline.position_keyframes, this.time, (keyframe0, keyframe1, k) => {
                                const pct = keyframe0.curve.evaluate(k);
                                pose_bone.local_space.position.x += tween(keyframe0.position.x, keyframe1.position.x, pct);
                                pose_bone.local_space.position.y += tween(keyframe0.position.y, keyframe1.position.y, pct);
                            });
                            Keyframe.evaluate(bone_timeline.rotation_keyframes, this.time, (keyframe0, keyframe1, k) => {
                                const pct = keyframe0.curve.evaluate(k);
                                pose_bone.local_space.rotation.rad += tweenAngleRadians(keyframe0.rotation.rad, keyframe1.rotation.rad, pct);
                            });
                            Keyframe.evaluate(bone_timeline.scale_keyframes, this.time, (keyframe0, keyframe1, k) => {
                                const pct = keyframe0.curve.evaluate(k);
                                pose_bone.local_space.scale.a *= tween(keyframe0.scale.a, keyframe1.scale.a, pct);
                                pose_bone.local_space.scale.d *= tween(keyframe0.scale.d, keyframe1.scale.d, pct);
                            });
                            Keyframe.evaluate(bone_timeline.shear_keyframes, this.time, (keyframe0, keyframe1, k) => {
                                const pct = keyframe0.curve.evaluate(k);
                                pose_bone.local_space.shear.x.rad += tweenAngleRadians(keyframe0.shear.x.rad, keyframe1.shear.x.rad, pct);
                                pose_bone.local_space.shear.y.rad += tweenAngleRadians(keyframe0.shear.y.rad, keyframe1.shear.y.rad, pct);
                            });
                        }
                    });
                    this.iterateBones((bone_key, bone) => {
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
                            Keyframe.evaluate(ikc_timeline.ikc_keyframes, this.time, (keyframe0, keyframe1, k) => {
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
                                ///const px: number = parent.local_space.position.x;
                                ///const py: number = parent.local_space.position.y;
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
                    this.iterateBones((bone_key, bone) => {
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
                            Keyframe.evaluate(xfc_timeline.xfc_keyframes, this.time, (keyframe0, keyframe1, k) => {
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
                        ///let degRadReflect = ta * td - tb * tc > 0 ? MathUtils.degRad : -MathUtils.degRad;
                        ///let offsetRotation = this.data.offsetRotation * degRadReflect;
                        ///let offsetShearY = this.data.offsetShearY * degRadReflect;
                        xfc.bone_keys.forEach((bone_key) => {
                            const xfc_bone = this.bones.get(bone_key);
                            if (!xfc_bone)
                                return;
                            if (xfc_position_mix !== 0) {
                                ///let temp = this.temp;
                                ///xfc_target.localToWorld(temp.set(xfc_position.x, xfc_position.y));
                                ///xfc_bone.world_space.affine.vector.x += (temp.x - xfc_bone.world_space.affine.vector.x) * xfc_position_mix;
                                ///xfc_bone.world_space.affine.vector.y += (temp.y - xfc_bone.world_space.affine.vector.y) * xfc_position_mix;
                                const xfc_world_position = Space.transform(xfc_target.world_space, xfc_position, new Vector());
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
                            Keyframe.evaluate(slot_timeline.color_keyframes, this.time, (keyframe0, keyframe1, k) => {
                                keyframe0.color.tween(keyframe1.color, keyframe0.curve.evaluate(k), pose_slot.color);
                            });
                            Keyframe.evaluate(slot_timeline.attachment_keyframes, this.time, (keyframe0, keyframe1, k) => {
                                // no tweening attachments
                                pose_slot.attachment_key = keyframe0.name;
                            });
                        }
                    });
                    this.data.slots.keys.forEach((key, index) => { this.slots.keys[index] = key; });
                    const order_timeline = anim && anim.order_timeline;
                    if (order_timeline) {
                        Keyframe.evaluate(order_timeline.order_keyframes, this.time, (keyframe0, keyframe1, k) => {
                            keyframe0.slot_offsets.forEach((slot_offset) => {
                                const slot_index = this.slots.keys.indexOf(slot_offset.slot_key);
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
                            Keyframe.evaluate(ptc_timeline.ptc_mix_keyframes, this.time, (keyframe0, keyframe1, k) => {
                                const pct = keyframe0.curve.evaluate(k);
                                ptc_position_mix = tween(keyframe0.position_mix, keyframe1.position_mix, pct);
                                ptc_rotation_mix = tween(keyframe0.rotation_mix, keyframe1.rotation_mix, pct);
                            });
                            Keyframe.evaluate(ptc_timeline.ptc_spacing_keyframes, this.time, (keyframe0, keyframe1, k) => {
                                ptc_spacing = tween(keyframe0.spacing, keyframe1.spacing, keyframe0.curve.evaluate(k));
                            });
                            Keyframe.evaluate(ptc_timeline.ptc_position_keyframes, this.time, (keyframe0, keyframe1, k) => {
                                ptc_position = tween(keyframe0.position, keyframe1.position, keyframe0.curve.evaluate(k));
                            });
                            Keyframe.evaluate(ptc_timeline.ptc_rotation_keyframes, this.time, (keyframe0, keyframe1, k) => {
                                ptc_rotation.rad = tweenAngleRadians(keyframe0.rotation.rad, keyframe1.rotation.rad, keyframe0.curve.evaluate(k));
                            });
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
                _strikeEvents(anim) {
                    this.events.length = 0;
                    if (anim && anim.event_timeline) {
                        const make_event = (event_keyframe) => {
                            const pose_event = new Event();
                            const data_event = this.data.events.get(event_keyframe.name);
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
                                anim.event_timeline.event_keyframes.forEach((event_keyframe) => {
                                    if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time < this.prev_time)) ||
                                        ((this.time <= event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
                                        this.events.push(make_event(event_keyframe));
                                    }
                                });
                            }
                            else {
                                // min       time          prev_time    max
                                //  |         |                |         |
                                //            o<---------------x
                                // all events between time and prev_time, not including prev_time
                                anim.event_timeline.event_keyframes.forEach((event_keyframe) => {
                                    if ((this.time <= event_keyframe.time) && (event_keyframe.time < this.prev_time)) {
                                        this.events.push(make_event(event_keyframe));
                                    }
                                });
                            }
                        }
                        else {
                            if (this.wrapped_max) {
                                // min       time          prev_time    max
                                //  |         |                |         |
                                //  --------->o                x----------
                                // all events between prev_time and max_time, not including prev_time
                                // all events between min_time and time
                                anim.event_timeline.event_keyframes.forEach((event_keyframe) => {
                                    if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time <= this.time)) ||
                                        ((this.prev_time < event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
                                        this.events.push(make_event(event_keyframe));
                                    }
                                });
                            }
                            else {
                                // min    prev_time           time      max
                                //  |         |                |         |
                                //            x--------------->o
                                // all events between prev_time and time, not including prev_time
                                anim.event_timeline.event_keyframes.forEach((event_keyframe) => {
                                    if ((this.prev_time < event_keyframe.time) && (event_keyframe.time <= this.time)) {
                                        this.events.push(make_event(event_keyframe));
                                    }
                                });
                            }
                        }
                    }
                }
                iterateBones(callback) {
                    this.bones.forEach((bone, bone_key) => {
                        callback(bone_key, bone);
                    });
                }
                iterateAttachments(callback) {
                    const skin = this.data.skins.get(this.skin_key);
                    const default_skin = this.data.skins.get("default");
                    this.slots.forEach((pose_slot, slot_key) => {
                        const skin_slot = (skin && skin.slots.get(slot_key)) || (default_skin && default_skin.slots.get(slot_key));
                        let attachment = skin_slot && skin_slot.attachments.get(pose_slot.attachment_key);
                        let attachment_key = (attachment && attachment.name) || pose_slot.attachment_key;
                        if (attachment && (attachment.type === "linkedmesh")) {
                            attachment_key = attachment.parent_key;
                            attachment = skin_slot && skin_slot.attachments.get(attachment_key);
                        }
                        callback(slot_key, pose_slot, skin_slot, attachment_key, attachment);
                    });
                }
            };
            exports_1("Pose", Pose);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwQkc7OztJQXdFSCxrQkFBeUIsSUFBUyxFQUFFLEdBQW9CLEVBQUUsTUFBZSxLQUFLO1FBQzVFLE1BQU0sS0FBSyxHQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsQ0FBQyxPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLEtBQUssUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEtBQUssS0FBSyxNQUFNLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQ3hELEtBQUssU0FBUyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDN0IsU0FBUyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ3RCLENBQUM7SUFDSCxDQUFDOztJQUVELGtCQUF5QixJQUFTLEVBQUUsR0FBb0IsRUFBRSxLQUFjLEVBQUUsTUFBZSxLQUFLO1FBQzVGLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLENBQUM7SUFDSCxDQUFDOztJQUVELG1CQUEwQixJQUFTLEVBQUUsR0FBb0IsRUFBRSxNQUFjLENBQUM7UUFDeEUsTUFBTSxLQUFLLEdBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxDQUFDLE9BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsS0FBSyxRQUFRLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QyxLQUFLLFFBQVEsRUFBRSxNQUFN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QUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7b0JBQUMsQ0FBQztvQkFDckQsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztvQkFBQyxDQUFDO29CQUNsRCxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsWUFBWSxFQUFFLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNoRSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNyQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNuRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNuRSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsVUFB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QUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDdkcsQ0FBQyxDQUFDLENBQUM7Z0NBQ0gsS0FBSyxDQUFDOzRCQUNSLEtBQUssV0FBVztnQ0FDZCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFlO29DQUNuRCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDdkcsQ0FBQyxDQUFDLENBQUM7Z0NBQ0gsS0FBSyxDQUFDOzRCQUNSLEtBQUssT0FBTztnQ0FDVixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFlO29DQUNuRCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDdkcsQ0FBQyxDQUFDLENBQUM7Z0NBQ0gsS0FBSyxDQUFDOzRCQUNSLEtBQUssUUFBUSxDQUFDOzRCQUFDLEtBQUssS0FBSztnQ0FDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBZTtvQ0FDbkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ3RFLENBQUMsQ0FBQyxDQUFDO2dDQUNILEtBQUssQ0FBQzs0QkFDUjtnQ0FDRSxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxDQUFDO2dDQUMxQyxLQUFLLENBQUM7d0JBQ1YsQ0FBQztvQkFDSCxDQUFDLENBQUMsQ0FBQztvQkFFSCxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNkLENBQUM7YUFDRixDQUFBOztZQVVELFdBQUE7Z0JBQUE7b0JBQ1MsU0FBSSxHQUFXLEVBQUUsQ0FBQztvQkFDbEIsVUFBSyxHQUFXLEVBQUUsQ0FBQztvQkFDbkIsVUFBSyxHQUFXLENBQUMsQ0FBQztvQkFDbEIsV0FBTSxHQUFXLENBQUMsQ0FBQztvQkFDbkIsV0FBTSxHQUFXLEVBQUUsQ0FBQztnQkFVN0IsQ0FBQztnQkFSUSxJQUFJLENBQUMsSUFBa0I7b0JBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ3pDLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzNDLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZDLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLElBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQzthQUNGLENBQUE7O1lBY0QsT0FBQTtnQkFBQTtvQkFDUyxTQUFJLEdBQVcsRUFBRSxDQUFDO29CQUNsQixhQUFRLEdBQWEsSUFBSSxRQUFRLEVBQUUsQ0FBQztvQkFDcEMsVUFBSyxHQUEyQixJQUFJLFFBQVEsRUFBZ0IsQ0FBQztvQkFDN0QsU0FBSSxHQUEwQixJQUFJLFFBQVEsRUFBZSxDQUFDO29CQUMxRCxTQUFJLEdBQTBCLElBQUksUUFBUSxFQUFlLENBQUM7b0JBQzFELFNBQUksR0FBMEIsSUFBSSxRQUFRLEVBQWUsQ0FBQztvQkFDMUQsVUFBSyxHQUEyQixJQUFJLFFBQVEsRUFBZ0IsQ0FBQztvQkFDN0QsVUFBSyxHQUEyQixJQUFJLFFBQVEsRUFBZ0IsQ0FBQztvQkFDN0QsV0FBTSxHQUE0QixJQUFJLFFBQVEsRUFBaUIsQ0FBQztvQkFDaEUsVUFBSyxHQUFnQyxJQUFJLFFBQVEsRUFBcUIsQ0FBQztnQkE0S2hGLENBQUM7Z0JBMUtRLElBQUk7b0JBQ1QsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDZCxDQUFDO2dCQUVNLElBQUksQ0FBQyxJQUFjO29CQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUVuQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFXO3dCQUMxQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOzRCQUNaLEtBQUssVUFBVTtnQ0FDYixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQ0FDOUIsS0FBSyxDQUFDOzRCQUNSLEtBQUssT0FBTztnQ0FDVixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBbUIsRUFBRSxVQUFrQjtvQ0FDeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dDQUM3RCxDQUFDLENBQUMsQ0FBQztnQ0FDSCxLQUFLLENBQUM7NEJBQ1IsS0FBSyxJQUFJO2dDQUNQLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFpQixFQUFFLFNBQWlCO29DQUNyRCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0NBQ3pELENBQUMsQ0FBQyxDQUFDO2dDQUNILGdCQUFnQjtnQ0FDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBUyxFQUFFLENBQVM7b0NBQ3ZDLE1BQU0sS0FBSyxHQUFvQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQ0FDaEQsTUFBTSxLQUFLLEdBQW9CLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29DQUNoRCxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dDQUNuRSxDQUFDLENBQUMsQ0FBQztnQ0FDSCxLQUFLLENBQUM7NEJBQ1IsS0FBSyxXQUFXO2dDQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFpQixFQUFFLFNBQWlCO29DQUNyRCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0NBQ3pELENBQUMsQ0FBQyxDQUFDO2dDQUNILGdCQUFnQjtnQ0FDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBUyxFQUFFLENBQVM7b0NBQ3ZDLE1BQU0sS0FBSyxHQUFvQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQ0FDaEQsTUFBTSxLQUFLLEdBQW9CLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29DQUNoRCxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dDQUNuRSxDQUFDLENBQUMsQ0FBQztnQ0FDSCxLQUFLLENBQUM7NEJBQ1IsS0FBSyxNQUFNO2dDQUNULElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFpQixFQUFFLFNBQWlCO29DQUNyRCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0NBQ3pELENBQUMsQ0FBQyxDQUFDO2dDQUNILGdCQUFnQjtnQ0FDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBUyxFQUFFLENBQVM7b0NBQ3ZDLE1BQU0sS0FBSyxHQUFvQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQ0FDaEQsTUFBTSxLQUFLLEdBQW9CLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29DQUNoRCxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dDQUNuRSxDQUFDLENBQUMsQ0FBQztnQ0FDSCxLQUFLLENBQUM7NEJBQ1IsS0FBSyxPQUFPO2dDQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFtQixFQUFFLFVBQWtCO29DQUN4RCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0NBQzdELENBQUMsQ0FBQyxDQUFDO2dDQUNILEtBQUssQ0FBQzs0QkFDUixLQUFLLE9BQU87Z0NBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFnQjtvQ0FDOUMsTUFBTSxJQUFJLEdBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7b0NBQ2xGLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxRQUFRLENBQUM7Z0NBQ3BDLENBQUMsQ0FBQyxDQUFDO2dDQUNILEtBQUssQ0FBQzs0QkFDUixLQUFLLFFBQVE7Z0NBQ1gsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFpQjtvQ0FDL0MsTUFBTSxLQUFLLEdBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7b0NBQ3hGLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUM7Z0NBQ3ZDLENBQUMsQ0FBQyxDQUFDO2dDQUNILEtBQUssQ0FBQzs0QkFDUixLQUFLLFlBQVk7Z0NBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFnQjtvQ0FDOUMsTUFBTSxJQUFJLEdBQWMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7b0NBQzVGLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxRQUFRLENBQUM7Z0NBQ3BDLENBQUMsQ0FBQyxDQUFDO2dDQUNILEtBQUssQ0FBQzs0QkFDUjtnQ0FDRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLEdBQUcsQ0FBQyxDQUFDO2dDQUN6QyxLQUFLLENBQUM7d0JBQ1YsQ0FBQztvQkFDSCxDQUFDLENBQUMsQ0FBQztvQkFFSCxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBZ0IsRUFBRSxJQUFVO3dCQUM3QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2pDLENBQUMsQ0FBQyxDQUFDO29CQUVILE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQztnQkFFTSxZQUFZLENBQUMsSUFBa0I7b0JBQ3BDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNkLENBQUM7Z0JBRU0sU0FBUyxDQUFDLElBQVksRUFBRSxJQUFlO29CQUM1QyxNQUFNLEtBQUssR0FBVSxJQUFJLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDNUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztvQkFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNkLENBQUM7Z0JBRU0sYUFBYSxDQUFDLElBQVksRUFBRSxJQUFtQjtvQkFDcEQsTUFBTSxJQUFJLEdBQWMsSUFBSSxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ25ELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7b0JBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDZCxDQUFDO2dCQUVNLFFBQVE7b0JBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3BCLENBQUM7Z0JBRU0sU0FBUztvQkFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDckIsQ0FBQztnQkFFTSxRQUFRO29CQUNiLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUNwQixDQUFDO2dCQUVNLFlBQVksQ0FBQyxRQUFnRDtvQkFDbEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFlLEVBQUUsUUFBZ0I7d0JBQ25ELFFBQVEsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQ2hDLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUM7Z0JBRU0sa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxRQUFrSjtvQkFDNUwsTUFBTSxJQUFJLEdBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN4RCxNQUFNLFlBQVksR0FBcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2pFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBZSxFQUFFLFFBQWdCO3dCQUNuRCxNQUFNLFNBQVMsR0FBeUIsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUNqSSxJQUFJLFVBQVUsR0FBMkIsU0FBUyxJQUFJLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQzt3QkFDMUcsSUFBSSxjQUFjLEdBQVcsQ0FBQyxVQUFVLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQyxjQUFjLENBQUM7d0JBQ3pGLEVBQUUsQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNyRCxjQUFjLEdBQTBCLFVBQVcsQ0FBQyxVQUFVLENBQUM7NEJBQy9ELFVBQVUsR0FBRyxTQUFTLElBQUksU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7d0JBQ3RFLENBQUM7d0JBQ0QsUUFBUSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDdkUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQztnQkFFTSxZQUFZLENBQUMsUUFBZ0Q7b0JBQ2xFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBVSxFQUFFLFFBQWdCO3dCQUM5QyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUMzQixDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO2dCQUVNLGFBQWEsQ0FBQyxRQUFtRDtvQkFDdEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFZLEVBQUUsU0FBaUI7d0JBQ2xELFFBQVEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzdCLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUM7Z0JBRU0sWUFBWSxDQUFDLFFBQXFEO29CQUN2RSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQWUsRUFBRSxRQUFnQjt3QkFDbkQsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDM0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQzthQUNGLENBQUE7O1lBRUQsT0FBQTtnQkFjRSxZQUFZLElBQVU7b0JBWmYsYUFBUSxHQUFXLEVBQUUsQ0FBQztvQkFDdEIsYUFBUSxHQUFXLEVBQUUsQ0FBQztvQkFDdEIsU0FBSSxHQUFXLENBQUMsQ0FBQztvQkFDakIsY0FBUyxHQUFXLENBQUMsQ0FBQztvQkFDdEIsaUJBQVksR0FBVyxDQUFDLENBQUM7b0JBQ3pCLGdCQUFXLEdBQVksS0FBSyxDQUFDO29CQUM3QixnQkFBVyxHQUFZLEtBQUssQ0FBQztvQkFDN0IsVUFBSyxHQUFZLElBQUksQ0FBQztvQkFDdEIsVUFBSyxHQUEyQixJQUFJLFFBQVEsRUFBZ0IsQ0FBQztvQkFDN0QsVUFBSyxHQUEyQixJQUFJLFFBQVEsRUFBZ0IsQ0FBQztvQkFDN0QsV0FBTSxHQUFZLEVBQUUsQ0FBQztvQkFHMUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ25CLENBQUM7Z0JBRU0sSUFBSTtvQkFDVCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQztnQkFFTSxPQUFPO29CQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDNUIsQ0FBQztnQkFFTSxRQUFRO29CQUNiLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDekIsQ0FBQztnQkFFTSxPQUFPO29CQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1QyxDQUFDO2dCQUVNLE9BQU87b0JBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBRU0sT0FBTyxDQUFDLFFBQWdCO29CQUM3QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO29CQUMzQixDQUFDO2dCQUNILENBQUM7Z0JBRU0sUUFBUTtvQkFDYixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3pCLENBQUM7Z0JBRU0sT0FBTztvQkFDWixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDNUMsQ0FBQztnQkFFTSxhQUFhO29CQUNsQixNQUFNLElBQUksR0FBMEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDdkUsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7Z0JBRU0sT0FBTztvQkFDWixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDdkIsQ0FBQztnQkFFTSxPQUFPLENBQUMsUUFBZ0I7b0JBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDL0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7d0JBQ3pCLE1BQU0sSUFBSSxHQUEwQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUN2RSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzRCQUNULElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQzVELENBQUM7d0JBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUMzQixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQzt3QkFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7b0JBQ3BCLENBQUM7Z0JBQ0gsQ0FBQztnQkFFTSxPQUFPO29CQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNuQixDQUFDO2dCQUVNLE9BQU8sQ0FBQyxJQUFZO29CQUN6QixNQUFNLElBQUksR0FBMEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDdkUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDVCxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDbEQsQ0FBQztvQkFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQ3ZCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO3dCQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQzNCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO3dCQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztvQkFDcEIsQ0FBQztnQkFDSCxDQUFDO2dCQUVNLE1BQU0sQ0FBQyxZQUFvQjtvQkFDaEMsSUFBSSxDQUFDLFlBQVksSUFBSSxZQUFZLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNwQixDQUFDO2dCQUVNLE1BQU07b0JBQ1gsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzt3QkFDaEIsTUFBTSxDQUFDO29CQUNULENBQUM7b0JBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7b0JBRW5CLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLHFCQUFxQjtvQkFDakQsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsMEJBQTBCO29CQUUxRCxNQUFNLElBQUksR0FBMEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDdkUsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7b0JBQ3pCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO29CQUN6QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUNULElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQzNFLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQzNFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzVELENBQUM7b0JBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGdDQUFnQztvQkFDeEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLHdCQUF3QjtvQkFDaEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLG1CQUFtQjtvQkFDM0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFekIsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQyxxQ0FBcUM7Z0JBQzlELENBQUM7Z0JBRU8sWUFBWSxDQUFDLElBQTJCO29CQUM5QyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFlLEVBQUUsUUFBZ0I7d0JBQ3hELE1BQU0sU0FBUyxHQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7d0JBRXpGLHFDQUFxQzt3QkFDckMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFFMUIsNkNBQTZDO3dCQUM3QyxNQUFNLGFBQWEsR0FBNkIsSUFBSSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQzdGLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7NEJBQ2xCLFFBQVEsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUErQixFQUFFLFNBQStCLEVBQUUsQ0FBUztnQ0FDekksTUFBTSxHQUFHLEdBQVcsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ2hELFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0NBQzNGLFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQzdGLENBQUMsQ0FBQyxDQUFDOzRCQUVILFFBQVEsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUErQixFQUFFLFNBQStCLEVBQUUsQ0FBUztnQ0FDekksTUFBTSxHQUFHLEdBQVcsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ2hELFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDL0csQ0FBQyxDQUFDLENBQUM7NEJBRUgsUUFBUSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUE0QixFQUFFLFNBQTRCLEVBQUUsQ0FBUztnQ0FDaEksTUFBTSxHQUFHLEdBQVcsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ2hELFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0NBQ2xGLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ3BGLENBQUMsQ0FBQyxDQUFDOzRCQUVILFFBQVEsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBNEIsRUFBRSxTQUE0QixFQUFFLENBQVM7Z0NBQ2hJLE1BQU0sR0FBRyxHQUFXLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUNoRCxTQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0NBQzFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDNUcsQ0FBQyxDQUFDLENBQUM7d0JBQ0wsQ0FBQztvQkFDSCxDQUFDLENBQUMsQ0FBQztvQkFFSCxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBZ0IsRUFBRSxJQUFVO3dCQUM3QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2pDLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUM7Z0JBRU8sV0FBVyxDQUFDLElBQTJCO29CQUM3QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFRLEVBQUUsT0FBZTt3QkFDL0MsTUFBTSxVQUFVLEdBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDcEUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7NEJBQUMsTUFBTSxDQUFDO3dCQUN4QixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBRXJDLElBQUksT0FBTyxHQUFXLEdBQUcsQ0FBQyxHQUFHLENBQUM7d0JBQzlCLElBQUksaUJBQWlCLEdBQVksR0FBRyxDQUFDLGFBQWEsQ0FBQzt3QkFFbkQsTUFBTSxZQUFZLEdBQTRCLElBQUksSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUN6RixFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDOzRCQUNqQixRQUFRLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQXNCLEVBQUUsU0FBc0IsRUFBRSxDQUFTO2dDQUNqSCxPQUFPLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUMzRSxnQ0FBZ0M7Z0NBQ2hDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUM7NEJBQzlDLENBQUMsQ0FBQyxDQUFDO3dCQUNMLENBQUM7d0JBRUQsTUFBTSxLQUFLLEdBQVcsT0FBTyxDQUFDO3dCQUM5QixNQUFNLE9BQU8sR0FBVyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRXpELEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNoQixNQUFNLENBQUM7d0JBQ1QsQ0FBQzt3QkFFRCxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7NEJBQzdCLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0NBQ1AsTUFBTSxJQUFJLEdBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDaEUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0NBQUMsTUFBTSxDQUFDO2dDQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0NBQy9CLElBQUksRUFBRSxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQzlKLE1BQU0sV0FBVyxHQUFxQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0NBQ3RFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0NBQ2hCLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQ0FDdEMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7d0NBQzFELEVBQUUsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7b0NBQzdDLENBQUM7b0NBQUMsSUFBSSxDQUFDLENBQUM7d0NBQ04sRUFBRSxJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztvQ0FDN0MsQ0FBQztnQ0FDSCxDQUFDO2dDQUNELElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dDQUM1RixLQUFLLENBQUM7NEJBQ1IsQ0FBQzs0QkFDRCxLQUFLLENBQUMsRUFBRSxDQUFDO2dDQUNQLE1BQU0sTUFBTSxHQUFxQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ2xFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO29DQUFDLE1BQU0sQ0FBQztnQ0FDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dDQUNqQyxNQUFNLEtBQUssR0FBcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUNqRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztvQ0FBQyxNQUFNLENBQUM7Z0NBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQ0FDaEMsb0RBQW9EO2dDQUNwRCxvREFBb0Q7Z0NBQ3BELElBQUksR0FBRyxHQUFXLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQ0FDN0MsSUFBSSxHQUFHLEdBQVcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dDQUM3QyxJQUFJLEVBQUUsR0FBVyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0NBQzlDLElBQUksR0FBRyxHQUFXLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQ0FDNUMsSUFBSSxPQUFPLEdBQVcsQ0FBQyxFQUFFLE9BQU8sR0FBVyxDQUFDLEVBQUUsS0FBSyxHQUFXLENBQUMsQ0FBQztnQ0FDaEUsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0NBQ1osR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO29DQUNYLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO29DQUNsQixLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0NBQ2IsQ0FBQztnQ0FDRCxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQ0FDWixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7b0NBQ1gsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDO2dDQUNqQixDQUFDO2dDQUNELEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29DQUNaLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztvQ0FDWCxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQ0FDcEIsQ0FBQztnQ0FDRCxNQUFNLENBQUMsR0FBVyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztnQ0FDN0UsTUFBTSxDQUFDLEdBQVcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0NBQ3hFLE1BQU0sRUFBRSxHQUFxQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0NBQy9ELEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0NBQ1AsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29DQUM3QixLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29DQUN4QyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dDQUMxQyxDQUFDO2dDQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dDQUNuRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztnQ0FDbkQsTUFBTSxFQUFFLEdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDekMsTUFBTSxFQUFFLEdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDekMsSUFBSSxFQUFFLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQVcsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUUsRUFBVSxFQUFFLEVBQVUsQ0FBQztnQ0FDdkcsS0FBSyxFQUNMLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0NBQ2xDLEVBQUUsSUFBSSxHQUFHLENBQUM7b0NBQ1YsSUFBSSxHQUFHLEdBQVcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO29DQUMxRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0NBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO29DQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO3dDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRO29DQUMzRCxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7b0NBQzlCLE1BQU0sR0FBRyxHQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO29DQUNsQyxNQUFNLEdBQUcsR0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQ0FDdEMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENB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