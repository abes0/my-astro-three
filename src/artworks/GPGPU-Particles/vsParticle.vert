uniform float uTime;
uniform sampler2D uPositions;
// uniform sampler2D uInfo;
varying vec2 vUv;
varying vec4 vColor;
varying vec3 vPosition;
float PI = 3.1415926535897932384626433832795;
void main() {
  vUv = uv;
  vec4 uPos = texture2D(uPositions, uv);
  float angle = atan(uPos.y, uPos.x);

  vColor = 0.7 * vec4(vec3(0.5 + 0.45 * sin(angle + uTime * 0.4)), 1.0);
  // vColor = vec4(1., sin(uTime), 0., 1.0);
  // vColor = vec4(vec3(angle), 1.0);
  
  vec4 mvPosition = modelViewMatrix * vec4(uPos.xyz, 1.0);
  gl_PointSize = 1. * (1. / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}