System.register([], function (exports_1, context_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
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
    function BezierCurve(x1, y1, x2, y2, epsilon) {
        if (epsilon === void 0) { epsilon = EPSILON; }
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
            return curveY(t2);
        };
    }
    exports_1("BezierCurve", BezierCurve);
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
            return y + (1 - y) * (percent - x) / (1 - x);
        };
    }
    exports_1("StepBezierCurve", StepBezierCurve);
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
    function tweenAngle(a, b, t) {
        return wrapAngleRadians(a + (wrapAngleRadians(b - a) * t));
    }
    exports_1("tweenAngle", tweenAngle);
    function signum(n) { return (n < 0) ? (-1) : (n > 0) ? (1) : (n); }
    exports_1("signum", signum);
    var EPSILON, Color, Curve, Angle, Vector, Matrix, Affine, Position, Rotation, Scale, Shear, Space, Bone, Ikc, Xfc, Ptc, Slot, Attachment, RegionAttachment, BoundingBoxAttachment, MeshAttachment, LinkedMeshAttachment, WeightedMeshAttachment, WeightedLinkedMeshAttachment, PathAttachment, SkinSlot, Skin, Event, Keyframe, BoneKeyframe, PositionKeyframe, RotationKeyframe, ScaleKeyframe, ShearKeyframe, BoneTimeline, SlotKeyframe, ColorKeyframe, AttachmentKeyframe, SlotTimeline, EventKeyframe, SlotOffset, OrderKeyframe, IkcKeyframe, IkcTimeline, XfcKeyframe, XfcTimeline, PtcKeyframe, PtcSpacingKeyframe, PtcPositionKeyframe, PtcRotationKeyframe, PtcTimeline, FfdKeyframe, FfdAttachment, FfdSlot, FfdTimeline, Animation, Skeleton, Data, Pose;
    return {
        setters: [],
        execute: function () {
            exports_1("EPSILON", EPSILON = 1e-6);
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
                Color.prototype.load = function (json) {
                    var rgba = 0xffffffff;
                    switch (typeof (json)) {
                        case "string":
                            rgba = parseInt(json, 16);
                            break;
                        case "number":
                            rgba = 0 | json;
                            break;
                    }
                    this.r = ((rgba >> 24) & 0xff) / 255;
                    this.g = ((rgba >> 16) & 0xff) / 255;
                    this.b = ((rgba >> 8) & 0xff) / 255;
                    this.a = (rgba & 0xff) / 255;
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
                return Color;
            }());
            exports_1("Color", Color);
            Curve = (function () {
                function Curve() {
                    this.evaluate = function (t) { return t; };
                }
                Curve.prototype.load = function (json) {
                    this.evaluate = function (t) { return t; };
                    if ((typeof (json) === "string") && (json === "stepped")) {
                        this.evaluate = function (t) { return 0; };
                    }
                    else if ((typeof (json) === "object") && (typeof (json.length) === "number") && (json.length === 4)) {
                        var x1 = loadFloat(json, 0, 0);
                        var y1 = loadFloat(json, 1, 0);
                        var x2 = loadFloat(json, 2, 1);
                        var y2 = loadFloat(json, 3, 1);
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
                    out.rad = tweenAngle(a.rad, b.rad, pct);
                    return out;
                };
                Angle.prototype.tween = function (other, pct, out) {
                    if (out === void 0) { out = new Angle(); }
                    return Angle.tween(this, other, pct, out);
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
                    var _this = _super.call(this, 0) || this;
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
                    return _super.call(this) || this;
                }
                Object.defineProperty(Scale.prototype, "x", {
                    get: function () { return (this.c === 0) ? (this.a) : (signum(this.a) * Math.sqrt(this.a * this.a + this.c * this.c)); },
                    set: function (value) { this.a = value; this.c = 0; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Scale.prototype, "y", {
                    get: function () { return (this.b === 0) ? (this.d) : (signum(this.d) * Math.sqrt(this.b * this.b + this.d * this.d)); },
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
                Space.tween = function (a, b, tween, out) {
                    if (out === void 0) { out = new Space(); }
                    a.position.tween(b.position, tween, out.position);
                    a.rotation.tween(b.rotation, tween, out.rotation);
                    a.scale.tween(b.scale, tween, out.scale);
                    a.shear.tween(b.shear, tween, out.shear);
                    return out;
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
                    this.color.load(json.color || 0x9b9b9bff);
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
                    var parent = bones[bone.parent_key];
                    if (!parent) {
                        bws.copy(bls);
                        bws.updateAffine();
                    }
                    else {
                        Bone.flatten(parent, bones);
                        var pws = parent.world_space;
                        Space.transform(pws, bls.position, bws.position);
                        if (bone.inherit_rotation && bone.inherit_scale) {
                            Matrix.copy(pws.affine.matrix, bws.affine.matrix);
                        }
                        else if (bone.inherit_rotation) {
                            Matrix.identity(bws.affine.matrix);
                            while (parent && parent.inherit_rotation) {
                                var pls = parent.local_space;
                                Matrix.rotate(bws.affine.matrix, pls.rotation.cos, pls.rotation.sin, bws.affine.matrix);
                                parent = bones[parent.parent_key];
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
                                parent = bones[parent.parent_key];
                            }
                        }
                        else {
                            Matrix.identity(bws.affine.matrix);
                        }
                        bls.updateAffine();
                        Matrix.multiply(bws.affine.matrix, bls.affine.matrix, bws.affine.matrix);
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
            Ikc = (function () {
                function Ikc() {
                    this.name = "";
                    this.order = 0;
                    this.bone_keys = [];
                    this.target_key = "";
                    this.mix = 1;
                    this.bend_positive = true;
                }
                Ikc.prototype.load = function (json) {
                    this.name = loadString(json, "name", "");
                    this.order = loadInt(json, "order", 0);
                    this.bone_keys = json["bones"] || [];
                    this.target_key = loadString(json, "target", "");
                    this.mix = loadFloat(json, "mix", 1);
                    this.bend_positive = loadBool(json, "bendPositive", true);
                    return this;
                };
                return Ikc;
            }());
            exports_1("Ikc", Ikc);
            Xfc = (function () {
                function Xfc() {
                    this.name = "";
                    this.order = 0;
                    this.bone_key = "";
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
                Xfc.prototype.load = function (json) {
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
                };
                return Xfc;
            }());
            exports_1("Xfc", Xfc);
            Ptc = (function () {
                function Ptc() {
                    this.name = "";
                    this.order = 0;
                    this.bone_keys = [];
                    this.target_key = "";
                    this.spacing_mode = "length";
                    this.spacing = 0;
                    this.position_mode = "percent";
                    this.position_mix = 1;
                    this.position = 0;
                    this.rotation_mode = "tangent";
                    this.rotation_mix = 1;
                    this.rotation = new Rotation();
                }
                Ptc.prototype.load = function (json) {
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
                };
                return Ptc;
            }());
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
                    this.path = "";
                    this.type = type;
                }
                Attachment.prototype.load = function (json) {
                    var attachment_type = loadString(json, "type", "region");
                    if (attachment_type !== this.type) {
                        throw new Error();
                    }
                    this.name = loadString(json, "name", "");
                    this.path = loadString(json, "path", "");
                    return this;
                };
                return Attachment;
            }());
            exports_1("Attachment", Attachment);
            RegionAttachment = (function (_super) {
                __extends(RegionAttachment, _super);
                function RegionAttachment() {
                    var _this = _super.call(this, "region") || this;
                    _this.color = new Color();
                    _this.local_space = new Space();
                    _this.width = 0;
                    _this.height = 0;
                    return _this;
                }
                RegionAttachment.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
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
                    _this.vertices = [];
                    return _this;
                }
                BoundingBoxAttachment.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.vertices = json.vertices || [];
                    return this;
                };
                return BoundingBoxAttachment;
            }(Attachment));
            exports_1("BoundingBoxAttachment", BoundingBoxAttachment);
            MeshAttachment = (function (_super) {
                __extends(MeshAttachment, _super);
                function MeshAttachment() {
                    var _this = _super.call(this, "mesh") || this;
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
            WeightedLinkedMeshAttachment = (function (_super) {
                __extends(WeightedLinkedMeshAttachment, _super);
                function WeightedLinkedMeshAttachment() {
                    var _this = _super.call(this, "weightedlinkedmesh") || this;
                    _this.skin_key = "";
                    _this.parent_key = "";
                    _this.inherit_deform = true;
                    _this.width = 0;
                    _this.height = 0;
                    return _this;
                }
                WeightedLinkedMeshAttachment.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.skin_key = loadString(json, "skin", "");
                    this.parent_key = loadString(json, "parent", "");
                    this.inherit_deform = loadBool(json, "ffd", true);
                    this.width = loadInt(json, "width", 0);
                    this.height = loadInt(json, "height", 0);
                    return this;
                };
                return WeightedLinkedMeshAttachment;
            }(Attachment));
            exports_1("WeightedLinkedMeshAttachment", WeightedLinkedMeshAttachment);
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
                    this.color.load(json.color);
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
                    this.attachments = {};
                    this.attachment_keys = [];
                }
                SkinSlot.prototype.load = function (json) {
                    var _this = this;
                    this.attachment_keys = Object.keys(json || {});
                    this.attachment_keys.forEach(function (attachment_key) {
                        var json_attachment = json[attachment_key];
                        switch (json_attachment.type) {
                            default:
                            case "region":
                                _this.attachments[attachment_key] = new RegionAttachment().load(json_attachment);
                                break;
                            case "boundingbox":
                                _this.attachments[attachment_key] = new BoundingBoxAttachment().load(json_attachment);
                                break;
                            case "mesh":
                                if (json_attachment.vertices.length === json_attachment.uvs.length) {
                                    _this.attachments[attachment_key] = new MeshAttachment().load(json_attachment);
                                }
                                else {
                                    json_attachment.type = "weightedmesh";
                                    _this.attachments[attachment_key] = new WeightedMeshAttachment().load(json_attachment);
                                }
                                break;
                            case "linkedmesh":
                                if (json_attachment.vertices.length === json_attachment.uvs.length) {
                                    _this.attachments[attachment_key] = new LinkedMeshAttachment().load(json_attachment);
                                }
                                else {
                                    json_attachment.type = "weightedlinkedmesh";
                                    _this.attachments[attachment_key] = new WeightedLinkedMeshAttachment().load(json_attachment);
                                }
                                break;
                            case "skinnedmesh":
                                json_attachment.type = "weightedmesh";
                            case "weightedmesh":
                                _this.attachments[attachment_key] = new WeightedMeshAttachment().load(json_attachment);
                                break;
                            case "weightedlinkedmesh":
                                _this.attachments[attachment_key] = new WeightedLinkedMeshAttachment().load(json_attachment);
                                break;
                            case "path":
                                _this.attachments[attachment_key] = new PathAttachment().load(json_attachment);
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
                    this.slots = {};
                    this.slot_keys = [];
                }
                Skin.prototype.load = function (json) {
                    var _this = this;
                    this.name = loadString(json, "name", "");
                    this.slot_keys = Object.keys(json || {});
                    this.slot_keys.forEach(function (slot_key) {
                        _this.slots[slot_key] = new SkinSlot().load(json[slot_key]);
                    });
                    return this;
                };
                Skin.prototype.iterateAttachments = function (callback) {
                    var _this = this;
                    this.slot_keys.forEach(function (slot_key) {
                        var skin_slot = _this.slots[slot_key];
                        skin_slot.attachment_keys.forEach(function (attachment_key) {
                            var attachment = skin_slot.attachments[attachment_key];
                            callback(slot_key, skin_slot, attachment.name || attachment_key, attachment);
                        });
                    });
                };
                return Skin;
            }());
            exports_1("Skin", Skin);
            Event = (function () {
                function Event() {
                    this.name = "";
                    this.int_value = 0;
                    this.float_value = 0;
                    this.string_value = "";
                }
                Event.prototype.copy = function (other) {
                    this.name = other.name;
                    this.int_value = other.int_value;
                    this.float_value = other.float_value;
                    this.string_value = other.string_value;
                    return this;
                };
                Event.prototype.load = function (json) {
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
                };
                return Event;
            }());
            exports_1("Event", Event);
            Keyframe = (function () {
                function Keyframe() {
                    this.time = 0;
                }
                Keyframe.prototype.drop = function () {
                    this.time = 0;
                    return this;
                };
                Keyframe.prototype.load = function (json) {
                    this.time = 1000 * loadFloat(json, "time", 0);
                    return this;
                };
                Keyframe.prototype.save = function (json) {
                    saveFloat(json, "time", this.time / 1000, 0);
                    return this;
                };
                Keyframe.find = function (array, time) {
                    if (!array) {
                        return -1;
                    }
                    if (array.length <= 0) {
                        return -1;
                    }
                    if (time < array[0].time) {
                        return -1;
                    }
                    var last = array.length - 1;
                    if (time >= array[last].time) {
                        return last;
                    }
                    var lo = 0;
                    var hi = last;
                    if (hi === 0) {
                        return 0;
                    }
                    var current = hi >> 1;
                    while (true) {
                        if (array[current + 1].time <= time) {
                            lo = current + 1;
                        }
                        else {
                            hi = current;
                        }
                        if (lo === hi) {
                            return lo;
                        }
                        current = (lo + hi) >> 1;
                    }
                };
                Keyframe.compare = function (a, b) {
                    return a.time - b.time;
                };
                return Keyframe;
            }());
            exports_1("Keyframe", Keyframe);
            BoneKeyframe = (function (_super) {
                __extends(BoneKeyframe, _super);
                function BoneKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.curve = new Curve();
                    return _this;
                }
                BoneKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.curve.load(json.curve);
                    return this;
                };
                return BoneKeyframe;
            }(Keyframe));
            exports_1("BoneKeyframe", BoneKeyframe);
            PositionKeyframe = (function (_super) {
                __extends(PositionKeyframe, _super);
                function PositionKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.position = new Position();
                    return _this;
                }
                PositionKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.position.x = loadFloat(json, "x", 0);
                    this.position.y = loadFloat(json, "y", 0);
                    return this;
                };
                return PositionKeyframe;
            }(BoneKeyframe));
            exports_1("PositionKeyframe", PositionKeyframe);
            RotationKeyframe = (function (_super) {
                __extends(RotationKeyframe, _super);
                function RotationKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.rotation = new Rotation();
                    return _this;
                }
                RotationKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.rotation.deg = loadFloat(json, "angle", 0);
                    return this;
                };
                return RotationKeyframe;
            }(BoneKeyframe));
            exports_1("RotationKeyframe", RotationKeyframe);
            ScaleKeyframe = (function (_super) {
                __extends(ScaleKeyframe, _super);
                function ScaleKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.scale = new Scale();
                    return _this;
                }
                ScaleKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.scale.x = loadFloat(json, "x", 1);
                    this.scale.y = loadFloat(json, "y", 1);
                    return this;
                };
                return ScaleKeyframe;
            }(BoneKeyframe));
            exports_1("ScaleKeyframe", ScaleKeyframe);
            ShearKeyframe = (function (_super) {
                __extends(ShearKeyframe, _super);
                function ShearKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.shear = new Shear();
                    return _this;
                }
                ShearKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.shear.x.deg = loadFloat(json, "x", 0);
                    this.shear.y.deg = loadFloat(json, "y", 0);
                    return this;
                };
                return ShearKeyframe;
            }(BoneKeyframe));
            exports_1("ShearKeyframe", ShearKeyframe);
            BoneTimeline = (function () {
                function BoneTimeline() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                BoneTimeline.prototype.load = function (json) {
                    var _this = this;
                    this.min_time = 0;
                    this.max_time = 0;
                    delete this.position_keyframes;
                    delete this.rotation_keyframes;
                    delete this.scale_keyframes;
                    delete this.shear_keyframes;
                    Object.keys(json || {}).forEach(function (key) {
                        switch (key) {
                            case "translate":
                                _this.position_keyframes = [];
                                json.translate.forEach(function (translate_json) {
                                    var position_keyframe = new PositionKeyframe().load(translate_json);
                                    _this.position_keyframes.push(position_keyframe);
                                    _this.min_time = Math.min(_this.min_time, position_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, position_keyframe.time);
                                });
                                _this.position_keyframes.sort(Keyframe.compare);
                                break;
                            case "rotate":
                                _this.rotation_keyframes = [];
                                json.rotate.forEach(function (rotate_json) {
                                    var rotation_keyframe = new RotationKeyframe().load(rotate_json);
                                    _this.rotation_keyframes.push(rotation_keyframe);
                                    _this.min_time = Math.min(_this.min_time, rotation_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, rotation_keyframe.time);
                                });
                                _this.rotation_keyframes.sort(Keyframe.compare);
                                break;
                            case "scale":
                                _this.scale_keyframes = [];
                                json.scale.forEach(function (scale_json) {
                                    var scale_keyframe = new ScaleKeyframe().load(scale_json);
                                    _this.scale_keyframes.push(scale_keyframe);
                                    _this.min_time = Math.min(_this.min_time, scale_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, scale_keyframe.time);
                                });
                                _this.scale_keyframes.sort(Keyframe.compare);
                                break;
                            case "shear":
                                _this.shear_keyframes = [];
                                json.shear.forEach(function (shear_json) {
                                    var shear_keyframe = new ShearKeyframe().load(shear_json);
                                    _this.shear_keyframes.push(shear_keyframe);
                                    _this.min_time = Math.min(_this.min_time, shear_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, shear_keyframe.time);
                                });
                                _this.shear_keyframes.sort(Keyframe.compare);
                                break;
                            default:
                                console.log("TODO: BoneTimeline::load", key);
                                break;
                        }
                    });
                    return this;
                };
                return BoneTimeline;
            }());
            exports_1("BoneTimeline", BoneTimeline);
            SlotKeyframe = (function (_super) {
                __extends(SlotKeyframe, _super);
                function SlotKeyframe() {
                    return _super.call(this) || this;
                }
                SlotKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    return this;
                };
                return SlotKeyframe;
            }(Keyframe));
            exports_1("SlotKeyframe", SlotKeyframe);
            ColorKeyframe = (function (_super) {
                __extends(ColorKeyframe, _super);
                function ColorKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.curve = new Curve();
                    _this.color = new Color();
                    return _this;
                }
                ColorKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.curve.load(json.curve);
                    this.color.load(json.color);
                    return this;
                };
                return ColorKeyframe;
            }(SlotKeyframe));
            exports_1("ColorKeyframe", ColorKeyframe);
            AttachmentKeyframe = (function (_super) {
                __extends(AttachmentKeyframe, _super);
                function AttachmentKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.name = "";
                    return _this;
                }
                AttachmentKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.name = loadString(json, "name", "");
                    return this;
                };
                return AttachmentKeyframe;
            }(SlotKeyframe));
            exports_1("AttachmentKeyframe", AttachmentKeyframe);
            SlotTimeline = (function () {
                function SlotTimeline() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                SlotTimeline.prototype.load = function (json) {
                    var _this = this;
                    this.min_time = 0;
                    this.max_time = 0;
                    delete this.color_keyframes;
                    delete this.attachment_keyframes;
                    Object.keys(json || {}).forEach(function (key) {
                        switch (key) {
                            case "color":
                                _this.color_keyframes = [];
                                json[key].forEach(function (color) {
                                    var color_keyframe = new ColorKeyframe().load(color);
                                    _this.min_time = Math.min(_this.min_time, color_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, color_keyframe.time);
                                    _this.color_keyframes.push(color_keyframe);
                                });
                                _this.color_keyframes.sort(Keyframe.compare);
                                break;
                            case "attachment":
                                _this.attachment_keyframes = [];
                                json[key].forEach(function (attachment) {
                                    var attachment_keyframe = new AttachmentKeyframe().load(attachment);
                                    _this.min_time = Math.min(_this.min_time, attachment_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, attachment_keyframe.time);
                                    _this.attachment_keyframes.push(attachment_keyframe);
                                });
                                _this.attachment_keyframes.sort(Keyframe.compare);
                                break;
                            default:
                                console.log("TODO: SlotTimeline::load", key);
                                break;
                        }
                    });
                    return this;
                };
                return SlotTimeline;
            }());
            exports_1("SlotTimeline", SlotTimeline);
            EventKeyframe = (function (_super) {
                __extends(EventKeyframe, _super);
                function EventKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.name = "";
                    _this.int_value = 0;
                    _this.float_value = 0;
                    _this.string_value = "";
                    return _this;
                }
                EventKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
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
                };
                return EventKeyframe;
            }(Keyframe));
            exports_1("EventKeyframe", EventKeyframe);
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
                    var _this = _super.call(this) || this;
                    _this.slot_offsets = [];
                    return _this;
                }
                OrderKeyframe.prototype.load = function (json) {
                    var _this = this;
                    _super.prototype.load.call(this, json);
                    this.slot_offsets = [];
                    Object.keys(json || {}).forEach(function (key) {
                        switch (key) {
                            case "offsets":
                                json[key].forEach(function (offset) {
                                    _this.slot_offsets.push(new SlotOffset().load(offset));
                                });
                                break;
                        }
                    });
                    return this;
                };
                return OrderKeyframe;
            }(Keyframe));
            exports_1("OrderKeyframe", OrderKeyframe);
            IkcKeyframe = (function (_super) {
                __extends(IkcKeyframe, _super);
                function IkcKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.curve = new Curve();
                    _this.mix = 1;
                    _this.bend_positive = true;
                    return _this;
                }
                IkcKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.curve.load(json.curve);
                    this.mix = loadFloat(json, "mix", 1);
                    this.bend_positive = loadBool(json, "bendPositive", true);
                    return this;
                };
                return IkcKeyframe;
            }(Keyframe));
            exports_1("IkcKeyframe", IkcKeyframe);
            IkcTimeline = (function () {
                function IkcTimeline() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                IkcTimeline.prototype.load = function (json) {
                    var _this = this;
                    this.min_time = 0;
                    this.max_time = 0;
                    this.ikc_keyframes = [];
                    json.forEach(function (ikc) {
                        var ikc_keyframe = new IkcKeyframe().load(ikc);
                        _this.min_time = Math.min(_this.min_time, ikc_keyframe.time);
                        _this.max_time = Math.max(_this.max_time, ikc_keyframe.time);
                        _this.ikc_keyframes.push(ikc_keyframe);
                    });
                    this.ikc_keyframes.sort(Keyframe.compare);
                    return this;
                };
                return IkcTimeline;
            }());
            exports_1("IkcTimeline", IkcTimeline);
            XfcKeyframe = (function (_super) {
                __extends(XfcKeyframe, _super);
                function XfcKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.curve = new Curve();
                    _this.position_mix = 1;
                    _this.rotation_mix = 1;
                    _this.scale_mix = 1;
                    _this.shear_mix = 1;
                    return _this;
                }
                XfcKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.curve.load(json.curve);
                    this.position_mix = loadFloat(json, "translateMix", 1);
                    this.rotation_mix = loadFloat(json, "rotateMix", 1);
                    this.scale_mix = loadFloat(json, "scaleMix", 1);
                    this.shear_mix = loadFloat(json, "shearMix", 1);
                    return this;
                };
                return XfcKeyframe;
            }(Keyframe));
            exports_1("XfcKeyframe", XfcKeyframe);
            XfcTimeline = (function () {
                function XfcTimeline() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                XfcTimeline.prototype.load = function (json) {
                    var _this = this;
                    this.min_time = 0;
                    this.max_time = 0;
                    this.xfc_keyframes = [];
                    json.forEach(function (xfc) {
                        var xfc_keyframe = new XfcKeyframe().load(xfc);
                        _this.min_time = Math.min(_this.min_time, xfc_keyframe.time);
                        _this.max_time = Math.max(_this.max_time, xfc_keyframe.time);
                        _this.xfc_keyframes.push(xfc_keyframe);
                    });
                    this.xfc_keyframes.sort(Keyframe.compare);
                    return this;
                };
                return XfcTimeline;
            }());
            exports_1("XfcTimeline", XfcTimeline);
            PtcKeyframe = (function (_super) {
                __extends(PtcKeyframe, _super);
                function PtcKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.curve = new Curve();
                    return _this;
                }
                PtcKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.curve.load(json.curve);
                    return this;
                };
                return PtcKeyframe;
            }(Keyframe));
            exports_1("PtcKeyframe", PtcKeyframe);
            PtcSpacingKeyframe = (function (_super) {
                __extends(PtcSpacingKeyframe, _super);
                function PtcSpacingKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.spacing = 0;
                    return _this;
                }
                PtcSpacingKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.spacing = loadFloat(json, "spacing", 0);
                    return this;
                };
                return PtcSpacingKeyframe;
            }(PtcKeyframe));
            exports_1("PtcSpacingKeyframe", PtcSpacingKeyframe);
            PtcPositionKeyframe = (function (_super) {
                __extends(PtcPositionKeyframe, _super);
                function PtcPositionKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.position_mix = 1;
                    _this.position = 0;
                    return _this;
                }
                PtcPositionKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.position_mix = loadFloat(json, "positionMix", 1);
                    this.position = loadFloat(json, "position", 0);
                    return this;
                };
                return PtcPositionKeyframe;
            }(PtcKeyframe));
            exports_1("PtcPositionKeyframe", PtcPositionKeyframe);
            PtcRotationKeyframe = (function (_super) {
                __extends(PtcRotationKeyframe, _super);
                function PtcRotationKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.rotation_mix = 1;
                    _this.rotation = 0;
                    return _this;
                }
                PtcRotationKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.rotation_mix = loadFloat(json, "rotationMix", 1);
                    this.rotation = loadFloat(json, "rotation", 0);
                    return this;
                };
                return PtcRotationKeyframe;
            }(PtcKeyframe));
            exports_1("PtcRotationKeyframe", PtcRotationKeyframe);
            PtcTimeline = (function () {
                function PtcTimeline() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                PtcTimeline.prototype.load = function (json) {
                    var _this = this;
                    this.min_time = 0;
                    this.max_time = 0;
                    this.ptc_spacing_keyframes = [];
                    this.ptc_position_keyframes = [];
                    this.ptc_rotation_keyframes = [];
                    Object.keys(json || {}).forEach(function (key) {
                        switch (key) {
                            case "spacing":
                                json[key].forEach(function (spacing_json) {
                                    var ptc_spacing_keyframe = new PtcSpacingKeyframe().load(spacing_json);
                                    _this.min_time = Math.min(_this.min_time, ptc_spacing_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, ptc_spacing_keyframe.time);
                                    _this.ptc_spacing_keyframes.push(ptc_spacing_keyframe);
                                });
                                _this.ptc_spacing_keyframes.sort(Keyframe.compare);
                                break;
                            case "position":
                                json[key].forEach(function (position_json) {
                                    var ptc_position_keyframe = new PtcPositionKeyframe().load(position_json);
                                    _this.min_time = Math.min(_this.min_time, ptc_position_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, ptc_position_keyframe.time);
                                    _this.ptc_position_keyframes.push(ptc_position_keyframe);
                                });
                                _this.ptc_position_keyframes.sort(Keyframe.compare);
                                break;
                            case "rotation":
                                json[key].forEach(function (rotation_json) {
                                    var ptc_rotation_keyframe = new PtcRotationKeyframe().load(rotation_json);
                                    _this.min_time = Math.min(_this.min_time, ptc_rotation_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, ptc_rotation_keyframe.time);
                                    _this.ptc_rotation_keyframes.push(ptc_rotation_keyframe);
                                });
                                _this.ptc_rotation_keyframes.sort(Keyframe.compare);
                                break;
                            default:
                                console.log("TODO: PtcTimeline::load", key);
                                break;
                        }
                    });
                    return this;
                };
                return PtcTimeline;
            }());
            exports_1("PtcTimeline", PtcTimeline);
            FfdKeyframe = (function (_super) {
                __extends(FfdKeyframe, _super);
                function FfdKeyframe() {
                    var _this = _super.call(this) || this;
                    _this.curve = new Curve();
                    _this.offset = 0;
                    _this.vertices = [];
                    return _this;
                }
                FfdKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.curve.load(json.curve);
                    this.offset = loadInt(json, "offset", 0);
                    this.vertices = json.vertices || [];
                    return this;
                };
                return FfdKeyframe;
            }(Keyframe));
            exports_1("FfdKeyframe", FfdKeyframe);
            FfdAttachment = (function () {
                function FfdAttachment() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                FfdAttachment.prototype.load = function (json) {
                    var _this = this;
                    this.min_time = 0;
                    this.max_time = 0;
                    this.ffd_keyframes = [];
                    json.forEach(function (ffd_keyframe_json) {
                        var ffd_keyframe = new FfdKeyframe().load(ffd_keyframe_json);
                        _this.min_time = Math.min(_this.min_time, ffd_keyframe.time);
                        _this.max_time = Math.max(_this.max_time, ffd_keyframe.time);
                        _this.ffd_keyframes.push(ffd_keyframe);
                    });
                    this.ffd_keyframes.sort(Keyframe.compare);
                    return this;
                };
                return FfdAttachment;
            }());
            exports_1("FfdAttachment", FfdAttachment);
            FfdSlot = (function () {
                function FfdSlot() {
                    this.ffd_attachments = {};
                    this.ffd_attachment_keys = [];
                }
                FfdSlot.prototype.load = function (json) {
                    var _this = this;
                    this.ffd_attachments = {};
                    this.ffd_attachment_keys = Object.keys(json || {});
                    this.ffd_attachment_keys.forEach(function (key) {
                        _this.ffd_attachments[key] = new FfdAttachment().load(json[key]);
                    });
                    return this;
                };
                FfdSlot.prototype.iterateAttachments = function (callback) {
                    var _this = this;
                    this.ffd_attachment_keys.forEach(function (ffd_attachment_key) {
                        var ffd_attachment = _this.ffd_attachments[ffd_attachment_key];
                        callback(ffd_attachment_key, ffd_attachment);
                    });
                };
                return FfdSlot;
            }());
            exports_1("FfdSlot", FfdSlot);
            FfdTimeline = (function () {
                function FfdTimeline() {
                    this.min_time = 0;
                    this.max_time = 0;
                    this.ffd_slots = {};
                    this.ffd_slot_keys = [];
                }
                FfdTimeline.prototype.load = function (json) {
                    var _this = this;
                    this.min_time = 0;
                    this.max_time = 0;
                    this.ffd_slots = {};
                    this.ffd_slot_keys = Object.keys(json || {});
                    this.ffd_slot_keys.forEach(function (key) {
                        _this.ffd_slots[key] = new FfdSlot().load(json[key]);
                    });
                    this.iterateAttachments(function (ffd_slot_key, ffd_slot, ffd_attachment_key, ffd_attachment) {
                        _this.min_time = Math.min(_this.min_time, ffd_attachment.min_time);
                        _this.max_time = Math.max(_this.max_time, ffd_attachment.max_time);
                    });
                    return this;
                };
                FfdTimeline.prototype.iterateAttachments = function (callback) {
                    var _this = this;
                    this.ffd_slot_keys.forEach(function (ffd_slot_key) {
                        var ffd_slot = _this.ffd_slots[ffd_slot_key];
                        ffd_slot.iterateAttachments(function (ffd_attachment_key, ffd_attachment) {
                            callback(ffd_slot_key, ffd_slot, ffd_attachment_key, ffd_attachment);
                        });
                    });
                };
                return FfdTimeline;
            }());
            exports_1("FfdTimeline", FfdTimeline);
            Animation = (function () {
                function Animation() {
                    this.name = "";
                    this.bone_timeline_map = {};
                    this.slot_timeline_map = {};
                    this.ikc_timeline_map = {};
                    this.xfc_timeline_map = {};
                    this.ptc_timeline_map = {};
                    this.ffd_timeline_map = {};
                    this.min_time = 0;
                    this.max_time = 0;
                    this.length = 0;
                }
                Animation.prototype.load = function (json) {
                    var _this = this;
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
                    Object.keys(json || {}).forEach(function (key) {
                        switch (key) {
                            case "bones":
                                Object.keys(json[key] || {}).forEach(function (bone_key) {
                                    var bone_timeline = new BoneTimeline().load(json[key][bone_key]);
                                    _this.min_time = Math.min(_this.min_time, bone_timeline.min_time);
                                    _this.max_time = Math.max(_this.max_time, bone_timeline.max_time);
                                    _this.bone_timeline_map[bone_key] = bone_timeline;
                                });
                                break;
                            case "slots":
                                Object.keys(json[key] || {}).forEach(function (slot_key) {
                                    var slot_timeline = new SlotTimeline().load(json[key][slot_key]);
                                    _this.min_time = Math.min(_this.min_time, slot_timeline.min_time);
                                    _this.max_time = Math.max(_this.max_time, slot_timeline.max_time);
                                    _this.slot_timeline_map[slot_key] = slot_timeline;
                                });
                                break;
                            case "events":
                                _this.event_keyframes = [];
                                json[key].forEach(function (event) {
                                    var event_keyframe = new EventKeyframe().load(event);
                                    _this.min_time = Math.min(_this.min_time, event_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, event_keyframe.time);
                                    _this.event_keyframes.push(event_keyframe);
                                });
                                _this.event_keyframes.sort(Keyframe.compare);
                                break;
                            case "drawOrder":
                            case "draworder":
                                _this.order_keyframes = [];
                                json[key].forEach(function (order) {
                                    var order_keyframe = new OrderKeyframe().load(order);
                                    _this.min_time = Math.min(_this.min_time, order_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, order_keyframe.time);
                                    _this.order_keyframes.push(order_keyframe);
                                });
                                _this.order_keyframes.sort(Keyframe.compare);
                                break;
                            case "ik":
                                Object.keys(json[key] || {}).forEach(function (ikc_key) {
                                    var ikc_timeline = new IkcTimeline().load(json[key][ikc_key]);
                                    _this.min_time = Math.min(_this.min_time, ikc_timeline.min_time);
                                    _this.max_time = Math.max(_this.max_time, ikc_timeline.max_time);
                                    _this.ikc_timeline_map[ikc_key] = ikc_timeline;
                                });
                                break;
                            case "transform":
                                Object.keys(json[key] || {}).forEach(function (xfc_key) {
                                    var xfc_timeline = new XfcTimeline().load(json[key][xfc_key]);
                                    _this.min_time = Math.min(_this.min_time, xfc_timeline.min_time);
                                    _this.max_time = Math.max(_this.max_time, xfc_timeline.max_time);
                                    _this.xfc_timeline_map[xfc_key] = xfc_timeline;
                                });
                                break;
                            case "paths":
                                Object.keys(json[key] || {}).forEach(function (ptc_key) {
                                    var ptc_timeline = new PtcTimeline().load(json[key][ptc_key]);
                                    _this.min_time = Math.min(_this.min_time, ptc_timeline.min_time);
                                    _this.max_time = Math.max(_this.max_time, ptc_timeline.max_time);
                                    _this.ptc_timeline_map[ptc_key] = ptc_timeline;
                                });
                                break;
                            case "ffd":
                            case "deform":
                                Object.keys(json[key] || {}).forEach(function (ffd_key) {
                                    var ffd_timeline = new FfdTimeline().load(json[key][ffd_key]);
                                    _this.min_time = Math.min(_this.min_time, ffd_timeline.min_time);
                                    _this.max_time = Math.max(_this.max_time, ffd_timeline.max_time);
                                    _this.ffd_timeline_map[ffd_key] = ffd_timeline;
                                });
                                break;
                            default:
                                console.log("TODO: Animation::load", key);
                                break;
                        }
                    });
                    this.length = this.max_time - this.min_time;
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
                }
                Data.prototype.load = function (json) {
                    var _this = this;
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
                    Object.keys(json || {}).forEach(function (key) {
                        switch (key) {
                            case "skeleton":
                                _this.skeleton.load(json[key]);
                                break;
                            case "bones":
                                var json_bones = json[key];
                                json_bones.forEach(function (bone, bone_index) {
                                    _this.bones[bone.name] = new Bone().load(bone);
                                    _this.bone_keys[bone_index] = bone.name;
                                });
                                break;
                            case "ik":
                                var json_ik = json[key];
                                json_ik.forEach(function (ikc, ikc_index) {
                                    _this.ikcs[ikc.name] = new Ikc().load(ikc);
                                    _this.ikc_keys[ikc_index] = ikc.name;
                                });
                                _this.ikc_keys.sort(function (a, b) {
                                    var ikc_a = _this.ikcs[a];
                                    var ikc_b = _this.ikcs[b];
                                    return ikc_a.order - ikc_b.order;
                                });
                                break;
                            case "transform":
                                var json_transform = json[key];
                                json_transform.forEach(function (xfc, xfc_index) {
                                    _this.xfcs[xfc.name] = new Xfc().load(xfc);
                                    _this.xfc_keys[xfc_index] = xfc.name;
                                });
                                _this.xfc_keys.sort(function (a, b) {
                                    var xfc_a = _this.xfcs[a];
                                    var xfc_b = _this.xfcs[b];
                                    return xfc_a.order - xfc_b.order;
                                });
                                break;
                            case "path":
                                var json_path = json[key];
                                json_path.forEach(function (ptc, ptc_index) {
                                    _this.ptcs[ptc.name] = new Ptc().load(ptc);
                                    _this.ptc_keys[ptc_index] = ptc.name;
                                });
                                break;
                            case "slots":
                                var json_slots = json[key];
                                json_slots.forEach(function (slot, slot_index) {
                                    _this.slots[slot.name] = new Slot().load(slot);
                                    _this.slot_keys[slot_index] = slot.name;
                                });
                                break;
                            case "skins":
                                var json_skins_1 = json[key] || {};
                                _this.skin_keys = Object.keys(json_skins_1);
                                _this.skin_keys.forEach(function (skin_key) {
                                    var skin = _this.skins[skin_key] = new Skin().load(json_skins_1[skin_key]);
                                    skin.name = skin.name || skin_key;
                                });
                                break;
                            case "events":
                                var json_events_1 = json[key] || {};
                                _this.event_keys = Object.keys(json_events_1);
                                _this.event_keys.forEach(function (event_key) {
                                    var event = _this.events[event_key] = new Event().load(json_events_1[event_key]);
                                    event.name = event.name || event_key;
                                });
                                break;
                            case "animations":
                                var json_animations_1 = json[key] || {};
                                _this.anim_keys = Object.keys(json_animations_1);
                                _this.anim_keys.forEach(function (anim_key) {
                                    var anim = _this.anims[anim_key] = new Animation().load(json_animations_1[anim_key]);
                                    anim.name = anim.name || anim_key;
                                });
                                break;
                            default:
                                console.log("TODO: Skeleton::load", key);
                                break;
                        }
                    });
                    this.iterateBones(function (bone_key, bone) {
                        Bone.flatten(bone, _this.bones);
                    });
                    return this;
                };
                Data.prototype.loadSkeleton = function (json) {
                    this.skeleton.load(json);
                    return this;
                };
                Data.prototype.loadEvent = function (name, json) {
                    var event = this.events[name] = new Event().load(json);
                    event.name = event.name || name;
                    return this;
                };
                Data.prototype.loadAnimation = function (name, json) {
                    var anim = this.anims[name] = new Animation().load(json);
                    anim.name = anim.name || name;
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
                    var _this = this;
                    this.bone_keys.forEach(function (bone_key) {
                        var data_bone = _this.bones[bone_key];
                        callback(bone_key, data_bone);
                    });
                };
                Data.prototype.iterateAttachments = function (skin_key, callback) {
                    var _this = this;
                    var skin = this.skins[skin_key];
                    var default_skin = this.skins["default"];
                    this.slot_keys.forEach(function (slot_key) {
                        var data_slot = _this.slots[slot_key];
                        var skin_slot = skin && (skin.slots[slot_key] || default_skin.slots[slot_key]);
                        var attachment = skin_slot && skin_slot.attachments[data_slot.attachment_key];
                        var attachment_key = (attachment && attachment.name) || data_slot.attachment_key;
                        if (attachment && ((attachment.type === "linkedmesh") || (attachment.type === "weightedlinkedmesh"))) {
                            attachment_key = attachment && attachment.parent_key;
                            attachment = skin_slot && skin_slot.attachments[attachment_key];
                        }
                        callback(slot_key, data_slot, skin_slot, attachment_key, attachment);
                    });
                };
                Data.prototype.iterateSkins = function (callback) {
                    var _this = this;
                    this.skin_keys.forEach(function (skin_key) {
                        var skin = _this.skins[skin_key];
                        callback(skin_key, skin);
                    });
                };
                Data.prototype.iterateEvents = function (callback) {
                    var _this = this;
                    this.event_keys.forEach(function (event_key) {
                        var event = _this.events[event_key];
                        callback(event_key, event);
                    });
                };
                Data.prototype.iterateAnims = function (callback) {
                    var _this = this;
                    this.anim_keys.forEach(function (anim_key) {
                        var anim = _this.anims[anim_key];
                        callback(anim_key, anim);
                    });
                };
                return Data;
            }());
            exports_1("Data", Data);
            Pose = (function () {
                function Pose(data) {
                    this.skin_key = "";
                    this.anim_key = "";
                    this.time = 0;
                    this.elapsed_time = 0;
                    this.dirty = true;
                    this.bones = {};
                    this.bone_keys = [];
                    this.slots = {};
                    this.slot_keys = [];
                    this.events = [];
                    this.data = data;
                }
                Pose.prototype.curSkel = function () {
                    var data = this.data;
                    return data && data.skeleton;
                };
                Pose.prototype.getSkins = function () {
                    var data = this.data;
                    return data && data.skins;
                };
                Pose.prototype.curSkin = function () {
                    var data = this.data;
                    return data && data.skins[this.skin_key];
                };
                Pose.prototype.getSkin = function () {
                    return this.skin_key;
                };
                Pose.prototype.setSkin = function (skin_key) {
                    if (this.skin_key !== skin_key) {
                        this.skin_key = skin_key;
                    }
                };
                Pose.prototype.getEvents = function () {
                    var data = this.data;
                    return data && data.events;
                };
                Pose.prototype.getAnims = function () {
                    var data = this.data;
                    return data && data.anims;
                };
                Pose.prototype.curAnim = function () {
                    var data = this.data;
                    return data && data.anims[this.anim_key];
                };
                Pose.prototype.curAnimLength = function () {
                    var data = this.data;
                    var anim = data && data.anims[this.anim_key];
                    return (anim && anim.length) || 0;
                };
                Pose.prototype.getAnim = function () {
                    return this.anim_key;
                };
                Pose.prototype.setAnim = function (anim_key) {
                    if (this.anim_key !== anim_key) {
                        this.anim_key = anim_key;
                        var data = this.data;
                        var anim = data && data.anims[this.anim_key];
                        if (anim) {
                            this.time = wrap(this.time, anim.min_time, anim.max_time);
                        }
                        this.elapsed_time = 0;
                        this.dirty = true;
                    }
                };
                Pose.prototype.getTime = function () {
                    return this.time;
                };
                Pose.prototype.setTime = function (time) {
                    var data = this.data;
                    var anim = data && data.anims[this.anim_key];
                    if (anim) {
                        time = wrap(time, anim.min_time, anim.max_time);
                    }
                    if (this.time !== time) {
                        this.time = time;
                        this.elapsed_time = 0;
                        this.dirty = true;
                    }
                };
                Pose.prototype.update = function (elapsed_time) {
                    this.elapsed_time += elapsed_time;
                    this.dirty = true;
                };
                Pose.prototype.strike = function () {
                    var _this = this;
                    if (!this.dirty) {
                        return;
                    }
                    this.dirty = false;
                    var data = this.data;
                    var anim = data && data.anims[this.anim_key];
                    var prev_time = this.time;
                    var elapsed_time = this.elapsed_time;
                    this.time = this.time + this.elapsed_time;
                    this.elapsed_time = 0;
                    var wrapped_min = false;
                    var wrapped_max = false;
                    if (anim) {
                        wrapped_min = (elapsed_time < 0) && (this.time <= anim.min_time);
                        wrapped_max = (elapsed_time > 0) && (this.time >= anim.max_time);
                        this.time = wrap(this.time, anim.min_time, anim.max_time);
                    }
                    var time = this.time;
                    var keyframe_index;
                    var pct;
                    data.bone_keys.forEach(function (bone_key) {
                        var data_bone = data.bones[bone_key];
                        var pose_bone = _this.bones[bone_key] || (_this.bones[bone_key] = new Bone());
                        pose_bone.copy(data_bone);
                        var bone_timeline = anim && anim.bone_timeline_map[bone_key];
                        if (bone_timeline) {
                            keyframe_index = Keyframe.find(bone_timeline.position_keyframes, time);
                            if (keyframe_index !== -1) {
                                var position_keyframe0 = bone_timeline.position_keyframes[keyframe_index];
                                var position_keyframe1 = bone_timeline.position_keyframes[keyframe_index + 1];
                                if (position_keyframe1) {
                                    pct = position_keyframe0.curve.evaluate((time - position_keyframe0.time) / (position_keyframe1.time - position_keyframe0.time));
                                    pose_bone.local_space.position.x += tween(position_keyframe0.position.x, position_keyframe1.position.x, pct);
                                    pose_bone.local_space.position.y += tween(position_keyframe0.position.y, position_keyframe1.position.y, pct);
                                }
                                else {
                                    pose_bone.local_space.position.x += position_keyframe0.position.x;
                                    pose_bone.local_space.position.y += position_keyframe0.position.y;
                                }
                            }
                            keyframe_index = Keyframe.find(bone_timeline.rotation_keyframes, time);
                            if (keyframe_index !== -1) {
                                var rotation_keyframe0 = bone_timeline.rotation_keyframes[keyframe_index];
                                var rotation_keyframe1 = bone_timeline.rotation_keyframes[keyframe_index + 1];
                                if (rotation_keyframe1) {
                                    pct = rotation_keyframe0.curve.evaluate((time - rotation_keyframe0.time) / (rotation_keyframe1.time - rotation_keyframe0.time));
                                    pose_bone.local_space.rotation.rad += tweenAngle(rotation_keyframe0.rotation.rad, rotation_keyframe1.rotation.rad, pct);
                                }
                                else {
                                    pose_bone.local_space.rotation.rad += rotation_keyframe0.rotation.rad;
                                }
                            }
                            keyframe_index = Keyframe.find(bone_timeline.scale_keyframes, time);
                            if (keyframe_index !== -1) {
                                var scale_keyframe0 = bone_timeline.scale_keyframes[keyframe_index];
                                var scale_keyframe1 = bone_timeline.scale_keyframes[keyframe_index + 1];
                                if (scale_keyframe1) {
                                    pct = scale_keyframe0.curve.evaluate((time - scale_keyframe0.time) / (scale_keyframe1.time - scale_keyframe0.time));
                                    pose_bone.local_space.scale.a *= tween(scale_keyframe0.scale.a, scale_keyframe1.scale.a, pct);
                                    pose_bone.local_space.scale.d *= tween(scale_keyframe0.scale.d, scale_keyframe1.scale.d, pct);
                                }
                                else {
                                    pose_bone.local_space.scale.a *= scale_keyframe0.scale.a;
                                    pose_bone.local_space.scale.d *= scale_keyframe0.scale.d;
                                }
                            }
                            keyframe_index = Keyframe.find(bone_timeline.shear_keyframes, time);
                            if (keyframe_index !== -1) {
                                var shear_keyframe0 = bone_timeline.shear_keyframes[keyframe_index];
                                var shear_keyframe1 = bone_timeline.shear_keyframes[keyframe_index + 1];
                                if (shear_keyframe1) {
                                    pct = shear_keyframe0.curve.evaluate((time - shear_keyframe0.time) / (shear_keyframe1.time - shear_keyframe0.time));
                                    pose_bone.local_space.shear.x.rad += tweenAngle(shear_keyframe0.shear.x.rad, shear_keyframe1.shear.x.rad, pct);
                                    pose_bone.local_space.shear.y.rad += tweenAngle(shear_keyframe0.shear.y.rad, shear_keyframe1.shear.y.rad, pct);
                                }
                                else {
                                    pose_bone.local_space.shear.x.rad += shear_keyframe0.shear.x.rad;
                                    pose_bone.local_space.shear.y.rad += shear_keyframe0.shear.y.rad;
                                }
                            }
                        }
                    });
                    this.bone_keys = data.bone_keys;
                    data.ikc_keys.forEach(function (ikc_key) {
                        var ikc = data.ikcs[ikc_key];
                        var ikc_mix = ikc.mix;
                        var ikc_bend_positive = ikc.bend_positive;
                        var ikc_timeline = anim && anim.ikc_timeline_map[ikc_key];
                        if (ikc_timeline) {
                            keyframe_index = Keyframe.find(ikc_timeline.ikc_keyframes, time);
                            if (keyframe_index !== -1) {
                                var ikc_keyframe0 = ikc_timeline.ikc_keyframes[keyframe_index];
                                var ikc_keyframe1 = ikc_timeline.ikc_keyframes[keyframe_index + 1];
                                if (ikc_keyframe1) {
                                    pct = ikc_keyframe0.curve.evaluate((time - ikc_keyframe0.time) / (ikc_keyframe1.time - ikc_keyframe0.time));
                                    ikc_mix = tween(ikc_keyframe0.mix, ikc_keyframe1.mix, pct);
                                }
                                else {
                                    ikc_mix = ikc_keyframe0.mix;
                                }
                                ikc_bend_positive = ikc_keyframe0.bend_positive;
                            }
                        }
                        var alpha = ikc_mix;
                        var bendDir = (ikc_bend_positive) ? (1) : (-1);
                        if (alpha === 0) {
                            return;
                        }
                        var target = _this.bones[ikc.target_key];
                        Bone.flatten(target, _this.bones);
                        switch (ikc.bone_keys.length) {
                            case 1: {
                                var bone = _this.bones[ikc.bone_keys[0]];
                                Bone.flatten(bone, _this.bones);
                                var a1 = Math.atan2(target.world_space.position.y - bone.world_space.position.y, target.world_space.position.x - bone.world_space.position.x);
                                var bone_parent = _this.bones[bone.parent_key];
                                if (bone_parent) {
                                    Bone.flatten(bone_parent, _this.bones);
                                    if (Matrix.determinant(bone_parent.world_space.scale) < 0) {
                                        a1 += bone_parent.world_space.rotation.rad;
                                    }
                                    else {
                                        a1 -= bone_parent.world_space.rotation.rad;
                                    }
                                }
                                bone.local_space.rotation.rad = tweenAngle(bone.local_space.rotation.rad, a1, alpha);
                                break;
                            }
                            case 2: {
                                var parent_1 = _this.bones[ikc.bone_keys[0]];
                                Bone.flatten(parent_1, _this.bones);
                                var child = _this.bones[ikc.bone_keys[1]];
                                Bone.flatten(child, _this.bones);
                                var psx = parent_1.local_space.scale.x;
                                var psy = parent_1.local_space.scale.y;
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
                                var t = Vector.copy(target.world_space.position, new Vector());
                                var d = Vector.copy(child.world_space.position, new Vector());
                                var pp = _this.bones[parent_1.parent_key];
                                if (pp) {
                                    Bone.flatten(pp, _this.bones);
                                    Space.untransform(pp.world_space, t, t);
                                    Space.untransform(pp.world_space, d, d);
                                }
                                Vector.subtract(t, parent_1.local_space.position, t);
                                Vector.subtract(d, parent_1.local_space.position, d);
                                var tx = t.x, ty = t.y;
                                var dx = d.x, dy = d.y;
                                var l1 = Math.sqrt(dx * dx + dy * dy), l2 = child.length * csx, a1 = void 0, a2 = void 0;
                                outer: if (Math.abs(psx - psy) <= 0.0001) {
                                    l2 *= psx;
                                    var cos = (tx * tx + ty * ty - l1 * l1 - l2 * l2) / (2 * l1 * l2);
                                    if (cos < -1)
                                        cos = -1;
                                    else if (cos > 1)
                                        cos = 1;
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
                                parent_1.local_space.rotation.rad = tweenAngle(parent_1.local_space.rotation.rad, a1, alpha);
                                child.local_space.rotation.rad = tweenAngle(child.local_space.rotation.rad, a2, alpha);
                                break;
                            }
                        }
                    });
                    this.iterateBones(function (bone_key, bone) {
                        Bone.flatten(bone, _this.bones);
                    });
                    data.xfc_keys.forEach(function (xfc_key) {
                        var xfc = data.xfcs[xfc_key];
                        var xfc_position_mix = xfc.position_mix;
                        var xfc_rotation_mix = xfc.rotation_mix;
                        var xfc_scale_mix = xfc.scale_mix;
                        var xfc_shear_mix = xfc.shear_mix;
                        var xfc_timeline = anim && anim.xfc_timeline_map[xfc_key];
                        if (xfc_timeline) {
                            keyframe_index = Keyframe.find(xfc_timeline.xfc_keyframes, time);
                            if (keyframe_index !== -1) {
                                var xfc_keyframe0 = xfc_timeline.xfc_keyframes[keyframe_index];
                                var xfc_keyframe1 = xfc_timeline.xfc_keyframes[keyframe_index + 1];
                                if (xfc_keyframe1) {
                                    pct = xfc_keyframe0.curve.evaluate((time - xfc_keyframe0.time) / (xfc_keyframe1.time - xfc_keyframe0.time));
                                    xfc_position_mix = tween(xfc_keyframe0.position_mix, xfc_keyframe1.position_mix, pct);
                                    xfc_rotation_mix = tween(xfc_keyframe0.rotation_mix, xfc_keyframe1.rotation_mix, pct);
                                    xfc_scale_mix = tween(xfc_keyframe0.scale_mix, xfc_keyframe1.scale_mix, pct);
                                    xfc_shear_mix = tween(xfc_keyframe0.shear_mix, xfc_keyframe1.shear_mix, pct);
                                }
                                else {
                                    xfc_position_mix = xfc_keyframe0.position_mix;
                                    xfc_rotation_mix = xfc_keyframe0.rotation_mix;
                                    xfc_scale_mix = xfc_keyframe0.scale_mix;
                                    xfc_shear_mix = xfc_keyframe0.shear_mix;
                                }
                            }
                        }
                        var xfc_bone = _this.bones[xfc.bone_key];
                        var xfc_target = _this.bones[xfc.target_key];
                        var xfc_position = xfc.position;
                        var xfc_world_position = Space.transform(xfc_target.world_space, xfc_position, new Vector());
                        xfc_bone.world_space.position.tween(xfc_world_position, xfc_position_mix, xfc_bone.world_space.position);
                    });
                    data.slot_keys.forEach(function (slot_key) {
                        var data_slot = data.slots[slot_key];
                        var pose_slot = _this.slots[slot_key] || (_this.slots[slot_key] = new Slot());
                        pose_slot.copy(data_slot);
                        var slot_timeline = anim && anim.slot_timeline_map[slot_key];
                        if (slot_timeline) {
                            keyframe_index = Keyframe.find(slot_timeline.color_keyframes, time);
                            if (keyframe_index !== -1) {
                                var color_keyframe0 = slot_timeline.color_keyframes[keyframe_index];
                                var color_keyframe1 = slot_timeline.color_keyframes[keyframe_index + 1];
                                if (color_keyframe1) {
                                    pct = color_keyframe0.curve.evaluate((time - color_keyframe0.time) / (color_keyframe1.time - color_keyframe0.time));
                                    color_keyframe0.color.tween(color_keyframe1.color, pct, pose_slot.color);
                                }
                                else {
                                    pose_slot.color.copy(color_keyframe0.color);
                                }
                            }
                            keyframe_index = Keyframe.find(slot_timeline.attachment_keyframes, time);
                            if (keyframe_index !== -1) {
                                var attachment_keyframe0 = slot_timeline.attachment_keyframes[keyframe_index];
                                pose_slot.attachment_key = attachment_keyframe0.name;
                            }
                        }
                    });
                    this.slot_keys = data.slot_keys;
                    if (anim) {
                        keyframe_index = Keyframe.find(anim.order_keyframes, time);
                        if (keyframe_index !== -1) {
                            var order_keyframe = anim.order_keyframes[keyframe_index];
                            this.slot_keys = data.slot_keys.slice(0);
                            order_keyframe.slot_offsets.forEach(function (slot_offset) {
                                var slot_index = _this.slot_keys.indexOf(slot_offset.slot_key);
                                if (slot_index !== -1) {
                                    _this.slot_keys.splice(slot_index, 1);
                                    _this.slot_keys.splice(slot_index + slot_offset.offset, 0, slot_offset.slot_key);
                                }
                            });
                        }
                    }
                    data.ptc_keys.forEach(function (ptc_key) {
                        var ptc = data.ptcs[ptc_key];
                        var ptc_spacing = ptc.spacing;
                        var ptc_position_mix = ptc.position_mix;
                        var ptc_position = ptc.position;
                        var ptc_rotation_mix = ptc.rotation_mix;
                        var ptc_rotation = ptc.rotation;
                        var ptc_timeline = anim && anim.ptc_timeline_map[ptc_key];
                        if (ptc_timeline) {
                            keyframe_index = Keyframe.find(ptc_timeline.ptc_spacing_keyframes, time);
                            if (keyframe_index !== -1) {
                                var ptc_spacing_keyframe0 = ptc_timeline.ptc_spacing_keyframes[keyframe_index];
                                var ptc_spacing_keyframe1 = ptc_timeline.ptc_spacing_keyframes[keyframe_index + 1];
                                if (ptc_spacing_keyframe1) {
                                    pct = ptc_spacing_keyframe0.curve.evaluate((time - ptc_spacing_keyframe0.time) / (ptc_spacing_keyframe1.time - ptc_spacing_keyframe0.time));
                                    ptc_spacing = tween(ptc_spacing_keyframe0.spacing, ptc_spacing_keyframe1.spacing, pct);
                                }
                                else {
                                    ptc_spacing = ptc_spacing_keyframe0.spacing;
                                }
                            }
                            keyframe_index = Keyframe.find(ptc_timeline.ptc_position_keyframes, time);
                            if (keyframe_index !== -1) {
                                var ptc_position_keyframe0 = ptc_timeline.ptc_position_keyframes[keyframe_index];
                                var ptc_position_keyframe1 = ptc_timeline.ptc_position_keyframes[keyframe_index + 1];
                                if (ptc_position_keyframe1) {
                                    pct = ptc_position_keyframe0.curve.evaluate((time - ptc_position_keyframe0.time) / (ptc_position_keyframe1.time - ptc_position_keyframe0.time));
                                    ptc_position_mix = tween(ptc_position_keyframe0.position_mix, ptc_position_keyframe1.position_mix, pct);
                                    ptc_position = tween(ptc_position_keyframe0.position, ptc_position_keyframe1.position, pct);
                                }
                                else {
                                    ptc_position_mix = ptc_position_keyframe0.position_mix;
                                    ptc_position = ptc_position_keyframe0.position;
                                }
                            }
                            keyframe_index = Keyframe.find(ptc_timeline.ptc_rotation_keyframes, time);
                            if (keyframe_index !== -1) {
                                var ptc_rotation_keyframe0 = ptc_timeline.ptc_rotation_keyframes[keyframe_index];
                                var ptc_rotation_keyframe1 = ptc_timeline.ptc_rotation_keyframes[keyframe_index + 1];
                                if (ptc_rotation_keyframe1) {
                                    pct = ptc_rotation_keyframe0.curve.evaluate((time - ptc_rotation_keyframe0.time) / (ptc_rotation_keyframe1.time - ptc_rotation_keyframe0.time));
                                    ptc_rotation_mix = tween(ptc_rotation_keyframe0.rotation_mix, ptc_rotation_keyframe1.rotation_mix, pct);
                                    ptc_rotation.deg = tween(ptc_rotation_keyframe0.rotation, ptc_rotation_keyframe1.rotation, pct);
                                }
                                else {
                                    ptc_rotation_mix = ptc_rotation_keyframe0.rotation_mix;
                                    ptc_rotation.deg = ptc_rotation_keyframe0.rotation;
                                }
                            }
                        }
                    });
                    this.events.length = 0;
                    if (anim && anim.event_keyframes) {
                        var make_event_1 = function (event_keyframe) {
                            var pose_event = new Event();
                            var data_event = data.events[event_keyframe.name];
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
                                anim.event_keyframes.forEach(function (event_keyframe) {
                                    if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time < prev_time)) ||
                                        ((time <= event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
                                        _this.events.push(make_event_1(event_keyframe));
                                    }
                                });
                            }
                            else {
                                anim.event_keyframes.forEach(function (event_keyframe) {
                                    if ((time <= event_keyframe.time) && (event_keyframe.time < prev_time)) {
                                        _this.events.push(make_event_1(event_keyframe));
                                    }
                                });
                            }
                        }
                        else {
                            if (wrapped_max) {
                                anim.event_keyframes.forEach(function (event_keyframe) {
                                    if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time <= time)) ||
                                        ((prev_time < event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
                                        _this.events.push(make_event_1(event_keyframe));
                                    }
                                });
                            }
                            else {
                                anim.event_keyframes.forEach(function (event_keyframe) {
                                    if ((prev_time < event_keyframe.time) && (event_keyframe.time <= time)) {
                                        _this.events.push(make_event_1(event_keyframe));
                                    }
                                });
                            }
                        }
                    }
                };
                Pose.prototype.iterateBones = function (callback) {
                    var _this = this;
                    this.bone_keys.forEach(function (bone_key) {
                        var bone = _this.bones[bone_key];
                        callback(bone_key, bone);
                    });
                };
                Pose.prototype.iterateAttachments = function (callback) {
                    var _this = this;
                    var data = this.data;
                    var skin = data && data.skins[this.skin_key];
                    var default_skin = data && data.skins["default"];
                    this.slot_keys.forEach(function (slot_key) {
                        var pose_slot = _this.slots[slot_key];
                        var skin_slot = skin && (skin.slots[slot_key] || default_skin.slots[slot_key]);
                        var attachment = skin_slot && skin_slot.attachments[pose_slot.attachment_key];
                        var attachment_key = (attachment && attachment.name) || pose_slot.attachment_key;
                        if (attachment && ((attachment.type === "linkedmesh") || (attachment.type === "weightedlinkedmesh"))) {
                            attachment_key = attachment && attachment.parent_key;
                            attachment = skin_slot && skin_slot.attachments[attachment_key];
                        }
                        callback(slot_key, pose_slot, skin_slot, attachment_key, attachment);
                    });
                };
                return Pose;
            }());
            exports_1("Pose", Pose);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0lBa0NBLGtCQUF5QixJQUFTLEVBQUUsR0FBb0IsRUFBRSxHQUFvQjtRQUFwQixvQkFBQSxFQUFBLFdBQW9CO1FBQzVFLElBQU0sS0FBSyxHQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsQ0FBQyxPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLEtBQUssUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEtBQUssS0FBSyxNQUFNLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQ3hELEtBQUssU0FBUyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDN0IsU0FBUyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ3RCLENBQUM7SUFDSCxDQUFDOztJQUVELGtCQUF5QixJQUFTLEVBQUUsR0FBb0IsRUFBRSxLQUFjLEVBQUUsR0FBb0I7UUFBcEIsb0JBQUEsRUFBQSxXQUFvQjtRQUM1RixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUNwQixDQUFDO0lBQ0gsQ0FBQzs7SUFFRCxtQkFBMEIsSUFBUyxFQUFFLEdBQW9CLEVBQUUsR0FBZTtRQUFmLG9CQUFBLEVBQUEsT0FBZTtRQUN4RSxJQUFNLEtBQUssR0FBUSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsTUFBTSxDQUFDLENBQUMsT0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixLQUFLLFFBQVEsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lB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QVEsR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDN0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDakQsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDdkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUMxQyxJQUFJLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDbkQsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUM1QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNoRCxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUs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b0NBQzFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQzt3Q0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0NBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7d0NBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztvQ0FDbEQsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO29DQUM5QixJQUFNLEdBQUcsR0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQztvQ0FDbEMsSUFBTSxHQUFHLEdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7b0NBQ3RDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztnQ0FDNUQsQ0FBQztnQ0FBQyxJQUFJLENBQUMsQ0FBQztvQ0FDTixFQUFFLEdBQUcsQ0FBQyxDQUFDO29DQUNQLElBQU0sQ0FBQyxHQUFXLEdBQUcsR0FBRyxFQUFFLENBQUM7b0NBQzNCLElBQU0sQ0FBQyxHQUFXLEdBQUcsR0FBRyxFQUFFLENBQUM7b0NBQzNCLElBQU0sRUFBRSxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29DQUN0QyxJQUFNLEVBQUUsR0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29DQUN6QixJQUFNLEVBQUUsR0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29DQUN6QixJQUFNLEVBQUUsR0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDO29DQUMzQixJQUFNLEVBQUUsR0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7b0NBQ3JDLElBQU0sRUFBRSxHQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO29DQUMvQyxJQUFNLEVBQUUsR0FBVyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO29DQUNoQyxJQUFNLEVBQUUsR0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDO29DQUMzQixJQUFNLEVBQUUsR0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO29DQUN6QyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3Q0FDWixJQUFJLENBQUMsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dDQUM5QixFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3Q0FDbkIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dDQUNsQixJQUFNLEVBQUUsR0FBVyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dDQUN2QyxJQUFNLENBQUMsR0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzt3Q0FDeEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDOzRDQUNoQixJQUFNLEdBQUMsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDOzRDQUNsRCxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzRDQUMzQixFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDOzRDQUN6QyxLQUFLLENBQUMsS0FBSyxDQUFDO3dDQUNkLENBQUM7b0NBQ0gsQ0FBQztvQ0FDRCxJQUFJLFFBQVEsR0FBVyxDQUFDLEVBQUUsT0FBTyxHQUFXLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxHQUFXLENBQUMsRUFBRSxJQUFJLEdBQVcsQ0FBQyxDQUFDO29DQUNqRyxJQUFJLFFBQVEsR0FBVyxDQUFDLEVBQUUsT0FBTyxHQUFXLENBQUMsRUFBRSxJQUFJLEdBQVcsQ0FBQyxFQUFFLElBQUksR0FBVyxDQUFDLENBQUM7b0NBQ2xGLElBQUksS0FBSyxTQUFRLEVBQUUsSUFBSSxTQUFRLEVBQUUsQ0FBQyxTQUFRLEVBQUUsQ0FBQyxTQUFRLENBQUM7b0NBQ3RELENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29DQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29DQUN6QixFQUFFLENBQUMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQzt3Q0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO3dDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7d0NBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztvQ0FBQyxDQUFDO29DQUMvRCxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztvQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQ0FDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0NBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7d0NBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzt3Q0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO29DQUFDLENBQUM7b0NBQ3JFLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO29DQUN2QyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO29DQUM3QixDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7b0NBQ3hCLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0NBQ3JCLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDO3dDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7d0NBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzt3Q0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO3dDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7b0NBQUMsQ0FBQztvQ0FDN0UsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0NBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzt3Q0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO3dDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7d0NBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztvQ0FBQyxDQUFDO29DQUM3RSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3Q0FDbEMsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7d0NBQzNDLEVBQUUsR0FBRyxRQUFRLEdBQUcsT0FBTyxDQUFDO29DQUMxQixDQUFDO29DQUFDLElBQUksQ0FBQyxDQUFDO3dDQUNOLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO3dDQUMzQyxFQUFFLEdBQUcsUUFBUSxHQUFHLE9BQU8sQ0FBQztvQ0FDMUIsQ0FBQztnQ0FD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