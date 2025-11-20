/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import { arrowRightIcon, arrowLeftIcon } from "../../icons.js";
import "../../libs/carbon-web-components/loading.min.js";

const template = () => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    #mlflow-graph-container {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      height: 100%;
      padding: 1rem;
      background: #262626;
    }

    #mlflow-graph-container[loading] #chart-wrapper,
    #mlflow-graph-container[loading] #graph-controls,
    #mlflow-graph-container[no-data] #chart-wrapper,
    #mlflow-graph-container[no-data] #graph-controls {
      display: none;
    }

    #mlflow-graph-container:not([loading]) #loading-state {
      display: none;
    }

    #mlflow-graph-container:not([no-data]) #no-data-state {
      display: none;
    }

    #loading-state,
    #no-data-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 300px;
      max-height: 250px;
      color: var(--cds-button-secondary);
    }

    #chart-wrapper {
      position: relative;
      width: 100%;
      height: auto;
      max-height: 250px;
      padding: 1rem 1rem 2rem 2rem;
    }

    #chart {
      width: 100%;
      height: 100%;
      font-family: sans-serif;
    }

    .line {
      fill: none;
      stroke: steelblue;
      stroke-width: 2px;
    }

    .axis path,
    .axis line {
      stroke: #000;
    }

    #graph-title {
      position: absolute;
      top: -0.5rem;
      left: 50%;
      transform: translateX(-50%);
      color: var(--cds-text-01, #f4f4f4);
      font-size: 1rem;
      font-weight: 400;
    }

    #x-axis-label {
      position: absolute;
      bottom: 0.25rem;
      left: 50%;
      transform: translateX(-50%);
      color: var(--cds-text-01, #f4f4f4);
      font-size: 0.8rem;
      font-weight: 400;
    }

    #y-axis-label {
      position: absolute;
      top: 50%;
      left: 0.25rem;
      transform: translateY(-50%) rotate(180deg);
      color: var(--cds-text-01, #f4f4f4);
      font-size: 0.8rem;
      font-weight: 400;
      writing-mode: vertical-lr;
      text-orientation: mixed;
    }

    #graph-controls {
      display: flex;
      column-gap: 0.5rem;
    }

    #graph-controls button {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 2rem;
      height: 2rem;
      margin: 0;
      background: unset;
      border: unset;
      cursor: pointer;
    }

    #graph-controls button:hover {
      background: #ffffff11;
    }

    #graph-controls button:focus {
      outline: 2px solid var(--cds-ui-05, #f4f4f4);
    }

    #graph-controls button:disabled {
      opacity: 25%;
      cursor: not-allowed;
    }
  </style>

  <div id="mlflow-graph-container" loading>
    <div id="loading-state">
      <cds-loading
        active="true"
        description="Loading"
        assistive-text="Loading"
      ></cds-loading>
    </div>
    <div id="no-data-state">
      <svg
        id="icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="60"
        height="60"
        aria-hidden="true"
        focusable="false"
        fill="currentColor"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <style>
            .cls-1 {
              fill: none;
            }
          </style>
        </defs>
        <title>chart--line</title>
        <path
          d="M4.67,28l6.39-12,7.3,6.49a2,2,0,0,0,1.7.47,2,2,0,0,0,1.42-1.07L27,10.9,25.18,10,19.69,21l-7.3-6.49A2,2,0,0,0,10.71,14a2,2,0,0,0-1.42,1L4,25V2H2V28a2,2,0,0,0,2,2H30V28Z"
          transform="translate(0 0)"
        />
        <rect
          id="_Transparent_Rectangle_"
          data-name="&lt;Transparent Rectangle&gt;"
          class="cls-1"
          width="32"
          height="32"
        />
      </svg>
      <h4>No Chart Data found!</h4>
    </div>
    <div id="chart-wrapper">
      <span id="graph-title"></span>
      <span id="x-axis-label">Step</span>
      <span id="y-axis-label">Y axis</span>
      <svg id="chart" width="600" height="400"></svg>
    </div>
    <div id="graph-controls">
      <button id="back-button" title="Go to the previous graph" disabled>
        ${arrowLeftIcon({ width: 16, height: 16, fill: "#f4f4f4" })}
      </button>
      <button id="next-button" title="Go to the next graph" disabled>
        ${arrowRightIcon({ width: 16, height: 16, fill: "#f4f4f4" })}
      </button>
    </div>
  </div>
`;

window.customElements.define(
  "mlflow-graph",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.run;
    }

    render() {
      this.setDOM(template(this));

      this.mlFlowGraphContainer = this.shadow.querySelector(
        "#mlflow-graph-container"
      );
      this.filteredMetrics = [];
      this.currentMetricIndex = 0;
      this.nextButton = this.shadow.querySelector("#next-button");
      this.backButton = this.shadow.querySelector("#back-button");
      this.graphTitle = this.shadow.querySelector("#graph-title");

      this.nextButton.addEventListener("click", () => {
        if (this.currentMetricIndex < this.filteredMetrics.length - 1) {
          this.currentMetricIndex++;
        } else {
          this.currentMetricIndex = 0;
        }
        this.setupGraph(this.filteredMetrics[this.currentMetricIndex]);
      });

      this.backButton.addEventListener("click", () => {
        if (this.currentMetricIndex > 0) {
          this.currentMetricIndex--;
        } else {
          this.currentMetricIndex = this.filteredMetrics.length - 1;
        }
        this.setupGraph(this.filteredMetrics[this.currentMetricIndex]);
      });

      window.addEventListener("resize", () => {
        if (this.filteredMetrics.length > 0) {
          this.setupGraph(this.filteredMetrics[this.currentMetricIndex]);
        }
      });
    }

    setRun(run) {
      this.mlFlowGraphContainer.removeAttribute("loading");

      this.run = run;

      if (run.metrics) {
        for (let i in run.metrics) {
          if (Object.keys(run.metrics[i]).length > 1) {
            this.filteredMetrics.push(run.metrics[i]);
          }
        }

        if (this.filteredMetrics.length > 0) {
          this.setupGraph(this.filteredMetrics[0]);
          return;
        }
      }

      this.setNoDataState();
    }

    setNoDataState() {
      this.mlFlowGraphContainer.removeAttribute("loading");
      this.mlFlowGraphContainer.setAttribute("no-data", "");
    }

    setupGraph(graphData) {
      this.nextButton.setAttribute("disabled", "");
      this.backButton.setAttribute("disabled", "");

      const xAxisLabel = this.shadow.querySelector("#x-axis-label");
      const yAxisLabel = this.shadow.querySelector("#y-axis-label");

      const yAxisTitle = Object.keys(graphData)[1];

      this.graphTitle.innerHTML = `${this.run.name} - ${yAxisTitle}`;
      yAxisLabel.innerHTML = yAxisTitle;

      const plotData = Object.keys(graphData.epoch).map((key) => ({
        epoch: graphData.epoch[key],
        trainLoss: graphData[Object.keys(graphData)[1]][key],
      }));

      const svg = this.shadow.querySelector("#chart");
      const container = this.shadow.querySelector("#chart-wrapper");
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = Math.min(containerRect.height, 250);

      const chart = d3.select(svg);
      chart.selectAll("*").remove();

      chart.attr("width", containerWidth).attr("height", containerHeight);
      const width = containerWidth - 50;
      const height = containerHeight - 50;

      chart.selectAll("*").remove();

      const x = d3
        .scaleLinear()
        .domain(d3.extent(plotData, (d) => d.epoch))
        .range([40, width]);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(plotData, (d) => d.trainLoss)])
        .range([height, 20]);

      const line = d3
        .line()
        .x((d) => x(d.epoch))
        .y((d) => y(d.trainLoss));

      //=== Add x axis ===
      chart
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      //=== Add y axis ===
      chart
        .append("g")
        .attr("transform", `translate(40,0)`)
        .call(d3.axisLeft(y));

      //=== Add line or point ===
      if (plotData.length > 1) {
        chart
          .append("path")
          .datum(plotData)
          .attr("class", "line")
          .attr("d", line);
      } else if (plotData.length === 1) {
        chart
          .append("circle")
          .attr("cx", x(plotData[0].epoch))
          .attr("cy", y(plotData[0].trainLoss))
          .attr("r", 4)
          .style("fill", "steelblue");
      }

      this.nextButton.removeAttribute("disabled");
      this.backButton.removeAttribute("disabled");
    }
  }
);
