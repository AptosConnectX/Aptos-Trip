import React, { useState, useEffect } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import "./GrandPrize.css";
import grandImage from "../assets/Grand.png";

const GrandPrize = () => {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [votes, setVotes] = useState({});
  const [cars, setCars] = useState([]);
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [hasVoted, setHasVoted] = useState({});
  const [daysLeft, setDaysLeft] = useState(0);
  const [progress, setProgress] = useState(0);

  const config = new AptosConfig({ network: Network.MAINNET });
  const aptos = new Aptos(config);
  const contractAddress = "0x6c949011b612d398bfe80a9307e3ade4ba61f6e6678451b4da5b35dad07c934a";
  const collectionAddress = "0xfdd568e89bc7cd298e97e4ba42815ff2d1416cb1a19e33853317e4da4ba73182";

  // Расчёт оставшихся дней и прогресса
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const targetDate = new Date("2026-06-01T00:00:00");
      const totalDays = 400; // Общее количество дней с 27 апреля 2025 до 1 июня 2026
      const difference = targetDate - now;
      const days = Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24)));
      const progressPercent = Math.min(100, ((totalDays - days) / totalDays) * 100);
      setDaysLeft(days);
      setProgress(progressPercent);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 86400000); // Обновляем раз в день
    return () => clearInterval(interval);
  }, []);

  const fetchJsonUri = async () => {
    try {
      const uri = await aptos.view({
        payload: {
          function: `${contractAddress}::artikasatkav103::get_ipfs_link`,
          typeArguments: [],
          functionArguments: [],
        },
      });
      console.log("Получен IPFS URI:", uri[0]);
      return uri[0];
    } catch (error) {
      console.error("Ошибка получения URI:", error);
      return null;
    }
  };

  const fetchCars = async () => {
    try {
      const uri = await fetchJsonUri();
      if (!uri) return;
      console.log("Попытка загрузки данных по URI:", uri);
      const response = await fetch(uri);
      const data = await response.json();
      console.log("Загруженные данные машин:", data);
      setCars(data);
    } catch (error) {
      console.error("Ошибка загрузки списка машин:", error);
    }
  };

  const fetchOwnedTokens = async () => {
    if (!account) return;
    try {
      const address = typeof account.address === "string" ? account.address : account.address.toString();
      const tokens = await aptos.getAccountOwnedTokens({
        accountAddress: address,
      });
      const owned = tokens.filter((token) => token.current_token_data?.collection_id === collectionAddress);
      setOwnedTokens(
        owned.map((token) => ({
          address: token.token_data_id,
          id: token.token_data_id,
          tokenObject: token.token_object,
        }))
      );
    } catch (error) {
      console.error("Ошибка получения NFT:", error);
    }
  };

  const fetchProposals = async () => {
    if (cars.length === 0) return;
    try {
      const updatedProposals = [];
      for (let i = 0; i < cars.length; i++) {
        const votes = await aptos.view({
          payload: {
            function: `${contractAddress}::artikasatkav103::get_votes`,
            typeArguments: [],
            functionArguments: [i.toString()],
          },
        });
        updatedProposals.push({
          id: i,
          carId: i,
          totalVotes: parseInt(votes[0]),
        });
      }
      setProposals(updatedProposals);
      const updatedVotes = {};
      updatedProposals.forEach((proposal) => {
        const car = cars.find((c) => c.id === proposal.carId);
        if (car) updatedVotes[car.name] = proposal.totalVotes;
      });
      setVotes(updatedVotes);
    } catch (error) {
      console.error("Ошибка получения голосов:", error);
    }
  };

  const checkHasVoted = async (proposalId) => {
    if (!account) return;
    try {
      const address = typeof account.address === "string" ? account.address : account.address.toString();
      const remainingVotes = await aptos.view({
        payload: {
          function: `${contractAddress}::artikasatkav103::get_remaining_votes`,
          typeArguments: [],
          functionArguments: [address],
        },
      });
      const hasVotedForProposal = parseInt(remainingVotes[0]) === 0;
      setHasVoted((prev) => ({ ...prev, [proposalId]: hasVotedForProposal }));
    } catch (error) {
      console.error("Ошибка проверки голосования:", error);
      setHasVoted((prev) => ({ ...prev, [proposalId]: false }));
    }
  };

  const handleVote = async (carId) => {
    if (!connected) {
      alert("Пожалуйста, подключите кошелёк.");
      return;
    }
    if (ownedTokens.length === 0) {
      alert("У вас нет NFT для голосования. Пожалуйста, заминтите NFT.");
      return;
    }
    if (hasVoted[carId]) {
      alert("Вы уже проголосовали.");
      return;
    }

    try {
      const transaction = {
        data: {
          function: `${contractAddress}::artikasatkav103::vote`,
          typeArguments: [],
          functionArguments: [carId],
        },
      };
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      alert(`Голос за ${cars.find((c) => c.id === carId).name} засчитан!`);
      fetchProposals();
      checkHasVoted(carId);
    } catch (error) {
      console.error("Ошибка при голосовании:", error);
      alert("Ошибка при голосовании. Проверьте консоль.");
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    fetchOwnedTokens();
    fetchProposals();
  }, [account, connected, cars]);

  useEffect(() => {
    proposals.forEach((proposal) => checkHasVoted(proposal.id));
  }, [proposals, account]);

  const sortedCars = [...cars].sort((a, b) => {
    const votesA = votes[a.name] || 0;
    const votesB = votes[b.name] || 0;
    return votesB - votesA;
  });

  return (
    <div className="grand-prize-page">
      <div className="countdown-section">
        <h1 className="countdown-title">Countdown</h1>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <span className="days-left">{daysLeft} days left</span>
        </div>
      </div>
      <div className="blacklist-container">
        <h1 className="blacklist-title">Pick a sports car to raffle off</h1>
        <div className="car-list">
          {cars.length === 0 ? (
            <p className="loading-text">Загрузка списка машин...</p>
          ) : (
            sortedCars.map((car) => {
              const proposal = proposals.find((p) => p.carId === car.id);
              const isDisabled = (proposal && hasVoted[car.id]) || ownedTokens.length === 0;
              return (
                <div key={car.id} className="car-item">
                  <div className="car-name-container">
                    <span className="car-name">{car.name || "Название отсутствует"}</span>
                  </div>
                  <div className="vote-section">
                    <span className="vote-count">{votes[car.name] || 0}</span>
                    <button
                      onClick={() => handleVote(car.id)}
                      className="vote-button"
                      disabled={isDisabled}
                    >
                      {hasVoted[car.id] ? "Voted" : "Vote"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="spacer"></div>
      </div>
    </div>
  );
};

export default GrandPrize;