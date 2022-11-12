import type { Hex } from 'web3-utils';
import type BN from 'bn.js';

import { HttpProvider, IpcProvider, WebsocketProvider, AbstractProvider } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { atob } from './helpers';
import Web3 from 'web3';

type chainProvider = HttpProvider
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
const _TESTNET_CHAIN_ID: number = 11155111; // Sepolia chainId
const _MAINNET_CHAIN_ID: number = 1; // Ethereum chainId

export class ContractCheckResult {
    public isValid: boolean;
    public userAddress: Hex;

    constructor(isValid: boolean, userAddress: Hex) {
        this.isValid = isValid;
        this.userAddress = userAddress;
    }
};

export class ContractChecker {
    private web3: Web3;
    private contract: Contract;
    private chainId: number;

    constructor(chainProvider: chainProvider, isTestnet = false) {
        this.web3 = new Web3(chainProvider);
        this.contract = new Contract(
            require('./abi/NebulAuth.abi.json'),
            isTestnet ? _NEBULAUTH_TESTNET_CONTRACT_ADDRESS : _NEBULAUTH_MAINNET_CONTRACT_ADDRESS
        );
        this.chainId = isTestnet ? _TESTNET_CHAIN_ID : _MAINNET_CHAIN_ID;
    }

    public async checkValidity(response: string|callbackReponse): Promise<ContractCheckResult> {
        if (typeof response === 'string') {
            response = <callbackReponse> atob(response);
        }
        const message = response.message;
        const results = await this.contract.methods.checkSignAndMetadata(
            message.websiteDomain,
            message.currentBlock,
            message.uniqueToken,
            response.signature
        ).call({}, 'latest');

        return new ContractCheckResult(results[0], results[1]);
    }

    public async checkValidityForWeight(response: string|callbackReponse, minimalWeight: number = 10): Promise<ContractCheckResult> {
        if (typeof response === 'string') {
            response = <callbackReponse> atob(response);
        }
        const message = response.message;
        const results = await this.contract.methods.checkSignAndMetadata(
            message.websiteDomain,
            message.currentBlock,
            message.uniqueToken,
            response.signature,
            minimalWeight
        ).call({}, 'latest');

        return new ContractCheckResult(results[0], results[1]);
    }
}