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
// const vec3 hemiLightColor = vec3(0.58,0.82,0.88);
// const vec3 hemiLightColor = vec3(1.0,0.0,0.0);
const vec3 dirLightPos = vec3(700, 700, -400);


vec3 hemiLighting(vec3 pos, vec3 dir, vec3 baseColor, vec3 addColor) {
  vec3 _normal = normalize(cross(dFdx(pos), dFdy(pos)));
  float _dot = dot(_normal, normalize(dir));
  float _power = 0.5 + 0.45 * _dot;
  vec3 _color = mix(baseColor, addColor, _power);
  return _color;
}

vec3 dirLighting(vec3 pos, vec3 dir, float brightness) {
  vec3 _normal = normalize(cross(dFdx(pos), dFdy(pos)));
  float _dot = dot(_normal, normalize(dir));
  vec3 _color = max(0.0, _dot) * vec3(brightness);
  return _color;
}

void main() {
  vec3 color = vec3(0.0, 0.0, 0.0);
  color = hemiLighting(vPosition, hemiPos_1, color, vec3(0.58,0.82,0.88));
  color = hemiLighting(vPosition, hemiPos_2, color, vec3(0.8,0.5,0.88));
  color += dirLighting(vPosition, dirLightPos, 1.0);
  // vec3 hemi_3 = 
  
  // color += hemi_1 + hemi_2;
  gl_FragColor = vec4(color, 1.0);
}
