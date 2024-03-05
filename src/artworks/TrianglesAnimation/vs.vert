attribute float aRandom;
attribute vec3 aCenter;

varying vec2 vUv;
varying vec3 vPosition;
varying float vProg;
varying float vDebug;

uniform vec2 pixels;
uniform float uTime;
uniform float uProgress;

float PI = 3.1415926535897932384626433832795;

mat3 scale3D(vec3 s){
    return mat3(s.x,0.,0.,0.,s.y,0.,0.,0.,s.z);
}

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
    vUv = uv;
    vec3 pos = position;
    float prog = (position.y + 1.0) / 2.0;
    float locprog = clamp((uProgress - prog * 0.9) / 0.1, 0.0, 1.0);

    vProg = prog;
    vDebug = locprog;

    // pos = (pos - aCenter) * locprog;
    pos = pos - aCenter;
    pos += (locprog) * normal * aRandom * 1.0;
    pos *= (1. - locprog);

    // pos *= scale3D(vec3(1.0, 1.0, 1.0) * (1. - locprog));
    
    pos += aCenter;
    pos *= rotateQ(vec3(0.0, 1.0, 0.0), locprog * PI * 0.5 * aRandom);
    // pos += uRandom * sin(uv.x * PI * 2.0 + uTime * 0.5);
    // pos.x += uRandom * sin((uv.y + uv.x + uTime) * 10.0) * 0.2;
    // pos.x += uTime;
    

    
    
    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}