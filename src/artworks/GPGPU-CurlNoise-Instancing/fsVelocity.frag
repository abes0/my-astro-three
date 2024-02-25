uniform float uTime;
// uniform float progress;
// uniform sampler2D texture1;
// uniform vec4 resolution;
// varying vec2 uv;
// varying vec3 vPosition;
float PI = 3.1415926535897932384626433832795;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 vel = texture2D(textureVelocity, uv).rgb;
  

  // gl_FragColor = vec4(uv, 0.0, 1.0);
  gl_FragColor = vec4(vel, 1.0);
}
