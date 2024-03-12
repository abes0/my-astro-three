import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import {
  MSDFTextGeometry,
  MSDFTextMaterial,
  uniforms,
} from "three-msdf-text-utils"
import * as THREE from "three"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
import vs from "./vs.vert?raw"
import fs from "./fs.frag?raw"
import vsText from "./vsText.vert?raw"
import fsText from "./fsText.frag?raw"
// import fnt from "./Truculenta_18pt_Condensed-Regular-msdf.fnt"
// import png from "./Truculenta18ptCondensed-Regular.png"
import { gsap } from "gsap"

import { Pane } from "tweakpane"

const pngPath = "/font/roboto-regular2.png"
const fntPath = "/font/roboto-regular2.fnt"

export default class App extends TemplateArtwork {
  uni?: { [key: string]: THREE.IUniform<any> }
  params: { [key: string]: any } = {
    progress1: 0.0,
    progress2: 0.0,
    progress3: 0.0,
    progress4: 0.0,
  }
  constructor() {
    super()
    CommonWork.addAmbientLight()
    CommonWork.addSpotLight()
    CommonWork.addOrbitControls()
    // CommonWork.addExampleBox()

    // console.log(CommonWork.scene)
    this.onInit()
  }

  onInit(): void {
    this.addGUI()

    this.uni = {
      uTime: { value: 0 },
      uProgress1: { value: 0 },
      uProgress2: { value: 0 },
      uProgress3: { value: 0 },
      uProgress4: { value: 0 },
    }
    // CommonWork.addShaderPlane({
    //   uniform: this.uni,
    //   vertexShader: vs,
    //   fragmentShader: fs,
    //   isRawShader: false,
    // })
    this.addMSDFText()
    super.onInit()
  }

  addGUI() {
    const pane = new Pane()
    const onChange = (number: number) => {
      if (this.uni) {
        this.uni["uProgress" + number].value = this.params["progress" + number]
      }
      console.log(this.uni)
    }
    pane
      .addBinding(this.params, "progress1", { min: 0, max: 1 })
      .on("change", () => onChange(1))
    pane
      .addBinding(this.params, "progress2", { min: 0, max: 1 })
      .on("change", () => onChange(2))
    pane
      .addBinding(this.params, "progress3", { min: 0, max: 1 })
      .on("change", () => onChange(3))
    pane
      .addBinding(this.params, "progress4", { min: 0, max: 1 })
      .on("change", () => onChange(4))

    pane
      .addButton({
        title: "Play",
      })
      .on("click", () => {
        console.log("play")
        this.playAnimation()
      })
  }

  playAnimation() {
    if (!this.uni) return
    const tl = gsap.timeline()
    const duration = 1.5
    const delay = 0.1
    const ease = "power1.out"

    tl.add([
      gsap.set(this.uni.uProgress1, { value: 0 }),
      gsap.set(this.uni.uProgress2, { value: 0 }),
      gsap.set(this.uni.uProgress3, { value: 0 }),
      gsap.set(this.uni.uProgress4, { value: 0 }),
    ]).add([
      gsap.to(this.uni?.uProgress1, {
        value: 1,
        duration,
        delay,
        ease,
      }),
      gsap.to(this.uni?.uProgress2, {
        value: 1,
        duration,
        delay: delay * 2,
        ease,
      }),
      gsap.to(this.uni?.uProgress3, {
        value: 1,
        duration,
        delay: delay * 3,
        ease,
      }),
      gsap.to(this.uni?.uProgress4, {
        value: 1,
        duration,
        delay: delay * 4,
        ease,
      }),
    ])
  }

  addMSDFText() {
    Promise.all([this.loadFontAtlas(pngPath), this.loadFont(fntPath)]).then(
      ([atlas, font]: [any, any]) => {
        const geometry = new MSDFTextGeometry({
          text: "STUNNING", // "Hello",
          font: font.data,

          // flipY: false,
          // width: 10000,
          // align: "center",
        })
        geometry.computeBoundingBox()
        // const _x =
        //   -(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2
        // const _y =
        //   -(geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2

        // const material = new MSDFTextMaterial({
        //   side: THREE.DoubleSide,
        // })

        const material = new THREE.ShaderMaterial({
          side: THREE.DoubleSide,
          transparent: true,
          defines: {
            IS_SMALL: false,
          },
          extensions: {
            derivatives: true,
          },
          uniforms: {
            // Common
            ...uniforms.common,

            // Rendering
            ...uniforms.rendering,

            // Strokes
            ...uniforms.strokes,

            // Custom
            ...this.uni,
            ...{
              uStrokeColor: { value: new THREE.Color(0xffffff) },
              uAlphaTest: { value: 0.0000001 },
            },
          },
          vertexShader: vsText,
          fragmentShader: fsText,
        })
        material.uniforms.uMap.value = atlas

        const mesh = new THREE.Mesh(geometry, material)
        mesh.name = "MSDFText"
        const scale = 0.01
        mesh.scale.set(scale, scale, scale)
        mesh.rotation.x = Math.PI
        mesh.position.x = (-geometry.layout.width / 2) * scale
        mesh.position.y = (-geometry.layout.height / 2) * scale

        CommonWork.scene?.add(mesh)
        console.log(geometry)
      }
    )
  }

  loadFontAtlas(path: string) {
    const promise = new Promise((resolve, reject) => {
      console.log("loadFontAtlas", path)
      const loader = new THREE.TextureLoader()
      loader.load(path, resolve)
    })

    return promise
  }

  loadFont(path: string) {
    const promise = new Promise((resolve, reject) => {
      console.log("loadFont", path)
      const loader = new FontLoader()
      loader.load(path, resolve)
    })

    return promise
  }

  onRender(): void {
    super.onRender()
    // CommonWork.scene?.children.forEach((child) => {
    //   if (child instanceof THREE.Mesh) {
    //     child.rotation.x += 0.01
    //     child.rotation.y += 0.01
    //   }
    // })
  }
}
