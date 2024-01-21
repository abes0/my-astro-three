#include <common>
uniform sampler2D texturePosition;
uniform float cameraConstant;
uniform float density;
varying vec4 vColor;
varying vec2 vUv;
uniform float radius;



void main() {
  vec4 posTemp = texture2D( texturePosition, uv );
  vec3 pos = posTemp.xyz;
  vColor = vec4( 1.0, 0.7, 1.0, 1.0 );

  // ポイントのサイズを決定
  vec4 mvPosition = modelViewMatrix * vec4( pos + position, 1.0 );
  // float cameraConstant = 4700.;
  // gl_PointSize = 0.5 * cameraConstant / ( - mvPosition.z );
  gl_PointSize = 2.0;
  // uv情報の引き渡し
  vUv = uv;

  // 変換して格納
  gl_Position = projectionMatrix * mvPosition;
}