import React from "react";
import "../pages/MainPageImage.css";
import arjanjohanIcon from "../assets/arjanjohan-icon.png";
import grok3Icon from "../assets/grok3.png";

const gratitudeList = [
  {
    name: "@arjanjohan",
    link: "https://x.com/arjanjohan",
    icon: arjanjohanIcon,
  },
  {
    name: "@Grok3",
    link: "https://x.com/Grok",
    icon: grok3Icon,
  },
];

const Gratitude = () => {
  return (
    <div className="gratitude-section">
      <h2 className="gratitude-title">Gratitude</h2>
      <div className="gratitude-carousel-wrapper">
        <div className="gratitude-carousel">
          {gratitudeList.map((person, index) => (
            <div key={index} className="gratitude-item-wrapper">
              <span className="gratitude-name">{person.name}</span>
              <a
                href={person.link}
                target="_blank"
                rel="noopener noreferrer"
                className="gratitude-item"
                title={`Visit ${person.name}'s profile`}
                style={{ backgroundImage: `url(${person.icon})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gratitude;