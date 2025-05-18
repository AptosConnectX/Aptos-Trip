import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

const MODULE_ADDRESS = "0x6c949011b612d398bfe80a9307e3ade4ba61f6e6678451b4da5b35dad07c934a";

export const mintTripNFT = (): InputTransactionData => {
  return {
    data: {
      function: `${MODULE_ADDRESS}::artikasatkav103::mint_nft`,
      typeArguments: [],
      functionArguments: [],
    },
  };
};