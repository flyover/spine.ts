System.register(["../spine", "./atlas", "./render-ctx2d", "./render-webgl"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var Spine, Atlas, render_ctx2d_1, render_webgl_1, render_webgl_2;
    var __moduleName = context_1 && context_1.id;
    function start() {
        document.body.style.margin = "0px";
        document.body.style.border = "0px";
        document.body.style.padding = "0px";
        document.body.style.overflow = "hidden";
        document.body.style.fontFamily = "'PT Sans',Arial,'Helvetica Neue',Helvetica,Tahoma,sans-serif";
        const controls = document.createElement("div");
        controls.style.position = "absolute";
        document.body.appendChild(controls);
        const messages = document.createElement("div");
        messages.style.position = "absolute";
        messages.style.left = "0px";
        messages.style.right = "0px";
        messages.style.bottom = "0px";
        messages.style.textAlign = "center";
        messages.style.zIndex = "-1"; // behind controls
        document.body.appendChild(messages);
        const canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = "absolute";
        canvas.style.width = canvas.width + "px";
        canvas.style.height = canvas.height + "px";
        canvas.style.zIndex = "-1"; // behind controls
        document.body.appendChild(canvas);
        const ctx = (canvas.getContext("2d"));
        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.width = canvas.width + "px";
            canvas.style.height = canvas.height + "px";
        });
        const render_ctx2d = new render_ctx2d_1.RenderCtx2D(ctx);
        const canvas_gl = document.createElement("canvas");
        canvas_gl.width = window.innerWidth;
        canvas_gl.height = window.innerHeight;
        canvas_gl.style.position = "absolute";
        canvas_gl.style.width = canvas_gl.width + "px";
        canvas_gl.style.height = canvas_gl.height + "px";
        canvas_gl.style.zIndex = "-2"; // behind 2D context canvas
        document.body.appendChild(canvas_gl);
        const gl = (canvas_gl.getContext("webgl") || canvas_gl.getContext("experimental-webgl"));
        window.addEventListener("resize", () => {
            canvas_gl.width = window.innerWidth;
            canvas_gl.height = window.innerHeight;
            canvas_gl.style.width = canvas_gl.width + "px";
            canvas_gl.style.height = canvas_gl.height + "px";
        });
        const render_webgl = new render_webgl_1.RenderWebGL(gl);
        let camera_x = 0;
        let camera_y = canvas.height / 3;
        let camera_zoom = 1.0;
        let enable_render_webgl = Boolean(gl);
        let enable_render_ctx2d = Boolean(ctx) && !enable_render_webgl;
        controls.appendChild(makeCheckboxControl("GL", enable_render_webgl, (checked) => { enable_render_webgl = checked; }));
        controls.appendChild(makeCheckboxControl("2D", enable_render_ctx2d, (checked) => { enable_render_ctx2d = checked; }));
        let enable_render_debug_data = false;
        let enable_render_debug_pose = false;
        controls.appendChild(makeCheckboxControl("2D Debug Data", enable_render_debug_data, (checked) => { enable_render_debug_data = checked; }));
        controls.appendChild(makeCheckboxControl("2D Debug Pose", enable_render_debug_pose, (checked) => { enable_render_debug_pose = checked; }));
        const spine_data = new Spine.Data();
        const spine_pose = new Spine.Pose(spine_data);
        const spine_pose_next = new Spine.Pose(spine_data);
        let atlas_data = null;
        let anim_time = 0;
        let anim_length = 0;
        let anim_length_next = 0;
        let anim_rate = 1;
        let anim_repeat = 1;
        let anim_blend = 0.0;
        controls.appendChild(makeRangeControl("Anim Rate", anim_rate, -2.0, 2.0, 0.1, (value) => { anim_rate = parseFloat(value); }));
        controls.appendChild(makeRangeControl("Anim Blend", anim_blend, 0.0, 1.0, 0.01, (value) => { anim_blend = parseFloat(value); }));
        let alpha = 1.0;
        controls.appendChild(makeRangeControl("Alpha", alpha, 0.0, 1.0, 0.01, (value) => { alpha = parseFloat(value); }));
        function loadFile(file) {
            return __awaiter(this, void 0, void 0, function* () {
                render_ctx2d.dropData(spine_data, atlas_data);
                render_webgl.dropData(spine_data, atlas_data);
                spine_pose.free();
                spine_pose_next.free();
                spine_data.free();
                if (atlas_data !== null) {
                    atlas_data.free();
                    atlas_data = null;
                }
                const images = new Spine.Map();
                const json_url = file.path + "/" + file.json;
                const json_text = yield loadText(json_url);
                spine_data.load(JSON.parse(json_text));
                if (file.atlas) {
                    // load atlas page images
                    const atlas_url = file.path + "/" + file.atlas;
                    const atlas_text = yield loadText(atlas_url);
                    atlas_data = new Atlas.Data().import(atlas_text);
                    const dir_path = atlas_url.slice(0, atlas_url.lastIndexOf("/"));
                    for (const page of atlas_data.pages) {
                        const image_key = page.name;
                        const image_url = dir_path + "/" + image_key;
                        const image = yield loadImage(image_url);
                        page.w = page.w || image.width;
                        page.h = page.h || image.height;
                        images.set(image_key, image);
                    }
                }
                else {
                    // load attachment images
                    const attachments = new Map();
                    spine_data.iterateSkins((skin_key, skin) => {
                        skin.iterateAttachments((slot_key, skin_slot, attachment_key, attachment) => {
                            attachments.set(attachment_key, attachment);
                        });
                    });
                    for (const [attachment_key, attachment] of attachments) {
                        if (!attachment) {
                            return;
                        }
                        switch (attachment.type) {
                            case "region":
                            case "mesh":
                            case "weightedmesh":
                                const image_key = attachment_key;
                                const image_url = file.path + "/" + spine_data.skeleton.images + image_key + ".png";
                                const image = yield loadImage(image_url);
                                images.set(image_key, image);
                                break;
                        }
                    }
                }
                render_ctx2d.loadData(spine_data, atlas_data, images);
                render_webgl.loadData(spine_data, atlas_data, images);
            });
        }
        const files = [
            { path: "Splatoon-FanArt", json: "Data/splatoon.json", atlas: "Data/splatoon.atlas.txt", zoom: 0.5 },
            { path: "ExplorerQ", json: "ExplorerQ.json" },
            { path: "examples/tank", json: "export/tank-pro.json", atlas: "export/tank.atlas", zoom: 0.25 },
            { path: "examples/goblins", json: "export/goblins-pro.json", atlas: "export/goblins.atlas" },
            { path: "examples/goblins", json: "export/goblins-ess.json", atlas: "export/goblins.atlas" },
            { path: "examples/raptor", json: "export/raptor-pro.json", atlas: "export/raptor.atlas", zoom: 0.5 },
            { path: "examples/vine", json: "export/vine-pro.json", atlas: "export/vine.atlas", zoom: 0.5 },
            { path: "examples/owl", json: "export/owl-pro.json", atlas: "export/owl.atlas", zoom: 0.5 },
            { path: "examples/spinosaurus", json: "export/spinosaurus-ess.json", atlas: undefined, zoom: 0.5 },
            { path: "examples/windmill", json: "export/windmill-ess.json", atlas: "export/windmill.atlas", zoom: 0.5 },
            { path: "examples/alien", json: "export/alien-pro.json", atlas: "export/alien.atlas" },
            { path: "examples/alien", json: "export/alien-ess.json", atlas: "export/alien.atlas" },
            { path: "examples/coin", json: "export/coin-pro.json", atlas: "export/coin.atlas", zoom: 0.5 },
            { path: "examples/speedy", json: "export/speedy-ess.json", atlas: "export/speedy.atlas" },
            { path: "examples/dragon", json: "export/dragon-ess.json", atlas: "export/dragon.atlas" },
            { path: "examples/powerup", json: "export/powerup-pro.json", atlas: "export/powerup.atlas" },
            { path: "examples/powerup", json: "export/powerup-ess.json", atlas: "export/powerup.atlas" },
            { path: "examples/hero", json: "export/hero-ess.json", atlas: "export/hero.atlas" },
            { path: "examples/hero", json: "export/hero-pro.json", atlas: "export/hero.atlas" },
            { path: "examples/stretchyman", json: "export/stretchyman-pro.json", atlas: "export/stretchyman.atlas", zoom: 0.5 },
            { path: "examples/stretchyman", json: "export/stretchyman-stretchy-ik-pro.json", atlas: "export/stretchyman.atlas", zoom: 0.5 },
            { path: "examples/spineboy", json: "export/spineboy-pro.json", atlas: "export/spineboy.atlas", zoom: 0.5 },
            { path: "examples/spineboy", json: "export/spineboy-ess.json", atlas: "export/spineboy.atlas", zoom: 0.5 },
        ];
        let file_index = 0;
        let skin_index = 0;
        let anim_index = 0;
        let loading = false;
        function updateFile() {
            skin_index = 0;
            updateSkin();
            anim_index = 0;
            updateAnim();
            camera_zoom = file.zoom || 1;
        }
        function updateSkin() {
            const skin_key = spine_data.skins.key(skin_index);
            spine_pose.setSkin(skin_key);
            spine_pose_next.setSkin(skin_key);
        }
        function updateAnim() {
            const anim_key = spine_data.anims.key(anim_index);
            spine_pose.setAnim(anim_key);
            const anim_key_next = spine_data.anims.key((anim_index + 1) % spine_data.anims.size);
            spine_pose_next.setAnim(anim_key_next);
            spine_pose.setTime(anim_time = 0);
            spine_pose_next.setTime(anim_time);
            anim_length = spine_pose.curAnimLength() || 1000;
            anim_length_next = spine_pose_next.curAnimLength() || 1000;
        }
        let file = files[file_index];
        messages.innerHTML = "loading";
        loading = true;
        loadFile(file).then(() => { loading = false; updateFile(); });
        let prev_time = 0;
        function loop(time) {
            requestAnimationFrame(loop);
            const dt = time - (prev_time || time);
            prev_time = time; // ms
            if (!loading) {
                spine_pose.update(dt * anim_rate);
                const anim_rate_next = anim_rate * anim_length_next / anim_length;
                spine_pose_next.update(dt * anim_rate_next);
                anim_time += dt * anim_rate;
                if (anim_time >= (anim_length * anim_repeat)) {
                    if (++anim_index >= spine_data.anims.size) {
                        anim_index = 0;
                        if (++skin_index >= spine_data.skins.size) {
                            skin_index = 0;
                            if (files.length > 1) {
                                if (++file_index >= files.length) {
                                    file_index = 0;
                                }
                                file = files[file_index];
                                messages.innerHTML = "loading";
                                loading = true;
                                loadFile(file).then(() => { loading = false; updateFile(); });
                                return;
                            }
                        }
                        updateSkin();
                    }
                    updateAnim();
                }
                const skin_key = spine_data.skins.key(skin_index);
                const anim_key = spine_data.anims.key(anim_index);
                const anim_key_next = spine_data.anims.key((anim_index + 1) % spine_data.anims.size);
                messages.innerHTML = "skin: " + skin_key + ", anim: " + anim_key + ", next anim: " + anim_key_next + "<br>" + file.path + "/" + file.json;
            }
            if (ctx) {
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            }
            if (gl) {
                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
            if (loading) {
                return;
            }
            spine_pose.strike();
            spine_pose.events.forEach((event, event_key) => {
                ///console.log("event", event_key, event.int_value, event.float_value, event.string_value);
            });
            if (anim_blend > 0) {
                spine_pose_next.strike();
                // blend next pose bone into pose bone
                spine_pose.iterateBones((bone_key, bone) => {
                    const bone_next = spine_pose_next.bones.get(bone_key);
                    if (!bone_next) {
                        return;
                    }
                    Spine.Space.tween(bone.local_space, bone_next.local_space, anim_blend, bone.local_space);
                });
                // compute bone world space
                spine_pose.iterateBones((bone_key, bone) => {
                    Spine.Bone.flatten(bone, spine_pose.bones);
                });
            }
            if (ctx) {
                ctx.globalAlpha = alpha;
                // origin at center, x right, y up
                ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
                ctx.scale(1, -1);
                if (enable_render_ctx2d && enable_render_webgl) {
                    ctx.translate(-ctx.canvas.width / 4, 0);
                }
                ctx.translate(-camera_x, -camera_y);
                ctx.scale(camera_zoom, camera_zoom);
                ctx.lineWidth = 1 / camera_zoom;
                if (enable_render_ctx2d) {
                    render_ctx2d.drawPose(spine_pose, atlas_data);
                }
                if (enable_render_debug_data) {
                    render_ctx2d.drawDebugData(spine_pose, atlas_data);
                }
                if (enable_render_debug_pose) {
                    render_ctx2d.drawDebugPose(spine_pose, atlas_data);
                }
            }
            if (gl) {
                const color = render_webgl.color;
                color[3] = alpha;
                const projection = render_webgl.projection;
                render_webgl_2.mat4x4Identity(projection);
                render_webgl_2.mat4x4Ortho(projection, -gl.canvas.width / 2, gl.canvas.width / 2, -gl.canvas.height / 2, gl.canvas.height / 2, -1, 1);
                if (enable_render_ctx2d && enable_render_webgl) {
                    render_webgl_2.mat4x4Translate(projection, gl.canvas.width / 4, 0, 0);
                }
                render_webgl_2.mat4x4Translate(projection, -camera_x, -camera_y, 0);
                render_webgl_2.mat4x4Scale(projection, camera_zoom, camera_zoom, 1);
                if (enable_render_webgl) {
                    render_webgl.drawPose(spine_pose, atlas_data);
                }
            }
        }
        requestAnimationFrame(loop);
    }
    exports_1("start", start);
    function makeCheckboxControl(text, checked, callback) {
        const control = document.createElement("div");
        const input = document.createElement("input");
        const label = document.createElement("label");
        input.type = "checkbox";
        input.checked = checked;
        input.addEventListener("click", () => { callback(input.checked); });
        control.appendChild(input);
        label.innerHTML = text;
        control.appendChild(label);
        return control;
    }
    function makeRangeControl(text, init, min, max, step, callback) {
        const control = document.createElement("div");
        const input = document.createElement("input");
        const label = document.createElement("label");
        input.type = "range";
        input.value = init.toString();
        input.min = min.toString();
        input.max = max.toString();
        input.step = step.toString();
        input.addEventListener("input", () => { callback(input.value); label.innerHTML = text + " : " + input.value; });
        control.appendChild(input);
        label.innerHTML = text + " : " + init;
        control.appendChild(label);
        return control;
    }
    function loadText(url) {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open("GET", url, true);
            req.responseType = "text";
            req.addEventListener("error", () => { reject("error"); });
            req.addEventListener("abort", () => { reject("abort"); });
            req.addEventListener("load", () => {
                if (req.status === 200) {
                    resolve(req.response);
                }
                else {
                    reject(req.response);
                }
            });
            req.send();
        });
    }
    function loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = "Anonymous";
            image.addEventListener("error", () => { reject("error"); });
            image.addEventListener("abort", () => { reject("abort"); });
            image.addEventListener("load", () => { resolve(image); });
            image.src = url;
        });
    }
    return {
        setters: [
            function (Spine_1) {
                Spine = Spine_1;
            },
            function (Atlas_1) {
                Atlas = Atlas_1;
            },
            function (render_ctx2d_1_1) {
                render_ctx2d_1 = render_ctx2d_1_1;
            },
            function (render_webgl_1_1) {
                render_webgl_1 = render_webgl_1_1;
                render_webgl_2 = render_webgl_1_1;
            }
        ],
        execute: function () {
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBYUEsU0FBZ0IsS0FBSztRQUNuQixRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ25DLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDbkMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNwQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyw4REFBOEQsQ0FBQztRQUVoRyxNQUFNLFFBQVEsR0FBbUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvRCxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFDckMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFcEMsTUFBTSxRQUFRLEdBQW1CLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0QsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO1FBQ3JDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUM1QixRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDN0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQzlCLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUNwQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxr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