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
    class: string;
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
  max_timestamps: number;
}

export function setupPostRenderNetwork(element: string, graph: RenderGraph) { // Add num_timestamps as parameter
  const timestamps = range(0, graph.max_timestamps).map((d) => `${d}`);  
  let index = 0;
  const height = 500;
  const width = 500;

  const svg = select(element)
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .style("border", "1px solid black");

  setInterval(function () { // running code every X time 
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

    console.log(updatedLinks)

    //update arrowheads 

    // Animate Nodes
    svg
      .selectAll(".renderNodes")
      .data(updatedNodes, (node: any) => node.id)
      .join(
        (enter) =>
          enter
            // .append("circle")
            // .attr("cx", 0)
            // .attr("cy", 0)
            // .attr("r", 0)
            .append("ellipse")
            .attr("rx", 5)
            .attr("ry", 20)

            // Variable size for "Env" node 
            .attr("rx", d => {
              if(d.class === "env"){
                return 50
              }
              else {
                return 10 
              } 
            })
            .attr("ry", d => {
              if(d.class === "env"){
                return 30
              }
              else {
                return 10 
              } 
            })
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
