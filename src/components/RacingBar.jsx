import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import * as utils from '../utils/racingBarUtils.js';
import RaceControls from './RaceControls';

const RacingBar = ({ info, data }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const tickRef = useRef();

  const dimensions = {
    width: 1000,
    height: 500,
    margins: 20,
  };

  const FONT_SIZE = 12;
  const X_AXIS_TOP_OFFSET = 10;
  const CURRENT_DATE_DISPLAY_BOTTOM_OFFSET = 30;
  const RACE_INTERVAL = 100;

  const getCurDate = () => {
    return Object.keys(data)[curDateIdx];
  };

  const [curDateIdx, setCurDateIdx] = useState(0);
  const [barColors, setBarColors] = useState(() =>
    // TODO either write a useEffect for this or just make it a regular global
    utils.generateBarColors(data)
  );
  const [racing, setRacing] = useState(true);

  const toggleRacing = () => {
    setRacing((prev) => !prev);
  };
  const restart = () => {
    setCurDateIdx(0);
  };
  const handleSliderInput = (e) => {
    setRacing(false);
    clearInterval(tickRef.current);
    setCurDateIdx(Number(e.target.value));
  };

  // initial selection
  const svg = d3
    .select(svgRef.current)
    .classed('racing-bar', true)
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);
  const xAxisGroup = svg.select('.x-axis');
  xAxisGroup
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${FONT_SIZE + X_AXIS_TOP_OFFSET})`);

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

    const barLabels = svg
      .selectAll('.bar-label')
      .data(dataForDate, (data) => String(data.state));
    const bars = svg
      .selectAll('.bar')
      .data(dataForDate, (data) => String(data.state));
    const currentDateDisplay = svg
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
      .attr('y', () => dimensions.height + 200)
      .merge(barLabels)
      .text(
        ({ state, total }) => `${state}: ${parseFloat(total).toLocaleString()}`
      )
      .transition()
      .attr('x', ({ total }) => xScale(total) + FONT_SIZE)
      .attr(
        'y',
        ({ state }) =>
          yScale(state) +
          X_AXIS_TOP_OFFSET * 2 +
          (yScale.bandwidth() + FONT_SIZE) / 2
      );
    barLabels
      .exit()
      .transition()
      .attr('y', dimensions.height + 200)
      .remove();
    // NOTE: when race interval is 300ms, I was able to exit the bar labels to `dimensions.height`
    //       but when I set race interval to 100ms, labels were getting "orphaned" at the bottom
    //       of the chart area... not sure why yet.
    //       In any event, ensuring to enter and exit barLabels (and bars) _beyond_ the bottom
    //       of the chart seems to work fine

    bars
      .enter()
      .append('rect')
      .attr('y', () => dimensions.height + 200)
      .merge(bars)
      .classed('bar', true)
      .attr('fill', ({ state }) => barColors[state])
      .attr('height', yScale.bandwidth())
      .transition()
      .attr('width', ({ total }) => xScale(total))
      .attr('y', ({ state }) => yScale(state) + X_AXIS_TOP_OFFSET * 2);
    bars
      .exit()
      .transition()
      .attr('y', dimensions.height + 200)
      .remove();
  }, [curDateIdx]);

  useEffect(() => {
    if (!racing) {
      clearInterval(tickRef.current);
    } else {
      tickRef.current = setInterval(() => {
        if (Object.keys(data).length === 0) return;
        setCurDateIdx((prev) => {
          return (prev + 1) % Object.keys(data).length;
        });
      }, RACE_INTERVAL);
    }

    return () => clearInterval(tickRef.current);
  }, [racing, data]);

  return (
    <section className="racing-bar-container" ref={containerRef}>
      <section className="racing-bar-info">
        <h1>{info.title}</h1>
        <a href={info.url}>Covid19-India API</a>
      </section>
      <svg ref={svgRef} className="racing-bar">
        <g className="x-axis" />
      </svg>
      <RaceControls
        restart={restart}
        toggleRacing={toggleRacing}
        racing={racing}
        dates={Object.keys(data)}
        curDateIdx={curDateIdx}
        handleSliderInput={handleSliderInput}
      />
    </section>
  );
};

export default RacingBar;
