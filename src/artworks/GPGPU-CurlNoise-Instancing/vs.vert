attribute vec2 instancedUv;
varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform float uTime;
uniform vec2 uMouse;

float PI = 3.1415926535897932384626433832795;

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

mat3 scale(vec3 s){
    return mat3(s.x,0.,0.,0.,s.y, 0.,0.,0.,s.z);
}

float map(float num, float fromMin, float fromMax, float toMin, float toMax) {
  return
    num <= fromMin ? toMin
    : num >= fromMax ? toMax
    : toMin + (num - fromMin) * (toMax - toMin) / (fromMax - fromMin);
}

void main() {
    vUv = uv;
    vec3 _pos = position;
    vec4 pos = texture2D(texturePosition, instancedUv);
    vec4 vel = texture2D(textureVelocity, instancedUv);
    
    float depthY = map(pos.y, -500., 900., 1.5, 0.0);
    float s = map(uTime - 1.0, 0.0, 3.0, 0.0, 1.0);

    _pos *= scale(vec3(1.0, 1.0, 1.0) * s * depthY);

    _pos *= rotateQ(normalize(pos.xyz), length(vel.xyz) * PI);

    vec3 newPosition = pos.xyz + _pos;
    vec4 worldPosition = modelMatrix * vec4(newPosition,1.0);
    vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );

    vPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}