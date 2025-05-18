// src/Logo.js
import React, { useState, useEffect } from "react";
import logo from "./assets/logo.png"; // Импортируйте изображение

const Logo = () => {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prevPosition) => prevPosition + 10); // Сдвигаем логотип на 10px вправо
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "absolute", left: position }}>
      <img src={logo} alt="Logo" /> {/* Используем импортированное изображение */}
    </div>
  );
};

export default Logo;
