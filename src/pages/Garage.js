import React, { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptos } from "../utils/aptosAgent";
import "./Garage.css";

// Импортируем изображения для Triple Track
import TripleTrack1 from "../assets/sets/Triple Track1.png";
import TripleTrack2 from "../assets/sets/Triple Track2.png";
import TripleTrack3 from "../assets/sets/Triple Track3.png";

// Импортируем изображения для Full Throttle
import Full1 from "../assets/sets/Full1.png";
import Full2 from "../assets/sets/Full2.png";
import Full3 from "../assets/sets/Full3.png";
import Full4 from "../assets/sets/Full4.png";
import Full5 from "../assets/sets/Full5.png";

// Импортируем изображения для Racing Elite
import RacingElite1 from "../assets/sets/RacingElite1.png";
import RacingElite2 from "../assets/sets/RacingElite2.png";
import RacingElite3 from "../assets/sets/RacingElite3.png";
import RacingElite4 from "../assets/sets/RacingElite4.png";
import RacingElite5 from "../assets/sets/RacingElite5.png";
import RacingElite6 from "../assets/sets/RacingElite6.png";
import RacingElite7 from "../assets/sets/RacingElite7.png";

const Garage = () => {
  const { account, connected } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [winChance, setWinChance] = useState(null);
  const [rarityFilter, setRarityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sets, setSets] = useState({
    tripleTrack: false,
    fullThrottle: false,
    racingElite: false,
  });
  const nftsPerPage = 8;
  const COLLECTION_ADDRESS = "0xfdd568e89bc7cd298e97e4ba42815ff2d1416cb1a19e33853317e4da4ba73182";
  const METADATA_URI = "https://harlequin-petite-puma-951.mypinata.cloud/ipfs/QmQSzDYNNnhG5HkQeij9epE2etwS2Pp9jVqmcyWvQJRH24/_metadata.json";

  const rarityOrder = {
    Mythical: 1,
    Legendary: 2,
    Epic: 3,
    Mysterious: 4,
    Rare: 5,
    Uncommon: 6,
    Common: 7,
  };

  const getRarityFromStars = (stars) => {
    switch (parseInt(stars)) {
      case 1: return "Common";
      case 2: return "Uncommon";
      case 3: return "Rare";
      case 4: return "Mysterious";
      case 5: return "Epic";
      case 6: return "Legendary";
      case 7: return "Mythical";
      default: return "Common";
    }
  };

  const getRarityGlowColor = (stars) => {
    const starCount = parseInt(stars);
    switch (starCount) {
      case 1: return "#808080"; // Серый
      case 2: return "#00FF00"; // Зелёный
      case 3: return "#FFFF00"; // Жёлтый
      case 4: return "#00FFFF"; // Голубой
      case 5: return "#800080"; // Фиолетовый
      case 6: return "#FF0000"; // Красный
      case 7: return "#FFDAB9"; // Персиковый
      default: return "#808080";
    }
  };

  const getWeightFromStars = (stars) => {
    const starCount = parseInt(stars);
    switch (starCount) {
      case 1: return 1;   // Common
      case 2: return 2;   // Uncommon
      case 3: return 4;   // Rare
      case 4: return 6;   // Mysterious
      case 5: return 10;  // Epic
      case 6: return 14;  // Legendary
      case 7: return 20;  // Mythical
      default: return 1;
    }
  };

  useEffect(() => {
    console.log("useEffect triggered. Connected:", connected, "Account:", account?.address?.toString());
    const timer = setTimeout(() => {
      if (!connected || !account) {
        console.log("Wallet not connected or account missing");
        setNfts([]);
        setFilteredNfts([]);
        setWinChance(null);
        setSets({ tripleTrack: false, fullThrottle: false, racingElite: false });
        return;
      }

      const fetchNFTsAndChance = async () => {
        try {
          console.log("Fetching NFTs for user:", account.address.toString());
          console.log("Collection address:", COLLECTION_ADDRESS);

          // Загружаем общий файл метаданных
          console.log("Fetching metadata from:", METADATA_URI);
          const metadataResponse = await fetch(METADATA_URI);
          if (!metadataResponse.ok) {
            throw new Error(`Failed to fetch metadata: ${metadataResponse.status}`);
          }
          const allMetadata = await metadataResponse.json();
          console.log("All metadata:", allMetadata);

          // Создаём маппинг id -> метаданные для быстрого доступа
          const metadataMap = {};
          allMetadata.forEach((metadata) => {
            metadataMap[metadata.id] = metadata;
          });

          // Получаем токены пользователя
          const tokens = await aptos.getAccountOwnedTokens({
            accountAddress: account.address.toString(),
          });
          console.log("Owned tokens:", tokens);

          const collectionTokens = tokens.filter(
            (token) => token.current_token_data?.collection_id === COLLECTION_ADDRESS
          );
          console.log("Collection tokens:", collectionTokens);

          if (collectionTokens.length === 0) {
            console.log("No tokens found in the collection for this user.");
            setNfts([]);
            setFilteredNfts([]);
            setWinChance(null);
            setSets({ tripleTrack: false, fullThrottle: false, racingElite: false });
            return;
          }

          let totalCount = 0;
          let rareCount = 0;
          let epicCount = 0;
          let legendaryCount = 0;
          let totalWeight = 0;

          const nftDataPromises = collectionTokens.map(async (token) => {
            if (!token.current_token_data) {
              console.error("Token data is missing for token:", token);
              return null;
            }

            const tokenProperties = token.current_token_data.token_properties;
            console.log("Token properties:", tokenProperties);
            const tokenId = tokenProperties["id"] || tokenProperties["token_id"];
            if (!tokenId) {
              console.error("Token ID not found in properties:", tokenProperties);
              return null;
            }

            // Получаем метаданные из маппинга
            const metadata = metadataMap[parseInt(tokenId)];
            if (!metadata) {
              console.error(`Metadata not found for token ID ${tokenId}`);
              return null;
            }

            const attributes = metadata.attributes.reduce((acc, attr) => {
              acc[attr.trait_type] = attr.value;
              return acc;
            }, {});
            const stars = attributes["Stars"];
            const rarity = attributes["RarityLabel"];
            const calculatedRarity = getRarityFromStars(stars);

            if (rarity !== calculatedRarity) {
              console.warn(
                `Mismatch: Token ${tokenId} has rarity ${rarity} but stars ${stars} suggest ${calculatedRarity}`
              );
            }

            const imageUri = metadata.image;
            const tokenName = metadata.name || "CarNFT";
            if (!imageUri) {
              console.error("Image URI missing in metadata:", metadata);
              return null;
            }

            // Подсчёт для наборов и шансов
            totalCount += 1;
            const starCount = parseInt(stars);
            const weight = getWeightFromStars(stars);
            totalWeight += weight;

            if (starCount >= 3) { // Rare, Mysterious, Epic, Legendary, Mythical
              rareCount += 1;
            }
            if (starCount >= 5) { // Epic, Legendary, Mythical
              epicCount += 1;
            }
            if (starCount >= 6) { // Legendary, Mythical
              legendaryCount += 1;
            }

            return {
              tokenId,
              rarity: calculatedRarity,
              stars,
              imageUri,
              tokenName,
              background: attributes["Background"],
              car: attributes["Car"],
              frameColor: attributes["FrameColor"],
            };
          });

          const nftData = (await Promise.all(nftDataPromises)).filter(
            (data) => data !== null
          );
          console.log("NFT data:", nftData);

          const sortedNfts = nftData.sort((a, b) => {
            return rarityOrder[a.rarity] - rarityOrder[b.rarity];
          });
          setNfts(sortedNfts);
          setFilteredNfts(sortedNfts);
          console.log("Sorted NFTs by rarity:", sortedNfts);

          // Подсчёт наборов
          const setsStatus = {
            tripleTrack: totalCount >= 3,
            fullThrottle: totalCount >= 5 && rareCount >= 2 && (totalCount - rareCount) >= 1,
            racingElite: totalCount >= 7 && legendaryCount >= 1 && epicCount >= 2 && rareCount >= 3,
          };
          console.log("Sets status:", setsStatus);
          setSets(setsStatus);

          // Подсчёт шансов на победу (адаптировано из get_total_win_chance)
          let setBonusWeight = 0;
          if (totalCount >= 3) setBonusWeight += 4;
          if (totalCount >= 5 && rareCount >= 2 && (totalCount - rareCount) >= 1) setBonusWeight += 12;
          if (totalCount >= 7 && legendaryCount >= 1 && epicCount >= 2 && rareCount >= 3) setBonusWeight += 25;

          const walletWeight = totalWeight * 10 + setBonusWeight;
          const totalPossibleSetBonus = (200 / 3) * 4 + (200 / 5) * 12 + (200 / 7) * 25;
          const adjustedTotalWeight = (74 * 1 + 50 * 2 + 40 * 4 + 21 * 6 + 10 * 10 + 4 * 14 + 1 * 20) * 10 + totalPossibleSetBonus;
          const chance = (walletWeight * 10000) / adjustedTotalWeight;
          const cappedChance = Math.min(chance, 300); // Ограничение 3%
          console.log("Calculated win chance:", cappedChance);
          setWinChance(cappedChance);
        } catch (error) {
          console.error("Ошибка загрузки NFT или шансов:", error);
          setNfts([]);
          setFilteredNfts([]);
          setWinChance(null);
          setSets({ tripleTrack: false, fullThrottle: false, racingElite: false });
        }
      };

      fetchNFTsAndChance();
    }, 500);

    return () => clearTimeout(timer);
  }, [account, connected]);

  const handleRarityFilter = (rarity) => {
    console.log("Applying rarity filter:", rarity);
    setRarityFilter(rarity);
    setCurrentPage(1);
    if (rarity === "All") {
      setFilteredNfts(nfts);
    } else {
      setFilteredNfts(
        nfts.filter((nft) => {
          const nftRarity = getRarityFromStars(nft.stars);
          console.log(`Filtering NFT ${nft.tokenId}: stars=${nft.stars}, calculated rarity=${nftRarity}, filter=${rarity}`);
          return nftRarity === rarity;
        })
      );
    }
  };

  const indexOfLastNft = currentPage * nftsPerPage;
  const indexOfFirstNft = indexOfLastNft - nftsPerPage;
  const currentNfts = filteredNfts.slice(indexOfFirstNft, indexOfLastNft);
  const totalPages = Math.ceil(filteredNfts.length / nftsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="garage-page">
      <div className="garage-content">
        {/* Левая часть: фильтры, NFT и пагинация */}
        <div className="nft-section">
          {!connected ? (
            <p className="no-nfts-message">Please connect your wallet to view your NFTs.</p>
          ) : nfts.length === 0 ? (
            <p className="no-nfts-message">No NFTs found in your garage.</p>
          ) : (
            <>
              <div className="filter-container">
                <div className="rarity-filter">
                  <button
                    className={rarityFilter === "All" ? "filter-button active" : "filter-button"}
                    onClick={() => handleRarityFilter("All")}
                  >
                    All
                  </button>
                  {Object.keys(rarityOrder).map((rarity) => (
                    <button
                      key={rarity}
                      className={rarityFilter === rarity ? "filter-button active" : "filter-button"}
                      onClick={() => handleRarityFilter(rarity)}
                    >
                      {rarity}
                    </button>
                  ))}
                </div>
              </div>
              <div className="nft-grid">
                {currentNfts.map((nft) => (
                  <div
                    key={nft.tokenId}
                    className="nft-card"
                    style={{
                      boxShadow: `0 0 40px ${getRarityGlowColor(nft.stars)}`,
                    }}
                  >
                    <img
                      src={nft.imageUri}
                      alt={nft.tokenName}
                      className="nft-image"
                    />
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination">
                    {currentPage > 1 && (
                      <button className="pagination-button" onClick={handlePrevPage}>
                        Previous
                      </button>
                    )}
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="pagination-button"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {/* Правая часть: расчёты и сеты */}
        <div className="stats-column">
          <div className="win-chance-container">
            <h2 className="stats-title">Racing Stats</h2>
            {winChance !== null && connected ? (
              <div className="win-chance">
                <p className="chance-label">Total Victory Chance:</p>
                <p className="chance-value">{(winChance / 100).toFixed(2)}%</p>
                <div className="chance-bar">
                  <div
                    className="chance-fill"
                    style={{ width: `${Math.min(winChance / 3, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="no-chance-message">Connect wallet to see your chances.</p>
            )}
          </div>
          <div className="sets-section">
            <h3 className="sets-title">Your Collected Sets</h3>
            <div className="set-container">
              <div className="set-images-wrapper">
                <div className="set-images-container">
                  <img src={TripleTrack3} alt="Triple Track 3" className="set-image set-image-3" />
                  <img src={TripleTrack2} alt="Triple Track 2" className="set-image set-image-2" />
                  <img src={TripleTrack1} alt="Triple Track 1" className="set-image set-image-1" />
                </div>
              </div>
              <div className="set-info">
                <h4 className="set-name">Triple Track</h4>
                <p className="set-description">3 NFTs of any rarity</p>
                <p className="set-bonus">
                  Bonus Chance: {sets.tripleTrack ? "0.00258%" : "Not Unlocked"}
                </p>
              </div>
            </div>
            <div className="set-container">
              <div className="set-images-wrapper">
                <div className="set-images-container">
                  <img src={Full5} alt="Full Throttle 5" className="set-image set-image-5" />
                  <img src={Full4} alt="Full Throttle 4" className="set-image set-image-4" />
                  <img src={Full3} alt="Full Throttle 3" className="set-image set-image-3" />
                  <img src={Full2} alt="Full Throttle 2" className="set-image set-image-2" />
                  <img src={Full1} alt="Full Throttle 1" className="set-image set-image-1" />
                </div>
              </div>
              <div className="set-info">
                <h4 className="set-name">Full Throttle</h4>
                <p className="set-description">5 NFTs (1 Rare, 1 Uncommon)</p>
                <p className="set-bonus">
                  Bonus Chance: {sets.fullThrottle ? "0.00774%" : "Not Unlocked"}
                </p>
              </div>
            </div>
            <div className="set-container">
              <div className="set-images-wrapper">
                <div className="set-images-container">
                  <img src={RacingElite7} alt="Racing Elite 7" className="set-image set-image-7" />
                  <img src={RacingElite6} alt="Racing Elite 6" className="set-image set-image-6" />
                  <img src={RacingElite5} alt="Racing Elite 5" className="set-image set-image-5" />
                  <img src={RacingElite4} alt="Racing Elite 4" className="set-image set-image-4" />
                  <img src={RacingElite3} alt="Racing Elite 3" className="set-image set-image-3" />
                  <img src={RacingElite2} alt="Racing Elite 2" className="set-image set-image-2" />
                  <img src={RacingElite1} alt="Racing Elite 1" className="set-image set-image-1" />
                </div>
              </div>
              <div className="set-info">
                <h4 className="set-name">Racing Elite</h4>
                <p className="set-description">7 NFTs (1 Legendary, 1 Epic, 1 Rare)</p>
                <p className="set-bonus">
                  Bonus Chance: {sets.racingElite ? "0.0161%" : "Not Unlocked"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Garage;