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
    function glMakeVertex(gl, type_array, size, buffer_type, buffer_draw) {
        const vertex = new RenderVertex();
        if (type_array instanceof Float32Array) {
            vertex.type = gl.FLOAT;
        }
        else if (type_array instanceof Int8Array) {
            vertex.type = gl.BYTE;
        }
        else if (type_array instanceof Uint8Array) {
            vertex.type = gl.UNSIGNED_BYTE;
        }
        else if (type_array instanceof Int16Array) {
            vertex.type = gl.SHORT;
        }
        else if (type_array instanceof Uint16Array) {
            vertex.type = gl.UNSIGNED_SHORT;
        }
        else if (type_array instanceof Int32Array) {
            vertex.type = gl.INT;
        }
        else if (type_array instanceof Uint32Array) {
            vertex.type = gl.UNSIGNED_INT;
        }
        else {
            vertex.type = gl.NONE;
            throw new Error();
        }
        vertex.size = size;
        vertex.count = type_array.length / vertex.size;
        vertex.type_array = type_array;
        vertex.buffer = gl.createBuffer();
        vertex.buffer_type = buffer_type;
        vertex.buffer_draw = buffer_draw;
        gl.bindBuffer(vertex.buffer_type, vertex.buffer);
        gl.bufferData(vertex.buffer_type, vertex.type_array, vertex.buffer_draw);
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
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
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
            const sizeof_vertex = vertex.type_array.BYTES_PER_ELEMENT * vertex.size; // in bytes
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
                            const bone_key = spine_data.bones.keys[blender.bone_index];
                            const bone = spine_data.bones.get(bone_key);
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
                                        const bone_key = spine_data.bones.keys[blender.bone_index];
                                        const bone = spine_data.bones.get(bone_key);
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
                            const bone_key = spine_pose.bones.keys[bone_index];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLXdlYmdsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVuZGVyLXdlYmdsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBOGtCQSxnQkFBZ0IsTUFBYyxFQUFFLEtBQWE7UUFDM0MsTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFDO1FBQzNCLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxHQUFXLENBQUMsRUFBRSxLQUFLLEdBQUcsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFDbkQsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELGlCQUFpQixLQUEwQixFQUFFLE1BQWdCLEVBQUU7UUFDN0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQXNCO1lBQ25DLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFBQyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFDLENBQUM7UUFDOUUsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQTRCRCxzQkFBNkIsQ0FBZTtRQUMxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDOztJQUVELHVCQUE4QixDQUFlLEVBQUUsS0FBa0I7UUFDL0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDZixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQzs7SUFFRCx3QkFBK0IsQ0FBZSxFQUFFLEtBQWtCO1FBQ2hFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDOztJQUVELHdCQUErQixDQUFlO1FBQzVDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDOztJQUVELG9CQUEyQixDQUFlLEVBQUUsS0FBbUI7UUFDN0QsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNiLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDOztJQUVELHFCQUE0QixDQUFlLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUNyRixNQUFNLEVBQUUsR0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0IsTUFBTSxFQUFFLEdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7O0lBRUQseUJBQWdDLENBQWUsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUNuRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7O0lBRUQsNEJBQW1DLENBQWUsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUN0RSxNQUFNLEVBQUUsR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLEVBQUUsR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENB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QyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEUsQ0FBQzs7SUFFRCxxQkFBNEIsQ0FBZSxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsSUFBWSxDQUFDO1FBQzlFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDOztJQUVELDBCQUFpQyxDQUFlLEVBQUUsS0FBa0I7UUFDbEUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNWLGVBQWUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2RCxhQUFhLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckMsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsS0FB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