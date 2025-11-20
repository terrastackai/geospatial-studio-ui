/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { closeIcon } from "../../icons.js";
import { formatDateTimeStringUTC, isValidDateStrict } from "../../utils.js";
import asWebComponent from "../../webcomponent.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      font-family: "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :host() {
      display: block;
    }

    #chart-container {
      position: absolute;
      background: #4e4a44;
      max-height: 152px;
      border-radius: 10px 10px 0 0;
      border: 1px solid #262626;
      width: 100%;
      height: 100%;

      & #close-button {
        padding: 0;
        background-color: transparent;
        border: none;
        cursor: pointer;
        right: 15px;
        top: 7px;
        position: absolute;
        color: var(--cds-icon-primary, #f4f4f4);
      }
    }

    .chart_background {
      fill: #262626;
    }

    .axis_label {
      font-size: 14px !important;
      color: #d9d9d9 !important;
    }

    .axis text {
      font-size: 12px;
      color: #c6c6c6;
    }

    .axis line {
      color: #454545;
    }

    .axis path {
      stroke: #777777;
      stroke-width: 3;
    }

    .current-time {
      stroke: #ffffff;
      stroke-width: 3;
      stroke-opacity: 0.3;
    }

    #tooltip {
      position: absolute;
      display: inline-block;
      color: var(--cds-layer-active-01, #525252) !important;
      font-size: 0.75rem;
      font-weight: 400;
      line-height: 1.33333;
      letter-spacing: 0.32px;
      border-bottom: 1px dotted var(--cds-border-strong);
      pointer-events: none;
    }

    #tooltip-text {
      visibility: hidden;
      background: #393939;
      color: #fff;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.42857;
      letter-spacing: 0.16px;
      padding: 0.5rem 1rem;
      border-radius: 2px;
      width: max-content;
      max-width: 320px;
      box-shadow: 0 2px 0 0 black;

      position: absolute;
      top: 150%;
      left: 50%;
      margin-left: -60px;
      opacity: 10;
      z-index: 6000;
    }

    #tooltip-text::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: #393939 transparent transparent transparent;
    }

    .display-none {
      display: none;
    }

    #skeleton {
      position: absolute;
      padding: 0;
      border: none;
      background: transparent;
      box-shadow: none;
      pointer-events: none;
      top: 0;
      margin-left: 70px;
      margin-right: 57px;
      width: 1010px;
      height: 150px;
    }

    #skeleton::before {
      position: absolute;
      animation: 3s ease-in-out skeleton infinite;
      background: #c6c6c6;
      block-size: 100%;
      content: "";
      inline-size: 100%;
      will-change: transform-origin, transform, opacity;
    }

    @keyframes skeleton {
      0% {
        opacity: 0.3;
        transform: scaleX(0);
        transform-origin: left;
      }
      20% {
        opacity: 1;
        transform: scaleX(1);
        transform-origin: left;
      }
      28% {
        transform: scaleX(1);
        transform-origin: right;
      }
      51% {
        transform: scaleX(0);
        transform-origin: right;
      }
      58% {
        transform: scaleX(0);
        transform-origin: right;
      }
      82% {
        transform: scaleX(1);
        transform-origin: right;
      }
      83% {
        transform: scaleX(1);
        transform-origin: left;
      }
      96% {
        transform: scaleX(0);
        transform-origin: left;
      }
      100% {
        opacity: 0.3;
        transform: scaleX(0);
        transform-origin: left;
      }
    }
  </style>

  <div id="chart-container">
    <div id="tooltip">
      <span id="tooltip-text"></span>
    </div>
    <svg id="chart"></svg>
    <button id="close-button">${closeIcon({ width: 16, height: 16 })}</button>
    <div id="skeleton" class="skeleton"></div>
  </div>
`;

const COLOR_SCALE_FOCUSSED = [
  "#6929C4",
  "#1192E8",
  "#9F1853",
  "#25BA52",
  "#002D9C",
  "#D09C00",
  "#E15A00",
];
const COLOR_SCALE_UNFOCUSSED = [
  "#393145",
  "#3C5769",
  "#332129",
  "#0E461F",
  "#000B27",
  "#5D4500",
  "#6C2B00",
];

window.customElements.define(
  "timeseries-graph",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.focus = [];
      this.variables = [];
      this.graphMetadata = {};
      this.selectedLayersTimestamps = [];
      this.graph = null;
      this.colorScale = null;
      this.data = null;
      this.x = null;
    }

    getLineColor(seriesName) {
      const isFocussed = this.isFocussed(seriesName);

      const colorScale = isFocussed
        ? COLOR_SCALE_FOCUSSED
        : COLOR_SCALE_UNFOCUSSED;

      let lineColor = "#777777";
      const variableLength = this.variables.length - 1;
      const colorScaleLength = colorScale.length - 1;
      for (let i = 0; i <= variableLength; i++) {
        if (seriesName.includes(this.variables[i])) {
          lineColor = colorScaleLength >= i ? colorScale[i] : "#777777";
          break;
        }
      }
      return lineColor;
    }

    isFocussed(seriesId) {
      return this.focus && this.focus.includes(seriesId);
    }

    drawGraph() {
      //expected data format [[timestamp, value, seriesName],...]

      // redraw the chart when the window is resized, use deboucing to prevent redrawing too often
      d3.select(window).on("resize", () => {
        clearTimeout(this.resizeRedrawTimeout);
        this.resizeRedrawTimeout = setTimeout(() => {
          console.log("Window resized, redrawing graph");
          this.drawGraph();
        }, 500);
      });

      this.shadow.getElementById("skeleton").classList.add("display-none");
      //===Graph===
      // Chart’s dimensions.
      const width = this.clientWidth;
      const height = this.clientHeight - 2;
      const marginTop = 15;
      const marginRight = 57;
      const marginBottom = 10;
      const marginLeft = 70;

      d3.select(this.shadow.getElementById("chart")).selectAll("*").remove();

      this.data = this.data.map((d) => [
        ...d,
        (d[0] = isValidDateStrict(d[0]) ? formatDateTimeStringUTC(d[0]) : d[0]),
      ]);

      // Positional scales
      this.x = isValidDateStrict(this.data[0][0])
        ? d3
            .scaleUtc()
            .domain(d3.extent(this.data, (d) => new Date(d[0])))
            .range([marginLeft, width - marginRight])
        : d3
            .scaleLinear()
            .domain(d3.extent(this.data, (d) => parseFloat(d[0])))
            .range([marginLeft, width - marginRight]);

      const y = d3
        .scaleLinear()
        .domain([
          d3.min(this.data, (d) => d[1]),
          d3.max(this.data, (d) => d[1]),
        ])
        .nice()
        .range([height - marginBottom, marginTop]);

      // SVG container
      const svg = d3
        .select(this.shadow.getElementById("chart"))
        .attr("viewBox", [0, 0, width, height]);

      // Background
      svg
        .append("rect")
        .attr("width", `${width - marginLeft - marginRight}`)
        .attr("height", `${height}`)
        .attr("class", "chart_background")
        .attr("x", marginLeft);

      // Left axis
      svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickSizeOuter(0)
            .tickPadding(8)
            .tickSizeInner(-width + marginRight + marginLeft)
        )
        .call((g) =>
          g
            .append("text")
            .attr("class", "axis_label")
            .attr("x", -marginLeft)
            .attr("y", -marginLeft / 2)
            .attr("fill", "currentColor")
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .text(this.graphMetadata["y-axis_title"])
        );

      // Right axis
      svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${width - marginRight}, 0)`)
        .call(d3.axisRight(y).tickSize(0))
        .call((g) => g.selectAll(".tick").remove())
        .append("path")
        .attr("d", `M0,${height}V0`);

      if (this.focus && this.focus.length > 0) {
        this.data = [
          ...this.data.filter((d) => !this.focus.includes(d[2])),
          ...this.data.filter((d) => this.focus.includes(d[2])),
        ];
      }

      // Points in pixel space as [x, y, z], where z is the name of the series.
      let points = this.data.map((d) => [
        this.x(isValidDateStrict(d[0]) ? new Date(d[0]) : d[0]),
        y(d[1]),
        d[2],
      ]);

      // Group points by series
      const groups = d3.rollup(
        points,
        (v) => Object.assign(v, { z: v[0][2] }),
        (d) => d[2]
      );

      // Colors
      const calculatePoint = (i, intervalSize, colorRangeInfo) => {
        var { colorStart, colorEnd, useEndAsStart } = colorRangeInfo;
        return useEndAsStart
          ? colorEnd - i * intervalSize
          : colorStart + i * intervalSize;
      };

      const interpolateColors = (dataLength, colorScale, colorRangeInfo) => {
        var { colorStart, colorEnd } = colorRangeInfo;
        var colorRange = colorEnd - colorStart;
        var intervalSize = colorRange / dataLength;
        var i, colorPoint;
        var colorArray = [];

        for (i = 0; i < dataLength; i++) {
          colorPoint = calculatePoint(i, intervalSize, colorRangeInfo);
          colorArray.push(colorScale(colorPoint));
        }

        return colorArray;
      };

      const colorRangeInfo = {
        colorStart: 0,
        colorEnd: 1,
        useEndAsStart: true,
      };

      const colors = interpolateColors(
        new Set(this.data.map((d) => d[2])).size,
        d3.interpolateSpectral,
        colorRangeInfo
      );

      this.colorScale = d3
        .scaleOrdinal()
        .domain(this.data.map((d) => d[2]))
        .range(colors);

      // Lines
      const line = d3.line();
      const path = svg
        .append("g")
        .selectAll("path")
        .data(groups.values())
        .enter()
        .append("path")
        .attr("stroke", (d) => this.getLineColor(d.z))
        .attr("fill", "none")
        .attr("stroke-width", (d) => (this.isFocussed(d.z) ? "3px" : "1px"))
        .attr("d", (d) => line(d));

      // Thicker axis lines
      svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${marginLeft},0)`)
        .append("path")
        .attr("d", `M0,${height}V0`);

      svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${width - marginRight}, 0)`)
        .append("path")
        .attr("d", `M0,${height}V0`);

      // legend
      const variableLength = this.variables.length - 1;
      const colorScaleLength = COLOR_SCALE_FOCUSSED.length - 1;
      for (let i = 0; i <= variableLength; i++) {
        const lineColor =
          colorScaleLength >= i ? COLOR_SCALE_FOCUSSED[i] : "#777777";
        svg
          .append("circle")
          .attr("cx", 100 + i * 100)
          .attr("cy", 10)
          .attr("r", 5)
          .style("fill", lineColor);
        svg
          .append("text")
          .attr("x", 110 + i * 100)
          .attr("y", 15)
          .text(this.variables[i])
          .style("font-size", "12px")
          .style("fill", "#d9d9d9")
          .attr("alignment-baseline", "middle");
      }

      // Tooltip layer
      const tooltipCircle = svg.append("g").attr("display", "none");
      tooltipCircle
        .append("circle")
        .attr("r", 5)
        .attr("stroke", "white")
        .attr("stroke-width", "2px");

      const tooltip = d3
        .select(this.shadow.getElementById("tooltip"))
        .attr("display", "none");
      const tooltipText = d3
        .select(this.shadow.getElementById("tooltip-text"))
        .attr("display", "none")
        .attr("text-anchor", "middle")
        .attr("y", -8);

      svg
        .on("pointermove", (e) => {
          return pointermoved(
            e,
            this.data,
            this.colorScale,
            this.focus,
            this.graphMetadata
          );
        })
        .on("pointerleave", (e) => {
          return pointerleft(e);
        })
        .on("touchstart", (event) => event.preventDefault());

      this.graph = svg;

      function displayTextWidth(text) {
        let canvas =
          displayTextWidth.canvas ||
          (displayTextWidth.canvas = document.createElement("canvas"));
        let context = canvas.getContext("2d");
        let metrics = context.measureText(text);
        return metrics.width;
      }

      // When the pointer moves, find the closest point, update the interactive tooltip, and enlarge
      // the corresponding line
      function pointermoved(event, data, colorScale, focus, dataUnits) {
        const [xm, ym] = d3.pointer(event);
        if (focus && focus.length > 0) {
          points = points.filter((p) => focus.includes(p[2]));
          data = data.filter((d) => focus.includes(d[2]));
        }
        const i = d3.leastIndex(points, ([x, y]) => Math.hypot(x - xm, y - ym));
        if (focus && focus.length > 0 && focus.includes(data[i][2])) {
          const [x, y, k] = points[i];
          path
            .style("stroke-width", ({ z }) => (z === k ? "4px" : null))
            .filter(({ z }) => z === k)
            .raise();
          const textx = `${dataUnits["x-axis_units"]} ${data[i][0]}`;
          const texty =
            `${parseFloat(data[i][1]).toFixed(2)} ` + dataUnits["y-axis_units"];
          const text = `${textx}, ${texty}`;
          tooltip.style("display", null);
          tooltip.style("left", `${x + (displayTextWidth(text) - 15) / 2}px`);
          tooltip.style("top", `${y - 50}px`);
          tooltipText.style("visibility", "visible");
          tooltipCircle.attr("display", null);
          tooltipCircle.attr("transform", `translate(${x},${y})`);
          tooltipCircle.select("circle").attr("fill", colorScale(k));
          tooltipText.html(text);
        }
        svg.property("value", data[i]).dispatch("input", { bubbles: true });
      }

      function pointerleft() {
        path.style("stroke-width", null);
        tooltip.style("display", "none");
        tooltipText.style("visibility", "hidden");
        tooltipCircle.attr("display", "none");
        svg.node().value = null;
        svg.dispatch("input", { bubbles: true });
      }
      //================
    }

    setFocus = (focus) => {
      this.focus = focus;
      if (this.data && this.data.length > 0) {
        this.drawGraph();
      }
    };

    drawCurrentTime = (date) => {
      if (!isValidDateStrict(this.data[0][0])) {
        return;
      }

      let d = new Date(formatDateTimeStringUTC(date));
      this.graph.select(".current-time").remove();
      this.graph
        .append("line")
        .attr("class", "current-time")
        .attr("x1", this.x(d))
        .attr("y1", 0)
        .attr("x2", this.x(d))
        .attr("y2", this.clientHeight - 2);
    };

    render() {
      this.setDOM(template(this));

      //===Close button===
      const closeButton = this.shadow.getElementById("close-button");

      closeButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("close-graph"));
      });
      //================
    }
  }
);
