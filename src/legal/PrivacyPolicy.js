import React from "react";
import "./PrivacyPolicy.css"; // Подключаем стили

const PrivacyPolicy = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>Privacy Policy</h1>
        <h2>Effective Date: April 30, 2025</h2>

        <h3>1. Information Collection</h3>
        <p>
          To provide our services and enhance your experience on the Aptos Trip website, we collect the following information:
        </p>
        <ul>
          <li><strong>1.1 Cryptocurrency Wallet Address:</strong> Used to facilitate NFT minting, verify transactions, and troubleshoot technical issues.</li>
          <li><strong>1.2 Transaction Information:</strong> Collected to confirm payments, ensure service functionality, and improve user experience.</li>
        </ul>

        <h3>2. Data Processing and Sharing</h3>
        <p>
          We do not share, sell, or disclose your personal information to third parties without your explicit consent, except:
        </p>
        <ul>
          <li>When required by applicable law or legal processes.</li>
          <li>To fulfill our obligations in providing services, such as processing NFT transactions on the Aptos blockchain.</li>
        </ul>

        <h3>3. Children's Privacy</h3>
        <p>
          Our website and services are not intended for individuals under 18 years of age. Minors may only use our services with the verifiable consent of a parent or legal guardian.
        </p>

        <h3>4. Regional Restrictions</h3>
        <p>
          Our services are not available in jurisdictions where cryptocurrency, NFTs, or related technologies are prohibited or restricted by local laws. It is your responsibility to ensure compliance with local regulations.
        </p>

        <h3>5. Security Measures</h3>
        <p>
          We implement industry-standard security measures to protect your information from unauthorized access, alteration, or loss. However, no internet-based service can guarantee absolute security, and we are not liable for breaches beyond our reasonable control.
        </p>

        <h3>6. Changes to this Policy</h3>
        <p>
          We may update this Privacy Policy to reflect changes in our practices or legal requirements. Updates will be posted on this page with the revised effective date. We encourage you to review this policy periodically.
        </p>

        <h3>7. Contact Us</h3>
        <p>
          For questions or concerns about this Privacy Policy, please contact us at:
          <br />
          <strong>Email:</strong> aptosconnectx@gmail.com
          <br />
          <strong>X:</strong> <a href="https://x.com/AptosTrip" target="_blank">@AptosTrip</a>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
