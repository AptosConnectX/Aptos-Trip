import React from 'react';
import nftImage from '../assets/NFTCOLLECTIONMAIN.png'; // Импорт изображения
import './NFTCollection.css'; // Подключаем стили

const NFTCollection = () => {
  return (
    <div className="nft-collection-page">
      <div className="nft-image-container">
        <img src={nftImage} alt="NFT Collection" className="nft-collection-image" />
      </div>
    </div>
  );
};

export default NFTCollection;
