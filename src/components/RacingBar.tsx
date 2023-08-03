import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { TimeseriesDataset } from '../App';
import * as utils from '../utils/racingBarUtils.js';

interface RacingBarProps {
  data: TimeseriesDataset;
}

const RacingBar: React.FC<RacingBarProps> = ({ data }) => {
  const svgRef = useRef(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  // NOTE I wonder if this won't work since #racing-bar has not been SSR'd...
  const dimensions = {
    width: 1000,
    height: 500,
    margins: 20,
  };
  const svg = d3
    .select(svgRef.current)
    .classed('racing-bar', true)
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);
  const container = svg
    .append('g')
    .classed('container', true)
    .attr(
      'transform',
      `translate(${dimensions.margins}, ${dimensions.margins})`
    );
  const currentDateDisplay = d3.select('#current-date');
  const xAxisGroup = container.append('g');

  console.log(container);
  // const containerWidth = parseFloat(container.style('width'));
  // const containerHeight = parseFloat(container.style('height'));

  const FONT_SIZE = 12;
  const X_AXIS_TOP_OFFSET = 10;
  const CURRENT_DATE_DISPLAY_BOTTOM_OFFSET = 30;
  const RACE_INTERVAL = 100;
  const TRANSITION_INTERVAL = 100;

  const [barColors, setBarColors] = useState(() =>
    utils.generateBarColors(data)
  );
  const [curDateIdx, setCurDateIdx] = useState(0);
  const [raceRunning, setRaceRunning] = useState(false);
  let raceInterval;

  useEffect(() => {
    const dataForDate = data[Object.keys(data)[curDateIdx]];
    console.log(Object.keys(data)[curDateIdx], dataForDate);
  }, [curDateIdx]);

  useEffect(() => {
    tickRef.current = setInterval(() => {
      if (Object.keys(data).length === 0) return;
      setCurDateIdx((prev) => {
        return (prev + 1) % data[Object.keys(data)[prev]].length;
      });
    }, RACE_INTERVAL);

    return () => clearInterval(tickRef.current as NodeJS.Timeout);
  }, [data]);
  return <svg ref={svgRef} className="racing-bar"></svg>;
};

export default RacingBar;
