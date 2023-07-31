import {
  SimulationNodeDatum,
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
} from "d3";

import staticGraph from './graph.json'

interface Graph {
  nodes: ({
    id: number;
    name: string;
    timestamp: number;
  } & SimulationNodeDatum)[];
  links: { source: number; target: number; timestamp: number }[];
}

function getURLParameter(parameterName: string) {
  const currentURL = window.location.href;
  const queryString = currentURL.split("?")[1];
  const searchParams = new URLSearchParams(queryString);
  return searchParams.get(parameterName);
}

// Set up the D3 force simulation
export function setupNetwork(element: string) {
  const height = 300;
  const width = 300;

  const timestampParam = getURLParameter("timestamp");
  const timestamp = timestampParam ? parseInt(timestampParam) : 1;

  const { nodes: nodesData, links: linksData } = staticGraph as unknown as Graph;
  const svg = select(element)
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .style("border", "1px solid black");

  const links = svg
    .append("g")
    .selectAll(".link")
    .data(linksData.filter((link) => link.timestamp === timestamp))
    .join("line")
    .attr("class", "link")
    .attr("stroke", "black")
    .attr("fill", "none")
    .attr("data-timestamp", timestamp);

  const nodes = svg
    .selectAll(".node")
    .data(nodesData.filter((node) => node.timestamp === timestamp))
    .join("circle")
    .attr("class", "node")
    .attr("id", (d) => d.id)
    .attr("r", 10)
    .attr("data-timestamp", timestamp);

  function ticked() {
    nodes
      .attr("cx", (d: (typeof nodesData)[number]) => d?.x || 0)
      .attr("cy", (d: (typeof nodesData)[number]) => d?.y || 0);

    links
      .attr("x1", (d: any) => d.source.x)
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y);
  }

  forceSimulation(nodesData.filter((node) => node.timestamp === timestamp))
    .force("charge", forceManyBody().strength(-20))
    .force("center", forceCenter(height / 2, width / 2))
    .force(
      "link",
      forceLink(linksData.filter((link) => link.timestamp === timestamp))
        .id((d: any) => d.id)
        .distance(100)
    )
    .on("tick", ticked)
    .on("end", function () {
      const customEvent = new Event("simulationEnd");
      document.dispatchEvent(customEvent);
    });

  return svg;
}
