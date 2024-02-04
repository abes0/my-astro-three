import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js"
import comShaderPosition from "./position.frag?raw"
import comShaderVelocity from "./velocity.frag?raw"
import fs from "./fragment.frag?raw"
import vs from "./vertex.vert?raw"
import GPGPUSimulation from "@three/GPGPUSimulation"

const WIDTH = 100

export default class App extends TemplateArtwork {
  computeRenderer?: GPUComputationRenderer
  comTexs: {
    position: { texture: any; uniforms: any }
    velocity: { texture: any; uniforms: any }
  } = {
    position: { texture: null, uniforms: null },
    velocity: { texture: null, uniforms: null },
  }
  obj?: THREE.Mesh<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    THREE.ShaderMaterial,
    THREE.Object3DEventMap
  >
  uni: any
  simulation?: GPGPUSimulation

  constructor() {
    super()
    CommonWork.addOrbitControls()
    CommonWork?.cameraSyncScreen()
    this.onInit()
    this.createTrails()
  }

  onInit(): void {
    this.simulation = new GPGPUSimulation({
      width: WIDTH,
      height: WIDTH,
      renderer: CommonWork.renderer,
    })
    this.simulation.add({ name: "texturePosition", shader: comShaderPosition })
    this.simulation.add({ name: "textureVelocity", shader: comShaderVelocity })
    this.simulation.setUniforms({ time: 0, seed: Math.random() * 100 })
    this.simulation.init()

    super.onInit()
  }

  update() {
    this.simulation?.update({ time: CommonWork.time.total })

    if (this.uni) {
      this.uni.texturePosition.value =
        this.simulation?.getTexture("texturePosition")
      this.uni.textureVelocity.value =
        this.simulation?.getTexture("textureVelocity")
    }
  }

  createTrails() {
    const box = new THREE.BoxGeometry(20, 20, 20)
    const geo = new THREE.InstancedBufferGeometry()
    geo.index = box.index
    geo.attributes = box.attributes
    geo.instanceCount = WIDTH * WIDTH

    const offset = []
    const instancedUv = []
    const range = 500
    for (let i = 0; i < WIDTH; i++) {
      for (let j = 0; j < WIDTH; j++) {
        const x = Math.random() * range - range / 2
        const y = Math.random() * range - range / 2
        const z = Math.random() * range - range / 2
        offset.push(x, y, z)
        instancedUv.push(i / WIDTH, j / WIDTH)
      }
    }

    geo.setAttribute(
      "offset",
      new THREE.InstancedBufferAttribute(new Float32Array(offset), 3)
    )
    geo.setAttribute(
      "instancedUv",
      new THREE.InstancedBufferAttribute(new Float32Array(instancedUv), 2)
    )

    this.uni = {
      texturePosition: { value: null },
      textureVelocity: { value: null },
      uvDiff: { value: 1 / WIDTH },
    }

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uni,
      vertexShader: vs,
      fragmentShader: fs,
      side: THREE.DoubleSide,
    })

    this.obj = new THREE.Mesh(geo, mat)
    this.obj.matrixAutoUpdate = false
    this.obj.updateMatrix()

    CommonWork.scene?.add(this.obj)
  }

  onRender(): void {
    this.update()
    super.onRender()
  }
}
