import React, { useEffect, useState } from 'react';
import './stylesheets/reset.css';
import './stylesheets/App.css';
import RacingBar from './components/RacingBar';

export interface DataPoint {
  state: string;
  total: number;
}
export interface TimeseriesDataset {
  [key: string]: DataPoint[]; // NOTE these are _date_ strings, specifically
}

enum Dataset {
  covid = 'covid',
}

export type DatasetCollection = {
  [key in Dataset]: {
    data: TimeseriesDataset[];
    info: {
      title: string;
      url: string;
    };
  };
};

function App() {
  const [curDataset, setCurDataset] = useState<Dataset>(Dataset.covid);
  const [datasets, setDatasets] = useState<DatasetCollection>(() => {
    const ret = Object.keys(Dataset).reduce((acc, val) => {
      return { ...acc, [val]: {} };
    }, {} as DatasetCollection);

    return ret;
  });

  const handleDatasetSelection = (e: any) => {
    // TODO what behavior do I want if user clicks on the current dataset?
    // TODO style the selected dataset button accordingly
    setCurDataset(Dataset[Dataset[e.target.dataset.dataset as Dataset]]); // TODO naming sucks here
  };

  const processCovidData: any = (data: any) => {
    const processedData: TimeseriesDataset = {};

    // reshape
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

    // sort
    Object.keys(processedData).forEach((date) => {
      processedData[date].sort((a, b) => b.total - a.total);
    });
    const sortedKeys = Object.keys(processedData).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
    const sortedProcessedData = sortedKeys.reduce((acc, key) => {
      return {
        ...acc,
        [key]: processedData[key],
      };
    }, {});

    return sortedProcessedData;
  };
  const getCovidData = () => {
    fetch('https://data.covid19india.org/v4/min/timeseries.min.json')
      .then((res) => res.json())
      .then((data) =>
        setDatasets((prev) => {
          return {
            ...prev,
            covid: {
              data: processCovidData(data),
              info: {
                title: 'Covid-19 counts by state, India',
                url: 'https://data.covid19india.org/',
              },
            },
          };
        })
      ); // TODO update
  };
  useEffect(() => {
    getCovidData();
  }, []);

  if (Object.keys(datasets[Dataset[curDataset]]).length > 0) {
    return (
      <div className="App">
        <section className="data-offering">
          <h3>Data Offering</h3>
          <ul>
            {Object.keys(datasets).map((key) => {
              return (
                <li key={key}>
                  <button
                    data-dataset={Dataset[key as Dataset]}
                    onClick={handleDatasetSelection}
                    className={key === curDataset ? 'button-selected' : ''}
                  >
                    {key}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
        <RacingBar
          info={datasets[Dataset[curDataset]].info}
          data={datasets[Dataset[curDataset]].data}
        />
        <p className="moratorium">
          (Apparently, racing bar charts got so overdone that Reddit imposed a{' '}
          <a href="https://www.reddit.com/r/dataisbeautiful/comments/e257go/announcing_a_moratorium_on_racing_bar_charts/">
            moratorium
          </a>{' '}
          on them lol)
        </p>
      </div>
    );
  } else {
    return (
      <div className="App">
        <p>Loading...</p>
      </div>
    );
  }
}

export default App;
