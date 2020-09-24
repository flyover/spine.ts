System.register([], function (exports_1, context_1) {
    "use strict";
    var Page, Site, Data;
    var __moduleName = context_1 && context_1.id;
    function trim(s) {
        return s.replace(/^\s+|\s+$/g, "");
    }
    return {
        setters: [],
        execute: function () {
            Page = class Page {
                constructor() {
                    this.name = "";
                    this.w = 0;
                    this.h = 0;
                    this.format = "RGBA8888";
                    this.min_filter = "linear";
                    this.mag_filter = "linear";
                    this.wrap_s = "clamp-to-edge";
                    this.wrap_t = "clamp-to-edge";
                }
            };
            exports_1("Page", Page);
            Site = class Site {
                constructor(page) {
                    this.x = 0;
                    this.y = 0;
                    this.w = 0;
                    this.h = 0;
                    this.rotate = 0;
                    this.offset_x = 0;
                    this.offset_y = 0;
                    this.original_w = 0;
                    this.original_h = 0;
                    this.index = -1;
                    this.page = page;
                }
            };
            exports_1("Site", Site);
            Data = class Data {
                constructor() {
                    this.pages = [];
                    this.sites = {};
                }
                free() {
                    this.pages = [];
                    this.sites = {};
                }
                import(text) {
                    return this.importAtlasText(text);
                }
                export(text = "") {
                    return this.exportAtlasText(text);
                }
                importAtlasText(text) {
                    const lines = text.split(/\n|\r\n/);
                    return this.importAtlasTextLines(lines);
                }
                exportAtlasText(text = "") {
                    const lines = this.exportAtlasTextLines([]);
                    return text + lines.join("\n");
                }
                importAtlasTextLines(lines) {
                    this.pages = [];
                    this.sites = {};
                    let page = null;
                    let site = null;
                    let match = null;
                    lines.forEach((line) => {
                        if (trim(line).length === 0) {
                            page = null;
                            site = null;
                        }
                        else if ((match = line.match(/^size: (.*),(.*)$/))) {
                            if (!page)
                                throw new Error();
                            page.w = parseInt(match[1], 10);
                            page.h = parseInt(match[2], 10);
                        }
                        else if ((match = line.match(/^format: (.*)$/))) {
                            if (!page)
                                throw new Error();
                            page.format = match[1];
                        }
                        else if ((match = line.match(/^filter: (.*),(.*)$/))) {
                            if (!page)
                                throw new Error();
                            page.min_filter = match[1];
                            page.mag_filter = match[2];
                        }
                        else if ((match = line.match(/^repeat: (.*)$/))) {
                            if (!page)
                                throw new Error();
                            const repeat = match[1];
                            page.wrap_s = ((repeat === "x") || (repeat === "xy")) ? ("Repeat") : ("ClampToEdge");
                            page.wrap_t = ((repeat === "y") || (repeat === "xy")) ? ("Repeat") : ("ClampToEdge");
                        }
                        else if ((match = line.match(/^orig: (.*)[,| x] (.*)$/))) {
                            const original_w = parseInt(match[1], 10);
                            const original_h = parseInt(match[2], 10);
                            console.log("page:orig", original_w, original_h);
                        }
                        else if (page === null) {
                            page = new Page();
                            page.name = line;
                            this.pages.push(page);
                        }
                        else {
                            if ((match = line.match(/^ {2}rotate: (.*)$/))) {
                                if (!site)
                                    throw new Error();
                                site.rotate = (match[1] === "true") ? -1 : 0; // -90 degrees
                            }
                            else if ((match = line.match(/^ {2}xy: (.*), (.*)$/))) {
                                if (!site)
                                    throw new Error();
                                site.x = parseInt(match[1], 10);
                                site.y = parseInt(match[2], 10);
                            }
                            else if ((match = line.match(/^ {2}size: (.*), (.*)$/))) {
                                if (!site)
                                    throw new Error();
                                site.w = parseInt(match[1], 10);
                                site.h = parseInt(match[2], 10);
                            }
                            else if ((match = line.match(/^ {2}orig: (.*), (.*)$/))) {
                                if (!site)
                                    throw new Error();
                                site.original_w = parseInt(match[1], 10);
                                site.original_h = parseInt(match[2], 10);
                            }
                            else if ((match = line.match(/^ {2}offset: (.*), (.*)$/))) {
                                if (!site)
                                    throw new Error();
                                site.offset_x = parseInt(match[1], 10);
                                site.offset_y = parseInt(match[2], 10);
                            }
                            else if ((match = line.match(/^ {2}index: (.*)$/))) {
                                if (!site)
                                    throw new Error();
                                site.index = parseInt(match[1], 10);
                            }
                            else {
                                if (site) {
                                    site.original_w = site.original_w || site.w;
                                    site.original_h = site.original_h || site.h;
                                }
                                site = new Site(page);
                                this.sites[line] = site;
                            }
                        }
                    });
                    return this;
                }
                exportAtlasTextLines(lines = []) {
                    this.pages.forEach((page) => {
                        lines.push(""); // empty line denotes new page
                        lines.push(page.name);
                        lines.push("size: " + page.w + "," + page.h);
                        lines.push("format: " + page.format);
                        lines.push("filter: " + page.min_filter + "," + page.mag_filter);
                        let repeat = "none";
                        if ((page.wrap_s === "Repeat") && (page.wrap_t === "Repeat")) {
                            repeat = "xy";
                        }
                        else if (page.wrap_s === "Repeat") {
                            repeat = "x";
                        }
                        else if (page.wrap_t === "Repeat") {
                            repeat = "y";
                        }
                        lines.push("repeat: " + repeat);
                        Object.keys(this.sites).forEach((site_key) => {
                            const site = this.sites[site_key];
                            if (site.page !== page) {
                                return;
                            }
                            lines.push(site_key);
                            lines.push("  rotate: " + (site.rotate === 0 ? "false" : "true"));
                            lines.push("  xy: " + site.x + ", " + site.y);
                            lines.push("  size: " + site.w + ", " + site.h);
                            lines.push("  orig: " + site.original_w + ", " + site.original_h);
                            lines.push("  offset: " + site.offset_x + ", " + site.offset_y);
                            lines.push("  index: " + site.index);
                        });
                    });
                    return lines;
                }
                importTpsText(tps_text) {
                    this.pages = [];
                    this.sites = {};
                    return this.importTpsTextPage(tps_text, 0);
                }
                importTpsTextPage(tps_text, page_index = 0) {
                    const tps_json = JSON.parse(tps_text);
                    const page = this.pages[page_index] = new Page();
                    if (tps_json.meta) {
                        // TexturePacker only supports one page
                        page.w = tps_json.meta.size.w;
                        page.h = tps_json.meta.size.h;
                        page.name = tps_json.meta.image;
                    }
                    Object.keys(tps_json.frames || {}).forEach((key) => {
                        const frame = tps_json.frames[key];
                        const site = this.sites[key] = new Site(page);
                        site.x = frame.frame.x;
                        site.y = frame.frame.y;
                        site.w = frame.frame.w;
                        site.h = frame.frame.h;
                        site.rotate = frame.rotated ? 1 : 0; // 90 degrees
                        site.offset_x = (frame.spriteSourceSize && frame.spriteSourceSize.x) || 0;
                        site.offset_y = (frame.spriteSourceSize && frame.spriteSourceSize.y) || 0;
                        site.original_w = (frame.sourceSize && frame.sourceSize.w) || site.w;
                        site.original_h = (frame.sourceSize && frame.sourceSize.h) || site.h;
                    });
                    return this;
                }
            };
            exports_1("Data", Data);
        }
    };
});
//# sourceMappingURL=atlas.js.map