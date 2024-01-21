import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js"
import comShaderPosition from "./position.frag?raw"
import comShaderVelocity from "./velocity.frag?raw"
import fs from "./fragment.frag?raw"
import vs from "./vertex.vert?raw"

const LENGTH = 30
const NUM = 50

export default class App extends TemplateArtwork {
  computeRenderer?: GPUComputationRenderer
  comTexs: {
    position: { texture: any; uniforms: any }
    velocity: { texture: any; uniforms: any }
  } = {
    position: { texture: null, uniforms: null },
    velocity: { texture: null, uniforms: null },
  }
  uni?: {
    texturePosition: { value: any }
    textureVelocity: { value: any }
  } = {
    texturePosition: { value: null },
    textureVelocity: { value: null },
  }
  obj?: THREE.Mesh<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    THREE.ShaderMaterial,
    THREE.Object3DEventMap
  >

  constructor() {
    super()
    CommonWork.addAmbientLight()
    CommonWork.addOrbitControls()

    CommonWork?.cameraSyncScreen()
    // CommonWork.addExampleBox()
    this.onInit()
    this.createTrails()
  }

  onInit(): void {
    if (CommonWork?.renderer) {
      this.computeRenderer = new GPUComputationRenderer(
        LENGTH,
        NUM,
        CommonWork?.renderer
      )
    }

    if (!this.computeRenderer) return

    let initPositionTex = this.computeRenderer.createTexture()
    let initVelocityTex = this.computeRenderer.createTexture()

    // this.initPosition(initPositionTex)
    // this.initPosition(initVelocityTex)

    this.comTexs.position.texture = this.computeRenderer?.addVariable(
      "texturePosition",
      comShaderPosition,
      initPositionTex
    )
    this.comTexs.velocity.texture = this.computeRenderer?.addVariable(
      "textureVelocity",
      comShaderVelocity,
      initVelocityTex
    )

    // position
    this.computeRenderer.setVariableDependencies(
      this.comTexs.position.texture,
      [this.comTexs.position.texture, this.comTexs.velocity.texture]
    )
    this.comTexs.position.uniforms =
      this.comTexs.position.texture.material.uniforms

    // velocity
    this.computeRenderer.setVariableDependencies(
      this.comTexs.velocity.texture,
      [this.comTexs.position.texture, this.comTexs.velocity.texture]
    )
    this.comTexs.velocity.uniforms =
      this.comTexs.velocity.texture.material.uniforms
    this.comTexs.velocity.uniforms.time = { type: "f", value: 0 }

    this.computeRenderer.init()

    super.onInit()
  }

  update() {
    this.computeRenderer?.compute()

    if (this.comTexs.velocity.uniforms) {
      this.comTexs.velocity.uniforms.time.value = CommonWork.time.total
      // console.log(
      //   this.comTexs.velocity.uniforms.time.value,
      //   CommonWork.time.total
      // )
    }

    if (this.uni) {
      this.uni.texturePosition.value =
        this.computeRenderer?.getCurrentRenderTarget(
          this.comTexs.position.texture
        ).texture
      this.uni.textureVelocity.value =
        this.computeRenderer?.getCurrentRenderTarget(
          this.comTexs.velocity.texture
        ).texture
    }
  }

  // initPosition(tex: { image: { data: any } }) {
  //   const texArray = tex.image.data
  //   let range = new THREE.Vector3(1000, 1000, 1000)

  //   for (let i = 0; i < texArray.length; i += LENGTH * 4) {
  //     const x = Math.random() * range.x - range.x / 2
  //     const y = Math.random() * range.y - range.y / 2
  //     const z = Math.random() * range.z - range.z / 2
  //     for (let j = 0; j < LENGTH * 4; j += 4) {
  //       texArray[i + j + 0] = x
  //       texArray[i + j + 1] = y
  //       texArray[i + j + 2] = z
  //       texArray[i + j + 3] = 0.0
  //     }
  //   }
  // }

  createTrails() {
    let geo = new THREE.BufferGeometry()

    let pArray = new Float32Array(LENGTH * NUM * 3)
    let indices = new Uint32Array((LENGTH * NUM - 1) * 3)
    let uv = new Float32Array(LENGTH * NUM * 2)

    for (let i = 0; i < NUM; i++) {
      for (let j = 0; j < LENGTH; j++) {
        const c = i * LENGTH + j
        const n = c * 3
        // i = 0, j = 0の時、c = 0 * 2000 + 0 = 0, n = 0
        // i = 0, j = 1の時、c = 0 * 2000 + 1 = 1, n = 3
        // i = 0, j = 2の時、c = 0 * 2000 + 2 = 2, n = 6
        // i = 1, j = 1の時、c = 1 * 2000 + 1 = 2001, n = 6003
        // i = 1, j = 2の時、c = 1 * 2000 + 1 = 2002, n = 6006

        pArray[n] = 0
        pArray[n + 1] = 0
        pArray[n + 2] = 0

        uv[c * 2] = j / LENGTH
        uv[c * 2 + 1] = i / NUM

        indices[n] = c
        indices[n + 1] = Math.min(c + 1, i * LENGTH + LENGTH - 1)
        indices[n + 2] = Math.min(c + 1, i * LENGTH + LENGTH - 1)
        // i = 0, j = 0の時、c = 0
        // 一つ目が0
        // 二つ目がMath.min（0 + 1 = 1, 0 * 2000 + 2000 - 1 = 1999） = 1
        // 三つ目がMath.min（0 + 1 = 1, 0 * 2000 + 2000 - 1 = 1999） = 1
        // i = 0, j = 1の時、c = 1
        // 一つ目が1
        // 二つ目がMath.min（1 + 1 = 2, 0 * 2000 + 2000 - 1 = 1999） = 2
        // 三つ目がMath.min（1 + 1 = 2, 0 * 2000 + 2000 - 1 = 1999） = 2
        // i = 0, j = 2の時、c = 2
        // 一つ目が2
        // 二つ目がMath.min（2 + 1 = 3, 0 * 2000 + 2000 - 1 = 1999） = 3
        // 三つ目がMath.min（2 + 1 = 3, 0 * 2000 + 2000 - 1 = 1999） = 3
        // i = 1, j = 1の時、c = 2001
        // 一つ目が2001
        // 二つ目が（2001 + 1 = 2002, 1 * 2000 + 2000 - 1 = 3999） = 2002
        // 三つ目が（2001 + 1 = 2002, 1 * 2000 + 2000 - 1 = 3999） = 2002
        // i = 1, j = 2の時、c = 2002
        // 一つ目が2002
        // 二つ目が（2001 + 1 = 2002, 1 * 2000 + 2000 - 1 = 3999） = 2002
        // 三つ目が（2001 + 1 = 2002, 1 * 2000 + 2000 - 1 = 3999） = 2002

        // i = 10, j = 0の時、c = 10 * 2000 + 0 = 20000
        // 一つ目が20000
        // 二つ目が（20000 + 1 = 20001, 10 * 2000 + 2000 - 1 = 21999） = 20001
        // 三つ目が（20000 + 1 = 20001, 10 * 2000 + 2000 - 1 = 21999） = 20001

        // Math.minは必要か？
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pArray, 3))
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2))
    geo.setIndex(new THREE.BufferAttribute(indices, 1))

    this.uni = {
      texturePosition: { value: null },
      textureVelocity: { value: null },
    }

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uni,
      vertexShader: vs,
      fragmentShader: fs,
    })

    mat.wireframe = true

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
