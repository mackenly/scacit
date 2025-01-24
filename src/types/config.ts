export interface ScacitConfig {
    site: SiteProperties;
    build: BuildOptions;
}

export interface ScacitContext {
    site: SiteProperties;
    post?: any;
    [key: string]: any;
}

export interface SiteProperties {
    title: string;
    description: string;
    year: number;
    robots: 'noindex, nofollow' | 'index, follow';
    baseUrl: string;
    twitter?: {
        site?: string;
        creator?: string;
    }
    [key: string]: any;
}

export interface PostProperties {
    title?: string;
    description?: string;
    date: string;
    updated: string;
    slug: string;
    url: string;
    type: 'Article' | 'WebPage';
    tags?: string;
    image?: string;
    [key: string]: any;
}

export interface BuildOptions {
    outDir: string;
    assets: {
        bundle: boolean;
        minify: boolean;
    };
}