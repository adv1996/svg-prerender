import { select } from "d3";

function range(start: number, end: number) {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

export interface RenderGraph {
  nodes: {
    id: number;
    name: string;
    "data-timestamp": string;
    cx: number;
    cy: number;
    r: number;
  }[];
  links: {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    "data-timestamp": string;
  }[];
}

export function setupPostRenderNetwork(element: string, graph: RenderGraph) {
  const timestamps = range(1, 3).map((d) => `${d}`);
  let index = 0;
  const height = 300;
  const width = 300;

  const svg = select(element)
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .style("border", "1px solid black");

  setInterval(function () {
    // Move to next timestamp
    if (index < timestamps.length - 1) {
      index++;
    } else {
      index = 0;
    }

    // Filter Nodes
    const updatedNodes = graph.nodes.filter(
      (node) => node["data-timestamp"] === timestamps[index]
    );
    const updatedLinks = graph.links.filter(
      (link) => link["data-timestamp"] === timestamps[index]
    );
    // Animate Nodes
    svg
      .selectAll(".renderNodes")
      .data(updatedNodes, (node: any) => node.id)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 0)
            .attr("class", "renderNodes")
            .transition()
            .duration(500)
            .attr("r", (d) => d.r)
            .attr("cx", (d) => d.cx)
            .attr("cy", (d) => d.cy)
            .selection(),
        (update) =>
          update
            .attr('fill', 'red')
            .transition()
            .duration(500)
            .attr('fill', 'black')
            .attr("r", (d) => d.r)
            .attr("cx", (d) => d.cx)
            .attr("cy", (d) => d.cy)
            .selection(),
        (exit) => exit.transition().duration(500).attr("r", 0).remove()
      )

    svg
      .selectAll(".renderLinks")
      .data(updatedLinks, (node: any) => node.id)
      .join(
        (enter) =>
          enter
            .append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("stroke", 'black')
            .attr("fill", 'none')
            .attr("class", "renderLinks")
            .transition()
            .duration(500)
            .attr("x1", (d) => d.x1)
            .attr("x2", (d) => d.x2)
            .attr("y1", (d) => d.y1)
            .attr("y2", (d) => d.y2)
            .selection(),
        (update) =>
          update
            .attr("x1", (d) => d.x1)
            .attr("x2", (d) => d.x2)
            .attr("y1", (d) => d.y1)
            .attr("y2", (d) => d.y2)
            .selection(),
        (exit) => exit.remove()
      )
  }, 1000);

  return svg;
}
