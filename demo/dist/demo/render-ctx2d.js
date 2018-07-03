System.register(["../spine", "./render-webgl"], function (exports_1, context_1) {
    "use strict";
    var Spine, render_webgl_1, RenderCtx2D, RenderSkin, RenderSlot, RenderRegionAttachment, RenderBoundingBoxAttachment, RenderMeshAttachment, RenderWeightedMeshAttachment, RenderPathAttachment;
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
        render_webgl_1.mat3x3Identity(site_texmatrix);
        image && render_webgl_1.mat3x3Scale(site_texmatrix, image.width, image.height);
        render_webgl_1.mat3x3ApplyAtlasPageTexcoord(site_texmatrix, page);
        render_webgl_1.mat3x3ApplyAtlasSiteTexcoord(site_texmatrix, site);
        // http://www.irrlicht3d.org/pivot/entry.php?id=1329
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
            function (render_webgl_1_1) {
                render_webgl_1 = render_webgl_1_1;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLWN0eDJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vcmVuZGVyLWN0eDJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFvakJBLHVCQUF1QixHQUE2QixFQUFFLEtBQWtCO1FBQ3RFLElBQUksS0FBSyxFQUFFO1lBQ1QsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xELEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMvQixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDekM7SUFDSCxDQUFDO0lBRUQsbUNBQW1DLEdBQTZCLEVBQUUsSUFBdUI7UUFDdkYsSUFBSSxJQUFJLEVBQUU7WUFDUixHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDcEQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5RyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNCO0lBQ0gsQ0FBQztJQUVELHVCQUF1QixHQUE2QixFQUFFLFFBQWdCLE1BQU0sRUFBRSxRQUFnQixDQUFDO1FBQzdG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