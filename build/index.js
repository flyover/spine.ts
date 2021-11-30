System.register(["./spine.js", "./demo/atlas.js"], function (exports_1, context_1) {
    "use strict";
    var version;
    var __moduleName = context_1 && context_1.id;
    var exportedNames_1 = {
        "version": true,
        "Atlas": true
    };
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default" && !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters: [
            function (spine_js_1_1) {
                exportStar_1(spine_js_1_1);
            },
            function (Atlas_1) {
                exports_1("Atlas", Atlas_1);
            }
        ],
        execute: function () {
            exports_1("version", version = "1.0.0");
        }
    };
});
//# sourceMappingURL=index.js.map