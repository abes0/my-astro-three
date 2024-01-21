import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

const vertexExample = `
  varying vec2 vUv;
  void main()	{
    vUv = uv;
    gl_Position = vec4( position, 1.0 );
  }
`

const fragmentExample = `
  varying vec2 vUv;
  void main()	{
    gl_FragColor = vec4( vUv, 0.0, 1.0 );
  }
`

class CommonWork {
  scene: THREE.Scene | null = null
  camera: THREE.PerspectiveCamera | null = null
  renderer: THREE.WebGLRenderer | null = null
  size: { sw: number; sh: number } = { sw: 0, sh: 0 }
  clock: THREE.Clock | null = null
  time: { total: number; delta: number } = {
    total: 0,
    delta: 0,
  }
  cubeCamera: THREE.CubeCamera[] = []
  cubeCameraTarget: THREE.WebGLCubeRenderTarget[] = []
  isCameraSyncScreen: boolean = false
  fovy?: number

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
      0.1,
      10000
    )
    this.camera.position.set(0, 3, -3)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: $canvas,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    this.renderer.setClearColor(0x000000)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setSize(this.size.sw, this.size.sh)
    // this.renderer.physicallyCorrectLights = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1

    this.clock = new THREE.Clock()
    this.clock.start()
  }

  setCamera({
    position,
    lookAt,
    fov,
    near,
    far,
  }: {
    position?: number[]
    lookAt?: number[]
    fov?: number
    near?: number
    far?: number
  }) {
    if (!this.camera) return
    if (position)
      this.camera?.position.set(position[0], position[1], position[2])
    if (lookAt) this.camera?.lookAt(lookAt[0], lookAt[1], lookAt[2])
    if (fov) this.camera.fov = fov
    if (near) this.camera.near = near
    if (far) this.camera.far = far
  }

  cameraSyncScreen({ fovy = 15 }: { fovy?: number } = {}) {
    if (!this.camera) return
    this.isCameraSyncScreen = true
    this.fovy = fovy
    this.updateCameraSyncScreen()
  }

  updateCameraSyncScreen() {
    if (!this.camera) return
    if (!this.isCameraSyncScreen) return
    if (!this.fovy) return
    const aspect = this.size.sw / this.size.sh
    const near = 0.1
    const fovyRad = (this.fovy / 2) * (Math.PI / 180)
    const dist = this.size.sh / 2 / Math.tan(fovyRad)
    const far = dist * 10
    this.camera.aspect = aspect
    this.camera.fov = this.fovy
    this.camera.near = near
    this.camera.far = far
    this.camera.position.z = dist
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
    console.log("z:", this.camera.position.z)
    const exampleBox = this.scene?.children.find(
      (item) => item.name === "exampleBox"
    )
    if (exampleBox) {
      exampleBox.position.set(0, 0, 100)
      // console.log("yes")
    }
    this.camera.updateProjectionMatrix()
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
      if (this.isCameraSyncScreen) {
        this.updateCameraSyncScreen()
      }
    }
    if (this.renderer) this.renderer.setSize(this.size.sw, this.size.sh)
  }

  render() {
    if (!this.clock) return
    this.time.delta = this.clock.getDelta()
    this.time.total += this.time.delta

    if (this.cubeCamera.length > 0) {
      this.cubeCamera.forEach((cubeCamera, i) => {
        cubeCamera.update(this.renderer!, this.scene!)
      })
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)
      // console.log(this.camera)
    }
  }

  addOrbitControls({
    target = [0, 0, 0],
    maxPolarAngle = Math.PI,
  }: {
    target?: number[]
    maxPolarAngle?: number
  } = {}) {
    if (!this.camera) return
    const controls = new OrbitControls(this.camera, this.renderer?.domElement)
    controls.target = new THREE.Vector3(...target)
    controls.maxPolarAngle = maxPolarAngle || Math.PI
  }

  async loadGLTF({ modelData }: { modelData: string }) {
    return new Promise((resolve) => {
      new GLTFLoader().load(
        modelData,
        (gltf) => {
          resolve(gltf)
        },
        (progress) => {
          console.log(progress)
        },
        (error) => {
          console.log(error)
        }
      )
    })
  }

  addAmbientLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    this.scene?.add(ambientLight)
  }

  addDrirectionalLight({}) {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.castShadow = true
    directionalLight.position.set(1, 1, 1)
    this.scene?.add(directionalLight)
  }

  addSpotLight({
    helper = false,
    color = [1, 0, 0],
    intensity = 1,
    distance = 0,
    angle = Math.PI / 2,
    penumbra = 0,
    position = [0, 1, 0],
  }: {
    helper?: boolean
    color?: number[]
    intensity?: number
    distance?: number
    angle?: number
    penumbra?: number
    position?: number[]
  } = {}) {
    const spotLight = new THREE.SpotLight(
      new THREE.Color(...color),
      intensity,
      distance,
      angle,
      penumbra
    )
    spotLight.castShadow = true
    spotLight.position.set(position[0], position[1], position[2])
    this.scene?.add(spotLight)
    if (helper) {
      const helper = new THREE.SpotLightHelper(spotLight)
      this.scene?.add(helper)
    }
  }

  addCubeCamera() {
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      colorSpace: THREE.SRGBColorSpace,
    })
    const cubeCamera = new THREE.CubeCamera(1, 10000, cubeRenderTarget)
    cubeRenderTarget.texture.type = THREE.HalfFloatType

    this.scene?.add(cubeCamera)

    this.cubeCamera.push(cubeCamera)
    this.cubeCameraTarget.push(cubeRenderTarget)
  }

  addExampleBox({
    width = 1,
    height = 1,
    depth = 1,
  }: { width?: number; height?: number; depth?: number } = {}) {
    if (this.isCameraSyncScreen) {
      width = 100
      height = 100
      depth = 100
    }
    const geo = new THREE.BoxGeometry(width, height, depth)
    const mat = new THREE.MeshLambertMaterial({ color: 0xff0000 })
    const mesh = new THREE.Mesh(geo, mat)

    mesh.name = "exampleBox"

    mesh.position.set(0, 0, 0)
    this.scene?.add(mesh)
    console.log(this.scene)
  }

  addPlane() {
    const geo = new THREE.PlaneGeometry(1, 1)
    const mat = new THREE.MeshLambertMaterial({ color: 0xff0000 })
    const mesh = new THREE.Mesh(geo, mat)

    mesh.position.set(0, 0, 0)
    this.scene?.add(mesh)
  }

  addShaderPlane({
    uniform = {},
    vertexShader = vertexExample,
    fragmentShader = fragmentExample,
  }: {
    uniform?: Record<string, { value: any }>
    vertexShader?: string
    fragmentShader?: string
  }) {
    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new THREE.ShaderMaterial({
      uniforms: uniform,
      vertexShader,
      fragmentShader,
    })

    const mesh = new THREE.Mesh(geo, mat)
    this.scene?.add(mesh)
  }
}

export default new CommonWork({ $canvas: document.querySelector("canvas")! })
