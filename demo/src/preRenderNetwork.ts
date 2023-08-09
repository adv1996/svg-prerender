import d3, {
  D3DragEvent,
  SimulationNodeDatum,
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  select,
  selectAll,
} from "d3";

import staticGraph from './input.json'
import { cloneDeep } from "lodash";

interface Graph {
  nodes: ({
    id: number | string;
    class: string;
    will_die: number;
    will_divide: number;
    self_efficacy: number;
    self_signal: number;
    timestamp: number;
  } & SimulationNodeDatum)[];
  links: { source: number; target: number; signal: number; timestamp: number }[];
}

export function getURLParameter(parameterName: string) {
  const currentURL = window.location.href;
  const queryString = currentURL.split("?")[1];
  const searchParams = new URLSearchParams(queryString);
  return searchParams.get(parameterName);
}

const height = 600;
const width = 800;

const fixNodes = {env: {x: width/2, y: height/4, rx: 30, ry: 10}}

function runSimulation(svgId: string, height: number, width: number, graph: Graph, timestamp: number) {
  console.log('timestamp', timestamp)
  let { nodes: nodesData, links: linksData } =
    graph;

  // selectAll('.link').remove();
  // selectAll('.node').remove();
  
  // const clonedNodes = cloneDeep(nodesData.filter((node) => node.timestamp === timestamp))
  // const clonedLinks = cloneDeep(linksData.filter((link) => link.timestamp === timestamp && link.source !== link.target))

  const clonedNodes = nodesData.filter((node) => node.timestamp === timestamp)
  select(".numAgents").text(`Number of Agents ${clonedNodes.length - 1}`)
  const clonedLinks = linksData.filter((link) => link.timestamp === timestamp && link.source !== link.target)

  // nodesData = nodesData.map(node => ({...node, x: width/2, y: height}))

  const svg = select(svgId)

  const arrowhead = svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", "6")
    .attr("fill", "grey")
    .attr("opacity", .7)
    .attr("markerHeight", "6")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", "10")
    .attr("refY", "5")
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,0 L10,5 L0,10 Z") // Customize the path to create your arrowhead shape


  const links = svg
    .selectAll(".link")
    // .data(linksData.filter((link) => link.timestamp === timestamp && link.source !== link.target))
    .data(clonedLinks)
    .join("line")
    .attr("class", "link")
    // .attr("stroke", "red")
    .attr("stroke", d => (d.signal === 1 ? "green" : "grey")) // Set the color based on the signal property
    .style("stroke-dasharray", 3)
    .style("stroke-width", 3)
    .attr("fill", "none")
    .attr("data-timestamp", timestamp)
    .attr("marker-end", "url(#arrowhead)"); // Apply the Arrowhead Marker to Links
  ;

  const nodes = svg
    .selectAll(".node")
    // .data(nodesData.filter((node) => node.timestamp === timestamp))
    .data(clonedNodes)
    .join(
      (enter) =>
        enter
          .append("ellipse")
          .attr("id", d => d.id)
          .attr("rx", d => {
            if (d.class === "env") {
              return fixNodes.env.rx
            }
            else {
              return 10
            }
          })
          .attr("ry", d => {
            if (d.class === "env") {
              return fixNodes.env.ry
            }
            else {
              return 10
            }
          })
          .attr("data-timestamp", timestamp)
          .attr("stroke-width", "4")
          .attr("class", "node")
          // .attr("fill", "blue")
          .attr("fill", d => {

            if (d.class === "env") {
              return "green";
            } else if (d.will_die === 1) {
              return "red";
            } else if (d.will_divide === 1) {
              return "pink";
            } else if (d.class === "seed") {
              return "yellow";
            } else {
              return "black";
            }
          })
          .attr("stroke", (d) => {
            if (d.self_signal === 1) {
              return "green";
            }
            else if (d.class === "env") {
              return "green";
            }
            else if (d.will_die === 1) {
              return "red";
            }
            else if (d.will_divide === 1) {
              return "pink";
            }
            else if (d.class === "seed") {
              return "yellow";
            }
            else {
              return "black";
            }
          })
          .attr("opacity", d => { // Does this work, or need relative calculation? Is self-efficacy metric always between 0-1?
            if (d.class === "non-seed") {
              return d.self_efficacy + .3
            }
            else {
              return 1
            }
          })

          .call(
            drag<any, (typeof nodesData)[number]>()
              .on("start", function (event: D3DragEvent<any, any, any>) {
                if (!event.active) simulation.alphaTarget(.3).restart();
                select(this).raise().attr("stroke", "black");
              })
              .on("drag", function (event: D3DragEvent<any, any, any>, d: any) {
                // select(this)
                //   .attr("cx", (d.x = event.x))
                //   .attr("cy", (d.y = event.y));
                d.fx = event.x;
                d.fy = event.y;
              })
              .on("end", function (event: D3DragEvent<any, any, any>, d: any) {
                if (!d.fixed) {
                  d.fx = event.x;
                  d.fy = event.y;
                  d.fixed = true;
                } else {
                  d.fx = null;
                  d.fy = null;
                  d.fixed = false;
                }
                // select(this).raise().attr("stroke", ");
                select(this).attr("stroke", null);
              })
          )
          .selection(),
      (update) =>
        update
          // .attr("fill", "red")
          // .transition()
          // .duration(500)
          .attr("cx", (d: any) => d.cx)
          .attr("cy", (d: any) => d.cy)
           
          .selection(),
      (exit) => exit.transition().duration(500).attr("r", 0).remove()
    )

  function ticked() {

    links
      .attr("x1", (d: any) => {
        if (d.source.id == "env") {
          return fixNodes.env.x
        }
        else if (d.source.class == "seed") {
          return 355
        }
        else { return d.source.x }
        // return d.source.x
      })

      .attr("y1", (d: any) => {
        if (d.source.id == "env") {
          return fixNodes.env.y
        }

        else if (d.source.class == "seed") {
          return 250
        }

        else { return d.source.y - 100 }
        // return d.source.y - 100
      })

      .attr("x2", (d: any) => {
        if (d.target.id == "env") {
          return fixNodes.env.x
        }
        else if (d.target.class == "seed") {
          return 355
        }

        else { return d.target.x }
        // return d.target.x 
      })

      .attr("y2", (d: any) => {
        if (d.target.id == "env") {
          return fixNodes.env.y
        }

        else if (d.target.class == "seed") {
          return 250
        }

        else { return d.target.y - 100 }
        // return d.target.y  - 100
      })

      .attr("marker-end", "url(#arrowhead)") // Apply the Arrowhead Marker to Links
      .lower()


    nodes
      .attr("cx", (d: any) => {
        // if (d.id === "env"){
        //   console.log(d.x, d.y)
        // }
        // if (d.x <= 50 || d.x >= width){
        //   d.x = width /2 
        // }
        if (d.id === "env") {
          d.x = fixNodes.env.x
          return d.x
        }

        else if (d.class === "seed") {
          d.x = 355
          return d.x
        }

        else { return d?.x }

        // return d?.x

      })

      .attr("cy", (d: any) => {
        // console.log(d.radius)
        // if (d.y <= 50 || d.y >= height - 50){
        //   d.y = height /2 
        // }
        if (d.id === "env") {
          d.y = fixNodes.env.y
          return d.y
        }

        else if (d.class === "seed") {
          d.y = height / 2.8
          return d.y
        }

        else { return d?.y - 100 }
        // return d?.y - 100

      });

  }

  const simulation = forceSimulation(clonedNodes)
    .force("charge", forceManyBody().strength(-500))
    .force('collision', forceCollide().radius(function (d: any) {
      if (d.class === "env") { // 
        return 10
      }
      else {
        return 10
      }
    }))
    .force("center", forceCenter(width / 2, height / 2))
    // .force("x", forceX().x((d: any) => {
    //   return width / 2
    // }))
    // .force("y", forceY().y((d: any) => {
    //   if (d.id === "env") {
    //     return height / 2
    //   }
    //   else if (d.class === "seed") {
    //     return height / 4
    //   }
    //   else { return height / 2 }

    // }))
    .force(
      "link",
      forceLink(clonedLinks)
        .id((d: any) => d.id)
        .distance(100)
    )
    .on("tick", ticked)
    .on("end", function () {
      const customEvent = new Event("simulationEnd");
      document.dispatchEvent(customEvent);
    })
    .alpha(.5);

}


// Set up the D3 force simulation
export function setupNetwork(element: string, playButton: string, max_timestamps: number) {
  // const height = 600;
  // const width = 800;

  const timestampParam = getURLParameter("timestamp");
  const timestamp = timestampParam ? parseInt(timestampParam) : 1;

  // const { nodes: nodesData, links: linksData } = staticGraph as unknown as Graph;

  let animationInterval: string | number | NodeJS.Timeout | undefined;
  let isPlaying = false
  let index = timestamp;

  select(playButton).on("click", function () {
    isPlaying = !isPlaying
    if (isPlaying) {
      select(this).text('Pause')
      console.log("Playing Animation");
      animationInterval = setInterval(function () {
        select(".legendTimestep").text(`Timestep: ${index}`)
        select("#currentTimestampLabel").text(index);

        if (index < max_timestamps) {
          index++;
        } else {
          index = 1;
        }
        runSimulation("#prerender-canvas", height, width, staticGraph as unknown as Graph, index);
        console.log("Playing...");
  
        select("#timeslider").attr("value", index);
      }, 1000);
    } else {
      select(this).text('Play')
      clearInterval(animationInterval)
    }
  });



  const svg = select(element)
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .style("border", "1px solid black")
    .attr('id', 'prerender-canvas')
  runSimulation("#prerender-canvas", height, width, staticGraph as unknown as Graph, timestamp)



  return svg;
}
