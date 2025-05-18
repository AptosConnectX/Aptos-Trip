import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Gratitude from "./components/Gratitude";
import TripRoute from "./pages/TripRoute";
import NFTCollection from "./pages/NFTCollection";
import MintNFT from "./pages/MintNFT";
import RoadMap from "./pages/RoadMap";
import Partners from "./pages/Partners";
import Marketplace from "./pages/Marketplace";
import Garage from "./pages/Garage";
import GrandPrize from "./pages/GrandPrize";
import "./pages/MainPageImage.css";
import mainImage from "./assets/MAINPAGEIMAGE.png";
import TermsAndConditions from "./legal/TermsAndConditions";
import PrivacyPolicy from "./legal/PrivacyPolicy";
import { WalletProvider } from "./components/WalletProvider";
import { ReactQueryClientProvider } from "./components/ReactQueryClientProvider";

// Компонент для главной страницы
function MainPage() {
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showCover, setShowCover] = useState(true); // Состояние для обложки
  const location = useLocation();

  const handlePlayVideo = () => {
    const video = videoRef.current;
    if (video) {
      video
        .play()
        .then(() => {
          setIsVideoPlaying(true);
          setShowCover(false); // Скрываем обложку при воспроизведении
          console.log("Video started playing manually");
        })
        .catch((error) => {
          console.error("Error playing video manually:", error);
          alert("Failed to play video. Please check your connection or try again.");
        });
    }
  };

  const handlePauseVideo = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsVideoPlaying(false);
      // Обложка НЕ возвращается при паузе
      console.log("Video paused manually");
    }
  };

  const handleVideoClick = () => {
    if (isVideoPlaying) {
      handlePauseVideo();
    } else {
      handlePlayVideo();
    }
  };

  const handleCanPlay = () => {
    setIsVideoLoaded(true);
    console.log("Video can play");
  };

  const handleError = (e) => {
    console.error("Error loading video:", e);
    setIsVideoLoaded(false);
    alert("Error loading video. Please try refreshing the page.");
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      console.error("Video element not found");
      return;
    }

    // Сбрасываем видео до первого кадра при каждом монтировании
    video.currentTime = 0;
    setIsVideoPlaying(false);
    setIsVideoLoaded(false);
    setShowCover(true); // Показываем обложку при монтировании

    video.volume = 0.5;
    video.oncanplay = handleCanPlay;
    video.onerror = handleError;
  }, [location.pathname]); // Сбрасываем при изменении пути

  return (
    <div className="main-page-container">
      <div className="main-image-container">
        <img src={mainImage} alt="Main Page" className="main-image" />
        <div className="buttons-container">
          <Link to="/nft-collection" className="learn-more-button">
            Learn More
          </Link>
          <Link to="/mint-nft" className="mint-nft-button">
            Mint NFT
          </Link>
        </div>
        <div className="video-container">
          <video
            ref={videoRef}
            className="main-video"
            loop
            playsInline
            preload="auto"
            onClick={handleVideoClick}
            onCanPlay={handleCanPlay}
            onError={handleError}
          >
            <source src="/assets/0323.webm" type="video/webm" />
            <source src="/assets/0323.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {showCover && isVideoLoaded && (
            <button className="play-video-button" onClick={handlePlayVideo}>
              ▶
            </button>
          )}
          {!isVideoLoaded && (
            <div className="play-video-button" style={{ background: "gray", cursor: "default" }}>
              Loading...
            </div>
          )}
        </div>
      </div>
      <div className="gradient-transition">
        <Gratitude />
      </div>
    </div>
  );
}

function App() {
  return (
    <ReactQueryClientProvider>
      <WalletProvider>
        <Router>
          <div className="relative flex size-full min-h-screen flex-col bg-[#121a21] dark group/design-root overflow-x-hidden">
            <Header />
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/trip-route" element={<TripRoute />} />
                <Route path="/nft-collection" element={<NFTCollection />} />
                <Route path="/mint-nft" element={<MintNFT />} />
                <Route path="/garage" element={<Garage />} />
                <Route path="/grand-prize" element={<GrandPrize />} />
                <Route path="/Marketplace" element={<Marketplace />} />
                <Route path="/road-map" element={<RoadMap />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </WalletProvider>
    </ReactQueryClientProvider>
  );
}

export default App;