import React, { useState, useEffect } from "react";
import "./Carousel.css";

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Массив с путями к изображениям
  const images = [
    "/images/slide1.png", // первая картинка
    "/images/slide2.png", // вторая картинка
    "/images/slide3.png"  // третья картинка
  ];

  // Автоматическое переключение слайдов каждую минуту
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 60000); // 60000 ms = 1 минута

    return () => clearInterval(interval); // Очищаем интервал при размонтировании компонента
  }, [images.length]);

  // Функция для перехода на следующий слайд
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Функция для перехода на предыдущий слайд
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="carousel">
      <div className="carousel-slide">
        <img src={images[currentIndex]} alt={`slide ${currentIndex + 1}`} />
        <button className="learn-more-button">Learn More</button>
      </div>
      <div className="carousel-controls">
        <button className="arrow left-arrow" onClick={prevSlide}>
          &#8249;
        </button>
        <button className="arrow right-arrow" onClick={nextSlide}>
          &#8250;
        </button>
      </div>
    </div>
  );
};

export default Carousel;
