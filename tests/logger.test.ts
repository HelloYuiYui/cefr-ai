import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger (DEBUG=true)', () => {
    let logger: typeof import('@/lib/logger').default;

    beforeEach(async () => {
        vi.resetModules();
        process.env.DEBUG = 'true';
        process.env.NODE_ENV = 'test';
        vi.spyOn(console, 'debug').mockImplementation(() => {});
        vi.spyOn(console, 'info').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const mod = await import('@/lib/logger');
        logger = mod.default;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('debug() calls console.debug with [debug] prefix', () => {
        logger.debug('test message');
        expect(console.debug).toHaveBeenCalledWith('[debug]', 'test message');
    });

    it('info() calls console.info with [info] prefix', () => {
        logger.info('test message');
        expect(console.info).toHaveBeenCalledWith('[info]', 'test message');
    });

    it('warn() calls console.warn with [warn] prefix', () => {
        logger.warn('test message');
        expect(console.warn).toHaveBeenCalledWith('[warn]', 'test message');
    });

    it('error() calls console.error with [error] prefix', () => {
        logger.error('test message');
        expect(console.error).toHaveBeenCalledWith('[error]', 'test message');
    });

    it('passes multiple arguments through', () => {
        logger.debug('msg', 42, { key: 'value' });
        expect(console.debug).toHaveBeenCalledWith('[debug]', 'msg', 42, { key: 'value' });
    });
});

describe('logger (DEBUG=false, production)', () => {
    let logger: typeof import('@/lib/logger').default;

    beforeEach(async () => {
        vi.resetModules();
        process.env.DEBUG = 'false';
        process.env.NODE_ENV = 'production';
        vi.spyOn(console, 'debug').mockImplementation(() => {});
        vi.spyOn(console, 'info').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const mod = await import('@/lib/logger');
        logger = mod.default;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('debug() does NOT call console.debug', () => {
        logger.debug('test');
        expect(console.debug).not.toHaveBeenCalled();
    });

    it('info() does NOT call console.info', () => {
        logger.info('test');
        expect(console.info).not.toHaveBeenCalled();
    });

    it('warn() does NOT call console.warn', () => {
        logger.warn('test');
        expect(console.warn).not.toHaveBeenCalled();
    });

    it('error() does NOT call console.error', () => {
        logger.error('test');
        expect(console.error).not.toHaveBeenCalled();
    });
});
