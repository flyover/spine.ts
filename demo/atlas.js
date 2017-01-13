System.register([], function (exports_1, context_1) {
    var __moduleName = context_1 && context_1.id;
    function trim(s) {
        return s.replace(/^\s+|\s+$/g, "");
    }
    var Page, Site, Data;
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
                constructor() {
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
                }
            };
            exports_1("Site", Site);
            Data = class Data {
                constructor() {
                    this.pages = [];
                    this.sites = {};
                }
                drop() {
                    this.pages = [];
                    this.sites = {};
                    return this;
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
                                site.rotate = (match[1] === "true") ? -1 : 0;
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
                                site = new Site();
                                site.page = page;
                                this.sites[line] = site;
                            }
                        }
                    });
                    return this;
                }
                exportAtlasTextLines(lines = []) {
                    this.pages.forEach((page) => {
                        lines.push("");
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
                        page.w = tps_json.meta.size.w;
                        page.h = tps_json.meta.size.h;
                        page.name = tps_json.meta.image;
                    }
                    Object.keys(tps_json.frames || {}).forEach((key) => {
                        const frame = tps_json.frames[key];
                        const site = this.sites[key] = new Site();
                        site.page = page;
                        site.x = frame.frame.x;
                        site.y = frame.frame.y;
                        site.w = frame.frame.w;
                        site.h = frame.frame.h;
                        site.rotate = frame.rotated ? 1 : 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXRsYXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhdGxhcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUFBLGNBQWMsQ0FBUztRQUNyQixNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckMsQ0FBQzs7Ozs7WUFFRCxPQUFBO2dCQUFBO29CQUNTLFNBQUksR0FBVyxFQUFFLENBQUM7b0JBQ2xCLE1BQUMsR0FBVyxDQUFDLENBQUM7b0JBQ2QsTUFBQyxHQUFXLENBQUMsQ0FBQztvQkFDZCxXQUFNLEdBQVcsVUFBVSxDQUFDO29CQUM1QixlQUFVLEdBQVcsUUFBUSxDQUFDO29CQUM5QixlQUFVLEdBQVcsUUFBUSxDQUFDO29CQUM5QixXQUFNLEdBQVcsZUFBZSxDQUFDO29CQUNqQyxXQUFNLEdBQVcsZUFBZSxDQUFDO2dCQUMxQyxDQUFDO2FBQUEsQ0FBQTs7WUFFRCxPQUFBO2dCQUFBO29CQUVTLE1BQUMsR0FBVyxDQUFDLENBQUM7b0JBQ2QsTUFBQyxHQUFXLENBQUMsQ0FBQztvQkFDZCxNQUFDLEdBQVcsQ0FBQyxDQUFDO29CQUNkLE1BQUMsR0FBVyxDQUFDLENBQUM7b0JBQ2QsV0FBTSxHQUFXLENBQUMsQ0FBQztvQkFDbkIsYUFBUSxHQUFXLENBQUMsQ0FBQztvQkFDckIsYUFBUSxHQUFXLENBQUMsQ0FBQztvQkFDckIsZUFBVSxHQUFXLENBQUMsQ0FBQztvQkFDdkIsZUFBVSxHQUFXLENBQUMsQ0FBQztvQkFDdkIsVUFBSyxHQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixDQUFDO2FBQUEsQ0FBQTs7WUFFRCxPQUFBO2dCQUFBO29CQUNTLFVBQUssR0FBVyxFQUFFLENBQUM7b0JBQ25CLFVBQUssR0FBMEIsRUFBRSxDQUFDO2dCQTJKM0MsQ0FBQztnQkF6SlEsSUFBSTtvQkFDVCxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztvQkFDaEIsSUFBSSxDQUFDLEtBQUss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