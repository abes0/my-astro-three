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
const SHAPES = 4
const R = 0.1
const LINE_WIDTH = 0.5

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

    this.initPosition(initPositionTex)
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

    console.log([this.comTexs.position.texture, this.comTexs.velocity.texture])

    // velocity
    this.computeRenderer.setVariableDependencies(
      this.comTexs.velocity.texture,
      [this.comTexs.position.texture, this.comTexs.velocity.texture]
    )
    this.comTexs.velocity.uniforms =
      this.comTexs.velocity.texture.material.uniforms
    this.comTexs.velocity.uniforms.time = { type: "f", value: 0 }
    this.comTexs.velocity.uniforms.seed = {
      type: "f",
      value: Math.random() * 100,
    }

    this.computeRenderer.init()

    super.onInit()
  }

  update() {
    this.computeRenderer?.compute()

    if (this.comTexs.velocity.uniforms) {
      this.comTexs.velocity.uniforms.time.value = CommonWork.time.total
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

  initPosition(tex: any) {
    var texArray = tex.image.data
    let range = new THREE.Vector3(3.4, 2, 3.4)
    for (var i = 0; i < texArray.length; i += LENGTH * 4) {
      let x = Math.random() * range.x - range.x / 2
      let y = Math.random() * range.y - range.y / 2 + 3
      let z = Math.random() * range.z - range.z / 2
      for (let j = 0; j < LENGTH * 4; j += 4) {
        texArray[i + j + 0] = x
        texArray[i + j + 1] = y
        texArray[i + j + 2] = z
        texArray[i + j + 3] = 0.0
      }
    }
  }

  createTrails() {
    let geo = new THREE.BufferGeometry()

    const posArray = []
    const indexArray = []
    const uvArray = []

    for (let i = 0; i < NUM; i++) {
      for (let j = 0; j < LENGTH; j++) {
        const c = i * LENGTH + j
        for (let k = 0; k < SHAPES; k++) {
          const rad = ((Math.PI * 2) / SHAPES) * k
          const x = Math.cos(rad) * R
          const y = Math.sin(rad) * R
          const z = 0

          posArray.push(x)
          posArray.push(y)
          posArray.push(z)

          uvArray.push(j / LENGTH)
          uvArray.push(i / NUM)

          if (j > 0) {
            const currentBase = c * SHAPES
            const underBase = (c - 1) * SHAPES
            const next = (k + 1) % SHAPES

            indexArray.push(currentBase + k)
            indexArray.push(underBase + next)
            indexArray.push(currentBase + next)

            indexArray.push(currentBase + k)
            indexArray.push(underBase + k)
            indexArray.push(underBase + next)
          }
        }
      }

      let n = i * LENGTH
      indexArray.push(n, n + 2, n + 1, n, n + 3, n + 2)

      n = (i + 1) * LENGTH * SHAPES - 1
      indexArray.push(n, n - 2, n - 1, n, n - 3, n - 2)
    }

    let pos = new Float32Array(posArray)
    let uv = new Float32Array(uvArray)
    let indices = new Uint32Array(indexArray)

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2))
    geo.setIndex(new THREE.BufferAttribute(indices, 1))

    const standardFragment = THREE.ShaderLib.standard
    const customUni = {
      texturePosition: { value: null },
      textureVelocity: { value: null },
      uvDiff: { value: 1 / LENGTH },
      lineWidth: { value: LINE_WIDTH },
    }

    this.uni = THREE.UniformsUtils.merge([standardFragment.uniforms, customUni])
    this.uni.diffuse.value = new THREE.Vector3(1.0, 0.8, 0.0)
    this.uni.roughness.value = 1.0

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uni,
      vertexShader: vs,
      fragmentShader: standardFragment.fragmentShader,
      lights: true,
      // flatShading: true,
    })

    // mat.wireframe = true

    this.obj = new THREE.Mesh(geo, mat)
    // this.obj.matrixAutoUpdate = false
    // this.obj.updateMatrix()

    this.obj.castShadow = true

    this.obj.customDepthMaterial = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: fs,
      uniforms: mat.uniforms,
    })

    CommonWork.scene?.add(this.obj)
  }

  // createTrails() {
  //   let geo = new THREE.BufferGeometry()

  //   let posArray = []
  //   let indexArray = []
  //   let uvArray = []

  //   for (let i = 0; i < NUM; i++) {
  //     for (let j = 0; j < LENGTH; j++) {
  //       let cNum = i * LENGTH + j

  //       for (let k = 0; k < SHAPES; k++) {
  //         let rad = ((Math.PI * 2) / SHAPES) * k
  //         let x = Math.cos(rad) * R
  //         let y = Math.sin(rad) * R
  //         let z = 0

  //         posArray.push(x)
  //         posArray.push(y)
  //         posArray.push(z)

  //         uvArray.push(j / LENGTH)
  //         uvArray.push(i / NUM)

  //         if (j > 0) {
  //           let currentBase = cNum * SHAPES
  //           let underBase = (cNum - 1) * SHAPES
  //           let next = (k + 1) % SHAPES

  //           indexArray.push(currentBase + k)
  //           indexArray.push(underBase + next)
  //           indexArray.push(currentBase + next)

  //           indexArray.push(currentBase + k)
  //           indexArray.push(underBase + k)
  //           indexArray.push(underBase + next)
  //         }
  //       }
  //     }

  //     let n = i * LENGTH
  //     indexArray.push(n, n + 2, n + 1, n, n + 3, n + 2)

  //     n = (i + 1) * LENGTH * SHAPES - 1
  //     indexArray.push(n, n - 2, n - 1, n, n - 3, n - 2)
  //   }

  //   let pos = new Float32Array(posArray)
  //   let indices = new Uint32Array(indexArray)
  //   let uv = new Float32Array(uvArray)

  //   geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
  //   geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2))
  //   geo.setIndex(new THREE.BufferAttribute(indices, 1))

  //   let stFrag = THREE.ShaderLib.standard

  //   let customUni = {
  //     texturePosition: { value: null },
  //     textureVelocity: { value: null },
  //     uvDiff: { value: 1 / LENGTH },
  //     lineWidth: { value: LINE_WIDTH },
  //   }

  //   this.uni = THREE.UniformsUtils.merge([stFrag.uniforms, customUni])
  //   this.uni.diffuse.value = new THREE.Vector3(1.0, 0.8, 0.0)
  //   this.uni.roughness.value = 0.3

  //   let mat = new THREE.ShaderMaterial({
  //     vertexShader: vs,
  //     fragmentShader: stFrag.fragmentShader,
  //     uniforms: this.uni,
  //     lights: true,
  //     // flatShading: true,
  //   })

  //   this.obj = new THREE.Mesh(geo, mat)
  //   this.obj.castShadow = true

  //   this.obj.customDepthMaterial = new THREE.ShaderMaterial({
  //     vertexShader: vs,
  //     fragmentShader: fs,
  //     uniforms: mat.uniforms,
  //   })

  //   CommonWork.scene?.add(this.obj)
  // }

  onRender(): void {
    this.update()
    super.onRender()
  }
}
