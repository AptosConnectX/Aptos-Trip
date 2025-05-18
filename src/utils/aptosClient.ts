import { NETWORK } from "@/constants";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Определяем конфигурацию для сети
const getAptosConfig = () => {
  switch (NETWORK) {
    case "mainnet":
      return new AptosConfig({
        network: Network.MAINNET,
        fullnode: "https://fullnode.mainnet.aptoslabs.com/v1",
      });
    // Добавь другие сети, если нужно (например, testnet)
    case "testnet":
      return new AptosConfig({
        network: Network.TESTNET,
        fullnode: "https://fullnode.testnet.aptoslabs.com/v1",
      });
    default:
      throw new Error(`Unsupported network: ${NETWORK}. Supported networks are 'mainnet' and 'testnet'.`);
  }
};

// Создаем единственный экземпляр клиента
const aptos = new Aptos(getAptosConfig());

// Функция для получения клиента
export function aptosClient() {
  return aptos;
}

// Экспортируем для тестирования (опционально)
export default aptos;