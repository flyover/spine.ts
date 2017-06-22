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
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __moduleName = context_1 && context_1.id;
    function loadBool(json, key, def) {
        if (def === void 0) { def = false; }
        var value = json[key];
        switch (typeof (value)) {
            case "string": return (value === "true") ? true : false;
            case "boolean": return value;
            default: return def;
        }
    }
    exports_1("loadBool", loadBool);
    function saveBool(json, key, value, def) {
        if (def === void 0) { def = false; }
        if ((typeof (def) !== "boolean") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveBool", saveBool);
    function loadFloat(json, key, def) {
        if (def === void 0) { def = 0; }
        var value = json[key];
        switch (typeof (value)) {
            case "string": return parseFloat(value);
            case "number": return value;
            default: return def;
        }
    }
    exports_1("loadFloat", loadFloat);
    function saveFloat(json, key, value, def) {
        if (def === void 0) { def = 0; }
        if ((typeof (def) !== "number") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveFloat", saveFloat);
    function loadInt(json, key, def) {
        if (def === void 0) { def = 0; }
        var value = json[key];
        switch (typeof (value)) {
            case "string": return parseInt(value, 10);
            case "number": return 0 | value;
            default: return def;
        }
    }
    exports_1("loadInt", loadInt);
    function saveInt(json, key, value, def) {
        if (def === void 0) { def = 0; }
        if ((typeof (def) !== "number") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveInt", saveInt);
    function loadString(json, key, def) {
        if (def === void 0) { def = ""; }
        var value = json[key];
        switch (typeof (value)) {
            case "string": return value;
            default: return def;
        }
    }
    exports_1("loadString", loadString);
    function saveString(json, key, value, def) {
        if (def === void 0) { def = ""; }
        if ((typeof (def) !== "string") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveString", saveString);
    // from: http://github.com/arian/cubic-bezier
    function BezierCurve(x1, y1, x2, y2, epsilon) {
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
        if (epsilon === void 0) { epsilon = EPSILON; }
        /*
      
        B(t) = P0*(1-t)^3 + 3*P1*(1-t)^2*t + 3*P2*(1-t)*t^2 + P3*t^3
        B'(t) = P0 - 3*(P0 - P1)*t + 3*(P0 - 2*P1 + P2)*t^2 - (P0 - 3*P1 + 3*P2 - P3)*t^3
      
        if P0:(0,0) and P3:(1,1)
        B(t) = 3*P1*(1-t)^2*t + 3*P2*(1-t)*t^2 + t^3
        B'(t) = 3*P1*t - 3*(2*P1 - P2)*t^2 + (3*P1 - 3*P2 + 1)*t^3
      
        */
        function curveX(t) {
            var t2 = t * t;
            var t3 = t2 * t;
            var v = 1 - t;
            var v2 = v * v;
            return 3 * x1 * v2 * t + 3 * x2 * v * t2 + t3;
        }
        function curveY(t) {
            var t2 = t * t;
            var t3 = t2 * t;
            var v = 1 - t;
            var v2 = v * v;
            return 3 * y1 * v2 * t + 3 * y2 * v * t2 + t3;
        }
        function derivativeCurveX(t) {
            var t2 = t * t;
            var t3 = t2 * t;
            return 3 * x1 * t - 3 * (2 * x1 - x2) * t2 + (3 * x1 - 3 * x2 + 1) * t3;
        }
        return function (percent) {
            var x = percent;
            var t0, t1, t2, x2, d2, i;
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
        var bezierSegments = 10;
        var subdiv_step = 1 / bezierSegments;
        var subdiv_step2 = subdiv_step * subdiv_step;
        var subdiv_step3 = subdiv_step2 * subdiv_step;
        var pre1 = 3 * subdiv_step;
        var pre2 = 3 * subdiv_step2;
        var pre4 = 6 * subdiv_step2;
        var pre5 = 6 * subdiv_step3;
        var tmp1x = -cx1 * 2 + cx2;
        var tmp1y = -cy1 * 2 + cy2;
        var tmp2x = (cx1 - cx2) * 3 + 1;
        var tmp2y = (cy1 - cy2) * 3 + 1;
        var curves_0 = (cx1 * pre1 + tmp1x * pre2 + tmp2x * subdiv_step3);
        var curves_1 = (cy1 * pre1 + tmp1y * pre2 + tmp2y * subdiv_step3);
        var curves_2 = (tmp1x * pre4 + tmp2x * pre5);
        var curves_3 = (tmp1y * pre4 + tmp2y * pre5);
        var curves_4 = (tmp2x * pre5);
        var curves_5 = (tmp2y * pre5);
        return function (percent) {
            var dfx = curves_0;
            var dfy = curves_1;
            var ddfx = curves_2;
            var ddfy = curves_3;
            var dddfx = curves_4;
            var dddfy = curves_5;
            var x = dfx, y = dfy;
            var i = bezierSegments - 2;
            while (true) {
                if (x >= percent) {
                    var lastX = x - dfx;
                    var lastY = y - dfy;
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
    var EPSILON, SpineMap, Color, Curve, Angle, Vector, Matrix, Affine, Position, Rotation, Scale, Shear, Space, Bone, Constraint, Ikc, Xfc, Ptc, Slot, Attachment, RegionAttachment, BoundingBoxAttachment, MeshAttachment, LinkedMeshAttachment, WeightedMeshAttachment, PathAttachment, SkinSlot, Skin, Event, Range, Keyframe, Timeline, CurveKeyframe, BonePositionKeyframe, BonePositionTimeline, BoneRotationKeyframe, BoneRotationTimeline, BoneScaleKeyframe, BoneScaleTimeline, BoneShearKeyframe, BoneShearTimeline, BoneTimeline, SlotColorKeyframe, SlotColorTimeline, SlotAttachmentKeyframe, SlotAttachmentTimeline, SlotTimeline, EventKeyframe, EventTimeline, SlotOffset, OrderKeyframe, OrderTimeline, IkcKeyframe, IkcTimeline, XfcKeyframe, XfcTimeline, PtcMixKeyframe, PtcMixTimeline, PtcSpacingKeyframe, PtcSpacingTimeline, PtcPositionKeyframe, PtcPositionTimeline, PtcRotationKeyframe, PtcRotationTimeline, PtcTimeline, FfdKeyframe, FfdTimeline, FfdAttachment, FfdSlot, FfdSkin, Animation, Skeleton, Data, Pose;
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
            SpineMap = (function () {
                function SpineMap() {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var _this = this;
                    this.keys = [];
                    this.map = new Map(args);
                    this.map.forEach(function (value, key) {
                        _this.keys.push(key);
                    });
                }
                SpineMap.prototype.clear = function () {
                    this.keys.length = 0;
                    this.map.clear();
                };
                SpineMap.prototype.has = function (key) {
                    return this.map.has(key);
                };
                SpineMap.prototype.hasByIndex = function (index) {
                    return this.has(this.keys[index]);
                };
                SpineMap.prototype.get = function (key) {
                    return this.map.get(key);
                };
                SpineMap.prototype.getByIndex = function (index) {
                    return this.get(this.keys[index]);
                };
                SpineMap.prototype.set = function (key, value) {
                    if (!this.map.has(key)) {
                        this.keys.push(key);
                    }
                    this.map.set(key, value);
                    return value;
                };
                SpineMap.prototype.setByIndex = function (index, value) {
                    return this.set(this.keys[index], value);
                };
                SpineMap.prototype.delete = function (key) {
                    this.keys.splice(this.keys.indexOf(key), 1);
                    this.map.delete(key);
                };
                SpineMap.prototype.deleteByIndex = function (index) {
                    this.delete(this.keys[index]);
                };
                SpineMap.prototype.forEach = function (callback) {
                    var _this = this;
                    this.keys.forEach(function (key, index, array) {
                        var value = _this.map.get(key);
                        if (!value)
                            throw new Error();
                        callback(value, key, index, _this);
                    });
                };
                return SpineMap;
            }());
            exports_1("Map", SpineMap);
            Color = (function () {
                function Color() {
                    this.r = 1;
                    this.g = 1;
                    this.b = 1;
                    this.a = 1;
                }
                Color.copy = function (color, out) {
                    if (out === void 0) { out = new Color(); }
                    out.r = color.r;
                    out.g = color.g;
                    out.b = color.b;
                    out.a = color.a;
                    return out;
                };
                Color.prototype.copy = function (other) {
                    return Color.copy(other, this);
                };
                Color.prototype.load = function (json, def) {
                    if (def === void 0) { def = 0xffffffff; }
                    var rgba = def;
                    if (typeof (json) === "string")
                        rgba = parseInt(json, 16);
                    if (typeof (json) === "number")
                        rgba = 0 | json;
                    this.r = ((rgba >> 24) & 0xff) / 0xff;
                    this.g = ((rgba >> 16) & 0xff) / 0xff;
                    this.b = ((rgba >> 8) & 0xff) / 0xff;
                    this.a = (rgba & 0xff) / 0xff;
                    return this;
                };
                Color.prototype.toString = function () {
                    return "rgba(" + (this.r * 255).toFixed(0) + "," + (this.g * 255).toFixed(0) + "," + (this.b * 255).toFixed(0) + "," + this.a + ")";
                };
                Color.tween = function (a, b, pct, out) {
                    if (out === void 0) { out = new Color(); }
                    out.r = tween(a.r, b.r, pct);
                    out.g = tween(a.g, b.g, pct);
                    out.b = tween(a.b, b.b, pct);
                    out.a = tween(a.a, b.a, pct);
                    return out;
                };
                Color.prototype.tween = function (other, pct, out) {
                    if (out === void 0) { out = new Color(); }
                    return Color.tween(this, other, pct, out);
                };
                Color.prototype.selfTween = function (other, pct) {
                    return Color.tween(this, other, pct, this);
                };
                return Color;
            }());
            exports_1("Color", Color);
            Curve = (function () {
                function Curve() {
                    this.evaluate = function (t) { return t; };
                }
                Curve.prototype.load = function (json) {
                    // default: linear
                    this.evaluate = function (t) { return t; };
                    if ((typeof (json) === "string") && (json === "stepped")) {
                        // stepped
                        this.evaluate = function (t) { return 0; };
                    }
                    else if ((typeof (json) === "object") && (typeof (json.length) === "number") && (json.length === 4)) {
                        // bezier
                        var x1 = loadFloat(json, 0, 0);
                        var y1 = loadFloat(json, 1, 0);
                        var x2 = loadFloat(json, 2, 1);
                        var y2 = loadFloat(json, 3, 1);
                        // curve.evaluate = BezierCurve(x1, y1, x2, y2);
                        this.evaluate = StepBezierCurve(x1, y1, x2, y2);
                    }
                    return this;
                };
                return Curve;
            }());
            exports_1("Curve", Curve);
            Angle = (function () {
                function Angle(rad) {
                    if (rad === void 0) { rad = 0; }
                    this._rad = 0;
                    this._cos = 1;
                    this._sin = 0;
                    this.rad = rad;
                }
                Object.defineProperty(Angle.prototype, "rad", {
                    get: function () { return this._rad; },
                    set: function (value) {
                        if (this._rad !== value) {
                            this._rad = value;
                            this._cos = Math.cos(value);
                            this._sin = Math.sin(value);
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Angle.prototype, "deg", {
                    get: function () { return this.rad * 180 / Math.PI; },
                    set: function (value) { this.rad = value * Math.PI / 180; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Angle.prototype, "cos", {
                    get: function () { return this._cos; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Angle.prototype, "sin", {
                    get: function () { return this._sin; },
                    enumerable: true,
                    configurable: true
                });
                Angle.copy = function (angle, out) {
                    if (out === void 0) { out = new Angle(); }
                    out._rad = angle._rad;
                    out._cos = angle._cos;
                    out._sin = angle._sin;
                    return out;
                };
                Angle.prototype.copy = function (other) {
                    return Angle.copy(other, this);
                };
                Angle.equal = function (a, b, epsilon) {
                    if (epsilon === void 0) { epsilon = EPSILON; }
                    if (Math.abs(wrapAngleRadians(a.rad - b.rad)) > epsilon) {
                        return false;
                    }
                    return true;
                };
                Angle.prototype.equal = function (other, epsilon) {
                    if (epsilon === void 0) { epsilon = EPSILON; }
                    return Angle.equal(this, other, epsilon);
                };
                Angle.tween = function (a, b, pct, out) {
                    if (out === void 0) { out = new Angle(); }
                    out.rad = tweenAngleRadians(a.rad, b.rad, pct);
                    return out;
                };
                Angle.prototype.tween = function (other, pct, out) {
                    if (out === void 0) { out = new Angle(); }
                    return Angle.tween(this, other, pct, out);
                };
                Angle.prototype.selfTween = function (other, pct) {
                    return Angle.tween(this, other, pct, this);
                };
                return Angle;
            }());
            exports_1("Angle", Angle);
            Vector = (function () {
                function Vector(x, y) {
                    if (x === void 0) { x = 0; }
                    if (y === void 0) { y = 0; }
                    this.x = 0;
                    this.y = 0;
                    this.x = x;
                    this.y = y;
                }
                Vector.copy = function (v, out) {
                    if (out === void 0) { out = new Vector(); }
                    out.x = v.x;
                    out.y = v.y;
                    return out;
                };
                Vector.prototype.copy = function (other) {
                    return Vector.copy(other, this);
                };
                Vector.equal = function (a, b, epsilon) {
                    if (epsilon === void 0) { epsilon = EPSILON; }
                    if (Math.abs(a.x - b.x) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.y - b.y) > epsilon) {
                        return false;
                    }
                    return true;
                };
                Vector.prototype.equal = function (other, epsilon) {
                    if (epsilon === void 0) { epsilon = EPSILON; }
                    return Vector.equal(this, other, epsilon);
                };
                Vector.negate = function (v, out) {
                    if (out === void 0) { out = new Vector(); }
                    out.x = -v.x;
                    out.y = -v.y;
                    return out;
                };
                Vector.add = function (a, b, out) {
                    if (out === void 0) { out = new Vector(); }
                    out.x = a.x + b.x;
                    out.y = a.y + b.y;
                    return out;
                };
                Vector.prototype.add = function (other, out) {
                    if (out === void 0) { out = new Vector(); }
                    return Vector.add(this, other, out);
                };
                Vector.prototype.selfAdd = function (other) {
                    ///return Vector.add(this, other, this);
                    this.x += other.x;
                    this.y += other.y;
                    return this;
                };
                Vector.subtract = function (a, b, out) {
                    if (out === void 0) { out = new Vector(); }
                    out.x = a.x - b.x;
                    out.y = a.y - b.y;
                    return out;
                };
                Vector.prototype.subtract = function (other, out) {
                    if (out === void 0) { out = new Vector(); }
                    return Vector.subtract(this, other, out);
                };
                Vector.prototype.selfSubtract = function (other) {
                    ///return Vector.subtract(this, other, this);
                    this.x -= other.x;
                    this.y -= other.y;
                    return this;
                };
                Vector.scale = function (v, x, y, out) {
                    if (y === void 0) { y = x; }
                    if (out === void 0) { out = new Vector(); }
                    out.x = v.x * x;
                    out.y = v.y * y;
                    return out;
                };
                Vector.prototype.scale = function (x, y, out) {
                    if (y === void 0) { y = x; }
                    if (out === void 0) { out = new Vector(); }
                    return Vector.scale(this, x, y, out);
                };
                Vector.prototype.selfScale = function (x, y) {
                    if (y === void 0) { y = x; }
                    return Vector.scale(this, x, y, this);
                };
                Vector.tween = function (a, b, pct, out) {
                    if (out === void 0) { out = new Vector(); }
                    out.x = tween(a.x, b.x, pct);
                    out.y = tween(a.y, b.y, pct);
                    return out;
                };
                Vector.prototype.tween = function (other, pct, out) {
                    if (out === void 0) { out = new Vector(); }
                    return Vector.tween(this, other, pct, out);
                };
                Vector.prototype.selfTween = function (other, pct) {
                    return Vector.tween(this, other, pct, this);
                };
                return Vector;
            }());
            exports_1("Vector", Vector);
            Matrix = (function () {
                function Matrix() {
                    this.a = 1;
                    this.b = 0;
                    this.c = 0;
                    this.d = 1;
                }
                Matrix.copy = function (m, out) {
                    if (out === void 0) { out = new Matrix(); }
                    out.a = m.a;
                    out.b = m.b;
                    out.c = m.c;
                    out.d = m.d;
                    return out;
                };
                Matrix.prototype.copy = function (other) {
                    return Matrix.copy(other, this);
                };
                Matrix.equal = function (a, b, epsilon) {
                    if (epsilon === void 0) { epsilon = EPSILON; }
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
                };
                Matrix.prototype.equal = function (other, epsilon) {
                    if (epsilon === void 0) { epsilon = EPSILON; }
                    return Matrix.equal(this, other, epsilon);
                };
                Matrix.determinant = function (m) {
                    return m.a * m.d - m.b * m.c;
                };
                Matrix.identity = function (out) {
                    if (out === void 0) { out = new Matrix(); }
                    out.a = 1;
                    out.b = 0;
                    out.c = 0;
                    out.d = 1;
                    return out;
                };
                Matrix.multiply = function (a, b, out) {
                    if (out === void 0) { out = new Matrix(); }
                    var a_a = a.a, a_b = a.b, a_c = a.c, a_d = a.d;
                    var b_a = b.a, b_b = b.b, b_c = b.c, b_d = b.d;
                    out.a = a_a * b_a + a_b * b_c;
                    out.b = a_a * b_b + a_b * b_d;
                    out.c = a_c * b_a + a_d * b_c;
                    out.d = a_c * b_b + a_d * b_d;
                    return out;
                };
                Matrix.invert = function (m, out) {
                    if (out === void 0) { out = new Matrix(); }
                    var a = m.a, b = m.b, c = m.c, d = m.d;
                    var inv_det = 1 / (a * d - b * c);
                    out.a = inv_det * d;
                    out.b = -inv_det * b;
                    out.c = -inv_det * c;
                    out.d = inv_det * a;
                    return out;
                };
                Matrix.combine = function (a, b, out) {
                    return Matrix.multiply(a, b, out);
                };
                Matrix.extract = function (ab, a, out) {
                    return Matrix.multiply(Matrix.invert(a, out), ab, out);
                };
                Matrix.prototype.selfRotate = function (cos, sin) {
                    return Matrix.rotate(this, cos, sin, this);
                };
                Matrix.rotate = function (m, cos, sin, out) {
                    if (out === void 0) { out = new Matrix(); }
                    var a = m.a, b = m.b, c = m.c, d = m.d;
                    out.a = a * cos + b * sin;
                    out.b = b * cos - a * sin;
                    out.c = c * cos + d * sin;
                    out.d = d * cos - c * sin;
                    return out;
                };
                Matrix.scale = function (m, x, y, out) {
                    if (out === void 0) { out = new Matrix(); }
                    out.a = m.a * x;
                    out.b = m.b * y;
                    out.c = m.c * x;
                    out.d = m.d * y;
                    return out;
                };
                Matrix.transform = function (m, v, out) {
                    if (out === void 0) { out = new Vector(); }
                    var x = v.x, y = v.y;
                    out.x = m.a * x + m.b * y;
                    out.y = m.c * x + m.d * y;
                    return out;
                };
                Matrix.untransform = function (m, v, out) {
                    if (out === void 0) { out = new Vector(); }
                    var a = m.a, b = m.b, c = m.c, d = m.d;
                    var x = v.x, y = v.y;
                    var inv_det = 1 / (a * d - b * c);
                    out.x = inv_det * (d * x - b * y);
                    out.y = inv_det * (a * y - c * x);
                    return out;
                };
                Matrix.tween = function (a, b, pct, out) {
                    if (out === void 0) { out = new Matrix(); }
                    out.a = tween(a.a, b.a, pct);
                    out.b = tween(a.b, b.b, pct);
                    out.c = tween(a.c, b.c, pct);
                    out.d = tween(a.d, b.d, pct);
                    return out;
                };
                Matrix.prototype.tween = function (other, pct, out) {
                    if (out === void 0) { out = new Matrix(); }
                    return Matrix.tween(this, other, pct, out);
                };
                Matrix.prototype.selfTween = function (other, pct) {
                    return Matrix.tween(this, other, pct, this);
                };
                return Matrix;
            }());
            exports_1("Matrix", Matrix);
            Affine = (function () {
                function Affine() {
                    this.vector = new Vector();
                    this.matrix = new Matrix();
                }
                Affine.copy = function (affine, out) {
                    if (out === void 0) { out = new Affine(); }
                    Vector.copy(affine.vector, out.vector);
                    Matrix.copy(affine.matrix, out.matrix);
                    return out;
                };
                Affine.prototype.copy = function (other) {
                    return Affine.copy(other, this);
                };
                Affine.equal = function (a, b, epsilon) {
                    if (epsilon === void 0) { epsilon = EPSILON; }
                    if (!a.vector.equal(b.vector, epsilon)) {
                        return false;
                    }
                    if (!a.matrix.equal(b.matrix, epsilon)) {
                        return false;
                    }
                    return true;
                };
                Affine.prototype.equal = function (other, epsilon) {
                    if (epsilon === void 0) { epsilon = EPSILON; }
                    return Affine.equal(this, other, epsilon);
                };
                Affine.identity = function (out) {
                    if (out === void 0) { out = new Affine(); }
                    Matrix.identity(out.matrix);
                    out.vector.x = 0;
                    out.vector.y = 0;
                    return out;
                };
                Affine.invert = function (affine, out) {
                    if (out === void 0) { out = new Affine(); }
                    Matrix.invert(affine.matrix, out.matrix);
                    Vector.negate(affine.vector, out.vector);
                    Matrix.transform(out.matrix, out.vector, out.vector);
                    return out;
                };
                Affine.combine = function (a, b, out) {
                    if (out === void 0) { out = new Affine(); }
                    Affine.transform(a, b.vector, out.vector);
                    Matrix.combine(a.matrix, b.matrix, out.matrix);
                    return out;
                };
                Affine.extract = function (ab, a, out) {
                    if (out === void 0) { out = new Affine(); }
                    Matrix.extract(ab.matrix, a.matrix, out.matrix);
                    Affine.untransform(a, ab.vector, out.vector);
                    return out;
                };
                Affine.transform = function (affine, v, out) {
                    if (out === void 0) { out = new Vector(); }
                    Matrix.transform(affine.matrix, v, out);
                    Vector.add(affine.vector, out, out);
                    return out;
                };
                Affine.untransform = function (affine, v, out) {
                    if (out === void 0) { out = new Vector(); }
                    Vector.subtract(v, affine.vector, out);
                    Matrix.untransform(affine.matrix, out, out);
                    return out;
                };
                return Affine;
            }());
            exports_1("Affine", Affine);
            Position = (function (_super) {
                __extends(Position, _super);
                function Position() {
                    return _super.call(this, 0, 0) || this;
                }
                return Position;
            }(Vector));
            exports_1("Position", Position);
            Rotation = (function (_super) {
                __extends(Rotation, _super);
                function Rotation() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.matrix = new Matrix();
                    return _this;
                }
                Rotation.prototype.updateMatrix = function (m) {
                    if (m === void 0) { m = this.matrix; }
                    m.a = this.cos;
                    m.b = -this.sin;
                    m.c = this.sin;
                    m.d = this.cos;
                    return m;
                };
                return Rotation;
            }(Angle));
            exports_1("Rotation", Rotation);
            Scale = (function (_super) {
                __extends(Scale, _super);
                function Scale() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Object.defineProperty(Scale.prototype, "x", {
                    get: function () { return (Math.abs(this.c) < EPSILON) ? (this.a) : (signum(this.a) * Math.sqrt(this.a * this.a + this.c * this.c)); },
                    set: function (value) { this.a = value; this.c = 0; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Scale.prototype, "y", {
                    get: function () { return (Math.abs(this.b) < EPSILON) ? (this.d) : (signum(this.d) * Math.sqrt(this.b * this.b + this.d * this.d)); },
                    set: function (value) { this.b = 0; this.d = value; },
                    enumerable: true,
                    configurable: true
                });
                return Scale;
            }(Matrix));
            exports_1("Scale", Scale);
            Shear = (function () {
                function Shear() {
                    this.x = new Angle();
                    this.y = new Angle();
                    this.matrix = new Matrix();
                }
                Shear.prototype.updateMatrix = function (m) {
                    if (m === void 0) { m = this.matrix; }
                    m.a = this.x.cos;
                    m.b = -this.y.sin;
                    m.c = this.x.sin;
                    m.d = this.y.cos;
                    return m;
                };
                Shear.copy = function (shear, out) {
                    if (out === void 0) { out = new Shear(); }
                    out.x.copy(shear.x);
                    out.y.copy(shear.y);
                    return out;
                };
                Shear.prototype.copy = function (other) {
                    return Shear.copy(other, this);
                };
                Shear.equal = function (a, b, epsilon) {
                    if (epsilon === void 0) { epsilon = EPSILON; }
                    if (!a.x.equal(b.x, epsilon)) {
                        return false;
                    }
                    if (!a.y.equal(b.y, epsilon)) {
                        return false;
                    }
                    return true;
                };
                Shear.prototype.equal = function (other, epsilon) {
                    if (epsilon === void 0) { epsilon = EPSILON; }
                    return Shear.equal(this, other, epsilon);
                };
                Shear.tween = function (a, b, pct, out) {
                    if (out === void 0) { out = new Shear(); }
                    Angle.tween(a.x, b.x, pct, out.x);
                    Angle.tween(a.y, b.y, pct, out.y);
                    return out;
                };
                Shear.prototype.tween = function (other, pct, out) {
                    if (out === void 0) { out = new Shear(); }
                    return Shear.tween(this, other, pct, out);
                };
                Shear.prototype.selfTween = function (other, pct) {
                    return Shear.tween(this, other, pct, this);
                };
                return Shear;
            }());
            exports_1("Shear", Shear);
            Space = (function () {
                function Space() {
                    this.position = new Position();
                    this.rotation = new Rotation();
                    this.scale = new Scale();
                    this.shear = new Shear();
                    this.affine = new Affine();
                }
                Space.prototype.updateAffine = function (affine) {
                    if (affine === void 0) { affine = this.affine; }
                    Vector.copy(this.position, affine.vector);
                    Matrix.copy(this.rotation.updateMatrix(), affine.matrix);
                    Matrix.multiply(affine.matrix, this.shear.updateMatrix(), affine.matrix);
                    Matrix.multiply(affine.matrix, this.scale, affine.matrix);
                    return affine;
                };
                Space.copy = function (space, out) {
                    if (out === void 0) { out = new Space(); }
                    out.position.copy(space.position);
                    out.rotation.copy(space.rotation);
                    out.scale.copy(space.scale);
                    out.shear.copy(space.shear);
                    return out;
                };
                Space.prototype.copy = function (other) {
                    return Space.copy(other, this);
                };
                Space.prototype.load = function (json) {
                    this.position.x = loadFloat(json, "x", 0);
                    this.position.y = loadFloat(json, "y", 0);
                    this.rotation.deg = loadFloat(json, "rotation", 0);
                    this.scale.x = loadFloat(json, "scaleX", 1);
                    this.scale.y = loadFloat(json, "scaleY", 1);
                    this.shear.x.deg = loadFloat(json, "shearX", 0);
                    this.shear.y.deg = loadFloat(json, "shearY", 0);
                    return this;
                };
                Space.equal = function (a, b, epsilon) {
                    if (epsilon === void 0) { epsilon = EPSILON; }
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
                };
                Space.prototype.equal = function (other, epsilon) {
                    if (epsilon === void 0) { epsilon = EPSILON; }
                    return Space.equal(this, other, epsilon);
                };
                Space.identity = function (out) {
                    if (out === void 0) { out = new Space(); }
                    out.position.x = 0;
                    out.position.y = 0;
                    out.rotation.rad = 0;
                    out.scale.x = 1;
                    out.scale.y = 1;
                    out.shear.x.rad = 0;
                    out.shear.y.rad = 0;
                    return out;
                };
                Space.translate = function (space, x, y) {
                    Space.transform(space, new Vector(x, y), space.position);
                    return space;
                };
                Space.rotate = function (space, rad) {
                    if (Matrix.determinant(space.scale) < 0.0) {
                        space.rotation.rad = wrapAngleRadians(space.rotation.rad - rad);
                    }
                    else {
                        space.rotation.rad = wrapAngleRadians(space.rotation.rad + rad);
                    }
                    return space;
                };
                Space.scale = function (space, x, y) {
                    Matrix.scale(space.scale, x, y, space.scale);
                    return space;
                };
                Space.invert = function (space, out) {
                    if (out === void 0) { out = new Space(); }
                    if (space === out) {
                        space = Space.copy(space, new Space());
                    }
                    Affine.invert(space.updateAffine(), out.affine);
                    out.position.copy(out.affine.vector);
                    out.shear.x.rad = -space.shear.x.rad;
                    out.shear.y.rad = -space.shear.y.rad;
                    var x_axis_rad = Math.atan2(out.affine.matrix.c, out.affine.matrix.a);
                    out.rotation.rad = wrapAngleRadians(x_axis_rad - out.shear.x.rad);
                    Matrix.combine(out.rotation.updateMatrix(), out.shear.updateMatrix(), out.scale);
                    Matrix.extract(out.affine.matrix, out.scale, out.scale);
                    return out;
                };
                Space.combine = function (a, b, out) {
                    if (out === void 0) { out = new Space(); }
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
                    var x_axis_rad = Math.atan2(out.affine.matrix.c, out.affine.matrix.a);
                    out.rotation.rad = wrapAngleRadians(x_axis_rad - out.shear.x.rad);
                    Matrix.combine(out.rotation.updateMatrix(), out.shear.updateMatrix(), out.scale);
                    Matrix.extract(out.affine.matrix, out.scale, out.scale);
                    return out;
                };
                Space.extract = function (ab, a, out) {
                    if (out === void 0) { out = new Space(); }
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
                    var x_axis_rad = Math.atan2(out.affine.matrix.c, out.affine.matrix.a);
                    out.rotation.rad = wrapAngleRadians(x_axis_rad - out.shear.x.rad);
                    Matrix.combine(out.rotation.updateMatrix(), out.shear.updateMatrix(), out.scale);
                    Matrix.extract(out.affine.matrix, out.scale, out.scale);
                    return out;
                };
                Space.transform = function (space, v, out) {
                    if (out === void 0) { out = new Vector(); }
                    return Affine.transform(space.updateAffine(), v, out);
                };
                Space.untransform = function (space, v, out) {
                    if (out === void 0) { out = new Vector(); }
                    return Affine.untransform(space.updateAffine(), v, out);
                };
                Space.tween = function (a, b, pct, out) {
                    if (out === void 0) { out = new Space(); }
                    a.position.tween(b.position, pct, out.position);
                    a.rotation.tween(b.rotation, pct, out.rotation);
                    a.scale.tween(b.scale, pct, out.scale);
                    a.shear.tween(b.shear, pct, out.shear);
                    return out;
                };
                Space.prototype.tween = function (other, pct, out) {
                    if (out === void 0) { out = new Space(); }
                    return Space.tween(this, other, pct, out);
                };
                Space.prototype.selfTween = function (other, pct) {
                    return Space.tween(this, other, pct, this);
                };
                return Space;
            }());
            exports_1("Space", Space);
            Bone = (function () {
                function Bone() {
                    this.color = new Color();
                    this.parent_key = "";
                    this.length = 0;
                    this.local_space = new Space();
                    this.world_space = new Space();
                    this.inherit_rotation = true;
                    this.inherit_scale = true;
                    this.transform = "normal";
                }
                Bone.prototype.copy = function (other) {
                    this.color.copy(other.color);
                    this.parent_key = other.parent_key;
                    this.length = other.length;
                    this.local_space.copy(other.local_space);
                    this.world_space.copy(other.world_space);
                    this.inherit_rotation = other.inherit_rotation;
                    this.inherit_scale = other.inherit_scale;
                    this.transform = other.transform;
                    return this;
                };
                Bone.prototype.load = function (json) {
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
                };
                Bone.flatten = function (bone, bones) {
                    var bls = bone.local_space;
                    var bws = bone.world_space;
                    var parent = bones.get(bone.parent_key);
                    if (!parent) {
                        bws.copy(bls);
                        bws.updateAffine();
                    }
                    else {
                        Bone.flatten(parent, bones);
                        var pws = parent.world_space;
                        // compute bone world space position vector
                        Space.transform(pws, bls.position, bws.position);
                        // compute bone world affine rotation/scale matrix based in inheritance
                        if (bone.inherit_rotation && bone.inherit_scale) {
                            Matrix.copy(pws.affine.matrix, bws.affine.matrix);
                        }
                        else if (bone.inherit_rotation) {
                            Matrix.identity(bws.affine.matrix);
                            while (parent && parent.inherit_rotation) {
                                var pls = parent.local_space;
                                Matrix.rotate(bws.affine.matrix, pls.rotation.cos, pls.rotation.sin, bws.affine.matrix);
                                parent = bones.get(parent.parent_key);
                            }
                        }
                        else if (bone.inherit_scale) {
                            Matrix.identity(bws.affine.matrix);
                            while (parent && parent.inherit_scale) {
                                var pls = parent.local_space;
                                var cos = pls.rotation.cos, sin = pls.rotation.sin;
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
                        var x_axis_rad = Math.atan2(bws.affine.matrix.c, bws.affine.matrix.a);
                        bws.rotation.rad = wrapAngleRadians(x_axis_rad - bws.shear.x.rad);
                        Matrix.combine(bws.rotation.updateMatrix(), bws.shear.updateMatrix(), bws.scale);
                        Matrix.extract(bws.affine.matrix, bws.scale, bws.scale);
                    }
                    return bone;
                };
                return Bone;
            }());
            exports_1("Bone", Bone);
            Constraint = (function () {
                function Constraint() {
                    ///public name: string = "";
                    this.order = 0;
                }
                Constraint.prototype.load = function (json) {
                    ///this.name = loadString(json, "name", "");
                    this.order = loadInt(json, "order", 0);
                    return this;
                };
                return Constraint;
            }());
            exports_1("Constraint", Constraint);
            Ikc = (function (_super) {
                __extends(Ikc, _super);
                function Ikc() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.bone_keys = [];
                    _this.target_key = "";
                    _this.mix = 1;
                    _this.bend_positive = true;
                    return _this;
                }
                Ikc.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.bone_keys = json["bones"] || [];
                    this.target_key = loadString(json, "target", "");
                    this.mix = loadFloat(json, "mix", 1);
                    this.bend_positive = loadBool(json, "bendPositive", true);
                    return this;
                };
                return Ikc;
            }(Constraint));
            exports_1("Ikc", Ikc);
            Xfc = (function (_super) {
                __extends(Xfc, _super);
                function Xfc() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.bone_keys = [];
                    _this.target_key = "";
                    _this.position_mix = 1;
                    _this.position = new Position();
                    _this.rotation_mix = 1;
                    _this.rotation = new Rotation();
                    _this.scale_mix = 1;
                    _this.scale = new Scale();
                    _this.shear_mix = 1;
                    _this.shear = new Shear();
                    return _this;
                }
                Xfc.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
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
                };
                return Xfc;
            }(Constraint));
            exports_1("Xfc", Xfc);
            Ptc = (function (_super) {
                __extends(Ptc, _super);
                function Ptc() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.bone_keys = [];
                    _this.target_key = "";
                    _this.spacing_mode = "length"; // "length", "fixed", "percent"
                    _this.spacing = 0;
                    _this.position_mode = "percent"; // "fixed", "percent"
                    _this.position_mix = 1;
                    _this.position = 0;
                    _this.rotation_mode = "tangent"; // "tangent", "chain", "chainscale"
                    _this.rotation_mix = 1;
                    _this.rotation = new Rotation();
                    return _this;
                }
                Ptc.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
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
                };
                return Ptc;
            }(Constraint));
            exports_1("Ptc", Ptc);
            Slot = (function () {
                function Slot() {
                    this.bone_key = "";
                    this.color = new Color();
                    this.attachment_key = "";
                    this.blend = "normal";
                }
                Slot.prototype.copy = function (other) {
                    this.bone_key = other.bone_key;
                    this.color.copy(other.color);
                    this.attachment_key = other.attachment_key;
                    this.blend = other.blend;
                    return this;
                };
                Slot.prototype.load = function (json) {
                    this.bone_key = loadString(json, "bone", "");
                    this.color.load(json.color);
                    this.attachment_key = loadString(json, "attachment", "");
                    this.blend = loadString(json, "blend", "normal");
                    return this;
                };
                return Slot;
            }());
            exports_1("Slot", Slot);
            Attachment = (function () {
                function Attachment(type) {
                    this.type = "";
                    this.name = "";
                    this.type = type;
                }
                Attachment.prototype.load = function (json) {
                    var type = loadString(json, "type", "region");
                    if (type !== this.type) {
                        throw new Error();
                    }
                    this.name = loadString(json, "name", "");
                    return this;
                };
                return Attachment;
            }());
            exports_1("Attachment", Attachment);
            RegionAttachment = (function (_super) {
                __extends(RegionAttachment, _super);
                function RegionAttachment() {
                    var _this = _super.call(this, "region") || this;
                    _this.path = "";
                    _this.color = new Color();
                    _this.local_space = new Space();
                    _this.width = 0;
                    _this.height = 0;
                    return _this;
                }
                RegionAttachment.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.path = loadString(json, "path", "");
                    this.color.load(json.color);
                    this.local_space.load(json);
                    this.width = loadFloat(json, "width", 0);
                    this.height = loadFloat(json, "height", 0);
                    return this;
                };
                return RegionAttachment;
            }(Attachment));
            exports_1("RegionAttachment", RegionAttachment);
            BoundingBoxAttachment = (function (_super) {
                __extends(BoundingBoxAttachment, _super);
                function BoundingBoxAttachment() {
                    var _this = _super.call(this, "boundingbox") || this;
                    _this.color = new Color();
                    _this.vertex_count = 0;
                    _this.vertices = [];
                    return _this;
                }
                BoundingBoxAttachment.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.color.load(json.color, 0x60f000ff);
                    this.vertex_count = loadInt(json, "vertexCount", 0);
                    /// The x/y pairs that make up the vertices of the polygon.
                    this.vertices = json.vertices;
                    return this;
                };
                return BoundingBoxAttachment;
            }(Attachment));
            exports_1("BoundingBoxAttachment", BoundingBoxAttachment);
            MeshAttachment = (function (_super) {
                __extends(MeshAttachment, _super);
                function MeshAttachment() {
                    var _this = _super.call(this, "mesh") || this;
                    _this.path = "";
                    _this.color = new Color();
                    _this.triangles = [];
                    _this.edges = [];
                    _this.vertices = [];
                    _this.uvs = [];
                    _this.hull = 0;
                    return _this;
                }
                MeshAttachment.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.path = loadString(json, "path", "");
                    this.color.load(json.color);
                    this.triangles = json.triangles || [];
                    this.edges = json.edges || [];
                    this.vertices = json.vertices || [];
                    this.uvs = json.uvs || [];
                    this.hull = loadInt(json, "hull", 0);
                    return this;
                };
                return MeshAttachment;
            }(Attachment));
            exports_1("MeshAttachment", MeshAttachment);
            LinkedMeshAttachment = (function (_super) {
                __extends(LinkedMeshAttachment, _super);
                function LinkedMeshAttachment() {
                    var _this = _super.call(this, "linkedmesh") || this;
                    _this.color = new Color();
                    _this.skin_key = "";
                    _this.parent_key = "";
                    _this.inherit_deform = true;
                    _this.width = 0;
                    _this.height = 0;
                    return _this;
                }
                LinkedMeshAttachment.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.color.load(json.color);
                    this.skin_key = loadString(json, "skin", "");
                    this.parent_key = loadString(json, "parent", "");
                    this.inherit_deform = loadBool(json, "deform", true);
                    this.width = loadInt(json, "width", 0);
                    this.height = loadInt(json, "height", 0);
                    return this;
                };
                return LinkedMeshAttachment;
            }(Attachment));
            exports_1("LinkedMeshAttachment", LinkedMeshAttachment);
            WeightedMeshAttachment = (function (_super) {
                __extends(WeightedMeshAttachment, _super);
                function WeightedMeshAttachment() {
                    var _this = _super.call(this, "weightedmesh") || this;
                    _this.path = "";
                    _this.color = new Color();
                    _this.triangles = [];
                    _this.edges = [];
                    _this.vertices = [];
                    _this.uvs = [];
                    _this.hull = 0;
                    return _this;
                }
                WeightedMeshAttachment.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.path = loadString(json, "path", "");
                    this.color.load(json.color);
                    this.triangles = json.triangles || [];
                    this.edges = json.edges || [];
                    this.vertices = json.vertices || [];
                    this.uvs = json.uvs || [];
                    this.hull = loadInt(json, "hull", 0);
                    return this;
                };
                return WeightedMeshAttachment;
            }(Attachment));
            exports_1("WeightedMeshAttachment", WeightedMeshAttachment);
            PathAttachment = (function (_super) {
                __extends(PathAttachment, _super);
                function PathAttachment() {
                    var _this = _super.call(this, "path") || this;
                    _this.color = new Color();
                    _this.closed = false;
                    _this.accurate = true;
                    _this.lengths = [];
                    _this.vertex_count = 0;
                    _this.vertices = [];
                    return _this;
                }
                PathAttachment.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.color.load(json.color, 0xff7f00ff);
                    this.closed = loadBool(json, "closed", false);
                    this.accurate = loadBool(json, "constantSpeed", true);
                    this.lengths = json.lengths || [];
                    this.vertex_count = loadInt(json, "vertexCount", 0);
                    this.vertices = json.vertices || [];
                    return this;
                };
                return PathAttachment;
            }(Attachment));
            exports_1("PathAttachment", PathAttachment);
            SkinSlot = (function () {
                function SkinSlot() {
                    this.attachments = new SpineMap();
                }
                SkinSlot.prototype.load = function (json) {
                    var _this = this;
                    this.attachments.clear();
                    Object.keys(json || {}).forEach(function (key) {
                        switch (json[key].type) {
                            default:
                            case "region":
                                _this.attachments.set(key, new RegionAttachment().load(json[key]));
                                break;
                            case "boundingbox":
                                _this.attachments.set(key, new BoundingBoxAttachment().load(json[key]));
                                break;
                            case "mesh":
                                if (json[key].vertices.length === json[key].uvs.length) {
                                    _this.attachments.set(key, new MeshAttachment().load(json[key]));
                                }
                                else {
                                    json[key].type = "weightedmesh";
                                    _this.attachments.set(key, new WeightedMeshAttachment().load(json[key]));
                                }
                                break;
                            case "linkedmesh":
                                _this.attachments.set(key, new LinkedMeshAttachment().load(json[key]));
                                break;
                            case "skinnedmesh":
                                json[key].type = "weightedmesh";
                            case "weightedmesh":
                                _this.attachments.set(key, new WeightedMeshAttachment().load(json[key]));
                                break;
                            case "path":
                                _this.attachments.set(key, new PathAttachment().load(json[key]));
                                break;
                        }
                    });
                    return this;
                };
                return SkinSlot;
            }());
            exports_1("SkinSlot", SkinSlot);
            Skin = (function () {
                function Skin() {
                    this.name = "";
                    this.slots = new SpineMap();
                }
                Skin.prototype.load = function (json) {
                    var _this = this;
                    this.name = loadString(json, "name", "");
                    Object.keys(json || {}).forEach(function (key) {
                        _this.slots.set(key, new SkinSlot().load(json[key]));
                    });
                    return this;
                };
                Skin.prototype.iterateAttachments = function (callback) {
                    this.forEachAttachment(function (attachment, attachment_key, skin_slot, slot_key) {
                        callback(slot_key, skin_slot, (attachment && attachment.name) || attachment_key, attachment);
                    });
                };
                Skin.prototype.forEachAttachment = function (callback) {
                    this.slots.forEach(function (skin_slot, slot_key) {
                        skin_slot.attachments.forEach(function (attachment, attachment_key) {
                            callback(attachment, (attachment && attachment.name) || attachment_key, skin_slot, slot_key);
                        });
                    });
                };
                return Skin;
            }());
            exports_1("Skin", Skin);
            Event = (function () {
                function Event() {
                    this.int_value = 0;
                    this.float_value = 0;
                    this.string_value = "";
                }
                Event.prototype.copy = function (other) {
                    this.int_value = other.int_value;
                    this.float_value = other.float_value;
                    this.string_value = other.string_value;
                    return this;
                };
                Event.prototype.load = function (json) {
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
                };
                return Event;
            }());
            exports_1("Event", Event);
            Range = (function () {
                function Range() {
                    this.min = 0;
                    this.max = 0;
                }
                Object.defineProperty(Range.prototype, "length", {
                    get: function () { return this.max - this.min; },
                    enumerable: true,
                    configurable: true
                });
                Range.prototype.reset = function () {
                    this.min = 0;
                    this.max = 0;
                    return this;
                };
                Range.prototype.wrap = function (value) {
                    return wrap(value, this.min, this.max);
                };
                Range.prototype.expandPoint = function (value) {
                    this.min = Math.min(this.min, value);
                    this.max = Math.max(this.max, value);
                    return value;
                };
                Range.prototype.expandRange = function (range) {
                    this.min = Math.min(this.min, range.min);
                    this.max = Math.max(this.max, range.max);
                    return range;
                };
                return Range;
            }());
            exports_1("Range", Range);
            Keyframe = (function () {
                function Keyframe() {
                    this.time = 0;
                }
                Keyframe.prototype.drop = function () {
                    this.time = 0;
                    return this;
                };
                Keyframe.prototype.load = function (json) {
                    this.time = 1000 * loadFloat(json, "time", 0); // convert to ms
                    return this;
                };
                Keyframe.prototype.save = function (json) {
                    saveFloat(json, "time", this.time / 1000, 0); // convert to s
                    return this;
                };
                Keyframe.find = function (array, time) {
                    if (!array)
                        return -1;
                    if (array.length <= 0)
                        return -1;
                    if (time < array[0].time)
                        return -1;
                    var last = array.length - 1;
                    if (time >= array[last].time)
                        return last;
                    var lo = 0;
                    var hi = last;
                    if (hi === 0)
                        return 0;
                    var current = hi >> 1;
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
                };
                Keyframe.compare = function (a, b) {
                    return a.time - b.time;
                };
                Keyframe.interpolate = function (keyframe0, keyframe1, time) {
                    return (!keyframe0 || !keyframe1 || keyframe0.time === keyframe1.time) ? 0 : (time - keyframe0.time) / (keyframe1.time - keyframe0.time);
                };
                Keyframe.evaluate = function (keyframes, time, callback) {
                    var keyframe0_index = Keyframe.find(keyframes, time);
                    if (keyframe0_index !== -1) {
                        var keyframe1_index = keyframe0_index + 1;
                        var keyframe0 = keyframes[keyframe0_index];
                        var keyframe1 = keyframes[keyframe1_index] || keyframe0;
                        var k = Keyframe.interpolate(keyframe0, keyframe1, time);
                        callback(keyframe0, keyframe1, k, keyframe0_index, keyframe1_index);
                    }
                };
                return Keyframe;
            }());
            exports_1("Keyframe", Keyframe);
            Timeline = (function () {
                function Timeline() {
                    this.range = new Range();
                    this.keyframes = [];
                }
                Timeline.prototype.load = function (json, ctor) {
                    var _this = this;
                    this.range.reset();
                    this.keyframes.length = 0;
                    json.forEach(function (keyframe_json, index) {
                        _this.range.expandPoint((_this.keyframes[index] = new ctor().load(keyframe_json)).time);
                    });
                    this.keyframes.sort(Keyframe.compare);
                    return this;
                };
                Timeline.evaluate = function (timeline, time, callback) {
                    timeline && Keyframe.evaluate(timeline.keyframes, time, callback);
                };
                return Timeline;
            }());
            exports_1("Timeline", Timeline);
            CurveKeyframe = (function (_super) {
                __extends(CurveKeyframe, _super);
                function CurveKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.curve = new Curve();
                    return _this;
                }
                CurveKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.curve.load(json.curve);
                    return this;
                };
                CurveKeyframe.interpolate = function (curve_keyframe0, curve_keyframe1, time) {
                    return curve_keyframe0 && curve_keyframe0.curve.evaluate(Keyframe.interpolate(curve_keyframe0, curve_keyframe1, time)) || 0;
                };
                return CurveKeyframe;
            }(Keyframe));
            exports_1("CurveKeyframe", CurveKeyframe);
            BonePositionKeyframe = (function (_super) {
                __extends(BonePositionKeyframe, _super);
                function BonePositionKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.position = new Position();
                    return _this;
                }
                BonePositionKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.position.x = loadFloat(json, "x", 0);
                    this.position.y = loadFloat(json, "y", 0);
                    return this;
                };
                return BonePositionKeyframe;
            }(CurveKeyframe));
            exports_1("BonePositionKeyframe", BonePositionKeyframe);
            BonePositionTimeline = (function (_super) {
                __extends(BonePositionTimeline, _super);
                function BonePositionTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                BonePositionTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, BonePositionKeyframe);
                };
                return BonePositionTimeline;
            }(Timeline));
            exports_1("BonePositionTimeline", BonePositionTimeline);
            BoneRotationKeyframe = (function (_super) {
                __extends(BoneRotationKeyframe, _super);
                function BoneRotationKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.rotation = new Rotation();
                    return _this;
                }
                BoneRotationKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.rotation.deg = loadFloat(json, "angle", 0);
                    return this;
                };
                return BoneRotationKeyframe;
            }(CurveKeyframe));
            exports_1("BoneRotationKeyframe", BoneRotationKeyframe);
            BoneRotationTimeline = (function (_super) {
                __extends(BoneRotationTimeline, _super);
                function BoneRotationTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                BoneRotationTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, BoneRotationKeyframe);
                };
                return BoneRotationTimeline;
            }(Timeline));
            exports_1("BoneRotationTimeline", BoneRotationTimeline);
            BoneScaleKeyframe = (function (_super) {
                __extends(BoneScaleKeyframe, _super);
                function BoneScaleKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.scale = new Scale();
                    return _this;
                }
                BoneScaleKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.scale.x = loadFloat(json, "x", 1);
                    this.scale.y = loadFloat(json, "y", 1);
                    return this;
                };
                return BoneScaleKeyframe;
            }(CurveKeyframe));
            exports_1("BoneScaleKeyframe", BoneScaleKeyframe);
            BoneScaleTimeline = (function (_super) {
                __extends(BoneScaleTimeline, _super);
                function BoneScaleTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                BoneScaleTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, BoneScaleKeyframe);
                };
                return BoneScaleTimeline;
            }(Timeline));
            exports_1("BoneScaleTimeline", BoneScaleTimeline);
            BoneShearKeyframe = (function (_super) {
                __extends(BoneShearKeyframe, _super);
                function BoneShearKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.shear = new Shear();
                    return _this;
                }
                BoneShearKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.shear.x.deg = loadFloat(json, "x", 0);
                    this.shear.y.deg = loadFloat(json, "y", 0);
                    return this;
                };
                return BoneShearKeyframe;
            }(CurveKeyframe));
            exports_1("BoneShearKeyframe", BoneShearKeyframe);
            BoneShearTimeline = (function (_super) {
                __extends(BoneShearTimeline, _super);
                function BoneShearTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                BoneShearTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, BoneShearKeyframe);
                };
                return BoneShearTimeline;
            }(Timeline));
            exports_1("BoneShearTimeline", BoneShearTimeline);
            BoneTimeline = (function () {
                function BoneTimeline() {
                    this.range = new Range();
                }
                BoneTimeline.prototype.load = function (json) {
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
                };
                return BoneTimeline;
            }());
            exports_1("BoneTimeline", BoneTimeline);
            SlotColorKeyframe = (function (_super) {
                __extends(SlotColorKeyframe, _super);
                function SlotColorKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.color = new Color();
                    return _this;
                }
                SlotColorKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.color.load(json.color);
                    return this;
                };
                return SlotColorKeyframe;
            }(CurveKeyframe));
            exports_1("SlotColorKeyframe", SlotColorKeyframe);
            SlotColorTimeline = (function (_super) {
                __extends(SlotColorTimeline, _super);
                function SlotColorTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                SlotColorTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, SlotColorKeyframe);
                };
                return SlotColorTimeline;
            }(Timeline));
            exports_1("SlotColorTimeline", SlotColorTimeline);
            SlotAttachmentKeyframe = (function (_super) {
                __extends(SlotAttachmentKeyframe, _super);
                function SlotAttachmentKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.name = "";
                    return _this;
                }
                SlotAttachmentKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.name = loadString(json, "name", "");
                    return this;
                };
                return SlotAttachmentKeyframe;
            }(Keyframe));
            exports_1("SlotAttachmentKeyframe", SlotAttachmentKeyframe);
            SlotAttachmentTimeline = (function (_super) {
                __extends(SlotAttachmentTimeline, _super);
                function SlotAttachmentTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                SlotAttachmentTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, SlotAttachmentKeyframe);
                };
                return SlotAttachmentTimeline;
            }(Timeline));
            exports_1("SlotAttachmentTimeline", SlotAttachmentTimeline);
            SlotTimeline = (function () {
                function SlotTimeline() {
                    this.range = new Range();
                }
                SlotTimeline.prototype.load = function (json) {
                    this.range.reset();
                    delete this.color_timeline;
                    delete this.attachment_timeline;
                    json.color && this.range.expandRange((this.color_timeline = new SlotColorTimeline().load(json.color)).range);
                    json.attachment && this.range.expandRange((this.attachment_timeline = new SlotAttachmentTimeline().load(json.attachment)).range);
                    return this;
                };
                return SlotTimeline;
            }());
            exports_1("SlotTimeline", SlotTimeline);
            EventKeyframe = (function (_super) {
                __extends(EventKeyframe, _super);
                function EventKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.name = "";
                    _this.event = new Event();
                    return _this;
                }
                EventKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.name = loadString(json, "name", "");
                    this.event.load(json);
                    return this;
                };
                return EventKeyframe;
            }(Keyframe));
            exports_1("EventKeyframe", EventKeyframe);
            EventTimeline = (function (_super) {
                __extends(EventTimeline, _super);
                function EventTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                EventTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, EventKeyframe);
                };
                return EventTimeline;
            }(Timeline));
            exports_1("EventTimeline", EventTimeline);
            SlotOffset = (function () {
                function SlotOffset() {
                    this.slot_key = "";
                    this.offset = 0;
                }
                SlotOffset.prototype.load = function (json) {
                    this.slot_key = loadString(json, "slot", "");
                    this.offset = loadInt(json, "offset", 0);
                    return this;
                };
                return SlotOffset;
            }());
            exports_1("SlotOffset", SlotOffset);
            OrderKeyframe = (function (_super) {
                __extends(OrderKeyframe, _super);
                function OrderKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.slot_offsets = [];
                    return _this;
                }
                OrderKeyframe.prototype.load = function (json) {
                    var _this = this;
                    _super.prototype.load.call(this, json);
                    this.slot_offsets.length = 0;
                    json.offsets && json.offsets.forEach(function (offset_json) {
                        _this.slot_offsets.push(new SlotOffset().load(offset_json));
                    });
                    return this;
                };
                return OrderKeyframe;
            }(Keyframe));
            exports_1("OrderKeyframe", OrderKeyframe);
            OrderTimeline = (function (_super) {
                __extends(OrderTimeline, _super);
                function OrderTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                OrderTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, OrderKeyframe);
                };
                return OrderTimeline;
            }(Timeline));
            exports_1("OrderTimeline", OrderTimeline);
            IkcKeyframe = (function (_super) {
                __extends(IkcKeyframe, _super);
                function IkcKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.mix = 1;
                    _this.bend_positive = true;
                    return _this;
                }
                IkcKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.mix = loadFloat(json, "mix", 1);
                    this.bend_positive = loadBool(json, "bendPositive", true);
                    return this;
                };
                return IkcKeyframe;
            }(CurveKeyframe));
            exports_1("IkcKeyframe", IkcKeyframe);
            IkcTimeline = (function (_super) {
                __extends(IkcTimeline, _super);
                function IkcTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                IkcTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, IkcKeyframe);
                };
                return IkcTimeline;
            }(Timeline));
            exports_1("IkcTimeline", IkcTimeline);
            XfcKeyframe = (function (_super) {
                __extends(XfcKeyframe, _super);
                function XfcKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.position_mix = 1;
                    _this.rotation_mix = 1;
                    _this.scale_mix = 1;
                    _this.shear_mix = 1;
                    return _this;
                }
                XfcKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.position_mix = loadFloat(json, "translateMix", 1);
                    this.rotation_mix = loadFloat(json, "rotateMix", 1);
                    this.scale_mix = loadFloat(json, "scaleMix", 1);
                    this.shear_mix = loadFloat(json, "shearMix", 1);
                    return this;
                };
                return XfcKeyframe;
            }(CurveKeyframe));
            exports_1("XfcKeyframe", XfcKeyframe);
            XfcTimeline = (function (_super) {
                __extends(XfcTimeline, _super);
                function XfcTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                XfcTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, XfcKeyframe);
                };
                return XfcTimeline;
            }(Timeline));
            exports_1("XfcTimeline", XfcTimeline);
            PtcMixKeyframe = (function (_super) {
                __extends(PtcMixKeyframe, _super);
                function PtcMixKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.position_mix = 0;
                    _this.rotation_mix = 0;
                    return _this;
                }
                PtcMixKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.position_mix = loadFloat(json, "translateMix", 1);
                    this.rotation_mix = loadFloat(json, "rotateMix", 1);
                    return this;
                };
                return PtcMixKeyframe;
            }(CurveKeyframe));
            exports_1("PtcMixKeyframe", PtcMixKeyframe);
            PtcMixTimeline = (function (_super) {
                __extends(PtcMixTimeline, _super);
                function PtcMixTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                PtcMixTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, PtcMixKeyframe);
                };
                return PtcMixTimeline;
            }(Timeline));
            exports_1("PtcMixTimeline", PtcMixTimeline);
            PtcSpacingKeyframe = (function (_super) {
                __extends(PtcSpacingKeyframe, _super);
                function PtcSpacingKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.spacing = 0;
                    return _this;
                }
                PtcSpacingKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.spacing = loadFloat(json, "spacing", 0);
                    return this;
                };
                return PtcSpacingKeyframe;
            }(CurveKeyframe));
            exports_1("PtcSpacingKeyframe", PtcSpacingKeyframe);
            PtcSpacingTimeline = (function (_super) {
                __extends(PtcSpacingTimeline, _super);
                function PtcSpacingTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                PtcSpacingTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, PtcSpacingKeyframe);
                };
                return PtcSpacingTimeline;
            }(Timeline));
            exports_1("PtcSpacingTimeline", PtcSpacingTimeline);
            PtcPositionKeyframe = (function (_super) {
                __extends(PtcPositionKeyframe, _super);
                function PtcPositionKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.position = 0;
                    return _this;
                }
                PtcPositionKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.position = loadFloat(json, "position", 0);
                    return this;
                };
                return PtcPositionKeyframe;
            }(CurveKeyframe));
            exports_1("PtcPositionKeyframe", PtcPositionKeyframe);
            PtcPositionTimeline = (function (_super) {
                __extends(PtcPositionTimeline, _super);
                function PtcPositionTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                PtcPositionTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, PtcPositionKeyframe);
                };
                return PtcPositionTimeline;
            }(Timeline));
            exports_1("PtcPositionTimeline", PtcPositionTimeline);
            PtcRotationKeyframe = (function (_super) {
                __extends(PtcRotationKeyframe, _super);
                function PtcRotationKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.rotation = new Rotation();
                    return _this;
                }
                PtcRotationKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.rotation.deg = loadFloat(json, "rotation", 0);
                    return this;
                };
                return PtcRotationKeyframe;
            }(CurveKeyframe));
            exports_1("PtcRotationKeyframe", PtcRotationKeyframe);
            PtcRotationTimeline = (function (_super) {
                __extends(PtcRotationTimeline, _super);
                function PtcRotationTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                PtcRotationTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, PtcRotationKeyframe);
                };
                return PtcRotationTimeline;
            }(Timeline));
            exports_1("PtcRotationTimeline", PtcRotationTimeline);
            PtcTimeline = (function () {
                function PtcTimeline() {
                    this.range = new Range();
                }
                PtcTimeline.prototype.load = function (json) {
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
                };
                return PtcTimeline;
            }());
            exports_1("PtcTimeline", PtcTimeline);
            FfdKeyframe = (function (_super) {
                __extends(FfdKeyframe, _super);
                function FfdKeyframe() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.offset = 0;
                    _this.vertices = [];
                    return _this;
                }
                FfdKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.offset = loadInt(json, "offset", 0);
                    this.vertices = json.vertices || [];
                    return this;
                };
                return FfdKeyframe;
            }(CurveKeyframe));
            exports_1("FfdKeyframe", FfdKeyframe);
            FfdTimeline = (function (_super) {
                __extends(FfdTimeline, _super);
                function FfdTimeline() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                FfdTimeline.prototype.load = function (json) {
                    return _super.prototype.load.call(this, json, FfdKeyframe);
                };
                return FfdTimeline;
            }(Timeline));
            exports_1("FfdTimeline", FfdTimeline);
            FfdAttachment = (function () {
                function FfdAttachment() {
                    this.ffd_timeline = new FfdTimeline();
                }
                FfdAttachment.prototype.load = function (json) {
                    this.ffd_timeline.load(json);
                    return this;
                };
                return FfdAttachment;
            }());
            exports_1("FfdAttachment", FfdAttachment);
            FfdSlot = (function () {
                function FfdSlot() {
                    this.ffd_attachments = new SpineMap();
                }
                FfdSlot.prototype.load = function (json) {
                    var _this = this;
                    this.ffd_attachments.clear();
                    Object.keys(json || {}).forEach(function (key) {
                        _this.ffd_attachments.set(key, new FfdAttachment().load(json[key]));
                    });
                    return this;
                };
                FfdSlot.prototype.iterateAttachments = function (callback) {
                    this.forEachAttachment(function (ffd_attachment, ffd_attachment_key) {
                        callback(ffd_attachment_key, ffd_attachment);
                    });
                };
                FfdSlot.prototype.forEachAttachment = function (callback) {
                    this.ffd_attachments.forEach(function (ffd_attachment, ffd_attachment_key) {
                        callback(ffd_attachment, ffd_attachment_key);
                    });
                };
                return FfdSlot;
            }());
            exports_1("FfdSlot", FfdSlot);
            FfdSkin = (function () {
                function FfdSkin() {
                    this.ffd_slots = new SpineMap();
                }
                FfdSkin.prototype.load = function (json) {
                    var _this = this;
                    this.ffd_slots.clear();
                    Object.keys(json || {}).forEach(function (key) {
                        _this.ffd_slots.set(key, new FfdSlot().load(json[key]));
                    });
                    return this;
                };
                FfdSkin.prototype.iterateAttachments = function (callback) {
                    this.forEachAttachment(function (ffd_attachment, ffd_attachment_key, ffd_slot, ffd_slot_key) {
                        callback(ffd_slot_key, ffd_slot, ffd_attachment_key, ffd_attachment);
                    });
                };
                FfdSkin.prototype.forEachAttachment = function (callback) {
                    this.ffd_slots.forEach(function (ffd_slot, ffd_slot_key) {
                        ffd_slot.forEachAttachment(function (ffd_attachment, ffd_attachment_key) {
                            callback(ffd_attachment, ffd_attachment_key, ffd_slot, ffd_slot_key);
                        });
                    });
                };
                return FfdSkin;
            }());
            exports_1("FfdSkin", FfdSkin);
            Animation = (function () {
                function Animation() {
                    ///public name: string = "";
                    this.range = new Range();
                    this.bone_timeline_map = new SpineMap();
                    this.slot_timeline_map = new SpineMap();
                    this.ikc_timeline_map = new SpineMap();
                    this.xfc_timeline_map = new SpineMap();
                    this.ptc_timeline_map = new SpineMap();
                    this.ffd_skins = new SpineMap();
                }
                Animation.prototype.load = function (json) {
                    var _this = this;
                    this.range.reset();
                    this.bone_timeline_map.clear();
                    this.slot_timeline_map.clear();
                    delete this.event_timeline;
                    delete this.order_timeline;
                    this.ikc_timeline_map.clear();
                    this.xfc_timeline_map.clear();
                    this.ptc_timeline_map.clear();
                    this.ffd_skins.clear();
                    json.bones && Object.keys(json.bones).forEach(function (key) {
                        _this.range.expandRange(_this.bone_timeline_map.set(key, new BoneTimeline().load(json.bones[key])).range);
                    });
                    json.slots && Object.keys(json.slots).forEach(function (key) {
                        _this.range.expandRange(_this.slot_timeline_map.set(key, new SlotTimeline().load(json.slots[key])).range);
                    });
                    json.events && this.range.expandRange((this.event_timeline = new EventTimeline().load(json.events)).range);
                    json.draworder = json.draworder || json.drawOrder;
                    json.draworder && this.range.expandRange((this.order_timeline = new OrderTimeline().load(json.draworder)).range);
                    json.ik && Object.keys(json.ik).forEach(function (key) {
                        _this.range.expandRange(_this.ikc_timeline_map.set(key, new IkcTimeline().load(json.ik[key])).range);
                    });
                    json.transform && Object.keys(json.transform).forEach(function (key) {
                        _this.range.expandRange(_this.xfc_timeline_map.set(key, new XfcTimeline().load(json.transform[key])).range);
                    });
                    json.paths && Object.keys(json.paths).forEach(function (key) {
                        _this.range.expandRange(_this.ptc_timeline_map.set(key, new PtcTimeline().load(json.paths[key])).range);
                    });
                    json.deform = json.deform || json.ffd;
                    json.deform && Object.keys(json.deform).forEach(function (key) {
                        _this.ffd_skins.set(key, new FfdSkin().load(json.deform[key]));
                    });
                    return this;
                };
                return Animation;
            }());
            exports_1("Animation", Animation);
            Skeleton = (function () {
                function Skeleton() {
                    this.hash = "";
                    this.spine = "";
                    this.width = 0;
                    this.height = 0;
                    this.images = "";
                }
                Skeleton.prototype.load = function (json) {
                    this.hash = loadString(json, "hash", "");
                    this.spine = loadString(json, "spine", "");
                    this.width = loadInt(json, "width", 0);
                    this.height = loadInt(json, "height", 0);
                    this.images = loadString(json, "images", "");
                    return this;
                };
                return Skeleton;
            }());
            exports_1("Skeleton", Skeleton);
            Data = (function () {
                function Data() {
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
                Data.prototype.drop = function () {
                    this.bones.clear();
                    this.ikcs.clear();
                    this.xfcs.clear();
                    this.ptcs.clear();
                    this.slots.clear();
                    this.skins.clear();
                    this.events.clear();
                    this.anims.clear();
                    return this;
                };
                Data.prototype.load = function (json) {
                    var _this = this;
                    this.bones.clear();
                    this.ikcs.clear();
                    this.xfcs.clear();
                    this.ptcs.clear();
                    this.slots.clear();
                    this.skins.clear();
                    this.events.clear();
                    this.anims.clear();
                    json.skeleton && this.skeleton.load(json.skeleton);
                    json.bones && json.bones.forEach(function (bone_json) {
                        _this.bones.set(bone_json.name, new Bone().load(bone_json));
                    });
                    json.ik && json.ik.forEach(function (ikc_json) {
                        _this.ikcs.set(ikc_json.name, new Ikc().load(ikc_json));
                    });
                    // sort by order
                    this.ikcs.keys.sort(function (a, b) {
                        var ikc_a = _this.ikcs.get(a);
                        var ikc_b = _this.ikcs.get(b);
                        return (ikc_a && ikc_a.order || 0) - (ikc_b && ikc_b.order || 0);
                    });
                    json.transform && json.transform.forEach(function (xfc_json) {
                        _this.xfcs.set(xfc_json.name, new Xfc().load(xfc_json));
                    });
                    // sort by order
                    this.xfcs.keys.sort(function (a, b) {
                        var xfc_a = _this.xfcs.get(a);
                        var xfc_b = _this.xfcs.get(b);
                        return (xfc_a && xfc_a.order || 0) - (xfc_b && xfc_b.order || 0);
                    });
                    json.path && json.path.forEach(function (ptc_json) {
                        _this.ptcs.set(ptc_json.name, new Ptc().load(ptc_json));
                    });
                    // sort by order
                    this.ptcs.keys.sort(function (a, b) {
                        var ptc_a = _this.ptcs.get(a);
                        var ptc_b = _this.ptcs.get(b);
                        return (ptc_a && ptc_a.order || 0) - (ptc_b && ptc_b.order || 0);
                    });
                    json.slots && json.slots.forEach(function (slot_json) {
                        _this.slots.set(slot_json.name, new Slot().load(slot_json));
                    });
                    json.skins && Object.keys(json.skins).forEach(function (key) {
                        var skin = _this.skins.set(key, new Skin().load(json.skins[key]));
                        skin.name = skin.name || key;
                    });
                    json.events && Object.keys(json.events).forEach(function (key) {
                        _this.events.set(key, new Event().load(json.events[key]));
                    });
                    json.animations && Object.keys(json.animations).forEach(function (key) {
                        _this.anims.set(key, new Animation().load(json.animations[key]));
                    });
                    this.iterateBones(function (bone_key, bone) {
                        Bone.flatten(bone, _this.bones);
                    });
                    return this;
                };
                Data.prototype.save = function (json) {
                    if (json === void 0) { json = {}; }
                    // TODO
                    return json;
                };
                Data.prototype.loadSkeleton = function (json) {
                    this.skeleton.load(json);
                    return this;
                };
                Data.prototype.loadEvent = function (name, json) {
                    this.events.set(name, new Event().load(json));
                    return this;
                };
                Data.prototype.loadAnimation = function (name, json) {
                    this.anims.set(name, new Animation().load(json));
                    return this;
                };
                Data.prototype.getSkins = function () {
                    return this.skins;
                };
                Data.prototype.getEvents = function () {
                    return this.events;
                };
                Data.prototype.getAnims = function () {
                    return this.anims;
                };
                Data.prototype.iterateBones = function (callback) {
                    this.forEachBone(function (bone, bone_key) {
                        callback(bone_key, bone);
                    });
                };
                Data.prototype.forEachBone = function (callback) {
                    this.bones.forEach(callback);
                };
                Data.prototype.iterateAttachments = function (skin_key, callback) {
                    this.forEachAttachment(skin_key, function (attachment, attachment_key, slot, slot_key, skin_slot) {
                        callback(slot_key, slot, skin_slot, attachment_key, attachment);
                    });
                };
                Data.prototype.forEachAttachment = function (skin_key, callback) {
                    var skin = this.skins.get(skin_key);
                    var default_skin = this.skins.get("default");
                    this.slots.forEach(function (slot, slot_key) {
                        var skin_slot = (skin && skin.slots.get(slot_key)) || (default_skin && default_skin.slots.get(slot_key));
                        var attachment = skin_slot && skin_slot.attachments.get(slot.attachment_key);
                        var attachment_key = (attachment && attachment.name) || slot.attachment_key;
                        if (attachment && (attachment.type === "linkedmesh")) {
                            attachment_key = attachment.parent_key;
                            attachment = skin_slot && skin_slot.attachments.get(attachment_key);
                        }
                        callback(attachment, attachment_key, slot, slot_key, skin_slot);
                    });
                };
                Data.prototype.iterateSkins = function (callback) {
                    this.forEachSkin(function (skin, skin_key) {
                        callback(skin_key, skin);
                    });
                };
                Data.prototype.forEachSkin = function (callback) {
                    this.skins.forEach(callback);
                };
                Data.prototype.iterateEvents = function (callback) {
                    this.forEachEvent(function (event, event_key) {
                        callback(event_key, event);
                    });
                };
                Data.prototype.forEachEvent = function (callback) {
                    this.events.forEach(callback);
                };
                Data.prototype.iterateAnims = function (callback) {
                    this.forEachAnim(function (anim, anim_key) {
                        callback(anim_key, anim);
                    });
                };
                Data.prototype.forEachAnim = function (callback) {
                    this.anims.forEach(callback);
                };
                return Data;
            }());
            exports_1("Data", Data);
            Pose = (function () {
                function Pose(data) {
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
                Pose.prototype.drop = function () {
                    this.bones.clear();
                    this.slots.clear();
                    this.events.clear();
                    return this;
                };
                Pose.prototype.curSkel = function () {
                    return this.data.skeleton;
                };
                Pose.prototype.getSkins = function () {
                    return this.data.skins;
                };
                Pose.prototype.curSkin = function () {
                    return this.data.skins.get(this.skin_key);
                };
                Pose.prototype.getSkin = function () {
                    return this.skin_key;
                };
                Pose.prototype.setSkin = function (skin_key) {
                    if (this.skin_key !== skin_key) {
                        this.skin_key = skin_key;
                    }
                };
                Pose.prototype.getAnims = function () {
                    return this.data.anims;
                };
                Pose.prototype.curAnim = function () {
                    return this.data.anims.get(this.anim_key);
                };
                Pose.prototype.curAnimLength = function () {
                    var anim = this.data.anims.get(this.anim_key);
                    return (anim && anim.range.length) || 0;
                };
                Pose.prototype.getAnim = function () {
                    return this.anim_key;
                };
                Pose.prototype.setAnim = function (anim_key) {
                    if (this.anim_key !== anim_key) {
                        this.anim_key = anim_key;
                        var anim = this.data.anims.get(this.anim_key);
                        if (anim) {
                            this.time = anim.range.wrap(this.time);
                        }
                        this.prev_time = this.time;
                        this.elapsed_time = 0;
                        this.dirty = true;
                    }
                };
                Pose.prototype.getTime = function () {
                    return this.time;
                };
                Pose.prototype.setTime = function (time) {
                    var anim = this.data.anims.get(this.anim_key);
                    if (anim) {
                        time = anim.range.wrap(time);
                    }
                    if (this.time !== time) {
                        this.time = time;
                        this.prev_time = this.time;
                        this.elapsed_time = 0;
                        this.dirty = true;
                    }
                };
                Pose.prototype.update = function (elapsed_time) {
                    this.elapsed_time += elapsed_time;
                    this.dirty = true;
                };
                Pose.prototype.strike = function () {
                    if (!this.dirty) {
                        return;
                    }
                    this.dirty = false;
                    this.prev_time = this.time; // save previous time
                    this.time += this.elapsed_time; // accumulate elapsed time
                    var anim = this.data.anims.get(this.anim_key);
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
                };
                Pose.prototype._strikeBones = function (anim) {
                    var _this = this;
                    this.data.bones.forEach(function (data_bone, bone_key) {
                        var pose_bone = _this.bones.get(bone_key) || _this.bones.set(bone_key, new Bone());
                        // start with a copy of the data bone
                        pose_bone.copy(data_bone);
                        // tween anim bone if keyframes are available
                        var bone_timeline = anim && anim.bone_timeline_map.get(bone_key);
                        if (bone_timeline) {
                            Timeline.evaluate(bone_timeline.position_timeline, _this.time, function (keyframe0, keyframe1, k) {
                                var pct = keyframe0.curve.evaluate(k);
                                pose_bone.local_space.position.x += tween(keyframe0.position.x, keyframe1.position.x, pct);
                                pose_bone.local_space.position.y += tween(keyframe0.position.y, keyframe1.position.y, pct);
                            });
                            Timeline.evaluate(bone_timeline.rotation_timeline, _this.time, function (keyframe0, keyframe1, k) {
                                var pct = keyframe0.curve.evaluate(k);
                                pose_bone.local_space.rotation.rad += tweenAngleRadians(keyframe0.rotation.rad, keyframe1.rotation.rad, pct);
                            });
                            Timeline.evaluate(bone_timeline.scale_timeline, _this.time, function (keyframe0, keyframe1, k) {
                                var pct = keyframe0.curve.evaluate(k);
                                pose_bone.local_space.scale.a *= tween(keyframe0.scale.a, keyframe1.scale.a, pct);
                                pose_bone.local_space.scale.d *= tween(keyframe0.scale.d, keyframe1.scale.d, pct);
                            });
                            Timeline.evaluate(bone_timeline.shear_timeline, _this.time, function (keyframe0, keyframe1, k) {
                                var pct = keyframe0.curve.evaluate(k);
                                pose_bone.local_space.shear.x.rad += tweenAngleRadians(keyframe0.shear.x.rad, keyframe1.shear.x.rad, pct);
                                pose_bone.local_space.shear.y.rad += tweenAngleRadians(keyframe0.shear.y.rad, keyframe1.shear.y.rad, pct);
                            });
                        }
                    });
                    this.forEachBone(function (bone, bone_key) {
                        Bone.flatten(bone, _this.bones);
                    });
                };
                Pose.prototype._strikeIkcs = function (anim) {
                    var _this = this;
                    this.data.ikcs.forEach(function (ikc, ikc_key) {
                        var ikc_target = _this.bones.get(ikc.target_key);
                        if (!ikc_target)
                            return;
                        Bone.flatten(ikc_target, _this.bones);
                        var ikc_mix = ikc.mix;
                        var ikc_bend_positive = ikc.bend_positive;
                        var ikc_timeline = anim && anim.ikc_timeline_map.get(ikc_key);
                        if (ikc_timeline) {
                            Timeline.evaluate(ikc_timeline, _this.time, function (keyframe0, keyframe1, k) {
                                ikc_mix = tween(keyframe0.mix, keyframe1.mix, keyframe0.curve.evaluate(k));
                                // no tweening ik bend direction
                                ikc_bend_positive = keyframe0.bend_positive;
                            });
                        }
                        var alpha = ikc_mix;
                        var bendDir = (ikc_bend_positive) ? (1) : (-1);
                        if (alpha === 0) {
                            return;
                        }
                        switch (ikc.bone_keys.length) {
                            case 1: {
                                var bone = _this.bones.get(ikc.bone_keys[0]);
                                if (!bone)
                                    return;
                                Bone.flatten(bone, _this.bones);
                                var a1 = Math.atan2(ikc_target.world_space.position.y - bone.world_space.position.y, ikc_target.world_space.position.x - bone.world_space.position.x);
                                var bone_parent = _this.bones.get(bone.parent_key);
                                if (bone_parent) {
                                    Bone.flatten(bone_parent, _this.bones);
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
                                var parent = _this.bones.get(ikc.bone_keys[0]);
                                if (!parent)
                                    return;
                                Bone.flatten(parent, _this.bones);
                                var child = _this.bones.get(ikc.bone_keys[1]);
                                if (!child)
                                    return;
                                Bone.flatten(child, _this.bones);
                                ///const px: number = parent.local_space.position.x;
                                ///const py: number = parent.local_space.position.y;
                                var psx = parent.local_space.scale.x;
                                var psy = parent.local_space.scale.y;
                                var cy = child.local_space.position.y;
                                var csx = child.local_space.scale.x;
                                var offset1 = 0, offset2 = 0, sign2 = 1;
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
                                var t = Vector.copy(ikc_target.world_space.position, new Vector());
                                var d = Vector.copy(child.world_space.position, new Vector());
                                var pp = _this.bones.get(parent.parent_key);
                                if (pp) {
                                    Bone.flatten(pp, _this.bones);
                                    Space.untransform(pp.world_space, t, t);
                                    Space.untransform(pp.world_space, d, d);
                                }
                                Vector.subtract(t, parent.local_space.position, t);
                                Vector.subtract(d, parent.local_space.position, d);
                                var tx = t.x, ty = t.y;
                                var dx = d.x, dy = d.y;
                                var l1 = Math.sqrt(dx * dx + dy * dy), l2 = child.length * csx, a1 = void 0, a2 = void 0;
                                outer: if (Math.abs(psx - psy) <= 0.0001) {
                                    l2 *= psx;
                                    var cos = (tx * tx + ty * ty - l1 * l1 - l2 * l2) / (2 * l1 * l2);
                                    if (cos < -1)
                                        cos = -1;
                                    else if (cos > 1)
                                        cos = 1; // clamp
                                    a2 = Math.acos(cos) * bendDir;
                                    var adj = l1 + l2 * cos;
                                    var opp = l2 * Math.sin(a2);
                                    a1 = Math.atan2(ty * adj - tx * opp, tx * adj + ty * opp);
                                }
                                else {
                                    cy = 0;
                                    var a = psx * l2;
                                    var b = psy * l2;
                                    var ta = Math.atan2(ty, tx);
                                    var aa = a * a;
                                    var bb = b * b;
                                    var ll = l1 * l1;
                                    var dd = tx * tx + ty * ty;
                                    var c0 = bb * ll + aa * dd - aa * bb;
                                    var c1 = -2 * bb * l1;
                                    var c2 = bb - aa;
                                    var _d = c1 * c1 - 4 * c2 * c0;
                                    if (_d >= 0) {
                                        var q = Math.sqrt(_d);
                                        if (c1 < 0)
                                            q = -q;
                                        q = -(c1 + q) / 2;
                                        var r0 = q / c2, r1 = c0 / q;
                                        var r = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
                                        if (r * r <= dd) {
                                            var y_1 = Math.sqrt(dd - r * r) * bendDir;
                                            a1 = ta - Math.atan2(y_1, r);
                                            a2 = Math.atan2(y_1 / psy, (r - l1) / psx);
                                            break outer;
                                        }
                                    }
                                    var minAngle = 0, minDist = Number.MAX_VALUE, minX = 0, minY = 0;
                                    var maxAngle = 0, maxDist = 0, maxX = 0, maxY = 0;
                                    var angle = void 0, dist = void 0, x = void 0, y = void 0;
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
                                var offset = Math.atan2(cy, child.local_space.position.x) * sign2;
                                a1 = (a1 - offset) + offset1;
                                a2 = (a2 + offset) * sign2 + offset2;
                                parent.local_space.rotation.rad = tweenAngleRadians(parent.local_space.rotation.rad, a1, alpha);
                                child.local_space.rotation.rad = tweenAngleRadians(child.local_space.rotation.rad, a2, alpha);
                                break;
                            }
                        }
                    });
                    this.forEachBone(function (bone, bone_key) {
                        Bone.flatten(bone, _this.bones);
                    });
                };
                Pose.prototype._strikeXfcs = function (anim) {
                    var _this = this;
                    this.data.xfcs.forEach(function (xfc, xfc_key) {
                        var xfc_target = _this.bones.get(xfc.target_key);
                        if (!xfc_target)
                            return;
                        var xfc_position_mix = xfc.position_mix;
                        var xfc_rotation_mix = xfc.rotation_mix;
                        var xfc_scale_mix = xfc.scale_mix;
                        var xfc_shear_mix = xfc.shear_mix;
                        var xfc_timeline = anim && anim.xfc_timeline_map.get(xfc_key);
                        if (xfc_timeline) {
                            Timeline.evaluate(xfc_timeline, _this.time, function (keyframe0, keyframe1, k) {
                                var pct = keyframe0.curve.evaluate(k);
                                xfc_position_mix = tween(keyframe0.position_mix, keyframe1.position_mix, pct);
                                xfc_rotation_mix = tween(keyframe0.rotation_mix, keyframe1.rotation_mix, pct);
                                xfc_scale_mix = tween(keyframe0.scale_mix, keyframe1.scale_mix, pct);
                                xfc_shear_mix = tween(keyframe0.shear_mix, keyframe1.shear_mix, pct);
                            });
                        }
                        var xfc_position = xfc.position;
                        var xfc_rotation = xfc.rotation;
                        var xfc_scale = xfc.scale;
                        var xfc_shear = xfc.shear;
                        var ta = xfc_target.world_space.affine.matrix.a, tb = xfc_target.world_space.affine.matrix.b;
                        var tc = xfc_target.world_space.affine.matrix.c, td = xfc_target.world_space.affine.matrix.d;
                        ///let degRadReflect = ta * td - tb * tc > 0 ? MathUtils.degRad : -MathUtils.degRad;
                        ///let offsetRotation = this.data.offsetRotation * degRadReflect;
                        ///let offsetShearY = this.data.offsetShearY * degRadReflect;
                        xfc.bone_keys.forEach(function (bone_key) {
                            var xfc_bone = _this.bones.get(bone_key);
                            if (!xfc_bone)
                                return;
                            if (xfc_position_mix !== 0) {
                                ///let temp = this.temp;
                                ///xfc_target.localToWorld(temp.set(xfc_position.x, xfc_position.y));
                                ///xfc_bone.world_space.affine.vector.x += (temp.x - xfc_bone.world_space.affine.vector.x) * xfc_position_mix;
                                ///xfc_bone.world_space.affine.vector.y += (temp.y - xfc_bone.world_space.affine.vector.y) * xfc_position_mix;
                                var xfc_world_position = Space.transform(xfc_target.world_space, xfc_position, new Vector());
                                xfc_bone.world_space.position.tween(xfc_world_position, xfc_position_mix, xfc_bone.world_space.position);
                            }
                            if (xfc_rotation_mix !== 0) {
                                var a = xfc_bone.world_space.affine.matrix.a; ///, b = xfc_bone.world_space.affine.matrix.b;
                                var c = xfc_bone.world_space.affine.matrix.c; ///, d = xfc_bone.world_space.affine.matrix.d;
                                var r = Math.atan2(tc, ta) - Math.atan2(c, a) + xfc_rotation.rad;
                                r = wrapAngleRadians(r);
                                r *= xfc_rotation_mix;
                                var cos = Math.cos(r), sin = Math.sin(r);
                                xfc_bone.world_space.affine.matrix.selfRotate(cos, sin);
                            }
                            if (xfc_scale_mix !== 0) {
                                var s = Math.sqrt(xfc_bone.world_space.affine.matrix.a * xfc_bone.world_space.affine.matrix.a + xfc_bone.world_space.affine.matrix.c * xfc_bone.world_space.affine.matrix.c);
                                var ts = Math.sqrt(ta * ta + tc * tc);
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
                                var b = xfc_bone.world_space.affine.matrix.b, d = xfc_bone.world_space.affine.matrix.d;
                                var by = Math.atan2(d, b);
                                var r = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(xfc_bone.world_space.affine.matrix.c, xfc_bone.world_space.affine.matrix.a));
                                r = wrapAngleRadians(r);
                                r = by + (r + xfc_shear.y.rad) * xfc_shear_mix;
                                var s = Math.sqrt(b * b + d * d);
                                xfc_bone.world_space.affine.matrix.b = Math.cos(r) * s;
                                xfc_bone.world_space.affine.matrix.d = Math.sin(r) * s;
                            }
                        });
                    });
                };
                Pose.prototype._strikeSlots = function (anim) {
                    var _this = this;
                    this.data.slots.forEach(function (data_slot, slot_key) {
                        var pose_slot = _this.slots.get(slot_key) || _this.slots.set(slot_key, new Slot());
                        // start with a copy of the data slot
                        pose_slot.copy(data_slot);
                        // tween anim slot if keyframes are available
                        var slot_timeline = anim && anim.slot_timeline_map.get(slot_key);
                        if (slot_timeline) {
                            Timeline.evaluate(slot_timeline.color_timeline, _this.time, function (keyframe0, keyframe1, k) {
                                keyframe0.color.tween(keyframe1.color, keyframe0.curve.evaluate(k), pose_slot.color);
                            });
                            Timeline.evaluate(slot_timeline.attachment_timeline, _this.time, function (keyframe0, keyframe1, k) {
                                // no tweening attachments
                                pose_slot.attachment_key = keyframe0.name;
                            });
                        }
                    });
                    this.data.slots.keys.forEach(function (key, index) { _this.slots.keys[index] = key; });
                    var order_timeline = anim && anim.order_timeline;
                    if (order_timeline) {
                        Timeline.evaluate(order_timeline, this.time, function (keyframe0, keyframe1, k) {
                            keyframe0.slot_offsets.forEach(function (slot_offset) {
                                var slot_index = _this.slots.keys.indexOf(slot_offset.slot_key);
                                if (slot_index !== -1) {
                                    // delete old position
                                    _this.slots.keys.splice(slot_index, 1);
                                    // insert new position
                                    _this.slots.keys.splice(slot_index + slot_offset.offset, 0, slot_offset.slot_key);
                                }
                            });
                        });
                    }
                };
                Pose.prototype._strikePtcs = function (anim) {
                    var _this = this;
                    var skin = this.data.skins.get(this.skin_key);
                    var default_skin = this.data.skins.get("default");
                    this.data.ptcs.forEach(function (ptc, ptc_key) {
                        var slot_key = ptc.target_key;
                        var slot = _this.slots.get(slot_key);
                        var skin_slot = (skin && skin.slots.get(slot_key)) || (default_skin && default_skin.slots.get(slot_key));
                        var ptc_target = slot && skin_slot && skin_slot.attachments.get(slot.attachment_key);
                        if (!(ptc_target instanceof PathAttachment))
                            return;
                        var ptc_spacing_mode = ptc.spacing_mode;
                        var ptc_spacing = ptc.spacing;
                        var ptc_position_mode = ptc.position_mode;
                        var ptc_position_mix = ptc.position_mix;
                        var ptc_position = ptc.position;
                        var ptc_rotation_mode = ptc.rotation_mode;
                        var ptc_rotation_mix = ptc.rotation_mix;
                        var ptc_rotation = ptc.rotation;
                        var ptc_timeline = anim && anim.ptc_timeline_map.get(ptc_key);
                        if (ptc_timeline) {
                            Timeline.evaluate(ptc_timeline.ptc_mix_timeline, _this.time, function (keyframe0, keyframe1, k) {
                                var pct = keyframe0.curve.evaluate(k);
                                ptc_position_mix = tween(keyframe0.position_mix, keyframe1.position_mix, pct);
                                ptc_rotation_mix = tween(keyframe0.rotation_mix, keyframe1.rotation_mix, pct);
                            });
                            Timeline.evaluate(ptc_timeline.ptc_spacing_timeline, _this.time, function (keyframe0, keyframe1, k) {
                                ptc_spacing = tween(keyframe0.spacing, keyframe1.spacing, keyframe0.curve.evaluate(k));
                            });
                            Timeline.evaluate(ptc_timeline.ptc_position_timeline, _this.time, function (keyframe0, keyframe1, k) {
                                ptc_position = tween(keyframe0.position, keyframe1.position, keyframe0.curve.evaluate(k));
                            });
                            Timeline.evaluate(ptc_timeline.ptc_rotation_timeline, _this.time, function (keyframe0, keyframe1, k) {
                                ptc_rotation.rad = tweenAngleRadians(keyframe0.rotation.rad, keyframe1.rotation.rad, keyframe0.curve.evaluate(k));
                            });
                        }
                        ptc.bone_keys.forEach(function (bone_key) {
                            var ptc_bone = _this.bones.get(bone_key);
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
                };
                Pose.prototype._strikeEvents = function (anim) {
                    var _this = this;
                    this.events.clear();
                    if (anim && anim.event_timeline) {
                        var make_event_1 = function (event_keyframe) {
                            var pose_event = new Event();
                            var data_event = _this.data.events.get(event_keyframe.name);
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
                                anim.event_timeline.keyframes.forEach(function (event_keyframe) {
                                    if (((anim.range.min <= event_keyframe.time) && (event_keyframe.time < _this.prev_time)) ||
                                        ((_this.time <= event_keyframe.time) && (event_keyframe.time <= anim.range.max))) {
                                        _this.events.set(event_keyframe.name, make_event_1(event_keyframe));
                                    }
                                });
                            }
                            else {
                                // min       time          prev_time    max
                                //  |         |                |         |
                                //            o<---------------x
                                // all events between time and prev_time, not including prev_time
                                anim.event_timeline.keyframes.forEach(function (event_keyframe) {
                                    if ((_this.time <= event_keyframe.time) && (event_keyframe.time < _this.prev_time)) {
                                        _this.events.set(event_keyframe.name, make_event_1(event_keyframe));
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
                                anim.event_timeline.keyframes.forEach(function (event_keyframe) {
                                    if (((anim.range.min <= event_keyframe.time) && (event_keyframe.time <= _this.time)) ||
                                        ((_this.prev_time < event_keyframe.time) && (event_keyframe.time <= anim.range.max))) {
                                        _this.events.set(event_keyframe.name, make_event_1(event_keyframe));
                                    }
                                });
                            }
                            else {
                                // min    prev_time           time      max
                                //  |         |                |         |
                                //            x--------------->o
                                // all events between prev_time and time, not including prev_time
                                anim.event_timeline.keyframes.forEach(function (event_keyframe) {
                                    if ((_this.prev_time < event_keyframe.time) && (event_keyframe.time <= _this.time)) {
                                        _this.events.set(event_keyframe.name, make_event_1(event_keyframe));
                                    }
                                });
                            }
                        }
                    }
                };
                Pose.prototype.iterateBones = function (callback) {
                    this.forEachBone(function (bone, bone_key) {
                        callback(bone_key, bone);
                    });
                };
                Pose.prototype.forEachBone = function (callback) {
                    this.bones.forEach(callback);
                };
                Pose.prototype.iterateAttachments = function (callback) {
                    this.forEachAttachment(function (attachment, attachment_key, slot, slot_key, skin_slot) {
                        callback(slot_key, slot, skin_slot, attachment_key, attachment);
                    });
                };
                Pose.prototype.forEachAttachment = function (callback) {
                    var skin = this.data.skins.get(this.skin_key);
                    var default_skin = this.data.skins.get("default");
                    this.slots.forEach(function (slot, slot_key) {
                        var skin_slot = (skin && skin.slots.get(slot_key)) || (default_skin && default_skin.slots.get(slot_key));
                        var attachment = skin_slot && skin_slot.attachments.get(slot.attachment_key);
                        var attachment_key = (attachment && attachment.name) || slot.attachment_key;
                        if (attachment && (attachment.type === "linkedmesh")) {
                            attachment_key = attachment.parent_key;
                            attachment = skin_slot && skin_slot.attachments.get(attachment_key);
                        }
                        callback(attachment, attachment_key, slot, slot_key, skin_slot);
                    });
                };
                Pose.prototype.iterateEvents = function (callback) {
                    this.forEachEvent(function (event, event_key) {
                        callback(event_key, event);
                    });
                };
                Pose.prototype.forEachEvent = function (callback) {
                    this.events.forEach(callback);
                };
                return Pose;
            }());
            exports_1("Pose", Pose);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwQkc7Ozs7Ozs7Ozs7Ozs7SUF3RUgsa0JBQXlCLElBQTBCLEVBQUUsR0FBb0IsRUFBRSxHQUFvQjtRQUFwQixvQkFBQSxFQUFBLFdBQW9CO1FBQzdGLElBQU0sS0FBSyxHQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsQ0FBQyxPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLEtBQUssUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEtBQUssS0FBSyxNQUFNLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQ3hELEtBQUssU0FBUyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDN0IsU0FBUyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ3RCLENBQUM7SUFDSCxDQUFDOztJQUVELGtCQUF5QixJQUEwQixFQUFFLEdBQW9CLEVBQUUsS0FBYyxFQUFFLEdBQW9CO1FBQXBCLG9CQUFBLEVBQUEsV0FBb0I7UUFDN0csRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDcEIsQ0FBQztJQUNILENBQUM7O0lBRUQsbUJBQTBCLElBQTBCLEVBQUUsR0FBb0IsRUFBRSxHQUFlO1FBQWYsb0JBQUEsRUFBQSxPQUFlO1FBQ3pGLElBQU0sS0FBSyxHQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsQ0FBQyxPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLEtBQUssUUFB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O29DQUNWLElBQUksR0FBRyxHQUFXLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztvQ0FDMUUsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztvQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQzt3Q0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUTtvQ0FDM0QsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO29DQUM5QixJQUFNLEdBQUcsR0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQztvQ0FDbEMsSUFBTSxHQUFHLEdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7b0NBQ3RDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztnQ0FDNUQsQ0FBQztnQ0FBQyxJQUFJLENBQUMsQ0FBQztvQ0FDTixFQUFFLEdBQUcsQ0FBQyxDQUFDO29DQUNQLElBQU0sQ0FBQyxHQUFXLEdBQUcsR0FBRyxFQUFFLENBQUM7b0NBQzNCLElBQU0sQ0FBQyxHQUFXLEdBQUcsR0FBRyxFQUFFLENBQUM7b0NBQzNCLElBQU0sRUFBRSxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29DQUN0QyxJQUFNLEVBQUUsR0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29DQUN6QixJQUFNLEVBQUUsR0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29DQUN6QixJQUFNLEVBQUUsR0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDO29DQUMzQixJQUFNLEVBQUUsR0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7b0NBQ3JDLElBQU0sRUFBRSxHQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO29DQUMvQyxJQUFNLEVBQUUsR0FBVyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO29DQUNoQyxJQUFNLEVBQUUsR0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDO29DQUMzQixJQUFNLEVBQUUsR0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO29DQUN6QyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3Q0FDWixJQUFJLENBQUMsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dDQUM5QixFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3Q0FDbkIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dDQUNsQixJQUFNLEVBQUUsR0FBVyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dDQUN2QyxJQUFNLENBQUMsR0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzt3Q0FDeEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDOzRDQUNoQixJQUFNLEdBQUMsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDOzRDQUNsRCxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzRDQUMzQixFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDOzRDQUN6QyxLQUFLLENBQUMsS0FBSyxDQUFDO3dDQUNkLENBQUM7b0NBQ0gsQ0FBQztvQ0FDRCxJQUFJLFFBQVEsR0FBVyxDQUFDLEVBQUUsT0FBTyxHQUFXLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxHQUFXLENBQUMsRUFBRSxJQUFJLEdBQVcsQ0FBQyxDQUFDO29DQUNqRyxJQUFJLFFBQVEsR0FBVyxDQUFDLEVBQUUsT0FBTyxHQUFXLENBQUMsRUFBRSxJQUFJLEdBQVcsQ0FBQyxFQUFFLElBQUksR0FBVyxDQUFDLENBQUM7b0NBQ2xGLElBQUksS0FBSyxTQUFRLEVBQUUsSUFBSSxTQUFRLEVBQUUsQ0FBQyxTQUFRLEVBQUUsQ0FBQyxTQUFRLENBQUM7b0NBQ3RELENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29DQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29DQUN6QixFQUFFLENBQUMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQzt3Q0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO3dDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7d0NBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztvQ0FBQyxDQUFDO29DQUMvRCxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztvQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQ0FDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0NBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7d0NBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzt3Q0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO29DQUFDLENBQUM7b0NBQ3JFLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO29DQUN2QyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO29DQUM3QixDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7b0NBQ3hCLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0NBQ3JCLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDO3dDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7d0NBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzt3Q0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO3dDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7b0NBQUMsQ0FBQztvQ0FDN0UsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0NBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzt3Q0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO3dDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7d0NBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztvQ0FBQyxDQUFDO29DQUM3RSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3Q0FDbEMsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7d0NBQzNDLEVBQUUsR0FBRyxRQUFRLEdBQUcsT0FBTyxDQUFDO29DQUMxQixDQUFDO29DQUFDLElBQUksQ0FBQyxDQUFDO3dDQUNOLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO3dDQUMzQyxFQUFFLEdBQUcsUUFBUSxHQUFHLE9BQU8sQ0FBQztvQ0FDMUIsQ0FBQztnQ0FDSCxDQUFDO2dDQUNELElBQU0sTUFBTSxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQ0FDNUUsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQ0FDN0IsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUM7Z0NBQ3JDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dDQUNoRyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztnQ0FDOUYsS0FBSyxDQUFDOzRCQUNSLENBQUM7d0JBQ0gsQ0FBQztvQkFDSCxDQUFDLENBQUMsQ0FBQztvQkFFSCxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQUMsSUFBVSxFQUFFLFFBQWdCO3dCQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2pDLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUM7Z0JBRU8sMEJBQVcsR0FBbkIsVUFBb0IsSUFBMkI7b0JBQS9DLGlCQWdGQztvQkEvRUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBUSxFQUFFLE9BQWU7d0JBQy9DLElBQU0sVUFBVSxHQUFxQixLQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQ3BFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDOzRCQUFDLE1BQU0sQ0FBQzt3QkFFeEIsSUFBSSxnQkFBZ0IsR0FBVyxHQUFHLENBQUMsWUFBWSxDQUFDO3dCQUNoRCxJQUFJLGdCQUFnQixHQUFXLEdBQUcsQ0FBQyxZQUFZLENBQUM7d0JBQ2hELElBQUksYUFBYSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUM7d0JBQzFDLElBQUksYUFBYSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUM7d0JBRTFDLElBQU0sWUFBWSxHQUE0QixJQUFJLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDekYsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzs0QkFDakIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsS0FBSSxDQUFDLElBQUksRUFBRSxVQUFDLFNBQXNCLEVBQUUsU0FBc0IsRUFBRSxDQUFTO2dDQUNuRyxJQUFNLEdBQUcsR0FBVyxTQUFTLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDaEQsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztnQ0FDOUUsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztnQ0FDOUUsYUFBYSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0NBQ3JFLGFBQWEsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUN2RSxDQUFDLENBQUMsQ0FBQzt3QkFDTCxDQUFDO3dCQUVELElBQU0sWUFBWSxHQUFhLEdBQUcsQ0FBQyxRQUFRLENBQUM7d0JBQzVDLElBQU0sWUFBWSxHQUFhLEdBQUcsQ0FBQyxRQUFRLENBQUM7d0JBQzVDLElBQU0sU0FBUyxHQUFVLEdBQUcsQ0FBQyxLQUFLLENBQUM7d0JBQ25DLElBQU0sU0FBUyxHQUFVLEdBQUcsQ0FBQyxLQUFLLENBQUM7d0JBRW5DLElBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQzdGLElBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQzdGLG9GQUFvRjt3QkFDcEYsaUVBQWlFO3dCQUNqRSw2REFBNkQ7d0JBRTdELEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBZ0I7NEJBQ3JDLElBQU0sUUFBUSxHQUFxQixLQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzs0QkFDNUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0NBQUMsTUFBTSxDQUFDOzRCQUV0QixFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUMzQix3QkFBd0I7Z0NBQ3hCLHFFQUFxRTtnQ0FDckUsOEdBQThHO2dDQUM5Ryw4R0FBOEc7Z0NBQzlHLElBQU0sa0JBQWtCLEdBQVcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0NBQ3ZHLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzRCQUMzRyxDQUFDOzRCQUVELEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQzNCLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyw4Q0FBOEM7Z0NBQzVGLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyw4Q0FBOEM7Z0NBQzVGLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUM7Z0NBQ2pFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDeEIsQ0FBQyxJQUFJLGdCQUFnQixDQUFDO2dDQUN0QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUN6QyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDMUQsQ0FBQzs0QkFFRCxFQUFFLENBQUMsQ0FBQyxhQUFhLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDeEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQzdLLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0NBQ3RDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7b0NBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dDQUN0RSxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQ0FDMUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQzFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDekssRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0NBQ2xDLEVBQUUs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