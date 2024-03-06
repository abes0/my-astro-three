import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"
import vs from "./vs.vert?raw"
import fs from "./fs.frag?raw"
import vsCover from "./vsCover.vert?raw"
import fsCover from "./fsCover.frag?raw"

import { Pane } from "tweakpane"

export default class App extends TemplateArtwork {
  uni?: { [key: string]: THREE.IUniform<any> }
  uni1?: { [key: string]: THREE.IUniform<any> }
  params: { [key: string]: any } = { progress: 0.0 }
  mesh?: THREE.Mesh<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    THREE.Material | THREE.Material[],
    THREE.Object3DEventMap
  >
  mesh1?: THREE.Mesh<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    THREE.Material | THREE.Material[],
    THREE.Object3DEventMap
  >

  constructor() {
    super()
    CommonWork.addAmbientLight()
    CommonWork.addSpotLight()
    CommonWork.addOrbitControls()
    CommonWork.addDrirectionalLight()
    // CommonWork.addExampleBox()
    // console.log(CommonWork.scene)
    this.onInit()
  }

  onInit(): void {
    this.addGUI()

    const { mesh: mesh, uni: uni } = this.addSphere(false)
    this.mesh = mesh
    this.uni = uni
    this.mesh.position.x = 0.0

    const { mesh: mesh1, uni: uni1 } = this.addSphere(true)
    this.mesh1 = mesh1
    this.uni1 = uni1
    this.mesh1.position.x = -0.0

    this.addInnerCoverSphere()
    this.addOuterCoverSphere()
    super.onInit()
  }

  addGUI() {
    const pane = new Pane()
    const onChange = () => {
      console.log("uni", this.uni?.uProgress.value)
      if (this.uni) this.uni.uProgress.value = this.params.progress
      if (this.uni1) this.uni1.uProgress.value = this.params.progress
    }
    pane
      .addBinding(this.params, "progress", { min: 0, max: 1 })
      .on("change", onChange)
  }

  addInnerCoverSphere() {
    const geo = new THREE.SphereGeometry(1.3, 256, 256).toNonIndexed()
    const mat = new THREE.MeshPhongMaterial({
      color: 0x0000ff,
      shininess: 100,
      transparent: true,
      opacity: 0.2,
    })
    // const mat = new THREE.ShaderMaterial({
    //   vertexShader: vsCover,
    //   fragmentShader: fsCover,
    //   transparent: true,
    //   uniforms: {
    //     uTime: { value: 0 },
    //   },
    // })
    const mesh = new THREE.Mesh(geo, mat)
    CommonWork.scene?.add(mesh)
  }

  addOuterCoverSphere() {
    const geo = new THREE.SphereGeometry(1.35, 256, 256).toNonIndexed()

    const mat = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      shininess: 99,
      transparent: true,
      opacity: 0.1,
    })
    // const mat = new THREE.ShaderMaterial({
    //   vertexShader: vsCover,
    //   fragmentShader: fsCover,
    //   transparent: true,
    //   uniforms: {
    //     uTime: { value: 0 },
    //   },
    // })

    const mesh = new THREE.Mesh(geo, mat)
    CommonWork.scene?.add(mesh)
  }

  addSphere(isAfter: boolean) {
    const geo = new THREE.SphereGeometry(1, 256, 256).toNonIndexed()

    const geoLength = geo.attributes.position.count
    const random = new Float32Array(geoLength)
    const centers = new Float32Array(geoLength * 3)
    const nextPos = new Float32Array(geoLength * 3)
    for (let i = 0; i < geoLength; i += 3) {
      const r = Math.random()
      random.set([r, r, r], i)

      const center = this.getCenter(geo.attributes.position.array, i)
      centers.set([center.x, center.y, center.z], i * 3)
      centers.set([center.x, center.y, center.z], (i + 1) * 3)
      centers.set([center.x, center.y, center.z], (i + 2) * 3)

      const distance = -1.5
      const _next = this.getNextPos(geo.attributes.position.array, i, distance)
      const _next1 = this.getNextPos(
        geo.attributes.position.array,
        i + 1,
        distance
      )
      const _next2 = this.getNextPos(
        geo.attributes.position.array,
        i + 2,
        distance
      )
      nextPos.set([_next.x, _next.y, _next.z], i * 3)
      nextPos.set([_next1.x, _next1.y, _next1.z], (i + 1) * 3)
      nextPos.set([_next2.x, _next2.y, _next2.z], (i + 2) * 3)
    }

    geo.setAttribute("aRandom", new THREE.BufferAttribute(random, 1))
    geo.setAttribute("aCenter", new THREE.BufferAttribute(centers, 3))
    geo.setAttribute("aNextPos", new THREE.BufferAttribute(nextPos, 3))

    const uni = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uIsAfter: { value: isAfter },
    }

    const mat = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: fs,
      uniforms: uni,
    })
    const mesh = new THREE.Mesh(geo, mat)
    CommonWork.scene?.add(mesh)
    return { mesh, uni }
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

  getNextPos(targetArray: any, index: number, distance: number) {
    let _index = index * 3
    let x = targetArray[_index]
    let y = targetArray[_index + 1]
    let z = targetArray[_index + 2]
    return new THREE.Vector3(x + distance, y, z)
  }

  onRender(): void {
    if (this.mesh && this.mesh.material instanceof THREE.ShaderMaterial) {
      this.mesh.material.uniforms.uTime.value = CommonWork.time.total
    }
    if (this.mesh1 && this.mesh1.material instanceof THREE.ShaderMaterial) {
      this.mesh1.material.uniforms.uTime.value = CommonWork.time.total
    }
    super.onRender()
  }
}
