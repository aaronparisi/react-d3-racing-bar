import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import * as utils from '../utils/racingBarUtils.js';

const RacingBar = ({ data }) => {
  const svgRef = useRef(null);
  const tickRef = useRef();

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
  const xAxisGroup = container.append('g');

  const FONT_SIZE = 12;
  const X_AXIS_TOP_OFFSET = 10;
  const CURRENT_DATE_DISPLAY_BOTTOM_OFFSET = 30;
  const RACE_INTERVAL = 2000;

  const getCurDate = () => {
    return Object.keys(data)[curDateIdx];
  };

  const [curDateIdx, setCurDateIdx] = useState(0);
  const [barColors, setBarColors] = useState(() =>
    // TODO either write a useEffect for this or just make it a regular global
    utils.generateBarColors(data)
  );
  const [raceRunning, setRaceRunning] = useState(false);

  useEffect(() => {
    // if (curDateIdx > 1) return; // NOTE for testing
    // "tick"
    if (Object.keys(data).length === 0) return;

    const dataForDate = data[getCurDate()].slice(0, 20);
    const maxValue = dataForDate[0].total;

    const yScale = d3
      .scaleBand()
      .domain(dataForDate.map(({ state }) => state))
      .rangeRound([
        0,
        dimensions.height -
          FONT_SIZE -
          X_AXIS_TOP_OFFSET -
          CURRENT_DATE_DISPLAY_BOTTOM_OFFSET,
      ])
      .padding(0.1);
    const xScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([0, dimensions.width - FONT_SIZE - 200]); // TODO magic number => bar rhs padding
    const xAxis = d3.axisTop(xScale);

    const barLabels = container
      .selectAll('.bar-label')
      .data(dataForDate, (data) => String(data.state));
    const bars = container
      .selectAll('.bar')
      .data(dataForDate, (data) => String(data.state));
    const currentDateDisplay = container
      .selectAll('#current-date')
      .data([getCurDate()], (curDate) => String(curDate));

    xAxisGroup.transition().call(xAxis);

    currentDateDisplay
      .enter()
      .append('text')
      .merge(currentDateDisplay)
      .attr('id', 'current-date')
      .text((curDate) => utils.generateDateDisplay(curDate))
      .attr(
        'x',
        xScale(
          xScale.domain()[1] - (xScale.domain()[1] - xScale.domain()[0]) / 2
        )
      )
      .attr(
        'y',
        dimensions.height - FONT_SIZE - CURRENT_DATE_DISPLAY_BOTTOM_OFFSET
      );
    currentDateDisplay.exit().remove();

    barLabels
      .enter()
      .append('text')
      .classed('bar-label', true)
      .attr('y', () => dimensions.height)
      .merge(barLabels)
      .text(({ state, total }) => `${state}: ${parseFloat(total).toFixed(4)}`)
      .transition()
      .attr('x', ({ total }) => xScale(total) + FONT_SIZE)
      .attr(
        'y',
        ({ state }) =>
          yScale(state) +
          X_AXIS_TOP_OFFSET * 2 +
          (yScale.bandwidth() + FONT_SIZE) / 2
      );
    barLabels.exit().transition().attr('y', dimensions.height).remove();

    bars
      .enter()
      .append('rect')
      .attr('y', () => dimensions.height)
      .merge(bars)
      .classed('bar', true)
      .attr('fill', ({ state }) => barColors[state])
      .attr('height', yScale.bandwidth())
      .transition()
      .attr('width', ({ total }) => xScale(total))
      .attr('y', ({ state }) => yScale(state) + X_AXIS_TOP_OFFSET * 2);
    bars.exit().transition().attr('y', dimensions.height).remove();
  }, [curDateIdx]);

  useEffect(() => {
    tickRef.current = setInterval(() => {
      if (Object.keys(data).length === 0) return;
      setCurDateIdx((prev) => {
        return (prev + 1) % data[Object.keys(data)[prev]].length;
      });
    }, RACE_INTERVAL);

    return () => clearInterval(tickRef.current);
  }, [data]);
  return <svg ref={svgRef} className="racing-bar"></svg>;
};

export default RacingBar;
