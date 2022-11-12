export function atob(b64string: string): Record<any,any> {
    return JSON.parse(Buffer.from(b64string, 'base64').toString());
}