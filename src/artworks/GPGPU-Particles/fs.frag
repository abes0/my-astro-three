uniform float uTime;
// uniform float progress;
// uniform sampler2D texture1;
// uniform vec4 resolution;
varying vec2 vUv;
varying vec4 vColor;
varying vec3 vPosition;
float PI = 3.1415926535897932384626433832795;
void main() {
  // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  gl_FragColor = vColor;
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
