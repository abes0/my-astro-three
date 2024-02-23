import CommonWork from "@three/CommonWork"
import TemplateArtwork from "@three/TemplateArtwork"
import type { IUniform } from "three"
import * as THREE from "three"
import vsParticle from "./vsParticle.vert?raw"
import fs from "./fs.frag?raw"
import vsFBO from "./vsFBO.vert?raw"
import fsFBO from "./fsFBO.frag?raw"
import Interaction from "@common/Interaction"

export default class App extends TemplateArtwork {
  fbo?: THREE.WebGLRenderTarget<THREE.Texture>
  fbo1?: THREE.WebGLRenderTarget<THREE.Texture>
  fboScene?: THREE.Scene
  fboCamera?: THREE.OrthographicCamera
  fboPlaneUni?: {
    [uniform: string]: IUniform<any>
  } = { uPositions: { value: null } }
  size?: number
  data?: Float32Array
  fboTexture?: THREE.DataTexture
  count?: number
  particlesUni: { [uniform: string]: IUniform<any> } = {}
  particles?: THREE.Points<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    THREE.ShaderMaterial
  >
  infoArray?: Float32Array
  info?: THREE.DataTexture
  mouse: Interaction
  ray: THREE.Raycaster
  dummy?: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshBasicMaterial,
    THREE.Object3DEventMap
  >

  constructor() {
    super()
    CommonWork.addAmbientLight()
    CommonWork.addSpotLight()
    CommonWork.addOrbitControls()
    // CommonWork.cameraSyncScreen()
    // CommonWork.addExampleBox()
    // CommonWork.addShaderPlane()
    // const cameraPos = CommonWork.camera?.position
    // CommonWork.setCamera({ position: [cameraPos?.x!, 0, cameraPos?.z!] })
    //  = 0
    this.mouse = new Interaction()
    this.ray = new THREE.Raycaster()
    console.log(CommonWork.scene)
    this.onInit()
  }

  onInit(): void {
    this.setupRaycaster()
    this.mouse.init(this.eMouseMove.bind(this))

    this.setupFBO()
    this.addParticles()
    super.onInit()
  }

  setupRaycaster() {
    this.dummy = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial()
    )
  }

  eMouseMove(e: MouseEvent) {
    this.ray.setFromCamera(this.mouse.coord, CommonWork.camera!)
    let intersects = this.ray.intersectObject(this.dummy!)
    if (intersects.length > 0) {
      console.log(intersects[0].point)
      const { x, y } = intersects[0].point
      if (this.fboPlaneUni)
        this.fboPlaneUni.uMouse.value = new THREE.Vector2(x, y)
    }
  }

  setupFBO(): void {
    this.size = 256
    this.fbo = this.getFBO()
    this.fbo1 = this.getFBO()

    this.fboScene = new THREE.Scene()
    this.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    this.fboCamera.position.z = 0.5
    this.fboCamera.lookAt(new THREE.Vector3(0, 0, 0))

    const geo = new THREE.PlaneGeometry(2, 2)

    this.data = new Float32Array(this.size * this.size * 4)

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        let index = (i * this.size + j) * 4
        let theta = Math.random() * Math.PI * 2
        let r = 0.5 + Math.random() * 0.5
        this.data[index + 0] = r * Math.cos(theta)
        this.data[index + 1] = r * Math.sin(theta)
        this.data[index + 2] = 1
        this.data[index + 3] = 1
      }
    }

    this.fboTexture = new THREE.DataTexture(
      this.data,
      this.size,
      this.size,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    this.fboTexture.magFilter = THREE.NearestFilter
    this.fboTexture.minFilter = THREE.NearestFilter
    this.fboTexture.needsUpdate = true

    this.infoArray = new Float32Array(this.size * this.size * 4)

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        let index = (i * this.size + j) * 4
        this.infoArray[index + 0] = 0.5 + Math.random()
        this.infoArray[index + 1] = 0.5 + Math.random()
        this.infoArray[index + 2] = 1
        this.infoArray[index + 3] = 1
      }
    }

    this.info = new THREE.DataTexture(
      this.infoArray,
      this.size,
      this.size,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    this.info.magFilter = THREE.NearestFilter
    this.info.minFilter = THREE.NearestFilter
    this.info.needsUpdate = true

    this.fboPlaneUni = {
      uPositions: { value: this.fboTexture },
      uInfo: { value: this.info },
      uTime: { value: CommonWork.time.total },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }
    const mat = new THREE.ShaderMaterial({
      uniforms: this.fboPlaneUni,
      vertexShader: vsFBO,
      fragmentShader: fsFBO,
    })

    console.log(this.fboTexture, this.fbo.texture)

    this.fboScene.add(new THREE.Mesh(geo, mat))

    CommonWork.renderer?.setRenderTarget(this.fbo!)
    CommonWork.renderer?.render(this.fboScene!, this.fboCamera!)
    CommonWork.renderer?.setRenderTarget(this.fbo1!)
    CommonWork.renderer?.render(this.fboScene!, this.fboCamera!)
  }

  getFBO(): THREE.WebGLRenderTarget<THREE.Texture> {
    return new THREE.WebGLRenderTarget(CommonWork.size.sw, CommonWork.size.sh, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    })
  }

  addParticles(): void {
    this.count = this.size! ** 2
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(this.count * 3)
    const uv = new Float32Array(this.count * 2)
    for (let i = 0; i < this.size!; i++) {
      for (let j = 0; j < this.size!; j++) {
        let index = i * this.size! + j
        pos[index * 3 + 0] = Math.random()
        pos[index * 3 + 1] = Math.random()
        pos[index * 3 + 2] = 0
        uv[index * 2 + 0] = i / this.size!
        uv[index * 2 + 1] = j / this.size!
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2))

    this.particlesUni = {
      uPositions: { value: this.fbo1?.texture },
      uTime: { value: CommonWork.time.total },
    }

    const mat = new THREE.ShaderMaterial({
      uniforms: this.particlesUni,
      vertexShader: vsParticle,
      fragmentShader: fs,
      // transparent: true,
      // depthTest: false,
      // blending: THREE.AdditiveBlending,
    })

    this.particles = new THREE.Points(geo, mat)
    CommonWork.scene?.add(this.particles)
  }

  onRender(): void {
    this.mouse.update()
    // console.log(this.mouse.coord)
    if (this.fboPlaneUni) {
      this.fboPlaneUni.uTime.value = CommonWork.time.total
      this.fboPlaneUni.uPositions.value = this.fbo1?.texture
      // this.fboPlaneUni.uMouse.value = this.mouse.coord
    }
    if (this.particlesUni) {
      this.particlesUni.uTime.value = CommonWork.time.total
      this.particlesUni.uPositions.value = this.fbo?.texture
    }

    CommonWork.renderer?.setRenderTarget(this.fbo!)
    CommonWork.renderer?.render(this.fboScene!, this.fboCamera!)
    super.onRender()

    let tmp = this.fbo
    this.fbo = this.fbo1
    this.fbo1 = tmp

    // console.log(this.particlesUni.uTime.value, )
  }
}
