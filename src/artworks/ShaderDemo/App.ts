import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"
import vs from "./vertex.vert?raw"
import fs from "./fragment.frag?raw"

export default class App extends TemplateArtwork {
  uniforms?: { time: { value: number } }
  constructor() {
    super()
    CommonWork.addAmbientLight()
    CommonWork.addSpotLight()
    CommonWork.addOrbitControls()
    CommonWork.addBox()

    console.log(CommonWork.scene)
    this.onInit()
  }

  onInit(): void {
    super.onInit()
    // CommonWork.CameraSyncScreen({ fovy: 15 })

    this.uniforms = {
      time: { value: 1.0 },
    }

    CommonWork.addShaderPlane({
      vertexShader: vs,
      fragmentShader: fs,
      uniform: this.uniforms,
    })
  }

  onRender(): void {
    super.onRender()
    if (this.uniforms) this.uniforms.time.value = performance.now() / 1000
    CommonWork.scene?.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.rotation.x += 0.01
        child.rotation.y += 0.01
      }
    })
  }
}
