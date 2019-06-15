import * as Spine from "../spine";
import * as Atlas from "./atlas";
import { RenderCtx2D } from "./render-ctx2d";
import { RenderWebGL } from "./render-webgl";
import { mat4x4Identity, mat4x4Ortho, mat4x4Translate, mat4x4Scale } from "./render-webgl";

interface File {
  path: string;
  json: string;
  atlas?: string;
  zoom?: number;
}

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

  const spine_data: Spine.Data = new Spine.Data();
  const spine_pose: Spine.Pose = new Spine.Pose(spine_data);
  const spine_pose_next: Spine.Pose = new Spine.Pose(spine_data);
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

  async function loadFile(file: File): Promise<void> {
    render_ctx2d.dropData(spine_data, atlas_data);
    render_webgl.dropData(spine_data, atlas_data);

    spine_pose.free();
    spine_pose_next.free();
    spine_data.free();
    if (atlas_data !== null) {
      atlas_data.free();
      atlas_data = null;
    }

    const images: Spine.Map<string, HTMLImageElement> = new Spine.Map<string, HTMLImageElement>();

    const json_url: string = file.path + "/" + file.json;
    const json_text: string = await loadText(json_url);
    spine_data.load(JSON.parse(json_text));

    if (file.atlas) {
      // load atlas page images
      const atlas_url: string = file.path + "/" + file.atlas;
      const atlas_text: string = await loadText(atlas_url);
      atlas_data = new Atlas.Data().import(atlas_text);
      const dir_path: string = atlas_url.slice(0, atlas_url.lastIndexOf("/"));
      for (const page of atlas_data.pages) {
        const image_key: string = page.name;
        const image_url: string = dir_path + "/" + image_key;
        const image: HTMLImageElement = await loadImage(image_url);
        page.w = page.w || image.width;
        page.h = page.h || image.height;
        images.set(image_key, image);
      }
    } else {
      // load attachment images
      const attachments: Map<string, Spine.Attachment> = new Map();
      spine_data.iterateSkins((skin_key: string, skin: Spine.Skin): void => {
        skin.iterateAttachments((slot_key: string, skin_slot: Spine.SkinSlot, attachment_key: string, attachment: Spine.Attachment): void => {
          attachments.set(attachment_key, attachment);
        });
      });
      for (const [attachment_key, attachment] of attachments) {
        if (!attachment) { return; }
        switch (attachment.type) {
          case "region":
          case "mesh":
          case "weightedmesh":
            const image_key: string = attachment_key;
            const image_url: string = file.path + "/" + spine_data.skeleton.images + image_key + ".png";
            const image: HTMLImageElement = await loadImage(image_url);
            images.set(image_key, image);
            break;
        }
      }
    }

    render_ctx2d.loadData(spine_data, atlas_data, images);
    render_webgl.loadData(spine_data, atlas_data, images);
  }

  const files: File[] = [
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

  let file_index: number = 0;
  let skin_index: number = 0;
  let anim_index: number = 0;

  let loading: boolean = false;

  function updateFile() {
    skin_index = 0;
    updateSkin();
    anim_index = 0;
    updateAnim();
    camera_zoom = file.zoom || 1;
  }

  function updateSkin() {
    const skin_key: string = spine_data.skins.key(skin_index);
    spine_pose.setSkin(skin_key);
    spine_pose_next.setSkin(skin_key);
  }

  function updateAnim() {
    const anim_key: string = spine_data.anims.key(anim_index);
    spine_pose.setAnim(anim_key);
    const anim_key_next: string = spine_data.anims.key((anim_index + 1) % spine_data.anims.size);
    spine_pose_next.setAnim(anim_key_next);
    spine_pose.setTime(anim_time = 0);
    spine_pose_next.setTime(anim_time);
    anim_length = spine_pose.curAnimLength() || 1000;
    anim_length_next = spine_pose_next.curAnimLength() || 1000;
  }

  let file = files[file_index];
  messages.innerHTML = "loading";
  loading = true; loadFile(file).then(() => { loading = false; updateFile(); });

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
              loading = true; loadFile(file).then(() => { loading = false; updateFile(); });
              return;
            }
          }
          updateSkin();
        }
        updateAnim();
      }

      const skin_key: string = spine_data.skins.key(skin_index);
      const anim_key: string = spine_data.anims.key(anim_index);
      const anim_key_next: string = spine_data.anims.key((anim_index + 1) % spine_data.anims.size);
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

function loadText(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const req: XMLHttpRequest = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = "text";
    req.addEventListener("error", (): void => { reject("error"); });
    req.addEventListener("abort", (): void => { reject("abort"); });
    req.addEventListener("load", (): void => {
      if (req.status === 200) {
        resolve(req.response)
      } else {
        reject(req.response);
      }
    });
    req.send();
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image: HTMLImageElement = new Image();
    image.crossOrigin = "Anonymous";
    image.addEventListener("error", (): void => { reject("error"); });
    image.addEventListener("abort", (): void => { reject("abort"); });
    image.addEventListener("load", (): void => { resolve(image); });
    image.src = url;
  });
}
