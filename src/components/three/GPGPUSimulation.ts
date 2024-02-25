import { GPUComputationRenderer } from "three/examples/jsm/Addons.js"

export default class GPGPUSimulation {
  gpuComp: GPUComputationRenderer
  variables: Record<string, any>
  constructor({
    width,
    height,
    renderer,
  }: {
    width: number
    height: number
    renderer: THREE.WebGLRenderer | null
  }) {
    if (!renderer) throw new Error("renderer is null")
    this.gpuComp = new GPUComputationRenderer(width, height, renderer)
    this.variables = []
  }

  add({ name, shader }: { name: string; shader: string }) {
    const texture = this.gpuComp.createTexture()
    const variable = this.gpuComp.addVariable(name, shader, texture)
    this.variables[name] = { texture: variable, uniforms: null }
    return texture
  }

  setDepend() {
    const valArray = Object.values(this.variables)
    valArray.forEach((val) => {
      this.gpuComp.setVariableDependencies(
        val.texture,
        valArray.map((t) => t.texture)
      )
    })
  }

  setUniforms(uniObj: { [key: string]: string | number | THREE.Texture }) {
    const valArray = Object.values(this.variables)
    const uniKeys = Object.keys(uniObj)
    valArray.forEach((val) => {
      val.uniforms = val.texture.material.uniforms
      uniKeys.forEach((key) => {
        val.uniforms[key] = { value: uniObj[key as keyof typeof uniObj] }
      })
    })
  }

  init() {
    this.setDepend()
    this.gpuComp.init()
  }

  update(uniObj: { [key: string]: string | number | THREE.Texture }) {
    this.gpuComp.compute()
    this.setUniforms(uniObj)
  }

  getTexture(name: string) {
    return this.gpuComp.getCurrentRenderTarget(this.variables[name].texture)
      .texture
  }
}
