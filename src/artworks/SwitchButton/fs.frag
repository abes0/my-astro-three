
// uniform float progress;
// uniform sampler2D texture1;
// uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform float uProgress;
uniform bool uIsAfter;

float PI = 3.1415926535897932384626433832795;
void main() {
  if(uIsAfter) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  } else {
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
  }
  
}
