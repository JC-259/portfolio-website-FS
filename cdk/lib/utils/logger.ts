export const logger = {
    info: (msg: string, meta?: Record<string, any>) => {
        console.log(JSON.stringify({ level: 'info', message: msg, ...meta, timestamp: new Date().toISOString() }));
    },
    warn: (msg: string, meta?: Record<string, any>) => {
        console.error(JSON.stringify({ level: 'warn', message: msg, ...meta, timestamp: new Date().toISOString() }));
    },
    error: (msg: string, meta?: Record<string, any>) => {
        console.error(JSON.stringify({ level: 'error', message: msg, ...meta, timestamp: new Date().toISOString() }));
    }
};