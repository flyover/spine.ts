System.register(['../spine.ts', './render-webgl.ts'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var spine, render_webgl_ts_1;
    var BoneInfo, SkinInfo, SlotInfo, AttachmentInfo, RegionAttachmentInfo, BoundingBoxAttachmentInfo, MeshAttachmentInfo, SkinnedMeshAttachmentInfo, RenderCtx2D;
    function ctxApplySpace(ctx, space) {
        if (space) {
            ctx.translate(space.position.x, space.position.y);
            ctx.rotate(space.rotation.rad * space.flip.x * space.flip.y);
            ctx.scale(space.scale.x * space.flip.x, space.scale.y * space.flip.y);
        }
    }
    function ctxApplyAtlasSitePosition(ctx, site) {
        if (site) {
            ctx.scale(1 / site.original_w, 1 / site.original_h);
            ctx.translate(2 * site.offset_x - (site.original_w - site.w), (site.original_h - site.h) - 2 * site.offset_y);
            ctx.scale(site.w, site.h);
        }
    }
    function ctxDrawCircle(ctx, color, scale) {
        if (color === void 0) { color = 'grey'; }
        if (scale === void 0) { scale = 1; }
        ctx.beginPath();
        ctx.arc(0, 0, 12 * scale, 0, 2 * Math.PI, false);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    function ctxDrawPoint(ctx, color, scale) {
        if (color === void 0) { color = 'blue'; }
        if (scale === void 0) { scale = 1; }
        ctx.beginPath();
        ctx.arc(0, 0, 12 * scale, 0, 2 * Math.PI, false);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(24 * scale, 0);
        ctx.strokeStyle = 'red';
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 24 * scale);
        ctx.strokeStyle = 'green';
        ctx.stroke();
    }
    function ctxDrawMesh(ctx, triangles, positions, stroke_style, fill_style) {
        if (stroke_style === void 0) { stroke_style = 'grey'; }
        if (fill_style === void 0) { fill_style = ''; }
        ctx.beginPath();
        for (var index = 0; index < triangles.length;) {
            var triangle0 = triangles[index++] * 2;
            var x0 = positions[triangle0];
            var y0 = positions[triangle0 + 1];
            var triangle1 = triangles[index++] * 2;
            var x1 = positions[triangle1];
            var y1 = positions[triangle1 + 1];
            var triangle2 = triangles[index++] * 2;
            var x2 = positions[triangle2];
            var y2 = positions[triangle2 + 1];
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
        var site_texmatrix = new Float32Array(9);
        var site_texcoord = new Float32Array(2);
        render_webgl_ts_1.mat3x3Identity(site_texmatrix);
        render_webgl_ts_1.mat3x3Scale(site_texmatrix, image.width, image.height);
        render_webgl_ts_1.mat3x3ApplyAtlasPageTexcoord(site_texmatrix, page);
        render_webgl_ts_1.mat3x3ApplyAtlasSiteTexcoord(site_texmatrix, site);
        // http://www.irrlicht3d.org/pivot/entry.php?id=1329
        for (var index = 0; index < triangles.length;) {
            var triangle0 = triangles[index++] * 2;
            var position0 = positions.subarray(triangle0, triangle0 + 2);
            var x0 = position0[0];
            var y0 = position0[1];
            var texcoord0 = render_webgl_ts_1.mat3x3Transform(site_texmatrix, texcoords.subarray(triangle0, triangle0 + 2), site_texcoord);
            var u0 = texcoord0[0];
            var v0 = texcoord0[1];
            var triangle1 = triangles[index++] * 2;
            var position1 = positions.subarray(triangle1, triangle1 + 2);
            var x1 = position1[0];
            var y1 = position1[1];
            var texcoord1 = render_webgl_ts_1.mat3x3Transform(site_texmatrix, texcoords.subarray(triangle1, triangle1 + 2), site_texcoord);
            var u1 = texcoord1[0];
            var v1 = texcoord1[1];
            var triangle2 = triangles[index++] * 2;
            var position2 = positions.subarray(triangle2, triangle2 + 2);
            var x2 = position2[0];
            var y2 = position2[1];
            var texcoord2 = render_webgl_ts_1.mat3x3Transform(site_texmatrix, texcoords.subarray(triangle2, triangle2 + 2), site_texcoord);
            var u2 = texcoord2[0];
            var v2 = texcoord2[1];
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
            var id = 1 / (u1 * v2 - u2 * v1);
            var a = id * (v2 * x1 - v1 * x2);
            var b = id * (v2 * y1 - v1 * y2);
            var c = id * (u1 * x2 - u2 * x1);
            var d = id * (u1 * y2 - u2 * y1);
            var e = x0 - (a * u0 + c * v0);
            var f = y0 - (b * u0 + d * v0);
            ctx.transform(a, b, c, d, e, f);
            ctx.drawImage(image, 0, 0);
            ctx.restore();
        }
    }
    function ctxDrawIkConstraints(ctx, data, bones) {
        data.ikc_keys.forEach(function (ikc_key) {
            var ikc = data.ikcs[ikc_key];
            var target = bones[ikc.target_key];
            switch (ikc.bone_keys.length) {
                case 1:
                    var bone = bones[ikc.bone_keys[0]];
                    ctx.beginPath();
                    ctx.moveTo(target.world_space.position.x, target.world_space.position.y);
                    ctx.lineTo(bone.world_space.position.x, bone.world_space.position.y);
                    ctx.strokeStyle = 'yellow';
                    ctx.stroke();
                    ctx.save();
                    ctxApplySpace(ctx, target.world_space);
                    ctxDrawCircle(ctx, 'yellow', 1.5);
                    ctx.restore();
                    ctx.save();
                    ctxApplySpace(ctx, bone.world_space);
                    ctxDrawCircle(ctx, 'yellow', 0.5);
                    ctx.restore();
                    break;
                case 2:
                    var parent_1 = bones[ikc.bone_keys[0]];
                    var child = bones[ikc.bone_keys[1]];
                    ctx.beginPath();
                    ctx.moveTo(target.world_space.position.x, target.world_space.position.y);
                    ctx.lineTo(child.world_space.position.x, child.world_space.position.y);
                    ctx.lineTo(parent_1.world_space.position.x, parent_1.world_space.position.y);
                    ctx.strokeStyle = 'yellow';
                    ctx.stroke();
                    ctx.save();
                    ctxApplySpace(ctx, target.world_space);
                    ctxDrawCircle(ctx, 'yellow', 1.5);
                    ctx.restore();
                    ctx.save();
                    ctxApplySpace(ctx, child.world_space);
                    ctxDrawCircle(ctx, 'yellow', 0.75);
                    ctx.restore();
                    ctx.save();
                    ctxApplySpace(ctx, parent_1.world_space);
                    ctxDrawCircle(ctx, 'yellow', 0.5);
                    ctx.restore();
                    break;
                default:
                    break;
            }
        });
    }
    return {
        setters:[
            function (spine_1) {
                spine = spine_1;
            },
            function (render_webgl_ts_1_1) {
                render_webgl_ts_1 = render_webgl_ts_1_1;
            }],
        execute: function() {
            BoneInfo = (function () {
                function BoneInfo() {
                }
                return BoneInfo;
            })();
            SkinInfo = (function () {
                function SkinInfo() {
                    this.slot_info_map = {};
                }
                return SkinInfo;
            })();
            SlotInfo = (function () {
                function SlotInfo() {
                    this.attachment_info_map = {};
                }
                return SlotInfo;
            })();
            AttachmentInfo = (function () {
                function AttachmentInfo(type) {
                    this.type = type;
                }
                return AttachmentInfo;
            })();
            RegionAttachmentInfo = (function (_super) {
                __extends(RegionAttachmentInfo, _super);
                function RegionAttachmentInfo() {
                    _super.call(this, 'region');
                }
                return RegionAttachmentInfo;
            })(AttachmentInfo);
            BoundingBoxAttachmentInfo = (function (_super) {
                __extends(BoundingBoxAttachmentInfo, _super);
                function BoundingBoxAttachmentInfo() {
                    _super.call(this, 'boundingbox');
                }
                return BoundingBoxAttachmentInfo;
            })(AttachmentInfo);
            MeshAttachmentInfo = (function (_super) {
                __extends(MeshAttachmentInfo, _super);
                function MeshAttachmentInfo() {
                    _super.call(this, 'mesh');
                }
                return MeshAttachmentInfo;
            })(AttachmentInfo);
            SkinnedMeshAttachmentInfo = (function (_super) {
                __extends(SkinnedMeshAttachmentInfo, _super);
                function SkinnedMeshAttachmentInfo() {
                    _super.call(this, 'skinnedmesh');
                }
                return SkinnedMeshAttachmentInfo;
            })(AttachmentInfo);
            RenderCtx2D = (function () {
                function RenderCtx2D(ctx) {
                    this.images = {};
                    this.skin_info_map = {};
                    this.region_vertex_position = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]); // [ x, y ]
                    this.region_vertex_texcoord = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]); // [ u, v ]
                    this.region_vertex_triangle = new Uint16Array([0, 1, 2, 0, 2, 3]); // [ i0, i1, i2 ]
                    this.ctx = ctx;
                }
                RenderCtx2D.prototype.dropData = function (spine_data, atlas_data) {
                    var render = this;
                    for (var image_key in render.images) {
                        delete render.images[image_key];
                    }
                    render.images = {};
                    render.skin_info_map = {};
                };
                RenderCtx2D.prototype.loadData = function (spine_data, atlas_data, images) {
                    var render = this;
                    spine_data.iterateSkins(function (skin_key, skin) {
                        var skin_info = render.skin_info_map[skin_key] = new SkinInfo();
                        skin.iterateAttachments(function (slot_key, skin_slot, attachment_key, attachment) {
                            if (!attachment) {
                                return;
                            }
                            var slot_info = skin_info.slot_info_map[slot_key] = skin_info.slot_info_map[slot_key] || new SlotInfo();
                            switch (attachment.type) {
                                case 'mesh': {
                                    var mesh_attachment = attachment;
                                    var mesh_attachment_info = slot_info.attachment_info_map[attachment_key] = new MeshAttachmentInfo();
                                    var vertex_count = mesh_attachment_info.vertex_count = mesh_attachment.vertices.length / 2;
                                    var vertex_position = mesh_attachment_info.vertex_position = new Float32Array(mesh_attachment.vertices);
                                    var vertex_texcoord = mesh_attachment_info.vertex_texcoord = new Float32Array(mesh_attachment.uvs);
                                    var vertex_triangle = mesh_attachment_info.vertex_triangle = new Uint16Array(mesh_attachment.triangles);
                                    break;
                                }
                                case 'skinnedmesh': {
                                    var skinned_mesh_attachment = attachment;
                                    var skinned_mesh_attachment_info = slot_info.attachment_info_map[attachment_key] = new SkinnedMeshAttachmentInfo();
                                    var vertex_count = skinned_mesh_attachment_info.vertex_count = skinned_mesh_attachment.uvs.length / 2;
                                    var vertex_setup_position = skinned_mesh_attachment_info.vertex_setup_position = new Float32Array(2 * vertex_count);
                                    var vertex_blend_position = skinned_mesh_attachment_info.vertex_blend_position = new Float32Array(2 * vertex_count);
                                    var vertex_texcoord = skinned_mesh_attachment_info.vertex_texcoord = new Float32Array(skinned_mesh_attachment.uvs);
                                    var vertex_triangle = skinned_mesh_attachment_info.vertex_triangle = new Uint16Array(skinned_mesh_attachment.triangles);
                                    var position = new spine.Vector();
                                    for (var vertex_index = 0, index = 0; vertex_index < vertex_count; ++vertex_index) {
                                        var blender_count = skinned_mesh_attachment.vertices[index++];
                                        var setup_position_x = 0;
                                        var setup_position_y = 0;
                                        for (var blender_index = 0; blender_index < blender_count; ++blender_index) {
                                            var bone_index = skinned_mesh_attachment.vertices[index++];
                                            var x = position.x = skinned_mesh_attachment.vertices[index++];
                                            var y = position.y = skinned_mesh_attachment.vertices[index++];
                                            var weight = skinned_mesh_attachment.vertices[index++];
                                            var bone_key = spine_data.bone_keys[bone_index];
                                            var bone = spine_data.bones[bone_key];
                                            spine.Space.transform(bone.world_space, position, position);
                                            setup_position_x += position.x * weight;
                                            setup_position_y += position.y * weight;
                                        }
                                        var vertex_setup_position_offset = vertex_index * 2;
                                        vertex_setup_position[vertex_setup_position_offset++] = setup_position_x;
                                        vertex_setup_position[vertex_setup_position_offset++] = setup_position_y;
                                    }
                                    vertex_blend_position.set(vertex_setup_position);
                                    break;
                                }
                                default:
                                    break;
                            }
                        });
                    });
                    render.images = images;
                };
                RenderCtx2D.prototype.updatePose = function (spine_pose, atlas_data) {
                    var render = this;
                    spine_pose.iterateAttachments(function (slot_key, slot, skin_slot, attachment_key, attachment) {
                        if (!attachment) {
                            return;
                        }
                        var skin_info = render.skin_info_map[spine_pose.skin_key];
                        var default_skin_info = render.skin_info_map['default'];
                        var slot_info = skin_info.slot_info_map[slot_key] || default_skin_info.slot_info_map[slot_key];
                        switch (attachment.type) {
                            case 'mesh': {
                                var mesh_attachment = attachment;
                                var mesh_attachment_info = slot_info.attachment_info_map[attachment_key];
                                var anim = spine_pose.data.anims[spine_pose.anim_key];
                                var anim_ffd = anim && anim.ffds && anim.ffds[spine_pose.skin_key];
                                var ffd_slot = anim_ffd && anim_ffd.ffd_slots[slot_key];
                                var ffd_attachment = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
                                var ffd_keyframes = ffd_attachment && ffd_attachment.ffd_keyframes;
                                var ffd_keyframe_index = spine.Keyframe.find(ffd_keyframes, spine_pose.time);
                                if (ffd_keyframe_index !== -1) {
                                    // ffd
                                    var pct = 0;
                                    var ffd_keyframe0 = ffd_keyframes[ffd_keyframe_index];
                                    var ffd_keyframe1 = ffd_keyframes[ffd_keyframe_index + 1];
                                    if (ffd_keyframe1) {
                                        pct = ffd_keyframe0.curve.evaluate((spine_pose.time - ffd_keyframe0.time) / (ffd_keyframe1.time - ffd_keyframe0.time));
                                    }
                                    else {
                                        ffd_keyframe1 = ffd_keyframe0;
                                    }
                                    for (var index = 0; index < mesh_attachment_info.vertex_position.length; ++index) {
                                        var v0 = ffd_keyframe0.vertices[index - ffd_keyframe0.offset] || 0;
                                        var v1 = ffd_keyframe1.vertices[index - ffd_keyframe1.offset] || 0;
                                        mesh_attachment_info.vertex_position[index] = mesh_attachment.vertices[index] + spine.tween(v0, v1, pct);
                                    }
                                }
                                break;
                            }
                            case 'skinnedmesh': {
                                var skinned_mesh_attachment = attachment;
                                var skinned_mesh_attachment_info = slot_info.attachment_info_map[attachment_key];
                                var anim = spine_pose.data.anims[spine_pose.anim_key];
                                var anim_ffd = anim && anim.ffds && anim.ffds[spine_pose.skin_key];
                                var ffd_slot = anim_ffd && anim_ffd.ffd_slots[slot_key];
                                var ffd_attachment = ffd_slot && ffd_slot.ffd_attachments[attachment_key];
                                var ffd_keyframes = ffd_attachment && ffd_attachment.ffd_keyframes;
                                var ffd_keyframe_index = spine.Keyframe.find(ffd_keyframes, spine_pose.time);
                                if (ffd_keyframe_index !== -1) {
                                    // ffd
                                    var pct = 0;
                                    var ffd_keyframe0 = ffd_keyframes[ffd_keyframe_index];
                                    var ffd_keyframe1 = ffd_keyframes[ffd_keyframe_index + 1];
                                    if (ffd_keyframe1) {
                                        pct = ffd_keyframe0.curve.evaluate((spine_pose.time - ffd_keyframe0.time) / (ffd_keyframe1.time - ffd_keyframe0.time));
                                    }
                                    else {
                                        ffd_keyframe1 = ffd_keyframe0;
                                    }
                                    var vertex_blend_position = skinned_mesh_attachment_info.vertex_blend_position;
                                    var position = new spine.Vector();
                                    for (var vertex_index = 0, index = 0, ffd_index = 0; vertex_index < skinned_mesh_attachment_info.vertex_count; ++vertex_index) {
                                        var blender_count = skinned_mesh_attachment.vertices[index++];
                                        var blend_position_x = 0;
                                        var blend_position_y = 0;
                                        for (var blender_index = 0; blender_index < blender_count; ++blender_index) {
                                            var bone_index = skinned_mesh_attachment.vertices[index++];
                                            position.x = skinned_mesh_attachment.vertices[index++];
                                            position.y = skinned_mesh_attachment.vertices[index++];
                                            var weight = skinned_mesh_attachment.vertices[index++];
                                            var bone_key = spine_pose.bone_keys[bone_index];
                                            var bone = spine_pose.bones[bone_key];
                                            var x0 = ffd_keyframe0.vertices[ffd_index - ffd_keyframe0.offset] || 0;
                                            var x1 = ffd_keyframe1.vertices[ffd_index - ffd_keyframe1.offset] || 0;
                                            position.x += spine.tween(x0, x1, pct);
                                            ++ffd_index;
                                            var y0 = ffd_keyframe0.vertices[ffd_index - ffd_keyframe0.offset] || 0;
                                            var y1 = ffd_keyframe1.vertices[ffd_index - ffd_keyframe1.offset] || 0;
                                            position.y += spine.tween(y0, y1, pct);
                                            ++ffd_index;
                                            spine.Space.transform(bone.world_space, position, position);
                                            blend_position_x += position.x * weight;
                                            blend_position_y += position.y * weight;
                                        }
                                        var vertex_position_offset = vertex_index * 2;
                                        vertex_blend_position[vertex_position_offset++] = blend_position_x;
                                        vertex_blend_position[vertex_position_offset++] = blend_position_y;
                                    }
                                }
                                else {
                                    // no ffd
                                    var vertex_blend_position = skinned_mesh_attachment_info.vertex_blend_position;
                                    var position = new spine.Vector();
                                    for (var vertex_index = 0, index = 0; vertex_index < skinned_mesh_attachment_info.vertex_count; ++vertex_index) {
                                        var blender_count = skinned_mesh_attachment.vertices[index++];
                                        var blend_position_x = 0;
                                        var blend_position_y = 0;
                                        for (var blender_index = 0; blender_index < blender_count; ++blender_index) {
                                            var bone_index = skinned_mesh_attachment.vertices[index++];
                                            position.x = skinned_mesh_attachment.vertices[index++];
                                            position.y = skinned_mesh_attachment.vertices[index++];
                                            var weight = skinned_mesh_attachment.vertices[index++];
                                            var bone_key = spine_pose.bone_keys[bone_index];
                                            var bone = spine_pose.bones[bone_key];
                                            spine.Space.transform(bone.world_space, position, position);
                                            blend_position_x += position.x * weight;
                                            blend_position_y += position.y * weight;
                                        }
                                        var vertex_position_offset = vertex_index * 2;
                                        vertex_blend_position[vertex_position_offset++] = blend_position_x;
                                        vertex_blend_position[vertex_position_offset++] = blend_position_y;
                                    }
                                }
                                break;
                            }
                            default:
                                break;
                        }
                    });
                };
                RenderCtx2D.prototype.drawPose = function (spine_pose, atlas_data) {
                    var render = this;
                    var ctx = render.ctx;
                    render.updatePose(spine_pose, atlas_data);
                    spine_pose.iterateAttachments(function (slot_key, slot, skin_slot, attachment_key, attachment) {
                        if (!attachment) {
                            return;
                        }
                        if (attachment.type === 'boundingbox') {
                            return;
                        }
                        var site = atlas_data && atlas_data.sites[attachment_key];
                        var page = site && site.page;
                        var image_key = (page && page.name) || attachment_key;
                        var image = render.images[image_key];
                        if (!image || !image.complete) {
                            return;
                        }
                        ctx.save();
                        // slot.color.rgb
                        ctx.globalAlpha *= slot.color.a;
                        switch (slot.blend) {
                            default:
                            case 'normal':
                                ctx.globalCompositeOperation = 'source-over';
                                break;
                            case 'additive':
                                ctx.globalCompositeOperation = 'lighter';
                                break;
                            case 'multiply':
                                ctx.globalCompositeOperation = 'multiply';
                                break;
                            case 'screen':
                                ctx.globalCompositeOperation = 'screen';
                                break;
                        }
                        var skin_info = render.skin_info_map[spine_pose.skin_key];
                        var default_skin_info = render.skin_info_map['default'];
                        var slot_info = skin_info.slot_info_map[slot_key] || default_skin_info.slot_info_map[slot_key];
                        switch (attachment.type) {
                            case 'region': {
                                var bone = spine_pose.bones[slot.bone_key];
                                var region_attachment = attachment;
                                var region_attachment_info = slot_info.attachment_info_map[attachment_key];
                                ctxApplySpace(ctx, bone.world_space);
                                ctxApplySpace(ctx, region_attachment.local_space);
                                ctxApplyAtlasSitePosition(ctx, site);
                                ctx.scale(region_attachment.width / 2, region_attachment.height / 2);
                                ctxDrawImageMesh(ctx, render.region_vertex_triangle, render.region_vertex_position, render.region_vertex_texcoord, image, site, page);
                                break;
                            }
                            case 'mesh': {
                                var bone = spine_pose.bones[slot.bone_key];
                                var mesh_attachment = attachment;
                                var mesh_attachment_info = slot_info.attachment_info_map[attachment_key];
                                ctxApplySpace(ctx, bone.world_space);
                                ctxApplyAtlasSitePosition(ctx, site);
                                ctxDrawImageMesh(ctx, mesh_attachment_info.vertex_triangle, mesh_attachment_info.vertex_position, mesh_attachment_info.vertex_texcoord, image, site, page);
                                break;
                            }
                            case 'skinnedmesh': {
                                var skinned_mesh_attachment = attachment;
                                var skinned_mesh_attachment_info = slot_info.attachment_info_map[attachment_key];
                                ctxApplyAtlasSitePosition(ctx, site);
                                ctxDrawImageMesh(ctx, skinned_mesh_attachment_info.vertex_triangle, skinned_mesh_attachment_info.vertex_blend_position, skinned_mesh_attachment_info.vertex_texcoord, image, site, page);
                                break;
                            }
                            default:
                                break;
                        }
                        ctx.restore();
                    });
                };
                RenderCtx2D.prototype.drawDebugPose = function (spine_pose, atlas_data) {
                    var render = this;
                    var ctx = render.ctx;
                    render.updatePose(spine_pose, atlas_data);
                    spine_pose.iterateAttachments(function (slot_key, slot, skin_slot, attachment_key, attachment) {
                        if (!attachment) {
                            return;
                        }
                        ctx.save();
                        var skin_info = render.skin_info_map[spine_pose.skin_key];
                        var default_skin_info = render.skin_info_map['default'];
                        var slot_info = skin_info.slot_info_map[slot_key] || default_skin_info.slot_info_map[slot_key];
                        switch (attachment.type) {
                            case 'region': {
                                var bone = spine_pose.bones[slot.bone_key];
                                var site = atlas_data && atlas_data.sites[attachment_key];
                                var region_attachment = attachment;
                                var region_attachment_info = slot_info.attachment_info_map[attachment_key];
                                ctxApplySpace(ctx, bone.world_space);
                                ctxApplySpace(ctx, region_attachment.local_space);
                                ctxApplyAtlasSitePosition(ctx, site);
                                ctx.beginPath();
                                ctx.rect(-region_attachment.width / 2, -region_attachment.height / 2, region_attachment.width, region_attachment.height);
                                ctx.fillStyle = 'rgba(127,127,127,0.25)';
                                ctx.fill();
                                ctx.strokeStyle = 'rgba(127,127,127,1.0)';
                                ctx.stroke();
                                break;
                            }
                            case 'boundingbox': {
                                var bone = spine_pose.bones[slot.bone_key];
                                var bounding_box_attachment = attachment;
                                var bounding_box_attachment_info = slot_info.attachment_info_map[attachment_key];
                                ctxApplySpace(ctx, bone.world_space);
                                ctx.beginPath();
                                var x = 0;
                                bounding_box_attachment.vertices.forEach(function (value, index) {
                                    if (index & 1) {
                                        ctx.lineTo(x, value);
                                    }
                                    else {
                                        x = value;
                                    }
                                });
                                ctx.closePath();
                                ctx.strokeStyle = 'yellow';
                                ctx.stroke();
                                break;
                            }
                            case 'mesh': {
                                var bone = spine_pose.bones[slot.bone_key];
                                var site = atlas_data && atlas_data.sites[attachment_key];
                                var mesh_attachment = attachment;
                                var mesh_attachment_info = slot_info.attachment_info_map[attachment_key];
                                ctxApplySpace(ctx, bone.world_space);
                                ctxApplyAtlasSitePosition(ctx, site);
                                ctxDrawMesh(ctx, mesh_attachment_info.vertex_triangle, mesh_attachment_info.vertex_position, 'rgba(127,127,127,1.0)', 'rgba(127,127,127,0.25)');
                                break;
                            }
                            case 'skinnedmesh': {
                                var site = atlas_data && atlas_data.sites[attachment_key];
                                var skinned_mesh_attachment = attachment;
                                var skinned_mesh_attachment_info = slot_info.attachment_info_map[attachment_key];
                                ctxApplyAtlasSitePosition(ctx, site);
                                ctxDrawMesh(ctx, skinned_mesh_attachment_info.vertex_triangle, skinned_mesh_attachment_info.vertex_blend_position, 'rgba(127,127,127,1.0)', 'rgba(127,127,127,0.25)');
                                break;
                            }
                            default:
                                break;
                        }
                        ctx.restore();
                    });
                    spine_pose.iterateBones(function (bone_key, bone) {
                        ctx.save();
                        ctxApplySpace(ctx, bone.world_space);
                        ctxDrawPoint(ctx);
                        ctx.restore();
                    });
                    ctxDrawIkConstraints(ctx, spine_pose.data, spine_pose.bones);
                };
                RenderCtx2D.prototype.drawDebugData = function (spine_pose, atlas_data) {
                    var render = this;
                    var ctx = render.ctx;
                    spine_pose.data.iterateAttachments(spine_pose.skin_key, function (slot_key, slot, skin_slot, attachment_key, attachment) {
                        if (!attachment) {
                            return;
                        }
                        ctx.save();
                        var skin_info = render.skin_info_map[spine_pose.skin_key];
                        var default_skin_info = render.skin_info_map['default'];
                        var slot_info = skin_info.slot_info_map[slot_key] || default_skin_info.slot_info_map[slot_key];
                        switch (attachment.type) {
                            case 'region': {
                                var bone = spine_pose.data.bones[slot.bone_key];
                                var site = atlas_data && atlas_data.sites[attachment_key];
                                var region_attachment = attachment;
                                var region_attachment_info = slot_info.attachment_info_map[attachment_key];
                                ctxApplySpace(ctx, bone.world_space);
                                ctxApplySpace(ctx, region_attachment.local_space);
                                ctxApplyAtlasSitePosition(ctx, site);
                                ctx.beginPath();
                                ctx.rect(-region_attachment.width / 2, -region_attachment.height / 2, region_attachment.width, region_attachment.height);
                                ctx.fillStyle = 'rgba(127,127,127,0.25)';
                                ctx.fill();
                                ctx.strokeStyle = 'rgba(127,127,127,1.0)';
                                ctx.stroke();
                                break;
                            }
                            case 'boundingbox': {
                                var bone = spine_pose.data.bones[slot.bone_key];
                                var bounding_box_attachment = attachment;
                                var bounding_box_attachment_info = slot_info.attachment_info_map[attachment_key];
                                ctxApplySpace(ctx, bone.world_space);
                                ctx.beginPath();
                                var x = 0;
                                bounding_box_attachment.vertices.forEach(function (value, index) {
                                    if (index & 1) {
                                        ctx.lineTo(x, value);
                                    }
                                    else {
                                        x = value;
                                    }
                                });
                                ctx.closePath();
                                ctx.strokeStyle = 'yellow';
                                ctx.stroke();
                                break;
                            }
                            case 'mesh': {
                                var bone = spine_pose.data.bones[slot.bone_key];
                                var site = atlas_data && atlas_data.sites[attachment_key];
                                var mesh_attachment = attachment;
                                var mesh_attachment_info = slot_info.attachment_info_map[attachment_key];
                                ctxApplySpace(ctx, bone.world_space);
                                ctxApplyAtlasSitePosition(ctx, site);
                                ctxDrawMesh(ctx, mesh_attachment_info.vertex_triangle, mesh_attachment_info.vertex_position, 'rgba(127,127,127,1.0)', 'rgba(127,127,127,0.25)');
                                break;
                            }
                            case 'skinnedmesh': {
                                var site = atlas_data && atlas_data.sites[attachment_key];
                                var skinned_mesh_attachment = attachment;
                                var skinned_mesh_attachment_info = slot_info.attachment_info_map[attachment_key];
                                ctxApplyAtlasSitePosition(ctx, site);
                                ctxDrawMesh(ctx, skinned_mesh_attachment_info.vertex_triangle, skinned_mesh_attachment_info.vertex_setup_position, 'rgba(127,127,127,1.0)', 'rgba(127,127,127,0.25)');
                                break;
                            }
                            default:
                                break;
                        }
                        ctx.restore();
                    });
                    spine_pose.data.iterateBones(function (bone_key, bone) {
                        ctx.save();
                        ctxApplySpace(ctx, bone.world_space);
                        ctxDrawPoint(ctx);
                        ctx.restore();
                    });
                    ctxDrawIkConstraints(ctx, spine_pose.data, spine_pose.data.bones);
                };
                return RenderCtx2D;
            })();
            exports_1("RenderCtx2D", RenderCtx2D);
        }
    }
});
