uniform float uTime;
// uniform float progress;
// uniform sampler2D texture1;
// uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.1415926535897932384626433832795;

const vec3 hemiPos_1 = vec3(100.0, 100.0, -100.0);
const vec3 hemiPos_2 = vec3(-100.0, -100.0, 100.0);
const vec3 hemiPos_3 = vec3(-100.0, 100.0, 100.0);
const vec3 hemiPos_4 = vec3(-100.0, 100.0, -200.0);
// const vec3 hemiLightColor = vec3(0.58,0.82,0.88);
// const vec3 hemiLightColor = vec3(1.0,0.0,0.0);
const vec3 dirLightPos = vec3(50, 100, -100);
const vec3 lightPos_1 = vec3(150.0, 80.0, -200.0);
// const vec3 lightPos_2 = vec3(-100.0, -100.0, 100.0);


vec3 hemiLighting(vec3 pos, vec3 dir, vec3 baseColor, vec3 addColor, float power) {
  vec3 _normal = normalize(cross(dFdx(pos), dFdy(pos)));
  float _dot = dot(_normal, normalize(dir));
  float _power = 0.5 * power + 0.45 * _dot;
  vec3 _color = mix(baseColor, addColor, _power);
  return _color;
}

vec3 dirLighting(vec3 pos, vec3 dir, float brightness) {
  vec3 _normal = normalize(cross(dFdx(pos), dFdy(pos)));
  float _dot = dot(_normal, normalize(dir));
  vec3 _color = max(0.0, _dot) * vec3(brightness);
  return _color;
}

vec3 colorConv(float r, float g, float b) {
  return vec3(r / 255.0, g / 255.0, b / 255.0);
}

void main() {
  vec3 color = vec3(0.0, 0.0, 0.0);
  // color = hemiLighting(vPosition, hemiPos_3, color, vec3(0.58,0.82,0.78));
  color = hemiLighting(vPosition, lightPos_1, color, colorConv(237.,131.,2.), 1.0); // colorConv(65.,0.,179.)
  color = hemiLighting(vPosition, vec3(-50.0, 10.0, 500.0), color, colorConv(1.,5.,112.), 0.2);
  color += dirLighting(vPosition, lightPos_1, 0.7);
  // vec3 hemi_3 = 

  // float t = clamp(uTime - 3.0, 0.0, 1.0);
  // float a = smoothstep(0.0, 3.0, t);
  
  // color += hemi_1 + hemi_2;
  gl_FragColor = vec4(color, 1.0);
  // gl_FragColor = vec4(1.0,t, 0.0, 1.0);
}
