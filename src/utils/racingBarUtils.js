export const randomColor = () =>
  Math.floor(Math.random() * 16777215).toString(16);
export const generateBarColors = (data) => {
  const ret = {};

  Object.keys(data).forEach((metric) => {
    const metricData = data[metric];
    const dates = Object.keys(metricData);
    dates.forEach((date) => {
      const assetVals = metricData[date];
      assetVals.forEach(({ asset, value }) => {
        if (!ret[asset]) ret[asset] = '#' + randomColor();
      });
    });
  });

  return ret;
};
export const generateDateDisplay = (dateString) => {
  const dateObject = new Date(dateString);
  const year = dateObject.getUTCFullYear();
  const month = dateObject.getUTCMonth() + 1;
  const day = dateObject.getUTCDate();

  return `${year}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;
};
// export const extractCurData = () => {
//   const dataForMetric = dataCache[curMetric];
//   const datesForMetric = Object.keys(dataForMetric);
//   const curDate = datesForMetric[curDateIdx];
//   const dataForDate = dataForMetric[curDate].slice(0, 20);

//   return { curDate, dataForDate };
// };
