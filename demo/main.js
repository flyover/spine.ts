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
                                page.w = page.w || image.width;
                                page.h = page.h || image.height;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFNQTtRQUNFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDbkMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNuQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDeEMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLDhEQUE4RCxDQUFDO1FBRWhHLE1BQU0sUUFBUSxHQUFtQixRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9ELFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztRQUNyQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwQyxNQUFNLFFBQVEsR0FBbUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvRCxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFDckMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQzVCLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUM3QixRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDOUIsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQ3BDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLGtCQUFrQjtRQUNoRCxRQUFRLENBQUMsSUFBSSxD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