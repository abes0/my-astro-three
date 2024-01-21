precision highp float;

uniform float sineTime;
uniform float time;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// attribute vec3 position;
attribute vec2 uv;
attribute vec3 position;
attribute vec3 offset;
attribute vec4 color;
attribute vec4 orientationStart;
attribute vec4 orientationEnd;

varying vec3 vPosition;
varying vec4 vColor;

vec3 rotate(vec3 p, float angle, vec3 axis){
    vec3 a = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float r = 1.0 - c;
    mat3 m = mat3(
        a.x * a.x * r + c,
        a.y * a.x * r + a.z * s,
        a.z * a.x * r - a.y * s,
        a.x * a.y * r - a.z * s,
        a.y * a.y * r + c,
        a.z * a.y * r + a.x * s,
        a.x * a.z * r + a.y * s,
        a.y * a.z * r - a.x * s,
        a.z * a.z * r + c
    );
    return m * p;
}

void main(){

  // vPosition = offset * max( abs( sineTime * 2.0 + 1.0 ), 0.5 ) + position;
  // vec4 orientation = normalize( mix( orientationStart, orientationEnd, sineTime ) ); // ランダムな値のstartベクトルとランダムな値のendベクトルの間でsineさせる
  // vec3 vcV = cross( orientation.xyz, vPosition ); // 場所とsineTimeによって外積の結果が変わる
  // vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );

  // vPosition = offset + position;
  
  vPosition = rotate(position + offset, (time + 10.) * offset.x, vec3(0.0, 0.0, 1.0));
  vPosition = rotate(vPosition + offset, (time + 15.)  * color.g * offset.y, vec3(0.0, 0.0, 1.0));
  vPosition = rotate(vPosition + offset, (time + 18.)  * color.b * offset.z, vec3(0.0, 0.0, 1.0));
  
  // vPosition = rotate(vPosition, sineTime * sin(vPosition.z / time), vec3(0.0, 0.0, 1.0));

  vColor = color;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );

}