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
        addFile("examples/tank/", "export/tank-pro.json", "export/tank.atlas", 0.25);
        // addFile("examples/goblins/", "images/pack.json", "images/pack.atlas");
        addFile("examples/goblins/", "export/goblins-pro.json", "export/goblins.atlas");
        addFile("examples/goblins/", "export/goblins-ess.json", "export/goblins.atlas");
        addFile("examples/raptor/", "export/raptor-pro.json", "export/raptor.atlas", 0.5);
        addFile("examples/vine/", "export/vine-pro.json", "export/vine.atlas", 0.5);
        addFile("examples/owl/", "export/owl-pro.json", "export/owl.atlas", 0.5);
        addFile("examples/spinosaurus/", "export/spinosaurus-ess.json", undefined, 0.5);
        addFile("examples/windmill/", "export/windmill-ess.json", "export/windmill.atlas", 0.5);
        addFile("examples/alien/", "export/alien-pro.json", "export/alien.atlas");
        addFile("examples/alien/", "export/alien-ess.json", "export/alien.atlas");
        addFile("examples/coin/", "export/coin-pro.json", "export/coin.atlas", 0.5);
        addFile("examples/speedy/", "export/speedy-ess.json", "export/speedy.atlas");
        addFile("examples/dragon/", "export/dragon-ess.json", "export/dragon.atlas");
        addFile("examples/powerup/", "export/powerup-pro.json", "export/powerup.atlas");
        addFile("examples/powerup/", "export/powerup-ess.json", "export/powerup.atlas");
        // addFile("examples/export/", "atlas-0.5-pma.json", "atlas-0.5-pma.atlas");
        // addFile("examples/export/", "atlas-1.0-pma.json", "atlas-1.0-pma.atlas");
        // addFile("examples/export/", "json.json", "json.atlas");
        // addFile("examples/export/", "atlas-0.5.json", "atlas-0.5.atlas");
        // addFile("examples/export/", "binary.json", "binary.atlas");
        // addFile("examples/export/", "atlas-1.0.json", "atlas-1.0.atlas");
        addFile("examples/hero/", "export/hero-ess.json", "export/hero.atlas");
        addFile("examples/hero/", "export/hero-pro.json", "export/hero.atlas");
        addFile("examples/stretchyman/", "export/stretchyman-pro.json", "export/stretchyman.atlas", 0.5);
        addFile("examples/stretchyman/", "export/stretchyman-stretchy-ik-pro.json", "export/stretchyman.atlas", 0.5);
        addFile("examples/spineboy/", "export/spineboy-pro.json", "export/spineboy.atlas", 0.5);
        addFile("examples/spineboy/", "export/spineboy-ess.json", "export/spineboy.atlas", 0.5);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU1BLFNBQWdCLEtBQUs7UUFDbkIsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNuQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ25DLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN4QyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsOERBQThELENBQUM7UUFFaEcsTUFBTSxRQUFRLEdBQW1CLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0QsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO1FBQ3JDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXBDLE1BQU0sUUFBUSxHQUFtQixRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9ELFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztRQUNyQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7UUFDNUIsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQzdCLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUM5QixRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDcEMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsa0JBQWtCO1FB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