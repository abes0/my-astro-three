#include <common>
uniform sampler2D texturePosition;
uniform float cameraConstant;
uniform float density;
varying vec4 vColor;
varying vec2 vUv;
uniform float radius;
uniform vec3 mouse;



void main() {
  vec4 posTemp = texture2D( texturePosition, uv );
  vec3 pos = posTemp.xyz;
  vColor = vec4( 0.5, 1.0, 1.0, 1.0 );

  // pos.xy = mouse.xy;

  // ポイントのサイズを決定
  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
  // float cameraConstant = 4700.;
  gl_PointSize = 1.5 * cameraConstant / ( - mvPosition.z );
  // gl_PointSize = 1.0;
  // uv情報の引き渡し
  vUv = uv;

  // 変換して格納
  gl_Position = projectionMatrix * mvPosition;
}