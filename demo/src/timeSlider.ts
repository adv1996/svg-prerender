import { select } from "d3"
import { getURLParameter } from "./network"

const setupSlider = (id: string) => {
  console.log('setting up slider', id)
  select(id)
    .attr('value', getURLParameter('timestamp'))
    .on('change', (d) => {
      console.log(d.target.value)
      window.location.href = `/?timestamp=${d.target.value}`;
    })

}

export { setupSlider }