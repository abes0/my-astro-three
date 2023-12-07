import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

export default class CommonWork {
  scene: THREE.Scene | null = null
  camera: THREE.PerspectiveCamera | null = null
  renderer: THREE.WebGLRenderer | null = null
  size: { sw: number; sh: number } = { sw: 0, sh: 0 }
  clock: THREE.Clock | null = null
  time: { total: number; delta: number } = {
    total: 0,
    delta: 0,
  }

  constructor({ $canvas }: { $canvas: HTMLCanvasElement }) {
    if ($canvas) {
      this.init($canvas)
    } else {
      throw new Error("canvas is null")
    }
  }

  init($canvas: HTMLCanvasElement) {
    this.setSize()

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.size.sw / this.size.sh,
      1,
      10000
    )
    // this.camera.position.set(0, 10, -10)
    // this.camera.lookAt(this.scene.position)

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: $canvas,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    this.renderer.setClearColor(0x000000, 1.0)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.clock = new THREE.Clock()
    this.clock.start()
  }

  setSize() {
    this.size = {
      sw: window.innerWidth,
      sh: window.innerHeight,
    }
  }

  resize() {
    this.setSize()
    if (!this.size.sw || !this.size.sh) return
    if (this.camera) {
      this.camera.aspect = this.size.sw / this.size.sh
      this.camera.updateProjectionMatrix()
    }
    if (this.renderer) this.renderer.setSize(this.size.sw, this.size.sh)
  }

  render() {
    if (!this.clock) return
    this.time.delta = this.clock.getDelta()
    this.time.total += this.time.delta

    if (this.renderer && this.scene && this.camera)
      this.renderer.render(this.scene, this.camera)
  }

  addOrbitControls({
    target = [0, 0, 0],
    maxPolarAngle,
  }: {
    target?: number[]
    maxPolarAngle?: number
  }) {
    if (!this.camera) return
    const controls = new OrbitControls(this.camera, this.renderer?.domElement)
    controls.target = new THREE.Vector3(...(target || [0, 0, 0]))
    controls.maxPolarAngle = maxPolarAngle || Math.PI
  }

  async loadGLTF({ modelData }: { modelData: string }) {
    return new Promise(
      (resolve) => {
        new GLTFLoader().load(modelData, (gltf) => {
          resolve(gltf)
        })
      },
      (progress) => {
        console.log(progress)
      },
      (error) => {
        console.log(error)
      }
    )
  }
}
