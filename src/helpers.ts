import { ContractAuthErrors } from "./contract-auth-errors";

export function atobJson(b64string: string): Record<any,any> {
    try {
        return JSON.parse(Buffer.from(b64string, 'base64').toString());
    } catch (err) {
        return {};
    }
}

export function lowerifyKey(response: {[k:string]: unknown}) {
    for (const i in response) {
        response[i.toLowerCase()] = response[i];
    }
}

export function isAuthenticationError(err: Error) {
    if (! err.message) {
        return false;
    }
    for (const errorMsg of Object.values(ContractAuthErrors)) {
        if (err.message.includes(errorMsg)) {
            return true;
        }
    }

    return false;
}