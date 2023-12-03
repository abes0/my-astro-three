import CommonWork from "@three/CommonWork"

export default class TemplateArtwork {
  common?: CommonWork

  constructor($canvas: HTMLCanvasElement) {
    this.init($canvas)
  }

  init($canvas: HTMLCanvasElement) {
    this.common = new CommonWork({ $canvas })
    window.addEventListener("resize", this.resize.bind(this))
    this.loop()
  }

  resize() {
    this.common?.resize()
  }

  loop() {
    this.render()
    requestAnimationFrame(this.loop.bind(this))
  }

  render() {
    this.common?.render()
  }
}
