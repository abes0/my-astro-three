import CommonWork from "@three/CommonWork"
import GPGPUSimulation from "@three/GPGPUSimulation"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"

import vs from "./vs.vert?raw"
import fs from "./fs.frag?raw"
import fsPosition from "./fsPosition.frag?raw"
import fsVelocity from "./fsVelocity.frag?raw"
import type { IUniform } from "three"
import Interaction from "@common/Interaction"

const size = 128
const WIDTH = 200
const boxSize = 10

export default class App extends TemplateArtwork {
  simulation?: GPGPUSimulation
  fboUni?: { [uniform: string]: any }
  boxesUni?: {
    [uniform: string]: IUniform<any>
  }
  mouse?: Interaction
  rayCaster?: THREE.Raycaster

  constructor() {
    super()
    CommonWork.addAmbientLight()
    CommonWork.addSpotLight()
    // CommonWork.addOrbitControls()
    CommonWork.cameraSyncScreen()
    this.mouse = new Interaction()
    this.onInit()
  }

  onInit(): void {
    CommonWork.renderer?.setClearColor(0x03011c)
    this.mouse?.init(this.eMouseMove.bind(this))
    this.setupFBO()
    this.addBoxes()
    super.onInit()
  }

  setupFBO() {
    this.simulation = new GPGPUSimulation({
      width: size,
      height: size,
      renderer: CommonWork.renderer,
    })
    const positionTexture = this.simulation.add({
      name: "texturePosition",
      shader: fsPosition,
    })
    this.fillPositionTexture(positionTexture)

    const velocityTexture = this.simulation.add({
      name: "textureVelocity",
      shader: fsVelocity,
    })
    this.fillVelocityTexture(velocityTexture)

    this.fboUni = {
      uTime: 0,
      uWidth: WIDTH / 2,
      uMouse: this.mouse?.pos,
      uMouseForce: new THREE.Vector2(0, 0),
      uTouchIP: 0,
      uIsTouch: false,
    }

    if (this.fboUni) {
      this.simulation.setUniforms(this.fboUni)
    }
    this.simulation.init()
  }

  fillPositionTexture(texture: THREE.Texture) {
    const data = new Float32Array(size * size * 4)
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let index = (i + j * size) * 4
        let theta = Math.random() * Math.PI * 2
        let r = WIDTH / 2 + Math.random() * WIDTH
        data[index + 0] = Math.cos(theta) * r
        data[index + 1] = Math.sin(theta) * r
        data[index + 2] = WIDTH * Math.random() - WIDTH / 2 // Math.sin(theta) * Math.cos(theta) * r * Math.random()
        data[index + 3] = 1
      }
    }
    texture.image.data = data
  }

  fillVelocityTexture(texture: THREE.Texture) {
    const data = new Float32Array(size * size * 4)
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let index = (i + j * size) * 4
        data[index + 0] = Math.random()
        data[index + 1] = Math.random()
        data[index + 2] = Math.random()
        data[index + 3] = Math.random()
      }
    }
    texture.image.data = data
  }

  addBoxes() {
    const box = new THREE.BoxGeometry(boxSize, boxSize, boxSize)
    const geo = new THREE.InstancedBufferGeometry()
    geo.index = box.index
    geo.attributes = box.attributes
    geo.instanceCount = size * size
    const instancedUv = []
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        instancedUv.push(i / size, j / size)
      }
    }
    geo.setAttribute(
      "instancedUv",
      new THREE.InstancedBufferAttribute(new Float32Array(instancedUv), 2)
    )

    this.boxesUni = {
      texturePosition: { value: null },
      textureVelocity: { value: null },
      uMouse: { value: this.mouse?.pos },
      uTime: { value: 0 },
    }
    const mat = new THREE.ShaderMaterial({
      uniforms: this.boxesUni,
      vertexShader: vs,
      fragmentShader: fs,
      // depthTest: false,
      // depthWrite: false,
    })

    const mesh = new THREE.Mesh(geo, mat)
    mesh.matrixAutoUpdate = false
    mesh.updateMatrix()

    CommonWork.scene?.add(mesh)
  }

  eMouseMove() {
    if (this.fboUni) {
      this.fboUni.uMouse.set(this.mouse?.pos.x!, this.mouse?.pos.y!)
    }
  }

  onRender(): void {
    this.mouse?.update()
    if (this.fboUni) {
      this.fboUni.uTime = CommonWork.time.total
      this.fboUni.uMouseForce = this.mouse?.vec
      this.fboUni.uTouchIP = this.mouse?.activeIP
      this.fboUni.uIsTouch = this.mouse?.isTouchDevice()
    }

    this.simulation?.update(this.fboUni!)
    if (this.boxesUni) {
      this.boxesUni.texturePosition.value =
        this.simulation?.getTexture("texturePosition")
      this.boxesUni.textureVelocity.value =
        this.simulation?.getTexture("textureVelocity")
      this.boxesUni.uTime.value = CommonWork.time.total
    }

    super.onRender()
  }
}
