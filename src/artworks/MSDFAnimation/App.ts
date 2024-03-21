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
import { M, _ } from "dist/_astro/CommonWork.13e29968"

// const pngPath8 = "/font/msdf/AbrilFatface-Regular.0.png"
// const fntPath8 = "/font/msdf/AbrilFatface-Regular.json"

const pngPath3 = "/font/msdf/AbrilFatface-Regular.0.png"
const fntPath3 = "/font/msdf/AbrilFatface-Regular.json"

const pngPath4 = "/font/msdf/Anta-Regular.png"
const fntPath4 = "/font/msdf/Anta-Regular.json"

const pngPath5 = "/font/msdf/Anton-Regular.png"
const fntPath5 = "/font/msdf/Anton-Regular.json"

const pngPath1 = "/font/msdf/BebasNeue-Regular.png"
const fntPath1 = "/font/msdf/BebasNeue-Regular.json"

// const pngPath7 = "/font/msdf/DMSerifDisplay-Regular.png"
// const fntPath7 = "/font/msdf/DMSerifDisplay-Regular.json"

// const pngPath = "/font/msdf/Gruppo-Regular.png"
// const fntPath = "/font/msdf/Gruppo-Regular.json"

const pngPath2 = "/font/msdf/MPLUSRounded1c-Regular.png"
const fntPath2 = "/font/msdf/MPLUSRounded1c-Regular.json"

const pngPath = "/font/NotoSerif_Condensed-Regular.png"
const fntPath = "/font/NotoSerif_Condensed-Regular.json"

const MESH_SCALE = 0.02
const DURATION = 3.5
const EASE = "power4.out"

export default class App extends TemplateArtwork {
  uni?: { [key: string]: THREE.IUniform<any> }
  params: { [key: string]: any } = {
    progress0: 0.0,
    progress1: 0.0,
    progress2: 0.0,
    progress3: 0.0,
    progress4: 0.0,
    progress5: 0.0,
    progress6: 0.0,
    // progress7: 0.0,
    // progress8: 0.0,
    progressA: 0.0,
    progressB: 0.0,
    progressC: 0.0,
    progressD: 0.0,
  }
  tl?: gsap.core.Timeline
  geo?: any
  mesh?: THREE.Mesh<any, THREE.ShaderMaterial, THREE.Object3DEventMap>
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
    // this.addGUI()

    this.uni = {
      uTime: { value: 0 },
      uProgress0: { value: 0 },
      uProgress1: { value: 0 },
      uProgress2: { value: 0 },
      uProgress3: { value: 0 },
      uProgress4: { value: 0 },
      uProgress5: { value: 0 },
      uProgress6: { value: 0 },
      // uProgress7: { value: 0 },
      // uProgress8: { value: 0 },
      uProgressA: { value: 0 },
      uProgressB: { value: 0 },
      uProgressC: { value: 0 },
      uProgressD: { value: 0 },
      // uProgressD: { value: 0 },
    }
    // CommonWork.addShaderPlane({
    //   uniform: this.uni,
    //   vertexShader: vs,
    //   fragmentShader: fs,
    //   isRawShader: false,
    // })
    this.addMSDFText()
    this.playAllRepeat()
    super.onInit()
  }

  addGUI() {
    const pane = new Pane()
    const onChange = (index: number | string) => {
      if (this.uni) {
        this.uni["uProgress" + index].value = this.params["progress" + index]
      }
      console.log(this.uni)
    }

    Array.from({ length: 6 }).forEach((_, i) => {
      pane
        .addBinding(this.params, "progress" + i, { min: 0, max: 1 })
        .on("change", () => onChange(i))
    })

    const progressArray = ["A", "B", "C", "D"]
    progressArray.forEach((key: string) => {
      pane
        .addBinding(this.params, "progress" + key, { min: 0, max: 1 })
        .on("change", () => onChange(key))
    })

    Array.from({ length: 6 }).forEach((_, i) => {
      pane
        .addButton({
          title: "Play " + i,
        })
        .on("click", () => {
          console.log("play")
          this.playAnimation(i)
        })
    })
  }

  playAllRepeat() {
    const tl = gsap.timeline({
      repeat: -1,
      // onUpdate: () => {
      //   console.log("update")
      //   // this.geo?.computeBoundingBox()
      //   // console.log(this.geo.layout.width)
      //   console.log({
      //     "1": this.uni?.uProgress1.value,
      //     "2": this.uni?.uProgress2.value,
      //     "3": this.uni?.uProgress3.value,
      //     "4": this.uni?.uProgress4.value,
      //     "5": this.uni?.uProgress5.value,
      //     "6": this.uni?.uProgress6.value,
      //     // "7": this.uni?.uProgress7.value,
      //     // "8": this.uni?.uProgress8.value,
      //     // A: this.uni?.uProgressA.value,
      //     // B: this.uni?.uProgressB.value,
      //     // C: this.uni?.uProgressC.value,
      //     // D: this.uni?.uProgressD.value,
      //   })
      // },
    })
    tl.add([this.playAnimation(1)!])
      .add([this.playAnimation(2)!])
      .add([this.playAnimation(3)!])
      .add([this.playAnimation(4)!])
      .add([this.playAnimation(5)!])
      .add([this.playAnimation(6)!])
    // .add([this.playAnimation(7)!])
    // .add([this.playAnimation(8)!])
  }

  playAnimation(index: number) {
    if (!this.uni) return
    // if (this.tl) this.tl.kill()
    const tl = gsap.timeline({
      repeat: 0,
      // onUpdate: () => {
      //   console.log("update")
      //   // this.geo?.computeBoundingBox()
      //   // console.log(this.geo.layout.width)
      //   console.log({
      //     "1": this.uni?.uProgress1.value,
      //     "2": this.uni?.uProgress2.value,
      //     "3": this.uni?.uProgress3.value,
      //     "4": this.uni?.uProgress4.value,
      //     "5": this.uni?.uProgress5.value,
      //     "6": this.uni?.uProgress6.value,
      //     // "7": this.uni?.uProgress7.value,
      //     // "8": this.uni?.uProgress8.value,
      //     // A: this.uni?.uProgressA.value,
      //     // B: this.uni?.uProgressB.value,
      //     // C: this.uni?.uProgressC.value,
      //     // D: this.uni?.uProgressD.value,
      //   })
      // },
    })
    // const duration = 3.5
    // const ease = "power4.out"
    let resetIndex = index - 1
    // if (index === 0) {
    //   resetIndex = 6
    // } else if (index === 6) {
    //   resetIndex = 0
    // } else {
    //   resetIndex = index - 1
    // }

    tl.add([gsap.set(this.uni["uProgress" + index], { value: 0 })])
      .add([
        this.playRGB()!,
        gsap.to(this.uni["uProgress" + index], {
          value: 1,
          duration: DURATION,
          delay: 0.0,
          ease: EASE,
        }),
      ])
      // .call(() => {
      //   gsap.set(this.uni["uProgress" + resetIndex], { value: 0 });
      // });

      .set(this.uni["uProgress" + resetIndex], { value: 0 })
      .add([
        gsap.set(this.uni.uProgressA, { value: 0 }),
        gsap.set(this.uni.uProgressB, { value: 0 }),
        gsap.set(this.uni.uProgressC, { value: 0 }),
        gsap.set(this.uni.uProgressD, { value: 0 }),
      ])

    // .add([
    //   gsap.set(this.uni["uProgress" + resetIndex], { value: 0 }),
    //   index === 6
    //     ? gsap.set(this.uni["uProgress" + index], { value: 0 })
    //     : null,
    // ])
    if (index === 6) {
      tl.set(this.uni["uProgress" + index], { value: 0 })
    }

    return tl
  }

  playRGB(): gsap.core.Timeline | undefined {
    if (!this.uni) return
    const tl = gsap.timeline()

    tl.add([
      gsap.set(this.uni.uProgressA, { value: 0 }),
      gsap.set(this.uni.uProgressB, { value: 0 }),
      gsap.set(this.uni.uProgressC, { value: 0 }),
      gsap.set(this.uni.uProgressD, { value: 0 }),
    ]).add([
      gsap.to(this.uni?.uProgressA, {
        value: 1,
        duration: DURATION,
        delay: 0,
        ease: EASE,
      }),
      gsap.to(this.uni?.uProgressB, {
        value: 1,
        duration: DURATION,
        delay: 0.05,
        ease: EASE,
      }),
      gsap.to(this.uni?.uProgressC, {
        value: 1,
        duration: DURATION,
        delay: 0.1,
        ease: EASE,
      }),
      gsap.to(this.uni?.uProgressD, {
        value: 1,
        duration: DURATION,
        delay: 0.15,
        ease: EASE,
      }),
    ])

    return tl
  }

  addMSDFText() {
    Promise.all([
      this.loadFontAtlas(pngPath),
      this.loadFont(fntPath),
      // 1
      this.loadFontAtlas(pngPath1),
      this.loadFont(fntPath1),
      // 2
      this.loadFontAtlas(pngPath2),
      this.loadFont(fntPath2),
      // 3
      this.loadFontAtlas(pngPath3),
      this.loadFont(fntPath3),
      // 4
      this.loadFontAtlas(pngPath4),
      this.loadFont(fntPath4),
      // 5
      this.loadFontAtlas(pngPath5),
      this.loadFont(fntPath5),
      // 6
      // this.loadFontAtlas(pngPath6),
      // this.loadFont(fntPath6),
      // 7
      // this.loadFontAtlas(pngPath7),
      // this.loadFont(fntPath7),
      // 8
      // this.loadFontAtlas(pngPath8),
      // this.loadFont(fntPath8),
    ]).then(
      ([
        atlas,
        font,
        atlas1,
        font1,
        atlas2,
        font2,
        atlas3,
        font3,
        atlas4,
        font4,
        atlas5,
        font5,
      ]: // atlas6,
      // font6,
      // atlas7,
      // font7,
      // atlas8,
      // font8,
      any[]) => {
        // console.log(font.data)
        const geo = (this.geo = new MSDFTextGeometry({
          text: "Hello",
          font: font.data,
          align: "center",
        }))
        geo.computeBoundingBox()

        const uni1 = this.setTransformFontGeometry({
          index: 1,
          atlas: atlas1,
          font: font1,
        })

        const uni2 = this.setTransformFontGeometry({
          index: 2,
          atlas: atlas2,
          font: font2,
        })

        const uni3 = this.setTransformFontGeometry({
          index: 3,
          atlas: atlas3,
          font: font3,
        })

        const uni4 = this.setTransformFontGeometry({
          index: 4,
          atlas: atlas4,
          font: font4,
        })

        const uni5 = this.setTransformFontGeometry({
          index: 5,
          atlas: atlas5,
          font: font5,
        })

        // const uni6 = this.setTransformFontGeometry({
        //   index: 6,
        //   atlas: atlas6,
        //   font: font6,
        // })

        // const uni7 = this.setTransformFontGeometry({
        //   index: 7,
        //   atlas: atlas7,
        //   font: font7,
        // })

        // const uni8 = this.setTransformFontGeometry({
        //   index: 8,
        //   atlas: atlas8,
        //   font: font8,
        // })

        console.log(geo)

        const mat = new THREE.ShaderMaterial({
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
              uAlphaTest: { value: 0.00001 },
              uWidth: { value: geo.layout.width },
              uHeight: { value: geo.layout.height },
            },
            ...uni1,
            ...uni2,
            ...uni3,
            ...uni4,
            ...uni5,
            // ...uni6,
            // ...uni7,
            // ...uni8,
          },
          vertexShader: vsText,
          fragmentShader: fsText,
        })
        mat.uniforms.uMap.value = atlas

        const mesh = (this.mesh = new THREE.Mesh(geo, mat))
        mesh.name = "MSDFText"
        this.setSize()
        // const scale = MESH_SCALE * CommonWork?.aspect
        // mesh.scale.set(scale, scale, scale)
        // mesh.rotation.x = Math.PI
        // mesh.position.x = (-geo.layout.width / 2) * scale
        // mesh.position.y = (-geo.layout.height / 2 + 15) * scale

        CommonWork.scene?.add(mesh)
      }
    )
  }

  setTransformFontGeometry({
    index,
    atlas,
    font,
  }: {
    index: number
    atlas: any
    font: any
  }) {
    const geo = new MSDFTextGeometry({
      text: "Hello",
      font: font.data,
      align: "center",
    })
    geo.computeBoundingBox()
    this.geo.attributes["position" + index] = geo.attributes.position
    this.geo.attributes["uv" + index + "_"] = geo.attributes.uv
    this.geo.attributes["layoutUv" + index] = geo.attributes.layoutUv

    const uni: Record<string, { value: any }> = {}
    uni["uWidth" + index] = { value: geo.layout.width }
    uni["uHeight" + index] = { value: geo.layout.height }
    uni["uMap" + index] = { value: atlas }
    return uni
  }

  loadFontAtlas(path: string) {
    const promise = new Promise((resolve, reject) => {
      // console.log("loadFontAtlas", path)
      const loader = new THREE.TextureLoader()
      loader.load(path, resolve)
    })

    return promise
  }

  loadFont(path: string) {
    const promise = new Promise((resolve, reject) => {
      // console.log("loadFont", path)
      const loader = new FontLoader()
      loader.load(path, resolve)
    })

    return promise
  }

  onResize(): void {
    this.setSize()
    super.onResize()
  }

  setSize(): void {
    if (!this.mesh) return
    // const _scale = MESH_SCALE * CommonWork.aspect
    // this.mesh?.scale.set(_scale, _scale, _scale)
    // const _geo: MSDFTextGeometry = this.mesh?.geometry
    // this.mesh!.position.x = (-_geo.layout.width / 2) * _scale
    // this.mesh!.position.y = (-_geo.layout.height / 2 + 15) * _scale

    const _scale = MESH_SCALE * Math.min(CommonWork.aspect, 1.0)
    const _geo: MSDFTextGeometry = this.mesh?.geometry
    this.mesh.scale.set(_scale, _scale, _scale)
    this.mesh.rotation.x = Math.PI
    this.mesh.position.x = (-_geo.layout.width / 2) * _scale
    this.mesh.position.y = (-_geo.layout.height / 2 + 15) * _scale
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
