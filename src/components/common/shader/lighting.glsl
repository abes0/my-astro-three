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