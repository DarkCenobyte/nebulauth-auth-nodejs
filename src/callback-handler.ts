import type { chainProvider, ContractCheckResult } from "./contract-checker";
import { ContractChecker } from "./contract-checker";
import { atobJson, lowerifyKey } from './helpers';

export type responseHeaders = {
    [k: string]: string|undefined;
    "x-nebulauth-uniquetoken": string;
    "x-nebulauth-response": string;
    "x-nebulauth-optional"?: string;
};
export type responseParameters = {
    [k: string]: string|undefined;
    nebulauth_response: string;
    nebulauth_optional?: string;
};
export type loginResult = {
    result: ContractCheckResult,
    optionalData?: OptionalData;
}

type response = responseHeaders | responseParameters;

export class OptionalData {
    private username?: string;
    private mail?: string;

    constructor(optional?: string) {
        if (optional !== undefined) {
            const optionalObj = atobJson(optional);
            this.username = optionalObj.username;
            this.mail = optionalObj.mail;
        }
    }

    public getData() {
        return {
            username: this.username,
            mail: this.mail
        };
    }
}

export class CallbackHandler {
    private response: string;
    private optional?: string;
    private chainProvider: chainProvider;
    private isTestnet: boolean;

    constructor(response: response, chainProvider: chainProvider, isTestnet: boolean = false) {
        this.chainProvider = chainProvider;
        this.isTestnet = isTestnet;
        lowerifyKey(response);
        
        if (response['x-nebulauth-response'] !== undefined) {
            this.response = response['x-nebulauth-response'];
            this.optional = response['x-nebulauth-optional'];
        } else if (response['nebulauth_response']) {
            this.response = response['nebulauth_response'];
            this.optional = response['nebulauth_optional'];
        } else {
            throw new Error('Invalid response');
        }
    }

    public async handle(minimalWeight?: number): Promise<loginResult> {
        const contractChecker = new ContractChecker(this.chainProvider, this.isTestnet);
        let result: ContractCheckResult;
        if (minimalWeight !== undefined) {
            result = await contractChecker.checkValidityForWeight(this.response, minimalWeight);
        } else {
            result = await contractChecker.checkValidity(this.response);
        }
        if (result.isValid) {
            const optionalData = new OptionalData(this.optional);
            return {
                result,
                optionalData
            };
        }
        return {result};
    }
}