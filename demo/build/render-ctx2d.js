System.register(["@spine", "./render-webgl.js"], function (exports_1, context_1) {
    "use strict";
    var Spine, render_webgl_js_1, RenderCtx2D, RenderSkin, RenderSlot, RenderRegionAttachment, RenderBoundingBoxAttachment, RenderMeshAttachment, RenderWeightedMeshAttachment, RenderPathAttachment;
    var __moduleName = context_1 && context_1.id;
    function ctxApplySpace(ctx, space) {
        if (space) {
            ctx.translate(space.position.x, space.position.y);
            ctx.rotate(space.rotation.rad);
            ctx.scale(space.scale.x, space.scale.y);
        }
    }
    function ctxApplyAtlasSitePosition(ctx, site) {
        if (site) {
            ctx.scale(1 / site.original_w, 1 / site.original_h);
            ctx.translate(2 * site.offset_x - (site.original_w - site.w), (site.original_h - site.h) - 2 * site.offset_y);
            ctx.scale(site.w, site.h);
        }
    }
    function ctxDrawCircle(ctx, color = "grey", scale = 1) {
        ctx.beginPath();
        ctx.arc(0, 0, 12 * scale, 0, 2 * Math.PI, false);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    function ctxDrawPoint(ctx, color = "blue", scale = 1) {
        ctx.beginPath();
        ctx.arc(0, 0, 12 * scale, 0, 2 * Math.PI, false);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(24 * scale, 0);
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 24 * scale);
        ctx.strokeStyle = "green";
        ctx.stroke();
    }
    function ctxDrawMesh(ctx, triangles, positions, stroke_style = "grey", fill_style = "") {
        ctx.beginPath();
        for (let index = 0; index < triangles.length;) {
            const triangle0 = triangles[index++] * 2;
            const x0 = positions[triangle0];
            const y0 = positions[triangle0 + 1];
            const triangle1 = triangles[index++] * 2;
            const x1 = positions[triangle1];
            const y1 = positions[triangle1 + 1];
            const triangle2 = triangles[index++] * 2;
            const x2 = positions[triangle2];
            const y2 = positions[triangle2 + 1];
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x0, y0);
        }
        if (fill_style) {
            ctx.fillStyle = fill_style;
            ctx.fill();
        }
        ctx.strokeStyle = stroke_style;
        ctx.stroke();
    }
    function ctxDrawImageMesh(ctx, triangles, positions, texcoords, image, site) {
        const page = site && site.page;
        const site_texmatrix = new Float32Array(9);
        const site_texcoord = new Float32Array(2);
        render_webgl_js_1.mat3x3Identity(site_texmatrix);
        image && render_webgl_js_1.mat3x3Scale(site_texmatrix, image.width, image.height);
        render_webgl_js_1.mat3x3ApplyAtlasPageTexcoord(site_texmatrix, page);
        render_webgl_js_1.mat3x3ApplyAtlasSiteTexcoord(site_texmatrix, site);
        // http://www.irrlicht3d.org/pivot/entry.php?id=1329
        for (let index = 0; index < triangles.length;) {
            const triangle0 = triangles[index++] * 2;
            const position0 = positions.subarray(triangle0, triangle0 + 2);
            const x0 = position0[0];
            const y0 = position0[1];
            const texcoord0 = render_webgl_js_1.mat3x3Transform(site_texmatrix, texcoords.subarray(triangle0, triangle0 + 2), site_texcoord);
            const u0 = texcoord0[0];
            const v0 = texcoord0[1];
            const triangle1 = triangles[index++] * 2;
            const position1 = positions.subarray(triangle1, triangle1 + 2);
            let x1 = position1[0];
            let y1 = position1[1];
            const texcoord1 = render_webgl_js_1.mat3x3Transform(site_texmatrix, texcoords.subarray(triangle1, triangle1 + 2), site_texcoord);
            let u1 = texcoord1[0];
            let v1 = texcoord1[1];
            const triangle2 = triangles[index++] * 2;
            const position2 = positions.subarray(triangle2, triangle2 + 2);
            let x2 = position2[0];
            let y2 = position2[1];
            const texcoord2 = render_webgl_js_1.mat3x3Transform(site_texmatrix, texcoords.subarray(triangle2, triangle2 + 2), site_texcoord);
            let u2 = texcoord2[0];
            let v2 = texcoord2[1];
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.clip();
            x1 -= x0;
            y1 -= y0;
            x2 -= x0;
            y2 -= y0;
            u1 -= u0;
            v1 -= v0;
            u2 -= u0;
            v2 -= v0;
            const id = 1 / (u1 * v2 - u2 * v1);
            const a = id * (v2 * x1 - v1 * x2);
            const b = id * (v2 * y1 - v1 * y2);
            const c = id * (u1 * x2 - u2 * x1);
            const d = id * (u1 * y2 - u2 * y1);
            const e = x0 - (a * u0 + c * v0);
            const f = y0 - (b * u0 + d * v0);
            ctx.transform(a, b, c, d, e, f);
            image && ctx.drawImage(image, 0, 0);
            ctx.restore();
        }
    }
    function ctxDrawIkConstraints(ctx, spine_data, bones) {
        spine_data.ikcs.forEach((ikc, ikc_key) => {
            const target = bones.get(ikc.target_key);
            switch (ikc.bone_keys.length) {
                case 1:
                    const bone = bones.get(ikc.bone_keys[0]);
                    ctx.beginPath();
                    target && ctx.moveTo(target.world_space.position.x, target.world_space.position.y);
                    bone && ctx.lineTo(bone.world_space.position.x, bone.world_space.position.y);
                    ctx.strokeStyle = "yellow";
                    ctx.stroke();
                    ctx.save();
                    target && ctxApplySpace(ctx, target.world_space);
                    ctxDrawCircle(ctx, "yellow", 1.5);
                    ctx.restore();
                    ctx.save();
                    bone && ctxApplySpace(ctx, bone.world_space);
                    ctxDrawCircle(ctx, "yellow", 0.5);
                    ctx.restore();
                    break;
                case 2:
                    const parent = bones.get(ikc.bone_keys[0]);
                    const child = bones.get(ikc.bone_keys[1]);
                    ctx.beginPath();
                    target && ctx.moveTo(target.world_space.position.x, target.world_space.position.y);
                    child && ctx.lineTo(child.world_space.position.x, child.world_space.position.y);
                    parent && ctx.lineTo(parent.world_space.position.x, parent.world_space.position.y);
                    ctx.strokeStyle = "yellow";
                    ctx.stroke();
                    ctx.save();
                    target && ctxApplySpace(ctx, target.world_space);
                    ctxDrawCircle(ctx, "yellow", 1.5);
                    ctx.restore();
                    ctx.save();
                    child && ctxApplySpace(ctx, child.world_space);
                    ctxDrawCircle(ctx, "yellow", 0.75);
                    ctx.restore();
                    ctx.save();
                    parent && ctxApplySpace(ctx, parent.world_space);
                    ctxDrawCircle(ctx, "yellow", 0.5);
                    ctx.restore();
                    break;
            }
        });
    }
    return {
        setters: [
            function (Spine_1) {
                Spine = Spine_1;
            },
            function (render_webgl_js_1_1) {
                render_webgl_js_1 = render_webgl_js_1_1;
            }
        ],
        execute: function () {
            RenderCtx2D = class RenderCtx2D {
                constructor(ctx) {
                    this.images = new Spine.Map();
                    this.skin_map = new Spine.Map();
                    this.region_vertex_position = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]); // [ x, y ]
                    this.region_vertex_texcoord = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]); // [ u, v ]
                    this.region_vertex_triangle = new Uint16Array([0, 1, 2, 0, 2, 3]); // [ i0, i1, i2 ]
                    this.ctx = ctx;
                }
                loadData(spine_data, atlas_data = null, images) {
                    this.images = images;
                    spine_data.iterateSkins((skin_key, skin) => {
                        const render_skin = this.skin_map.get(skin_key) || this.skin_map.set(skin_key, new RenderSkin());
                        skin.iterateAttachments((slot_key, skin_slot, attachment_key, attachment) => {
                            if (!attachment) {
                                return;
                            }
                            const render_slot = render_skin.slot_map.get(slot_key) || render_skin.slot_map.set(slot_key, new RenderSlot());
                            switch (attachment.type) {
                                case "region":
                                    render_slot.attachment_map.set(attachment_key, new RenderRegionAttachment(this).loadData(spine_data, attachment));
                                    break;
                                case "boundingbox":
                                    render_slot.attachment_map.set(attachment_key, new RenderBoundingBoxAttachment(this).loadData(spine_data, attachment));
                                    break;
                                case "mesh":
                                    render_slot.attachment_map.set(attachment_key, new RenderMeshAttachment(this).loadData(spine_data, attachment));
                                    break;
                                case "weightedmesh":
                                    render_slot.attachment_map.set(attachment_key, new RenderWeightedMeshAttachment(this).loadData(spine_data, attachment));
                                    break;
                                case "path":
                                    render_slot.attachment_map.set(attachment_key, new RenderPathAttachment(this).loadData(spine_data, attachment));
                                    break;
                            }
                        });
                    });
                }
                dropData(spine_data, atlas_data = null) {
                    this.images.clear();
                    spine_data.iterateSkins((skin_key, skin) => {
                        const render_skin = this.skin_map.get(skin_key);
                        skin.iterateAttachments((slot_key, skin_slot, attachment_key, attachment) => {
                            if (!attachment) {
                                return;
                            }
                            const render_slot = render_skin && render_skin.slot_map.get(slot_key);
                            const render_attachment = render_slot && render_slot.attachment_map.get(attachment_key);
                            if (render_attachment) {
                                render_attachment.dropData(spine_data, attachment);
                            }
                        });
                    });
                    this.skin_map.clear();
                }
                updatePose(spine_pose, atlas_data) {
                    spine_pose.iterateAttachments((slot_key, slot, skin_slot, attachment_key, attachment) => {
                        if (!attachment) {
                            return;
                        }
                        const render_skin = this.skin_map.get(spine_pose.skin_key);
                        const render_skin_default = this.skin_map.get("default");
                        const render_slot = (render_skin && render_skin.slot_map.get(slot_key)) || (render_skin_default && render_skin_default.slot_map.get(slot_key));
                        const render_attachment = render_slot && render_slot.attachment_map.get(attachment_key);
                        if (render_attachment) {
                            render_attachment.updatePose(spine_pose, atlas_data, slot_key, attachment_key, attachment);
                        }
                    });
                }
                drawPose(spine_pose, atlas_data) {
                    const ctx = this.ctx;
                    this.updatePose(spine_pose, atlas_data);
                    spine_pose.iterateAttachments((slot_key, slot, skin_slot, attachment_key, attachment) => {
                        if (!attachment) {
                            return;
                        }
                        const render_skin = this.skin_map.get(spine_pose.skin_key);
                        const render_skin_default = this.skin_map.get("default");
                        const render_slot = (render_skin && render_skin.slot_map.get(slot_key)) || (render_skin_default && render_skin_default.slot_map.get(slot_key));
                        const render_attachment = render_slot && render_slot.attachment_map.get(attachment_key);
                        if (render_attachment) {
                            ctx.save();
                            // slot.color.rgb
                            ctx.globalAlpha *= slot.color.a;
                            switch (slot.blend) {
                                default:
                                case "normal":
                                    ctx.globalCompositeOperation = "source-over";
                                    break;
                                case "additive":
                                    ctx.globalCompositeOperation = "lighter";
                                    break;
                                case "multiply":
                                    ctx.globalCompositeOperation = "multiply";
                                    break;
                                case "screen":
                                    ctx.globalCompositeOperation = "screen";
                                    break;
                            }
                            render_attachment.drawPose(spine_pose, atlas_data, slot, attachment_key, attachment);
                            ctx.restore();
                        }
                    });
                }
                drawDebugPose(spine_pose, atlas_data) {
                    const ctx = this.ctx;
                    this.updatePose(spine_pose, atlas_data);
                    spine_pose.iterateAttachments((slot_key, slot, skin_slot, attachment_key, attachment) => {
                        if (!attachment) {
                            return;
                        }
                        const render_skin = this.skin_map.get(spine_pose.skin_key);
                        const render_skin_default = this.skin_map.get("default");
                        const render_slot = (render_skin && render_skin.slot_map.get(slot_key)) || (render_skin_default && render_skin_default.slot_map.get(slot_key));
                        const render_attachment = render_slot && render_slot.attachment_map.get(attachment_key);
                        if (render_attachment) {
                            render_attachment.drawDebugPose(spine_pose, atlas_data, slot, attachment_key, attachment);
                        }
                    });
                    spine_pose.iterateBones((bone_key, bone) => {
                        ctx.save();
                        ctxApplySpace(ctx, bone.world_space);
                        ctxDrawPoint(ctx);
                        ctx.restore();
                    });
                    ctxDrawIkConstraints(ctx, spine_pose.data, spine_pose.bones);
                }
                drawDebugData(spine_pose, atlas_data) {
                    const ctx = this.ctx;
                    spine_pose.data.iterateAttachments(spine_pose.skin_key, (slot_key, slot, skin_slot, attachment_key, attachment) => {
                        if (!attachment) {
                            return;
                        }
                        const render_skin = this.skin_map.get(spine_pose.skin_key);
                        const render_skin_default = this.skin_map.get("default");
                        const render_slot = (render_skin && render_skin.slot_map.get(slot_key)) || (render_skin_default && render_skin_default.slot_map.get(slot_key));
                        const render_attachment = render_slot && render_slot.attachment_map.get(attachment_key);
                        if (render_attachment) {
                            render_attachment.drawDebugData(spine_pose, atlas_data, slot, attachment_key, attachment);
                        }
                    });
                    spine_pose.data.iterateBones((bone_key, bone) => {
                        ctx.save();
                        ctxApplySpace(ctx, bone.world_space);
                        ctxDrawPoint(ctx);
                        ctx.restore();
                    });
                    ctxDrawIkConstraints(ctx, spine_pose.data, spine_pose.data.bones);
                }
            };
            exports_1("RenderCtx2D", RenderCtx2D);
            RenderSkin = class RenderSkin {
                constructor() {
                    this.slot_map = new Spine.Map();
                }
            };
            RenderSlot = class RenderSlot {
                constructor() {
                    this.attachment_map = new Spine.Map();
                }
            };
            RenderRegionAttachment = class RenderRegionAttachment {
                constructor(render) {
                    this.render = render;
                }
                loadData(spine_data, attachment) {
                    return this;
                }
                dropData(spine_data, attachment) {
                    return this;
                }
                updatePose(spine_pose, atlas_data, slot_key, attachment_key, attachment) {
                }
                drawPose(spine_pose, atlas_data, slot, attachment_key, attachment) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.bones.get(slot.bone_key);
                    const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                    const page = site && site.page;
                    const image_key = (page && page.name) || attachment.path || attachment.name || attachment_key;
                    const image = this.render.images.get(image_key);
                    if (!image || !image.complete) {
                        return;
                    }
                    ctx.save();
                    bone && ctxApplySpace(ctx, bone.world_space);
                    ctxApplySpace(ctx, attachment.local_space);
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctx.scale(attachment.width / 2, attachment.height / 2);
                    ctxDrawImageMesh(ctx, this.render.region_vertex_triangle, this.render.region_vertex_position, this.render.region_vertex_texcoord, image, site);
                    ctx.restore();
                }
                drawDebugPose(spine_pose, atlas_data, slot, attachment_key, attachment) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.bones.get(slot.bone_key);
                    const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                    ctx.save();
                    bone && ctxApplySpace(ctx, bone.world_space);
                    ctxApplySpace(ctx, attachment.local_space);
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctx.beginPath();
                    ctx.rect(-attachment.width / 2, -attachment.height / 2, attachment.width, attachment.height);
                    ctx.fillStyle = "rgba(127,127,127,0.25)";
                    ctx.fill();
                    ctx.strokeStyle = "rgba(127,127,127,1.0)";
                    ctx.stroke();
                    ctx.restore();
                }
                drawDebugData(spine_pose, atlas_data, slot, attachment_key, attachment) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.data.bones.get(slot.bone_key);
                    const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                    ctx.save();
                    bone && ctxApplySpace(ctx, bone.world_space);
                    ctxApplySpace(ctx, attachment.local_space);
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctx.beginPath();
                    ctx.rect(-attachment.width / 2, -attachment.height / 2, attachment.width, attachment.height);
                    ctx.fillStyle = "rgba(127,127,127,0.25)";
                    ctx.fill();
                    ctx.strokeStyle = "rgba(127,127,127,1.0)";
                    ctx.stroke();
                    ctx.restore();
                }
            };
            RenderBoundingBoxAttachment = class RenderBoundingBoxAttachment {
                constructor(render) {
                    this.render = render;
                }
                loadData(spine_data, attachment) {
                    return this;
                }
                dropData(spine_data, attachment) {
                    return this;
                }
                updatePose(spine_pose, atlas_data, slot_key, attachment_key, attachment) {
                }
                drawPose(spine_pose, atlas_data, slot, attachment_key, attachment) {
                }
                drawDebugPose(spine_pose, atlas_data, slot, attachment_key, attachment) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.bones.get(slot.bone_key);
                    ctx.save();
                    bone && ctxApplySpace(ctx, bone.world_space);
                    ctx.beginPath();
                    let x = 0;
                    attachment.vertices.forEach((value, index) => {
                        if (index & 1) {
                            ctx.lineTo(x, value);
                        }
                        else {
                            x = value;
                        }
                    });
                    ctx.closePath();
                    ctx.strokeStyle = attachment.color.toString();
                    ctx.stroke();
                    ctx.restore();
                }
                drawDebugData(spine_pose, atlas_data, slot, attachment_key, attachment) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.data.bones.get(slot.bone_key);
                    ctx.save();
                    bone && ctxApplySpace(ctx, bone.world_space);
                    ctx.beginPath();
                    let x = 0;
                    attachment.vertices.forEach((value, index) => {
                        if (index & 1) {
                            ctx.lineTo(x, value);
                        }
                        else {
                            x = value;
                        }
                    });
                    ctx.closePath();
                    ctx.strokeStyle = attachment.color.toString();
                    ctx.stroke();
                    ctx.restore();
                }
            };
            RenderMeshAttachment = class RenderMeshAttachment {
                constructor(render) {
                    this.render = render;
                }
                loadData(spine_data, attachment) {
                    this.vertex_count = attachment.vertices.length / 2;
                    this.vertex_position = new Float32Array(attachment.vertices);
                    this.vertex_texcoord = new Float32Array(attachment.uvs);
                    this.vertex_triangle = new Uint16Array(attachment.triangles);
                    return this;
                }
                dropData(spine_data, attachment) {
                    return this;
                }
                updatePose(spine_pose, atlas_data, slot_key, attachment_key, attachment) {
                    const anim = spine_pose.data.anims.get(spine_pose.anim_key);
                    const ffd_skin = anim && anim.ffd_skins && anim.ffd_skins.get(spine_pose.skin_key);
                    const ffd_slot = ffd_skin && ffd_skin.ffd_slots.get(slot_key);
                    const ffd_attachment = ffd_slot && ffd_slot.ffd_attachments.get(attachment_key);
                    const ffd_timeline = ffd_attachment && ffd_attachment.ffd_timeline;
                    const ffd_keyframes = ffd_timeline && ffd_timeline.keyframes;
                    const ffd_keyframe0_index = Spine.Keyframe.find(ffd_keyframes, spine_pose.time);
                    const ffd_keyframe1_index = ffd_keyframe0_index + 1 || ffd_keyframe0_index;
                    const ffd_keyframe0 = (ffd_keyframes && ffd_keyframes[ffd_keyframe0_index]);
                    const ffd_keyframe1 = (ffd_keyframes && ffd_keyframes[ffd_keyframe1_index]) || ffd_keyframe0;
                    const ffd_weight = Spine.FfdKeyframe.interpolate(ffd_keyframe0, ffd_keyframe1, spine_pose.time);
                    if (ffd_keyframe0 && ffd_keyframe1) {
                        for (let index = 0; index < this.vertex_position.length; ++index) {
                            const v0 = ffd_keyframe0.vertices[index - ffd_keyframe0.offset] || 0;
                            const v1 = ffd_keyframe1.vertices[index - ffd_keyframe1.offset] || 0;
                            this.vertex_position[index] = attachment.vertices[index] + Spine.tween(v0, v1, ffd_weight);
                        }
                    }
                }
                drawPose(spine_pose, atlas_data, slot, attachment_key, attachment) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.bones.get(slot.bone_key);
                    const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                    const page = site && site.page;
                    const image_key = (page && page.name) || attachment.path || attachment.name || attachment_key;
                    const image = this.render.images.get(image_key);
                    if (!image || !image.complete) {
                        return;
                    }
                    ctx.save();
                    bone && ctxApplySpace(ctx, bone.world_space);
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctxDrawImageMesh(ctx, this.vertex_triangle, this.vertex_position, this.vertex_texcoord, image, site);
                    ctx.restore();
                }
                drawDebugPose(spine_pose, atlas_data, slot, attachment_key, attachment) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.bones.get(slot.bone_key);
                    const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                    ctx.save();
                    bone && ctxApplySpace(ctx, bone.world_space);
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctxDrawMesh(ctx, this.vertex_triangle, this.vertex_position, "rgba(127,127,127,1.0)", "rgba(127,127,127,0.25)");
                    ctx.restore();
                }
                drawDebugData(spine_pose, atlas_data, slot, attachment_key, attachment) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.data.bones.get(slot.bone_key);
                    const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                    ctx.save();
                    bone && ctxApplySpace(ctx, bone.world_space);
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctxDrawMesh(ctx, this.vertex_triangle, this.vertex_position, "rgba(127,127,127,1.0)", "rgba(127,127,127,0.25)");
                    ctx.restore();
                }
            };
            RenderWeightedMeshAttachment = class RenderWeightedMeshAttachment {
                constructor(render) {
                    this.render = render;
                }
                loadData(spine_data, attachment) {
                    const vertex_count = this.vertex_count = attachment.uvs.length / 2;
                    const vertex_setup_position = this.vertex_setup_position = new Float32Array(2 * vertex_count);
                    const vertex_blend_position = this.vertex_blend_position = new Float32Array(2 * vertex_count);
                    this.vertex_texcoord = new Float32Array(attachment.uvs);
                    this.vertex_triangle = new Uint16Array(attachment.triangles);
                    const position = new Spine.Vector();
                    for (let vertex_index = 0, index = 0; vertex_index < vertex_count; ++vertex_index) {
                        const blender_count = attachment.vertices[index++];
                        let setup_position_x = 0;
                        let setup_position_y = 0;
                        for (let blender_index = 0; blender_index < blender_count; ++blender_index) {
                            const bone_index = attachment.vertices[index++];
                            position.x = attachment.vertices[index++];
                            position.y = attachment.vertices[index++];
                            const weight = attachment.vertices[index++];
                            ///const bone_key: string = spine_data.bones._keys[bone_index];
                            ///const bone: Spine.Bone | undefined = spine_data.bones.get(bone_key);
                            const bone = spine_data.bones.getByIndex(bone_index);
                            bone && Spine.Space.transform(bone.world_space, position, position);
                            setup_position_x += position.x * weight;
                            setup_position_y += position.y * weight;
                        }
                        let vertex_setup_position_offset = vertex_index * 2;
                        vertex_setup_position[vertex_setup_position_offset++] = setup_position_x;
                        vertex_setup_position[vertex_setup_position_offset++] = setup_position_y;
                    }
                    vertex_blend_position.set(vertex_setup_position);
                    return this;
                }
                dropData(spine_data, attachment) {
                    return this;
                }
                updatePose(spine_pose, atlas_data, slot_key, attachment_key, attachment) {
                    const anim = spine_pose.data.anims.get(spine_pose.anim_key);
                    const ffd_skin = anim && anim.ffd_skins && anim.ffd_skins.get(spine_pose.skin_key);
                    const ffd_slot = ffd_skin && ffd_skin.ffd_slots.get(slot_key);
                    const ffd_attachment = ffd_slot && ffd_slot.ffd_attachments.get(attachment_key);
                    const ffd_timeline = ffd_attachment && ffd_attachment.ffd_timeline;
                    const ffd_keyframes = ffd_timeline && ffd_timeline.keyframes;
                    const ffd_keyframe0_index = Spine.Keyframe.find(ffd_keyframes, spine_pose.time);
                    const ffd_keyframe1_index = ffd_keyframe0_index + 1 || ffd_keyframe0_index;
                    const ffd_keyframe0 = (ffd_keyframes && ffd_keyframes[ffd_keyframe0_index]);
                    const ffd_keyframe1 = (ffd_keyframes && ffd_keyframes[ffd_keyframe1_index]) || ffd_keyframe0;
                    const ffd_weight = Spine.FfdKeyframe.interpolate(ffd_keyframe0, ffd_keyframe1, spine_pose.time);
                    if (ffd_keyframe0 && ffd_keyframe1) {
                        const vertex_blend_position = this.vertex_blend_position;
                        const position = new Spine.Vector();
                        for (let vertex_index = 0, index = 0, ffd_index = 0; vertex_index < this.vertex_count; ++vertex_index) {
                            const blender_count = attachment.vertices[index++];
                            let blend_position_x = 0;
                            let blend_position_y = 0;
                            for (let blender_index = 0; blender_index < blender_count; ++blender_index) {
                                const bone_index = attachment.vertices[index++];
                                position.x = attachment.vertices[index++];
                                position.y = attachment.vertices[index++];
                                const weight = attachment.vertices[index++];
                                ///const bone_key: string = spine_pose.bones._keys[bone_index];
                                ///const bone: Spine.Bone | undefined = spine_pose.bones.get(bone_key);
                                const bone = spine_pose.bones.getByIndex(bone_index);
                                const x0 = ffd_keyframe0.vertices[ffd_index - ffd_keyframe0.offset] || 0;
                                const x1 = ffd_keyframe1.vertices[ffd_index - ffd_keyframe1.offset] || 0;
                                position.x += Spine.tween(x0, x1, ffd_weight);
                                ++ffd_index;
                                const y0 = ffd_keyframe0.vertices[ffd_index - ffd_keyframe0.offset] || 0;
                                const y1 = ffd_keyframe1.vertices[ffd_index - ffd_keyframe1.offset] || 0;
                                position.y += Spine.tween(y0, y1, ffd_weight);
                                ++ffd_index;
                                bone && Spine.Space.transform(bone.world_space, position, position);
                                blend_position_x += position.x * weight;
                                blend_position_y += position.y * weight;
                            }
                            vertex_blend_position[vertex_index * 2 + 0] = blend_position_x;
                            vertex_blend_position[vertex_index * 2 + 1] = blend_position_y;
                        }
                    }
                    else {
                        const vertex_blend_position = this.vertex_blend_position;
                        const position = new Spine.Vector();
                        for (let vertex_index = 0, index = 0; vertex_index < this.vertex_count; ++vertex_index) {
                            const blender_count = attachment.vertices[index++];
                            let blend_position_x = 0;
                            let blend_position_y = 0;
                            for (let blender_index = 0; blender_index < blender_count; ++blender_index) {
                                const bone_index = attachment.vertices[index++];
                                position.x = attachment.vertices[index++];
                                position.y = attachment.vertices[index++];
                                const weight = attachment.vertices[index++];
                                ///const bone_key: string = spine_pose.bones._keys[bone_index];
                                ///const bone: Spine.Bone | undefined = spine_pose.bones.get(bone_key);
                                const bone = spine_pose.bones.getByIndex(bone_index);
                                bone && Spine.Space.transform(bone.world_space, position, position);
                                blend_position_x += position.x * weight;
                                blend_position_y += position.y * weight;
                            }
                            let vertex_position_offset = vertex_index * 2;
                            vertex_blend_position[vertex_position_offset++] = blend_position_x;
                            vertex_blend_position[vertex_position_offset++] = blend_position_y;
                        }
                    }
                }
                drawPose(spine_pose, atlas_data, slot, attachment_key, attachment) {
                    const ctx = this.render.ctx;
                    const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                    const page = site && site.page;
                    const image_key = (page && page.name) || attachment.path || attachment.name || attachment_key;
                    const image = this.render.images.get(image_key);
                    if (!image || !image.complete) {
                        return;
                    }
                    ctx.save();
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctxDrawImageMesh(ctx, this.vertex_triangle, this.vertex_blend_position, this.vertex_texcoord, image, site);
                    ctx.restore();
                }
                drawDebugPose(spine_pose, atlas_data, slot, attachment_key, attachment) {
                    const ctx = this.render.ctx;
                    const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                    ctx.save();
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctxDrawMesh(ctx, this.vertex_triangle, this.vertex_blend_position, "rgba(127,127,127,1.0)", "rgba(127,127,127,0.25)");
                    ctx.restore();
                }
                drawDebugData(spine_pose, atlas_data, slot, attachment_key, attachment) {
                    const ctx = this.render.ctx;
                    const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                    ctx.save();
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctxDrawMesh(ctx, this.vertex_triangle, this.vertex_setup_position, "rgba(127,127,127,1.0)", "rgba(127,127,127,0.25)");
                    ctx.restore();
                }
            };
            RenderPathAttachment = class RenderPathAttachment {
                constructor(render) {
                    this.render = render;
                }
                loadData(spine_data, attachment) {
                    return this;
                }
                dropData(spine_data, attachment) {
                    return this;
                }
                updatePose(spine_pose, atlas_data, slot_key, attachment_key, attachment) {
                }
                drawPose(spine_pose, atlas_data, slot, attachment_key, attachment) {
                }
                drawDebugPose(spine_pose, atlas_data, slot, attachment_key, attachment) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.bones.get(slot.bone_key);
                    ctx.save();
                    bone && ctxApplySpace(ctx, bone.world_space);
                    ctx.beginPath();
                    let x = 0;
                    attachment.vertices.forEach((value, index) => {
                        if (index & 1) {
                            ctx.lineTo(x, value);
                        }
                        else {
                            x = value;
                        }
                    });
                    ctx.closePath();
                    ctx.strokeStyle = attachment.color.toString();
                    ctx.stroke();
                    ctx.restore();
                }
                drawDebugData(spine_pose, atlas_data, slot, attachment_key, attachment) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.data.bones.get(slot.bone_key);
                    ctx.save();
                    bone && ctxApplySpace(ctx, bone.world_space);
                    ctx.beginPath();
                    let x = 0;
                    attachment.vertices.forEach((value, index) => {
                        if (index & 1) {
                            ctx.lineTo(x, value);
                        }
                        else {
                            x = value;
                        }
                    });
                    ctx.closePath();
                    ctx.strokeStyle = attachment.color.toString();
                    ctx.stroke();
                    ctx.restore();
                }
            };
        }
    };
});
//# sourceMappingURL=render-ctx2d.js.map