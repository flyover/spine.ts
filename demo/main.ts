import * as Spine from "../spine";
import * as Atlas from "./atlas";
import { RenderCtx2D } from "./render-ctx2d";
import { RenderWebGL } from "./render-webgl";
import { mat4x4Identity, mat4x4Ortho, mat4x4Translate, mat4x4Scale } from "./render-webgl";

export function start(): void {
  document.body.style.margin = "0px";
  document.body.style.border = "0px";
  document.body.style.padding = "0px";
  document.body.style.overflow = "hidden";
  document.body.style.fontFamily = "'PT Sans',Arial,'Helvetica Neue',Helvetica,Tahoma,sans-serif";

  const controls: HTMLDivElement = document.createElement("div");
  controls.style.position = "absolute";
  document.body.appendChild(controls);

  const messages: HTMLDivElement = document.createElement("div");
  messages.style.position = "absolute";
  messages.style.left = "0px";
  messages.style.right = "0px";
  messages.style.bottom = "0px";
  messages.style.textAlign = "center";
  messages.style.zIndex = "-1"; // behind controls
  document.body.appendChild(messages);

  const canvas: HTMLCanvasElement = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "absolute";
  canvas.style.width = canvas.width + "px";
  canvas.style.height = canvas.height + "px";
  canvas.style.zIndex = "-1"; // behind controls

  document.body.appendChild(canvas);

  const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>(canvas.getContext("2d"));

  window.addEventListener("resize", (): void => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";
  });

  const render_ctx2d: RenderCtx2D = new RenderCtx2D(ctx);

  const canvas_gl: HTMLCanvasElement = document.createElement("canvas");
  canvas_gl.width = window.innerWidth;
  canvas_gl.height = window.innerHeight;
  canvas_gl.style.position = "absolute";
  canvas_gl.style.width = canvas_gl.width + "px";
  canvas_gl.style.height = canvas_gl.height + "px";
  canvas_gl.style.zIndex = "-2"; // behind 2D context canvas

  document.body.appendChild(canvas_gl);

  const gl: WebGLRenderingContext = <WebGLRenderingContext>(canvas_gl.getContext("webgl") || canvas_gl.getContext("experimental-webgl"));

  window.addEventListener("resize", (): void => {
    canvas_gl.width = window.innerWidth;
    canvas_gl.height = window.innerHeight;
    canvas_gl.style.width = canvas_gl.width + "px";
    canvas_gl.style.height = canvas_gl.height + "px";
  });

  const render_webgl: RenderWebGL = new RenderWebGL(gl);

  let camera_x: number = 0;
  let camera_y: number = canvas.height / 3;
  let camera_zoom: number = 1.0;

  let enable_render_webgl: boolean = Boolean(gl);
  let enable_render_ctx2d: boolean = Boolean(ctx) && !enable_render_webgl;

  controls.appendChild(makeCheckboxControl("GL", enable_render_webgl, (checked: boolean): void => { enable_render_webgl = checked; }));
  controls.appendChild(makeCheckboxControl("2D", enable_render_ctx2d, (checked: boolean): void => { enable_render_ctx2d = checked; }));

  let enable_render_debug_data: boolean = false;
  let enable_render_debug_pose: boolean = false;

  controls.appendChild(makeCheckboxControl("2D Debug Data", enable_render_debug_data, (checked: boolean): void => { enable_render_debug_data = checked; }));
  controls.appendChild(makeCheckboxControl("2D Debug Pose", enable_render_debug_pose, (checked: boolean): void => { enable_render_debug_pose = checked; }));

  let spine_data: Spine.Data = new Spine.Data();
  let spine_pose: Spine.Pose = new Spine.Pose(spine_data);
  let spine_pose_next: Spine.Pose = new Spine.Pose(spine_data);
  let atlas_data: Atlas.Data | null = null;

  let anim_time: number = 0;
  let anim_length: number = 0;
  let anim_length_next: number = 0;
  let anim_rate: number = 1;
  let anim_repeat: number = 1;
  let anim_blend: number = 0.0;

  controls.appendChild(makeRangeControl("Anim Rate", anim_rate, -2.0, 2.0, 0.1, (value: string): void => { anim_rate = parseFloat(value); }));
  controls.appendChild(makeRangeControl("Anim Blend", anim_blend, 0.0, 1.0, 0.01, (value: string): void => { anim_blend = parseFloat(value); }));

  let alpha: number = 1.0;

  controls.appendChild(makeRangeControl("Alpha", alpha, 0.0, 1.0, 0.01, (value: string): void => { alpha = parseFloat(value); }));

  function loadFile(file: any, callback: () => void): void {
    render_ctx2d.dropData(spine_data, atlas_data);
    render_webgl.dropData(spine_data, atlas_data);
    spine_pose.drop();
    spine_pose_next.drop();
    spine_data.drop();
    atlas_data = null;

    const images: Spine.Map<string, HTMLImageElement> = new Spine.Map<string, HTMLImageElement>();

    let counter: number = 0;
    const counter_inc = (): void => { counter++; };
    const counter_dec = (): void => {
      if (--counter === 0) {
        render_ctx2d.loadData(spine_data, atlas_data, images);
        render_webgl.loadData(spine_data, atlas_data, images);
        callback();
      }
    };

    const file_path: string = file.path;
    const file_json_url: string = file_path + file.json_url;
    const file_atlas_url: string = (file.atlas_url) ? (file_path + file.atlas_url) : ("");

    counter_inc();
    loadText(file_json_url, (err: string, json_text: string): void => {
      if (err) { console.log("error loading:", file_json_url); }
      if (!err && json_text) {
        spine_data.load(JSON.parse(json_text));
      }
      counter_inc();
      loadText(file_atlas_url, (err: string, atlas_text: string): void => {
        if (!err && atlas_text) {
          // load atlas page images
          atlas_data = new Atlas.Data().import(atlas_text);
          const dir_path: string = file_atlas_url.slice(0, file_atlas_url.lastIndexOf("/"));
          atlas_data.pages.forEach((page: Atlas.Page): void => {
            const image_key: string = page.name;
            const image_url: string = dir_path + "/" + image_key;
            counter_inc();
            images.set(image_key, loadImage(image_url, (err: string, image: HTMLImageElement): void => {
              if (err) console.log("error loading:", image_url);
              page.w = page.w || image.width;
              page.h = page.h || image.height;
              counter_dec();
            }));
          });
        } else {
          // load attachment images
          spine_data.iterateSkins((skin_key: string, skin: Spine.Skin): void => {
            skin.iterateAttachments((slot_key: string, skin_slot: Spine.SkinSlot, attachment_key: string, attachment: Spine.Attachment): void => {
              if (!attachment) { return; }
              switch (attachment.type) {
                case "region":
                case "mesh":
                case "weightedmesh":
                  const image_key: string = attachment_key;
                  const image_url: string = file_path + spine_data.skeleton.images + image_key + ".png";
                  counter_inc();
                  images.set(image_key, loadImage(image_url, (err: string, image: HTMLImageElement): void => {
                    if (err) console.log("error loading:", image_url);
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

  const files: any[] = [];

  function addFile(path: string, json_url: string, atlas_url: string = "", camera_zoom: number = 1, anim_keys?: string[]): void {
    const file: any = {};
    file.path = path;
    file.json_url = json_url;
    file.atlas_url = atlas_url;
    file.camera_zoom = camera_zoom;
    file.anim_keys = anim_keys;
    files.push(file);
  }

  ///addFile("Mario/", "export/Mario.json", "export/Mario.atlas");

  addFile("Splatoon-FanArt/", "Data/splatoon.json", "Data/splatoon.Atlas.txt", 0.5);
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

  let file_index: number = 0;
  let skin_index: number = 0;
  let anim_index: number = 0;

  let loading: boolean = false;

  function updateFile() {
    skin_index = 0;
    updateSkin();
    anim_index = 0;
    updateAnim();
    camera_zoom = file.camera_zoom || 1;
  }

  function updateSkin() {
    const skin_keys: string[] = spine_data.skins.keys;
    const skin_key: string = skin_keys[skin_index];
    spine_pose.setSkin(skin_key);
    spine_pose_next.setSkin(skin_key);
  }

  function updateAnim() {
    const anim_keys: string[] = file.anim_keys || spine_data.anims.keys;
    const anim_key: string = anim_keys[anim_index];
    spine_pose.setAnim(anim_key);
    const anim_key_next: string = anim_keys[(anim_index + 1) % anim_keys.length];
    spine_pose_next.setAnim(anim_key_next);
    spine_pose.setTime(anim_time = 0);
    spine_pose_next.setTime(anim_time);
    anim_length = spine_pose.curAnimLength() || 1000;
    anim_length_next = spine_pose_next.curAnimLength() || 1000;
  }

  let file: any = files[file_index];
  messages.innerHTML = "loading";
  loading = true;
  loadFile(file, (): void => {
    loading = false;
    updateFile();
  });

  let prev_time: number = 0;

  function loop(time: number): void {
    requestAnimationFrame(loop);

    const dt: number = time - (prev_time || time); prev_time = time; // ms

    if (!loading) {
      spine_pose.update(dt * anim_rate);
      const anim_rate_next: number = anim_rate * anim_length_next / anim_length;
      spine_pose_next.update(dt * anim_rate_next);

      anim_time += dt * anim_rate;

      if (anim_time >= (anim_length * anim_repeat)) {
        const anim_keys: string[] = file.anim_keys || spine_data.anims.keys;
        if (++anim_index >= anim_keys.length) {
          anim_index = 0;
          const skin_keys: string[] = spine_data.skins.keys;
          if (++skin_index >= skin_keys.length) {
            skin_index = 0;
            if (files.length > 1) {
              if (++file_index >= files.length) {
                file_index = 0;
              }
              file = files[file_index];
              messages.innerHTML = "loading";
              loading = true;
              loadFile(file, (): void => {
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

      const skin_keys: string[] = spine_data.skins.keys;
      const skin_key: string = skin_keys[skin_index];
      const anim_keys: string[] = file.anim_keys || spine_data.anims.keys;
      const anim_key: string = anim_keys[anim_index];
      const anim_key_next: string = anim_keys[(anim_index + 1) % anim_keys.length];
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

    if (loading) { return; }

    spine_pose.strike();

    spine_pose.events.forEach((event: Spine.Event, event_key: string): void => {
      ///console.log("event", event_key, event.int_value, event.float_value, event.string_value);
    });

    if (anim_blend > 0) {
      spine_pose_next.strike();

      // blend next pose bone into pose bone
      spine_pose.iterateBones((bone_key: string, bone: Spine.Bone): void => {
        const bone_next: Spine.Bone | undefined = spine_pose_next.bones.get(bone_key);
        if (!bone_next) { return; }
        Spine.Space.tween(bone.local_space, bone_next.local_space, anim_blend, bone.local_space);
      });

      // compute bone world space
      spine_pose.iterateBones((bone_key: string, bone: Spine.Bone): void => {
        Spine.Bone.flatten(bone, spine_pose.bones);
      });
    }

    if (ctx) {
      ctx.globalAlpha = alpha;

      // origin at center, x right, y up
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2); ctx.scale(1, -1);

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
      const color: Float32Array = render_webgl.color;
      color[3] = alpha;

      const projection: Float32Array = render_webgl.projection;
      mat4x4Identity(projection);
      mat4x4Ortho(projection, -gl.canvas.width / 2, gl.canvas.width / 2, -gl.canvas.height / 2, gl.canvas.height / 2, -1, 1);

      if (enable_render_ctx2d && enable_render_webgl) {
        mat4x4Translate(projection, gl.canvas.width / 4, 0, 0);
      }

      mat4x4Translate(projection, -camera_x, -camera_y, 0);
      mat4x4Scale(projection, camera_zoom, camera_zoom, 1);

      if (enable_render_webgl) {
        render_webgl.drawPose(spine_pose, atlas_data);
      }
    }
  }

  requestAnimationFrame(loop);
}

function makeCheckboxControl(text: string, checked: boolean, callback: (value: boolean) => void): HTMLDivElement {
  const control: HTMLDivElement = document.createElement("div");
  const input: HTMLInputElement = document.createElement("input");
  const label: HTMLLabelElement = document.createElement("label");
  input.type = "checkbox";
  input.checked = checked;
  input.addEventListener("click", (): void => { callback(input.checked); });
  control.appendChild(input);
  label.innerHTML = text;
  control.appendChild(label);
  return control;
}

function makeRangeControl(text: string, init: number, min: number, max: number, step: number, callback: (value: string) => void): HTMLDivElement {
  const control: HTMLDivElement = document.createElement("div");
  const input: HTMLInputElement = document.createElement("input");
  const label: HTMLLabelElement = document.createElement("label");
  input.type = "range";
  input.value = init.toString();
  input.min = min.toString();
  input.max = max.toString();
  input.step = step.toString();
  input.addEventListener("input", (): void => { callback(input.value); label.innerHTML = text + " : " + input.value; });
  control.appendChild(input);
  label.innerHTML = text + " : " + init;
  control.appendChild(label);
  return control;
}

function loadText(url: string, callback: (error: string | null, text: string | null) => void): XMLHttpRequest {
  const req: XMLHttpRequest = new XMLHttpRequest();
  if (url) {
    req.open("GET", url, true);
    req.responseType = "text";
    req.addEventListener("error", (): void => { callback("error", null); });
    req.addEventListener("abort", (): void => { callback("abort", null); });
    req.addEventListener("load", (): void => {
      if (req.status === 200) {
        callback(null, req.response);
      } else {
        callback(req.response, null);
      }
    });
    req.send();
  } else {
    callback("error", null);
  }
  return req;
}

function loadImage(url: string, callback: (error: string | null, image: HTMLImageElement | null) => void): HTMLImageElement {
  const image: HTMLImageElement = new Image();
  image.crossOrigin = "Anonymous";
  image.addEventListener("error", (): void => { callback("error", null); });
  image.addEventListener("abort", (): void => { callback("abort", null); });
  image.addEventListener("load", (): void => { callback(null, image); });
  image.src = url;
  return image;
}
