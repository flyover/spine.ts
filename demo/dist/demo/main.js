System.register(["../spine", "./atlas", "./render-ctx2d", "./render-webgl"], function (exports_1, context_1) {
    "use strict";
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
        ///addFile("Mario/", "export/Mario.json", "export/Mario.atlas");
        addFile("Splatoon-FanArt/", "Data/splatoon.json", "Data/splatoon.atlas.txt", 0.5);
        addFile("ExplorerQ/", "ExplorerQ.json");
        addFile("examples/alien/", "export/alien.json", "export/alien.atlas");
        addFile("examples/dragon/", "export/dragon.json", "export/dragon.atlas");
        addFile("examples/goblins/", "export/goblins.json", "export/goblins.atlas");
        addFile("examples/goblins/", "export/goblins-mesh.json", "export/goblins-mesh.atlas");
        addFile("examples/goblins/", "export/goblins-ffd.json", "export/goblins-ffd.atlas");
        addFile("examples/hero/", "export/hero-mesh.json", "export/hero-mesh.atlas");
        addFile("examples/hero/", "export/hero.json", "export/hero.atlas");
        addFile("examples/powerup/", "export/powerup.json", "export/powerup.atlas");
        addFile("examples/raptor/", "export/raptor.json", "export/raptor.atlas", 0.5);
        addFile("examples/speedy/", "export/speedy.json", "export/speedy.atlas");
        addFile("examples/spineboy-old/", "export/spineboy-old.json", "export/spineboy-old.atlas");
        addFile("examples/spineboy/", "export/spineboy.json", "export/spineboy.atlas", 0.5);
        addFile("examples/spineboy/", "export/spineboy-mesh.json", "export/spineboy-mesh.atlas", 0.5);
        addFile("examples/spineboy/", "export/spineboy-hoverboard.json", "export/spineboy-hoverboard.atlas", 0.5);
        addFile("examples/spinosaurus/", "export/spinosaurus.json", "export/spinosaurus.atlas", 0.5);
        ///const esoteric: string = "https://raw.githubusercontent.com/EsotericSoftware/spine-runtimes/master/";
        ///addFile(esoteric + "spine-unity/Assets/Examples/Spine/Spineboy/", "spineboy.json", "spineboy.atlas.txt", 0.5);
        ///addFile(esoteric + "examples/alien/", "export/alien.json", "export/alien.atlas", 0.5);
        ///addFile(esoteric + "examples/dragon/", "export/dragon.json", "export/dragon.atlas", 0.5);
        ///addFile(esoteric + "examples/goblins/", "export/goblins.json", "export/goblins.atlas");
        ///addFile(esoteric + "examples/goblins/", "export/goblins-mesh.json", "export/goblins.atlas");
        ///addFile(esoteric + "examples/hero/", "export/hero.json", "export/hero.atlas");
        ///addFile(esoteric + "examples/hero/", "export/hero-mesh.json", "export/hero.atlas");
        ///addFile(esoteric + "examples/powerup/", "export/powerup.json", "export/powerup.atlas");
        ///addFile(esoteric + "examples/raptor/", "export/raptor.json", "export/raptor.atlas", 0.5);
        ///addFile(esoteric + "examples/speedy/", "export/speedy.json", "export/speedy.atlas");
        ///addFile(esoteric + "examples/spineboy/", "export/spineboy.json", "export/spineboy.atlas", 0.5);
        ///addFile(esoteric + "examples/spineboy/", "export/spineboy-mesh.json", "export/spineboy.atlas", 0.5);
        ///addFile(esoteric + "examples/spineboy/", "export/spineboy-hover.json", "export/spineboy.atlas", 0.5);
        ///addFile(esoteric + "examples/spineboy-old/", "export/spineboy-old.json", "export/spineboy-old.atlas");
        ///addFile(esoteric + "examples/spinosaurus/", "export/spinosaurus.json");
        ///addFile(esoteric + "examples/stretchyman/", "export/stretchyman.json", "export/stretchyman.atlas");
        ///addFile(esoteric + "examples/tank/", "export/tank.json", "export/tank.atlas", 0.5);
        ///addFile(esoteric + "examples/test/", "export/test.json", "export/test.atlas", 0.5);
        ///addFile(esoteric + "examples/vine/", "export/vine.json", "export/vine.atlas", 0.5);
        ///addFile(esoteric + "spine-unity/Assets/Examples/Spine/Dragon/", "dragon.json", "dragon.atlas.txt");
        ///addFile(esoteric + "spine-unity/Assets/Examples/Spine/Eyes/", "eyes.json", "eyes.atlas.txt");
        ///addFile(esoteric + "spine-unity/Assets/Examples/Spine/FootSoldier/", "FootSoldier.json", "FS_White.atlas.txt");
        ///addFile(esoteric + "spine-unity/Assets/Examples/Spine/Gauge/", "Gauge.json", "Gauge.atlas.txt");
        ///addFile(esoteric + "spine-unity/Assets/Examples/Spine/Goblins/", "goblins.json", "goblins.atlas.txt");
        ///addFile(esoteric + "spine-unity/Assets/Examples/Spine/Hero/", "hero-mesh.json", "hero-mesh.atlas.txt");
        ///addFile(esoteric + "spine-unity/Assets/Examples/Spine/Raggedy Spineboy/", "Raggedy Spineboy.json", "Raggedy Spineboy.atlas.txt");
        ///addFile(esoteric + "spine-unity/Assets/Examples/Spine/Raptor/", "raptor.json", "raptor.atlas.txt", 0.5);
        ///addFile(esoteric + "spine-unity/Assets/Examples/Spine/Spineboy/", "spineboy.json", "spineboy.atlas.txt", 0.5);
        ///addFile(esoteric + "spine-unity/Assets/Examples/Spine/Spineunitygirl/", "Doi.json", "Doi.atlas.txt");
        ///addFile(esoteric + "spine-unity/Assets/Examples/Spine/Strechyman/", "stretchyman.json", "stretchyman-diffuse-pma.atlas.txt");
        ///files = [];
        ///addFile("test-ikc/", "export/skeleton.json");
        ///addFile("examples/hero/", "export/hero-mesh.json", "export/hero-mesh.atlas", 1.0, [ "Headturn" ]);
        ///addFile("examples/raptor/", "export/raptor.json", "export/raptor.atlas", 0.5, [ "walk" ]);
        ///addFile("examples/stretchyman/", "export/stretchyman.json", "export/stretchyman.atlas", 0.5);
        ///addFile("examples/tank/", "export/tank.json", "export/tank.atlas", 0.5);
        ///addFile("examples/vine/", "export/vine.json", "export/vine.atlas", 0.5);
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
            //const skin_keys: string[] = spine_data.skins._keys;
            //const skin_key: string = skin_keys[skin_index];
            const skin_key = spine_data.skins.key(skin_index);
            spine_pose.setSkin(skin_key);
            spine_pose_next.setSkin(skin_key);
        }
        function updateAnim() {
            const anim_keys = file.anim_keys || spine_data.anims._keys;
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
                    const anim_keys = file.anim_keys || spine_data.anims._keys;
                    if (++anim_index >= anim_keys.length) {
                        anim_index = 0;
                        const skin_keys = spine_data.skins._keys;
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
                //const skin_keys: string[] = spine_data.skins._keys;
                //const skin_key: string = skin_keys[skin_index];
                const skin_key = spine_data.skins.key(skin_index);
                const anim_keys = file.anim_keys || spine_data.anims._keys;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU1BO1FBQ0UsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNuQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ25DLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN4QyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsOERBQThELENBQUM7UUFFaEcsTUFBTSxRQUFRLEdBQW1CLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0QsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO1FBQ3JDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXBDLE1BQU0sUUFBUSxHQUFtQixRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9ELFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztRQUNyQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7UUFDNUIsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQzdCLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUM5QixRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDcEMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsa0JBQWtCO1FBQ2hELFFBQVEsQ0FB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