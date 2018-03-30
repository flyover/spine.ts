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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLWN0eDJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVuZGVyLWN0eDJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBb2pCQSx1QkFBdUIsR0FBNkIsRUFBRSxLQUFrQjtRQUN0RSxJQUFJLEtBQUssRUFBRTtZQUNULEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDL0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3pDO0lBQ0gsQ0FBQztJQUVELG1DQUFtQyxHQUE2QixFQUFFLElBQXVCO1FBQ3ZGLElBQUksSUFBSSxFQUFFO1lBQ1IsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3BELEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzQjtJQUNILENBQUM7SUFFRCx1QkFBdUIsR0FBNkIsRUFBRSxRQUFnQixNQUFNLEVBQUUsUUFBZ0IsQ0FBQztRQUM3RixHQUFHLENB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