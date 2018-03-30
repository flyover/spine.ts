System.register(["../spine"], function (exports_1, context_1) {
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
    var Spine, RenderWebGL, RenderBone, RenderSkin, RenderSlot, RenderRegionAttachment, RenderMeshAttachment, RenderWeightedMeshAttachment, Blender, RenderFfdAttachment, RenderFfdKeyframe, RenderShader, RenderVertex, RenderTexture;
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
            };
            RenderVertex = class RenderVertex {
            };
            RenderTexture = class RenderTexture {
            };
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLXdlYmdsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVuZGVyLXdlYmdsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBbWxCQSxnQkFBZ0IsTUFBYyxFQUFFLEtBQWE7UUFDM0MsTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFDO1FBQzNCLEtBQUssSUFBSSxLQUFLLEdBQVcsQ0FBQyxFQUFFLEtBQUssR0FBRyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUU7WUFDbEQsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzFEO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsaUJBQWlCLEtBQTBCLEVBQUUsTUFBZ0IsRUFBRTtRQUM3RCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBc0IsRUFBUSxFQUFFO1lBQzdDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQUU7aUJBQU07Z0JBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUFFO1FBQzlFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBNEJELHNCQUE2QixDQUFlO1FBQzFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDaEMsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDOztJQUVELHVCQUE4QixDQUFlLEVBQUUsS0FBa0I7UUFDL0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDZixPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7O0lBRUQsd0JBQStCLENBQWUsRUFBRSxLQUFrQjtRQUNoRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoQixPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7O0lBRUQsd0JBQStCLENBQWU7UUFDNUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDekIsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDOztJQUVELG9CQUEyQixDQUFlLEVBQUUsS0FBbUI7UUFDN0QsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNiLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQzs7SUFFRCxxQkFBNEIsQ0FBZSxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDckYsTUFBTSxFQUFFLEdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sRUFBRSxHQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQzs7SUFFRCx5QkFBZ0MsQ0FBZSxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQ25FLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7O0lBRUQsNEJBQW1DLENBQWUsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUN0RSxNQUFNLEVBQUUsR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLEVBQUUsR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakQsTUFBTSxFQUFFLEdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxFQUFFLEdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pELENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkIsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDOztJQUVELHNCQUE2QixDQUFlLEVBQUUsS0FBYTtRQUN6RCxPQUFPLGtCQUFrQixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNqRSxDQUFDOztJQUVELHFCQUE0QixDQUFlLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDL0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7O0lBRUQseUJBQWdDLENBQWUsRUFBRSxDQUFlLEVBQUUsR0FBaUI7UUFDakYsTUFBTSxDQUFDLEdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRCxNQUFNLENBQUMsR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxHQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsTUFBTSxFQUFFLEdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDaEIsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDOztJQUVELDBCQUFpQyxDQUFlLEVBQUUsS0FBa0I7UUFDbEUsSUFBSSxLQUFLLEVBQUU7WUFDVCxlQUFlLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsWUFBWSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM5QztRQUNELE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQzs7SUFFRCxzQ0FBNkMsQ0FBZSxFQUFFLElBQXVCO1FBQ25GLElBQUksSUFBSSxFQUFFO1lBQ1IsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDOztJQUVELHNDQUE2QyxDQUFlLEVBQUUsSUFBdUI7UUFDbkYsSUFBSSxJQUFJLEVBQUU7WUFDUixlQUFlLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDdEIsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQXFCO2dCQUNwRCxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjO2FBQzdDO2lCQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzVCLGVBQWUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLG1CQUFtQjtnQkFDbEQsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWE7YUFDM0M7WUFDRCxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hDO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDOztJQUVELHNDQUE2QyxDQUFlLEVBQUUsSUFBdUI7UUFDbkYsSUFBSSxJQUFJLEVBQUU7WUFDUixXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDekQsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNuSCxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hDO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDOztJQUVELHdCQUErQixDQUFlO1FBQzVDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQ2xDLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQzs7SUFFRCxvQkFBMkIsQ0FBZSxFQUFFLEtBQW1CO1FBQzdELENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDYixPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7O0lBRUQscUJBQTRCLENBQWUsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDM0csTUFBTSxFQUFFLEdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sRUFBRSxHQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMvQixNQUFNLEVBQUUsR0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDZixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNmLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQzs7SUFFRCx5QkFBZ0MsQ0FBZSxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsSUFBWSxDQUFDO1FBQ2xGLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7O0lBRUQsNkJBQW9DLENBQWUsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUN2RSxNQUFNLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkcsTUFBTSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFD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