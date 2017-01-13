System.register(["../spine", "./atlas", "./render-ctx2d", "./render-webgl"], function (exports_1, context_1) {
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
        messages.style.zIndex = "-1";
        document.body.appendChild(messages);
        const canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = "absolute";
        canvas.style.width = canvas.width + "px";
        canvas.style.height = canvas.height + "px";
        canvas.style.zIndex = "-1";
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
        canvas_gl.style.zIndex = "-2";
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
            atlas_data = null;
            const images = {};
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
                        atlas_data = new Atlas.Data().import(atlas_text);
                        const dir_path = file_atlas_url.slice(0, file_atlas_url.lastIndexOf("/"));
                        atlas_data.pages.forEach((page) => {
                            const image_key = page.name;
                            const image_url = dir_path + "/" + image_key;
                            counter_inc();
                            images[image_key] = loadImage(image_url, (err, image) => {
                                if (err)
                                    console.log("error loading:", image_url);
                                page.w = page.w || image.width;
                                page.h = page.h || image.height;
                                counter_dec();
                            });
                        });
                    }
                    else {
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
                                        images[image_key] = loadImage(image_url, (err, image) => {
                                            if (err)
                                                console.log("error loading:", image_url);
                                            counter_dec();
                                        });
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
        addFile("Splatoon-FanArt/", "Data/splatoon.json", "Data/splatoon.Atlas.txt", 0.5);
        addFile("ExplorerQ/", "ExplorerQ.json");
        addFile("examples/alien/", "export/alien.json", "export/alien.atlas");
        addFile("examples/dragon/", "export/dragon.json", "export/dragon.atlas");
        addFile("examples/goblins/", "export/goblins.json", "export/goblins.atlas", 2);
        addFile("examples/goblins/", "export/goblins-mesh.json", "export/goblins-mesh.atlas", 2);
        addFile("examples/goblins/", "export/goblins-ffd.json", "export/goblins-ffd.atlas", 2);
        addFile("examples/hero/", "export/hero-mesh.json", "export/hero-mesh.atlas", 2);
        addFile("examples/hero/", "export/hero.json", "export/hero.atlas", 2);
        addFile("examples/powerup/", "export/powerup.json", "export/powerup.atlas");
        addFile("examples/raptor/", "export/raptor.json", "export/raptor.atlas", 0.5, ["walk"]);
        addFile("examples/speedy/", "export/speedy.json", "export/speedy.atlas");
        addFile("examples/spineboy-old/", "export/spineboy-old.json", "export/spineboy-old.atlas");
        addFile("examples/spineboy/", "export/spineboy.json", "export/spineboy.atlas");
        addFile("examples/spineboy/", "export/spineboy-mesh.json", "export/spineboy-mesh.atlas");
        addFile("examples/spineboy/", "export/spineboy-hoverboard.json", "export/spineboy-hoverboard.atlas");
        addFile("examples/spinosaurus/", "export/spinosaurus.json", "export/spinosaurus.atlas", 0.5);
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
            const skin_keys = spine_data.skin_keys;
            const skin_key = skin_keys[skin_index];
            spine_pose.setSkin(skin_key);
            spine_pose_next.setSkin(skin_key);
        }
        function updateAnim() {
            const anim_keys = file.anim_keys || spine_data.anim_keys;
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
            prev_time = time;
            if (!loading) {
                spine_pose.update(dt * anim_rate);
                const anim_rate_next = anim_rate * anim_length_next / anim_length;
                spine_pose_next.update(dt * anim_rate_next);
                anim_time += dt * anim_rate;
                if (anim_time >= (anim_length * anim_repeat)) {
                    const anim_keys = file.anim_keys || spine_data.anim_keys;
                    if (++anim_index >= anim_keys.length) {
                        anim_index = 0;
                        const skin_keys = spine_data.skin_keys;
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
                const skin_keys = spine_data.skin_keys;
                const skin_key = skin_keys[skin_index];
                const anim_keys = file.anim_keys || spine_data.anim_keys;
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
            if (anim_blend > 0) {
                spine_pose_next.strike();
                spine_pose.iterateBones((bone_key, bone) => {
                    const bone_next = spine_pose_next.bones[bone_key];
                    if (!bone_next) {
                        return;
                    }
                    Spine.Space.tween(bone.local_space, bone_next.local_space, anim_blend, bone.local_space);
                });
                spine_pose.iterateBones((bone_key, bone) => {
                    Spine.Bone.flatten(bone, spine_pose.bones);
                });
            }
            if (ctx) {
                ctx.globalAlpha = alpha;
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
    var Spine, Atlas, render_ctx2d_1, render_webgl_1, render_webgl_2;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFNQTtRQUNFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDbkMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNuQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDeEMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLDhEQUE4RCxDQUFDO1FBRWhHLE1BQU0sUUFBUSxHQUFtQixRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9ELFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztRQUNyQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwQyxNQUFNLFFBQVEsR0FBbUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvRCxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFDckMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQzVCLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUM3QixRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDOUIsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQ3BDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FB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