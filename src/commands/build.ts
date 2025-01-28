import { build as esbuild } from 'esbuild';
import frontMatter from 'front-matter';
import MarkdownIt from 'markdown-it';
import highlightjs from 'markdown-it-highlightjs';
import { full as emoji } from 'markdown-it-emoji';
import footnote_plugin from 'markdown-it-footnote';
import sub_plugin from 'markdown-it-sub';
import sup_plugin from 'markdown-it-sup';
import ins_plugin from 'markdown-it-ins';
import mark_plugin from 'markdown-it-mark';
// @ts-expect-error
import deflist_plugin from 'markdown-it-deflist';
// @ts-expect-error
import abbr_plugin from 'markdown-it-abbr';
import container_plugin from 'markdown-it-container';
import path from 'path';
import fs from 'fs-extra';
import { glob } from 'glob';
import { TemplateEngine } from '../engine/template';

import type { ScacitConfig } from '../types/config';

export async function build() {
    const config: { default: ScacitConfig }  = await import(path.join(process.cwd(), 'scacit.config.ts'));
    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
    }).use(highlightjs, {
        inline: true,
    }).use(emoji)
    .use(footnote_plugin)
    // @ts-expect-error
    .use(sub_plugin)
    // @ts-expect-error
    .use(sup_plugin)
    // @ts-expect-error
    .use(ins_plugin)
    // @ts-expect-error
    .use(mark_plugin)
    .use(deflist_plugin)
    .use(abbr_plugin)
    .use(container_plugin, 'note')
    .use(container_plugin, 'tip')
    .use(container_plugin, 'important')
    .use(container_plugin, 'warning')
    .use(container_plugin, 'caution');


    // Create build directory
    await fs.emptyDir(config.default.build.outDir);

    // Build content
    const contentFiles = await glob('content/**/*.md');
    for (const file of contentFiles) {
        const content = await fs.readFile(file, 'utf-8');
        let { attributes, body }: { attributes: any; body: string } = frontMatter(content);
        const html = md.render(body);

        if (config.default.site.baseUrl) {
            const slug = path.basename(file, '.md');
            if (slug === 'index') {
                attributes.slug = '';
            } else {
                attributes.slug = slug;
            }
            attributes.url = `${config.default.site.baseUrl}/${attributes.slug}`;
        }

        if (!attributes.date) {
            // get the date from the file 
            const stats = await fs.stat(file);
            attributes.date = stats.birthtime.toISOString().split('T')[0];
        }

        if (!attributes.updated) {
            // get the date from the file 
            const stats = await fs.stat(file);
            attributes.updated = stats.mtime.toISOString().split('T')[0];
        }

        if (!attributes.title) {
            attributes.title = path.basename(file, '.md')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (char: string) => char.toUpperCase());
        }

        if (!attributes.description) {
            attributes.description = html
            .replace(/<[^>]*>/g, '')
            .replace(/\n/g, ' ')
            .slice(0, 160);
        }

        if (!attributes.type) {
            if (attributes.tags || attributes.image) {
                attributes.type = 'Article';
            } else {
                attributes.type = 'WebPage';
            }
        }

        if (attributes.image) {
            if (!attributes.image.startsWith('http')) {
                attributes.image = new URL(attributes.image, config.default.site.baseUrl).toString();
            }
        }

        const layout = await fs.readFile('layout.html', 'utf-8');
        const renderedPage = await TemplateEngine.render(layout, {
            site: config.default.site,
            post: attributes,
            content: html,
        });

        // Create cleaner URLs by putting each post in its own directory with index.html
        const slug = path.basename(file, '.md');
        const outPath = path.join(
            config.default.build.outDir,
            slug === 'index' ? 'index.html' : `${slug}/index.html`
        );
        await fs.outputFile(outPath, renderedPage);
    }

    // Build assets
    if (config.default.build.assets.bundle) {
        const currentDir = process.cwd();

        await esbuild({
            entryPoints: [path.join(currentDir, 'assets/scripts.ts')],
            bundle: true,
            minify: config.default.build.assets.minify,
            outfile: path.join(currentDir, config.default.build.outDir, 'scripts.js'),
            absWorkingDir: currentDir, // Add this line
        });

        await esbuild({
            entryPoints: [path.join(currentDir, 'assets/styles.css')],
            bundle: true,
            minify: config.default.build.assets.minify,
            outfile: path.join(currentDir, config.default.build.outDir, 'styles.css'),
            absWorkingDir: currentDir, // Add this line
        });
    }

    console.log('✨ Site built successfully!');
}