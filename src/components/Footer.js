import React from "react";
import "./Footer.css";
import { FaTelegramPlane, FaYoutube, FaInstagram, FaGithub } from "react-icons/fa";
import TwitterIcon from "../assets/twitter.png"; // Импорт иконки X (Twitter)

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-left">
                <p>© 2025 Aptos Trip. All Rights Reserved.</p>
                <p>
                    <a href="/terms" className="footer-link">Terms and Conditions</a>
                    {" | "}
                    <a href="/privacy" className="footer-link">Privacy Policy</a>
                </p>
                <p>
                    Contact us: <a href="mailto:aptosconnectx@gmail.com" className="footer-link email-link">aptosconnectx@gmail.com</a>
                </p>
            </div>
            <div className="footer-right">
                {/* Twitter */}
                <a href="https://x.com/AptosTrip" target="_blank" rel="noopener noreferrer" className="x-twitter">
                    <img 
                      src={TwitterIcon} 
                      alt="Twitter" 
                      className="social-icon" 
                      style={{ width: '19px', height: '19px', objectFit: 'contain' }}
                    />
                </a>
                {/* YouTube */}
                <a
                    href="https://www.youtube.com/@MR_Chaizy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link youtube"
                >
                    <FaYoutube />
                </a>
                {/* Telegram */}
                <a
                    href="https://t.me/yourchannel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link telegram"
                >
                    <FaTelegramPlane />
                </a>
                {/* Instagram */}
                <a
                    href="https://instagram.com/yourprofile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link instagram"
                >
                    <FaInstagram />
                </a>
                {/* GitHub */}
                <a
                    href="https://github.com/yourprofile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link github"
                >
                    <FaGithub />
                </a>
            </div>
        </footer>
    );
};

export default Footer;