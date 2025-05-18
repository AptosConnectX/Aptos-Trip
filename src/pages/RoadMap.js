import React from 'react';
import roadmapImage from '../assets/ROADMAPMAIN.png'; // Импорт изображения
import './RoadMap.css'; // Подключаем стили

const RoadMap = () => {
  return (
    <div className="roadmap-page">
      {/* Основное изображение */}
      <div className="image-container">
        <img src={roadmapImage} alt="Road Map" className="roadmap-image" />
      </div>
    </div>
  );
};

export default RoadMap;
