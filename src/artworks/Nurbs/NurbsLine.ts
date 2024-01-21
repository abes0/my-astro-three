import * as THREE from "three"
import { NURBSCurve } from "three/examples/jsm/curves/NURBSCurve.js"

const nurbsDegree = 300
const nurbsSize = 5

export default class NurbsLine {
  // color?: string
  group: THREE.Group<THREE.Object3DEventMap>
  nurbsCurve?: NURBSCurve
  nurbsLine?: THREE.Line<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    THREE.LineBasicMaterial
  >
  line?: THREE.Line<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    THREE.LineBasicMaterial
  >

  constructor({
    group = new THREE.Group(),
  }: {
    group?: THREE.Group<THREE.Object3DEventMap>
  }) {
    this.group = group

    this.setup()
  }

  setup() {
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

  addNurbsLine({
    color = "#000000",
    opacity = 1.0,
    transparent = false,
  }: {
    color?: string | number
    opacity?: number
    transparent?: boolean
  }) {
    const geo = new THREE.BufferGeometry()

    if (this.nurbsCurve) geo.setFromPoints(this.nurbsCurve.getPoints(200))

    const mat = new THREE.LineBasicMaterial({ color, opacity, transparent })
    const mesh = new THREE.Line(geo, mat)
    mesh.position.set(0, 0, 0)
    this.group.add(mesh)

    this.nurbsLine = mesh
  }

  addLine({
    color = "#000000",
    opacity = 1.0,
    transparent = false,
  }: {
    color?: string | number
    opacity?: number
    transparent?: boolean
  }) {
    const geo = new THREE.BufferGeometry()
    if (this.nurbsCurve) geo.setFromPoints(this.nurbsCurve.controlPoints as any)
    const mat = new THREE.LineBasicMaterial({
      color,
      opacity,
      transparent,
    })
    const mesh = new THREE.Line(geo, mat)
    if (this.nurbsLine) mesh.position.copy(this.nurbsLine.position)
    mesh.position.set(0, 0, 0)
    this.group.add(mesh)

    this.line = mesh
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

  update() {
    if (this.nurbsLine && this.nurbsCurve) {
      this.nurbsCurve.controlPoints = this.updateNurbsControlPoints(
        this.nurbsCurve.controlPoints as any
      )
      this.nurbsLine.geometry.setFromPoints(
        this.nurbsCurve.getPoints(nurbsDegree)
      )
      this.line?.geometry.setFromPoints(this.nurbsCurve.controlPoints as any)
    }
  }
}
