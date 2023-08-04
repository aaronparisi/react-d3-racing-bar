import React from 'react';

interface RaceControlsProps {
  restart: () => void;
  toggleRacing: () => void;
  racing: boolean;
}

const RaceControls: React.FC<RaceControlsProps> = ({
  restart,
  toggleRacing,
  racing,
}) => {
  return (
    <section id="race-controls">
      <section id="metric-selector-container"></section>
      <section id="slider-container"></section>
      <section id="remote-controls">
        <button onClick={toggleRacing} className="Button" id="play-pause">
          {racing ? `\u23F8` : `\u23F5`}
        </button>
        <button onClick={restart} className="Button" id="restart">
          {`\u23EE`}
        </button>
      </section>
    </section>
  );
};

export default RaceControls;
