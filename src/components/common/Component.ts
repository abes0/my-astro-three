export default class Component {
  static selectorRoot: string | null = null
  el: HTMLCanvasElement | null
  constructor(options: any = {}) {
    const { selectorRoot } = this.constructor as typeof Component
    const { el } = options

    if (!el && selectorRoot) {
      this.el = document.querySelector(selectorRoot)
    } else {
      this.el = el
    }

    if (this.init) this.init()
  }
  init(): void {}
}
