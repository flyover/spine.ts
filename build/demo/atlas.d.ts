export declare class Page {
    name: string;
    w: number;
    h: number;
    format: string;
    min_filter: string;
    mag_filter: string;
    wrap_s: string;
    wrap_t: string;
}
export declare class Site {
    page: Page;
    x: number;
    y: number;
    w: number;
    h: number;
    rotate: number;
    offset_x: number;
    offset_y: number;
    original_w: number;
    original_h: number;
    index: number;
    constructor(page: Page);
}
export declare class Data {
    pages: Page[];
    sites: {
        [key: string]: Site;
    };
    free(): void;
    import(text: string): this;
    export(text?: string): string;
    importAtlasText(text: string): this;
    exportAtlasText(text?: string): string;
    importAtlasTextLines(lines: string[]): this;
    exportAtlasTextLines(lines?: string[]): string[];
    importTpsText(tps_text: string): this;
    importTpsTextPage(tps_text: string, page_index?: number): this;
}
