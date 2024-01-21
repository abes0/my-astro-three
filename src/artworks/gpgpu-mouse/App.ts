import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js"
import fsPosition from "./position.frag?raw"
import fsVelocity from "./velocity.frag?raw"
import fs from "./fragment.frag?raw"
import vs from "./vertex.vert?raw"

const WIDTH = 500
const SIZE = 100
const PARTICLES = WIDTH * WIDTH

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
    mouse: { value: THREE.Vector3 }
  }
  mousePosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0)

  constructor() {
    super()
    CommonWork.addAmbientLight()
    // CommonWork.addOrbitControls()
    CommonWork?.cameraSyncScreen()
    // CommonWork.addBox()
    this.onInit()
    console.log(CommonWork.scene, CommonWork.camera)
    this.addParticles()
  }

  onInit(): void {
    // CommonWork?.setCamera({
    //   position: [0, 0, SIZE],
    //   lookAt: [0, 0, 0],
    //   fov: 75,
    //   near: 0.1,
    //   far: 15000,
    // })
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

      this.velocityVariable.material.uniforms["mouse"] = {
        value: this.mousePosition,
      }
      console.log(this.velocityVariable.material.uniforms)

      const error = this.gpuCompute.init()
      if (error !== null) {
        console.error(error)
      }
    }
    super.onInit()
  }

  addParticles() {
    const geo = new THREE.BufferGeometry()

    // パーティクルに対応した配列を用意
    const poistions = new Float32Array(PARTICLES * 3)
    for (let i = 0; i < PARTICLES; i++) {
      const i3 = i * 3
      poistions[i3 + 0] = 0
      poistions[i3 + 1] = 0
      poistions[i3 + 2] = 0
    }

    // uv参照用の配列を用意
    const uvs = new Float32Array(PARTICLES * 2)
    for (let i = 0; i < WIDTH; i++) {
      for (let j = 0; j < WIDTH; j++) {
        const i2 = i * 2
        uvs[i2 + 0] = i / (WIDTH - 1)
        uvs[i2 + 1] = j / (WIDTH - 1)
      }
    }

    // attributeをセット
    geo.setAttribute("position", new THREE.BufferAttribute(poistions, 3))
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))

    // uniformをセット
    const uniforms = {
      texturePosition: { value: null },
      textureVelocity: { value: null },
      mouse: { value: this.mousePosition },
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
    console.log(CommonWork.size)
    const posArray = texturePosition.image.data
    const velArray = textureVelocity.image.data
    const _SIZE = CommonWork.camera?.position.z || SIZE
    for (let k = 0, kl = posArray.length; k < kl; k += 4) {
      // -SIZE / 2 ~ SIZE / 2
      posArray[k + 0] = Math.random() * _SIZE - _SIZE / 2
      posArray[k + 1] = Math.random() * _SIZE - _SIZE / 2
      posArray[k + 2] = Math.random() * _SIZE - _SIZE / 2
      posArray[k + 3] = Math.random() * _SIZE - _SIZE / 2

      // -10 ~ 10
      velArray[k + 0] = 0 // Math.random() * 5 - 5 / 2
      velArray[k + 1] = 0 // Math.random() * 5 - 5 / 2
      velArray[k + 2] = 0 // Math.random() * 5 - 5 / 2
      velArray[k + 3] = Math.random() * 1.25 + 1
    }
    console.log({ posArray, velArray })
  }

  getCameraConstant(camera: THREE.PerspectiveCamera) {
    const tmp =
      window.innerHeight /
      (Math.tan((THREE.MathUtils.DEG2RAD * 0.5 * camera.fov) / 2) / camera.zoom)
    console.log(tmp)
    return tmp
  }

  onMouseMove(e: MouseEvent) {
    // super.onMouseMove(e)
    // const _x = ((e.clientX / CommonWork.size.sw) * 2 - 1) * (SIZE / 2)
    // const _y = ((e.clientY / CommonWork.size.sh) * -2 + 1) * (SIZE / 2)

    const _x = e.clientX - CommonWork.size.sw * 0.5
    const _y = (e.clientY - CommonWork.size.sh * 0.5) * -1

    console.log(
      {
        x: _x,
        y: _y,
      }
      // (e.clientY / CommonWork.size.sh) * 0.5
    )

    this.mousePosition.x = _x
    this.mousePosition.y = _y
  }

  onRender(): void {
    super.onRender()

    this.velocityVariable.material.uniforms["mouse"] = {
      value: this.mousePosition,
    }
    // console.log(this.velocityVariable.material.uniforms["mouse"].value)
    // console.log(this.velocityVariable.material.uniforms)

    this.gpuCompute?.compute()

    if (this.uniforms) {
      // console.log(this.uniforms?.texturePosition.value)
      this.uniforms.texturePosition.value =
        this.gpuCompute?.getCurrentRenderTarget(this.positionVariable)?.texture
      this.uniforms.textureVelocity.value =
        this.gpuCompute?.getCurrentRenderTarget(this.velocityVariable)?.texture
      this.uniforms.mouse.value = this.mousePosition
    }
    // CommonWork.scene?.children.forEach((child) => {
    //   if (child instanceof THREE.Mesh) {
    //     child.rotation.x += 0.01
    //     child.rotation.y += 0.01
    //   }
    // })
  }
}
