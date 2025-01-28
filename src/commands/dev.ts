import express from 'express';
import type { Server } from 'http';
import chokidar from 'chokidar';
import path from 'path';
import net from 'net';
import { build } from './build';
import type { ScacitConfig } from '../types/config';

export async function getConfig(environment: 'development' | 'production' | undefined = 'development'): Promise<{ default: ScacitConfig }> {
    let config = await import(path.join(process.cwd(), 'scacit.config.ts'));
    config.default.build.environment = environment;
    return config;
}

export async function getAvailablePort(startingPort: number): Promise<number> {
    return new Promise((resolve, reject) => {
        const port = startingPort;
        const server = net.createServer();

        server.once('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                resolve(getAvailablePort(port + 1));
            } else {
                reject(err);
            }
        });

        server.once('listening', () => {
            server.close();
            resolve(port);
        });

        server.listen(port);
    });
}

export async function dev(): Promise<Server> {
    // Build initially
    await build();

    // Start dev server
    const app = express();
    let config = await getConfig();

    app.use(express.static(config.default.build.outDir));

    const startingPort = 3000;
    const port = await getAvailablePort(startingPort);

    const server: Server = app.listen(port, () => {
        console.log(`Development server running at http://localhost:${port}`);
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
        console.log(`File ${path} changed, rebuilding and restarting...`);
        server.close(async () => {
            await build();
            config = await getConfig();
            server.listen(port, () => {
                console.log('Development server restarted');
            });
        });
    });

    process.on('SIGINT', () => {
        server.close();
        watcher.close();
        process.exit(0);
    });

    return server;
}