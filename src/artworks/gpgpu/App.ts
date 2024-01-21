import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js"
import fsPosition from "./position.frag?raw"
import fsVelocity from "./velocity.frag?raw"
import fs from "./fragment.frag?raw"
import vs from "./vertex.vert?raw"

const WIDTH = 500
const SIZE = 500
const PARTICLES = WIDTH * WIDTH
const target = [0, 10, -200]

export default class App extends TemplateArtwork {
  gpuCompute?: GPUComputationRenderer
  velocityVariable: any
  positionVariable: any
  particles?: THREE.Points<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    THREE.ShaderMaterial
  >
  geo?: THREE.BufferGeometry<THREE.NormalBufferAttributes>
  uniforms?: {
    texturePosition: { value: any }
    textureVelocity: { value: any }
  }

  constructor() {
    super()
    CommonWork.addAmbientLight()
    // CommonWork.addSpotLight()
    CommonWork.addOrbitControls({ target: [0, 0, 0] })
    // CommonWork.addBox()
    // console.log(CommonWork.scene)
    this.onInit()
    this.addParticles()
  }

  onInit(): void {
    CommonWork?.setCamera({
      position: [0, 1, -100],
      // fov: 75,
      // near: 0.1,
      // far: 15000,
    })
    if (CommonWork.renderer) {
      this.gpuCompute = new GPUComputationRenderer(
        WIDTH,
        WIDTH,
        CommonWork.renderer
      )
    }

    if (this.gpuCompute) {
      const dtPosition = this.gpuCompute.createTexture()
      const dtVelocity = this.gpuCompute.createTexture()
      this.fillTextures(dtPosition, dtVelocity)

      // データをシェーダーアタッチ
      this.velocityVariable = this.gpuCompute.addVariable(
        "textureVelocity",
        fsVelocity,
        dtVelocity
      )
      this.positionVariable = this.gpuCompute.addVariable(
        "texturePosition",
        fsPosition,
        dtPosition
      )

      // プログラムをGPUレンダラーにアタッチ
      // positionプログラムは前フレームのpositionプログラムとvelocityプログラムに依存している
      // →シェーダーでどちらのtextureも参照できる
      this.gpuCompute.setVariableDependencies(this.positionVariable, [
        this.positionVariable,
        this.velocityVariable,
      ])
      this.gpuCompute.setVariableDependencies(this.velocityVariable, [
        this.positionVariable,
        this.velocityVariable,
      ])

      const error = this.gpuCompute.init()
      if (error !== null) {
        console.error(error)
      }
    }
    super.onInit()
  }

  addParticles() {
    const geo = new THREE.BufferGeometry()
    const poistions = new Float32Array(PARTICLES * 3)
    for (let i = 0; i < PARTICLES; i++) {
      const i3 = i * 3
      poistions[i3 + 0] = 0
      poistions[i3 + 1] = 0
      poistions[i3 + 2] = 0
    }

    const uvs = new Float32Array(PARTICLES * 2)
    for (let i = 0; i < WIDTH; i++) {
      for (let j = 0; j < WIDTH; j++) {
        const i2 = i * 2
        uvs[i2 + 0] = i / (WIDTH - 1)
        uvs[i2 + 1] = j / (WIDTH - 1)
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(poistions, 3))
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))

    const uniforms = {
      texturePosition: { value: null },
      textureVelocity: { value: null },
      cameraConstant: {
        value: this.getCameraConstant(
          CommonWork.camera as THREE.PerspectiveCamera
        ),
      },
    }

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vs,
      fragmentShader: fs,
    })
    mat.extensions.drawBuffers = true

    const particles = new THREE.Points(geo, mat)
    particles.matrixAutoUpdate = false
    particles.updateMatrix()

    CommonWork.scene?.add(particles)

    this.particles = particles
    this.geo = geo
    this.uniforms = uniforms
  }

  fillTextures(texturePosition: any, textureVelocity: any) {
    const posArray = texturePosition.image.data
    const velArray = textureVelocity.image.data
    for (let k = 0, kl = posArray.length; k < kl; k += 4) {
      posArray[k + 0] = Math.random() * SIZE - SIZE / 2
      posArray[k + 1] = 0
      posArray[k + 2] = Math.random() * SIZE - SIZE / 2
      posArray[k + 3] = 0

      velArray[k + 0] = Math.random() * 2 - 1
      velArray[k + 1] = Math.random() * 2 - 1
      velArray[k + 2] = Math.random() * 2 - 1
      velArray[k + 3] = Math.random() * 2 - 1
    }
  }

  getCameraConstant(camera: THREE.PerspectiveCamera) {
    const tmp =
      window.innerHeight /
      (Math.tan((THREE.MathUtils.DEG2RAD * 0.5 * camera.fov) / 2) / camera.zoom)
    console.log(tmp)
    return tmp
  }

  onRender(): void {
    super.onRender()
    this.gpuCompute?.compute()

    if (this.uniforms) {
      // console.log(this.uniforms?.texturePosition.value)
      this.uniforms.texturePosition.value =
        this.gpuCompute?.getCurrentRenderTarget(this.positionVariable)?.texture
      this.uniforms.textureVelocity.value =
        this.gpuCompute?.getCurrentRenderTarget(this.velocityVariable)?.texture
    }
    // CommonWork.scene?.children.forEach((child) => {
    //   if (child instanceof THREE.Mesh) {
    //     child.rotation.x += 0.01
    //     child.rotation.y += 0.01
    //   }
    // })
  }
}
