uniform float uTime;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.1415926535897932384626433832795;
void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = 1000. * (1. / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}