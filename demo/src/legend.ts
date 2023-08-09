import { select } from "d3";
import graph from "./input.json";

export function setupLegend(element: string) {

    const height =300
    const width = 500

    const svg = select(element)
    .append("svg")
    .attr("height", height)
    .attr("width", width);
    // .style("border", "1px solid black");


    // Create the legend
    const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(25, 50)"); // Adjust the position of the legend

    const number_agents = graph.nodes.length - 1
    console.log(number_agents)

    const legend_data = [
                    {"label": "Time Step: 0", "id": "legendTimestep", "class": "none", "color": "black"},
                    {"label": "Number of Agents: 0" , "id": "numAgents", "class": "none",  "color": "black"},
                    {"label": "Average Out Degree", "class": "none", "color": "black"},
                    {"label": "Green Edge: 1","class": "line", "color": "green"},
                    {"label": "Grey Edge: 0", "class": "line", "color": "grey"},
                    {"label": "Green Node: Environment", "class": "circle", "color": "green"},
                    {"label": "Pink Node: Dividing", "class": "circle", "color": "pink"},
                    {"label": "Red Node: Dying", "class": "circle", "color": "red"},
                    {"label": "Yellow Node: Seed Cell", "class": "circle", "color": "yellow"},
                    {"label": "White-Black Node: Cell Self-Efficacy", "class": "circle", "color": "grey"}
    ]

            
    const legendEntries = legend.selectAll(".legend-entry")
    .data(legend_data) // The categories to be displayed in the legend
    .enter()
    .append("g")
    .attr("class", "legend-entry")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendEntries.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => {

    if (d.class === "none"){
        return "white"
    }
    else{
        return d.color;

    }
    });

    legendEntries.append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text(d => d.label)
    .attr("class", d => d.id || d.class);

}
