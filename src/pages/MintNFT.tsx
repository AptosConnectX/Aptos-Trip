import { useState, useEffect, useRef } from "react";
import "./MintNFT.css";
import questionMarkImage from "../assets/question-mark.png";
import nftFirstImage from "../assets/nftfirst.png";
import viewbumerImage from "../assets/viewbumer.png";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "../utils/aptosClient";
import { mintTripNFT } from "../entry-functions/mint_nft";
import { TransactionHash } from "../components/TransactionHash";
import { Aptos } from "@aptos-labs/ts-sdk";

import startRaceVideo from "../assets/araka.mp4";

interface NFTData {
  tokenId: string;
  rarity: string;
  imageUri: string;
  tokenName: string;
}

function MintNFTPage() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [remainingNFTs, setRemainingNFTs] = useState<number | null>(null);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [nftData, setNftData] = useState<NFTData | null>(null);
  const [showNFT, setShowNFT] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showSilhouettePlaceholder, setShowSilhouettePlaceholder] = useState<boolean>(true); // Новое состояние для заглушки
  const aptos: Aptos = aptosClient();
  const contractAddress: string = "0x6c949011b612d398bfe80a9307e3ade4ba61f6e6678451b4da5b35dad07c934a";
  const COLLECTION_ADDRESS: string = "0xfdd568e89bc7cd298e97e4ba42815ff2d1416cb1a19e33853317e4da4ba73182";
  const MINT_PRICE: number = 100000; // 0.1 APT
  const TOTAL_NFTS: number = 200;

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.5;
    }
  }, [showAnimation]);

  const getRarityGlowColor = (rarity: string | undefined) => {
    switch (rarity) {
      case "Common": return "#2f3944";
      case "Uncommon": return "#2fb383";
      case "Rare": return "#eaff78";
      case "Mysterious": return "#9fcdff";
      case "Epic": return "#a735ff";
      case "Legendary": return "#ff2727";
      case "Mythical": return "#fc5390";
      default: return "#ffffff";
    }
  };

  const fetchBalance = async () => {
    if (!account) return;
    try {
      const balance = await aptos.getAccountCoinAmount({
        accountAddress: account.address,
        coinType: "0x1::aptos_coin::AptosCoin",
      });
      setBalance(balance);
    } catch (error) {
      console.error("Ошибка получения баланса:", error);
    }
  };

  const checkIfInitialized = async (): Promise<boolean> => {
    try {
      const resource = await aptos.getAccountResource({
        accountAddress: contractAddress,
        resourceType: `${contractAddress}::artikasatkav103::MintedNFTs`,
      });
      return !!resource;
    } catch (error) {
      console.error("Ошибка проверки инициализации:", error);
      return false;
    }
  };

  const fetchRemainingNFTs = async () => {
    try {
      const mintedNfts = await aptos.getAccountResource({
        accountAddress: contractAddress,
        resourceType: `${contractAddress}::artikasatkav103::MintedNFTs`,
      });
      const totalMinted = Number((mintedNfts.data as any).total_minted);
      setRemainingNFTs(TOTAL_NFTS - totalMinted);
    } catch (error) {
      console.error("Ошибка получения оставшихся NFT:", error);
      setRemainingNFTs(null);
    }
  };

  const fetchUserNFT = async (userAddress: string): Promise<NFTData | null> => {
    try {
      const tokens = await aptos.getAccountOwnedTokens({
        accountAddress: userAddress,
      });
      const collectionTokens = tokens.filter(
        (token) => token.current_token_data?.collection_id === COLLECTION_ADDRESS
      );
      if (collectionTokens.length === 0) return null;

      const token = collectionTokens[collectionTokens.length - 1];
      if (!token.current_token_data) throw new Error("Token data is missing");

      const tokenProperties = token.current_token_data.token_properties;
      const tokenId = tokenProperties["id"];

      const rarityResponse = await aptos.view({
        payload: {
          function: `${contractAddress}::artikasatkav103::get_rarity`,
          typeArguments: [],
          functionArguments: [parseInt(tokenId)],
        },
      });
      const rarity = rarityResponse[0] as string;

      const tokenUri = token.current_token_data.token_uri;
      const response = await fetch(tokenUri);
      if (!response.ok) throw new Error(`Failed to fetch token URI: ${tokenUri}`);
      const metadata = await response.json();

      const imageUri = metadata.image || viewbumerImage;
      const tokenName = metadata.name || "CarNFT";

      return { tokenId, rarity, imageUri, tokenName };
    } catch (error) {
      console.error("Ошибка получения NFT:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchRemainingNFTs();
  }, [account, connected, aptos, contractAddress]);

  const handleMint = async () => {
    if (!connected || !account) {
      alert("Подключите кошелёк!");
      return;
    }
    const isInitialized = await checkIfInitialized();
    if (!isInitialized) {
      alert("Контракт не инициализирован. Сначала инициализируйте его.");
      return;
    }
    if (remainingNFTs === 0) {
      alert("NFT закончились!");
      return;
    }
    if (balance !== null && balance < MINT_PRICE) {
      alert("Недостаточно средств для минта (требуется 0.1 APT)!");
      return;
    }
    try {
      setIsMinting(true);
      const payload = mintTripNFT();
      const response = await signAndSubmitTransaction(payload);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      setTransactionHash(response.hash);

      await new Promise(resolve => setTimeout(resolve, 5000));
      const nft = await fetchUserNFT(account.address.toString());
      setNftData(nft);
      fetchRemainingNFTs();

      if (nft) {
        setShowAnimation(true);
        setShowSilhouettePlaceholder(true); // Убедимся, что заглушка активна
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
      console.error("Ошибка минта NFT:", error);
      alert(`Ошибка минта: ${errorMessage}`);
    } finally {
      setIsMinting(false);
    }
  };

  const handleRevealNFT = () => {
    setShowSilhouettePlaceholder(false); // Переключаем на NFT
    setShowAnimation(false);
    setShowNFT(true);
  };

  const handleCloseNFT = () => {
    setShowNFT(false);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "What is Aptos Trip?",
      answer: "Aptos Trip is a collection of 5,000 unique NFTs and a travel show about car adventures, streamed on YouTube (<a href='https://www.youtube.com/@MR_Chaizy' target='_blank'>@MR_Chaizy</a>)."
    },
    {
      question: "What do Aptos Trip NFTs offer?",
      answer: "NFT holders receive bonuses from partners and the project for early support. One random holder will get a sports car or 80% of its market value in APT (based on mobile.de). This is a community reward, not a lottery."
    },
    {
      question: "Is Aptos Trip a lottery?",
      answer: "No, Aptos Trip NFTs are collectible tokens. The sports car is a bonus for holders, not a gambling prize, per legal standards."
    },
    {
      question: "Are NFTs loot boxes?",
      answer: "No, they are collectible tokens with unique art and random rarity. You get an NFT and a chance at bonuses for supporting the project."
    },
    {
      question: "Does minting guarantee a sports car?",
      answer: "No, minting or buying an NFT does not guarantee a sports car. It’s a bonus for one random holder."
    },
    {
      question: "What are the chances of getting the sports car?",
      answer: `Each NFT has a chance based on rarity and collected sets, with a wallet cap of 3%.<br/>
      <strong>Rarity Weights:</strong><br/>
      - Common: 1 (0.00645%)<br/>
      - Uncommon: 2 (0.0129%)<br/>
      - Rare: 4 (0.0258%)<br/>
      - Mysterious: 6 (0.0387%)<br/>
      - Epic: 10 (0.0645%)<br/>
      - Legendary: 14 (0.0903%)<br/>
      - Mythical: 20 (0.129%)<br/>
      <strong>Set Weights:</strong><br/>
      - Triple Track (3 NFTs): +0.4<br/>
      - Full Throttle (5 NFTs, 1 Rare, 1 Uncommon): +1.2<br/>
      - Racing Elite (7 NFTs, 1 Legendary, 1 Epic, 1 Rare): +2.5<br/>
      <strong>Formula:</strong> Chance = (NFT weight × quantity + set weights) / 15,500 × 100%. Excess above 3% is redistributed by the smart contract.<br/>
      <strong>Example Chances:</strong><br/>
      - Beginner (~$60–100): 0.02–0.06%<br/>
      - Average (~$130–200): 0.08–0.15%<br/>
      - Collector (~$300–400): 0.2–0.4%<br/>
      - Whale (~$2000–5000): up to 3%`
    },
    {
      question: "When will the sports car recipient be chosen?",
      answer: "The recipient will be selected on June 1, 2026, using Aptos Randomness API, if all 5,000 NFTs are minted."
    },
    {
      question: "How many NFTs will be released?",
      answer: "5,000 unique collectible tokens."
    },
    {
      question: "What is the travel show?",
      answer: "A car adventure series streamed on YouTube (<a href='https://www.youtube.com/@MR_Chaizy' target='_blank'>@MR_Chaizy</a>), showcasing journeys and car culture."
    },
    {
      question: "Where can I learn more?",
      answer: "Details on our website and official X (<a href='https://x.com/AptosTrip' target='_blank'>@AptosTrip</a>). Follow updates on YouTube."
    }
  ];

  return (
    <div className="mint-nft-page">
      <div className="mint-nft-container">
        <div className="image-container">
          <img src={questionMarkImage} alt="Mystery Car" className="mystery-car-image" />
        </div>
        <div className="right-container">
          <div className="mission-container">
            <img src={nftFirstImage} alt="Mission" className="mission-image" />
          </div>
          <div className="controls-container">
            <div className="mint-info">
              <p>Mint Price: 0.001 APT</p>
              {/* Убрали строку с Remaining */}
            </div>
            {remainingNFTs === 0 ? (
              <p className="sold-out-message">SOLD OUT</p>
            ) : (
              <button
                onClick={handleMint}
                className="mint-nft-button"
                disabled={isMinting}
              >
                {isMinting ? "Minting..." : "Mint NFT"}
              </button>
            )}
          </div>
          {transactionHash && (
            <div className="transaction-container">
              <h3 className="transaction-title">Your Transaction:</h3>
              <div className="transaction-content">
                <TransactionHash hash={transactionHash} />
              </div>
            </div>
          )}
        </div>
      </div>
      {showAnimation && (
        <div className="animation-overlay" onClick={handleRevealNFT}>
          <video
            className="start-race-video"
            autoPlay
            playsInline
            ref={videoRef}
            onEnded={() => {
              document.querySelector(".nft-silhouette")?.classList.add("reveal");
            }}
          >
            <source src={startRaceVideo} type="video/mp4" />
            Ваш браузер не поддерживает видео тег.
          </video>
          <div className="nft-silhouette">
            <img
              src={showSilhouettePlaceholder ? viewbumerImage : (nftData?.imageUri || viewbumerImage)}
              alt="NFT Placeholder"
              className="nft-silhouette-image"
            />
          </div>
        </div>
      )}
      {showNFT && nftData && (
        <div className="nft-reveal-container" onClick={handleCloseNFT}>
          <h2 className="nft-reveal-title">Congratulations!</h2>
          <img
            src={nftData.imageUri}
            alt="Minted NFT"
            className="nft-reveal-image"
            style={{
              boxShadow: `0 0 20px ${getRarityGlowColor(nftData.rarity)}, 0 0 50px ${getRarityGlowColor(nftData.rarity)}`,
            }}
          />
        </div>
      )}
      <div className="faq-section" id="faq">
        <h2 className="faq-title">FAQs</h2>
        <div className="faq-list">
          {faqData.map((faq, index) => (
            <div key={index} className="faq-item">
              <div
                className="faq-question"
                onClick={() => toggleFaq(index)}
              >
                {faq.question}
                <span className={`faq-arrow ${openFaqIndex === index ? "open" : ""}`}>▼</span>
              </div>
              <div
                className={`faq-answer ${openFaqIndex === index ? "open" : ""}`}
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MintNFTPage;