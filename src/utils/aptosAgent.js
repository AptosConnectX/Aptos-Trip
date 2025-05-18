import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { NETWORK } from "../constants";

// Настройка конфигурации Aptos
const aptosConfig = new AptosConfig({ network: NETWORK === "mainnet" ? Network.MAINNET : Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export { aptos };