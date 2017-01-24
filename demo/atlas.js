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
                        const site = this.sites[key] = new Site();
                        site.page = page;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXRsYXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhdGxhcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUFBLGNBQWMsQ0FBUztRQUNyQixNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckMsQ0FBQzs7Ozs7WUFFRCxPQUFBO2dCQUFBO29CQUNTLFNBQUksR0FBVyxFQUFFLENBQUM7b0JBQ2xCLE1BQUMsR0FBVyxDQUFDLENBQUM7b0JBQ2QsTUFBQyxHQUFXLENBQUMsQ0FBQztvQkFDZCxXQUFNLEdBQVcsVUFBVSxDQUFDO29CQUM1QixlQUFVLEdBQVcsUUFBUSxDQUFDO29CQUM5QixlQUFVLEdBQVcsUUFBUSxDQUFDO29CQUM5QixXQUFNLEdBQVcsZUFBZSxDQUFDO29CQUNqQyxXQUFNLEdBQVcsZUFBZSxDQUFDO2dCQUMxQyxDQUFDO2FBQUEsQ0FBQTs7WUFFRCxPQUFBO2dCQUFBO29CQUVTLE1BQUMsR0FBVyxDQUFDLENBQUM7b0JBQ2QsTUFBQyxHQUFXLENBQUMsQ0FBQztvQkFDZCxNQUFDLEdBQVcsQ0FBQyxDQUFDO29CQUNkLE1BQUMsR0FBVyxDQUFDLENBQUM7b0JBQ2QsV0FBTSxHQUFXLENBQUMsQ0FBQztvQkFDbkIsYUFBUSxHQUFXLENBQUMsQ0FBQztvQkFDckIsYUFBUSxHQUFXLENBQUMsQ0FBQztvQkFDckIsZUFBVSxHQUFXLENBQUMsQ0FBQztvQkFDdkIsZUFBVSxHQUFXLENBQUMsQ0FBQztvQkFDdkIsVUFBSyxHQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixDQUFDO2FBQUEsQ0FBQTs7WUFFRCxPQUFBO2dCQUFBO29CQUNTLFVBQUssR0FBVyxFQUFFLENBQUM7b0JBQ25CLFVBQUssR0FBMEIsRUFBRSxDQUFDO2dCQTJKM0MsQ0FBQztnQkF6SlEsSUFBSTtvQkFDVCxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztvQkFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7b0JBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQztnQkFFTSxNQUFNLENBQUMsSUFBWTtvQkFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7Z0JBRU0sTUFBTSxDQUFDLE9BQWUsRUFBRTtvQkFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7Z0JBRU0sZUFBZSxDQUFDLElBQVk7b0JBQ2pDLE1BQU0sS0FBSyxHQUFhLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFDLENBQUM7Z0JBRU0sZUFBZSxDQUFDLE9BQWUsRUFBRTtvQkFDdEMsTUFBTSxLQUFLLEdBQWEsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN0RCxNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7Z0JBRU0sb0JBQW9CLENBQUMsS0FBZTtvQkFDekMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7b0JBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO29CQUNoQixJQUFJLElBQUksR0FBZ0IsSUFBSSxDQUFDO29CQUM3QixJQUFJLElBQUksR0FBZ0IsSUFBSSxDQUFDO29CQUM3QixJQUFJLEtBQUssR0FBNEIsSUFBSSxDQUFDO29CQUMxQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBWTt3QkFDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUM1QixJQUFJLEdBQUcsSUFBSSxDQUFDOzRCQUNaLElBQUksR0FBRyxJQUFJLENBQUM7d0JBQ2QsQ0FBQzt3QkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNyRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7NEJBQzdCLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzs0QkFDaEMsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUNsQyxDQUFDO3dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ2xELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQzs0QkFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3pCLENBQUM7d0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDdkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0NBQUMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDOzRCQUM3QixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDM0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzdCLENBQUM7d0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDbEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0NBQUMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDOzRCQUM3QixNQUFNLE1BQU0sR0FBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQzs0QkFDckYsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO3dCQUN2RixDQUFDO3dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQzNELE1BQU0sVUFBVSxHQUFXLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7NEJBQ2xELE1BQU0sVUFBVSxHQUFXLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7NEJBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQzt3QkFDbkQsQ0FBQzt3QkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQ3pCLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDOzRCQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQzs0QkFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3hCLENBQUM7d0JBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ04sRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUMvQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7Z0NBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYzs0QkFDOUQsQ0FBQzs0QkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUN4RCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7Z0NBQzdCLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQ0FDaEMsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDOzRCQUNsQyxDQUFDOzRCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQzFELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29DQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztnQ0FDN0IsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dDQUNoQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7NEJBQ2xDLENBQUM7NEJBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDMUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0NBQUMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO2dDQUM3QixJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0NBQ3pDLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzs0QkFDM0MsQ0FBQzs0QkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUM1RCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7Z0NBQzdCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQ0FDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDOzRCQUN6QyxDQUFDOzRCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ3JELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29DQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztnQ0FDN0IsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDOzRCQUN0QyxDQUFDOzRCQUFDLElBQUksQ0FBQyxDQUFDO2dDQUNOLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0NBQ1QsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7b0NBQzVDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dDQUM5QyxDQUFDO2dDQUNELElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO2dDQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQ0FDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7NEJBQzFCLENBQUM7d0JBQ0gsQ0FBQztvQkFDSCxDQUFDLENBQUMsQ0FBQztvQkFDSCxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNkLENBQUM7Z0JBRU0sb0JBQW9CLENBQUMsUUFBa0IsRUFBRTtvQkFDOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFVO3dCQUM1QixLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsOEJBQThCO3dCQUM5QyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDdEIsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUM3QyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3JDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDakUsSUFBSSxNQUFNLEdBQVcsTUFBTSxDQUFDO3dCQUM1QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO3dCQUFDLENBQUM7d0JBQ2hGLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7NEJBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQzt3QkFBQyxDQUFDO3dCQUNwRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDOzRCQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7d0JBQUMsQ0FBQzt3QkFDcEQsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUM7d0JBQ2hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQWdCOzRCQUMvQyxNQUFNLElBQUksR0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzRCQUN4QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0NBQUMsTUFBTSxDQUFDOzRCQUFDLENBQUM7NEJBQ25DLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7NEJBQ3JCLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7NEJBQ2xFLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDOUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNoRCxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7NEJBQ2xFLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzs0QkFDaEUsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN2QyxDQUFDLENBQUMsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztvQkFDSCxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUNmLENBQUM7Z0JBRU0sYUFBYSxDQUFDLFFBQWdCO29CQUNuQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztvQkFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7b0JBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxDQUFDO2dCQUVNLGlCQUFpQixDQUFDLFFBQWdCLEVBQUUsYUFBcUIsQ0FBQztvQkFDL0QsTUFBTSxRQUFRLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDM0MsTUFBTSxJQUFJLEdBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO29CQUN2RCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDbEIsdUNBQXVDO3dCQUN2QyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDOUIsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQzlCLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBQ2xDLENBQUM7b0JBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQVc7d0JBQ3JELE1BQU0sS0FBSyxHQUFRLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3hDLE1BQU0sSUFBSSxHQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQzt3QkFDaEQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7d0JBQ2pCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ3ZCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ3ZCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ3ZCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsYUFBYTt3QkFDbEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUMxRSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQzFFLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDckUsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUN2RSxDQUFDLENBQUMsQ0FBQztvQkFDSCxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNkLENBQUM7YUFDRixDQUFBOztRQUNELENBQUMifQ==