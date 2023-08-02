import { select } from "d3"
import { getURLParameter } from "./preRenderNetwork"

const setupPlayButton = (id: string, max: number) => {
  console.log('setting up button', id)
  select(id)
    .on('click', (d) => {
      console.log("Playing Animation")
      let index = parseInt(getURLParameter('timestamp') || "0")
      setInterval(function () {
        console.log('Playing...')
        window.location.href = `/?timestamp=${index}`;
        index++
      }, 1000)
      // window.location.href = `/?timestamp=${d.target.value}`;
    })

}

export { setupPlayButton }