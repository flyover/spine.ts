System.register(["../spine"], function (exports_1, context_1) {
    "use strict";
    var Spine, RenderWebGL, RenderBone, RenderSkin, RenderSlot, RenderRegionAttachment, RenderMeshAttachment, RenderWeightedMeshAttachment, Blender, RenderFfdAttachment, RenderFfdKeyframe, RenderShader, RenderVertex, RenderTexture;
    var __moduleName = context_1 && context_1.id;
    function repeat(format, count) {
        const array = [];
        for (let index = 0; index < count; ++index) {
            array.push(format.replace(/{index}/g, index.toString()));
        }
        return array;
    }
    function flatten(array, out = []) {
        array.forEach((value) => {
            if (Array.isArray(value)) {
                flatten(value, out);
            }
            else {
                out.push(value);
            }
        });
        return out;
    }
    function vec4Identity(v) {
        v[0] = v[1] = v[2] = v[3] = 1.0;
        return v;
    }
    exports_1("vec4Identity", vec4Identity);
    function vec4CopyColor(v, color) {
        v[0] = color.r;
        v[1] = color.g;
        v[2] = color.b;
        v[3] = color.a;
        return v;
    }
    exports_1("vec4CopyColor", vec4CopyColor);
    function vec4ApplyColor(v, color) {
        v[0] *= color.r;
        v[1] *= color.g;
        v[2] *= color.b;
        v[3] *= color.a;
        return v;
    }
    exports_1("vec4ApplyColor", vec4ApplyColor);
    function mat3x3Identity(m) {
        m[1] = m[2] = m[3] =
            m[5] = m[6] = m[7] = 0.0;
        m[0] = m[4] = m[8] = 1.0;
        return m;
    }
    exports_1("mat3x3Identity", mat3x3Identity);
    function mat3x3Copy(m, other) {
        m.set(other);
        return m;
    }
    exports_1("mat3x3Copy", mat3x3Copy);
    function mat3x3Ortho(m, l, r, b, t) {
        const lr = 1 / (l - r);
        const bt = 1 / (b - t);
        m[0] *= -2 * lr;
        m[4] *= -2 * bt;
        m[6] += (l + r) * lr;
        m[7] += (t + b) * bt;
        return m;
    }
    exports_1("mat3x3Ortho", mat3x3Ortho);
    function mat3x3Translate(m, x, y) {
        m[6] += m[0] * x + m[3] * y;
        m[7] += m[1] * x + m[4] * y;
        return m;
    }
    exports_1("mat3x3Translate", mat3x3Translate);
    function mat3x3RotateCosSin(m, c, s) {
        const m0 = m[0];
        const m1 = m[1];
        const m3 = m[3];
        const m4 = m[4];
        m[0] = m0 * c + m3 * s;
        m[1] = m1 * c + m4 * s;
        m[3] = m3 * c - m0 * s;
        m[4] = m4 * c - m1 * s;
        return m;
    }
    exports_1("mat3x3RotateCosSin", mat3x3RotateCosSin);
    function mat3x3Rotate(m, angle) {
        return mat3x3RotateCosSin(m, Math.cos(angle), Math.sin(angle));
    }
    exports_1("mat3x3Rotate", mat3x3Rotate);
    function mat3x3Scale(m, x, y) {
        m[0] *= x;
        m[1] *= x;
        m[2] *= x;
        m[3] *= y;
        m[4] *= y;
        m[5] *= y;
        return m;
    }
    exports_1("mat3x3Scale", mat3x3Scale);
    function mat3x3Transform(m, v, out) {
        const x = m[0] * v[0] + m[3] * v[1] + m[6];
        const y = m[1] * v[0] + m[4] * v[1] + m[7];
        const w = m[2] * v[0] + m[5] * v[1] + m[8];
        const iw = (w) ? (1 / w) : (1);
        out[0] = x * iw;
        out[1] = y * iw;
        return out;
    }
    exports_1("mat3x3Transform", mat3x3Transform);
    function mat3x3ApplySpace(m, space) {
        if (space) {
            mat3x3Translate(m, space.position.x, space.position.y);
            mat3x3Rotate(m, space.rotation.rad);
            mat3x3Scale(m, space.scale.x, space.scale.y);
        }
        return m;
    }
    exports_1("mat3x3ApplySpace", mat3x3ApplySpace);
    function mat3x3ApplyAtlasPageTexcoord(m, page) {
        if (page) {
            mat3x3Scale(m, 1 / page.w, 1 / page.h);
        }
        return m;
    }
    exports_1("mat3x3ApplyAtlasPageTexcoord", mat3x3ApplyAtlasPageTexcoord);
    function mat3x3ApplyAtlasSiteTexcoord(m, site) {
        if (site) {
            mat3x3Translate(m, site.x, site.y);
            if (site.rotate === -1) {
                mat3x3Translate(m, 0, site.w); // bottom-left corner
                mat3x3RotateCosSin(m, 0, -1); // -90 degrees
            }
            else if (site.rotate === 1) {
                mat3x3Translate(m, site.h, 0); // top-right corner
                mat3x3RotateCosSin(m, 0, 1); // 90 degrees
            }
            mat3x3Scale(m, site.w, site.h);
        }
        return m;
    }
    exports_1("mat3x3ApplyAtlasSiteTexcoord", mat3x3ApplyAtlasSiteTexcoord);
    function mat3x3ApplyAtlasSitePosition(m, site) {
        if (site) {
            mat3x3Scale(m, 1 / site.original_w, 1 / site.original_h);
            mat3x3Translate(m, 2 * site.offset_x - (site.original_w - site.w), (site.original_h - site.h) - 2 * site.offset_y);
            mat3x3Scale(m, site.w, site.h);
        }
        return m;
    }
    exports_1("mat3x3ApplyAtlasSitePosition", mat3x3ApplyAtlasSitePosition);
    function mat4x4Identity(m) {
        m[1] = m[2] = m[3] = m[4] =
            m[6] = m[7] = m[8] = m[9] =
                m[11] = m[12] = m[13] = m[14] = 0.0;
        m[0] = m[5] = m[10] = m[15] = 1.0;
        return m;
    }
    exports_1("mat4x4Identity", mat4x4Identity);
    function mat4x4Copy(m, other) {
        m.set(other);
        return m;
    }
    exports_1("mat4x4Copy", mat4x4Copy);
    function mat4x4Ortho(m, l, r, b, t, n, f) {
        const lr = 1 / (l - r);
        const bt = 1 / (b - t);
        const nf = 1 / (n - f);
        m[0] = -2 * lr;
        m[5] = -2 * bt;
        m[10] = 2 * nf;
        m[12] = (l + r) * lr;
        m[13] = (t + b) * bt;
        m[14] = (f + n) * nf;
        return m;
    }
    exports_1("mat4x4Ortho", mat4x4Ortho);
    function mat4x4Translate(m, x, y, z = 0) {
        m[12] += m[0] * x + m[4] * y + m[8] * z;
        m[13] += m[1] * x + m[5] * y + m[9] * z;
        m[14] += m[2] * x + m[6] * y + m[10] * z;
        m[15] += m[3] * x + m[7] * y + m[11] * z;
        return m;
    }
    exports_1("mat4x4Translate", mat4x4Translate);
    function mat4x4RotateCosSinZ(m, c, s) {
        const a_x = m[0];
        const a_y = m[1];
        const a_z = m[2];
        const a_w = m[3];
        const b_x = m[4];
        const b_y = m[5];
        const b_z = m[6];
        const b_w = m[7];
        m[0] = a_x * c + b_x * s;
        m[1] = a_y * c + b_y * s;
        m[2] = a_z * c + b_z * s;
        m[3] = a_w * c + b_w * s;
        m[4] = b_x * c - a_x * s;
        m[5] = b_y * c - a_y * s;
        m[6] = b_z * c - a_z * s;
        m[7] = b_w * c - a_w * s;
        return m;
    }
    exports_1("mat4x4RotateCosSinZ", mat4x4RotateCosSinZ);
    function mat4x4RotateZ(m, angle) {
        return mat4x4RotateCosSinZ(m, Math.cos(angle), Math.sin(angle));
    }
    exports_1("mat4x4RotateZ", mat4x4RotateZ);
    function mat4x4Scale(m, x, y, z = 1) {
        m[0] *= x;
        m[1] *= x;
        m[2] *= x;
        m[3] *= x;
        m[4] *= y;
        m[5] *= y;
        m[6] *= y;
        m[7] *= y;
        m[8] *= z;
        m[9] *= z;
        m[10] *= z;
        m[11] *= z;
        return m;
    }
    exports_1("mat4x4Scale", mat4x4Scale);
    function mat4x4ApplySpace(m, space) {
        if (space) {
            mat4x4Translate(m, space.position.x, space.position.y);
            mat4x4RotateZ(m, space.rotation.rad);
            mat4x4Scale(m, space.scale.x, space.scale.y);
        }
        return m;
    }
    exports_1("mat4x4ApplySpace", mat4x4ApplySpace);
    function mat4x4ApplyAtlasPageTexcoord(m, page) {
        if (page) {
            mat4x4Scale(m, 1 / page.w, 1 / page.h);
        }
        return m;
    }
    exports_1("mat4x4ApplyAtlasPageTexcoord", mat4x4ApplyAtlasPageTexcoord);
    function mat4x4ApplyAtlasSiteTexcoord(m, site) {
        if (site) {
            mat4x4Translate(m, site.x, site.y);
            if (site.rotate === -1) {
                mat4x4Translate(m, 0, site.w); // bottom-left corner
                mat4x4RotateCosSinZ(m, 0, -1); // -90 degrees
            }
            else if (site.rotate === 1) {
                mat4x4Translate(m, site.h, 0); // top-right corner
                mat4x4RotateCosSinZ(m, 0, 1); // 90 degrees
            }
            mat4x4Scale(m, site.w, site.h);
        }
        return m;
    }
    exports_1("mat4x4ApplyAtlasSiteTexcoord", mat4x4ApplyAtlasSiteTexcoord);
    function mat4x4ApplyAtlasSitePosition(m, site) {
        if (site) {
            mat4x4Scale(m, 1 / site.original_w, 1 / site.original_h);
            mat4x4Translate(m, 2 * site.offset_x - (site.original_w - site.w), (site.original_h - site.h) - 2 * site.offset_y);
            mat4x4Scale(m, site.w, site.h);
        }
        return m;
    }
    exports_1("mat4x4ApplyAtlasSitePosition", mat4x4ApplyAtlasSitePosition);
    function glCompileShader(gl, src, type) {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, src.join("\n"));
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            src.forEach((line, index) => { console.log(index + 1, line); });
            console.log(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            shader = null;
        }
        return shader;
    }
    exports_1("glCompileShader", glCompileShader);
    function glLinkProgram(gl, vs, fs) {
        let program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log("could not link shader program");
            gl.detachShader(program, vs);
            gl.detachShader(program, fs);
            gl.deleteProgram(program);
            program = null;
        }
        return program;
    }
    exports_1("glLinkProgram", glLinkProgram);
    function glGetUniforms(gl, program, uniforms = new Map()) {
        const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let index = 0; index < count; ++index) {
            const uniform = gl.getActiveUniform(program, index);
            if (!uniform)
                continue;
            const uniform_location = gl.getUniformLocation(program, uniform.name);
            if (!uniform_location)
                continue;
            uniforms.set(uniform.name, uniform_location);
        }
        return uniforms;
    }
    exports_1("glGetUniforms", glGetUniforms);
    function glGetAttribs(gl, program, attribs = new Map()) {
        const count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (let index = 0; index < count; ++index) {
            const attrib = gl.getActiveAttrib(program, index);
            if (!attrib)
                continue;
            attribs.set(attrib.name, gl.getAttribLocation(program, attrib.name));
        }
        return attribs;
    }
    exports_1("glGetAttribs", glGetAttribs);
    function glMakeShader(gl, vs_src, fs_src) {
        const shader = new RenderShader();
        const header = [
            "precision mediump int;",
            "precision mediump float;"
        ];
        shader.vs_src = header.concat(flatten(vs_src));
        shader.fs_src = header.concat(flatten(fs_src));
        shader.vs = glCompileShader(gl, shader.vs_src, gl.VERTEX_SHADER);
        shader.fs = glCompileShader(gl, shader.fs_src, gl.FRAGMENT_SHADER);
        shader.program = glLinkProgram(gl, shader.vs, shader.fs);
        shader.uniforms = glGetUniforms(gl, shader.program);
        shader.attribs = glGetAttribs(gl, shader.program);
        return shader;
    }
    exports_1("glMakeShader", glMakeShader);
    function glDropShader(gl, shader) {
        if (shader.program === gl.getParameter(gl.CURRENT_PROGRAM)) {
            glResetAttributes(gl, shader);
            gl.useProgram(null);
        }
        gl.deleteProgram(shader.program);
        shader.program = null;
    }
    exports_1("glDropShader", glDropShader);
    function glMakeVertex(gl, typed_array, size, buffer_type, buffer_draw) {
        const vertex = new RenderVertex();
        if (typed_array instanceof Float32Array) {
            vertex.type = gl.FLOAT;
        }
        else if (typed_array instanceof Int8Array) {
            vertex.type = gl.BYTE;
        }
        else if (typed_array instanceof Uint8Array) {
            vertex.type = gl.UNSIGNED_BYTE;
        }
        else if (typed_array instanceof Int16Array) {
            vertex.type = gl.SHORT;
        }
        else if (typed_array instanceof Uint16Array) {
            vertex.type = gl.UNSIGNED_SHORT;
        }
        else if (typed_array instanceof Int32Array) {
            vertex.type = gl.INT;
        }
        else if (typed_array instanceof Uint32Array) {
            vertex.type = gl.UNSIGNED_INT;
        }
        else {
            vertex.type = gl.NONE;
            throw new Error();
        }
        vertex.size = size;
        vertex.count = typed_array.length / vertex.size;
        vertex.typed_array = typed_array;
        vertex.buffer = gl.createBuffer();
        vertex.buffer_type = buffer_type;
        vertex.buffer_draw = buffer_draw;
        gl.bindBuffer(vertex.buffer_type, vertex.buffer);
        gl.bufferData(vertex.buffer_type, vertex.typed_array, vertex.buffer_draw);
        return vertex;
    }
    exports_1("glMakeVertex", glMakeVertex);
    function glDropVertex(gl, vertex) {
        if (vertex.buffer === gl.getParameter(gl.ARRAY_BUFFER_BINDING)) {
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
        gl.deleteBuffer(vertex.buffer);
        vertex.buffer = null;
    }
    exports_1("glDropVertex", glDropVertex);
    function glMakeTexture(gl, image, min_filter, mag_filter, wrap_s, wrap_t) {
        const texture = new RenderTexture();
        texture.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);
        if (image) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min_filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag_filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_s);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_t);
        return texture;
    }
    exports_1("glMakeTexture", glMakeTexture);
    function glDropTexture(gl, texture) {
        if (texture.texture === gl.getParameter(gl.TEXTURE_BINDING_2D)) {
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        gl.deleteTexture(texture.texture);
        texture.texture = null;
    }
    exports_1("glDropTexture", glDropTexture);
    function glSetupAttribute(gl, shader, format, vertex, count = 0) {
        gl.bindBuffer(vertex.buffer_type, vertex.buffer);
        if (count > 0) {
            const sizeof_vertex = vertex.typed_array.BYTES_PER_ELEMENT * vertex.size; // in bytes
            const stride = sizeof_vertex * count;
            for (let index = 0; index < count; ++index) {
                const offset = sizeof_vertex * index;
                const attrib = shader.attribs.get(format.replace(/{index}/g, index.toString())) || 0;
                gl.vertexAttribPointer(attrib, vertex.size, vertex.type, false, stride, offset);
                gl.enableVertexAttribArray(attrib);
            }
        }
        else {
            const attrib = shader.attribs.get(format) || 0;
            gl.vertexAttribPointer(attrib, vertex.size, vertex.type, false, 0, 0);
            gl.enableVertexAttribArray(attrib);
        }
    }
    exports_1("glSetupAttribute", glSetupAttribute);
    function glResetAttribute(gl, shader, format, vertex, count = 0) {
        if (count > 0) {
            for (let index = 0; index < count; ++index) {
                const attrib = shader.attribs.get(format.replace(/{index}/g, index.toString())) || 0;
                gl.disableVertexAttribArray(attrib);
            }
        }
        else {
            const attrib = shader.attribs.get(format) || 0;
            gl.disableVertexAttribArray(attrib);
        }
    }
    exports_1("glResetAttribute", glResetAttribute);
    function glResetAttributes(gl, shader) {
        shader.attribs.forEach((value, key) => {
            if (value !== -1) {
                gl.disableVertexAttribArray(value);
            }
        });
    }
    exports_1("glResetAttributes", glResetAttributes);
    return {
        setters: [
            function (Spine_1) {
                Spine = Spine_1;
            }
        ],
        execute: function () {
            RenderWebGL = class RenderWebGL {
                constructor(gl) {
                    this.bone_map = new Spine.Map();
                    this.skin_map = new Spine.Map();
                    this.textures = new Spine.Map();
                    this.projection = mat4x4Identity(new Float32Array(16));
                    this.modelview = mat4x4Identity(new Float32Array(16));
                    this.texmatrix = mat3x3Identity(new Float32Array(9));
                    this.color = vec4Identity(new Float32Array(4));
                    this.skin_shader_modelview_count = 16; // mat4
                    this.skin_shader_modelview_array = new Float32Array(16 * this.skin_shader_modelview_count);
                    this.skin_shader_blenders_count = 8; // vec2
                    this.gl = gl;
                    const mesh_shader_vs_src = [
                        "uniform mat4 uProjection;",
                        "uniform mat4 uModelview;",
                        "uniform mat3 uTexMatrix;",
                        "attribute vec2 aPosition;",
                        "attribute vec2 aTexCoord;",
                        "varying vec3 vTexCoord;",
                        "void main(void) {",
                        " gl_Position = uProjection * uModelview * vec4(aPosition, 0.0, 1.0);",
                        " vTexCoord = uTexMatrix * vec3(aTexCoord, 1.0);",
                        "}"
                    ];
                    const ffd_mesh_shader_vs_src = [
                        "uniform mat4 uProjection;",
                        "uniform mat4 uModelview;",
                        "uniform mat3 uTexMatrix;",
                        "uniform float uMorphWeight;",
                        "attribute vec2 aPosition;",
                        "attribute vec2 aTexCoord;",
                        "attribute vec2 aPositionMorph0;",
                        "attribute vec2 aPositionMorph1;",
                        "varying vec3 vTexCoord;",
                        "void main(void) {",
                        " gl_Position = uProjection * uModelview * vec4(aPosition + mix(aPositionMorph0, aPositionMorph1, uMorphWeight), 0.0, 1.0);",
                        " vTexCoord = uTexMatrix * vec3(aTexCoord, 1.0);",
                        "}"
                    ];
                    const mesh_shader_fs_src = [
                        "uniform sampler2D uSampler;",
                        "uniform vec4 uColor;",
                        "varying vec3 vTexCoord;",
                        "void main(void) {",
                        " gl_FragColor = uColor * texture2D(uSampler, vTexCoord.st);",
                        "}"
                    ];
                    this.mesh_shader = glMakeShader(gl, mesh_shader_vs_src, mesh_shader_fs_src);
                    this.ffd_mesh_shader = glMakeShader(gl, ffd_mesh_shader_vs_src, mesh_shader_fs_src);
                    const skin_shader_vs_src = [
                        "uniform mat4 uProjection;",
                        "uniform mat4 uModelviewArray[" + this.skin_shader_modelview_count + "];",
                        "uniform mat3 uTexMatrix;",
                        "attribute vec2 aPosition;",
                        "attribute vec2 aTexCoord;",
                        repeat("attribute vec2 aBlenders{index};", this.skin_shader_blenders_count),
                        "varying vec3 vTexCoord;",
                        "void main(void) {",
                        " vec4 position = vec4(aPosition, 0.0, 1.0);",
                        " vec4 blendPosition = vec4(0.0);",
                        repeat(" blendPosition += (uModelviewArray[int(aBlenders{index}.x)] * position) * aBlenders{index}.y;", this.skin_shader_blenders_count),
                        " gl_Position = uProjection * vec4(blendPosition.xy, 0.0, 1.0);",
                        " vTexCoord = uTexMatrix * vec3(aTexCoord, 1.0);",
                        "}"
                    ];
                    const ffd_skin_shader_vs_src = [
                        "uniform mat4 uProjection;",
                        "uniform mat4 uModelviewArray[" + this.skin_shader_modelview_count + "];",
                        "uniform mat3 uTexMatrix;",
                        "uniform float uMorphWeight;",
                        "attribute vec2 aPosition;",
                        "attribute vec2 aTexCoord;",
                        "attribute vec2 aPositionMorph0;",
                        "attribute vec2 aPositionMorph1;",
                        repeat("attribute vec2 aBlenders{index};", this.skin_shader_blenders_count),
                        "varying vec3 vTexCoord;",
                        "void main(void) {",
                        " vec4 position = vec4(aPosition + mix(aPositionMorph0, aPositionMorph1, uMorphWeight), 0.0, 1.0);",
                        " vec4 blendPosition = vec4(0.0);",
                        repeat(" blendPosition += (uModelviewArray[int(aBlenders{index}.x)] * position) * aBlenders{index}.y;", this.skin_shader_blenders_count),
                        " gl_Position = uProjection * vec4(blendPosition.xy, 0.0, 1.0);",
                        " vTexCoord = uTexMatrix * vec3(aTexCoord, 1.0);",
                        "}"
                    ];
                    const skin_shader_fs_src = [
                        "uniform sampler2D uSampler;",
                        "uniform vec4 uColor;",
                        "varying vec3 vTexCoord;",
                        "void main(void) {",
                        " gl_FragColor = uColor * texture2D(uSampler, vTexCoord.st);",
                        "}"
                    ];
                    this.skin_shader = glMakeShader(gl, skin_shader_vs_src, skin_shader_fs_src);
                    this.ffd_skin_shader = glMakeShader(gl, ffd_skin_shader_vs_src, skin_shader_fs_src);
                    this.region_vertex_position = glMakeVertex(gl, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW); // [ x, y ]
                    this.region_vertex_texcoord = glMakeVertex(gl, new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]), 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW); // [ u, v ]
                }
                loadData(spine_data, atlas_data, images) {
                    spine_data.iterateBones((bone_key, bone) => {
                        const render_bone = this.bone_map.get(bone_key) || this.bone_map.set(bone_key, new RenderBone());
                        Spine.Space.invert(bone.world_space, render_bone.setup_space);
                    });
                    spine_data.iterateSkins((skin_key, skin) => {
                        const render_skin = this.skin_map.get(skin_key) || this.skin_map.set(skin_key, new RenderSkin());
                        skin.iterateAttachments((slot_key, skin_slot, attachment_key, attachment) => {
                            if (!attachment) {
                                return;
                            }
                            const render_slot = render_skin.slot_map.get(slot_key) || render_skin.slot_map.set(slot_key, new RenderSlot());
                            switch (attachment.type) {
                                case "region":
                                    render_slot.attachment_map.set(attachment_key, new RenderRegionAttachment(this).loadData(spine_data, skin_key, slot_key, attachment_key, attachment));
                                    break;
                                case "mesh":
                                    render_slot.attachment_map.set(attachment_key, new RenderMeshAttachment(this).loadData(spine_data, skin_key, slot_key, attachment_key, attachment));
                                    break;
                                case "weightedmesh":
                                    render_slot.attachment_map.set(attachment_key, new RenderWeightedMeshAttachment(this).loadData(spine_data, skin_key, slot_key, attachment_key, attachment));
                                    break;
                            }
                        });
                    });
                    if (atlas_data) {
                        const gl = this.gl;
                        atlas_data.pages.forEach((page) => {
                            if (page.format !== "RGBA8888") {
                                throw new Error(page.format);
                            }
                            let min_filter = gl.NONE;
                            switch (page.min_filter) {
                                case "Nearest":
                                    min_filter = gl.NEAREST;
                                    break;
                                default:
                                case "Linear":
                                    min_filter = gl.LINEAR;
                                    break;
                                case "MipMapNearestNearest":
                                    min_filter = gl.NEAREST_MIPMAP_NEAREST;
                                    break;
                                case "MipMapLinearNearest":
                                    min_filter = gl.LINEAR_MIPMAP_NEAREST;
                                    break;
                                case "MipMapNearestLinear":
                                    min_filter = gl.NEAREST_MIPMAP_LINEAR;
                                    break;
                                case "MipMapLinearLinear":
                                    min_filter = gl.LINEAR_MIPMAP_LINEAR;
                                    break;
                            }
                            let mag_filter = gl.NONE;
                            switch (page.mag_filter) {
                                case "Nearest":
                                    mag_filter = gl.NEAREST;
                                    break;
                                default:
                                case "Linear":
                                    mag_filter = gl.LINEAR;
                                    break;
                            }
                            let wrap_s = gl.NONE;
                            switch (page.wrap_s) {
                                case "Repeat":
                                    wrap_s = gl.REPEAT;
                                    break;
                                default:
                                case "ClampToEdge":
                                    wrap_s = gl.CLAMP_TO_EDGE;
                                    break;
                                case "MirroredRepeat":
                                    wrap_s = gl.MIRRORED_REPEAT;
                                    break;
                            }
                            let wrap_t = gl.NONE;
                            switch (page.wrap_t) {
                                case "Repeat":
                                    wrap_t = gl.REPEAT;
                                    break;
                                default:
                                case "ClampToEdge":
                                    wrap_t = gl.CLAMP_TO_EDGE;
                                    break;
                                case "MirroredRepeat":
                                    wrap_t = gl.MIRRORED_REPEAT;
                                    break;
                            }
                            const image_key = page.name;
                            this.textures.set(image_key, glMakeTexture(gl, images.get(image_key), min_filter, mag_filter, wrap_s, wrap_t));
                        });
                    }
                    else {
                        const gl = this.gl;
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
                                        this.textures.set(image_key, glMakeTexture(gl, images.get(image_key), gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE));
                                        break;
                                }
                            });
                        });
                    }
                }
                dropData(spine_data, atlas_data = null) {
                    const gl = this.gl;
                    this.textures.forEach((texture, image_key) => {
                        glDropTexture(gl, texture);
                    });
                    this.textures.clear();
                    this.bone_map.clear();
                    spine_data.iterateSkins((skin_key, skin) => {
                        const render_skin = this.skin_map.get(skin_key);
                        skin.iterateAttachments((slot_key, skin_slot, attachment_key, attachment) => {
                            if (!attachment) {
                                return;
                            }
                            const render_slot = render_skin && render_skin.slot_map.get(slot_key);
                            const render_attachment = render_slot && render_slot.attachment_map.get(attachment_key);
                            if (render_attachment) {
                                render_attachment.dropData(spine_data, skin_key, slot_key, attachment_key, attachment);
                            }
                        });
                    });
                    this.skin_map.clear();
                }
                drawPose(spine_pose, atlas_data = null) {
                    const gl = this.gl;
                    const alpha = this.color[3];
                    spine_pose.iterateAttachments((slot_key, slot, skin_slot, attachment_key, attachment) => {
                        if (!attachment) {
                            return;
                        }
                        if (attachment.type === "boundingbox") {
                            return;
                        }
                        mat4x4Identity(this.modelview);
                        mat3x3Identity(this.texmatrix);
                        vec4CopyColor(this.color, slot.color);
                        this.color[3] *= alpha;
                        gl.enable(gl.BLEND);
                        switch (slot.blend) {
                            default:
                            case "normal":
                                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                                break;
                            case "additive":
                                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                                break;
                            case "multiply":
                                gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
                                break;
                            case "screen":
                                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);
                                break;
                        }
                        const render_skin = this.skin_map.get(spine_pose.skin_key);
                        const render_skin_default = this.skin_map.get("default");
                        const render_slot = (render_skin && render_skin.slot_map.get(slot_key)) || (render_skin_default && render_skin_default.slot_map.get(slot_key));
                        const render_attachment = render_slot && render_slot.attachment_map.get(attachment_key);
                        if (render_attachment) {
                            render_attachment.drawPose(spine_pose, atlas_data, spine_pose.skin_key, slot_key, slot, attachment_key, attachment);
                        }
                    });
                    this.color[3] = alpha;
                }
            };
            exports_1("RenderWebGL", RenderWebGL);
            RenderBone = class RenderBone {
                constructor() {
                    this.setup_space = new Spine.Space();
                }
            };
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
                loadData(spine_data, skin_key, slot_key, attachment_key, attachment) {
                    return this;
                }
                dropData(spine_data, skin_key, slot_key, attachment_key, attachment) {
                    return this;
                }
                drawPose(spine_pose, atlas_data, skin_key, slot_key, slot, attachment_key, attachment) {
                    const gl = this.render.gl;
                    const bone = spine_pose.bones.get(slot.bone_key);
                    const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                    const page = site && site.page;
                    const image_key = (page && page.name) || attachment.path || attachment.name || attachment_key;
                    const texture = this.render.textures.get(image_key);
                    if (!texture) {
                        return;
                    }
                    mat3x3ApplyAtlasPageTexcoord(this.render.texmatrix, page);
                    mat3x3ApplyAtlasSiteTexcoord(this.render.texmatrix, site);
                    bone && mat4x4ApplySpace(this.render.modelview, bone.world_space);
                    mat4x4ApplySpace(this.render.modelview, attachment.local_space);
                    mat4x4Scale(this.render.modelview, attachment.width / 2, attachment.height / 2);
                    mat4x4ApplyAtlasSitePosition(this.render.modelview, site);
                    const shader = this.render.mesh_shader;
                    gl.useProgram(shader.program);
                    gl.uniformMatrix4fv(shader.uniforms.get("uProjection") || 0, false, this.render.projection);
                    gl.uniformMatrix4fv(shader.uniforms.get("uModelview") || 0, false, this.render.modelview);
                    gl.uniformMatrix3fv(shader.uniforms.get("uTexMatrix") || 0, false, this.render.texmatrix);
                    gl.uniform4fv(shader.uniforms.get("uColor") || 0, this.render.color);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
                    gl.uniform1i(shader.uniforms.get("uSampler") || 0, 0);
                    glSetupAttribute(gl, shader, "aPosition", this.render.region_vertex_position);
                    glSetupAttribute(gl, shader, "aTexCoord", this.render.region_vertex_texcoord);
                    gl.drawArrays(gl.TRIANGLE_FAN, 0, this.render.region_vertex_position.count);
                    glResetAttributes(gl, shader);
                }
            };
            RenderMeshAttachment = class RenderMeshAttachment {
                constructor(render) {
                    this.ffd_attachment_map = new Spine.Map();
                    this.render = render;
                }
                loadData(spine_data, skin_key, slot_key, attachment_key, attachment) {
                    const gl = this.render.gl;
                    const vertex_count = attachment.vertices.length / 2;
                    const vertex_position = new Float32Array(attachment.vertices);
                    const vertex_texcoord = new Float32Array(attachment.uvs);
                    const vertex_triangle = new Uint16Array(attachment.triangles);
                    this.vertex_position = glMakeVertex(gl, vertex_position, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
                    this.vertex_texcoord = glMakeVertex(gl, vertex_texcoord, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
                    this.vertex_triangle = glMakeVertex(gl, vertex_triangle, 1, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
                    spine_data.iterateAnims((anim_key, anim) => {
                        const ffd_skin = anim.ffd_skins && anim.ffd_skins.get(skin_key);
                        const ffd_slot = ffd_skin && ffd_skin.ffd_slots.get(slot_key);
                        const ffd_attachment = ffd_slot && ffd_slot.ffd_attachments.get(attachment_key);
                        if (ffd_attachment) {
                            const render_ffd_attachment = this.ffd_attachment_map.set(anim_key, new RenderFfdAttachment());
                            ffd_attachment.ffd_timeline.keyframes.forEach((ffd_keyframe, ffd_keyframe_index) => {
                                const render_ffd_keyframe = render_ffd_attachment.ffd_keyframes[ffd_keyframe_index] = new RenderFfdKeyframe();
                                const vertex_position_morph = new Float32Array(2 * vertex_count);
                                vertex_position_morph.subarray(ffd_keyframe.offset, ffd_keyframe.offset + ffd_keyframe.vertices.length).set(new Float32Array(ffd_keyframe.vertices));
                                render_ffd_keyframe.vertex_position_morph = glMakeVertex(gl, vertex_position_morph, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
                            });
                        }
                    });
                    return this;
                }
                dropData(spine_data, skin_key, slot_key, attachment_key, attachment) {
                    const gl = this.render.gl;
                    glDropVertex(gl, this.vertex_position);
                    glDropVertex(gl, this.vertex_texcoord);
                    glDropVertex(gl, this.vertex_triangle);
                    this.ffd_attachment_map.forEach((render_ffd_attachment, anim_key) => {
                        render_ffd_attachment.ffd_keyframes.forEach((ffd_keyframe) => {
                            glDropVertex(gl, ffd_keyframe.vertex_position_morph);
                        });
                    });
                    return this;
                }
                drawPose(spine_pose, atlas_data, skin_key, slot_key, slot, attachment_key, attachment) {
                    const gl = this.render.gl;
                    const bone = spine_pose.bones.get(slot.bone_key);
                    const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                    const page = site && site.page;
                    const image_key = (page && page.name) || attachment.path || attachment.name || attachment_key;
                    const texture = this.render.textures.get(image_key);
                    if (!texture) {
                        return;
                    }
                    mat3x3ApplyAtlasPageTexcoord(this.render.texmatrix, page);
                    mat3x3ApplyAtlasSiteTexcoord(this.render.texmatrix, site);
                    bone && mat4x4ApplySpace(this.render.modelview, bone.world_space);
                    mat4x4ApplyAtlasSitePosition(this.render.modelview, site);
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
                    const render_ffd_attachment = this.ffd_attachment_map.get(spine_pose.anim_key);
                    const render_ffd_keyframe0 = (render_ffd_attachment && render_ffd_attachment.ffd_keyframes[ffd_keyframe0_index]);
                    const render_ffd_keyframe1 = (render_ffd_attachment && render_ffd_attachment.ffd_keyframes[ffd_keyframe1_index]) || render_ffd_keyframe0;
                    const shader = ffd_keyframe0 ? this.render.ffd_mesh_shader : this.render.mesh_shader;
                    gl.useProgram(shader.program);
                    gl.uniformMatrix4fv(shader.uniforms.get("uProjection") || 0, false, this.render.projection);
                    gl.uniformMatrix4fv(shader.uniforms.get("uModelview") || 0, false, this.render.modelview);
                    gl.uniformMatrix3fv(shader.uniforms.get("uTexMatrix") || 0, false, this.render.texmatrix);
                    gl.uniform4fv(shader.uniforms.get("uColor") || 0, this.render.color);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
                    gl.uniform1i(shader.uniforms.get("uSampler") || 0, 0);
                    glSetupAttribute(gl, shader, "aPosition", this.vertex_position);
                    glSetupAttribute(gl, shader, "aTexCoord", this.vertex_texcoord);
                    ffd_keyframe0 && gl.uniform1f(shader.uniforms.get("uMorphWeight") || 0, ffd_weight);
                    render_ffd_keyframe0 && glSetupAttribute(gl, shader, "aPositionMorph0", render_ffd_keyframe0.vertex_position_morph);
                    render_ffd_keyframe1 && glSetupAttribute(gl, shader, "aPositionMorph1", render_ffd_keyframe1.vertex_position_morph);
                    const vertex_triangle = this.vertex_triangle;
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertex_triangle.buffer);
                    gl.drawElements(gl.TRIANGLES, vertex_triangle.count, vertex_triangle.type, 0);
                    glResetAttributes(gl, shader);
                }
            };
            RenderWeightedMeshAttachment = class RenderWeightedMeshAttachment {
                constructor(render) {
                    this.blend_bone_index_array = [];
                    this.ffd_attachment_map = new Spine.Map();
                    this.render = render;
                }
                loadData(spine_data, skin_key, slot_key, attachment_key, attachment) {
                    function parseBlenders(vertices, index, callback) {
                        const blender_count = vertices[index++];
                        for (let blender_index = 0; blender_index < blender_count; ++blender_index) {
                            const blender = new Blender();
                            blender.bone_index = vertices[index++];
                            blender.position.x = vertices[index++];
                            blender.position.y = vertices[index++];
                            blender.weight = vertices[index++];
                            callback(blender, blender_index);
                        }
                        return index;
                    }
                    const gl = this.render.gl;
                    const vertex_count = attachment.uvs.length / 2;
                    const vertex_position = new Float32Array(2 * vertex_count); // [ x, y ]
                    const vertex_texcoord = new Float32Array(attachment.uvs); // [ u, v ]
                    const vertex_blenders = new Float32Array(2 * vertex_count * this.render.skin_shader_blenders_count); // [ i0, w0, i1, w1, ... ]
                    const vertex_triangle = new Uint16Array(attachment.triangles);
                    const blend_bone_index_array = this.blend_bone_index_array;
                    for (let vertex_index = 0, parse_index = 0; vertex_index < vertex_count; ++vertex_index) {
                        const blender_array = [];
                        parse_index = parseBlenders(attachment.vertices, parse_index, (blender) => { blender_array.push(blender); });
                        // sort descending by weight
                        blender_array.sort((a, b) => { return b.weight - a.weight; });
                        // clamp to limit
                        if (blender_array.length > this.render.skin_shader_blenders_count) {
                            console.log("blend array length for", attachment_key, "is", blender_array.length, "so clamp to", this.render.skin_shader_blenders_count);
                            blender_array.length = this.render.skin_shader_blenders_count;
                        }
                        // normalize weights
                        let weight_sum = 0;
                        blender_array.forEach((blender) => { weight_sum += blender.weight; });
                        blender_array.forEach((blender) => { blender.weight /= weight_sum; });
                        const position = new Spine.Vector();
                        blender_array.forEach((blender, blender_index) => {
                            ///const bone_key: string = spine_data.bones._keys[blender.bone_index];
                            ///const bone: Spine.Bone | undefined = spine_data.bones.get(bone_key);
                            const bone = spine_data.bones.getByIndex(blender.bone_index);
                            const blend_position = new Spine.Vector();
                            bone && Spine.Space.transform(bone.world_space, blender.position, blend_position);
                            position.selfAdd(blend_position.selfScale(blender.weight));
                            // keep track of which bones are used for blending
                            if (blend_bone_index_array.indexOf(blender.bone_index) === -1) {
                                blend_bone_index_array.push(blender.bone_index);
                            }
                            // index into skin_shader_modelview_array, not spine_pose.data.bone_keys
                            vertex_blenders[vertex_index * 2 * this.render.skin_shader_blenders_count + blender_index * 2 + 0] = blend_bone_index_array.indexOf(blender.bone_index);
                            vertex_blenders[vertex_index * 2 * this.render.skin_shader_blenders_count + blender_index * 2 + 1] = blender.weight;
                        });
                        vertex_position[vertex_index * 2 + 0] = position.x;
                        vertex_position[vertex_index * 2 + 1] = position.y;
                        if (blend_bone_index_array.length > this.render.skin_shader_modelview_count) {
                            console.log("blend bone index array length for", attachment_key, "is", blend_bone_index_array.length, "greater than", this.render.skin_shader_modelview_count);
                        }
                    }
                    this.vertex_position = glMakeVertex(gl, vertex_position, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
                    this.vertex_texcoord = glMakeVertex(gl, vertex_texcoord, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
                    this.vertex_blenders = glMakeVertex(gl, vertex_blenders, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
                    this.vertex_triangle = glMakeVertex(gl, vertex_triangle, 1, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
                    spine_data.iterateAnims((anim_key, anim) => {
                        const ffd_skin = anim.ffd_skins && anim.ffd_skins.get(skin_key);
                        const ffd_slot = ffd_skin && ffd_skin.ffd_slots.get(slot_key);
                        const ffd_attachment = ffd_slot && ffd_slot.ffd_attachments.get(attachment_key);
                        if (ffd_attachment) {
                            const render_ffd_attachment = this.ffd_attachment_map.set(anim_key, new RenderFfdAttachment());
                            ffd_attachment.ffd_timeline.keyframes.forEach((ffd_keyframe, ffd_keyframe_index) => {
                                const render_ffd_keyframe = render_ffd_attachment.ffd_keyframes[ffd_keyframe_index] = new RenderFfdKeyframe();
                                const vertex_position_morph = new Float32Array(2 * vertex_count);
                                for (let vertex_index = 0, parse_index = 0, ffd_index = 0; vertex_index < vertex_count; ++vertex_index) {
                                    const blender_array = [];
                                    parse_index = parseBlenders(attachment.vertices, parse_index, (blender) => { blender_array.push(blender); });
                                    const position_morph = new Spine.Vector();
                                    blender_array.forEach((blender) => {
                                        ///const bone_key: string = spine_data.bones._keys[blender.bone_index];
                                        ///const bone: Spine.Bone | undefined = spine_data.bones.get(bone_key);
                                        const bone = spine_data.bones.getByIndex(blender.bone_index);
                                        const blend_position = new Spine.Vector();
                                        blend_position.x = ffd_keyframe.vertices[ffd_index - ffd_keyframe.offset] || 0;
                                        ++ffd_index;
                                        blend_position.y = ffd_keyframe.vertices[ffd_index - ffd_keyframe.offset] || 0;
                                        ++ffd_index;
                                        bone && Spine.Matrix.transform(bone.world_space.affine.matrix, blend_position, blend_position);
                                        position_morph.selfAdd(blend_position.selfScale(blender.weight));
                                    });
                                    vertex_position_morph[vertex_index * 2 + 0] = position_morph.x;
                                    vertex_position_morph[vertex_index * 2 + 1] = position_morph.y;
                                }
                                render_ffd_keyframe.vertex_position_morph = glMakeVertex(gl, vertex_position_morph, 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
                            });
                        }
                    });
                    return this;
                }
                dropData(spine_data, skin_key, slot_key, attachment_key, attachment) {
                    const gl = this.render.gl;
                    glDropVertex(gl, this.vertex_position);
                    glDropVertex(gl, this.vertex_blenders);
                    glDropVertex(gl, this.vertex_texcoord);
                    glDropVertex(gl, this.vertex_triangle);
                    this.ffd_attachment_map.forEach((render_ffd_attachment, anim_key) => {
                        render_ffd_attachment.ffd_keyframes.forEach((ffd_keyframe) => {
                            glDropVertex(gl, ffd_keyframe.vertex_position_morph);
                        });
                    });
                    return this;
                }
                drawPose(spine_pose, atlas_data, skin_key, slot_key, slot, attachment_key, attachment) {
                    const gl = this.render.gl;
                    const site = atlas_data && atlas_data.sites[attachment.path || attachment.name || attachment_key];
                    const page = site && site.page;
                    const image_key = (page && page.name) || attachment.path || attachment.name || attachment_key;
                    const texture = this.render.textures.get(image_key);
                    if (!texture) {
                        return;
                    }
                    mat3x3ApplyAtlasPageTexcoord(this.render.texmatrix, page);
                    mat3x3ApplyAtlasSiteTexcoord(this.render.texmatrix, site);
                    // update skin shader modelview array
                    const blend_bone_index_array = this.blend_bone_index_array;
                    for (let index = 0; index < blend_bone_index_array.length; ++index) {
                        if (index < this.render.skin_shader_modelview_count) {
                            const bone_index = blend_bone_index_array[index];
                            ///const bone_key: string = spine_pose.bones._keys[bone_index];
                            const bone_key = spine_pose.bones.key(bone_index);
                            const bone = spine_pose.bones.get(bone_key);
                            const render_bone = this.render.bone_map.get(bone_key);
                            const modelview = this.render.skin_shader_modelview_array.subarray(index * 16, (index + 1) * 16);
                            mat4x4Copy(modelview, this.render.modelview);
                            bone && mat4x4ApplySpace(modelview, bone.world_space);
                            render_bone && mat4x4ApplySpace(modelview, render_bone.setup_space);
                            mat4x4ApplyAtlasSitePosition(modelview, site);
                        }
                    }
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
                    const render_ffd_attachment = this.ffd_attachment_map.get(spine_pose.anim_key);
                    const render_ffd_keyframe0 = (render_ffd_attachment && render_ffd_attachment.ffd_keyframes[ffd_keyframe0_index]);
                    const render_ffd_keyframe1 = (render_ffd_attachment && render_ffd_attachment.ffd_keyframes[ffd_keyframe1_index]) || render_ffd_keyframe0;
                    const shader = ffd_keyframe0 ? this.render.ffd_skin_shader : this.render.skin_shader;
                    gl.useProgram(shader.program);
                    gl.uniformMatrix4fv(shader.uniforms.get("uProjection") || 0, false, this.render.projection);
                    gl.uniformMatrix4fv(shader.uniforms.get("uModelviewArray[0]") || 0, false, this.render.skin_shader_modelview_array);
                    gl.uniformMatrix3fv(shader.uniforms.get("uTexMatrix") || 0, false, this.render.texmatrix);
                    gl.uniform4fv(shader.uniforms.get("uColor") || 0, this.render.color);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
                    gl.uniform1i(shader.uniforms.get("uSampler") || 0, 0);
                    glSetupAttribute(gl, shader, "aPosition", this.vertex_position);
                    glSetupAttribute(gl, shader, "aTexCoord", this.vertex_texcoord);
                    glSetupAttribute(gl, shader, "aBlenders{index}", this.vertex_blenders, this.render.skin_shader_blenders_count);
                    ffd_keyframe0 && gl.uniform1f(shader.uniforms.get("uMorphWeight") || 0, ffd_weight);
                    render_ffd_keyframe0 && glSetupAttribute(gl, shader, "aPositionMorph0", render_ffd_keyframe0.vertex_position_morph);
                    render_ffd_keyframe1 && glSetupAttribute(gl, shader, "aPositionMorph1", render_ffd_keyframe1.vertex_position_morph);
                    const vertex_triangle = this.vertex_triangle;
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertex_triangle.buffer);
                    gl.drawElements(gl.TRIANGLES, vertex_triangle.count, vertex_triangle.type, 0);
                    glResetAttributes(gl, shader);
                }
            };
            Blender = class Blender {
                constructor() {
                    this.position = new Spine.Vector();
                    this.bone_index = -1;
                    this.weight = 0;
                }
            };
            RenderFfdAttachment = class RenderFfdAttachment {
                constructor() {
                    this.ffd_keyframes = [];
                }
            };
            RenderFfdKeyframe = class RenderFfdKeyframe {
            };
            RenderShader = class RenderShader {
                constructor() {
                    this.vs_src = [];
                    this.fs_src = [];
                    this.vs = null;
                    this.fs = null;
                    this.program = null;
                    this.uniforms = new Map();
                    this.attribs = new Map();
                }
            };
            RenderVertex = class RenderVertex {
                constructor() {
                    this.buffer = null;
                }
            };
            RenderTexture = class RenderTexture {
                constructor() {
                    this.texture = null;
                }
            };
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLXdlYmdsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vcmVuZGVyLXdlYmdsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFtbEJBLGdCQUFnQixNQUFjLEVBQUUsS0FBYTtRQUMzQyxNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7UUFDM0IsS0FBSyxJQUFJLEtBQUssR0FBVyxDQUFDLEVBQUUsS0FBSyxHQUFHLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRTtZQUNsRCxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDMUQ7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxpQkFBaUIsS0FBMEIsRUFBRSxNQUFnQixFQUFFO1FBQzdELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFzQixFQUFRLEVBQUU7WUFDN0MsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFBRTtpQkFBTTtnQkFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQUU7UUFDOUUsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUE0QkQsc0JBQTZCLENBQWU7UUFDMUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUNoQyxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7O0lBRUQsdUJBQThCLENBQWUsRUFBRSxLQUFrQjtRQUMvRCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNm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