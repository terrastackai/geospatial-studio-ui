/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { formatDateString, formatDateTimeStringUTC } from "../../utils.js";

function startOfYear(year) {
  return new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
}

function endOfYear(year) {
  return new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
}

function startOfMonth(date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0)
  );
}

function endOfMonth(date) {
  // 0 day of following month == last day of current month
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999)
  );
}

const ONE_DAY = 8.64e7; // in ms

export class TimelineChart {
  constructor(container, data) {
    this.allData = data;

    const chartData = data.map((d) => [d.getTime(), 2, 10]);

    this.chartOptions = {
      chart: {
        type: "bubble",
        height: 100,
        width: "100%",
        events: {
          // beforeZoom: (context, axes) => this.onZoom(context, axes),
          // beforeResetZoom: (context, axes) => this.onZoom(context),
          dataPointSelection: (event, chartContext, config) =>
            this.dataPointSelection(event, chartContext, config),
        },
      },
      colors: ["#393939"],
      grid: {
        show: false,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "50%",
          rangeBarGroupRows: true,
        },
      },
      legend: {
        show: false,
      },
      xaxis: {
        type: "datetime",
        axisBorder: {
          show: false,
          offsetY: -20,
        },
        labels: {
          format: "yyyy/MM/dd",
        },
      },
      yaxis: {
        max: 4,
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      annotations: {
        yaxis: [
          {
            y: 2,
            borderColor: "#000000",
          },
        ],
      },
      tooltip: {
        // followCursor: false,
        // fixed: {
        //   enabled: true,
        //   position: "topRight"
        // },
        custom: (opts) => this.tooltip(opts),
      },
      series: [
        {
          name: "dataseries",
          data: chartData,
        },
      ],
    };

    if (data.length > 1) {
      let minTimestamp = Math.min(...data);
      let maxTimestamp = Math.max(...data);
      const maxMinDiff = (maxTimestamp - minTimestamp) / ONE_DAY;
      const quatileOfMaxMinDiff = Math.ceil(maxMinDiff / 4);
      minTimestamp = minTimestamp - quatileOfMaxMinDiff * ONE_DAY;
      maxTimestamp = maxTimestamp + quatileOfMaxMinDiff * ONE_DAY;

      this.chartOptions.xaxis.min = minTimestamp;
      this.chartOptions.xaxis.max = maxTimestamp;
    }

    // this.groupDates()
    this.apexChart = new ApexCharts(container, this.chartOptions);
  }

  render() {
    this.apexChart.render();
  }

  destroy() {
    this.apexChart.destroy();
  }

  dataPointSelection(event, chartContext, config) {
    // ensure we always have at least one data point selected
    if (config.selectedDataPoints[0][0] === undefined) {
      this.apexChart.toggleDataPointSelection(0, this.selectedDataPointIndex);
      return;
    }

    this.selectedDataPointIndex = config.selectedDataPoints[0][0];

    const selectedDate =
      config.w.config.series[0].data[this.selectedDataPointIndex][0];

    if (this.dateSelectedCallback) {
      this.dateSelectedCallback(new Date(selectedDate));
    } else {
      console.error(
        "No dateSelectedCallback function defined for timeline-chart"
      );
    }
  }

  tooltip(opts) {
    const timestamp = opts.w.config.series[0].data[opts.dataPointIndex][0];
    return /* HTML */ `
      <div>
        <div>${formatDateString(timestamp)}</div>
      </div>
    `;
  }

  updateData(data) {
    this.allData = data;
    this.groupDates();
    this.apexChart.updateOptions(this.chartOptions);
  }

  groupDates(min = null, max = null) {
    if (!min) {
      min = this.allData[0].getTime();
    }
    if (!max) {
      max = this.allData.at(-1).getTime();
    }
    const currentlyVisiblePoints = this.allData.filter(
      (d) => d.getTime() >= min && d.getTime() <= max
    );

    // if (currentlyVisiblePoints.length > 100) {
    if (false) {
      this.isRange = true;
      this.chartOptions.series = this.groupDatesByMonth(this.allData);
    } else {
      this.isRange = false;
      const barWidth = (max - min) / 100;

      const series = this.allData.map((date) => {
        return {
          name: "dates",
          data: [
            {
              x: "data",
              y: [date.getTime(), date.getTime() + barWidth],
            },
          ],
        };
      });

      this.chartOptions.series = series;
    }
  }

  groupDatesByMonth(dates) {
    const monthGroups = {};

    for (let d of dates) {
      const month = startOfMonth(d).getTime();
      if (!monthGroups[month]) {
        monthGroups[month] = [];
      }
      monthGroups[month].push(d);
    }

    const series = Object.keys(monthGroups).map((month) => {
      return {
        name: "dates",
        data: [
          {
            x: "data",
            y: [month, endOfMonth(new Date(Number(month))).getTime()],
          },
        ],
      };
    });

    return series;
  }

  groupDatesByYear(dates) {
    const yearGroups = {};

    for (let d of dates) {
      const year = d.getUTCFullYear();
      if (!yearGroups[year]) {
        yearGroups[year] = [];
      }
      yearGroups[year].push(d);
    }

    const series = Object.keys(yearGroups).map((year) => {
      return {
        name: "dates",
        data: [
          {
            x: "data",
            y: [startOfYear(year).getTime(), endOfYear(year).getTime()],
          },
        ],
      };
    });

    return series;
  }
}
