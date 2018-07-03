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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXRsYXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9hdGxhcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBQUEsY0FBYyxDQUFTO1FBQ3JCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckMsQ0FBQzs7OztZQUVELE9BQUE7Z0JBQUE7b0JBQ1MsU0FBSSxHQUFXLEVBQUUsQ0FBQztvQkFDbEIsTUFBQyxHQUFXLENBQUMsQ0FBQztvQkFDZCxNQUFDLEdBQVcsQ0FBQyxDQUFDO29CQUNkLFdBQU0sR0FBVyxVQUFVLENBQUM7b0JBQzVCLGVBQVUsR0FBVyxRQUFRLENBQUM7b0JBQzlCLGVBQVUsR0FBVyxRQUFRLENBQUM7b0JBQzlCLFdBQU0sR0FBVyxlQUFlLENBQUM7b0JBQ2pDLFdBQU0sR0FBVyxlQUFlLENBQUM7Z0JBQzFDLENBQUM7YUFBQSxDQUFBOztZQUVELE9BQUE7Z0JBWUUsWUFBWSxJQUFVO29CQVZmLE1BQUMsR0FBVyxDQUFDLENBQUM7b0JBQ2QsTUFBQyxHQUFXLENBQUMsQ0FBQztvQkFDZCxNQUFDLEdBQVcsQ0FBQyxDQUFDO29CQUNkLE1BQUMsR0FBVyxDQUFDLENBQUM7b0JBQ2QsV0FBTSxHQUFXLENBQUMsQ0FBQztvQkFDbkIsYUFBUSxHQUFXLENBQUMsQ0FBQztvQkFDckIsYUFBUSxHQUFXLENBQUMsQ0FBQztvQkFDckIsZUFBVSxHQUFXLENBQUMsQ0FBQztvQkFDdkIsZUFBVSxHQUFXLENBQUMsQ0FBQztvQkFDdkIsVUFBSyxHQUFXLENBQUMsQ0FBQyxDQUFDO29CQUV4QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDbkIsQ0FBQzthQUNGLENBQUE7O1lBRUQsT0FBQTtnQkFBQTtvQkFDUyxVQUFLLEdBQVcsRUFBRSxDQUFDO29CQUNuQixVQUFLLEdBQTBCLEVBQUUsQ0FBQztnQkF3SjNDLENBQUM7Z0JBdEpRLElBQUk7b0JBQ1QsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7b0JBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUNsQixDQUFDO2dCQUVNLE1BQU0sQ0FBQyxJQUFZO29CQUN4QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7Z0JBRU0sTUFBTSxDQUFDLE9BQWUsRUFBRTtvQkFDN0IsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO2dCQUVNLGVBQWUsQ0FBQyxJQUFZO29CQUNqQyxNQUFNLEtBQUssR0FBYSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUM5QyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUMsQ0FBQztnQkFFTSxlQUFlLENBQUMsT0FBZSxFQUFFO29CQUN0QyxNQUFNLEtBQUssR0FBYSxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3RELE9BQU8sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7Z0JBRU0sb0JBQW9CLENBQUMsS0FBZTtvQkFDekMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7b0JBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO29CQUNoQixJQUFJLElBQUksR0FBZ0IsSUFBSSxDQUFDO29CQUM3QixJQUFJLElBQUksR0FBZ0IsSUFBSSxDQUFDO29CQUM3QixJQUFJLEtBQUssR0FBNEIsSUFBSSxDQUFDO29CQUMxQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBWSxFQUFRLEVBQUU7d0JBQ25DLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7NEJBQzNCLElBQUksR0FBRyxJQUFJLENBQUM7NEJBQ1osSUFBSSxHQUFHLElBQUksQ0FBQzt5QkFDYjs2QkFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFOzRCQUNwRCxJQUFJLENBQUMsSUFBSTtnQ0FBRSxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7NEJBQzdCLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzs0QkFDaEMsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO3lCQUNqQzs2QkFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFOzRCQUNqRCxJQUFJLENBQUMsSUFBSTtnQ0FBRSxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7NEJBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUN4Qjs2QkFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQyxFQUFFOzRCQUN0RCxJQUFJLENBQUMsSUFBSTtnQ0FBRSxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7NEJBQzdCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDNUI7NkJBQU0sSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRTs0QkFDakQsSUFBSSxDQUFDLElBQUk7Z0NBQUUsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDOzRCQUM3QixNQUFNLE1BQU0sR0FBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDOzRCQUNyRixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQzt5QkFDdEY7NkJBQU0sSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUMsRUFBRTs0QkFDMUQsTUFBTSxVQUFVLEdBQVcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzs0QkFDbEQsTUFBTSxVQUFVLEdBQVcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzs0QkFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO3lCQUNsRDs2QkFBTSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7NEJBQ3hCLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDOzRCQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQzs0QkFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQ3ZCOzZCQUFNOzRCQUNMLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUU7Z0NBQzlDLElBQUksQ0FBQyxJQUFJO29DQUFFLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztnQ0FDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWM7NkJBQzdEO2lDQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUU7Z0NBQ3ZELElBQUksQ0FBQyxJQUFJO29DQUFFLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztnQ0FDN0IsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dDQUNoQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7NkJBQ2pDO2lDQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLEVBQUU7Z0NBQ3pELElBQUksQ0FBQyxJQUFJO29DQUFFLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztnQ0FDN0IsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dDQUNoQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7NkJBQ2pDO2lDQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLEVBQUU7Z0NBQ3pELElBQUksQ0FBQyxJQUFJO29DQUFFLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztnQ0FDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dDQUN6QyxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFD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