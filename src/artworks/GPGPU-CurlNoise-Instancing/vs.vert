attribute vec2 instancedUv;
varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D texturePosition;
uniform float uTime;
float PI = 3.1415926535897932384626433832795;

void main() {
    vUv = uv;
    vec4 pos = texture2D(texturePosition, instancedUv);
    vec4 mvPosition = modelViewMatrix * vec4(pos.xyz + position, 1.0);
    
    vPosition = pos.xyz + position.xyz;
    gl_Position = projectionMatrix * mvPosition;
    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}