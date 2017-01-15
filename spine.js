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
    function BezierCurve(x1, y1, x2, y2, epsilon = EPSILON) {
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
            return y + (1 - y) * (percent - x) / (1 - x);
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
    var EPSILON, Color, Curve, Angle, Vector, Matrix, Affine, Position, Rotation, Scale, Shear, Space, Bone, Ikc, Xfc, Ptc, Slot, Attachment, RegionAttachment, BoundingBoxAttachment, MeshAttachment, LinkedMeshAttachment, WeightedMeshAttachment, PathAttachment, SkinSlot, Skin, Event, Keyframe, BoneKeyframe, PositionKeyframe, RotationKeyframe, ScaleKeyframe, ShearKeyframe, BoneTimeline, SlotKeyframe, ColorKeyframe, AttachmentKeyframe, SlotTimeline, EventKeyframe, SlotOffset, OrderKeyframe, IkcKeyframe, IkcTimeline, XfcKeyframe, XfcTimeline, PtcKeyframe, PtcMixKeyframe, PtcSpacingKeyframe, PtcPositionKeyframe, PtcRotationKeyframe, PtcTimeline, FfdKeyframe, FfdAttachment, FfdSlot, FfdTimeline, Animation, Skeleton, Data, Pose;
    return {
        setters: [],
        execute: function () {
            exports_1("EPSILON", EPSILON = 1e-6);
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
                load(json) {
                    let rgba = 0xffffffff;
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
            };
            exports_1("Color", Color);
            Curve = class Curve {
                constructor() {
                    this.evaluate = function (t) { return t; };
                }
                load(json) {
                    this.evaluate = function (t) { return t; };
                    if ((typeof (json) === "string") && (json === "stepped")) {
                        this.evaluate = function (t) { return 0; };
                    }
                    else if ((typeof (json) === "object") && (typeof (json.length) === "number") && (json.length === 4)) {
                        const x1 = loadFloat(json, 0, 0);
                        const y1 = loadFloat(json, 1, 0);
                        const x2 = loadFloat(json, 2, 1);
                        const y2 = loadFloat(json, 3, 1);
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
                static tween(a, b, tween, out = new Space()) {
                    a.position.tween(b.position, tween, out.position);
                    a.rotation.tween(b.rotation, tween, out.rotation);
                    a.scale.tween(b.scale, tween, out.scale);
                    a.shear.tween(b.shear, tween, out.shear);
                    return out;
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
                }
                static flatten(bone, bones) {
                    const bls = bone.local_space;
                    const bws = bone.world_space;
                    let parent = bones[bone.parent_key];
                    if (!parent) {
                        bws.copy(bls);
                        bws.updateAffine();
                    }
                    else {
                        Bone.flatten(parent, bones);
                        const pws = parent.world_space;
                        Space.transform(pws, bls.position, bws.position);
                        if (bone.inherit_rotation && bone.inherit_scale) {
                            Matrix.copy(pws.affine.matrix, bws.affine.matrix);
                        }
                        else if (bone.inherit_rotation) {
                            Matrix.identity(bws.affine.matrix);
                            while (parent && parent.inherit_rotation) {
                                const pls = parent.local_space;
                                Matrix.rotate(bws.affine.matrix, pls.rotation.cos, pls.rotation.sin, bws.affine.matrix);
                                parent = bones[parent.parent_key];
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
                        const x_axis_rad = Math.atan2(bws.affine.matrix.c, bws.affine.matrix.a);
                        bws.rotation.rad = wrapAngleRadians(x_axis_rad - bws.shear.x.rad);
                        Matrix.combine(bws.rotation.updateMatrix(), bws.shear.updateMatrix(), bws.scale);
                        Matrix.extract(bws.affine.matrix, bws.scale, bws.scale);
                    }
                    return bone;
                }
            };
            exports_1("Bone", Bone);
            Ikc = class Ikc {
                constructor() {
                    this.name = "";
                    this.order = 0;
                    this.bone_keys = [];
                    this.target_key = "";
                    this.mix = 1;
                    this.bend_positive = true;
                }
                load(json) {
                    this.name = loadString(json, "name", "");
                    this.order = loadInt(json, "order", 0);
                    this.bone_keys = json["bones"] || [];
                    this.target_key = loadString(json, "target", "");
                    this.mix = loadFloat(json, "mix", 1);
                    this.bend_positive = loadBool(json, "bendPositive", true);
                    return this;
                }
            };
            exports_1("Ikc", Ikc);
            Xfc = class Xfc {
                constructor() {
                    this.name = "";
                    this.order = 0;
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
                    this.name = loadString(json, "name", "");
                    this.order = loadInt(json, "order", 0);
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
            Ptc = class Ptc {
                constructor() {
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
                load(json) {
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
                    const attachment_type = loadString(json, "type", "region");
                    if (attachment_type !== this.type) {
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
                    this.vertices = [];
                }
                load(json) {
                    super.load(json);
                    this.vertices = json.vertices || [];
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
                    this.color.load(json.color);
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
                    this.attachments = {};
                    this.attachment_keys = [];
                }
                load(json) {
                    this.attachment_keys = Object.keys(json || {});
                    this.attachment_keys.forEach((attachment_key) => {
                        const json_attachment = json[attachment_key];
                        switch (json_attachment.type) {
                            default:
                            case "region":
                                this.attachments[attachment_key] = new RegionAttachment().load(json_attachment);
                                break;
                            case "boundingbox":
                                this.attachments[attachment_key] = new BoundingBoxAttachment().load(json_attachment);
                                break;
                            case "mesh":
                                if (json_attachment.vertices.length === json_attachment.uvs.length) {
                                    this.attachments[attachment_key] = new MeshAttachment().load(json_attachment);
                                }
                                else {
                                    json_attachment.type = "weightedmesh";
                                    this.attachments[attachment_key] = new WeightedMeshAttachment().load(json_attachment);
                                }
                                break;
                            case "linkedmesh":
                                this.attachments[attachment_key] = new LinkedMeshAttachment().load(json_attachment);
                                break;
                            case "skinnedmesh":
                                json_attachment.type = "weightedmesh";
                            case "weightedmesh":
                                this.attachments[attachment_key] = new WeightedMeshAttachment().load(json_attachment);
                                break;
                            case "path":
                                this.attachments[attachment_key] = new PathAttachment().load(json_attachment);
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
                    this.slots = {};
                    this.slot_keys = [];
                }
                load(json) {
                    this.name = loadString(json, "name", "");
                    this.slot_keys = Object.keys(json || {});
                    this.slot_keys.forEach((slot_key) => {
                        this.slots[slot_key] = new SkinSlot().load(json[slot_key]);
                    });
                    return this;
                }
                iterateAttachments(callback) {
                    this.slot_keys.forEach((slot_key) => {
                        const skin_slot = this.slots[slot_key];
                        skin_slot.attachment_keys.forEach((attachment_key) => {
                            const attachment = skin_slot.attachments[attachment_key];
                            callback(slot_key, skin_slot, attachment.name || attachment_key, attachment);
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
                    this.time = 1000 * loadFloat(json, "time", 0);
                    return this;
                }
                save(json) {
                    saveFloat(json, "time", this.time / 1000, 0);
                    return this;
                }
                static find(array, time) {
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
                        }
                        else {
                            hi = current;
                        }
                        if (lo === hi) {
                            return lo;
                        }
                        current = (lo + hi) >> 1;
                    }
                }
                static compare(a, b) {
                    return a.time - b.time;
                }
            };
            exports_1("Keyframe", Keyframe);
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
            PositionKeyframe = class PositionKeyframe extends BoneKeyframe {
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
            exports_1("PositionKeyframe", PositionKeyframe);
            RotationKeyframe = class RotationKeyframe extends BoneKeyframe {
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
            exports_1("RotationKeyframe", RotationKeyframe);
            ScaleKeyframe = class ScaleKeyframe extends BoneKeyframe {
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
            exports_1("ScaleKeyframe", ScaleKeyframe);
            ShearKeyframe = class ShearKeyframe extends BoneKeyframe {
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
            exports_1("ShearKeyframe", ShearKeyframe);
            BoneTimeline = class BoneTimeline {
                constructor() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
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
                                json.translate.forEach((translate_json) => {
                                    const position_keyframe = new PositionKeyframe().load(translate_json);
                                    this.position_keyframes.push(position_keyframe);
                                    this.min_time = Math.min(this.min_time, position_keyframe.time);
                                    this.max_time = Math.max(this.max_time, position_keyframe.time);
                                });
                                this.position_keyframes.sort(Keyframe.compare);
                                break;
                            case "rotate":
                                this.rotation_keyframes = [];
                                json.rotate.forEach((rotate_json) => {
                                    const rotation_keyframe = new RotationKeyframe().load(rotate_json);
                                    this.rotation_keyframes.push(rotation_keyframe);
                                    this.min_time = Math.min(this.min_time, rotation_keyframe.time);
                                    this.max_time = Math.max(this.max_time, rotation_keyframe.time);
                                });
                                this.rotation_keyframes.sort(Keyframe.compare);
                                break;
                            case "scale":
                                this.scale_keyframes = [];
                                json.scale.forEach((scale_json) => {
                                    const scale_keyframe = new ScaleKeyframe().load(scale_json);
                                    this.scale_keyframes.push(scale_keyframe);
                                    this.min_time = Math.min(this.min_time, scale_keyframe.time);
                                    this.max_time = Math.max(this.max_time, scale_keyframe.time);
                                });
                                this.scale_keyframes.sort(Keyframe.compare);
                                break;
                            case "shear":
                                this.shear_keyframes = [];
                                json.shear.forEach((shear_json) => {
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
            ColorKeyframe = class ColorKeyframe extends SlotKeyframe {
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
            exports_1("ColorKeyframe", ColorKeyframe);
            AttachmentKeyframe = class AttachmentKeyframe extends SlotKeyframe {
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
            exports_1("AttachmentKeyframe", AttachmentKeyframe);
            SlotTimeline = class SlotTimeline {
                constructor() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                load(json) {
                    this.min_time = 0;
                    this.max_time = 0;
                    delete this.color_keyframes;
                    delete this.attachment_keyframes;
                    Object.keys(json || {}).forEach((key) => {
                        switch (key) {
                            case "color":
                                this.color_keyframes = [];
                                json[key].forEach((color) => {
                                    const color_keyframe = new ColorKeyframe().load(color);
                                    this.min_time = Math.min(this.min_time, color_keyframe.time);
                                    this.max_time = Math.max(this.max_time, color_keyframe.time);
                                    this.color_keyframes.push(color_keyframe);
                                });
                                this.color_keyframes.sort(Keyframe.compare);
                                break;
                            case "attachment":
                                this.attachment_keyframes = [];
                                json[key].forEach((attachment) => {
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
                                json[key].forEach((offset) => {
                                    this.slot_offsets.push(new SlotOffset().load(offset));
                                });
                                break;
                        }
                    });
                    return this;
                }
            };
            exports_1("OrderKeyframe", OrderKeyframe);
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
            IkcTimeline = class IkcTimeline {
                constructor() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                load(json) {
                    this.min_time = 0;
                    this.max_time = 0;
                    this.ikc_keyframes = [];
                    json.forEach((ikc) => {
                        const ikc_keyframe = new IkcKeyframe().load(ikc);
                        this.min_time = Math.min(this.min_time, ikc_keyframe.time);
                        this.max_time = Math.max(this.max_time, ikc_keyframe.time);
                        this.ikc_keyframes.push(ikc_keyframe);
                    });
                    this.ikc_keyframes.sort(Keyframe.compare);
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
            XfcTimeline = class XfcTimeline {
                constructor() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                load(json) {
                    this.min_time = 0;
                    this.max_time = 0;
                    this.xfc_keyframes = [];
                    json.forEach((xfc) => {
                        const xfc_keyframe = new XfcKeyframe().load(xfc);
                        this.min_time = Math.min(this.min_time, xfc_keyframe.time);
                        this.max_time = Math.max(this.max_time, xfc_keyframe.time);
                        this.xfc_keyframes.push(xfc_keyframe);
                    });
                    this.xfc_keyframes.sort(Keyframe.compare);
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
            PtcTimeline = class PtcTimeline {
                constructor() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                load(json) {
                    this.min_time = 0;
                    this.max_time = 0;
                    this.ptc_mix_keyframes = [];
                    this.ptc_spacing_keyframes = [];
                    this.ptc_position_keyframes = [];
                    this.ptc_rotation_keyframes = [];
                    Object.keys(json || {}).forEach((key) => {
                        switch (key) {
                            case "mix":
                                json[key].forEach((mix_json) => {
                                    const ptc_mix_keyframe = new PtcMixKeyframe().load(mix_json);
                                    this.min_time = Math.min(this.min_time, ptc_mix_keyframe.time);
                                    this.max_time = Math.max(this.max_time, ptc_mix_keyframe.time);
                                    this.ptc_mix_keyframes.push(ptc_mix_keyframe);
                                });
                                this.ptc_mix_keyframes.sort(Keyframe.compare);
                                break;
                            case "spacing":
                                json[key].forEach((spacing_json) => {
                                    const ptc_spacing_keyframe = new PtcSpacingKeyframe().load(spacing_json);
                                    this.min_time = Math.min(this.min_time, ptc_spacing_keyframe.time);
                                    this.max_time = Math.max(this.max_time, ptc_spacing_keyframe.time);
                                    this.ptc_spacing_keyframes.push(ptc_spacing_keyframe);
                                });
                                this.ptc_spacing_keyframes.sort(Keyframe.compare);
                                break;
                            case "position":
                                json[key].forEach((position_json) => {
                                    const ptc_position_keyframe = new PtcPositionKeyframe().load(position_json);
                                    this.min_time = Math.min(this.min_time, ptc_position_keyframe.time);
                                    this.max_time = Math.max(this.max_time, ptc_position_keyframe.time);
                                    this.ptc_position_keyframes.push(ptc_position_keyframe);
                                });
                                this.ptc_position_keyframes.sort(Keyframe.compare);
                                break;
                            case "rotation":
                                json[key].forEach((rotation_json) => {
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
            FfdAttachment = class FfdAttachment {
                constructor() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                load(json) {
                    this.min_time = 0;
                    this.max_time = 0;
                    this.ffd_keyframes = [];
                    json.forEach((ffd_keyframe_json) => {
                        const ffd_keyframe = new FfdKeyframe().load(ffd_keyframe_json);
                        this.min_time = Math.min(this.min_time, ffd_keyframe.time);
                        this.max_time = Math.max(this.max_time, ffd_keyframe.time);
                        this.ffd_keyframes.push(ffd_keyframe);
                    });
                    this.ffd_keyframes.sort(Keyframe.compare);
                    return this;
                }
            };
            exports_1("FfdAttachment", FfdAttachment);
            FfdSlot = class FfdSlot {
                constructor() {
                    this.ffd_attachments = {};
                    this.ffd_attachment_keys = [];
                }
                load(json) {
                    this.ffd_attachments = {};
                    this.ffd_attachment_keys = Object.keys(json || {});
                    this.ffd_attachment_keys.forEach((key) => {
                        this.ffd_attachments[key] = new FfdAttachment().load(json[key]);
                    });
                    return this;
                }
                iterateAttachments(callback) {
                    this.ffd_attachment_keys.forEach((ffd_attachment_key) => {
                        const ffd_attachment = this.ffd_attachments[ffd_attachment_key];
                        callback(ffd_attachment_key, ffd_attachment);
                    });
                }
            };
            exports_1("FfdSlot", FfdSlot);
            FfdTimeline = class FfdTimeline {
                constructor() {
                    this.min_time = 0;
                    this.max_time = 0;
                    this.ffd_slots = {};
                    this.ffd_slot_keys = [];
                }
                load(json) {
                    this.min_time = 0;
                    this.max_time = 0;
                    this.ffd_slots = {};
                    this.ffd_slot_keys = Object.keys(json || {});
                    this.ffd_slot_keys.forEach((key) => {
                        this.ffd_slots[key] = new FfdSlot().load(json[key]);
                    });
                    this.iterateAttachments((ffd_slot_key, ffd_slot, ffd_attachment_key, ffd_attachment) => {
                        this.min_time = Math.min(this.min_time, ffd_attachment.min_time);
                        this.max_time = Math.max(this.max_time, ffd_attachment.max_time);
                    });
                    return this;
                }
                iterateAttachments(callback) {
                    this.ffd_slot_keys.forEach((ffd_slot_key) => {
                        const ffd_slot = this.ffd_slots[ffd_slot_key];
                        ffd_slot.iterateAttachments((ffd_attachment_key, ffd_attachment) => {
                            callback(ffd_slot_key, ffd_slot, ffd_attachment_key, ffd_attachment);
                        });
                    });
                }
            };
            exports_1("FfdTimeline", FfdTimeline);
            Animation = class Animation {
                constructor() {
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
                load(json) {
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
                    Object.keys(json || {}).forEach((key) => {
                        switch (key) {
                            case "bones":
                                Object.keys(json[key] || {}).forEach((bone_key) => {
                                    const bone_timeline = new BoneTimeline().load(json[key][bone_key]);
                                    this.min_time = Math.min(this.min_time, bone_timeline.min_time);
                                    this.max_time = Math.max(this.max_time, bone_timeline.max_time);
                                    this.bone_timeline_map[bone_key] = bone_timeline;
                                });
                                break;
                            case "slots":
                                Object.keys(json[key] || {}).forEach((slot_key) => {
                                    const slot_timeline = new SlotTimeline().load(json[key][slot_key]);
                                    this.min_time = Math.min(this.min_time, slot_timeline.min_time);
                                    this.max_time = Math.max(this.max_time, slot_timeline.max_time);
                                    this.slot_timeline_map[slot_key] = slot_timeline;
                                });
                                break;
                            case "events":
                                this.event_keyframes = [];
                                json[key].forEach((event) => {
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
                                json[key].forEach((order) => {
                                    const order_keyframe = new OrderKeyframe().load(order);
                                    this.min_time = Math.min(this.min_time, order_keyframe.time);
                                    this.max_time = Math.max(this.max_time, order_keyframe.time);
                                    this.order_keyframes.push(order_keyframe);
                                });
                                this.order_keyframes.sort(Keyframe.compare);
                                break;
                            case "ik":
                                Object.keys(json[key] || {}).forEach((ikc_key) => {
                                    const ikc_timeline = new IkcTimeline().load(json[key][ikc_key]);
                                    this.min_time = Math.min(this.min_time, ikc_timeline.min_time);
                                    this.max_time = Math.max(this.max_time, ikc_timeline.max_time);
                                    this.ikc_timeline_map[ikc_key] = ikc_timeline;
                                });
                                break;
                            case "transform":
                                Object.keys(json[key] || {}).forEach((xfc_key) => {
                                    const xfc_timeline = new XfcTimeline().load(json[key][xfc_key]);
                                    this.min_time = Math.min(this.min_time, xfc_timeline.min_time);
                                    this.max_time = Math.max(this.max_time, xfc_timeline.max_time);
                                    this.xfc_timeline_map[xfc_key] = xfc_timeline;
                                });
                                break;
                            case "paths":
                                Object.keys(json[key] || {}).forEach((ptc_key) => {
                                    const ptc_timeline = new PtcTimeline().load(json[key][ptc_key]);
                                    this.min_time = Math.min(this.min_time, ptc_timeline.min_time);
                                    this.max_time = Math.max(this.max_time, ptc_timeline.max_time);
                                    this.ptc_timeline_map[ptc_key] = ptc_timeline;
                                });
                                break;
                            case "ffd":
                            case "deform":
                                Object.keys(json[key] || {}).forEach((ffd_key) => {
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
                load(json) {
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
                    Object.keys(json || {}).forEach((key) => {
                        switch (key) {
                            case "skeleton":
                                this.skeleton.load(json[key]);
                                break;
                            case "bones":
                                const json_bones = json[key];
                                json_bones.forEach((bone, bone_index) => {
                                    this.bones[bone.name] = new Bone().load(bone);
                                    this.bone_keys[bone_index] = bone.name;
                                });
                                break;
                            case "ik":
                                const json_ik = json[key];
                                json_ik.forEach((ikc, ikc_index) => {
                                    this.ikcs[ikc.name] = new Ikc().load(ikc);
                                    this.ikc_keys[ikc_index] = ikc.name;
                                });
                                this.ikc_keys.sort((a, b) => {
                                    const ikc_a = this.ikcs[a];
                                    const ikc_b = this.ikcs[b];
                                    return ikc_a.order - ikc_b.order;
                                });
                                break;
                            case "transform":
                                const json_transform = json[key];
                                json_transform.forEach((xfc, xfc_index) => {
                                    this.xfcs[xfc.name] = new Xfc().load(xfc);
                                    this.xfc_keys[xfc_index] = xfc.name;
                                });
                                this.xfc_keys.sort((a, b) => {
                                    const xfc_a = this.xfcs[a];
                                    const xfc_b = this.xfcs[b];
                                    return xfc_a.order - xfc_b.order;
                                });
                                break;
                            case "path":
                                const json_path = json[key];
                                json_path.forEach((ptc, ptc_index) => {
                                    this.ptcs[ptc.name] = new Ptc().load(ptc);
                                    this.ptc_keys[ptc_index] = ptc.name;
                                });
                                break;
                            case "slots":
                                const json_slots = json[key];
                                json_slots.forEach((slot, slot_index) => {
                                    this.slots[slot.name] = new Slot().load(slot);
                                    this.slot_keys[slot_index] = slot.name;
                                });
                                break;
                            case "skins":
                                const json_skins = json[key] || {};
                                this.skin_keys = Object.keys(json_skins);
                                this.skin_keys.forEach((skin_key) => {
                                    const skin = this.skins[skin_key] = new Skin().load(json_skins[skin_key]);
                                    skin.name = skin.name || skin_key;
                                });
                                break;
                            case "events":
                                const json_events = json[key] || {};
                                this.event_keys = Object.keys(json_events);
                                this.event_keys.forEach((event_key) => {
                                    const event = this.events[event_key] = new Event().load(json_events[event_key]);
                                    event.name = event.name || event_key;
                                });
                                break;
                            case "animations":
                                const json_animations = json[key] || {};
                                this.anim_keys = Object.keys(json_animations);
                                this.anim_keys.forEach((anim_key) => {
                                    const anim = this.anims[anim_key] = new Animation().load(json_animations[anim_key]);
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
                    const event = this.events[name] = new Event().load(json);
                    event.name = event.name || name;
                    return this;
                }
                loadAnimation(name, json) {
                    const anim = this.anims[name] = new Animation().load(json);
                    anim.name = anim.name || name;
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
                    this.bone_keys.forEach((bone_key) => {
                        const data_bone = this.bones[bone_key];
                        callback(bone_key, data_bone);
                    });
                }
                iterateAttachments(skin_key, callback) {
                    const skin = this.skins[skin_key];
                    const default_skin = this.skins["default"];
                    this.slot_keys.forEach((slot_key) => {
                        const data_slot = this.slots[slot_key];
                        const skin_slot = skin && (skin.slots[slot_key] || default_skin.slots[slot_key]);
                        let attachment = skin_slot && skin_slot.attachments[data_slot.attachment_key];
                        let attachment_key = (attachment && attachment.name) || data_slot.attachment_key;
                        if (attachment && (attachment.type === "linkedmesh")) {
                            attachment_key = attachment && attachment.parent_key;
                            attachment = skin_slot && skin_slot.attachments[attachment_key];
                        }
                        callback(slot_key, data_slot, skin_slot, attachment_key, attachment);
                    });
                }
                iterateSkins(callback) {
                    this.skin_keys.forEach((skin_key) => {
                        const skin = this.skins[skin_key];
                        callback(skin_key, skin);
                    });
                }
                iterateEvents(callback) {
                    this.event_keys.forEach((event_key) => {
                        const event = this.events[event_key];
                        callback(event_key, event);
                    });
                }
                iterateAnims(callback) {
                    this.anim_keys.forEach((anim_key) => {
                        const anim = this.anims[anim_key];
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
                    this.bones = {};
                    this.bone_keys = [];
                    this.slots = {};
                    this.slot_keys = [];
                    this.events = [];
                    this.data = data;
                }
                curSkel() {
                    const data = this.data;
                    return data && data.skeleton;
                }
                getSkins() {
                    const data = this.data;
                    return data && data.skins;
                }
                curSkin() {
                    const data = this.data;
                    return data && data.skins[this.skin_key];
                }
                getSkin() {
                    return this.skin_key;
                }
                setSkin(skin_key) {
                    if (this.skin_key !== skin_key) {
                        this.skin_key = skin_key;
                    }
                }
                getEvents() {
                    const data = this.data;
                    return data && data.events;
                }
                getAnims() {
                    const data = this.data;
                    return data && data.anims;
                }
                curAnim() {
                    const data = this.data;
                    return data && data.anims[this.anim_key];
                }
                curAnimLength() {
                    const data = this.data;
                    const anim = data && data.anims[this.anim_key];
                    return (anim && anim.length) || 0;
                }
                getAnim() {
                    return this.anim_key;
                }
                setAnim(anim_key) {
                    if (this.anim_key !== anim_key) {
                        this.anim_key = anim_key;
                        const data = this.data;
                        const anim = data && data.anims[this.anim_key];
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
                    const data = this.data;
                    const anim = data && data.anims[this.anim_key];
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
                    this.prev_time = this.time;
                    this.time += this.elapsed_time;
                    this.elapsed_time = 0;
                    const anim = this.data.anims[this.anim_key];
                    this.wrapped_min = false;
                    this.wrapped_max = false;
                    if (anim) {
                        this.wrapped_min = (this.time < this.prev_time) && (this.time <= anim.min_time);
                        this.wrapped_max = (this.time > this.prev_time) && (this.time >= anim.max_time);
                        this.time = wrap(this.time, anim.min_time, anim.max_time);
                    }
                    this._strikeBones(anim);
                    this._strikeIkcs(anim);
                    this._strikeXfcs(anim);
                    this._strikeSlots(anim);
                    this._strikePtcs(anim);
                    this._strikeEvents(anim);
                }
                _strikeBones(anim) {
                    let keyframe_index;
                    let pct;
                    this.data.bone_keys.forEach((bone_key) => {
                        const data_bone = this.data.bones[bone_key];
                        const pose_bone = this.bones[bone_key] || (this.bones[bone_key] = new Bone());
                        pose_bone.copy(data_bone);
                        const bone_timeline = anim && anim.bone_timeline_map[bone_key];
                        if (bone_timeline) {
                            keyframe_index = Keyframe.find(bone_timeline.position_keyframes, this.time);
                            if (keyframe_index !== -1) {
                                const position_keyframe0 = bone_timeline.position_keyframes[keyframe_index];
                                const position_keyframe1 = bone_timeline.position_keyframes[keyframe_index + 1];
                                if (position_keyframe1) {
                                    pct = position_keyframe0.curve.evaluate((this.time - position_keyframe0.time) / (position_keyframe1.time - position_keyframe0.time));
                                    pose_bone.local_space.position.x += tween(position_keyframe0.position.x, position_keyframe1.position.x, pct);
                                    pose_bone.local_space.position.y += tween(position_keyframe0.position.y, position_keyframe1.position.y, pct);
                                }
                                else {
                                    pose_bone.local_space.position.x += position_keyframe0.position.x;
                                    pose_bone.local_space.position.y += position_keyframe0.position.y;
                                }
                            }
                            keyframe_index = Keyframe.find(bone_timeline.rotation_keyframes, this.time);
                            if (keyframe_index !== -1) {
                                const rotation_keyframe0 = bone_timeline.rotation_keyframes[keyframe_index];
                                const rotation_keyframe1 = bone_timeline.rotation_keyframes[keyframe_index + 1];
                                if (rotation_keyframe1) {
                                    pct = rotation_keyframe0.curve.evaluate((this.time - rotation_keyframe0.time) / (rotation_keyframe1.time - rotation_keyframe0.time));
                                    pose_bone.local_space.rotation.rad += tweenAngleRadians(rotation_keyframe0.rotation.rad, rotation_keyframe1.rotation.rad, pct);
                                }
                                else {
                                    pose_bone.local_space.rotation.rad += rotation_keyframe0.rotation.rad;
                                }
                            }
                            keyframe_index = Keyframe.find(bone_timeline.scale_keyframes, this.time);
                            if (keyframe_index !== -1) {
                                const scale_keyframe0 = bone_timeline.scale_keyframes[keyframe_index];
                                const scale_keyframe1 = bone_timeline.scale_keyframes[keyframe_index + 1];
                                if (scale_keyframe1) {
                                    pct = scale_keyframe0.curve.evaluate((this.time - scale_keyframe0.time) / (scale_keyframe1.time - scale_keyframe0.time));
                                    pose_bone.local_space.scale.a *= tween(scale_keyframe0.scale.a, scale_keyframe1.scale.a, pct);
                                    pose_bone.local_space.scale.d *= tween(scale_keyframe0.scale.d, scale_keyframe1.scale.d, pct);
                                }
                                else {
                                    pose_bone.local_space.scale.a *= scale_keyframe0.scale.a;
                                    pose_bone.local_space.scale.d *= scale_keyframe0.scale.d;
                                }
                            }
                            keyframe_index = Keyframe.find(bone_timeline.shear_keyframes, this.time);
                            if (keyframe_index !== -1) {
                                const shear_keyframe0 = bone_timeline.shear_keyframes[keyframe_index];
                                const shear_keyframe1 = bone_timeline.shear_keyframes[keyframe_index + 1];
                                if (shear_keyframe1) {
                                    pct = shear_keyframe0.curve.evaluate((this.time - shear_keyframe0.time) / (shear_keyframe1.time - shear_keyframe0.time));
                                    pose_bone.local_space.shear.x.rad += tweenAngleRadians(shear_keyframe0.shear.x.rad, shear_keyframe1.shear.x.rad, pct);
                                    pose_bone.local_space.shear.y.rad += tweenAngleRadians(shear_keyframe0.shear.y.rad, shear_keyframe1.shear.y.rad, pct);
                                }
                                else {
                                    pose_bone.local_space.shear.x.rad += shear_keyframe0.shear.x.rad;
                                    pose_bone.local_space.shear.y.rad += shear_keyframe0.shear.y.rad;
                                }
                            }
                        }
                    });
                    this.bone_keys = this.data.bone_keys;
                    this.iterateBones((bone_key, bone) => {
                        Bone.flatten(bone, this.bones);
                    });
                }
                _strikeIkcs(anim) {
                    let keyframe_index;
                    let pct;
                    this.data.ikc_keys.forEach((ikc_key) => {
                        const ikc = this.data.ikcs[ikc_key];
                        let ikc_mix = ikc.mix;
                        let ikc_bend_positive = ikc.bend_positive;
                        const ikc_timeline = anim && anim.ikc_timeline_map[ikc_key];
                        if (ikc_timeline) {
                            keyframe_index = Keyframe.find(ikc_timeline.ikc_keyframes, this.time);
                            if (keyframe_index !== -1) {
                                const ikc_keyframe0 = ikc_timeline.ikc_keyframes[keyframe_index];
                                const ikc_keyframe1 = ikc_timeline.ikc_keyframes[keyframe_index + 1];
                                if (ikc_keyframe1) {
                                    pct = ikc_keyframe0.curve.evaluate((this.time - ikc_keyframe0.time) / (ikc_keyframe1.time - ikc_keyframe0.time));
                                    ikc_mix = tween(ikc_keyframe0.mix, ikc_keyframe1.mix, pct);
                                }
                                else {
                                    ikc_mix = ikc_keyframe0.mix;
                                }
                                ikc_bend_positive = ikc_keyframe0.bend_positive;
                            }
                        }
                        const alpha = ikc_mix;
                        const bendDir = (ikc_bend_positive) ? (1) : (-1);
                        if (alpha === 0) {
                            return;
                        }
                        const target = this.bones[ikc.target_key];
                        Bone.flatten(target, this.bones);
                        switch (ikc.bone_keys.length) {
                            case 1: {
                                const bone = this.bones[ikc.bone_keys[0]];
                                Bone.flatten(bone, this.bones);
                                let a1 = Math.atan2(target.world_space.position.y - bone.world_space.position.y, target.world_space.position.x - bone.world_space.position.x);
                                const bone_parent = this.bones[bone.parent_key];
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
                                const parent = this.bones[ikc.bone_keys[0]];
                                Bone.flatten(parent, this.bones);
                                const child = this.bones[ikc.bone_keys[1]];
                                Bone.flatten(child, this.bones);
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
                                const t = Vector.copy(target.world_space.position, new Vector());
                                const d = Vector.copy(child.world_space.position, new Vector());
                                const pp = this.bones[parent.parent_key];
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
                                        cos = 1;
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
                    let keyframe_index;
                    let pct;
                    this.data.xfc_keys.forEach((xfc_key) => {
                        const xfc = this.data.xfcs[xfc_key];
                        let xfc_position_mix = xfc.position_mix;
                        let xfc_rotation_mix = xfc.rotation_mix;
                        let xfc_scale_mix = xfc.scale_mix;
                        let xfc_shear_mix = xfc.shear_mix;
                        const xfc_timeline = anim && anim.xfc_timeline_map[xfc_key];
                        if (xfc_timeline) {
                            keyframe_index = Keyframe.find(xfc_timeline.xfc_keyframes, this.time);
                            if (keyframe_index !== -1) {
                                const xfc_keyframe0 = xfc_timeline.xfc_keyframes[keyframe_index];
                                const xfc_keyframe1 = xfc_timeline.xfc_keyframes[keyframe_index + 1];
                                if (xfc_keyframe1) {
                                    pct = xfc_keyframe0.curve.evaluate((this.time - xfc_keyframe0.time) / (xfc_keyframe1.time - xfc_keyframe0.time));
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
                        xfc.bone_keys.forEach((bone_key) => {
                            const xfc_bone = this.bones[bone_key];
                            const xfc_target = this.bones[xfc.target_key];
                            const xfc_position = xfc.position;
                            const xfc_world_position = Space.transform(xfc_target.world_space, xfc_position, new Vector());
                            xfc_bone.world_space.position.tween(xfc_world_position, xfc_position_mix, xfc_bone.world_space.position);
                        });
                    });
                }
                _strikeSlots(anim) {
                    let keyframe_index;
                    let pct;
                    this.data.slot_keys.forEach((slot_key) => {
                        const data_slot = this.data.slots[slot_key];
                        const pose_slot = this.slots[slot_key] || (this.slots[slot_key] = new Slot());
                        pose_slot.copy(data_slot);
                        const slot_timeline = anim && anim.slot_timeline_map[slot_key];
                        if (slot_timeline) {
                            keyframe_index = Keyframe.find(slot_timeline.color_keyframes, this.time);
                            if (keyframe_index !== -1) {
                                const color_keyframe0 = slot_timeline.color_keyframes[keyframe_index];
                                const color_keyframe1 = slot_timeline.color_keyframes[keyframe_index + 1];
                                if (color_keyframe1) {
                                    pct = color_keyframe0.curve.evaluate((this.time - color_keyframe0.time) / (color_keyframe1.time - color_keyframe0.time));
                                    color_keyframe0.color.tween(color_keyframe1.color, pct, pose_slot.color);
                                }
                                else {
                                    pose_slot.color.copy(color_keyframe0.color);
                                }
                            }
                            keyframe_index = Keyframe.find(slot_timeline.attachment_keyframes, this.time);
                            if (keyframe_index !== -1) {
                                const attachment_keyframe0 = slot_timeline.attachment_keyframes[keyframe_index];
                                pose_slot.attachment_key = attachment_keyframe0.name;
                            }
                        }
                    });
                    this.slot_keys = this.data.slot_keys;
                    if (anim) {
                        keyframe_index = Keyframe.find(anim.order_keyframes, this.time);
                        if (keyframe_index !== -1) {
                            const order_keyframe = anim.order_keyframes[keyframe_index];
                            this.slot_keys = this.data.slot_keys.slice(0);
                            order_keyframe.slot_offsets.forEach((slot_offset) => {
                                const slot_index = this.slot_keys.indexOf(slot_offset.slot_key);
                                if (slot_index !== -1) {
                                    this.slot_keys.splice(slot_index, 1);
                                    this.slot_keys.splice(slot_index + slot_offset.offset, 0, slot_offset.slot_key);
                                }
                            });
                        }
                    }
                }
                _strikePtcs(anim) {
                    let keyframe_index;
                    let pct;
                    this.data.ptc_keys.forEach((ptc_key) => {
                        const ptc = this.data.ptcs[ptc_key];
                        let ptc_spacing = ptc.spacing;
                        let ptc_position_mix = ptc.position_mix;
                        let ptc_position = ptc.position;
                        let ptc_rotation_mix = ptc.rotation_mix;
                        const ptc_rotation = ptc.rotation;
                        const ptc_timeline = anim && anim.ptc_timeline_map[ptc_key];
                        if (ptc_timeline) {
                            keyframe_index = Keyframe.find(ptc_timeline.ptc_mix_keyframes, this.time);
                            if (keyframe_index !== -1) {
                                const ptc_mix_keyframe0 = ptc_timeline.ptc_mix_keyframes[keyframe_index];
                                const ptc_mix_keyframe1 = ptc_timeline.ptc_mix_keyframes[keyframe_index + 1];
                                if (ptc_mix_keyframe1) {
                                    pct = ptc_mix_keyframe0.curve.evaluate((this.time - ptc_mix_keyframe0.time) / (ptc_mix_keyframe1.time - ptc_mix_keyframe0.time));
                                    ptc_position_mix = tween(ptc_mix_keyframe0.position_mix, ptc_mix_keyframe1.position_mix, pct);
                                    ptc_rotation_mix = tween(ptc_mix_keyframe0.rotation_mix, ptc_mix_keyframe1.rotation_mix, pct);
                                }
                                else {
                                    ptc_position_mix = ptc_mix_keyframe0.position_mix;
                                    ptc_rotation_mix = ptc_mix_keyframe0.rotation_mix;
                                }
                            }
                            keyframe_index = Keyframe.find(ptc_timeline.ptc_spacing_keyframes, this.time);
                            if (keyframe_index !== -1) {
                                const ptc_spacing_keyframe0 = ptc_timeline.ptc_spacing_keyframes[keyframe_index];
                                const ptc_spacing_keyframe1 = ptc_timeline.ptc_spacing_keyframes[keyframe_index + 1];
                                if (ptc_spacing_keyframe1) {
                                    pct = ptc_spacing_keyframe0.curve.evaluate((this.time - ptc_spacing_keyframe0.time) / (ptc_spacing_keyframe1.time - ptc_spacing_keyframe0.time));
                                    ptc_spacing = tween(ptc_spacing_keyframe0.spacing, ptc_spacing_keyframe1.spacing, pct);
                                }
                                else {
                                    ptc_spacing = ptc_spacing_keyframe0.spacing;
                                }
                            }
                            keyframe_index = Keyframe.find(ptc_timeline.ptc_position_keyframes, this.time);
                            if (keyframe_index !== -1) {
                                const ptc_position_keyframe0 = ptc_timeline.ptc_position_keyframes[keyframe_index];
                                const ptc_position_keyframe1 = ptc_timeline.ptc_position_keyframes[keyframe_index + 1];
                                if (ptc_position_keyframe1) {
                                    pct = ptc_position_keyframe0.curve.evaluate((this.time - ptc_position_keyframe0.time) / (ptc_position_keyframe1.time - ptc_position_keyframe0.time));
                                    ptc_position = tween(ptc_position_keyframe0.position, ptc_position_keyframe1.position, pct);
                                }
                                else {
                                    ptc_position = ptc_position_keyframe0.position;
                                }
                            }
                            keyframe_index = Keyframe.find(ptc_timeline.ptc_rotation_keyframes, this.time);
                            if (keyframe_index !== -1) {
                                const ptc_rotation_keyframe0 = ptc_timeline.ptc_rotation_keyframes[keyframe_index];
                                const ptc_rotation_keyframe1 = ptc_timeline.ptc_rotation_keyframes[keyframe_index + 1];
                                if (ptc_rotation_keyframe1) {
                                    pct = ptc_rotation_keyframe0.curve.evaluate((this.time - ptc_rotation_keyframe0.time) / (ptc_rotation_keyframe1.time - ptc_rotation_keyframe0.time));
                                    ptc_rotation.rad = tweenAngleRadians(ptc_rotation_keyframe0.rotation.rad, ptc_rotation_keyframe1.rotation.rad, pct);
                                }
                                else {
                                    ptc_rotation.copy(ptc_rotation_keyframe0.rotation);
                                }
                            }
                        }
                        ptc.bone_keys.forEach(function (bone_key) {
                        });
                    });
                }
                _strikeEvents(anim) {
                    this.events.length = 0;
                    if (anim && anim.event_keyframes) {
                        const make_event = (event_keyframe) => {
                            const pose_event = new Event();
                            const data_event = this.data.events[event_keyframe.name];
                            if (data_event) {
                                pose_event.copy(data_event);
                            }
                            pose_event.int_value = event_keyframe.int_value || pose_event.int_value;
                            pose_event.float_value = event_keyframe.float_value || pose_event.float_value;
                            pose_event.string_value = event_keyframe.string_value || pose_event.string_value;
                            return pose_event;
                        };
                        if (this.time < this.prev_time) {
                            if (this.wrapped_min) {
                                anim.event_keyframes.forEach((event_keyframe) => {
                                    if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time < this.prev_time)) ||
                                        ((this.time <= event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
                                        this.events.push(make_event(event_keyframe));
                                    }
                                });
                            }
                            else {
                                anim.event_keyframes.forEach((event_keyframe) => {
                                    if ((this.time <= event_keyframe.time) && (event_keyframe.time < this.prev_time)) {
                                        this.events.push(make_event(event_keyframe));
                                    }
                                });
                            }
                        }
                        else {
                            if (this.wrapped_max) {
                                anim.event_keyframes.forEach((event_keyframe) => {
                                    if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time <= this.time)) ||
                                        ((this.prev_time < event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
                                        this.events.push(make_event(event_keyframe));
                                    }
                                });
                            }
                            else {
                                anim.event_keyframes.forEach((event_keyframe) => {
                                    if ((this.prev_time < event_keyframe.time) && (event_keyframe.time <= this.time)) {
                                        this.events.push(make_event(event_keyframe));
                                    }
                                });
                            }
                        }
                    }
                }
                iterateBones(callback) {
                    this.bone_keys.forEach((bone_key) => {
                        const bone = this.bones[bone_key];
                        callback(bone_key, bone);
                    });
                }
                iterateAttachments(callback) {
                    const data = this.data;
                    const skin = data && data.skins[this.skin_key];
                    const default_skin = data && data.skins["default"];
                    this.slot_keys.forEach((slot_key) => {
                        const pose_slot = this.slots[slot_key];
                        const skin_slot = skin && (skin.slots[slot_key] || default_skin.slots[slot_key]);
                        let attachment = skin_slot && skin_slot.attachments[pose_slot.attachment_key];
                        let attachment_key = (attachment && attachment.name) || pose_slot.attachment_key;
                        if (attachment && (attachment.type === "linkedmesh")) {
                            attachment_key = attachment && attachment.parent_key;
                            attachment = skin_slot && skin_slot.attachments[attachment_key];
                        }
                        callback(slot_key, pose_slot, skin_slot, attachment_key, attachment);
                    });
                }
            };
            exports_1("Pose", Pose);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQWtDQSxrQkFBeUIsSUFBUyxFQUFFLEdBQW9CLEVBQUUsTUFBZSxLQUFLO1FBQzVFLE1BQU0sS0FBSyxHQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsQ0FBQyxPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLEtBQUssUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEtBQUssS0FBSyxNQUFNLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQ3hELEtBQUssU0FBUyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDN0IsU0FBUyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ3RCLENBQUM7SUFDSCxDQUFDOztJQUVELGtCQUF5QixJQUFTLEVBQUUsR0FBb0IsRUFBRSxLQUFjLEVBQUUsTUFBZSxLQUFLO1FBQzVGLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLENBQUM7SUFDSCxDQUFDOztJQUVELG1CQUEwQixJQUFTLEVBQUUsR0FBb0IsRUFBRSxNQUFjLENBQUM7UUFDeEUsTUFBTSxLQUFLLEdBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxDQUFDLE9BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsS0FBSyxRQUFRLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QyxLQUFLLFFBQVEsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQzVCLFNBQVMsTUFBTSxDQUFD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VyxHQUFHLFdBQVcsQ0FBQztRQUN2RCxNQUFNLFlBQVksR0FBVyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ3hELE1BQU0sSUFBSSxHQUFXLENBQUMsR0FBRyxXQUFXLENBQUM7UUFDckMsTUFBTSxJQUFJLEdBQVcsQ0FBQyxHQUFHLFlBQVksQ0FBQztRQUN0QyxNQUFNLElBQUksR0FBVyxDQUFDLEdBQUcsWUFBWSxDQUFDO1FBQ3RDLE1BQU0sSUFBSSxHQUFXLENBQUMsR0FBRyxZQUFZLENBQUM7UUFDdEMsTUFBTSxLQUFLLEdBQVcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUNyQyxNQUFNLEtBQUssR0FBVyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQ3JDLE1BQU0sS0FBSyxHQUFXLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUMsTUFBTSxLQUFLLEdBQVcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQyxNQUFNLFFBQVEsR0FBVyxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsWUFBWSxDQUFDLENBQUM7UUFDNUUsTUFBTSxRQUFRLEdBQVcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLFlBQVksQ0FBQyxDQUFDO1FBQzVFLE1BQU0sUUFBUSxHQUFXLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDdkQsTUFBTSxRQUFRLEdBQVcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN2RCxNQUFNLFFBQVEsR0FBVyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN4QyxNQUFNLFFBQVEsR0FBVyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FB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QUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dDQUNuRCxNQUFNLEVBQUUsR0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUN6QyxNQUFNLEVBQUUsR0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUN6QyxJQUFJLEVBQUUsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBVyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxFQUFVLEVBQUUsRUFBVSxDQUFDO2dDQUN2RyxLQUFLLEVBQ0wsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztvQ0FDbEMsRUFBRSxJQUFJLEdBQUcsQ0FBQztvQ0FDVixJQUFJLEdBQUcsR0FBVyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7b0NBQzFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQzt3Q0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0NBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7d0NBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztvQ0FDbEQsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO29DQUM5QixNQUFNLEdBQUcsR0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQztvQ0FDbEMsTUFBTSxHQUFHLEdBQVcsRUFBRSxHQUFH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