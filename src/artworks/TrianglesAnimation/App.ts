import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"
import vs from "./vs.vert?raw"
import fs from "./fs.frag?raw"
import { Pane } from "tweakpane"

export default class App extends TemplateArtwork {
  uni?: { [key: string]: THREE.IUniform<any> }
  params: { [key: string]: any } = { progress: 0.0 }
  // uni?: {  }
  constructor() {
    super()
    CommonWork.addAmbientLight()
    CommonWork.addSpotLight()
    CommonWork.addOrbitControls()
    // CommonWork.addExampleBox()
    console.log(CommonWork.scene)
    this.onInit()
  }

  onInit(): void {
    this.addGUI()
    this.addSphere()
    super.onInit()
  }

  addGUI() {
    const pane = new Pane()
    const onChange = () => {
      if (this.uni) this.uni.uProgress.value = this.params.progress
    }
    pane
      .addBinding(this.params, "progress", { min: 0, max: 1 })
      .on("change", onChange)
  }

  addSphere(): void {
    // const geometry = new THREE.IcosahedronGeometry(1, 3)
    const geometry = new THREE.SphereGeometry(1, 256, 256).toNonIndexed()
    // const geometry = new THREE.CapsuleGeometry(1, 1, 4, 8)
    // const material = new THREE.MeshStandardMaterial({ color: 0xff0000 })
    const len = geometry.attributes.position.count
    const random = new Float32Array(len)
    const centers = new Float32Array(len * 3)
    for (let i = 0; i < len; i += 3) {
      const r = Math.random()
      random.set([r, r, r], i)
      let center = this.getCenter(geometry.attributes.position.array, i)
      centers.set([center.x, center.y, center.z], i * 3)
      // console.log(centers)
      centers.set([center.x, center.y, center.z], (i + 1) * 3)
      centers.set([center.x, center.y, center.z], (i + 2) * 3)
    }
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(random, 1))
    geometry.setAttribute("aCenter", new THREE.BufferAttribute(centers, 3))
    console.log(centers)
    this.uni = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
    }
    const mat = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: fs,
      // wireframe: true,
      uniforms: this.uni,
    })
    const sphere = new THREE.Mesh(geometry, mat)
    sphere.position.set(0, 0, 0)
    CommonWork.scene?.add(sphere)
  }

  getCenter(targetArray: any, index: number) {
    let _index = index * 3
    let x = targetArray[_index]
    let y = targetArray[_index + 1]
    let z = targetArray[_index + 2]

    let x1 = targetArray[_index + 3]
    let y1 = targetArray[_index + 4]
    let z1 = targetArray[_index + 5]

    let x2 = targetArray[_index + 6]
    let y2 = targetArray[_index + 7]
    let z2 = targetArray[_index + 8]

    let center = new THREE.Vector3(x, y, z)
      .add(new THREE.Vector3(x1, y1, z1))
      .add(new THREE.Vector3(x2, y2, z2))
      .divideScalar(3)
    return center
  }

  onRender(): void {
    // CommonWork.scene?.children.forEach((child) => {
    //   if (child instanceof THREE.Mesh) {
    //     child.rotation.x += 0.01
    //     child.rotation.y += 0.01
    //   }
    // })

    if (this.uni) this.uni.uTime.value = CommonWork.time.total
    // console.log("render")

    super.onRender()
  }
}
