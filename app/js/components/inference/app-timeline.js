/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import { closeIcon } from "../../icons.js";
import { TimelineChart } from "./timeline-chart.js";

const chartColors = [
  "#002d9c",
  "#009d9a",
  "#9f1853",
  "#520408",
  "#a56eff",
  "#525669",
];

const template = (obj) => /* HTML */ `
  <style>
    :host {
      pointer-events: none;
    }

    #chart-timeseries {
      width: 100%;
      height: 100%;
      margin-bottom: -16px;
    }

    #chart-timeline {
      width: 100%;
      height: 100%;
      margin-bottom: -16px;
    }

    .chart-wrapper {
      background: white;
      padding: 5px 16px 0px 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: all;
      position: relative;
      display: none;
    }

    .chart-wrapper:nth-child(2) {
      margin-top: 0.5rem;
    }

    .charts-container {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 1rem 0.5rem;
      pointer-events: none;
    }

    .close-icon {
      position: absolute;
      top: 4px;
      right: 1px;
      fill: #6e8192;
      cursor: pointer;
    }

    .close-icon:hover {
      fill: #000000;
    }

    .chart-title {
      font-size: 14px;
      position: absolute;
      top: 5px;
      left: 10px;
    }

    .apexcharts-marker[selected="true"] {
      fill: #0f62fe;
    }
  </style>

  <div class="charts-container">
    <div class="chart-wrapper">
      ${closeIcon({
        id: "timeseries-close",
        class: "close-icon",
        height: 25,
        width: 25,
      })}
      <div id="timeseries-title" class="chart-title"></div>
      <div id="chart-timeseries"></div>
    </div>

    <div class="chart-wrapper">
      ${closeIcon({
        id: "timeline-close",
        class: "close-icon",
        height: 25,
        width: 25,
      })}
      <div id="timeline-title" class="chart-title"></div>
      <div id="chart-timeline"></div>
    </div>
  </div>
`;

customElements.define(
  "app-timeline",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));
      this.closeTimeline = this.shadow.querySelector("#timeline-close");
      this.closeTimeseries = this.shadow.querySelector("#timeseries-close");

      this.closeTimeline.addEventListener("click", () => {
        this.timeline.destroy();
        this.timeline = null;
        this.shadowRoot.querySelector(
          "#chart-timeline"
        ).parentElement.style.display = "none";
      });

      this.closeTimeseries.addEventListener("click", () => {
        this.timeseries.destroy();
        this.timeseries = null;
        this.shadowRoot.querySelector(
          "#chart-timeseries"
        ).parentElement.style.display = "none";
      });
    }

    setTimeseriesTitle(title) {
      const titleEl = this.shadowRoot.querySelector("#timeseries-title");
      if (titleEl) {
        titleEl.innerHTML = title;
      }
    }

    setTimelineTitle(title) {
      const titleEl = this.shadowRoot.querySelector("#timeline-title");
      if (titleEl) {
        titleEl.innerHTML = title;
      }
    }

    setCoverageData(dataPointDates, title, selectedTimestamp) {
      let container = this.shadowRoot.querySelector("#chart-timeline");
      this.setTimelineTitle(title);

      if (this.timeline) {
        this.timeline.updateData(dataPointDates);
      } else {
        this.timeline = new TimelineChart(container, dataPointDates);
        container.parentElement.style.display = "block";

        this.timeline.dateSelectedCallback = (date) => {
          const selectedDataPoint = dataPointDates.find(
            (d) => d.getTime() === date.getTime()
          );
          this.dispatchEvent(
            new CustomEvent("date-click", {
              detail: {
                date: selectedDataPoint,
              },
            })
          );
        };

        this.timeline.render();

        const selectedIndex = dataPointDates.indexOf(selectedTimestamp);
        this.timeline.apexChart.toggleDataPointSelection(0, selectedIndex);
      }
    }

    // This method is called by parent element to display timeseries data for each layer
    // @param dataArray: Array of timeseries data per layer, e.g. [ [ { "dateTime": "2022-03-25T12:59:14.585Z", "value": 1.23 }, ...  ], ... ]
    // @param title: String of chart title to display
    setData(layerTimeSeries, title) {
      this.setTimeseriesTitle(title);

      let container = this.shadowRoot.querySelector("#chart-timeseries");

      const chartSeries = layerTimeSeries.map((series) => {
        let timeSeriesData = [];
        let items = series.timeSeries.length;
        const maxItems = 1000;
        if (items > maxItems) {
          // sample a maximum number of points for display in the chart
          timeSeriesData = [];
          for (let i = 0; i < items; i += Math.round(items / maxItems)) {
            timeSeriesData.push(series.timeSeries[i]);
          }
        } else {
          timeSeriesData = series.timeSeries;
        }

        return {
          name: series.layerName,
          data: timeSeriesData.map((t) => [t.dateTime, t.value]),
        };
      });

      const chartYAxes = layerTimeSeries.map((series, i) => {
        return {
          seriesName: series.layerName,
          opposite: true,
          decimalsInFloat: 4,
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: true,
            color: chartColors[i],
          },
          labels: {
            style: {
              colors: chartColors[i],
            },
          },
          tooltip: {
            enabled: true,
          },
          title: {
            text: series.layerName,
            style: {
              color: chartColors[i],
            },
          },
        };
      });

      if (chartYAxes.length > 0) {
        chartYAxes[0].opposite = false;
      }

      const chartOptions = {
        chart: {
          type: "line",
          height: 140,
          width: "100%",
          stacked: false,
        },
        colors: chartColors,
        legend: {
          show: false,
        },
        // title: {
        //   text: title,
        //   align: 'left',
        //   offsetX: 35
        // },
        series: chartSeries,
        //tooltip: {
        //  custom: ()=>""
        //},
        stroke: {
          width: 2,
        },
        //dataLabels: {
        //  enabled: false
        //},
        xaxis: {
          type: "datetime",
        },
        yaxis: chartYAxes,
      };

      if (this.timeseries) {
        this.timeseries.updateOptions(chartOptions);
      } else {
        this.timeseries = new ApexCharts(container, chartOptions);
        container.parentElement.style.display = "block";
        this.timeseries.render();
      }
    }
  }
);
