import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"
import vs from "./vertex.vert?raw"
import fs from "./fragment.frag?raw"
import { NURBSCurve } from "three/examples/jsm/curves/NURBSCurve.js"

const nurbsDegree = 100
const nurbsSize = 0.8

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
  nurbsCurve?: NURBSCurve
  constructor() {
    super()
    CommonWork.addAmbientLight()
    CommonWork.addOrbitControls()
    this.vector = new THREE.Vector4()
    this.instances = 30000
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
    // this.positions.push(0.025, -0.025, 0)
    // this.positions.push(-0.025, 0.025, 0)
    // this.positions.push(0, 0, 0.025)

    for (let i = 0; i < this.instances; i++) {
      // offsets

      this.offsets.push(
        Math.random() * nurbsSize - nurbsSize / 2,
        Math.random() * nurbsSize - nurbsSize / 2,
        Math.random() * nurbsSize - nurbsSize / 2
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

  calcNurbsPosition() {
    const nurbsControlPoints: THREE.Vector4[] = []
    const nurbsKnots: number[] = []

    for (let i = 0; i <= nurbsDegree; i++) {
      nurbsKnots.push(0)
    }
    for (let i = 0, j = nurbsDegree + 1; i < j; i++) {
      nurbsControlPoints.push(
        new THREE.Vector4(
          Math.random() * nurbsSize - nurbsSize / 2,
          Math.random() * nurbsSize,
          Math.random() * nurbsSize - nurbsSize / 2,
          1
        )
      )
      const knot = (i + 1) / (j - nurbsDegree)
      nurbsKnots.push(THREE.MathUtils.clamp(knot, 0, 1))
    }

    const nurbsCurve = new NURBSCurve(
      nurbsDegree,
      nurbsKnots,
      nurbsControlPoints
    )

    this.nurbsCurve = nurbsCurve
  }

  addInstanceMesh() {
    this.calcNurbsPosition()
    const geo = new THREE.InstancedBufferGeometry()
    if (this.nurbsCurve) geo.setFromPoints(this.nurbsCurve.getPoints(200))
    geo.instanceCount = this.instances
    console.log(this.nurbsCurve)
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
    mesh.position.set(0, -nurbsSize / 3, 0)
    CommonWork.scene?.add(mesh)

    this.mesh = mesh
  }

  updateNurbsControlPoints(targetPoints: THREE.Vector4[]) {
    targetPoints.shift()
    targetPoints.push(
      new THREE.Vector4(
        Math.random() * nurbsSize - nurbsSize / 2,
        Math.random() * nurbsSize,
        Math.random() * nurbsSize - nurbsSize / 2,
        1 // weight of control point: higher means stronger attraction
      )
    )
    return targetPoints
  }

  onRender(): void {
    console.log(Boolean(this.mesh), Boolean(this.nurbsCurve))
    if (this.mesh) {
      if (this.nurbsCurve) {
        this.nurbsCurve.controlPoints = this.updateNurbsControlPoints(
          this.nurbsCurve.controlPoints as any
        )
        this.mesh.geometry.setFromPoints(this.nurbsCurve.getPoints(nurbsDegree))
      }
      this.mesh.material.uniforms.time.value = CommonWork.time.total
      this.mesh.material.uniforms.sineTime.value = Math.sin(
        CommonWork.time.total
      )
    }

    // console.log(this.positions)
    super.onRender()
  }
}
