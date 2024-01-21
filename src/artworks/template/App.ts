import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"

export default class App extends TemplateArtwork {
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
  }

  onRender(): void {
    super.onRender()
    CommonWork.scene?.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.rotation.x += 0.01
        child.rotation.y += 0.01
      }
    })
  }
}
