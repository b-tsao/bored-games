const production = process.env.NODE_ENV === 'production';
const logfn = production ? () => undefined : console.log;
const errorfn = console.error;

export function info(...args: any[]) {
    logfn('INFO:', ...args);
}
export function error(...args: any[]) {
    errorfn('ERROR:', ...args);
}