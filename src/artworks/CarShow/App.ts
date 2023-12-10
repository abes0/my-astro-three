import CommonWork from "@three/CommonWork"
import * as THREE from "three"
import MeshReflectorMaterial from "@three/MeshReflecrMaterial"
// import { Reflector } from "three/examples/jsm/Addons.js"
// import { Reflector } from "@three/Reflector"

export default class App {
  common?: CommonWork
  groundMesh?: any

  constructor($canvas: HTMLCanvasElement) {
    this.init($canvas)
  }

  init($canvas: HTMLCanvasElement) {
    this.common = new CommonWork({ $canvas })
    this.common.addOrbitControls({ target: [0, 0.35, 0], maxPolarAngle: 1.45 })
    window.addEventListener("resize", this.resize.bind(this))
    this.setCamera()
    this.loop()
    // this.addBox()

    this.addSpotLight({
      helper: true,
      color: [1, 0.25, 0.7],
      intensity: 150,
      angle: 0.6,
      penumbra: 0.5,
      position: [5, 5, 0],
    })
    this.addSpotLight({
      helper: true,
      color: [0.14, 0.5, 1],
      intensity: 150,
      angle: 0.6,
      penumbra: 0.5,
      position: [-5, 5, 0],
    })
    this.addModel()
    this.addRings()
    this.addPlane()
    // console.log(this.common.scene)
  }

  setCamera() {
    this.common?.camera?.position.set(3, 2, 5)
    this.common?.camera?.lookAt(new THREE.Vector3(0, 0.35, 0))
    console.log("camera", this.common?.camera)
    // this.common?.camera?.fov = 50
  }

  addBox() {
    const geo = new THREE.BoxGeometry(1, 1, 1)
    const mat = new THREE.MeshLambertMaterial({ color: 0xff0000 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(0, 0.35, 0)
    mesh.castShadow = true
    mesh.receiveShadow = true
    // mesh.material.envMapIntensity = 20
    this.common?.scene?.add(mesh)
  }

  addPlane() {
    if (
      !this.common ||
      !this.common.renderer ||
      !this.common?.camera ||
      !this.common?.scene
    )
      return
    const geo = new THREE.PlaneGeometry(30, 30)
    const mat = new THREE.MeshStandardMaterial({ color: 0xeeeeee })
    const mesh = new THREE.Mesh(geo, mat)

    mesh.material = new MeshReflectorMaterial(
      this.common.renderer,
      this.common?.camera,
      this.common?.scene,
      mesh,
      {
        resolution: 1024,
        blur: [1000, 400],
        mixBlur: 30,
        mixContrast: 1,
        mirror: 0,
        mixStrength: 80,
        depthScale: 0.01,
        minDepthThreshold: 0.9,
        maxDepthThreshold: 1,
        depthToBlurRatioBias: 0.25,
        reflectorOffset: 0.3,
      }
    )

    const roughness = new THREE.TextureLoader().load(
      "/textures/ground-roughness.jpg"
    )
    const normal = new THREE.TextureLoader().load("/textures/ground-normal.jpg")

    ;[roughness, normal].forEach((texture) => {
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(5, 5)
    })

    mesh.material.setValues({
      envMapIntensity: 0,
      normalMap: normal,
      roughnessMap: roughness,
      dithering: true,
      color: new THREE.Color(0.015, 0.015, 0.015),
      roughness: 0.7,
    })

    // Reflector =======
    // const mesh = new Reflector(geo, {
    //   clipBias: 0.003,
    //   textureWidth: window.innerWidth * window.devicePixelRatio,
    //   textureHeight: window.innerHeight * window.devicePixelRatio,
    //   color: 0xb5b5b5,
    //   normalMap: normal,
    //   roughnessMap: roughness,
    // })
    // Reflector =======

    mesh.rotateX(-Math.PI / 2)

    this.common?.scene?.add(mesh)

    mesh.castShadow = true
    mesh.receiveShadow = true

    this.groundMesh = mesh
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
    this.common?.scene?.add(spotLight)
    if (helper) {
      const helper = new THREE.SpotLightHelper(spotLight)
      this.common?.scene?.add(helper)
    }
  }

  async addModel() {
    const gltf = (await this.common?.loadGLTF({
      modelData: "/models/car/scene.gltf",
    })) as { scene: THREE.Scene }
    if (gltf) {
      gltf.scene.scale.set(0.005, 0.005, 0.005)
      gltf.scene.position.set(0, -0.035, 0)
      gltf.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true
          object.receiveShadow = true
          object.material.envMapIntensity = 20
        }
      })
      this.common?.scene?.add(gltf.scene)
      console.log(gltf)
    }
  }

  addRings() {
    const amount = 14
    for (let i = 0; i < amount; i++) {
      const geo = new THREE.TorusGeometry(3.35, 0.05, 16, 100)
      const mat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: new THREE.Color(0.5, 0.5, 0.5),
      })
      const mesh = new THREE.Mesh(geo, mat)

      // pos
      const posZ = (i - 7) * 3.5
      mesh.position.set(0, 0.35, posZ)

      // scale
      const scale = 1 - Math.abs(posZ) * 0.04
      mesh.scale.set(scale, scale, scale)

      // color
      let colorScale = 1
      if (posZ < 20) {
        colorScale = 1 - (Math.min(posZ, 12) - 2) / 10
      }
      colorScale *= 0.5

      if (i % 2 === 1) {
        mesh.material.emissive = new THREE.Color(6, 0.15, 0.7).multiplyScalar(
          colorScale
        )
      } else {
        mesh.material.emissive = new THREE.Color(0.1, 0.7, 3).multiplyScalar(
          colorScale
        )
      }
      mesh.castShadow = true
      mesh.receiveShadow = true
      this.common?.scene?.add(mesh)
    }
  }

  resize() {
    this.common?.resize()
  }

  loop() {
    this.render()
    requestAnimationFrame(this.loop.bind(this))
  }

  render() {
    this.groundMesh?.material.update()
    this.common?.render()
  }
}
