import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js"
import comShaderPosition from "./position.frag?raw"
import comShaderVelocity from "./velocity.frag?raw"
import fs from "./fragment.frag?raw"
import vs from "./vertex.vert?raw"
import GPGPUSimulation from "@three/GPGPUSimulation"

const WIDTH = 32
const NUMBER = WIDTH * WIDTH

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
    CommonWork.addAmbientLight()
    // CommonWork.addDrirectionalLight()
    CommonWork.addOrbitControls()

    CommonWork?.cameraSyncScreen()
    // CommonWork.addExampleBox()
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
    const box = new THREE.BoxGeometry(2, 2, 2)
    const boxVertexArray = [
      1, 1, 1, 1, 1, -1, 1, -1, 1, 1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, -1,
      -1, -1, 1, -1, 1, -1, 1, 1, -1, -1, 1, 1, 1, 1, 1, -1, -1, 1, 1, -1, 1,
      -1, -1, -1, 1, -1, -1, -1, 1, 1, 1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, -1,
      -1, 1, -1, 1, -1, -1, -1, -1, -1,
    ]
    const _boxVertexArray = [
      1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1,
      -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1,
      1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1,
      1, -1, 1, -1, -1, -1, -1, -1,
    ]
    const boxIndeces = [
      0, 2, 1, 2, 3, 1, 4, 6, 5, 6, 7, 5, 8, 10, 9, 10, 11, 9, 12, 14, 13, 14,
      15, 13, 16, 18, 17, 18, 19, 17, 20, 22, 21, 22, 23, 21,
    ]

    const _boxIndeces = [
      0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12,
      14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
    ]

    const geo = new THREE.BufferGeometry()
    const pos = []
    const uv = []
    const indices = []

    // console.log(_boxVertexArray.length)

    for (let i = 0; i < NUMBER; i++) {
      for (let j = 0; j < boxVertexArray.length; j++) {
        pos.push(boxVertexArray[j])

        uv.push(i / NUMBER)
        uv.push(j / boxVertexArray.length)

        if (j % 3 === 0) {
          indices.push(boxIndeces[j] + i * 24) // 24 = boxIndeces.length
        }
      }
    }

    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(pos), 3)
    )
    geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uv), 2))
    geo.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))

    this.uni = {
      texturePosition: { value: null },
      textureVelocity: { value: null },
      uvDiff: { value: 1 / WIDTH },
    }

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uni,
      vertexShader: vs,
      fragmentShader: fs,
      // wireframe: true,
    })

    this.obj = new THREE.Mesh(geo, mat)
    this.obj.matrixAutoUpdate = false
    this.obj.updateMatrix()

    // this.obj.castShadow = true

    CommonWork.scene?.add(this.obj)
  }

  onRender(): void {
    this.update()
    super.onRender()
  }
}
