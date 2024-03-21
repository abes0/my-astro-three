import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import {
  MSDFTextGeometry,
  MSDFTextMaterial,
  uniforms,
} from "three-msdf-text-utils"
import * as THREE from "three"
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
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
    progress0: 0.0,
    progress1: 0.0,
    progress2: 0.0,
    progress3: 0.0,
    progress4: 0.0,
  }
  tl?: gsap.core.Timeline
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
      uProgress0: { value: 0 },
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
      .addBinding(this.params, "progress0", { min: 0, max: 1 })
      .on("change", () => onChange(0))
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
    if (this.tl) this.tl.kill()
    this.tl = gsap.timeline()
    const duration = 2.5
    const ease = "power4.out"

    this.tl
      .add([
        gsap.to(this.uni?.uProgress1, {
          value: 1,
          duration,
          delay: 0,
          ease,
        }),
        gsap.to(this.uni?.uProgress2, {
          value: 1,
          duration,
          delay: 0.2,
          ease,
        }),
        gsap.to(this.uni?.uProgress3, {
          value: 1,
          duration,
          delay: 0.3,
          ease,
        }),
        gsap.to(this.uni?.uProgress4, {
          value: 1,
          duration,
          delay: 0.5,
          ease,
        }),
      ])
      .add([
        gsap.set(this.uni.uProgress1, { value: 0 }),
        gsap.set(this.uni.uProgress2, { value: 0 }),
        gsap.set(this.uni.uProgress3, { value: 0 }),
        gsap.set(this.uni.uProgress4, { value: 0 }),
      ])
  }

  addMSDFText() {
    Promise.all([this.loadFontAtlas(pngPath), this.loadFont(fntPath)]).then(
      ([atlas, font]: [any, any]) => {
        const text = "Hello, World!"
        console.log("addMSDFText", atlas, font)
        this.getJsonData(font, "H")
        const geo = new THREE.PlaneGeometry(1, 1, 1, 1)
        const mat = new THREE.ShaderMaterial({
          vertexShader: vs,
          fragmentShader: fs,
        })
        const mesh = new THREE.Mesh(geo, mat)
        CommonWork.scene?.add(mesh)
      }
    )
  }

  getJsonData(data: Font, text: string) {}

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
