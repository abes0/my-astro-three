import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"
import vs from "./vertex.vert?raw"
import fs from "./fragment.frag?raw"

export default class App extends TemplateArtwork {
  vector: THREE.Vector4
  instances: number
  positions: number[]
  offsets: number[]
  colors: number[]
  mesh?:
    | THREE.Mesh<
        THREE.InstancedBufferGeometry,
        THREE.RawShaderMaterial,
        THREE.Object3DEventMap
      >
    | any
  orientationsStart: number[]
  orientationsEnd: number[]
  constructor() {
    super()
    CommonWork.addAmbientLight()
    CommonWork.addOrbitControls()
    this.vector = new THREE.Vector4()
    this.instances = 50
    this.positions = []
    this.offsets = []
    this.colors = []
    this.orientationsStart = []
    this.orientationsEnd = []

    this.onInit()
    this.addInstanceMesh()
  }

  onInit(): void {
    super.onInit()
    this.positions.push(0.025, -0.025, 0)
    this.positions.push(-0.025, 0.025, 0)
    this.positions.push(0, 0, 0.025)

    for (let i = 0; i < this.instances; i++) {
      // offsets

      this.offsets.push(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      )

      // colors

      this.colors.push(
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random()
      )

      // orientation start

      this.vector.set(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      )
      this.vector.normalize()

      this.orientationsStart.push(
        this.vector.x,
        this.vector.y,
        this.vector.z,
        this.vector.w
      )

      // orientation end

      this.vector.set(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      )
      this.vector.normalize()

      this.orientationsEnd.push(
        this.vector.x,
        this.vector.y,
        this.vector.z,
        this.vector.w
      )
    }
  }

  addInstanceMesh() {
    const circleGeometry = new THREE.SphereGeometry(0.1, 3, 3)
    const geo = new THREE.InstancedBufferGeometry()
    geo.index = circleGeometry.index
    geo.attributes = circleGeometry.attributes
    geo.instanceCount = this.instances
    // geo.setAttribute(
    //   "position",
    //   new THREE.Float32BufferAttribute(this.positions, 3)
    // )
    geo.setAttribute(
      "offset",
      new THREE.InstancedBufferAttribute(new Float32Array(this.offsets), 3)
    )
    geo.setAttribute(
      "color",
      new THREE.InstancedBufferAttribute(new Float32Array(this.colors), 4)
    )
    geo.setAttribute(
      "orientationStart",
      new THREE.InstancedBufferAttribute(
        new Float32Array(this.orientationsStart),
        4
      )
    )
    geo.setAttribute(
      "orientationEnd",
      new THREE.InstancedBufferAttribute(
        new Float32Array(this.orientationsEnd),
        4
      )
    )

    const mat = new THREE.RawShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        sineTime: { value: 1.0 },
      },
      vertexShader: vs,
      fragmentShader: fs,
      side: THREE.DoubleSide,
      forceSinglePass: true,
      transparent: true,
    })

    const mesh = new THREE.Line(geo, mat)
    CommonWork.scene?.add(mesh)

    this.mesh = mesh
  }

  onRender(): void {
    if (this.mesh) {
      this.mesh.material.uniforms.time.value = CommonWork.time.total
      this.mesh.material.uniforms.sineTime.value = Math.sin(
        CommonWork.time.total
      )
    }

    // console.log(this.positions)
    super.onRender()
  }
}
