varying vec2 vUv;
varying vec3 vPosition;

attribute float aRandom;
attribute vec3 aCenter;
attribute vec3 aNextPos;

uniform float uTime;
uniform float uProgress;
uniform bool uIsAfter;

float PI = 3.1415926535897932384626433832795;

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

    
    float _progY = (position.y + 1.0) / 2.0;
    float _progX = (position.x + 1.0) / 2.0;

    float localProgY = clamp((uProgress - _progY * 0.9) / 0.1, 0.0, 1.0);
    float localProgX = clamp((uProgress - _progX * 0.9) / 0.1, 0.0, 1.0);

    pos = pos - aCenter;
    vec3 next = aNextPos - aCenter;

    if(uIsAfter) {
        pos += normal * aRandom * (1. - localProgX);
        pos *= (localProgX);
        pos *= rotateQ(normal, PI * (1. - localProgX));
    } else {
        pos += normal * aRandom * (localProgX);
        pos *= (1. - localProgX);
        pos *= rotateQ(normal, PI * (localProgX));
    }

    
    // pos.x -= uTime * 0.1 * localProgX;

    // if(uIsAfter) {
    // }
    // pos *= (localProgX);

    // pos *= rotateQ(normal, PI * (1. - localProgX));

    // pos += vec3(aNextPos, 0.0, 0.0);

    pos += aCenter;
    // next += aCenter;

    // pos = mix(pos, aNextPos, localProgX);

    

    vPosition = pos;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}