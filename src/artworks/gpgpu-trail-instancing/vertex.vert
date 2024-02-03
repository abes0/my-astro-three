#include <common>
attribute vec3 offset;
attribute vec2 instancedUv;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
varying vec4 vColor;
varying vec3 vPos;

// https://github.com/yuichiroharai/glsl-y-rotate#readme
mat3 rotateQ(vec3 axis, float rad) {
    float hr = rad / 2.0;
    float s = sin( hr );
    vec4 q = vec4(axis * s, cos( hr ));
    vec3 q2 = q.xyz + q.xyz;
    vec3 qq2 = q.xyz * q2;
    vec2 qx = q.xx * q2.yz;
    float qy = q.y * q2.z;
    vec3 qw = q.w * q2.xyz;

    return mat3(
        1.0 - (qq2.y + qq2.z),  qx.x - qw.z,            qx.y + qw.y,
        qx.x + qw.z,            1.0 - (qq2.x + qq2.z),  qy - qw.x,
        qx.y - qw.y,            qy + qw.x,              1.0 - (qq2.x + qq2.y)
    );
}

void main() {
    vec3 pos = position;
    
    vec3 posTex = texture2D( texturePosition, instancedUv ).xyz;
    vec3 velTex = texture2D( textureVelocity, instancedUv ).xyz;
    // vec3 c = vec3(uv.y,sin(uv.x * uv.y * 5.0), uv.x);
    vColor = vec4(0.3, 0.3, 0.3, 1.0);

    pos *= rotateQ(normalize(velTex), 3.14);

    // vec3 newPosition = mat3(modelMatrix) * position;
    // newPosition += pos;
    vec3 newPosition = posTex + offset + pos;
    vec4 worldPosition = modelMatrix * vec4(newPosition,1.0);
    vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );
    vPos = worldPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;

    // gl_Position = projectionMatrix * viewMatrix * vec4(newPosition,1.0);
}