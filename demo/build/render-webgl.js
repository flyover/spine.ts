System.register(["@spine"], function (exports_1, context_1) {
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
        if (shader === null) {
            throw new Error();
        }
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
        if (program === null) {
            throw new Error();
        }
        if (vs === null) {
            throw new Error();
        }
        if (fs === null) {
            throw new Error();
        }
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
        if (program === null) {
            throw new Error();
        }
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
        if (program === null) {
            throw new Error();
        }
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
    function glMakeVertex(gl, data, size, buffer_type, buffer_draw) {
        const vertex = new RenderVertex();
        if (data instanceof Float32Array) {
            vertex.type = gl.FLOAT;
        }
        else if (data instanceof Int8Array) {
            vertex.type = gl.BYTE;
        }
        else if (data instanceof Uint8Array) {
            vertex.type = gl.UNSIGNED_BYTE;
        }
        else if (data instanceof Int16Array) {
            vertex.type = gl.SHORT;
        }
        else if (data instanceof Uint16Array) {
            vertex.type = gl.UNSIGNED_SHORT;
        }
        else if (data instanceof Int32Array) {
            vertex.type = gl.INT;
        }
        else if (data instanceof Uint32Array) {
            vertex.type = gl.UNSIGNED_INT;
        }
        else {
            vertex.type = gl.NONE;
            throw new Error();
        }
        vertex.size = size;
        vertex.count = data.length / vertex.size;
        vertex.data = data;
        vertex.buffer = gl.createBuffer();
        vertex.buffer_type = buffer_type;
        vertex.buffer_draw = buffer_draw;
        gl.bindBuffer(vertex.buffer_type, vertex.buffer);
        gl.bufferData(vertex.buffer_type, vertex.data, vertex.buffer_draw);
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
            const sizeof_vertex = vertex.data.BYTES_PER_ELEMENT * vertex.size; // in bytes
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
//# sourceMappingURL=render-webgl.js.map