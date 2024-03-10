import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import { MSDFTextGeometry, MSDFTextMaterial } from "three-msdf-text-utils"
import * as THREE from "three"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
// import fnt from "./Truculenta_18pt_Condensed-Regular-msdf.fnt"
// import png from "./Truculenta18ptCondensed-Regular.png"

const pngPath = "/font/Truculenta18ptCondensed-Regular.png"
const fntPath = "/font/Truculenta_18pt_Condensed-Regular-msdf.fnt"

export default class App extends TemplateArtwork {
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
    this.addMSDFText()
    super.onInit()
  }

  addMSDFText() {
    Promise.all([this.loadFontAtlas(pngPath), this.loadFont(fntPath)]).then(
      ([atlas, font]: [any, any]) => {
        const geometry = new MSDFTextGeometry({
          text: "Hello",
          font: font.data,
          // flipY: false,
          // width: 10,
          // align: "center",
        })
        geometry.computeBoundingBox()
        // const _x =
        //   -(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2
        // const _y =
        //   -(geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2

        const material = new MSDFTextMaterial({
          side: THREE.DoubleSide,
        })
        material.uniforms.uMap.value = atlas

        const mesh = new THREE.Mesh(geometry, material)
        mesh.name = "MSDFText"
        mesh.scale.set(0.07, 0.07, 0.07)
        mesh.scale.y *= -1
        mesh.position.set(-1.9, -0.8, 0)

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
