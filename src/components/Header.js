import React from "react";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { WalletSelector } from "./WalletSelector";
import logo from "../assets/logo.png";

const Header = () => {
  return (
    <header className="flex items-center justify-between border-b border-solid border-b-[#253646] px-10 py-3">
      <div className="flex items-center gap-4 text-white">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Road Trip NFT Logo" className="h-16" />
        </Link>
      </div>
      <nav className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <Link className="flex items-center gap-2 text-white text-sm font-medium hover:text-[#61dafb]" to="/">
            <FaHome className="text-lg" />
            Main
          </Link>
          <Link className="text-white text-sm font-medium hover:text-[#61dafb]" to="/trip-route">Trip Route</Link>
          <Link className="text-white text-sm font-medium hover:text-[#61dafb]" to="/nft-collection">NFT Collection</Link>
          <Link className="text-white text-sm font-medium hover:text-[#61dafb]" to="/mint-nft">Mint NFT</Link>
          <Link className="text-white text-sm font-medium hover:text-[#61dafb]" to="/garage">Garage</Link>
          <Link className="text-white text-sm font-medium hover:text-[#61dafb]" to="/grand-prize">Grand Prize</Link>
          <Link className="text-white text-sm font-medium hover:text-[#61dafb]" to="/Marketplace">Marketplace</Link>
          <Link className="text-white text-sm font-medium hover:text-[#61dafb]" to="/road-map">Roadmap</Link>
          <Link className="text-white text-sm font-medium hover:text-[#61dafb]" to="/partners">Partners</Link>
        </div>
        <WalletSelector />
      </nav>
    </header>
  );
};

export default Header;