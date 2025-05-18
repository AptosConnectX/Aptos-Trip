import { PropsWithChildren, useEffect, useState } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { useToast } from "@/components/ui/use-toast";

// Функция для преобразования строки сети в тип Network
const getNetwork = (network: string): Network => {
  switch (network.toLowerCase()) {
    case "mainnet":
      return Network.MAINNET;
    case "testnet":
      return Network.TESTNET;
    case "devnet":
      return Network.DEVNET;
    default:
      return Network.MAINNET;
  }
};

export function WalletProvider({ children }: PropsWithChildren) {
  const { toast } = useToast();
  const [autoConnect, setAutoConnect] = useState<boolean>(false);

  // Читаем сеть из переменной окружения
  const network = process.env.REACT_APP_NETWORK || "mainnet";
  const aptosNetwork = getNetwork(network);

  // Сохраняем состояние autoConnect в localStorage
  useEffect(() => {
    const autoConnectStored = localStorage.getItem("autoConnect");
    if (autoConnectStored) {
      setAutoConnect(autoConnectStored === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("autoConnect", autoConnect.toString());
  }, [autoConnect]);

  return (
    <AptosWalletAdapterProvider
      autoConnect={autoConnect}
      dappConfig={{ network: aptosNetwork }}
      onError={(error) => {
        toast({
          variant: "destructive",
          title: "Wallet Error",
          description: typeof error === "string" ? error : (error as Error).message || "Unknown wallet error",
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}