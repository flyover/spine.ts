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
    var Spine, render_webgl_1, RenderCtx2D, RenderSkin, RenderSlot, RenderRegionAttachment, RenderBoundingBoxAttachment, RenderMeshAttachment, RenderWeightedMeshAttachment, RenderPathAttachment;
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
                                case "path":
                                    render_slot.attachment_map[attachment_key] = new RenderPathAttachment(this).loadData(spine_data, attachment);
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
                    ctx.strokeStyle = "orange";
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
                    ctx.strokeStyle = "orange";
                    ctx.stroke();
                    ctx.restore();
                }
            };
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLWN0eDJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVuZGVyLWN0eDJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBb2lCQSx1QkFBdUIsR0FBNkIsRUFBRSxLQUFrQjtRQUN0RSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ1YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xELEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMvQixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsQ0FBQztJQUNILENBQUM7SUFFRCxtQ0FBbUMsR0FBNkIsRUFBRSxJQUF1QjtRQUN2RixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1QsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3BELEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixDQUFDO0lBQ0gsQ0FBQztJQUVELHVCQUF1QixH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