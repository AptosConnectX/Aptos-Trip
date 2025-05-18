import React, { useState, useEffect } from 'react';
import { AptosClient, AptosAccount, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import rarityData from './assets/rarity_data.json'; // Импортируем JSON напрямую
import { Buffer } from 'buffer';

// Полифилл для Buffer, чтобы работать в браузере
window.Buffer = Buffer;

const InitializeContract = () => {
    const [status, setStatus] = useState('Initializing...');
    const [error, setError] = useState(null);

    const creatorPrivateKeyHex = "0x93fc20c554e857a8cd7eeaabbc6ce199468207b6924d7ac3c5020bcfd1a66865";
    const expectedAccountAddress = "0x6c949011b612d398bfe80a9307e3ade4ba61f6e6678451b4da5b35dad07c934a";
    const FULLNODE_URL = "https://fullnode.mainnet.aptoslabs.com/v1";
    const TOTAL_NFTS = 200;

    // Функция для получения ссылки на транзакцию в Aptos Explorer (взято из NFTMint)
    const getExplorerLink = (txnHash) => {
        return `https://explorer.aptoslabs.com/txn/${txnHash}?network=mainnet`;
    };

    useEffect(() => {
        const initializeContract = async () => {
            setStatus("=== Initializing Contract ===");
            try {
                // Используем импортированный rarityData
                console.log("Rarity data loaded, total NFTs:", rarityData.length);
                setStatus(prev => `${prev}\nRarity data loaded, total NFTs: ${rarityData.length}`);

                // Проверка длины
                if (rarityData.length !== TOTAL_NFTS) {
                    throw new Error(`Expected ${TOTAL_NFTS} NFTs, but got ${rarityData.length}`);
                }

                // Подготавливаем данные для вызова initialize
                const tokenIds = rarityData.map(item => item.id);
                const rarityLabels = rarityData.map(item => item.rarity);
                const stars = rarityData.map(item => item.stars);

                console.log("tokenIds (first 10):", tokenIds.slice(0, 10));
                console.log("rarityLabels (first 10):", rarityLabels.slice(0, 10));
                console.log("stars (first 10):", stars.slice(0, 10));
                setStatus(prev => `${prev}\ntokenIds (first 10): ${JSON.stringify(tokenIds.slice(0, 10))}`);
                setStatus(prev => `${prev}\nrarityLabels (first 10): ${JSON.stringify(rarityLabels.slice(0, 10))}`);
                setStatus(prev => `${prev}\nstars (first 10): ${JSON.stringify(stars.slice(0, 10))}`);

                // Параметры для initialize
                const ipfsLink = "https://amaranth-raw-lemur-681.mypinata.cloud/ipfs/bafkreidle2d6vkof3su6ypq3wzjemmy52w7ov3lb77datmcz55a7nyr6qa";
                const totalCars = 16;
                console.log("IPFS Link:", ipfsLink);
                console.log("Total Cars:", totalCars);
                setStatus(prev => `${prev}\nIPFS Link: ${ipfsLink}`);
                setStatus(prev => `${prev}\nTotal Cars: ${totalCars}`);

                // Инициализация AptosClient
                const client = new AptosClient(FULLNODE_URL);

                // Создаём аккаунт из приватного ключа
                const privateKeyBytes = Buffer.from(creatorPrivateKeyHex.slice(2), 'hex');
                const privateKey = new Ed25519PrivateKey(privateKeyBytes);
                const account = AptosAccount.fromPrivateKey(privateKey);

                console.log("Derived account address:", account.accountAddress.toString());
                setStatus(prev => `${prev}\nDerived account address: ${account.accountAddress.toString()}`);
                if (account.accountAddress.toString() !== expectedAccountAddress) {
                    throw new Error(`Derived account address ${account.accountAddress.toString()} does not match expected ${expectedAccountAddress}`);
                }

                // Формируем транзакцию (используем метод из AptosClient, как в NFTMint)
                const rawTxn = await client.generateTransaction(
                    account.accountAddress,
                    {
                        function: `${expectedAccountAddress}::artikasatkav105::initialize`,
                        type_arguments: [],
                        arguments: [
                            ipfsLink, // string
                            totalCars, // u64
                            tokenIds, // vector<u64>
                            rarityLabels, // vector<String>
                            stars, // vector<u64>
                        ],
                    },
                    {
                        maxGasAmount: 500000, // Увеличиваем лимит газа
                    }
                );

                console.log("Transaction payload:", rawTxn);
                setStatus(prev => `${prev}\nTransaction payload: ${JSON.stringify(rawTxn, null, 2)}`);

                // Подписываем транзакцию
                const bcsTxn = await client.signTransaction(account, rawTxn);

                // Отправляем транзакцию
                const pendingTxn = await client.submitTransaction(bcsTxn);

                console.log("Transaction hash:", pendingTxn.hash);
                setStatus(prev => `${prev}\nTransaction hash: ${pendingTxn.hash}`);
                setStatus(prev => `${prev}\nExplorer link: ${getExplorerLink(pendingTxn.hash)}`);

                // Ждём подтверждения транзакции (взято из NFTMint)
                const txnResult = await client.waitForTransactionWithResult(pendingTxn.hash, {
                    timeoutSecs: 600, // Ждём до 10 минут
                });

                if (!txnResult.success) {
                    throw new Error(`Transaction failed: ${JSON.stringify(txnResult, null, 2)}\nExplorer link: ${getExplorerLink(pendingTxn.hash)}`);
                }

                console.log("Transaction executed successfully:", txnResult);
                setStatus(prev => `${prev}\nTransaction executed successfully: ${JSON.stringify(txnResult, null, 2)}`);
                setStatus(prev => `${prev}\nContract initialized successfully!`);
            } catch (error) {
                console.error("=== Error Initializing Contract ===");
                console.error("Error message:", error.message);
                console.error("Error stack:", error.stack);
                setError(`Error: ${error.message}`);
                setStatus(prev => `${prev}\n=== Error Initializing Contract ===\nError message: ${error.message}`);
            }
        };

        initializeContract();
    }, []);

    return (
        <div>
            <h2>Initialize Contract</h2>
            <pre>{status}</pre>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default InitializeContract;