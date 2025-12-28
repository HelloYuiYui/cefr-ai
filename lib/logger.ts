const DEBUG = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production';

function debug(...args: unknown[]) {
    if (DEBUG) console.debug('[debug]', ...args);
}

function info(...args: unknown[]) {
    if (DEBUG) console.info('[info]', ...args);
}

function warn(...args: unknown[]) {
    if (DEBUG) console.warn('[warn]', ...args);
}

function error(...args: unknown[]) {
    // Always show errors in non-production or when DEBUG is true
    if (DEBUG) console.error('[error]', ...args);
}

export default { debug, info, warn, error };
