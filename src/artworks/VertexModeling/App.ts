import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import CalcShape from "@three/calcShape"
import * as THREE from "three"

import fs from "./fragment.frag?raw"
import vs from "./vertex.vert?raw"

import { Pane } from "tweakpane"

const segments = 80

export default class App extends TemplateArtwork {
  uni?: Record<string, THREE.IUniform<any>>
  mesh?: THREE.Mesh<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    THREE.ShaderMaterial,
    THREE.Object3DEventMap
  >
  params: {
    [key in "shape1" | "shape2" | "shape3" | "shape4"]: number
  } = {
    shape1: 1,
    shape2: 0,
    shape3: 0,
    shape4: 0,
  }
  constructor() {
    super()
    CommonWork.addAmbientLight()
    CommonWork.addSpotLight()
    CommonWork.addOrbitControls()
    CommonWork.setCamera({ position: [0, 10, -10] })
    // CommonWork.addExampleBox()
    // console.log(CommonWork.scene)
    this.onInit()
    this.createMesh()
    this.addGUI()
  }

  onInit(): void {
    super.onInit()
  }

  addGUI() {
    const pane = new Pane()
    const range = { min: 0, max: 1 }
    const onChange = () => {
      const data: any[] = pane.exportState().children as any[]
      if (data.length === 0) return
      const b: number[] = data.map((i) => i.binding.value)
      if (this.uni)
        this.uni.uProgress.value = new THREE.Vector4(b[0], b[1], b[2], b[3])
    }
    const bind1 = pane
      .addBinding(this.params, "shape1", range)
      .on("change", onChange)
    const bind2 = pane
      .addBinding(this.params, "shape2", range)
      .on("change", onChange)
    const bind3 = pane
      .addBinding(this.params, "shape3", range)
      .on("change", onChange)
    const bind4 = pane
      .addBinding(this.params, "shape4", range)
      .on("change", onChange)
  }

  createMesh(): void {
    const pos = []
    const vert1 = []
    const vert2 = []
    const vert3 = []
    const vert4 = []

    for (let i = 0; i <= segments; i++) {
      const v = i / segments // 縦方向の割合
      for (let j = 0; j <= segments; j++) {
        const u = j / segments // 横方向の割合
        const shape1 = CalcShape.cushion(u, v)
        const shape2 = CalcShape.twistTorus(u, v)
        const shape3 = CalcShape.torus(u, v)
        const shape4 = CalcShape.ribbon(u, v)

        vert1.push(shape1.x, shape1.y, shape1.z)
        vert2.push(shape2.x, shape2.y, shape2.z)
        vert3.push(shape3.x, shape3.y, shape3.z)
        vert4.push(shape4.x, shape4.y, shape4.z)

        pos.push(0, 0, 0) // これはなんだろう
      }
    }

    const indices = []
    const sliceCount = segments + 1

    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i + sliceCount * j
        const b = i + sliceCount * (j + 1)
        const c = i + 1 + sliceCount * (j + 1)
        const d = i + 1 + sliceCount * j

        indices.push(a, b, d)
        indices.push(b, c, d)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
    geo.setAttribute("aShape1", new THREE.Float32BufferAttribute(vert1, 3))
    geo.setAttribute("aShape2", new THREE.Float32BufferAttribute(vert2, 3))
    geo.setAttribute("aShape3", new THREE.Float32BufferAttribute(vert3, 3))
    geo.setAttribute("aShape4", new THREE.Float32BufferAttribute(vert4, 3))
    geo.setIndex(indices)

    this.uni = {
      uProgress: { value: new THREE.Vector4(1.0, 0.0, 0.0, 0.0) },
    }

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uni,
      vertexShader: vs,
      fragmentShader: fs,
      // flatShading: true,
      side: THREE.DoubleSide,
    })

    this.mesh = new THREE.Mesh(geo, mat)
    this.mesh.rotation.x = Math.PI * 0.25

    CommonWork.scene?.add(this.mesh)
  }

  onRender(): void {
    super.onRender()
    if (this.mesh) this.mesh.rotation.y += 0.01
    if (this.mesh) this.mesh.rotation.x += 0.01
    // console.log(CommonWork.scene?.children)
    // CommonWork.scene?.children.forEach((child) => {
    //   if (child instanceof THREE.Mesh) {
    //     child.rotation.x += 0.01
    //     child.rotation.y += 0.01
    //   }
    // })
  }
}
