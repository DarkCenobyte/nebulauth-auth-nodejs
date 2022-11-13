import type { Hex } from 'web3-utils';
import { randomHex, isHexStrict } from 'web3-utils';

type parameters = {
    websiteDomain: string;
    callback?: string;
    redirect: string;
    uniqueToken: Hex;
};

export const NEBULAUTH_MAINNET_AUTH_URL = 'https://auth.nebulauth.one/';
export const NEBULAUTH_TESTNET_AUTH_URL = 'https://auth-test.nebulauth.one/';

export class ParametersBuilder {
    public static generateParameters(websiteDomain: string, redirectUrl: string, callbackUrl?: string, uniqueToken?: Hex): parameters {
        if (uniqueToken !== undefined && ! isHexStrict(uniqueToken)) {
            throw new Error('Invalid uniqueToken, must be Hex and pass web3.utils.isHexStrict check');
        }
        if (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://')) {
            throw new Error('callbackUrl MUST be a relative url, like: "/path/to/redirect"');
        }
        if (websiteDomain.startsWith('http://')) {
            console.warn('WARNING: Using HTTP protocol is unsecure for your users and HIGHLY discouraged, please use HTTPS if your not working in a development environment');
        }
        if (! (websiteDomain.startsWith('http://') || websiteDomain.startsWith('https://')) || /^(https:\/\/|http:\/\/).*[\/]/.test(websiteDomain)) {
            throw new Error('Invalid websiteDomain, must include protocol and not contain any "/" after the tld, like: https://mydomain.tld or https://www.mydomain.tld');
        }
        if (callbackUrl !== undefined && (callbackUrl.startsWith('http://') || callbackUrl.startsWith('https://'))) {
            throw new Error('redirectUrl MUST be a relative url, like: "/path/to/callback"');
        }
        return {
            websiteDomain,
            callback: callbackUrl,
            redirect: redirectUrl,
            uniqueToken: uniqueToken !== undefined ? uniqueToken : this.generateUniqueToken()
        };
    }

    public static generateUniqueToken(length: number = 32): Hex {
        return randomHex(length);
    }

    public static buildAuthenticationUrl(websiteDomain: string, redirectUrl: string, callbackUrl?: string, uniqueToken?: Hex, isTestnet = false): string {
        return (isTestnet ? NEBULAUTH_TESTNET_AUTH_URL : NEBULAUTH_MAINNET_AUTH_URL) + '?' + new URLSearchParams(<Record<string, any>> this.generateParameters(websiteDomain, redirectUrl, callbackUrl, uniqueToken)).toString();
    }
}