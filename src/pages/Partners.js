// pages/Partners.js
import React from "react";
import partnersImage from "../assets/PARTNERSIMAGE.png"; // Импорт изображения
import "./Partners.css"; // Подключаем стили

const Partners = () => {
  return (
    <div className="partners-page">
      <div className="image-container">
        <img src={partnersImage} alt="Partners" className="partners-image" />
      </div>
      <div className="footer-text">
        <p>"These are fictional partners and part of the Aptos Trip owner's fantasy"</p>
      </div>
    </div>
  );
};

export default Partners;