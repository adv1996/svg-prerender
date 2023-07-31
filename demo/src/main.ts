import './style.css'
import { setupNetwork } from './network.ts'
import { RenderGraph, setupPostRenderNetwork} from './postRenderNetwork.ts'
import data from '../../exports/output.json'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <h1>SVG Prerender Node Network Demo</h1>
    <div class="charts">
      <div id="prerender_chart"/>
      <div id="postrender_chart"/>
    </div>
  </div>
`

setupNetwork('#prerender_chart')
setupPostRenderNetwork('#postrender_chart', data as unknown as RenderGraph)

