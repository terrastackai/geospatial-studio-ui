/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      font-family: "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    #color-bar-container {
      background: #1c1c1c;
      border-radius: 10px 10px 10px 10px;
      border: 1px solid var(--cds-field-02, #393939);
      width: 100%;
    }

    .axis_label {
      font-size: 14px !important;
      color: #d9d9d9 !important;
    }

    .axis text {
      font-size: 12px;
      color: #c4c4c4;
    }

    #skeleton {
      position: absolute;
      padding: 0;
      border: none;
      background: transparent;
      box-shadow: none;
      pointer-events: none;
      top: 30px;
      margin-left: 30px;
      width: 15px;
      height: 350px;
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
        transform: scaleY(0);
        transform-origin: bottom;
      }
      20% {
        opacity: 1;
        transform: scaleY(1);
        transform-origin: bottom;
      }
      28% {
        transform: scaleY(1);
        transform-origin: top;
      }
      51% {
        transform: scaleY(0);
        transform-origin: top;
      }
      58% {
        transform: scaleY(0);
        transform-origin: top;
      }
      82% {
        transform: scaleY(1);
        transform-origin: top;
      }
      83% {
        transform: scaleY(1);
        transform-origin: bottom;
      }
      96% {
        transform: scaleY(0);
        transform-origin: bottom;
      }
      100% {
        opacity: 0.3;
        transform: scaleY(0);
        transform-origin: bottom;
      }
    }

    .display-none {
      display: none;
    }

    .legend-color-block {
      height: 16px;
      width: 16px;
      margin-right: 1rem;
      margin-left: 1.5rem;
    }
    .legend-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: white;
    }
    .legend-entry {
      display: flex;
      flex-direction: row;
      padding: 0.4rem 1rem;
      background-color: var(--cds-layer, #262626);
      color: #4d5358;
      align-items: center;
    }
    .legend-header {
      flex-direction: row;
      padding: 0.75rem 1rem;
      background-color: var(--cds-layer, #262626);
      color: white;
      text-align: center;
    }
    .layer-item:has(.legend-entry) .layer-header-row {
      border-bottom: 1px solid var(--cds-field-03);
    }
  </style>

  <div id="color-bar-container">
    <svg id="chart"></svg>
    <div id="skeleton" class="skeleton"></div>
  </div>
`;

export const legendEntryTemplate = (el) => /* HTML */ `
  <div class="legend-entry">
    <span
      class="legend-color-block"
      style="background-color: ${el.color}"
    ></span>
    <span class="legend-label">${el.title}</span>
  </div>
`;

export const legendLayerTemplate = (entries, header) => /* HTML */ `
  <div class="legend-header">${header}</div>
  ${entries.map(legendEntryTemplate).join("\n")}
`;

export function drawColorScaleLegendDiv(
  legendLayerDiv,
  legendLayerDivInnerHTML
) {
  return (legendLayerDiv.innerHTML = legendLayerDivInnerHTML);
}

window.customElements.define(
  "color-bar",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.data = null;
    }

    drawColorScale(colorMap, axisTitle) {
      this.shadow.getElementById("skeleton").classList.add("display-none");
      //===Graph===
      // Chart’s dimensions.
      const width = 100;
      const height = 400;
      const marginTop = 30;
      const marginBottom = 20;
      const marginLeft = 30;

      d3.select(this.shadow.getElementById("chart")).selectAll("*").remove();

      // Positional scales
      colorMap = colorMap.map((e) => {
        return { ...e, quantity: Number(e.quantity) };
      });
      const y = d3
        .scaleLinear()
        .domain([
          d3.min(colorMap, (e) => e.quantity),
          d3.max(colorMap, (e) => e.quantity),
        ])
        .range([height - marginBottom, marginTop]);

      // Color Scale
      const colors = chroma
        .scale(colorMap.map((e) => e.color))
        .domain(colorMap.map((e) => e.quantity));

      const iR = d3.range(
        d3.min(colorMap, (e) => e.quantity),
        d3.max(colorMap, (e) => e.quantity),
        (d3.max(colorMap, (e) => e.quantity) -
          d3.min(colorMap, (e) => e.quantity)) /
          300
      );

      const h = height / iR.length + 1;

      // SVG container
      const svg = d3
        .select(this.shadow.getElementById("chart"))
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

      // Color shapes
      const chartCell = svg
        .append("g")
        .attr("transform", `translate(${marginLeft}, 0)`);

      chartCell.selectAll("rect").remove();
      iR.forEach((d) => {
        chartCell
          .append("rect")
          .style("fill", colors(d))
          .attr("height", h)
          .attr("width", 15)
          .attr("x", 0)
          .attr("y", y(d));
      });

      // Y axis
      svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${marginLeft + 15},0)`)
        .call(
          d3
            .axisRight(y)
            .tickValues(colorMap.map((e) => e.quantity))
            .tickSize(0)
            .tickPadding(8)
        )
        .call((g) => g.selectAll(".domain").attr("stroke-opacity", 0))
        .call((g) =>
          g
            .append("text")
            .attr("class", "axis_label")
            .attr("x", -height / 2)
            .attr("y", -marginLeft + 8)
            .attr("fill", "currentColor")
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .text(axisTitle)
        );
    }

    drawColorScaleLegend(el, header) {
      this.shadow.getElementById("skeleton").classList.add("display-none");
      this.shadow.getElementById("chart").classList.add("display-none");
      const legendLayerDiv = document.createElement("div");
      this.shadow.getElementById("color-bar-container").append(legendLayerDiv);
      const colorMap = el.map((item) => {
        return { title: item.title, color: item.symbolizers[0]?.Polygon?.fill };
      });
      let legendLayerDivInnerHTML = legendLayerTemplate(colorMap, header);
      drawColorScaleLegendDiv(legendLayerDiv, legendLayerDivInnerHTML);
    }

    render() {
      this.setDOM(template(this));
    }
  }
);
