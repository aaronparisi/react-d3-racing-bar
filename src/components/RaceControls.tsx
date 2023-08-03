import React from 'react';

interface RaceControlsProps {}

const RaceControls: React.FC<RaceControlsProps> = () => {
  return (
    <section id="race-controls">
      <section id="metric-selector-container"></section>
      <section id="slider-container"></section>
      <section id="remote-controls">
        <button className="Button" id="play-pause">
          \u23F8
        </button>
        <button className="Button" id="stop">
          \u23F9
        </button>
      </section>
    </section>
  );
};

export default RaceControls;
