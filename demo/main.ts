/// <reference path="../../node_modules/typescript/lib/lib.d.ts"/>

import * as spine from '../spine.ts';
import * as atlas from './atlas.ts';
import { RenderCtx2D } from './render-ctx2d.ts';
import { RenderWebGL } from './render-webgl.ts';
import { mat4x4Identity, mat4x4Ortho, mat4x4Translate, mat4x4Scale } from './render-webgl.ts';

export function start(): void {
  document.body.style.margin = '0px';
  document.body.style.border = '0px';
  document.body.style.padding = '0px';
  document.body.style.overflow = 'hidden';
  document.body.style.fontFamily = '"PT Sans",Arial,"Helvetica Neue",Helvetica,Tahoma,sans-serif';

  const controls: HTMLDivElement = document.createElement('div');
  controls.style.position = 'absolute';
  document.body.appendChild(controls);

  const add_checkbox_control = function(text: string, checked: boolean, callback: (value: boolean) => void): void {
    const control: HTMLDivElement = document.createElement('div');
    const input: HTMLInputElement = document.createElement('input');
    const label: HTMLLabelElement = document.createElement('label');
    input.type = 'checkbox';
    input.checked = checked;
    input.addEventListener('click', function(): void { callback(this.checked); });
    control.appendChild(input);
    label.innerHTML = text;
    control.appendChild(label);
    controls.appendChild(control);
  };

  const add_range_control = function(text: string, init: number, min: number, max: number, step: number, callback: (value: number) => void): void {
    const control: HTMLDivElement = document.createElement('div');
    const input: HTMLInputElement = document.createElement('input');
    const label: HTMLLabelElement = document.createElement('label');
    input.type = 'range';
    input.value = init.toString();
    input.min = min.toString();
    input.max = max.toString();
    input.step = step.toString();
    input.addEventListener('input', function(): void { callback(this.value); label.innerHTML = text + " : " + this.value; });
    control.appendChild(input);
    label.innerHTML = text + " : " + init;
    control.appendChild(label);
    controls.appendChild(control);
  };

  const messages: HTMLDivElement = document.createElement('div');
  messages.style.position = 'absolute';
  messages.style.left = '0px';
  messages.style.right = '0px';
  messages.style.bottom = '0px';
  messages.style.textAlign = 'center';
  messages.style.zIndex = '-1'; // behind controls
  document.body.appendChild(messages);

  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'absolute';
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
  canvas.style.zIndex = '-1'; // behind controls

  document.body.appendChild(canvas);

  const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>(canvas.getContext('2d'));

  window.addEventListener('resize', function(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
  });

  const render_ctx2d: RenderCtx2D = new RenderCtx2D(ctx);

  const canvas_gl: HTMLCanvasElement = document.createElement('canvas');
  canvas_gl.width = window.innerWidth;
  canvas_gl.height = window.innerHeight;
  canvas_gl.style.position = 'absolute';
  canvas_gl.style.width = canvas_gl.width + 'px';
  canvas_gl.style.height = canvas_gl.height + 'px';
  canvas_gl.style.zIndex = '-2'; // behind 2D context canvas

  document.body.appendChild(canvas_gl);

  const gl: WebGLRenderingContext = <WebGLRenderingContext>(canvas_gl.getContext('webgl') || canvas_gl.getContext('experimental-webgl'));

  window.addEventListener('resize', function(): void {
    canvas_gl.width = window.innerWidth;
    canvas_gl.height = window.innerHeight;
    canvas_gl.style.width = canvas_gl.width + 'px';
    canvas_gl.style.height = canvas_gl.height + 'px';
  });

  const render_webgl: RenderWebGL = new RenderWebGL(gl);

  let camera_x: number = 0;
  let camera_y: number = canvas.height / 3;
  let camera_zoom: number = 0.5;

  let enable_render_webgl: boolean = Boolean(gl);
  let enable_render_ctx2d: boolean = Boolean(ctx) && !enable_render_webgl;

  add_checkbox_control("GL", enable_render_webgl, function(checked: boolean): void { enable_render_webgl = checked; });
  add_checkbox_control("2D", enable_render_ctx2d, function(checked: boolean): void { enable_render_ctx2d = checked; });

  let enable_render_debug_data: boolean = false;
  let enable_render_debug_pose: boolean = false;

  add_checkbox_control("2D Debug Data", enable_render_debug_data, function(checked: boolean): void { enable_render_debug_data = checked; });
  add_checkbox_control("2D Debug Pose", enable_render_debug_pose, function(checked: boolean): void { enable_render_debug_pose = checked; });

  let spine_data: spine.Data = null;
  let spine_pose: spine.Pose = null;
  let spine_pose_next: spine.Pose = null;
  let atlas_data: atlas.Data = null;

  let anim_time: number = 0;
  let anim_length: number = 0;
  let anim_length_next: number = 0;
  let anim_rate: number = 1;
  let anim_repeat: number = 2;

  let anim_blend: number = 0.0;

  add_range_control("Anim Rate", anim_rate, -2.0, 2.0, 0.1, function(value: number): void { anim_rate = value; });

  add_range_control("Anim Blend", anim_blend, 0.0, 1.0, 0.01, function(value: number): void { anim_blend = value; });

  let alpha: number = 1.0;

  add_range_control("Alpha", alpha, 0.0, 1.0, 0.01, function(value: number): void { alpha = value; });

  const loadFile = function(file: any, callback: () => void): void {
    render_ctx2d.dropData(spine_data, atlas_data);
    render_webgl.dropData(spine_data, atlas_data);

    spine_data = null;
    spine_pose = null;
    spine_pose_next = null;
    atlas_data = null;

    const file_path: string = file.path;
    const file_json_url: string = file_path + file.json_url;
    const file_atlas_url: string = (file.atlas_url) ? (file_path + file.atlas_url) : ("");

    loadText(file_json_url, function(err: string, json_text: string): void {
      if (err) {
        callback();
        return;
      }

      spine_data = new spine.Data().load(JSON.parse(json_text));
      spine_pose = new spine.Pose(spine_data);
      spine_pose_next = new spine.Pose(spine_data);

      loadText(file_atlas_url, function(err: string, atlas_text: string): void {
        const images: {[key: string]: HTMLImageElement} = {};

        let counter: number = 0;
        const counter_inc = function(): void { counter++; };
        const counter_dec = function(): void {
          if (--counter === 0) {
            render_ctx2d.loadData(spine_data, atlas_data, images);
            render_webgl.loadData(spine_data, atlas_data, images);
            callback();
          }
        };

        counter_inc();

        if (!err && atlas_text) {
          atlas_data = new atlas.Data().import(atlas_text);

          // load atlas page images
          const dir_path: string = file_atlas_url.slice(0, file_atlas_url.lastIndexOf('/'));
          atlas_data.pages.forEach(function(page: atlas.Page): void {
            const image_key: string = page.name;
            const image_url: string = dir_path + "/" + image_key;
            counter_inc();
            images[image_key] = loadImage(image_url, (function(err: string, image: HTMLImageElement): void {
              const page: atlas.Page = this;
              if (err) {
                console.log("error loading:", image && image.src || page.name);
              }
              page.w = page.w || image.width;
              page.h = page.h || image.height;
              counter_dec();
            }).bind(page));
          });
        } else {
          // load attachment images
          spine_data.iterateSkins(function(skin_key: string, skin: spine.Skin): void {
            skin.iterateAttachments(function(slot_key: string, skin_slot: spine.SkinSlot, attachment_key: string, attachment: spine.Attachment): void {
              if (!attachment) { return; }
              switch (attachment.type) {
                case 'region':
                case 'mesh':
                case 'skinnedmesh':
                  const image_key: string = attachment_key;
                  const image_url: string = file_path + spine_data.skeleton.images + image_key + ".png";
                  counter_inc();
                  images[image_key] = loadImage(image_url, function(err: string, image: HTMLImageElement): void {
                    if (err) {
                      console.log("error loading:", image.src);
                    }
                    counter_dec();
                  });
                  break;
                default:
                  break;
              }
            });
          });
        }

        counter_dec();
      });
    });
  };

  const files: any[] = [];

  const add_file = function(path: string, json_url: string, atlas_url: string = ""): void {
    const file: any = {};
    file.path = path;
    file.json_url = json_url;
    file.atlas_url = atlas_url;
    files.push(file);
  };

  add_file("Splatoon-FanArt/", "Data/splatoon.json", "Data/splatoon.atlas.txt");
  add_file("ExplorerQ/", "ExplorerQ.json");
  add_file("examples/alien/", "export/alien.json", "export/alien.atlas");
  add_file("examples/dragon/", "export/dragon.json", "export/dragon.atlas");
  add_file("examples/goblins/", "export/goblins.json", "export/goblins.atlas");
  add_file("examples/goblins/", "export/goblins-mesh.json", "export/goblins-mesh.atlas");
  add_file("examples/goblins/", "export/goblins-ffd.json", "export/goblins-ffd.atlas");
  add_file("examples/hero/", "export/hero-mesh.json", "export/hero-mesh.atlas");
  add_file("examples/hero/", "export/hero.json", "export/hero.atlas");
  add_file("examples/powerup/", "export/powerup.json", "export/powerup.atlas");
  add_file("examples/raptor/", "export/raptor.json", "export/raptor.atlas");
  add_file("examples/speedy/", "export/speedy.json", "export/speedy.atlas");
  add_file("examples/spineboy-old/", "export/spineboy-old.json", "export/spineboy-old.atlas");
  add_file("examples/spineboy/", "export/spineboy.json", "export/spineboy.atlas");
  add_file("examples/spineboy/", "export/spineboy-mesh.json", "export/spineboy-mesh.atlas");
  add_file("examples/spineboy/", "export/spineboy-hoverboard.json", "export/spineboy-hoverboard.atlas");
  add_file("examples/spinosaurus/", "export/spinosaurus.json", "export/spinosaurus.atlas");
  // const esoteric: string = "https://raw.githubusercontent.com/EsotericSoftware/spine-runtimes/master/";
  // add_file(esoteric + "spine-unity/Assets/Examples/Spine/Dragon/", "dragon.json", "dragon.atlas.txt");
  // add_file(esoteric + "spine-unity/Assets/Examples/Spine/Eyes/", "eyes.json", "eyes.atlas.txt");
  // add_file(esoteric + "spine-unity/Assets/Examples/Spine/FootSoldier/", "FootSoldier.json", "FS_White.atlas.txt");
  // add_file(esoteric + "spine-unity/Assets/Examples/Spine/Gauge/", "Gauge.json", "Gauge.atlas.txt");
  // add_file(esoteric + "spine-unity/Assets/Examples/Spine/Goblins/", "goblins-mesh.json", "goblins-mesh.atlas.txt");
  // add_file(esoteric + "spine-unity/Assets/Examples/Spine/Hero/", "hero-mesh.json", "hero-mesh.atlas.txt");
  // add_file(esoteric + "spine-unity/Assets/Examples/Spine/Raggedy Spineboy/", "Raggedy Spineboy.json", "Raggedy Spineboy.atlas.txt");
  // add_file(esoteric + "spine-unity/Assets/Examples/Spine/Raptor/", "raptor.json", "raptor.atlas.txt");
  // add_file(esoteric + "spine-unity/Assets/Examples/Spine/Spineboy/", "spineboy.json", "spineboy.atlas.txt");

  let file_index: number = 0;
  let skin_index: number = 0;
  let anim_index: number = 0;

  let loading: boolean = false;

  let file: any = files[file_index];
  messages.innerHTML = "loading";
  loading = true; loadFile(file, function(): void {
    loading = false;
    const skin_keys: string[] = spine_data.skin_keys;
    const skin_key: string = skin_keys[skin_index = 0];
    spine_pose.setSkin(skin_key);
    spine_pose_next.setSkin(skin_key);
    const anim_keys: string[] = spine_data.anim_keys;
    const anim_key: string = skin_keys[anim_index = 0];
    spine_pose.setAnim(anim_key);
    const anim_key_next: string = anim_keys[(anim_index + 1) % anim_keys.length];
    spine_pose_next.setAnim(anim_key_next);
    spine_pose.setTime(anim_time = 0);
    spine_pose_next.setTime(anim_time);
    anim_length = spine_pose.curAnimLength() || 1000;
    anim_length_next = spine_pose_next.curAnimLength() || 1000;
  });

  let prev_time: number = 0;

  const loop = function(time: number): void {
    requestAnimationFrame(loop);

    let skin_keys: string[];
    let skin_key: string;
    let anim_keys: string[];
    let anim_key: string;
    let anim_key_next: string;

    const dt: number = time - (prev_time || time); prev_time = time; // ms

    if (!loading) {
      spine_pose.update(dt * anim_rate);
      const anim_rate_next: number = anim_rate * anim_length_next / anim_length;
      spine_pose_next.update(dt * anim_rate_next);

      anim_time += dt * anim_rate;

      if (anim_time >= (anim_length * anim_repeat)) {
        skin_keys = spine_data.skin_keys;
        skin_key = skin_keys[skin_index];
        anim_keys = spine_data.anim_keys;
        if (++anim_index >= anim_keys.length) {
          anim_index = 0;
          if (++skin_index >= skin_keys.length) {
            skin_index = 0;
            if (files.length > 1) {
              if (++file_index >= files.length) {
                file_index = 0;
              }
              file = files[file_index];
              messages.innerHTML = "loading";
              loading = true; loadFile(file, function(): void {
                loading = false;
                skin_keys = spine_data.skin_keys;
                skin_key = skin_keys[skin_index = 0];
                spine_pose.setSkin(skin_key);
                spine_pose_next.setSkin(skin_key);
                anim_keys = spine_data.anim_keys;
                anim_key = anim_keys[anim_index = 0];
                spine_pose.setAnim(anim_key);
                anim_key_next = anim_keys[(anim_index + 1) % anim_keys.length];
                spine_pose_next.setAnim(anim_key_next);
                spine_pose.setTime(anim_time = 0);
                spine_pose_next.setTime(anim_time);
                anim_length = spine_pose.curAnimLength() || 1000;
                anim_length_next = spine_pose_next.curAnimLength() || 1000;
              });
              return;
            }
          }
          skin_keys = spine_data.skin_keys;
          skin_key = skin_keys[skin_index];
          spine_pose.setSkin(skin_key);
          spine_pose_next.setSkin(skin_key);
        }
        anim_keys = spine_data.anim_keys;
        anim_key = anim_keys[anim_index];
        spine_pose.setAnim(anim_key);
        anim_key_next = anim_keys[(anim_index + 1) % anim_keys.length];
        spine_pose_next.setAnim(anim_key_next);
        spine_pose.setTime(anim_time = 0);
        spine_pose_next.setTime(anim_time);
        anim_length = spine_pose.curAnimLength() || 1000;
        anim_length_next = spine_pose_next.curAnimLength() || 1000;
      }

      skin_keys = spine_data.skin_keys;
      skin_key = skin_keys[skin_index];
      anim_keys = spine_data.anim_keys;
      anim_key = anim_keys[anim_index];
      anim_key_next = anim_keys[(anim_index + 1) % anim_keys.length];
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
    spine_pose_next.strike();

    // spine_pose.events.forEach(function(event) { console.log("event", event.name, event.int_value, event.float_value, event.string_value); });

    // blend next pose bone into pose bone
    spine_pose.iterateBones(function(bone_key: string, bone: spine.Bone): void {
      const bone_next: spine.Bone = spine_pose_next.bones[bone_key];
      if (!bone_next) { return; }
      spine.Space.tween(bone.local_space, bone_next.local_space, anim_blend, bone.local_space);
    });

    // compute bone world space
    spine_pose.iterateBones(function(bone_key: string, bone: spine.Bone): void {
      spine.Bone.flatten(bone, spine_pose.bones);
    });

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
      const gl_color: Float32Array = render_webgl.gl_color;
      gl_color[3] = alpha;

      const gl_projection: Float32Array = render_webgl.gl_projection;
      mat4x4Identity(gl_projection);
      mat4x4Ortho(gl_projection, -gl.canvas.width / 2, gl.canvas.width / 2, -gl.canvas.height / 2, gl.canvas.height / 2, -1, 1);

      if (enable_render_ctx2d && enable_render_webgl) {
        mat4x4Translate(gl_projection, gl.canvas.width / 4, 0, 0);
      }

      mat4x4Translate(gl_projection, -camera_x, -camera_y, 0);
      mat4x4Scale(gl_projection, camera_zoom, camera_zoom, camera_zoom);

      if (enable_render_webgl) {
        render_webgl.drawPose(spine_pose, atlas_data);
      }
    }
  };

  requestAnimationFrame(loop);
}

function loadText(url: string, callback: (error: string, text: string) => void): XMLHttpRequest {
  const req: XMLHttpRequest = new XMLHttpRequest();
  if (url) {
    req.open("GET", url, true);
    req.responseType = 'text';
    req.addEventListener('error', function(): void { callback("error", null); });
    req.addEventListener('abort', function(): void { callback("abort", null); });
    req.addEventListener('load', function(): void {
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

function loadImage(url: string, callback: (error: string, image: HTMLImageElement) => void): HTMLImageElement {
  const image: HTMLImageElement = new Image();
  image.crossOrigin = "Anonymous";
  image.addEventListener('error', function(): void { callback("error", null); });
  image.addEventListener('abort', function(): void { callback("abort", null); });
  image.addEventListener('load', function(): void { callback(null, image); });
  image.src = url;
  return image;
}
