// original implementation is from https://github.com/pmndrs/drei

import {
  DepthFormat,
  DepthTexture,
  LinearFilter,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Plane,
  Scene,
  UnsignedShortType,
  Vector3,
  Vector4,
  WebGLRenderTarget,
  WebGLRenderer,
  type Shader,
} from "three"
import * as POSTPROCESSING from "postprocessing"

export default class MeshReflectorMaterial extends MeshStandardMaterial {
  gl?: WebGLRenderer
  camera?: PerspectiveCamera
  scene?: Scene
  parent?: Mesh
  hasBlur?: boolean
  reflectorPlane?: Plane
  normal?: Vector3
  reflectorWorldPosition?: Vector3
  cameraWorldPosition?: Vector3
  rotationMatrix?: Matrix4
  lookAtPosition?: Vector3
  clipPlane?: Vector4
  view?: Vector3
  target?: Vector3
  q?: Vector4
  textureMatrix?: Matrix4
  virtualCamera?: PerspectiveCamera
  reflectorOffset?: number
  planeNormal?: Vector3

  fbo1?: WebGLRenderTarget
  fbo2?: WebGLRenderTarget

  reflectorProps?: any

  kawaseBlurPass?: POSTPROCESSING.KawaseBlurPass

  constructor(
    renderer: WebGLRenderer,
    camera: PerspectiveCamera,
    scene: Scene,
    object: Mesh,
    {
      mixBlur = 0,
      mixStrength = 1,
      resolution = 256,
      blur = [0, 0],
      minDepthThreshold = 0.9,
      maxDepthThreshold = 1,
      depthScale = 0,
      depthToBlurRatioBias = 0.25,
      mirror = 0,
      distortion = 1,
      mixContrast = 1,
      distortionMap = null,
      reflectorOffset = 0,
      bufferSamples = 8,
      planeNormal = new Vector3(0, 0, 1),
    } = {}
  ) {
    super()

    this.gl = renderer
    this.camera = camera
    this.scene = scene
    this.parent = object

    this.hasBlur = blur[0] + blur[1] > 0
    this.reflectorPlane = new Plane()
    this.normal = new Vector3()
    this.reflectorWorldPosition = new Vector3()
    this.cameraWorldPosition = new Vector3()
    this.rotationMatrix = new Matrix4()
    this.lookAtPosition = new Vector3(0, -1, 0)
    this.clipPlane = new Vector4()
    this.view = new Vector3()
    this.target = new Vector3()
    this.q = new Vector4()
    this.textureMatrix = new Matrix4()
    this.virtualCamera = new PerspectiveCamera()
    this.reflectorOffset = reflectorOffset
    this.planeNormal = planeNormal

    this.setupBuffers(resolution, blur, bufferSamples)

    this.reflectorProps = {
      mirror,
      textureMatrix: this.textureMatrix,
      mixBlur,
      tDiffuse: this.fbo1?.texture,
      tDepth: this.fbo1?.depthTexture,
      tDiffuseBlur: this.fbo2?.texture,
      hasBlur: this.hasBlur,
      mixStrength,
      minDepthThreshold,
      maxDepthThreshold,
      depthScale,
      depthToBlurRatioBias,
      distortion,
      distortionMap,
      mixContrast,
      "defines-USE_BLUR": this.hasBlur ? "" : undefined,
      "defines-USE_DEPTH": depthScale > 0 ? "" : undefined,
      "defines-USE_DISTORTION": distortionMap ? "" : undefined,
    }
  }

  setupBuffers(resolution: number, blur: number[], bufferSamples: number) {
    const parameters = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      colorSpace: this.gl?.outputColorSpace,
    }

    const fbo1 = new WebGLRenderTarget(resolution, resolution, parameters)
    fbo1.depthBuffer = true
    fbo1.depthTexture = new DepthTexture(resolution, resolution)
    fbo1.depthTexture.format = DepthFormat
    fbo1.depthTexture.type = UnsignedShortType

    const fbo2 = new WebGLRenderTarget(resolution, resolution, parameters)

    if (this.gl?.capabilities.isWebGL2) {
      fbo1.samples = bufferSamples
    }

    this.fbo1 = fbo1
    this.fbo2 = fbo2

    this.kawaseBlurPass = new POSTPROCESSING.KawaseBlurPass()
    this.kawaseBlurPass.setSize(blur[0], blur[1])
  }

  beforeRender() {
    if (!this.parent) return

    this.reflectorWorldPosition?.setFromMatrixPosition(this.parent.matrixWorld)
    if (this.camera)
      this.cameraWorldPosition?.setFromMatrixPosition(this.camera.matrixWorld)
    this.rotationMatrix?.extractRotation(this.parent.matrixWorld)

    // was changed from this.normal.set(0, 0, 1)
    if (this.planeNormal) this.normal?.copy(this.planeNormal)
    if (this.rotationMatrix) this.normal?.applyMatrix4(this.rotationMatrix)
    if (this.normal && this.reflectorOffset)
      this.reflectorWorldPosition?.addScaledVector(
        this.normal,
        this.reflectorOffset
      )
    if (this.reflectorWorldPosition && this.cameraWorldPosition)
      this.view?.subVectors(
        this.reflectorWorldPosition,
        this.cameraWorldPosition
      )
    // Avoid rendering when reflector is facing away
    if (this.normal && this.view && this.view.dot(this.normal) > 0) return
    if (this.normal) this.view?.reflect(this.normal).negate()
    if (this.reflectorWorldPosition) this.view?.add(this.reflectorWorldPosition)
    if (this.camera)
      this.rotationMatrix?.extractRotation(this.camera.matrixWorld)
    this.lookAtPosition?.set(0, 0, -1)
    if (this.rotationMatrix)
      this.lookAtPosition?.applyMatrix4(this.rotationMatrix)
    if (this.cameraWorldPosition)
      this.lookAtPosition?.add(this.cameraWorldPosition)
    if (this.reflectorWorldPosition && this.lookAtPosition)
      this.target?.subVectors(this.reflectorWorldPosition, this.lookAtPosition)
    if (this.normal) this.target?.reflect(this.normal).negate()
    if (this.reflectorWorldPosition)
      this.target?.add(this.reflectorWorldPosition)
    if (this.view) this.virtualCamera?.position.copy(this.view)
    this.virtualCamera?.up.set(0, 1, 0)
    if (this.rotationMatrix)
      this.virtualCamera?.up.applyMatrix4(this.rotationMatrix)
    if (this.normal) this.virtualCamera?.up.reflect(this.normal)
    if (this.target) this.virtualCamera?.lookAt(this.target)
    if (this.virtualCamera && this.camera)
      this.virtualCamera.far = this.camera.far // Used in WebGLBackground
    this.virtualCamera?.updateMatrixWorld()
    if (this.camera)
      this.virtualCamera?.projectionMatrix.copy(this.camera.projectionMatrix)

    // Update the texture matrix
    this.textureMatrix?.set(
      0.5,
      0.0,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.0,
      0.5,
      0.5,
      0.0,
      0.0,
      0.0,
      1.0
    )
    if (this.virtualCamera)
      this.textureMatrix?.multiply(this.virtualCamera.projectionMatrix)
    if (this.virtualCamera)
      this.textureMatrix?.multiply(this.virtualCamera.matrixWorldInverse)
    this.textureMatrix?.multiply(this.parent.matrixWorld)

    // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
    // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
    if (this.normal && this.reflectorWorldPosition)
      this.reflectorPlane?.setFromNormalAndCoplanarPoint(
        this.normal,
        this.reflectorWorldPosition
      )
    if (this.virtualCamera)
      this.reflectorPlane?.applyMatrix4(this.virtualCamera.matrixWorldInverse)
    if (this.reflectorPlane)
      this.clipPlane?.set(
        this.reflectorPlane.normal.x,
        this.reflectorPlane.normal.y,
        this.reflectorPlane.normal.z,
        this.reflectorPlane.constant
      )
    const projectionMatrix = this.virtualCamera?.projectionMatrix
    if (this.q && this.clipPlane && projectionMatrix)
      this.q.x =
        (Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) /
        projectionMatrix.elements[0]
    if (this.q && this.clipPlane && projectionMatrix)
      this.q.y =
        (Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) /
        projectionMatrix.elements[5]
    if (this.q) this.q.z = -1.0
    if (this.q && this.clipPlane && projectionMatrix)
      this.q.w =
        (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14]
    // Calculate the scaled plane vector
    if (this.clipPlane && this.q)
      this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(this.q))

    // Replacing the third row of the projection matrix
    if (projectionMatrix && this.clipPlane) {
      projectionMatrix.elements[2] = this.clipPlane.x
      projectionMatrix.elements[6] = this.clipPlane.y
      projectionMatrix.elements[10] = this.clipPlane.z + 1.0
      projectionMatrix.elements[14] = this.clipPlane.w
    }
  }

  update() {
    if (this.parent?.material !== this) return

    this.parent.visible = false
    const currentXrEnabled = this.gl?.xr.enabled
    const currentShadowAutoUpdate = this.gl?.shadowMap.autoUpdate

    this.beforeRender()
    if (this.gl) {
      this.gl.xr.enabled = false
      this.gl.shadowMap.autoUpdate = false
      if (this.fbo1) this.gl.setRenderTarget(this.fbo1)
      this.gl.state.buffers.depth.setMask(true)
      if (!this.gl?.autoClear) this.gl.clear()

      if (this.scene && this.virtualCamera)
        this.gl.render(this.scene, this.virtualCamera)

      if (this.hasBlur && this.fbo1 && this.fbo2) {
        this.kawaseBlurPass?.render(this.gl, this.fbo1, this.fbo2)
      }

      if (currentXrEnabled) this.gl.xr.enabled = currentXrEnabled
      if (currentShadowAutoUpdate)
        this.gl.shadowMap.autoUpdate = currentShadowAutoUpdate
      this.parent.visible = true
      this.gl.setRenderTarget(null)
    }
  }

  onBeforeCompile(shader: Shader, ...args: [WebGLRenderer]) {
    super.onBeforeCompile(shader, ...args)

    if (this.defines === undefined) this.defines = {}

    if (!this.defines.USE_UV) {
      this.defines.USE_UV = ""
    }

    if (this.reflectorProps["defines-USE_BLUR"] !== undefined)
      this.defines.USE_BLUR = ""
    if (this.reflectorProps["defines-USE_DEPTH"] !== undefined)
      this.defines.USE_DEPTH = ""
    if (this.reflectorProps["defines-USE_DISTORTION"] !== undefined)
      this.defines.USE_DISTORTION = ""

    let props = this.reflectorProps

    for (let prop in props) {
      shader.uniforms[prop] = {
        get value() {
          return props[prop]
        },
      }
    }

    shader.vertexShader = `
            uniform mat4 textureMatrix;
            varying vec4 my_vUv;     
          ${shader.vertexShader}`

    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      /* glsl */ `
          #include <project_vertex>
          my_vUv = textureMatrix * vec4( position, 1.0 );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          `
    )

    shader.fragmentShader = /* glsl */ `
            uniform sampler2D tDiffuse;
            uniform sampler2D tDiffuseBlur;
            uniform sampler2D tDepth;
            uniform sampler2D distortionMap;
            uniform float distortion;
            uniform float cameraNear;
            uniform float cameraFar;
            uniform bool hasBlur;
            uniform float mixBlur;
            uniform float mirror;
            uniform float mixStrength;
            uniform float minDepthThreshold;
            uniform float maxDepthThreshold;
            uniform float mixContrast;
            uniform float depthScale;
            uniform float depthToBlurRatioBias;
            varying vec4 my_vUv;        
            ${shader.fragmentShader}`

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      /* glsl */ `
          #include <emissivemap_fragment>
        
          float distortionFactor = 0.0;
          #ifdef USE_DISTORTION
            distortionFactor = texture2D(distortionMap, vUv).r * distortion;
          #endif
    
          vec4 new_vUv = my_vUv;
          new_vUv.x += distortionFactor;
          new_vUv.y += distortionFactor;
    
          vec4 base = texture2DProj(tDiffuse, new_vUv);
          vec4 blur = texture2DProj(tDiffuseBlur, new_vUv);
          
          vec4 merge = base;
          
          #ifdef USE_NORMALMAP
            vec2 normal_uv = vec2(0.0);
            vec4 normalColor = texture2D(normalMap, vUv);
            vec3 my_normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );
            vec3 coord = new_vUv.xyz / new_vUv.w;
            normal_uv = coord.xy + coord.z * my_normal.xz * 0.05 * normalScale;
            vec4 base_normal = texture2D(tDiffuse, normal_uv);
            vec4 blur_normal = texture2D(tDiffuseBlur, normal_uv);
            merge = base_normal;
            blur = blur_normal;
          #endif
    
          float depthFactor = 0.0001;
          float blurFactor = 0.0;
    
          #ifdef USE_DEPTH
            vec4 depth = texture2DProj(tDepth, new_vUv);
            depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
            depthFactor *= depthScale;
            depthFactor = max(0.0001, min(1.0, depthFactor));
    
            #ifdef USE_BLUR
              blur = blur * min(1.0, depthFactor + depthToBlurRatioBias);
              merge = merge * min(1.0, depthFactor + 0.5);
            #else
              merge = merge * depthFactor;
            #endif
      
          #endif
    
          float reflectorRoughnessFactor = roughness;
          #ifdef USE_ROUGHNESSMAP
            vec4 reflectorTexelRoughness = texture2D( roughnessMap, vUv );
            
            reflectorRoughnessFactor *= reflectorTexelRoughness.g;
          #endif
          
          #ifdef USE_BLUR
            blurFactor = min(1.0, mixBlur * reflectorRoughnessFactor);
            merge = mix(merge, blur, blurFactor);
          #endif
    
          vec4 newMerge = vec4(0.0, 0.0, 0.0, 1.0);
          newMerge.r = (merge.r - 0.5) * mixContrast + 0.5;
          newMerge.g = (merge.g - 0.5) * mixContrast + 0.5;
          newMerge.b = (merge.b - 0.5) * mixContrast + 0.5;
          
          diffuseColor.rgb = diffuseColor.rgb * ((1.0 - min(1.0, mirror)) + newMerge.rgb * mixStrength);
          `
    )
  }
}
