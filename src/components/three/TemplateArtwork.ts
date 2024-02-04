import CommonWork from "@three/CommonWork"

export default class TemplateArtwork {
  onMouseMove?(e: MouseEvent): void
  onMouseDown?(e: MouseEvent): void
  onMouseUp?(e: MouseEvent): void
  onMouseUp?(e: MouseEvent): void

  constructor() {
    this.setup()
  }

  setup() {
    window.addEventListener("resize", this.onResize.bind(this))

    if (this.onMouseMove) {
      window.addEventListener("mousemove", this.onMouseMove.bind(this), {
        passive: true,
      })
    }
  }

  onInit() {
    this.onLoop()
  }

  onResize() {
    CommonWork?.resize()
  }

  onLoop() {
    this.onRender()
    requestAnimationFrame(this.onLoop.bind(this))
  }

  onRender() {
    CommonWork?.render()
  }
}
