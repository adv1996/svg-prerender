import d3, {
  D3DragEvent,
  SimulationNodeDatum,
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
} from "d3";

import staticGraph from './input.json'

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

function runSimulation(svgId: string, height: number, width: number, graph: Graph, timestamp: number) {
  console.log('timestamp', timestamp)
  const { nodes: nodesData, links: linksData } =
  graph;

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
    .data(linksData.filter((link) => link.timestamp === timestamp  && link.source !== link.target ))
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
    .data(nodesData.filter((node) => node.timestamp === timestamp))
    .join("ellipse")
    .attr("id", d =>  d.id)
    .attr("rx", d => {
      if (d.class === "env") {
        return 50
      }
      else {
        return 10
      }
    })
    .attr("ry", d => {
      if (d.class === "env") {
        return 30
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

      if (d.self_signal === 1){
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
          if (!event.active) simulation.alphaTarget(0.3).restart();
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
          if(!d.fixed){
            d.fx = event.x;
            d.fy = event.y;
            d.fixed = true;
          } else {
            d.fx = null;
            d.fy = null;
            d.fixed = false;
          }
          // select(this).attr("stroke", null);
        })
    );
  

  function ticked() {

    links
      .attr("x1", (d: any) => {
        if (d.source.id == "env"){
          return width / 2
        }

        else if (d.source.class == "seed"){
          return width / 2
        }

        else {return d.source.x}
      })

      .attr("y1", (d: any) => {
        if (d.source.id == "env"){
          return height / 8
        }

        else if (d.source.class == "seed"){
          return height / 4
        }

        else {return d.source.y}
      })

      .attr("x2", (d: any) => {
        if (d.target.id == "env"){
          return width / 2
        }
        else if (d.target.class == "seed"){
          return width / 2
        }

        else {return d.target.x}
      })

      .attr("y2", (d: any) => {
        if (d.target.id == "env"){
          return height / 8
        }

        else if (d.target.class == "seed"){
          return height / 4
        }

        else {return d.target.y}
      })

      .attr("marker-end", "url(#arrowhead)") // Apply the Arrowhead Marker to Links
      .lower()


    nodes
      .attr("cx", (d: any) => {
        if (d.id === "env") {
          return width / 2
        } 

        else if (d.class === "seed") {
          return width / 2
        } 
         

        else { return d?.x}
      
      })

      .attr("cy", (d: any) => {
        if (d.id === "env") {
          return height / 8
        } 

        else if (d.class === "seed") {
          return height / 4
        } 

        else { return d?.y}
        
      });

  }

  const simulation = forceSimulation(nodesData.filter((node) => node.timestamp === timestamp))
    .force("charge", forceManyBody().strength(200))
    .force('collision', forceCollide().radius(function (d) {
      return 30 //Create a variable collide radius ? d.radius 
    }))
    .force("center", forceCenter(height / 2, width / 2))
    .force(
      "link",
      forceLink(linksData.filter((link) => link.timestamp === timestamp))
        .id((d: any) => d.id)
        .distance(400)
    )
    .on("tick", ticked)
    .on("end", function () {
      const customEvent = new Event("simulationEnd");
      document.dispatchEvent(customEvent);
    });

}


// Set up the D3 force simulation
export function setupNetwork(element: string, playButton: string, max_timestamps: number) {
  const height = 600;
  const width = 800;

  const timestampParam = getURLParameter("timestamp");
  const timestamp = timestampParam ? parseInt(timestampParam) : 1;

  // const { nodes: nodesData, links: linksData } = staticGraph as unknown as Graph;

  select(playButton).on("click", (d) => {
    console.log("Playing Animation");
    let index = timestamp
    setInterval(function () {
      if (index < max_timestamps) {
        index++;
      } else {
        index = 0;
      }
      runSimulation("#prerender-canvas", height, width, staticGraph as unknown as Graph, index)
      console.log("Playing...");

      select("#timeslider")
        .attr('value', index)

      select("#currentTimestampLabel")
        .text(index)
    }, 1000);
    // window.location.href = `/?timestamp=${d.target.value}`;
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