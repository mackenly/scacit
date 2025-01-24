import express from 'express';
import chokidar from 'chokidar';
import path from 'path';
import { build } from './build';

export async function dev() {
    // Build initially
    await build();

    // Start dev server
    const app = express();
    let config = await import(path.join(process.cwd(), 'scacit.config.ts'));

    app.use(express.static(config.default.build.outDir));

    const server = app.listen(3000, () => {
        console.log('Development server running at http://localhost:3000');
    });

    // Watch for changes
    const watcher = chokidar.watch([
        'content/**/*.md',
        'components/**/*.html',
        'assets/**/*',
        'layout.html',
        'scacit.config.ts'
    ]);

    watcher.on('change', async (path) => {
        console.log(`File ${path} changed, rebuilding...`);
        await build();
        console.log('Rebuild complete!');
    });

    process.on('SIGINT', () => {
        server.close();
        watcher.close();
        process.exit(0);
    });
}