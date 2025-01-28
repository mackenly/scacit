import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { dev } from './dev';
import path from 'path';
import fs from 'fs/promises';

let server: any;
let originalCwd: string;
let templatePath: string;

describe('dev CLI', () => {
    beforeAll(async () => {
        originalCwd = process.cwd();
        templatePath = path.join(__dirname, '../../src/templates/default');

        if (!await fs.access(templatePath).then(() => true).catch(() => false)) {
            console.error('Template directory does not exist!');
        }

        process.chdir(templatePath);
        server = await dev();
    });

    afterAll(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }

        // Clean up build directory
        const buildPath = path.join(templatePath, 'build');
        try {
            await fs.rm(buildPath, { recursive: true, force: true });
        } catch (error) {
            console.error('Error cleaning up build directory:', error);
        }

        process.chdir(originalCwd);
    });

    it('should log a message when the server starts', async () => {
        const consoleSpy = vi.spyOn(console, 'log');
        await dev();
        expect(consoleSpy).toHaveBeenCalledWith('✨ Site built successfully!');
        expect(consoleSpy).toHaveBeenCalledWith('Development server running at http://localhost:3000');
        consoleSpy.mockRestore();
    });

    it('should start the development server and return 200 on GET /', async () => {
        const response = await request(server).get('/');
        expect(response.status).toBe(200);
    });

    it('should return 404 on GET /non-existent', async () => {
        const response = await request(server).get('/non-existent');
        expect(response.status).toBe(404);
    });

    it('should have a footer with the current year', async () => {
        const response = await request(server).get('/');
        expect(response.text).toContain(new Date().getFullYear().toString());
        expect(response.text).toContain('<footer>');
    });

    it('should have a title with the site title', async () => {
        const response = await request(server).get('/');
        expect(response.text).toContain('<title>Home - My Scacit Site</title>');
    });

    it('should have a header with a welcome message', async () => {
        const response = await request(server).get('/');
        expect(response.text).toContain('<h1>Welcome to your new Scacit site!</h1>');
    });

    it('should have a link to the hello-world page', async () => {
        const response = await request(server).get('/');
        expect(response.text).toContain('<a href="/hello-world">Hello World</a>');
    });
});