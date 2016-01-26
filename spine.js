System.register([], function(exports_1) {
    "use strict";
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var Color, Curve, Angle, Vector, Position, Rotation, Scale, Space, Bone, Ikc, Slot, Attachment, RegionAttachment, BoundingBoxAttachment, MeshAttachment, SkinnedMeshAttachment, SkinSlot, Skin, Event, Keyframe, BoneKeyframe, TranslateKeyframe, RotateKeyframe, ScaleKeyframe, AnimBone, SlotKeyframe, ColorKeyframe, AttachmentKeyframe, AnimSlot, EventKeyframe, SlotOffset, OrderKeyframe, IkcKeyframe, AnimIkc, FfdKeyframe, FfdAttachment, FfdSlot, AnimFfd, Animation, Skeleton, Data, Pose;
    function loadBool(json, key, def) {
        var value = json[key];
        switch (typeof (value)) {
            case "string": return (value === "true") ? true : false;
            case "boolean": return value;
            default: return def || false;
        }
    }
    exports_1("loadBool", loadBool);
    function saveBool(json, key, value, def) {
        if ((typeof (def) !== "boolean") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveBool", saveBool);
    function loadFloat(json, key, def) {
        var value = json[key];
        switch (typeof (value)) {
            case "string": return parseFloat(value);
            case "number": return value;
            default: return def || 0;
        }
    }
    exports_1("loadFloat", loadFloat);
    function saveFloat(json, key, value, def) {
        if ((typeof (def) !== "number") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveFloat", saveFloat);
    function loadInt(json, key, def) {
        var value = json[key];
        switch (typeof (value)) {
            case "string": return parseInt(value, 10);
            case "number": return 0 | value;
            default: return def || 0;
        }
    }
    exports_1("loadInt", loadInt);
    function saveInt(json, key, value, def) {
        if ((typeof (def) !== "number") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveInt", saveInt);
    function loadString(json, key, def) {
        var value = json[key];
        switch (typeof (value)) {
            case "string": return value;
            default: return def || "";
        }
    }
    exports_1("loadString", loadString);
    function saveString(json, key, value, def) {
        if ((typeof (def) !== "string") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveString", saveString);
    function BezierCurve(x1, y1, x2, y2, epsilon) {
        if (epsilon === void 0) { epsilon = 1e-6; }
        function curveX(t) {
            var t2 = t * t;
            var t3 = t2 * t;
            var v = 1 - t;
            var v2 = v * v;
            return 3 * x1 * v2 * t + 3 * x2 * v * t2 + t3;
        }
        ;
        function curveY(t) {
            var t2 = t * t;
            var t3 = t2 * t;
            var v = 1 - t;
            var v2 = v * v;
            return 3 * y1 * v2 * t + 3 * y2 * v * t2 + t3;
        }
        ;
        function derivativeCurveX(t) {
            var t2 = t * t;
            var t3 = t2 * t;
            return 3 * x1 * t - 3 * (2 * x1 - x2) * t2 + (3 * x1 - 3 * x2 + 1) * t3;
        }
        ;
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
    return {
        setters:[],
        execute: function() {
            Color = (function () {
                function Color() {
                    this.r = 1.0;
                    this.g = 1.0;
                    this.b = 1.0;
                    this.a = 1.0;
                }
                Color.prototype.copy = function (other) {
                    this.r = other.r;
                    this.g = other.g;
                    this.b = other.b;
                    this.a = other.a;
                    return this;
                };
                Color.prototype.load = function (json) {
                    var color = this;
                    var rgba = 0xffffffff;
                    switch (typeof (json)) {
                        case "string":
                            rgba = parseInt(json, 16);
                            break;
                        case "number":
                            rgba = 0 | json;
                            break;
                        default:
                            rgba = 0xffffffff;
                            break;
                    }
                    color.r = ((rgba >> 24) & 0xff) / 255;
                    color.g = ((rgba >> 16) & 0xff) / 255;
                    color.b = ((rgba >> 8) & 0xff) / 255;
                    color.a = (rgba & 0xff) / 255;
                    return color;
                };
                Color.prototype.toString = function () {
                    var color = this;
                    return "rgba(" + (color.r * 255).toFixed(0) + "," + (color.g * 255).toFixed(0) + "," + (color.b * 255).toFixed(0) + "," + color.a + ")";
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
                    this.rad = 0.0;
                    this.rad = rad || 0.0;
                }
                Object.defineProperty(Angle.prototype, "deg", {
                    get: function () { return this.rad * 180.0 / Math.PI; },
                    set: function (value) { this.rad = value * Math.PI / 180.0; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Angle.prototype, "cos", {
                    get: function () { return Math.cos(this.rad); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Angle.prototype, "sin", {
                    get: function () { return Math.sin(this.rad); },
                    enumerable: true,
                    configurable: true
                });
                Angle.prototype.selfIdentity = function () { this.rad = 0.0; return this; };
                Angle.prototype.copy = function (other) { this.rad = other.rad; return this; };
                return Angle;
            }());
            Vector = (function () {
                function Vector(x, y) {
                    if (x === void 0) { x = 0.0; }
                    if (y === void 0) { y = 0.0; }
                    this.x = 0.0;
                    this.y = 0.0;
                    this.x = x;
                    this.y = y;
                }
                Vector.prototype.copy = function (other) {
                    this.x = other.x;
                    this.y = other.y;
                    return this;
                };
                Vector.equal = function (a, b, epsilon) {
                    if (epsilon === void 0) { epsilon = 1e-6; }
                    if (Math.abs(a.x - b.x) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.y - b.y) > epsilon) {
                        return false;
                    }
                    return true;
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
            Position = (function (_super) {
                __extends(Position, _super);
                function Position() {
                    _super.call(this, 0.0, 0.0);
                }
                return Position;
            }(Vector));
            exports_1("Position", Position);
            Rotation = (function (_super) {
                __extends(Rotation, _super);
                function Rotation() {
                    _super.call(this, 0.0);
                }
                return Rotation;
            }(Angle));
            exports_1("Rotation", Rotation);
            Scale = (function (_super) {
                __extends(Scale, _super);
                function Scale() {
                    _super.call(this, 1.0, 1.0);
                }
                Scale.prototype.selfIdentity = function () {
                    this.x = 1.0;
                    this.y = 1.0;
                    return this;
                };
                return Scale;
            }(Vector));
            exports_1("Scale", Scale);
            Space = (function () {
                function Space() {
                    this.position = new Position();
                    this.rotation = new Rotation();
                    this.scale = new Scale();
                }
                Space.prototype.copy = function (other) {
                    this.position.copy(other.position);
                    this.rotation.copy(other.rotation);
                    this.scale.copy(other.scale);
                    return this;
                };
                Space.prototype.load = function (json) {
                    this.position.x = loadFloat(json, "x", 0);
                    this.position.y = loadFloat(json, "y", 0);
                    this.rotation.deg = loadFloat(json, "rotation", 0);
                    this.scale.x = loadFloat(json, "scaleX", 1);
                    this.scale.y = loadFloat(json, "scaleY", 1);
                    return this;
                };
                Space.equal = function (a, b, epsilon) {
                    if (epsilon === void 0) { epsilon = 1e-6; }
                    if (Math.abs(a.position.x - b.position.x) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.position.y - b.position.y) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.rotation.rad - b.rotation.rad) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.scale.x - b.scale.x) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.scale.y - b.scale.y) > epsilon) {
                        return false;
                    }
                    return true;
                };
                Space.identity = function (out) {
                    if (out === void 0) { out = new Space(); }
                    out.position.x = 0;
                    out.position.y = 0;
                    out.rotation.rad = 0;
                    out.scale.x = 1;
                    out.scale.y = 1;
                    return out;
                };
                Space.translate = function (space, x, y) {
                    x *= space.scale.x;
                    y *= space.scale.y;
                    var rad = space.rotation.rad;
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var tx = c * x - s * y;
                    var ty = s * x + c * y;
                    space.position.x += tx;
                    space.position.y += ty;
                    return space;
                };
                Space.rotate = function (space, rad) {
                    space.rotation.rad += rad;
                    space.rotation.rad = wrapAngleRadians(space.rotation.rad);
                    return space;
                };
                Space.scale = function (space, x, y) {
                    space.scale.x *= x;
                    space.scale.y *= y;
                    return space;
                };
                Space.invert = function (space, out) {
                    if (out === void 0) { out = new Space(); }
                    var inv_scale_x = 1 / space.scale.x;
                    var inv_scale_y = 1 / space.scale.y;
                    var inv_rotation = -space.rotation.rad;
                    var inv_x = -space.position.x;
                    var inv_y = -space.position.y;
                    out.scale.x = inv_scale_x;
                    out.scale.y = inv_scale_y;
                    out.rotation.rad = inv_rotation;
                    var x = inv_x;
                    var y = inv_y;
                    var rad = inv_rotation;
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var tx = c * x - s * y;
                    var ty = s * x + c * y;
                    out.position.x = tx * inv_scale_x;
                    out.position.y = ty * inv_scale_y;
                    return out;
                };
                Space.combine = function (a, b, out) {
                    if (out === void 0) { out = new Space(); }
                    var x = b.position.x * a.scale.x;
                    var y = b.position.y * a.scale.y;
                    var rad = a.rotation.rad;
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var tx = c * x - s * y;
                    var ty = s * x + c * y;
                    out.position.x = tx + a.position.x;
                    out.position.y = ty + a.position.y;
                    out.rotation.rad = wrapAngleRadians(b.rotation.rad + a.rotation.rad);
                    out.scale.x = b.scale.x * a.scale.x;
                    out.scale.y = b.scale.y * a.scale.y;
                    return out;
                };
                Space.extract = function (ab, a, out) {
                    if (out === void 0) { out = new Space(); }
                    out.scale.x = ab.scale.x / a.scale.x;
                    out.scale.y = ab.scale.y / a.scale.y;
                    out.rotation.rad = wrapAngleRadians(ab.rotation.rad - a.rotation.rad);
                    var x = ab.position.x - a.position.x;
                    var y = ab.position.y - a.position.y;
                    var rad = -a.rotation.rad;
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var tx = c * x - s * y;
                    var ty = s * x + c * y;
                    out.position.x = tx / a.scale.x;
                    out.position.y = ty / a.scale.y;
                    return out;
                };
                Space.transform = function (space, v, out) {
                    if (out === void 0) { out = new Vector(); }
                    var x = v.x * space.scale.x;
                    var y = v.y * space.scale.y;
                    var rad = space.rotation.rad;
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var tx = c * x - s * y;
                    var ty = s * x + c * y;
                    out.x = tx + space.position.x;
                    out.y = ty + space.position.y;
                    return out;
                };
                Space.untransform = function (space, v, out) {
                    if (out === void 0) { out = new Vector(); }
                    var x = v.x - space.position.x;
                    var y = v.y - space.position.y;
                    var rad = -space.rotation.rad;
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var tx = c * x - s * y;
                    var ty = s * x + c * y;
                    out.x = tx / space.scale.x;
                    out.y = ty / space.scale.y;
                    return out;
                };
                Space.tween = function (a, b, t, out) {
                    if (out === void 0) { out = new Space(); }
                    out.position.x = tween(a.position.x, b.position.x, t);
                    out.position.y = tween(a.position.y, b.position.y, t);
                    out.rotation.rad = tweenAngle(a.rotation.rad, b.rotation.rad, t);
                    out.scale.x = tween(a.scale.x, b.scale.x, t);
                    out.scale.y = tween(a.scale.y, b.scale.y, t);
                    return out;
                };
                return Space;
            }());
            exports_1("Space", Space);
            Bone = (function () {
                function Bone() {
                    this.parent_key = "";
                    this.length = 0;
                    this.local_space = new Space();
                    this.world_space = new Space();
                    this.inherit_rotation = true;
                    this.inherit_scale = true;
                }
                Bone.prototype.copy = function (other) {
                    this.parent_key = other.parent_key;
                    this.length = other.length;
                    this.local_space.copy(other.local_space);
                    this.world_space.copy(other.world_space);
                    this.inherit_rotation = other.inherit_rotation;
                    this.inherit_scale = other.inherit_scale;
                    return this;
                };
                Bone.prototype.load = function (json) {
                    this.parent_key = loadString(json, "parent", "");
                    this.length = loadFloat(json, "length", 0);
                    this.local_space.load(json);
                    this.world_space.copy(this.local_space);
                    this.inherit_rotation = loadBool(json, "inheritRotation", true);
                    this.inherit_scale = loadBool(json, "inheritScale", true);
                    return this;
                };
                Bone.flatten = function (bone, bones) {
                    var parent_bone = bones[bone.parent_key];
                    if (parent_bone) {
                        Bone.flatten(parent_bone, bones);
                        var a = parent_bone.world_space;
                        var b = bone.local_space;
                        var out = bone.world_space;
                        var x = b.position.x * a.scale.x;
                        var y = b.position.y * a.scale.y;
                        var rad = a.rotation.rad;
                        var c = Math.cos(rad);
                        var s = Math.sin(rad);
                        var tx = c * x - s * y;
                        var ty = s * x + c * y;
                        out.position.x = tx + a.position.x;
                        out.position.y = ty + a.position.y;
                        if (bone.inherit_rotation) {
                            out.rotation.rad = wrapAngleRadians(b.rotation.rad + a.rotation.rad);
                        }
                        else {
                            out.rotation.rad = b.rotation.rad;
                        }
                        if (bone.inherit_scale) {
                            out.scale.x = b.scale.x * a.scale.x;
                            out.scale.y = b.scale.y * a.scale.y;
                        }
                        else {
                            out.scale.x = b.scale.x;
                            out.scale.y = b.scale.y;
                        }
                    }
                    else {
                        bone.world_space.copy(bone.local_space);
                    }
                    return bone;
                };
                return Bone;
            }());
            exports_1("Bone", Bone);
            Ikc = (function () {
                function Ikc() {
                    this.name = "";
                    this.bone_keys = [];
                    this.target_key = "";
                    this.mix = 1;
                    this.bend_positive = true;
                }
                Ikc.prototype.load = function (json) {
                    this.name = loadString(json, "name", "");
                    this.bone_keys = json["bones"] || [];
                    this.target_key = loadString(json, "target", "");
                    this.mix = loadFloat(json, "mix", 1);
                    this.bend_positive = loadBool(json, "bendPositive", true);
                    return this;
                };
                return Ikc;
            }());
            exports_1("Ikc", Ikc);
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
                    this.type = "region";
                    this.name = "";
                    this.path = "";
                    this.type = type;
                }
                Attachment.prototype.load = function (json) {
                    var type = loadString(json, "type", "region");
                    if (type !== this.type) {
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
                    _super.call(this, "region");
                    this.local_space = new Space();
                    this.width = 0;
                    this.height = 0;
                }
                RegionAttachment.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
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
                    _super.call(this, "boundingbox");
                    this.vertices = [];
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
                    _super.call(this, "mesh");
                    this.color = new Color();
                    this.triangles = [];
                    this.edges = [];
                    this.vertices = [];
                    this.uvs = [];
                    this.hull = 0;
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
            SkinnedMeshAttachment = (function (_super) {
                __extends(SkinnedMeshAttachment, _super);
                function SkinnedMeshAttachment() {
                    _super.call(this, "skinnedmesh");
                    this.color = new Color();
                    this.triangles = [];
                    this.edges = [];
                    this.vertices = [];
                    this.uvs = [];
                    this.hull = 0;
                }
                SkinnedMeshAttachment.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.color.load(json.color);
                    this.triangles = json.triangles || [];
                    this.edges = json.edges || [];
                    this.vertices = json.vertices || [];
                    this.uvs = json.uvs || [];
                    this.hull = loadInt(json, "hull", 0);
                    return this;
                };
                return SkinnedMeshAttachment;
            }(Attachment));
            exports_1("SkinnedMeshAttachment", SkinnedMeshAttachment);
            SkinSlot = (function () {
                function SkinSlot() {
                    this.attachments = {};
                    this.attachment_keys = [];
                }
                SkinSlot.prototype.load = function (json) {
                    var _this = this;
                    this.attachment_keys = Object.keys(json);
                    this.attachment_keys.forEach(function (attachment_key) {
                        var json_attachment = json[attachment_key];
                        switch (json_attachment.type) {
                            case "region":
                            default:
                                _this.attachments[attachment_key] = new RegionAttachment().load(json_attachment);
                                break;
                            case "boundingbox":
                                _this.attachments[attachment_key] = new BoundingBoxAttachment().load(json_attachment);
                                break;
                            case "mesh":
                                _this.attachments[attachment_key] = new MeshAttachment().load(json_attachment);
                                break;
                            case "skinnedmesh":
                                _this.attachments[attachment_key] = new SkinnedMeshAttachment().load(json_attachment);
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
                    this.slot_keys = Object.keys(json);
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
                            callback(slot_key, skin_slot, attachment.path || attachment.name || attachment_key, attachment);
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
                    _super.apply(this, arguments);
                    this.curve = new Curve();
                }
                BoneKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.curve.load(json.curve);
                    return this;
                };
                return BoneKeyframe;
            }(Keyframe));
            exports_1("BoneKeyframe", BoneKeyframe);
            TranslateKeyframe = (function (_super) {
                __extends(TranslateKeyframe, _super);
                function TranslateKeyframe() {
                    _super.apply(this, arguments);
                    this.position = new Position();
                }
                TranslateKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.position.x = loadFloat(json, "x", 0);
                    this.position.y = loadFloat(json, "y", 0);
                    return this;
                };
                return TranslateKeyframe;
            }(BoneKeyframe));
            exports_1("TranslateKeyframe", TranslateKeyframe);
            RotateKeyframe = (function (_super) {
                __extends(RotateKeyframe, _super);
                function RotateKeyframe() {
                    _super.apply(this, arguments);
                    this.rotation = new Rotation();
                }
                RotateKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.rotation.deg = loadFloat(json, "angle", 0);
                    return this;
                };
                return RotateKeyframe;
            }(BoneKeyframe));
            exports_1("RotateKeyframe", RotateKeyframe);
            ScaleKeyframe = (function (_super) {
                __extends(ScaleKeyframe, _super);
                function ScaleKeyframe() {
                    _super.apply(this, arguments);
                    this.scale = new Scale();
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
            AnimBone = (function () {
                function AnimBone() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                AnimBone.prototype.load = function (json) {
                    var _this = this;
                    this.min_time = 0;
                    this.max_time = 0;
                    this.translate_keyframes = null;
                    this.rotate_keyframes = null;
                    this.scale_keyframes = null;
                    Object.keys(json).forEach(function (key) {
                        switch (key) {
                            case "translate":
                                _this.translate_keyframes = [];
                                json.translate.forEach(function (translate_json) {
                                    var translate_keyframe = new TranslateKeyframe().load(translate_json);
                                    _this.translate_keyframes.push(translate_keyframe);
                                    _this.min_time = Math.min(_this.min_time, translate_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, translate_keyframe.time);
                                });
                                _this.translate_keyframes = _this.translate_keyframes.sort(Keyframe.compare);
                                break;
                            case "rotate":
                                _this.rotate_keyframes = [];
                                json.rotate.forEach(function (rotate_json) {
                                    var rotate_keyframe = new RotateKeyframe().load(rotate_json);
                                    _this.rotate_keyframes.push(rotate_keyframe);
                                    _this.min_time = Math.min(_this.min_time, rotate_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, rotate_keyframe.time);
                                });
                                _this.rotate_keyframes = _this.rotate_keyframes.sort(Keyframe.compare);
                                break;
                            case "scale":
                                _this.scale_keyframes = [];
                                json.scale.forEach(function (scale_json) {
                                    var scale_keyframe = new ScaleKeyframe().load(scale_json);
                                    _this.scale_keyframes.push(scale_keyframe);
                                    _this.min_time = Math.min(_this.min_time, scale_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, scale_keyframe.time);
                                });
                                _this.scale_keyframes = _this.scale_keyframes.sort(Keyframe.compare);
                                break;
                            default:
                                console.log("TODO: AnimBone::load", key);
                                break;
                        }
                    });
                    return this;
                };
                return AnimBone;
            }());
            exports_1("AnimBone", AnimBone);
            SlotKeyframe = (function (_super) {
                __extends(SlotKeyframe, _super);
                function SlotKeyframe() {
                    _super.apply(this, arguments);
                }
                return SlotKeyframe;
            }(Keyframe));
            exports_1("SlotKeyframe", SlotKeyframe);
            ColorKeyframe = (function (_super) {
                __extends(ColorKeyframe, _super);
                function ColorKeyframe() {
                    _super.apply(this, arguments);
                    this.color = new Color();
                    this.curve = new Curve();
                }
                ColorKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.color.load(json.color);
                    this.curve.load(json.curve);
                    return this;
                };
                return ColorKeyframe;
            }(SlotKeyframe));
            exports_1("ColorKeyframe", ColorKeyframe);
            AttachmentKeyframe = (function (_super) {
                __extends(AttachmentKeyframe, _super);
                function AttachmentKeyframe() {
                    _super.apply(this, arguments);
                    this.name = "";
                }
                AttachmentKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.name = loadString(json, "name", "");
                    return this;
                };
                return AttachmentKeyframe;
            }(SlotKeyframe));
            exports_1("AttachmentKeyframe", AttachmentKeyframe);
            AnimSlot = (function () {
                function AnimSlot() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                AnimSlot.prototype.load = function (json) {
                    var _this = this;
                    this.min_time = 0;
                    this.max_time = 0;
                    this.color_keyframes = null;
                    this.attachment_keyframes = null;
                    Object.keys(json).forEach(function (key) {
                        switch (key) {
                            case "color":
                                _this.color_keyframes = [];
                                json[key].forEach(function (color) {
                                    var color_keyframe = new ColorKeyframe().load(color);
                                    _this.min_time = Math.min(_this.min_time, color_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, color_keyframe.time);
                                    _this.color_keyframes.push(color_keyframe);
                                });
                                _this.color_keyframes = _this.color_keyframes.sort(Keyframe.compare);
                                break;
                            case "attachment":
                                _this.attachment_keyframes = [];
                                json[key].forEach(function (attachment) {
                                    var attachment_keyframe = new AttachmentKeyframe().load(attachment);
                                    _this.min_time = Math.min(_this.min_time, attachment_keyframe.time);
                                    _this.max_time = Math.max(_this.max_time, attachment_keyframe.time);
                                    _this.attachment_keyframes.push(attachment_keyframe);
                                });
                                _this.attachment_keyframes = _this.attachment_keyframes.sort(Keyframe.compare);
                                break;
                            default:
                                console.log("TODO: AnimSlot::load", key);
                                break;
                        }
                    });
                    return this;
                };
                return AnimSlot;
            }());
            exports_1("AnimSlot", AnimSlot);
            EventKeyframe = (function (_super) {
                __extends(EventKeyframe, _super);
                function EventKeyframe() {
                    _super.apply(this, arguments);
                    this.name = "";
                    this.int_value = 0;
                    this.float_value = 0;
                    this.string_value = "";
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
                    _super.apply(this, arguments);
                    this.slot_offsets = [];
                }
                OrderKeyframe.prototype.load = function (json) {
                    var _this = this;
                    _super.prototype.load.call(this, json);
                    this.slot_offsets = [];
                    Object.keys(json).forEach(function (key) {
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
                    _super.apply(this, arguments);
                    this.curve = new Curve();
                    this.mix = 1;
                    this.bend_positive = true;
                }
                IkcKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.curve.load(json);
                    this.mix = loadFloat(json, "mix", 1);
                    this.bend_positive = loadBool(json, "bendPositive", true);
                    return this;
                };
                return IkcKeyframe;
            }(Keyframe));
            exports_1("IkcKeyframe", IkcKeyframe);
            AnimIkc = (function () {
                function AnimIkc() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                AnimIkc.prototype.load = function (json) {
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
                    this.ikc_keyframes = this.ikc_keyframes.sort(Keyframe.compare);
                    return this;
                };
                return AnimIkc;
            }());
            exports_1("AnimIkc", AnimIkc);
            FfdKeyframe = (function (_super) {
                __extends(FfdKeyframe, _super);
                function FfdKeyframe() {
                    _super.apply(this, arguments);
                    this.curve = new Curve();
                    this.offset = 0;
                }
                FfdKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.curve.load(json);
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
                    this.ffd_keyframes = this.ffd_keyframes.sort(Keyframe.compare);
                    return this;
                };
                return FfdAttachment;
            }());
            exports_1("FfdAttachment", FfdAttachment);
            FfdSlot = (function () {
                function FfdSlot() {
                }
                FfdSlot.prototype.load = function (json) {
                    var _this = this;
                    this.ffd_attachments = {};
                    this.ffd_attachment_keys = Object.keys(json);
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
            AnimFfd = (function () {
                function AnimFfd() {
                    this.min_time = 0;
                    this.max_time = 0;
                }
                AnimFfd.prototype.load = function (json) {
                    var _this = this;
                    this.min_time = 0;
                    this.max_time = 0;
                    this.ffd_slots = {};
                    this.ffd_slot_keys = Object.keys(json);
                    this.ffd_slot_keys.forEach(function (key) {
                        _this.ffd_slots[key] = new FfdSlot().load(json[key]);
                    });
                    this.iterateAttachments(function (ffd_slot_key, ffd_slot, ffd_attachment_key, ffd_attachment) {
                        _this.min_time = Math.min(_this.min_time, ffd_attachment.min_time);
                        _this.max_time = Math.max(_this.max_time, ffd_attachment.max_time);
                    });
                    return this;
                };
                AnimFfd.prototype.iterateAttachments = function (callback) {
                    var _this = this;
                    var ffd_slot_key;
                    var ffd_slot;
                    this.ffd_slot_keys.forEach(function (ffd_slot_key) {
                        ffd_slot = _this.ffd_slots[ffd_slot_key];
                        ffd_slot.iterateAttachments(function (ffd_attachment_key, ffd_attachment) {
                            callback(ffd_slot_key, ffd_slot, ffd_attachment_key, ffd_attachment);
                        });
                    });
                };
                return AnimFfd;
            }());
            exports_1("AnimFfd", AnimFfd);
            Animation = (function () {
                function Animation() {
                    this.name = "";
                    this.min_time = 0;
                    this.max_time = 0;
                    this.length = 0;
                }
                Animation.prototype.load = function (json) {
                    var _this = this;
                    this.bones = {};
                    this.slots = {};
                    this.event_keyframes = null;
                    this.order_keyframes = null;
                    this.ikcs = {};
                    this.ffds = {};
                    this.min_time = 0;
                    this.max_time = 0;
                    Object.keys(json).forEach(function (key) {
                        switch (key) {
                            case "bones":
                                Object.keys(json[key]).forEach(function (bone_key) {
                                    var anim_bone = new AnimBone().load(json[key][bone_key]);
                                    _this.min_time = Math.min(_this.min_time, anim_bone.min_time);
                                    _this.max_time = Math.max(_this.max_time, anim_bone.max_time);
                                    _this.bones[bone_key] = anim_bone;
                                });
                                break;
                            case "slots":
                                Object.keys(json[key]).forEach(function (slot_key) {
                                    var anim_slot = new AnimSlot().load(json[key][slot_key]);
                                    _this.min_time = Math.min(_this.min_time, anim_slot.min_time);
                                    _this.max_time = Math.max(_this.max_time, anim_slot.max_time);
                                    _this.slots[slot_key] = anim_slot;
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
                                _this.event_keyframes = _this.event_keyframes.sort(Keyframe.compare);
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
                                _this.order_keyframes = _this.order_keyframes.sort(Keyframe.compare);
                                break;
                            case "ik":
                                Object.keys(json[key]).forEach(function (ikc_key) {
                                    var anim_ikc = new AnimIkc().load(json[key][ikc_key]);
                                    _this.min_time = Math.min(_this.min_time, anim_ikc.min_time);
                                    _this.max_time = Math.max(_this.max_time, anim_ikc.max_time);
                                    _this.ikcs[ikc_key] = anim_ikc;
                                });
                                break;
                            case "ffd":
                                Object.keys(json[key]).forEach(function (ffd_key) {
                                    var anim_ffd = new AnimFfd().load(json[key][ffd_key]);
                                    _this.min_time = Math.min(_this.min_time, anim_ffd.min_time);
                                    _this.max_time = Math.max(_this.max_time, anim_ffd.max_time);
                                    _this.ffds[ffd_key] = anim_ffd;
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
                    this.slots = {};
                    this.slot_keys = [];
                    this.skins = {};
                    this.skin_keys = [];
                    this.events = {};
                    this.event_keys = [];
                    this.anims = {};
                    this.anim_keys = [];
                    Object.keys(json).forEach(function (key) {
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
                                break;
                            case "slots":
                                var json_slots = json[key];
                                json_slots.forEach(function (slot, slot_index) {
                                    _this.slots[slot.name] = new Slot().load(slot);
                                    _this.slot_keys[slot_index] = slot.name;
                                });
                                break;
                            case "skins":
                                var json_skins = json[key];
                                _this.skin_keys = Object.keys(json_skins);
                                _this.skin_keys.forEach(function (skin_key) {
                                    var skin = _this.skins[skin_key] = new Skin().load(json_skins[skin_key]);
                                    skin.name = skin.name || skin_key;
                                });
                                break;
                            case "events":
                                var json_events = json[key];
                                _this.event_keys = Object.keys(json_events);
                                _this.event_keys.forEach(function (event_key) {
                                    var event = _this.events[event_key] = new Event().load(json_events[event_key]);
                                    event.name = event.name || event_key;
                                });
                                break;
                            case "animations":
                                var json_animations = json[key];
                                _this.anim_keys = Object.keys(json_animations);
                                _this.anim_keys.forEach(function (anim_key) {
                                    var anim = _this.anims[anim_key] = new Animation().load(json_animations[anim_key]);
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
                Data.prototype.getSkins = function () { return this.skins; };
                Data.prototype.getEvents = function () { return this.events; };
                Data.prototype.getAnims = function () { return this.anims; };
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
                        var attachment_key = (attachment && (attachment.path || attachment.name)) || data_slot.attachment_key;
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
                    var pose = this;
                    var data = pose.data;
                    return data && data.skeleton;
                };
                Pose.prototype.getSkins = function () {
                    var pose = this;
                    var data = pose.data;
                    return data && data.skins;
                };
                Pose.prototype.curSkin = function () {
                    var pose = this;
                    var data = pose.data;
                    return data && data.skins[pose.skin_key];
                };
                Pose.prototype.getSkin = function () {
                    var pose = this;
                    return pose.skin_key;
                };
                Pose.prototype.setSkin = function (skin_key) {
                    var pose = this;
                    if (pose.skin_key !== skin_key) {
                        pose.skin_key = skin_key;
                    }
                };
                Pose.prototype.getEvents = function () {
                    var pose = this;
                    var data = pose.data;
                    return data && data.events;
                };
                Pose.prototype.getAnims = function () {
                    var pose = this;
                    var data = pose.data;
                    return data && data.anims;
                };
                Pose.prototype.curAnim = function () {
                    var pose = this;
                    var data = pose.data;
                    return data && data.anims[pose.anim_key];
                };
                Pose.prototype.curAnimLength = function () {
                    var pose = this;
                    var data = pose.data;
                    var anim = data && data.anims[pose.anim_key];
                    return (anim && anim.length) || 0;
                };
                Pose.prototype.getAnim = function () {
                    var pose = this;
                    return pose.anim_key;
                };
                Pose.prototype.setAnim = function (anim_key) {
                    var pose = this;
                    if (pose.anim_key !== anim_key) {
                        pose.anim_key = anim_key;
                        var data = pose.data;
                        var anim = data && data.anims[pose.anim_key];
                        if (anim) {
                            pose.time = wrap(pose.time, anim.min_time, anim.max_time);
                        }
                        pose.elapsed_time = 0;
                        pose.dirty = true;
                    }
                };
                Pose.prototype.getTime = function () {
                    var pose = this;
                    return pose.time;
                };
                Pose.prototype.setTime = function (time) {
                    var pose = this;
                    var data = pose.data;
                    var anim = data && data.anims[pose.anim_key];
                    if (anim) {
                        time = wrap(time, anim.min_time, anim.max_time);
                    }
                    if (pose.time !== time) {
                        pose.time = time;
                        pose.elapsed_time = 0;
                        pose.dirty = true;
                    }
                };
                Pose.prototype.update = function (elapsed_time) {
                    var pose = this;
                    pose.elapsed_time += elapsed_time;
                    pose.dirty = true;
                };
                Pose.prototype.strike = function () {
                    var pose = this;
                    if (!pose.dirty) {
                        return;
                    }
                    pose.dirty = false;
                    var data = pose.data;
                    var anim = data && data.anims[pose.anim_key];
                    var prev_time = pose.time;
                    var elapsed_time = pose.elapsed_time;
                    pose.time = pose.time + pose.elapsed_time;
                    pose.elapsed_time = 0;
                    var wrapped_min = false;
                    var wrapped_max = false;
                    if (anim) {
                        wrapped_min = (elapsed_time < 0) && (pose.time <= anim.min_time);
                        wrapped_max = (elapsed_time > 0) && (pose.time >= anim.max_time);
                        pose.time = wrap(pose.time, anim.min_time, anim.max_time);
                    }
                    var time = pose.time;
                    var keyframe_index;
                    data.bone_keys.forEach(function (bone_key) {
                        var data_bone = data.bones[bone_key];
                        var pose_bone = pose.bones[bone_key] || (pose.bones[bone_key] = new Bone());
                        pose_bone.copy(data_bone);
                        var anim_bone = anim && anim.bones[bone_key];
                        if (anim_bone) {
                            keyframe_index = Keyframe.find(anim_bone.translate_keyframes, time);
                            if (keyframe_index !== -1) {
                                var translate_keyframe0 = anim_bone.translate_keyframes[keyframe_index];
                                var translate_keyframe1 = anim_bone.translate_keyframes[keyframe_index + 1];
                                if (translate_keyframe1) {
                                    var pct = translate_keyframe0.curve.evaluate((time - translate_keyframe0.time) / (translate_keyframe1.time - translate_keyframe0.time));
                                    pose_bone.local_space.position.x += tween(translate_keyframe0.position.x, translate_keyframe1.position.x, pct);
                                    pose_bone.local_space.position.y += tween(translate_keyframe0.position.y, translate_keyframe1.position.y, pct);
                                }
                                else {
                                    pose_bone.local_space.position.x += translate_keyframe0.position.x;
                                    pose_bone.local_space.position.y += translate_keyframe0.position.y;
                                }
                            }
                            keyframe_index = Keyframe.find(anim_bone.rotate_keyframes, time);
                            if (keyframe_index !== -1) {
                                var rotate_keyframe0 = anim_bone.rotate_keyframes[keyframe_index];
                                var rotate_keyframe1 = anim_bone.rotate_keyframes[keyframe_index + 1];
                                if (rotate_keyframe1) {
                                    var pct = rotate_keyframe0.curve.evaluate((time - rotate_keyframe0.time) / (rotate_keyframe1.time - rotate_keyframe0.time));
                                    pose_bone.local_space.rotation.rad += tweenAngle(rotate_keyframe0.rotation.rad, rotate_keyframe1.rotation.rad, pct);
                                }
                                else {
                                    pose_bone.local_space.rotation.rad += rotate_keyframe0.rotation.rad;
                                }
                            }
                            keyframe_index = Keyframe.find(anim_bone.scale_keyframes, time);
                            if (keyframe_index !== -1) {
                                var scale_keyframe0 = anim_bone.scale_keyframes[keyframe_index];
                                var scale_keyframe1 = anim_bone.scale_keyframes[keyframe_index + 1];
                                if (scale_keyframe1) {
                                    var pct = scale_keyframe0.curve.evaluate((time - scale_keyframe0.time) / (scale_keyframe1.time - scale_keyframe0.time));
                                    pose_bone.local_space.scale.x += tween(scale_keyframe0.scale.x, scale_keyframe1.scale.x, pct) - 1;
                                    pose_bone.local_space.scale.y += tween(scale_keyframe0.scale.y, scale_keyframe1.scale.y, pct) - 1;
                                }
                                else {
                                    pose_bone.local_space.scale.x += scale_keyframe0.scale.x - 1;
                                    pose_bone.local_space.scale.y += scale_keyframe0.scale.y - 1;
                                }
                            }
                        }
                    });
                    pose.bone_keys = data.bone_keys;
                    data.ikc_keys.forEach(function (ikc_key) {
                        function clamp(n, lo, hi) { return (n < lo) ? lo : ((n > hi) ? hi : n); }
                        var ikc = data.ikcs[ikc_key];
                        var ikc_mix = ikc.mix;
                        var ikc_bend_positive = ikc.bend_positive;
                        var anim_ikc = anim && anim.ikcs[ikc_key];
                        if (anim_ikc) {
                            keyframe_index = Keyframe.find(anim_ikc.ikc_keyframes, time);
                            if (keyframe_index !== -1) {
                                var ikc_keyframe0 = anim_ikc.ikc_keyframes[keyframe_index];
                                var ikc_keyframe1 = anim_ikc.ikc_keyframes[keyframe_index + 1];
                                if (ikc_keyframe1) {
                                    var pct = ikc_keyframe0.curve.evaluate((time - ikc_keyframe0.time) / (ikc_keyframe1.time - ikc_keyframe0.time));
                                    ikc_mix = tween(ikc_keyframe0.mix, ikc_keyframe1.mix, pct);
                                }
                                else {
                                    ikc_mix = ikc_keyframe0.mix;
                                }
                                ikc_bend_positive = ikc_keyframe0.bend_positive;
                            }
                        }
                        var target = pose.bones[ikc.target_key];
                        Bone.flatten(target, pose.bones);
                        var target_x = target.world_space.position.x;
                        var target_y = target.world_space.position.y;
                        var alpha = ikc_mix;
                        var bend_direction = ikc_bend_positive ? 1 : -1;
                        if (alpha === 0) {
                            return;
                        }
                        switch (ikc.bone_keys.length) {
                            case 1:
                                var bone = pose.bones[ikc.bone_keys[0]];
                                Bone.flatten(bone, pose.bones);
                                var parent_rotation = 0;
                                var bone_parent = pose.bones[bone.parent_key];
                                if (bone_parent && bone.inherit_rotation) {
                                    Bone.flatten(bone_parent, pose.bones);
                                    parent_rotation = bone_parent.world_space.rotation.rad;
                                }
                                target_x -= bone.world_space.position.x;
                                target_y -= bone.world_space.position.y;
                                bone.local_space.rotation.rad = tweenAngle(bone.local_space.rotation.rad, Math.atan2(target_y, target_x) - parent_rotation, alpha);
                                break;
                            case 2:
                                var parent_1 = pose.bones[ikc.bone_keys[0]];
                                Bone.flatten(parent_1, pose.bones);
                                var child = pose.bones[ikc.bone_keys[1]];
                                Bone.flatten(child, pose.bones);
                                var position = new Vector();
                                var parent_parent = pose.bones[parent_1.parent_key];
                                if (parent_parent) {
                                    position.x = target_x;
                                    position.y = target_y;
                                    Bone.flatten(parent_parent, pose.bones);
                                    Space.untransform(parent_parent.world_space, position, position);
                                    target_x = (position.x - parent_1.local_space.position.x) * parent_parent.world_space.scale.x;
                                    target_y = (position.y - parent_1.local_space.position.y) * parent_parent.world_space.scale.y;
                                }
                                else {
                                    target_x -= parent_1.local_space.position.x;
                                    target_y -= parent_1.local_space.position.y;
                                }
                                position.copy(child.local_space.position);
                                var child_parent = pose.bones[child.parent_key];
                                if (child_parent !== parent_1) {
                                    Bone.flatten(child_parent, pose.bones);
                                    Space.transform(child_parent.world_space, position, position);
                                    Space.untransform(parent_1.world_space, position, position);
                                }
                                var child_x = position.x * parent_1.world_space.scale.x;
                                var child_y = position.y * parent_1.world_space.scale.y;
                                var offset = Math.atan2(child_y, child_x);
                                var len1 = Math.sqrt(child_x * child_x + child_y * child_y);
                                var len2 = child.length * child.world_space.scale.x;
                                var cos_denom = 2 * len1 * len2;
                                if (cos_denom < 0.0001) {
                                    child.local_space.rotation.rad = tweenAngle(child.local_space.rotation.rad, Math.atan2(target_y, target_x) - parent_1.local_space.rotation.rad, alpha);
                                    return;
                                }
                                var cos = clamp((target_x * target_x + target_y * target_y - len1 * len1 - len2 * len2) / cos_denom, -1, 1);
                                var rad = Math.acos(cos) * bend_direction;
                                var sin = Math.sin(rad);
                                var adjacent = len2 * cos + len1;
                                var opposite = len2 * sin;
                                var parent_angle = Math.atan2(target_y * adjacent - target_x * opposite, target_x * adjacent + target_y * opposite);
                                parent_1.local_space.rotation.rad = tweenAngle(parent_1.local_space.rotation.rad, (parent_angle - offset), alpha);
                                var child_angle = rad;
                                if (child_parent !== parent_1) {
                                    child_angle += parent_1.world_space.rotation.rad - child_parent.world_space.rotation.rad;
                                }
                                child.local_space.rotation.rad = tweenAngle(child.local_space.rotation.rad, (child_angle + offset), alpha);
                                break;
                        }
                    });
                    pose.iterateBones(function (bone_key, bone) {
                        Bone.flatten(bone, pose.bones);
                    });
                    data.slot_keys.forEach(function (slot_key) {
                        var data_slot = data.slots[slot_key];
                        var pose_slot = pose.slots[slot_key] || (pose.slots[slot_key] = new Slot());
                        pose_slot.copy(data_slot);
                        var anim_slot = anim && anim.slots[slot_key];
                        if (anim_slot) {
                            keyframe_index = Keyframe.find(anim_slot.color_keyframes, time);
                            if (keyframe_index !== -1) {
                                var color_keyframe0 = anim_slot.color_keyframes[keyframe_index];
                                var color_keyframe1 = anim_slot.color_keyframes[keyframe_index + 1];
                                if (color_keyframe1) {
                                    var pct = color_keyframe0.curve.evaluate((time - color_keyframe0.time) / (color_keyframe1.time - color_keyframe0.time));
                                    pose_slot.color.r = tween(color_keyframe0.color.r, color_keyframe1.color.r, pct);
                                    pose_slot.color.g = tween(color_keyframe0.color.g, color_keyframe1.color.g, pct);
                                    pose_slot.color.b = tween(color_keyframe0.color.b, color_keyframe1.color.b, pct);
                                    pose_slot.color.a = tween(color_keyframe0.color.a, color_keyframe1.color.a, pct);
                                }
                                else {
                                    pose_slot.color.r = color_keyframe0.color.r;
                                    pose_slot.color.g = color_keyframe0.color.g;
                                    pose_slot.color.b = color_keyframe0.color.b;
                                    pose_slot.color.a = color_keyframe0.color.a;
                                }
                            }
                            keyframe_index = Keyframe.find(anim_slot.attachment_keyframes, time);
                            if (keyframe_index !== -1) {
                                var attachment_keyframe0 = anim_slot.attachment_keyframes[keyframe_index];
                                pose_slot.attachment_key = attachment_keyframe0.name;
                            }
                        }
                    });
                    pose.slot_keys = data.slot_keys;
                    if (anim) {
                        keyframe_index = Keyframe.find(anim.order_keyframes, time);
                        if (keyframe_index !== -1) {
                            var order_keyframe = anim.order_keyframes[keyframe_index];
                            pose.slot_keys = data.slot_keys.slice(0);
                            order_keyframe.slot_offsets.forEach(function (slot_offset) {
                                var slot_index = pose.slot_keys.indexOf(slot_offset.slot_key);
                                if (slot_index !== -1) {
                                    pose.slot_keys.splice(slot_index, 1);
                                    pose.slot_keys.splice(slot_index + slot_offset.offset, 0, slot_offset.slot_key);
                                }
                            });
                        }
                    }
                    pose.events.length = 0;
                    if (anim && anim.event_keyframes) {
                        var add_event = function (event_keyframe) {
                            var pose_event = new Event();
                            var data_event = data.events[event_keyframe.name];
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
                                anim.event_keyframes.forEach(function (event_keyframe) {
                                    if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time < prev_time)) ||
                                        ((time <= event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
                                        add_event(event_keyframe);
                                    }
                                });
                            }
                            else {
                                anim.event_keyframes.forEach(function (event_keyframe) {
                                    if ((time <= event_keyframe.time) && (event_keyframe.time < prev_time)) {
                                        add_event(event_keyframe);
                                    }
                                });
                            }
                        }
                        else {
                            if (wrapped_max) {
                                anim.event_keyframes.forEach(function (event_keyframe) {
                                    if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time <= time)) ||
                                        ((prev_time < event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
                                        add_event(event_keyframe);
                                    }
                                });
                            }
                            else {
                                anim.event_keyframes.forEach(function (event_keyframe) {
                                    if ((prev_time < event_keyframe.time) && (event_keyframe.time <= time)) {
                                        add_event(event_keyframe);
                                    }
                                });
                            }
                        }
                    }
                };
                Pose.prototype.iterateBones = function (callback) {
                    var pose = this;
                    pose.bone_keys.forEach(function (bone_key) {
                        var bone = pose.bones[bone_key];
                        callback(bone_key, bone);
                    });
                };
                Pose.prototype.iterateAttachments = function (callback) {
                    var pose = this;
                    var data = pose.data;
                    var skin = data && data.skins[pose.skin_key];
                    var default_skin = data && data.skins["default"];
                    pose.slot_keys.forEach(function (slot_key) {
                        var pose_slot = pose.slots[slot_key];
                        var skin_slot = skin && (skin.slots[slot_key] || default_skin.slots[slot_key]);
                        var attachment = skin_slot && skin_slot.attachments[pose_slot.attachment_key];
                        var attachment_key = (attachment && (attachment.path || attachment.name)) || pose_slot.attachment_key;
                        callback(slot_key, pose_slot, skin_slot, attachment_key, attachment);
                    });
                };
                return Pose;
            }());
            exports_1("Pose", Pose);
        }
    }
});
