function trim(s: string): string {
  return s.replace(/^\s+|\s+$/g, "");
}

export class Page {
  public name: string = "";
  public w: number = 0;
  public h: number = 0;
  public format: string = "RGBA8888";
  public min_filter: string = "linear";
  public mag_filter: string = "linear";
  public wrap_s: string = "clamp-to-edge";
  public wrap_t: string = "clamp-to-edge";
}

export class Site {
  public page: Page;
  public x: number = 0;
  public y: number = 0;
  public w: number = 0;
  public h: number = 0;
  public rotate: number = 0;
  public offset_x: number = 0;
  public offset_y: number = 0;
  public original_w: number = 0;
  public original_h: number = 0;
  public index: number = -1;
  constructor(page: Page) {
    this.page = page;
  }
}

export class Data {
  public pages: Page[] = [];
  public sites: {[key: string]: Site} = {};

  public free(): void {
    this.pages = [];
    this.sites = {};
  }

  public import(text: string): this {
    return this.importAtlasText(text);
  }

  public export(text: string = ""): string {
    return this.exportAtlasText(text);
  }

  public importAtlasText(text: string): this {
    const lines: string[] = text.split(/\n|\r\n/);
    return this.importAtlasTextLines(lines);
  }

  public exportAtlasText(text: string = ""): string {
    const lines: string[] = this.exportAtlasTextLines([]);
    return text + lines.join("\n");
  }

  public importAtlasTextLines(lines: string[]): this {
    this.pages = [];
    this.sites = {};
    let page: Page | null = null;
    let site: Site | null = null;
    let match: RegExpMatchArray | null = null;
    lines.forEach((line: string): void => {
      if (trim(line).length === 0) {
        page = null;
        site = null;
      }
      else if ((match = line.match(/^size: (.*),(.*)$/))) {
        if (!page) throw new Error();
        page.w = parseInt(match[1], 10);
        page.h = parseInt(match[2], 10);
      }
      else if ((match = line.match(/^format: (.*)$/))) {
        if (!page) throw new Error();
        page.format = match[1];
      }
      else if ((match = line.match(/^filter: (.*),(.*)$/))) {
        if (!page) throw new Error();
        page.min_filter = match[1];
        page.mag_filter = match[2];
      }
      else if ((match = line.match(/^repeat: (.*)$/))) {
        if (!page) throw new Error();
        const repeat: string = match[1];
        page.wrap_s = ((repeat === "x") || (repeat === "xy")) ? ("Repeat") : ("ClampToEdge");
        page.wrap_t = ((repeat === "y") || (repeat === "xy")) ? ("Repeat") : ("ClampToEdge");
      }
      else if ((match = line.match(/^orig: (.*)[,| x] (.*)$/))) {
        const original_w: number = parseInt(match[1], 10);
        const original_h: number = parseInt(match[2], 10);
        console.log("page:orig", original_w, original_h);
      }
      else if (page === null) {
        page = new Page();
        page.name = line;
        this.pages.push(page);
      }
      else {
        if ((match = line.match(/^ {2}rotate: (.*)$/))) {
          if (!site) throw new Error();
          site.rotate = (match[1] === "true") ? -1 : 0; // -90 degrees
        }
        else if ((match = line.match(/^ {2}xy: (.*), (.*)$/))) {
          if (!site) throw new Error();
          site.x = parseInt(match[1], 10);
          site.y = parseInt(match[2], 10);
        }
        else if ((match = line.match(/^ {2}size: (.*), (.*)$/))) {
          if (!site) throw new Error();
          site.w = parseInt(match[1], 10);
          site.h = parseInt(match[2], 10);
        }
        else if ((match = line.match(/^ {2}orig: (.*), (.*)$/))) {
          if (!site) throw new Error();
          site.original_w = parseInt(match[1], 10);
          site.original_h = parseInt(match[2], 10);
        }
        else if ((match = line.match(/^ {2}offset: (.*), (.*)$/))) {
          if (!site) throw new Error();
          site.offset_x = parseInt(match[1], 10);
          site.offset_y = parseInt(match[2], 10);
        }
        else if ((match = line.match(/^ {2}index: (.*)$/))) {
          if (!site) throw new Error();
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

  public exportAtlasTextLines(lines: string[] = []): string[] {
    this.pages.forEach((page: Page): void => {
      lines.push(""); // empty line denotes new page
      lines.push(page.name);
      lines.push("size: " + page.w + "," + page.h);
      lines.push("format: " + page.format);
      lines.push("filter: " + page.min_filter + "," + page.mag_filter);
      let repeat: string = "none";
      if ((page.wrap_s === "Repeat") && (page.wrap_t === "Repeat")) { repeat = "xy"; }
      else if (page.wrap_s === "Repeat") { repeat = "x"; }
      else if (page.wrap_t === "Repeat") { repeat = "y"; }
      lines.push("repeat: " + repeat);
      Object.keys(this.sites).forEach((site_key: string): void => {
        const site: Site = this.sites[site_key];
        if (site.page !== page) { return; }
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

  public importTpsText(tps_text: string): this {
    this.pages = [];
    this.sites = {};
    return this.importTpsTextPage(tps_text, 0);
  }

  public importTpsTextPage(tps_text: string, page_index: number = 0): this {
    const tps_json: any = JSON.parse(tps_text);
    const page: Page = this.pages[page_index] = new Page();
    if (tps_json.meta) {
      // TexturePacker only supports one page
      page.w = tps_json.meta.size.w;
      page.h = tps_json.meta.size.h;
      page.name = tps_json.meta.image;
    }
    Object.keys(tps_json.frames || {}).forEach((key: string): void => {
      const frame: any = tps_json.frames[key];
      const site: Site = this.sites[key] = new Site(page);
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
}
