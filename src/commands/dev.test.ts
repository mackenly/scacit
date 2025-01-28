import { describe, it, expect, vi } from 'vitest';
import { getConfig, getAvailablePort } from './dev';
import path from 'path';
import net from 'net';
import type { ScacitConfig } from '../types/config';

vi.mock('path');
vi.mock('net');

const mockConfig: { default: ScacitConfig } = {
    default: {
        site: {
            title: 'My Scacit Site',
            description: 'Built with Scacit',
            year: new Date().getFullYear(),
            robots: 'noindex, nofollow',
            baseUrl: 'http://localhost:3000',
        },
        build: {
            outDir: 'build',
            assets: {
                bundle: true,
                minify: true,
            },
        }
    }
};

describe('getConfig', () => {
    it('should load development config by default', async () => {
        vi.spyOn(path, 'join').mockReturnValue('mocked/path');
        vi.mock('mocked/path', () => mockConfig);

        const config = await getConfig();
        expect(config.default.build.environment).toBe('development');

        const config2 = await getConfig('development');
        expect(config2.default.build.environment).toBe('development');
    });

    it('should load production config when specified', async () => {
        vi.spyOn(path, 'join').mockReturnValue('mocked/path');
        vi.mock('mocked/path', () => mockConfig);

        const config = await getConfig('production');
        expect(config.default.build.environment).toBe('production');
    });
});

describe('getAvailablePort', () => {
    it('should return the starting port if it is available', async () => {
        const mockServer = {
            once: vi.fn((event, callback) => {
                if (event === 'listening') {
                    callback();
                }
            }),
            close: vi.fn()
        };
        vi.spyOn(net, 'createServer').mockReturnValue(mockServer as any);

        const port = await getAvailablePort(3000);
        expect(port).toBe(3000);
        expect(mockServer.close).toHaveBeenCalled();
    });

    it('should return the next available port if the starting port is in use', async () => {
        let callCount = 0;
        const mockServer = {
            once: vi.fn((event, callback) => {
                if (event === 'error' && callCount === 0) {
                    callCount++;
                    callback({ code: 'EADDRINUSE' });
                } else if (event === 'listening') {
                    callback();
                }
            }),
            close: vi.fn()
        };
        vi.spyOn(net, 'createServer').mockReturnValue(mockServer as any);

        const port = await getAvailablePort(3000);
        expect(port).toBe(3001);
    });

    it('should reject if an unexpected error occurs', async () => {
        const mockServer = {
            once: vi.fn((event, callback) => {
                if (event === 'error') {
                    callback({ code: 'UNKNOWN' });
                }
            }),
            close: vi.fn()
        };
        vi.spyOn(net, 'createServer').mockReturnValue(mockServer as any);

        await expect(getAvailablePort(3000)).rejects.toEqual({ code: 'UNKNOWN' });
    });
});