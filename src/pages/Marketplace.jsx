import React from "react";
import marketImage from "../assets/market.png"; // Импорт изображения
import "./Marketplace.css"; // Импорт стилей

const Marketplace = () => {
  return (
    <div className="marketplace-page">
      <div className="marketplace-image-container">
        <img src={marketImage} alt="Marketplace" className="marketplace-image" />
      </div>
      <div className="marketplace-content">
        <h1 className="marketplace-title" style={{ fontFamily: "LC Chalk" }}>
          Marketplace
        </h1>
        <p className="marketplace-text">
          A place to trade and exchange your NFTs. Opens after the completion of Mint.
        </p>
      </div>
    </div>
  );
};

export default Marketplace;