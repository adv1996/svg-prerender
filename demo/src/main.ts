import './style.css'
import { setupNetwork } from './preRenderNetwork.ts'
import { setupLegend } from './legend.ts'

import { RenderGraph, setupPostRenderNetwork} from './postRenderNetwork.ts'
import data from '../../exports/output.json'
import { setupSlider } from './timeslider.ts'
import { setupPlayButton } from './playButton.ts'

const max = data.max_timestamps-1

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <h1>StemAI D3 Visualization Demo</h1>
    <div class="charts">
      <div id="prerender_chart"></div>
      <div id="postrender_chart"></div>
      <div id="legend"></div>
  
    </div>
    
    <input type="range" id="timeslider" name="timeslider" min="1" max=${max}>
    <button id="play">Play</button>
    <p>Current Timestamp <span id="currentTimestampLabel"></span><p>

    

  </div>
`

setupNetwork('#prerender_chart', "#play", max)
setupPostRenderNetwork('#postrender_chart', data as unknown as RenderGraph) //Add num_timestamps as parameter
setupLegend('#legend')
setupSlider("#timeslider")
// setupPlayButton("#play", max)
