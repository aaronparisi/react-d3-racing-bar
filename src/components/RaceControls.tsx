import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface RaceControlsProps {
  restart: () => void;
  toggleRacing: () => void;
  racing: boolean;
  dates: string[];
  curDateIdx: number;
  handleSliderInput: (e: any) => void;
}

const RaceControls: React.FC<RaceControlsProps> = ({
  restart,
  toggleRacing,
  racing,
  dates,
  curDateIdx,
  handleSliderInput,
}) => {
  return (
    <section className="race-controls">
      <section id="remote-controls">
        <button onClick={toggleRacing} className="Button" id="play-pause">
          {racing ? `\u23F8` : `\u23F5`}
        </button>
        <button onClick={restart} className="Button" id="restart">
          {`\u23EE`}
        </button>
      </section>
      <section id="slider-container">
        <input
          type="range"
          value={curDateIdx}
          min={0}
          max={dates.length - 1}
          step={1}
          onInput={handleSliderInput}
        ></input>
      </section>
    </section>
  );
};

export default RaceControls;
