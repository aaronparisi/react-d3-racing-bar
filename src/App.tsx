import React, { useEffect, useState } from 'react';
import './stylesheets/reset.css';
import './stylesheets/App.css';
import RacingBar from './components/RacingBar';
import RaceControls from './components/RaceControls';

export interface DataPoint {
  state: string;
  total: number;
}
export interface TimeseriesDataset {
  [key: string]: DataPoint[]; // NOTE these are _date_ strings, specifically
}

function App() {
  const [data, setData] = useState<TimeseriesDataset>({});

  const getData = () => {
    fetch('https://data.covid19india.org/v4/min/timeseries.min.json')
      .then((res) => res.json())
      .then((data) => {
        const processedData: TimeseriesDataset = {};
        Object.keys(data).forEach((state) => {
          if (state === 'TT') return;
          Object.keys(data[state].dates).forEach((date) => {
            if (!processedData[date]) processedData[date] = [];
            processedData[date].push({
              state: state,
              total: data[state].dates[date].total?.confirmed ?? 0,
            });
          });
        });

        setData(processedData);
      });
  };
  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="App">
      {Object.keys(data).length > 0 ? <RacingBar data={data} /> : ''}
      <RaceControls />
    </div>
  );
}

export default App;
