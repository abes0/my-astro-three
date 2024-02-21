import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"
import burash from "./burash.png"
import ocean from "./ocean.jpg"
import Interaction from "@common/Interaction"
import vs from "./vs.vert?raw"
import fs from "./fs.frag?raw"

// const burash = "/textures/ground-roughness.jpg"

console.log(burash)

export default class App extends TemplateArtwork {
  meshArray: THREE.Mesh[] = []
  mouse: Interaction
  max: number = 100
  currentWaveIndex: number = 0
  offscreenScene: THREE.Scene | undefined
  fbo: THREE.WebGLRenderTarget<THREE.Texture>
  uni?: {
    uTexture: { value: THREE.Texture }
    uDisplacement: { value: THREE.Texture }
  }
  constructor() {
    super()
    CommonWork.addAmbientLight()
    CommonWork.addSpotLight()
    // CommonWork.addOrbitControls()
    CommonWork.cameraSyncScreen()
    // CommonWork.addExampleBox()
    this.fbo = CommonWork.createFBO()
    this.offscreenScene = new THREE.Scene()
    console.log(CommonWork.scene)
    this.mouse = new Interaction()
    this.onInit()
  }

  onInit(): void {
    this.mouse.init()
    this.addPlane()
    this.addOutputPlane()
    super.onInit()
  }

  addPlane(): void {
    const geo = new THREE.PlaneGeometry(100, 100, 1, 1)
    // mat.opacity = 1.0
    for (let i = 0; i < this.max; i++) {
      const mat = new THREE.MeshBasicMaterial({
        // color: 0xff0000,
        side: THREE.DoubleSide,
        map: new THREE.TextureLoader().load(burash.src),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.visible = false
      mesh.rotation.z = 2 * Math.PI * Math.random()
      this.offscreenScene?.add(mesh)
      this.meshArray.push(mesh)
    }
  }

  addOutputPlane(): void {
    this.uni = {
      uTexture: { value: new THREE.TextureLoader().load(ocean.src) },
      uDisplacement: { value: this.fbo.texture },
    }
    CommonWork.addShaderPlane({
      uniform: this.uni,
      vertexShader: vs,
      fragmentShader: fs,
      isRawShader: false,
    })
  }

  setPosNewWave(_x: number, _y: number, index: number) {
    const targetMesh = this.meshArray[index]

    targetMesh.visible = true
    targetMesh.position.x = _x
    targetMesh.position.y = _y
    targetMesh.scale.x = 0.5
    targetMesh.scale.y = 0.5
    ;(targetMesh.material as THREE.MeshBasicMaterial).opacity = 0.5
  }

  trackMouse(): void {
    const threshold = 0.005
    if (
      Math.abs(this.mouse.vec.x) < threshold &&
      Math.abs(this.mouse.vec.y) < threshold
    ) {
      // nothing
    } else {
      this.setPosNewWave(
        this.mouse.pos.x,
        this.mouse.pos.y,
        this.currentWaveIndex
      )
      this.currentWaveIndex = (this.currentWaveIndex + 1) % this.max
      console.log(this.currentWaveIndex)
    }
  }

  onRender(): void {
    this.mouse.update()
    this.trackMouse()
    // console.log(this.mouse.vec)

    this.meshArray.forEach((mesh) => {
      if (mesh.visible) {
        mesh.rotation.z += 0.02
        const material = mesh.material as THREE.MeshBasicMaterial
        mesh.scale.x *= 1.02
        mesh.scale.y = mesh.scale.x
        material.opacity *= 0.96
        if (material.opacity < 0.01) {
          mesh.visible = false
        }
      }
    })

    CommonWork.renderer?.setRenderTarget(this.fbo)
    CommonWork.renderer?.render(this.offscreenScene!, CommonWork?.camera!)
    CommonWork.renderer?.setRenderTarget(null)
    super.onRender()
    if (this.uni) {
      this.uni.uDisplacement.value = this.fbo.texture
    }
  }
}
