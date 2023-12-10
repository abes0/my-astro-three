import {
  Color,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  Plane,
  ShaderMaterial,
  UniformsUtils,
  Vector3,
  Vector4,
  WebGLRenderTarget,
  HalfFloatType,
  BufferGeometry,
  type NormalBufferAttributes,
  Scene,
  WebGLRenderer,
  Material,
  LinearFilter,
  DepthTexture,
  DepthFormat,
  UnsignedShortType,
  UnsignedIntType,
} from "three"
import * as POSTPROCESSING from "postprocessing"

class Reflector extends Mesh {
  isReflector: boolean
  type: string
  camera: PerspectiveCamera
  static ReflectorShader: any
  dispose: () => void
  getRenderTarget: any
  kawaseBlurPass: POSTPROCESSING.KawaseBlurPass
  // static viewport: any
  // static far: any

  constructor(
    geometry: BufferGeometry<NormalBufferAttributes>,
    options: {
      color?: number
      textureWidth?: number
      textureHeight?: number
      clipBias?: number
      shader?: any
      multisample?: number
      normalMap?: any
      roughnessMap?: any
    } = {}
  ) {
    super(geometry)

    this.isReflector = true

    this.type = "Reflector"
    this.camera = new PerspectiveCamera()

    const scope = this

    const color =
      options.color !== undefined
        ? new Color(options.color)
        : new Color(0x7f7f7f)
    const textureWidth = options.textureWidth || 512
    const textureHeight = options.textureHeight || 512
    const clipBias = options.clipBias || 0
    const shader = options.shader || Reflector.ReflectorShader
    const multisample =
      options.multisample !== undefined ? options.multisample : 4

    //

    const reflectorPlane = new Plane()
    const normal = new Vector3()
    const reflectorWorldPosition = new Vector3()
    const cameraWorldPosition = new Vector3()
    const rotationMatrix = new Matrix4()
    const lookAtPosition = new Vector3(0, 0, -1)
    const clipPlane = new Vector4()

    const view = new Vector3()
    const target = new Vector3()
    const q = new Vector4()

    const textureMatrix = new Matrix4()
    const virtualCamera: PerspectiveCamera = this.camera

    const params = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
    }

    const renderTarget = new WebGLRenderTarget(textureWidth, textureHeight, {
      samples: multisample,
      type: HalfFloatType,
      ...params,
    })
    renderTarget.depthBuffer = true
    renderTarget.depthTexture = new DepthTexture(textureWidth, textureHeight)
    renderTarget.depthTexture.format = DepthFormat
    renderTarget.depthTexture.type = UnsignedIntType

    const renderTarget2 = new WebGLRenderTarget(
      textureWidth,
      textureHeight,
      params
    )

    this.kawaseBlurPass = new POSTPROCESSING.KawaseBlurPass()

    const material = new ShaderMaterial({
      name: shader.name !== undefined ? shader.name : "unspecified",
      uniforms: UniformsUtils.clone(shader.uniforms),
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
    })

    material.uniforms["tDiffuse"].value = renderTarget.texture
    material.uniforms["tDepth"].value = renderTarget.depthTexture
    material.uniforms["tDiffuseBlur"].value = renderTarget2.texture
    material.uniforms["color"].value = color
    material.uniforms["textureMatrix"].value = textureMatrix
    material.uniforms["normalMap"].value = options.normalMap
    material.uniforms["roughnessMap"].value = options.roughnessMap

    this.material = material

    this.onBeforeRender = function (
      renderer: WebGLRenderer,
      scene: Scene,
      camera: PerspectiveCamera
    ) {
      reflectorWorldPosition.setFromMatrixPosition(scope.matrixWorld)
      cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld)

      rotationMatrix.extractRotation(scope.matrixWorld)

      normal.set(0, 0, 1)
      normal.applyMatrix4(rotationMatrix)

      view.subVectors(reflectorWorldPosition, cameraWorldPosition)

      // Avoid rendering when reflector is facing away

      if (view.dot(normal) > 0) return

      view.reflect(normal).negate()
      view.add(reflectorWorldPosition)

      rotationMatrix.extractRotation(camera.matrixWorld)

      lookAtPosition.set(0, 0, -1)
      lookAtPosition.applyMatrix4(rotationMatrix)
      lookAtPosition.add(cameraWorldPosition)

      target.subVectors(reflectorWorldPosition, lookAtPosition)
      target.reflect(normal).negate()
      target.add(reflectorWorldPosition)

      virtualCamera.position.copy(view)
      virtualCamera.up.set(0, 1, 0)
      virtualCamera.up.applyMatrix4(rotationMatrix)
      virtualCamera.up.reflect(normal)
      virtualCamera.lookAt(target)

      virtualCamera.far = camera.far // Used in WebGLBackground

      virtualCamera.updateMatrixWorld()
      virtualCamera.projectionMatrix.copy(camera.projectionMatrix)

      // Update the texture matrix
      textureMatrix.set(
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
      textureMatrix.multiply(virtualCamera.projectionMatrix)
      textureMatrix.multiply(virtualCamera.matrixWorldInverse)
      textureMatrix.multiply(scope.matrixWorld)

      // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
      // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
      reflectorPlane.setFromNormalAndCoplanarPoint(
        normal,
        reflectorWorldPosition
      )
      reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse)

      clipPlane.set(
        reflectorPlane.normal.x,
        reflectorPlane.normal.y,
        reflectorPlane.normal.z,
        reflectorPlane.constant
      )

      const projectionMatrix = virtualCamera.projectionMatrix

      q.x =
        (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) /
        projectionMatrix.elements[0]
      q.y =
        (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) /
        projectionMatrix.elements[5]
      q.z = -1.0
      q.w =
        (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14]

      // Calculate the scaled plane vector
      clipPlane.multiplyScalar(2.0 / clipPlane.dot(q))

      // Replacing the third row of the projection matrix
      projectionMatrix.elements[2] = clipPlane.x
      projectionMatrix.elements[6] = clipPlane.y
      projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias
      projectionMatrix.elements[14] = clipPlane.w

      // Render
      scope.visible = false

      const currentRenderTarget = renderer.getRenderTarget()

      const currentXrEnabled = renderer.xr.enabled
      const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate

      renderer.xr.enabled = false // Avoid camera modification
      renderer.shadowMap.autoUpdate = false // Avoid re-computing shadows

      renderer.setRenderTarget(renderTarget)

      renderer.state.buffers.depth.setMask(true) // make sure the depth buffer is writable so it can be properly cleared, see #18897

      if (renderer.autoClear === false) renderer.clear()
      renderer.render(scene, virtualCamera)

      renderer.xr.enabled = currentXrEnabled
      renderer.shadowMap.autoUpdate = currentShadowAutoUpdate

      renderer.setRenderTarget(currentRenderTarget)

      // Restore viewport

      // const viewport = camera.viewport

      // if (viewport !== undefined) {
      // renderer.state.viewport(viewport)
      // }

      scope.visible = true
    }

    this.getRenderTarget = function () {
      return renderTarget
    }

    this.dispose = function () {
      renderTarget.dispose()
      // scope.material.dispose()
    }
  }
}

Reflector.ReflectorShader = {
  name: "ReflectorShader",

  uniforms: {
    color: {
      value: null,
    },

    tDiffuse: {
      value: null,
    },

    tDepth: {
      value: null,
    },

    tDiffuseBlur: {
      value: null,
    },

    textureMatrix: {
      value: null,
    },

    normalMap: {
      value: null,
    },

    roughnessMap: {
      value: null,
    },
  },

  vertexShader: /* glsl */ `
		uniform mat4 textureMatrix;
		varying vec2 vUv;
    varying vec4 textureUv;

		#include <common>
		#include <logdepthbuf_pars_vertex>

		void main() {

      vUv = uv;

      textureUv = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#include <logdepthbuf_vertex>

		}`,

  fragmentShader: /* glsl */ `
		uniform vec3 color;
		uniform sampler2D tDiffuse;
    uniform sampler2D tDiffuseBlur;
    uniform sampler2D normalMap;
    uniform sampler2D roughnessMap;
		varying vec2 vUv;
    varying vec4 textureUv;

		#include <logdepthbuf_pars_fragment>

		float blendOverlay( float base, float blend ) {

			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

		}

		vec3 blendOverlay( vec3 base, vec3 blend ) {

			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

		}

		void main() {

			#include <logdepthbuf_fragment>

      vec4 new_vUv = textureUv;

			vec4 base = texture2DProj(tDiffuse, textureUv);
      vec4 blur = texture2DProj(tDiffuseBlur, textureUv);

      vec4 diffuseColor = texture2D( tDiffuse, vUv );


      // normal
      vec2 normal_uv = vec2(0.0);
      vec4 normalTexture = texture2D( normalMap, vUv );
      vec3 my_normal = normalize( vec3( normalTexture.r * 2.0 - 1.0, normalTexture.b,  normalTexture.g * 2.0 - 1.0 ) );
      vec3 coord = new_vUv.xyz / new_vUv.w;
      float normalScale = 2.0;
      normal_uv = coord.xy + coord.z * my_normal.xz * 0.05 * normalScale;
      vec4 base_normal = texture2D(tDiffuse, normal_uv);
      vec4 merge = base_normal;
      blur = base_normal;

      // blur
      float depthFactor = 0.0001;
      float blurFactor = 0.0;
      float depthToBlurRatioBias = 0.25;
      blur = blur * min(1.0, depthFactor + depthToBlurRatioBias);
      merge = merge * min(1.0, depthFactor + 0.5);



      // roughness
      float roughness = 0.7;
      float reflectorRoughnessFactor = roughness;
      vec4 roughnessTexture = texture2D( roughnessMap, vUv );
      reflectorRoughnessFactor *= roughnessTexture.g;
			// gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );
      // gl_FragColor = vec4(vUv.xy, 0.0, 1.0);
      // gl_FragColor = mix(merge, roughnessTexture, roughnessTexture.g);


      // mix
      float mixBlur = 30.0;
      float mixContrast = 1.0;
      float mixStrength = 80.0;
      blurFactor = min(1.0, mixBlur * reflectorRoughnessFactor);
      merge = mix(merge, blur, blurFactor);

      vec4 newMerge = vec4(0.0, 0.0, 0.0, 1.0);
      newMerge.r = (merge.r - 0.5) * mixContrast + 0.5;
      newMerge.g = (merge.g - 0.5) * mixContrast + 0.5;
      newMerge.b = (merge.b - 0.5) * mixContrast + 0.5;
      // gl_FragColor = merge;
      // gl_FragColor = texture2D(tDiffuseBlur, vUv);

      // vec3 resultColor = merge.rgb * ((1.0 - min(1.0, 1.0)) + newMerge.rgb * mixStrength);
      // gl_FragColor = vec4(resultColor, 1.);
      
      gl_FragColor = vec4( mix(newMerge.rgb, roughnessTexture.rgb, 0.5), 1.0 );


			// #include <tonemapping_fragment>
			// #include <colorspace_fragment>

		}`,
}

export { Reflector }
