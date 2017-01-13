System.register(["../spine", "./render-webgl"], function (exports_1, context_1) {
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
    function ctxDrawImageMesh(ctx, triangles, positions, texcoords, image, site, page) {
        const site_texmatrix = new Float32Array(9);
        const site_texcoord = new Float32Array(2);
        render_webgl_1.mat3x3Identity(site_texmatrix);
        render_webgl_1.mat3x3Scale(site_texmatrix, image.width, image.height);
        render_webgl_1.mat3x3ApplyAtlasPageTexcoord(site_texmatrix, page);
        render_webgl_1.mat3x3ApplyAtlasSiteTexcoord(site_texmatrix, site);
        for (let index = 0; index < triangles.length;) {
            const triangle0 = triangles[index++] * 2;
            const position0 = positions.subarray(triangle0, triangle0 + 2);
            const x0 = position0[0];
            const y0 = position0[1];
            const texcoord0 = render_webgl_1.mat3x3Transform(site_texmatrix, texcoords.subarray(triangle0, triangle0 + 2), site_texcoord);
            const u0 = texcoord0[0];
            const v0 = texcoord0[1];
            const triangle1 = triangles[index++] * 2;
            const position1 = positions.subarray(triangle1, triangle1 + 2);
            let x1 = position1[0];
            let y1 = position1[1];
            const texcoord1 = render_webgl_1.mat3x3Transform(site_texmatrix, texcoords.subarray(triangle1, triangle1 + 2), site_texcoord);
            let u1 = texcoord1[0];
            let v1 = texcoord1[1];
            const triangle2 = triangles[index++] * 2;
            const position2 = positions.subarray(triangle2, triangle2 + 2);
            let x2 = position2[0];
            let y2 = position2[1];
            const texcoord2 = render_webgl_1.mat3x3Transform(site_texmatrix, texcoords.subarray(triangle2, triangle2 + 2), site_texcoord);
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
            ctx.drawImage(image, 0, 0);
            ctx.restore();
        }
    }
    function ctxDrawIkConstraints(ctx, spine_data, bones) {
        spine_data.ikc_keys.forEach(function (ikc_key) {
            const ikc = spine_data.ikcs[ikc_key];
            const target = bones[ikc.target_key];
            switch (ikc.bone_keys.length) {
                case 1:
                    const bone = bones[ikc.bone_keys[0]];
                    ctx.beginPath();
                    ctx.moveTo(target.world_space.position.x, target.world_space.position.y);
                    ctx.lineTo(bone.world_space.position.x, bone.world_space.position.y);
                    ctx.strokeStyle = "yellow";
                    ctx.stroke();
                    ctx.save();
                    ctxApplySpace(ctx, target.world_space);
                    ctxDrawCircle(ctx, "yellow", 1.5);
                    ctx.restore();
                    ctx.save();
                    ctxApplySpace(ctx, bone.world_space);
                    ctxDrawCircle(ctx, "yellow", 0.5);
                    ctx.restore();
                    break;
                case 2:
                    const parent = bones[ikc.bone_keys[0]];
                    const child = bones[ikc.bone_keys[1]];
                    ctx.beginPath();
                    ctx.moveTo(target.world_space.position.x, target.world_space.position.y);
                    ctx.lineTo(child.world_space.position.x, child.world_space.position.y);
                    ctx.lineTo(parent.world_space.position.x, parent.world_space.position.y);
                    ctx.strokeStyle = "yellow";
                    ctx.stroke();
                    ctx.save();
                    ctxApplySpace(ctx, target.world_space);
                    ctxDrawCircle(ctx, "yellow", 1.5);
                    ctx.restore();
                    ctx.save();
                    ctxApplySpace(ctx, child.world_space);
                    ctxDrawCircle(ctx, "yellow", 0.75);
                    ctx.restore();
                    ctx.save();
                    ctxApplySpace(ctx, parent.world_space);
                    ctxDrawCircle(ctx, "yellow", 0.5);
                    ctx.restore();
                    break;
            }
        });
    }
    var Spine, render_webgl_1, RenderCtx2D, RenderSkin, RenderSlot, RenderRegionAttachment, RenderBoundingBoxAttachment, RenderMeshAttachment, RenderWeightedMeshAttachment;
    return {
        setters: [
            function (Spine_1) {
                Spine = Spine_1;
            },
            function (render_webgl_1_1) {
                render_webgl_1 = render_webgl_1_1;
            }
        ],
        execute: function () {
            RenderCtx2D = class RenderCtx2D {
                constructor(ctx) {
                    this.images = {};
                    this.skin_map = {};
                    this.region_vertex_position = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]);
                    this.region_vertex_texcoord = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]);
                    this.region_vertex_triangle = new Uint16Array([0, 1, 2, 0, 2, 3]);
                    this.ctx = ctx;
                }
                loadData(spine_data, atlas_data = null, images) {
                    this.images = images;
                    spine_data.iterateSkins((skin_key, skin) => {
                        const render_skin = this.skin_map[skin_key] = new RenderSkin();
                        skin.iterateAttachments((slot_key, skin_slot, attachment_key, attachment) => {
                            if (!attachment) {
                                return;
                            }
                            const render_slot = render_skin.slot_map[slot_key] = render_skin.slot_map[slot_key] || new RenderSlot();
                            switch (attachment.type) {
                                case "region":
                                    render_slot.attachment_map[attachment_key] = new RenderRegionAttachment(this).loadData(spine_data, attachment);
                                    break;
                                case "boundingbox":
                                    render_slot.attachment_map[attachment_key] = new RenderBoundingBoxAttachment(this).loadData(spine_data, attachment);
                                    break;
                                case "mesh":
                                    render_slot.attachment_map[attachment_key] = new RenderMeshAttachment(this).loadData(spine_data, attachment);
                                    break;
                                case "weightedmesh":
                                    render_slot.attachment_map[attachment_key] = new RenderWeightedMeshAttachment(this).loadData(spine_data, attachment);
                                    break;
                            }
                        });
                    });
                }
                dropData(spine_data, atlas_data = null) {
                    this.images = {};
                    spine_data.iterateSkins((skin_key, skin) => {
                        const render_skin = this.skin_map[skin_key];
                        skin.iterateAttachments((slot_key, skin_slot, attachment_key, attachment) => {
                            if (!attachment) {
                                return;
                            }
                            const render_slot = render_skin.slot_map[slot_key];
                            const render_attachment = render_slot.attachment_map[attachment_key];
                            if (render_attachment) {
                                render_attachment.dropData(spine_data, attachment);
                            }
                        });
                    });
                    this.skin_map = {};
                }
                updatePose(spine_pose, atlas_data) {
                    spine_pose.iterateAttachments((slot_key, slot, skin_slot, attachment_key, attachment) => {
                        if (!attachment) {
                            return;
                        }
                        const render_skin = this.skin_map[spine_pose.skin_key];
                        const render_slot = render_skin.slot_map[slot_key] || this.skin_map["default"].slot_map[slot_key];
                        const render_attachment = render_slot.attachment_map[attachment_key];
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
                        const render_skin = this.skin_map[spine_pose.skin_key];
                        const render_slot = render_skin.slot_map[slot_key] || this.skin_map["default"].slot_map[slot_key];
                        const render_attachment = render_slot.attachment_map[attachment_key];
                        if (render_attachment) {
                            const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                            const page = site && site.page;
                            const image_key = (page && page.name) || attachment.path || attachment.name || attachment_key;
                            const image = this.images[image_key];
                            if (!image || !image.complete) {
                                return;
                            }
                            ctx.save();
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
                            render_attachment.drawPose(spine_pose, slot, attachment, image, site, page);
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
                        const render_skin = this.skin_map[spine_pose.skin_key];
                        const render_slot = render_skin.slot_map[slot_key] || this.skin_map["default"].slot_map[slot_key];
                        const render_attachment = render_slot.attachment_map[attachment_key];
                        if (render_attachment) {
                            const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                            const page = site && site.page;
                            const image_key = (page && page.name) || attachment.path || attachment.name || attachment_key;
                            const image = this.images[image_key];
                            render_attachment.drawDebugPose(spine_pose, slot, attachment, image, site, page);
                        }
                    });
                    spine_pose.iterateBones(function (bone_key, bone) {
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
                        const render_skin = this.skin_map[spine_pose.skin_key];
                        const render_slot = render_skin.slot_map[slot_key] || this.skin_map["default"].slot_map[slot_key];
                        const render_attachment = render_slot.attachment_map[attachment_key];
                        if (render_attachment) {
                            const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                            const page = site && site.page;
                            const image_key = (page && page.name) || attachment.path || attachment.name || attachment_key;
                            const image = this.images[image_key];
                            render_attachment.drawDebugData(spine_pose, slot, attachment, image, site, page);
                        }
                    });
                    spine_pose.data.iterateBones(function (bone_key, bone) {
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
                    this.slot_map = {};
                }
            };
            RenderSlot = class RenderSlot {
                constructor() {
                    this.attachment_map = {};
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
                drawPose(spine_pose, slot, attachment, image, site, page) {
                    const render = this.render;
                    const ctx = this.render.ctx;
                    const bone = spine_pose.bones[slot.bone_key];
                    ctx.save();
                    ctxApplySpace(ctx, bone.world_space);
                    ctxApplySpace(ctx, attachment.local_space);
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctx.scale(attachment.width / 2, attachment.height / 2);
                    ctxDrawImageMesh(ctx, render.region_vertex_triangle, render.region_vertex_position, render.region_vertex_texcoord, image, site, page);
                    ctx.restore();
                }
                drawDebugPose(spine_pose, slot, attachment, image, site, page) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.bones[slot.bone_key];
                    ctx.save();
                    ctxApplySpace(ctx, bone.world_space);
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
                drawDebugData(spine_pose, slot, attachment, image, site, page) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.data.bones[slot.bone_key];
                    ctx.save();
                    ctxApplySpace(ctx, bone.world_space);
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
                drawPose(spine_pose, slot, attachment, image, site, page) {
                }
                drawDebugPose(spine_pose, slot, attachment, image, site, page) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.bones[slot.bone_key];
                    ctx.save();
                    ctxApplySpace(ctx, bone.world_space);
                    ctx.beginPath();
                    let x = 0;
                    attachment.vertices.forEach(function (value, index) {
                        if (index & 1) {
                            ctx.lineTo(x, value);
                        }
                        else {
                            x = value;
                        }
                    });
                    ctx.closePath();
                    ctx.strokeStyle = "yellow";
                    ctx.stroke();
                    ctx.restore();
                }
                drawDebugData(spine_pose, slot, attachment, image, site, page) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.data.bones[slot.bone_key];
                    ctx.save();
                    ctxApplySpace(ctx, bone.world_space);
                    ctx.beginPath();
                    let x = 0;
                    attachment.vertices.forEach(function (value, index) {
                        if (index & 1) {
                            ctx.lineTo(x, value);
                        }
                        else {
                            x = value;
                        }
                    });
                    ctx.closePath();
                    ctx.strokeStyle = "yellow";
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
                    const anim = spine_pose.data.anims[spine_pose.anim_key];
                    const ffd_timeline = anim && anim.ffd_timeline_map && anim.ffd_timeline_map[spine_pose.skin_key];
                    const ffd_slot = ffd_timeline && ffd_timeline.ffd_slots[slot_key];
                    const ffd_attachment = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
                    const ffd_keyframes = ffd_attachment && ffd_attachment.ffd_keyframes;
                    const ffd_keyframe0_index = Spine.Keyframe.find(ffd_keyframes, spine_pose.time);
                    const ffd_keyframe1_index = ffd_keyframe0_index + 1 || ffd_keyframe0_index;
                    const ffd_keyframe0 = ffd_keyframes && ffd_keyframes[ffd_keyframe0_index];
                    const ffd_keyframe1 = ffd_keyframes && ffd_keyframes[ffd_keyframe1_index] || ffd_keyframe0;
                    if (ffd_keyframe0) {
                        const ffd_weight = (ffd_keyframe0.time === ffd_keyframe1.time) ? 0 : ffd_keyframe0.curve.evaluate((spine_pose.time - ffd_keyframe0.time) / (ffd_keyframe1.time - ffd_keyframe0.time));
                        for (let index = 0; index < this.vertex_position.length; ++index) {
                            const v0 = ffd_keyframe0.vertices[index - ffd_keyframe0.offset] || 0;
                            const v1 = ffd_keyframe1.vertices[index - ffd_keyframe1.offset] || 0;
                            this.vertex_position[index] = attachment.vertices[index] + Spine.tween(v0, v1, ffd_weight);
                        }
                    }
                }
                drawPose(spine_pose, slot, attachment, image, site, page) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.bones[slot.bone_key];
                    ctx.save();
                    ctxApplySpace(ctx, bone.world_space);
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctxDrawImageMesh(ctx, this.vertex_triangle, this.vertex_position, this.vertex_texcoord, image, site, page);
                    ctx.restore();
                }
                drawDebugPose(spine_pose, slot, attachment, image, site, page) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.bones[slot.bone_key];
                    ctx.save();
                    ctxApplySpace(ctx, bone.world_space);
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctxDrawMesh(ctx, this.vertex_triangle, this.vertex_position, "rgba(127,127,127,1.0)", "rgba(127,127,127,0.25)");
                    ctx.restore();
                }
                drawDebugData(spine_pose, slot, attachment, image, site, page) {
                    const ctx = this.render.ctx;
                    const bone = spine_pose.data.bones[slot.bone_key];
                    ctx.save();
                    ctxApplySpace(ctx, bone.world_space);
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
                            const bone_key = spine_data.bone_keys[bone_index];
                            const bone = spine_data.bones[bone_key];
                            Spine.Space.transform(bone.world_space, position, position);
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
                    const anim = spine_pose.data.anims[spine_pose.anim_key];
                    const ffd_timeline = anim && anim.ffd_timeline_map && anim.ffd_timeline_map[spine_pose.skin_key];
                    const ffd_slot = ffd_timeline && ffd_timeline.ffd_slots[slot_key];
                    const ffd_attachment = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
                    const ffd_keyframes = ffd_attachment && ffd_attachment.ffd_keyframes;
                    const ffd_keyframe0_index = Spine.Keyframe.find(ffd_keyframes, spine_pose.time);
                    const ffd_keyframe1_index = ffd_keyframe0_index + 1 || ffd_keyframe0_index;
                    const ffd_keyframe0 = ffd_keyframes && ffd_keyframes[ffd_keyframe0_index];
                    const ffd_keyframe1 = ffd_keyframes && ffd_keyframes[ffd_keyframe1_index] || ffd_keyframe0;
                    if (ffd_keyframe0) {
                        const ffd_weight = (ffd_keyframe0.time === ffd_keyframe1.time) ? 0 : ffd_keyframe0.curve.evaluate((spine_pose.time - ffd_keyframe0.time) / (ffd_keyframe1.time - ffd_keyframe0.time));
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
                                const bone_key = spine_pose.bone_keys[bone_index];
                                const bone = spine_pose.bones[bone_key];
                                const x0 = ffd_keyframe0.vertices[ffd_index - ffd_keyframe0.offset] || 0;
                                const x1 = ffd_keyframe1.vertices[ffd_index - ffd_keyframe1.offset] || 0;
                                position.x += Spine.tween(x0, x1, ffd_weight);
                                ++ffd_index;
                                const y0 = ffd_keyframe0.vertices[ffd_index - ffd_keyframe0.offset] || 0;
                                const y1 = ffd_keyframe1.vertices[ffd_index - ffd_keyframe1.offset] || 0;
                                position.y += Spine.tween(y0, y1, ffd_weight);
                                ++ffd_index;
                                Spine.Space.transform(bone.world_space, position, position);
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
                                const bone_key = spine_pose.bone_keys[bone_index];
                                const bone = spine_pose.bones[bone_key];
                                Spine.Space.transform(bone.world_space, position, position);
                                blend_position_x += position.x * weight;
                                blend_position_y += position.y * weight;
                            }
                            let vertex_position_offset = vertex_index * 2;
                            vertex_blend_position[vertex_position_offset++] = blend_position_x;
                            vertex_blend_position[vertex_position_offset++] = blend_position_y;
                        }
                    }
                }
                drawPose(spine_pose, slot, attachment, image, site, page) {
                    const ctx = this.render.ctx;
                    ctx.save();
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctxDrawImageMesh(ctx, this.vertex_triangle, this.vertex_blend_position, this.vertex_texcoord, image, site, page);
                    ctx.restore();
                }
                drawDebugPose(spine_pose, slot, attachment, image, site, page) {
                    const ctx = this.render.ctx;
                    ctx.save();
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctxDrawMesh(ctx, this.vertex_triangle, this.vertex_blend_position, "rgba(127,127,127,1.0)", "rgba(127,127,127,0.25)");
                    ctx.restore();
                }
                drawDebugData(spine_pose, slot, attachment, image, site, page) {
                    const ctx = this.render.ctx;
                    ctx.save();
                    ctxApplyAtlasSitePosition(ctx, site);
                    ctxDrawMesh(ctx, this.vertex_triangle, this.vertex_setup_position, "rgba(127,127,127,1.0)", "rgba(127,127,127,0.25)");
                    ctx.restore();
                }
            };
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLWN0eDJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVuZGVyLWN0eDJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBMmVBLHVCQUF1QixHQUE2QixFQUFFLEtBQWtCO1FBQ3RFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDVixHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQyxDQUFDO0lBQ0gsQ0FBQztJQUVELG1DQUFtQyxHQUE2QixFQUFFLElBQXVCO1FBQ3ZGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVCxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDcEQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5RyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLENBQUM7SUFDSCxDQUFDO0lBRUQsdUJBQXVCLEdB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