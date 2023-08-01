import './style.css'
import { setupNetwork } from './network.ts'
import { RenderGraph, setupPostRenderNetwork} from './postRenderNetwork.ts'
import data from '../../exports/output.json'
import { setupSlider } from './timeSlider.ts'

// const max = data.max_timestamps
const max = 3

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <h1>SVG Prerender Node Network Demo</h1>
    <div class="charts">
      <div id="prerender_chart"></div>
      <div id="postrender_chart"></div>
    </div>
    <a href="/?timestamp=1">Next 1</a>
    <a href="/?timestamp=2">Next 2</a>
    <a href="/?timestamp=3">Next 3</a>
    <input type="range" id="timeslider" name="timeslider" min="1" max=${max}>
    <button id="play">Play</button>
  </div>
`

setupNetwork('#prerender_chart', "#play", max)
setupPostRenderNetwork('#postrender_chart', data as unknown as RenderGraph)
setupSlider("#timeslider")
// setupPlayButton("#play", max)

