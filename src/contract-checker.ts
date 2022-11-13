import type { Hex } from 'web3-utils';
import type { Contract } from 'web3-eth-contract';
import type { HttpProvider, IpcProvider, WebsocketProvider, AbstractProvider } from 'web3-core';
import type BN from 'bn.js';

import { atobJson, isAuthenticationError } from './helpers';

export type chainProvider = HttpProvider
    | IpcProvider
    | WebsocketProvider
    | AbstractProvider
;

export type message = {
    websiteDomain: string;
    currentBlock: BN;
    uniqueToken: Hex;
};
export type callbackReponse = {
    message: message;
    signature: string;
};

const _NEBULAUTH_TESTNET_CONTRACT_ADDRESS: string = '0x738F7DCe5c7812BC3425eCF35a59a2f21E8cbD69'; // Sepolia NebulAuth contract
const _NEBULAUTH_MAINNET_CONTRACT_ADDRESS: string = '0x9A265c447351B0E2A6Dc50082cC6652789E578a4'; // Ethereum MainNet contract

export class ContractCheckResult {
    public isValid: boolean;
    public userAddress?: Hex;

    constructor(isValid: boolean, userAddress?: Hex) {
        this.isValid = isValid;
        this.userAddress = userAddress;
    }
};

export class ContractChecker {
    private contract: Contract;

    constructor(chainProvider: chainProvider, isTestnet = false) {
        const web3contract = require('web3-eth-contract');
        web3contract.setProvider(chainProvider);
        this.contract = new web3contract(
            require('./abi/NebulAuth.abi.json'),
            isTestnet ? _NEBULAUTH_TESTNET_CONTRACT_ADDRESS : _NEBULAUTH_MAINNET_CONTRACT_ADDRESS
        );
    }

    public async checkValidity(response: string|callbackReponse): Promise<ContractCheckResult> {
        if (typeof response === 'string') {
            response = <callbackReponse> atobJson(response);
        }
        const message = response.message;
        try {
            const results = await this.contract.methods.checkSignAndMetadata(
                message.websiteDomain,
                message.currentBlock,
                message.uniqueToken,
                response.signature
            ).call({}, 'latest');
            return new ContractCheckResult(results[0], results[1]);
        } catch (err: any) {
            if (isAuthenticationError(err)) {
                return new ContractCheckResult(false);
            } else {
                console.error(err);
                throw err;
            }
        }
    }

    public async checkValidityForWeight(response: string|callbackReponse, minimalWeight: number = 10): Promise<ContractCheckResult> {
        if (typeof response === 'string') {
            response = <callbackReponse> atobJson(response);
        }
        const message = response.message;
        try {
            const results = await this.contract.methods.checkSignAndMetadata(
                message.websiteDomain,
                message.currentBlock,
                message.uniqueToken,
                response.signature,
                minimalWeight
            ).call({}, 'latest');
            return new ContractCheckResult(results[0], results[1]);
        } catch (err: any) {
            if (isAuthenticationError(err)) {
                return new ContractCheckResult(false);
            } else {
                console.error(err);
                throw err;
            }
        }
    }
}