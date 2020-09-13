System.register(["@spine", "./atlas.js", "./render-ctx2d.js", "./render-webgl.js"], function (exports_1, context_1) {
    "use strict";
    var Spine, Atlas, render_ctx2d_js_1, render_webgl_js_1, render_webgl_js_2;
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
        const render_ctx2d = new render_ctx2d_js_1.RenderCtx2D(ctx);
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
        const render_webgl = new render_webgl_js_1.RenderWebGL(gl);
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
        let spine_data = new Spine.Data();
        let spine_pose = new Spine.Pose(spine_data);
        let spine_pose_next = new Spine.Pose(spine_data);
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
        function loadFile(file, callback) {
            render_ctx2d.dropData(spine_data, atlas_data);
            render_webgl.dropData(spine_data, atlas_data);
            spine_pose.free();
            spine_pose_next.free();
            spine_data.free();
            atlas_data = null;
            const images = new Spine.Map();
            let counter = 0;
            const counter_inc = () => { counter++; };
            const counter_dec = () => {
                if (--counter === 0) {
                    render_ctx2d.loadData(spine_data, atlas_data, images);
                    render_webgl.loadData(spine_data, atlas_data, images);
                    callback();
                }
            };
            const file_path = file.path;
            const file_json_url = file_path + file.json_url;
            const file_atlas_url = (file.atlas_url) ? (file_path + file.atlas_url) : ("");
            counter_inc();
            loadText(file_json_url, (err, json_text) => {
                if (err) {
                    console.log("error loading:", file_json_url);
                }
                if (!err && json_text) {
                    spine_data.load(JSON.parse(json_text));
                }
                counter_inc();
                loadText(file_atlas_url, (err, atlas_text) => {
                    if (!err && atlas_text) {
                        // load atlas page images
                        atlas_data = new Atlas.Data().import(atlas_text);
                        const dir_path = file_atlas_url.slice(0, file_atlas_url.lastIndexOf("/"));
                        atlas_data.pages.forEach((page) => {
                            const image_key = page.name;
                            const image_url = dir_path + "/" + image_key;
                            counter_inc();
                            images.set(image_key, loadImage(image_url, (err, image) => {
                                if (err)
                                    console.log("error loading:", image_url);
                                page.w = page.w || image && image.width || 0;
                                page.h = page.h || image && image.height || 0;
                                counter_dec();
                            }));
                        });
                    }
                    else {
                        // load attachment images
                        spine_data.iterateSkins((skin_key, skin) => {
                            skin.iterateAttachments((slot_key, skin_slot, attachment_key, attachment) => {
                                if (!attachment) {
                                    return;
                                }
                                switch (attachment.type) {
                                    case "region":
                                    case "mesh":
                                    case "weightedmesh":
                                        const image_key = attachment_key;
                                        const image_url = file_path + spine_data.skeleton.images + image_key + ".png";
                                        counter_inc();
                                        images.set(image_key, loadImage(image_url, (err, image) => {
                                            if (err)
                                                console.log("error loading:", image_url);
                                            counter_dec();
                                        }));
                                        break;
                                }
                            });
                        });
                    }
                    counter_dec();
                });
                counter_dec();
            });
        }
        const files = [];
        function addFile(path, json_url, atlas_url = "", camera_zoom = 1, anim_keys) {
            const file = {};
            file.path = path;
            file.json_url = json_url;
            file.atlas_url = atlas_url;
            file.camera_zoom = camera_zoom;
            file.anim_keys = anim_keys;
            files.push(file);
        }
        addFile("Splatoon-FanArt/", "Data/splatoon.json", "Data/splatoon.atlas.txt", 0.5);
        addFile("ExplorerQ/", "ExplorerQ.json");
        addFile("examples/alien/", "export/alien-ess.json", "export/alien.atlas");
        addFile("examples/alien/", "export/alien-pro.json", "export/alien.atlas");
        addFile("examples/coin/", "export/coin-pro.json", "export/coin.atlas");
        addFile("examples/dragon/", "export/dragon-ess.json", "export/dragon.atlas");
        addFile("examples/goblins/", "export/goblins-ess.json", "export/goblins.atlas");
        addFile("examples/goblins/", "export/goblins-pro.json", "export/goblins.atlas");
        addFile("examples/hero/", "export/hero-ess.json", "export/hero.atlas");
        addFile("examples/hero/", "export/hero-pro.json", "export/hero.atlas");
        addFile("examples/owl/", "export/owl-pro.json", "export/owl.atlas");
        addFile("examples/powerup/", "export/powerup-ess.json", "export/powerup.atlas");
        addFile("examples/powerup/", "export/powerup-pro.json", "export/powerup.atlas");
        addFile("examples/raptor/", "export/raptor-pro.json", "export/raptor.atlas");
        addFile("examples/speedy/", "export/speedy-ess.json", "export/speedy.atlas");
        addFile("examples/spineboy/", "export/spineboy-ess.json", "export/spineboy.atlas");
        addFile("examples/spineboy/", "export/spineboy-pro.json", "export/spineboy.atlas");
        addFile("examples/spinosaurus/", "export/spinosaurus-ess.json", "export/spinosaurus.atlas");
        addFile("examples/stretchyman/", "export/stretchyman-pro.json", "export/stretchyman.atlas");
        addFile("examples/stretchyman/", "export/stretchyman-stretchy-ik-pro.json", "export/stretchyman.atlas");
        addFile("examples/tank/", "export/tank-pro.json", "export/tank.atlas");
        addFile("examples/vine/", "export/vine-pro.json", "export/vine.atlas");
        addFile("examples/windmill/", "export/windmill-ess.json", "export/windmill.atlas");
        let file_index = 0;
        let skin_index = 0;
        let anim_index = 0;
        let loading = false;
        function updateFile() {
            skin_index = 0;
            updateSkin();
            anim_index = 0;
            updateAnim();
            camera_zoom = file.camera_zoom || 1;
        }
        function updateSkin() {
            //const skin_keys: string[] = spine_data.skins.keys;
            //const skin_key: string = skin_keys[skin_index];
            const skin_key = spine_data.skins.key(skin_index);
            spine_pose.setSkin(skin_key);
            spine_pose_next.setSkin(skin_key);
        }
        function updateAnim() {
            const anim_keys = file.anim_keys || spine_data.anims.keys;
            const anim_key = anim_keys[anim_index];
            spine_pose.setAnim(anim_key);
            const anim_key_next = anim_keys[(anim_index + 1) % anim_keys.length];
            spine_pose_next.setAnim(anim_key_next);
            spine_pose.setTime(anim_time = 0);
            spine_pose_next.setTime(anim_time);
            anim_length = spine_pose.curAnimLength() || 1000;
            anim_length_next = spine_pose_next.curAnimLength() || 1000;
        }
        let file = files[file_index];
        messages.innerHTML = "loading";
        loading = true;
        loadFile(file, () => {
            loading = false;
            updateFile();
        });
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
                    const anim_keys = file.anim_keys || spine_data.anims.keys;
                    if (++anim_index >= anim_keys.length) {
                        anim_index = 0;
                        const skin_keys = spine_data.skins.keys;
                        if (++skin_index >= skin_keys.length) {
                            skin_index = 0;
                            if (files.length > 1) {
                                if (++file_index >= files.length) {
                                    file_index = 0;
                                }
                                file = files[file_index];
                                messages.innerHTML = "loading";
                                loading = true;
                                loadFile(file, () => {
                                    loading = false;
                                    updateFile();
                                });
                                return;
                            }
                        }
                        updateSkin();
                    }
                    updateAnim();
                }
                //const skin_keys: string[] = spine_data.skins.keys;
                //const skin_key: string = skin_keys[skin_index];
                const skin_key = spine_data.skins.key(skin_index);
                const anim_keys = file.anim_keys || spine_data.anims.keys;
                const anim_key = anim_keys[anim_index];
                const anim_key_next = anim_keys[(anim_index + 1) % anim_keys.length];
                messages.innerHTML = "skin: " + skin_key + ", anim: " + anim_key + ", next anim: " + anim_key_next + "<br>" + file.path + file.json_url;
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
                render_webgl_js_2.mat4x4Identity(projection);
                render_webgl_js_2.mat4x4Ortho(projection, -gl.canvas.width / 2, gl.canvas.width / 2, -gl.canvas.height / 2, gl.canvas.height / 2, -1, 1);
                if (enable_render_ctx2d && enable_render_webgl) {
                    render_webgl_js_2.mat4x4Translate(projection, gl.canvas.width / 4, 0, 0);
                }
                render_webgl_js_2.mat4x4Translate(projection, -camera_x, -camera_y, 0);
                render_webgl_js_2.mat4x4Scale(projection, camera_zoom, camera_zoom, 1);
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
    function loadText(url, callback) {
        const req = new XMLHttpRequest();
        if (url) {
            req.open("GET", url, true);
            req.responseType = "text";
            req.addEventListener("error", () => { callback("error", null); });
            req.addEventListener("abort", () => { callback("abort", null); });
            req.addEventListener("load", () => {
                if (req.status === 200) {
                    callback(null, req.response);
                }
                else {
                    callback(req.response, null);
                }
            });
            req.send();
        }
        else {
            callback("error", null);
        }
        return req;
    }
    function loadImage(url, callback) {
        const image = new Image();
        image.crossOrigin = "Anonymous";
        image.addEventListener("error", () => { callback("error", null); });
        image.addEventListener("abort", () => { callback("abort", null); });
        image.addEventListener("load", () => { callback(null, image); });
        image.src = url;
        return image;
    }
    return {
        setters: [
            function (Spine_1) {
                Spine = Spine_1;
            },
            function (Atlas_1) {
                Atlas = Atlas_1;
            },
            function (render_ctx2d_js_1_1) {
                render_ctx2d_js_1 = render_ctx2d_js_1_1;
            },
            function (render_webgl_js_1_1) {
                render_webgl_js_1 = render_webgl_js_1_1;
                render_webgl_js_2 = render_webgl_js_1_1;
            }
        ],
        execute: function () {
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU1BLFNBQWdCLEtBQUs7UUFDbkIsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNuQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ25DLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN4QyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsOERBQThELENBQUM7UUFFaEcsTUFBTSxRQUFRLEdBQW1CLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0QsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO1FBQ3JDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXBDLE1BQU0sUUFBUSxHQUFtQixRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9ELFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztRQUNyQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7UUFDNUIsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQzdCLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUM5QixRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDcEMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsa0JBQWtCO1FBQ2hE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