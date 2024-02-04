import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import * as THREE from "three"
import { NURBSCurve } from "three/examples/jsm/curves/NURBSCurve.js"
import NurbsLine from "./NurbsLine"

// import {}

// const nurbsControlPoints: THREE.Vector4[] = []
// const nurbsKnots: number[] = []
// const nurbsDegree = 300
const nurbsSize = 5
const LINE_COUNT = 1

export default class App extends TemplateArtwork {
  nurbsControlPoints: THREE.Vector4[] = []
  nurbsKnots: number[] = []
  group?: THREE.Group
  nurbsLine?: THREE.Line
  nurbsCurve?: NURBSCurve
  line?: THREE.Line<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    THREE.LineBasicMaterial
  >
  example?: NurbsLine
  nurbsContainer: NurbsLine[]

  constructor() {
    super()
    CommonWork.addAmbientLight()
    CommonWork.addSpotLight()
    CommonWork.addOrbitControls()
    this.nurbsContainer = []
    console.log(CommonWork.scene)
    this.onInit()
  }

  onInit() {
    super.onInit()
    this.group = new THREE.Group()
    this.group.position.y = -nurbsSize / 2
    CommonWork.scene?.add(this.group)
    for (let i = 0; i < LINE_COUNT; i++) {
      const nurbsLine = new NurbsLine({ group: this.group })
      nurbsLine.addNurbsLine({
        color: 0xffffff * Math.random(),
      })
      this.nurbsContainer.push(nurbsLine)
    }
    // this.example = new NurbsLine({ group: this.group })
    // this.example?.addNurbsLine({
    //   color: 0xffffff * Math.random(),
    // })
    // this.example?.addLine({
    //   color: 0xffffff * Math.random(),
    //   opacity: 0.5,
    //   transparent: true,
    // })
  }

  onRender(): void {
    super.onRender()
    this.nurbsContainer.forEach((nurbsLine) => nurbsLine.update())
  }
}
