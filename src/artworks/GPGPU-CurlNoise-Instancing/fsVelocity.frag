uniform float uTime;
uniform float uWidth;
uniform vec2 uMouse;
uniform vec2 uMouseForce;
float PI = 3.1415926535897932384626433832795;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec4 vel = texture2D(textureVelocity, uv);
  float radius = length(pos.xy);
  float force = 1. - smoothstep(0.3, 1.4, radius);
  float angle = atan(pos.y, pos.x) - vel.z * 0.1 * mix(0.3, 1.4, force);
  float targetRadius = mix(vel.w * uWidth * 3.0, uWidth * 5.0, 0.5 + 0.25 * sin(angle * 3. + uTime * 0.2));
  radius += (targetRadius - radius) * 0.01;
  vec3 targetPos = vec3(cos(angle), sin(angle), 0.) * radius;
  vel.xy = (targetPos.xy - pos.xy) * 0.2;

  float mouseForce = length(uMouseForce);
  float dist = length(pos.xy - uMouse);
  vec2 dir = normalize(pos.xy - uMouse);
  vel.xy += dir * smoothstep(1.2 * 100., 0.0, dist) * 300.* mouseForce;

  gl_FragColor = vel;
}
