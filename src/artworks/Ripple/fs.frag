uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
varying vec2 vUv;
float PI = 3.14159265358979323846264;
float ramdom( vec2 co ){
  return fract( sin( dot( co.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
}
void main()	{
  vec4 displacement = texture2D( uDisplacement, vUv );
  float theta = displacement.r * 1.0 * PI;

  vec2 offset = vec2(sin( theta ) , cos( theta ));

  vec2 uv = vUv + offset * displacement.r * 0.1;

  vec4 tex = texture2D( uTexture, uv );
  // gl_FragColor = vec4( vUv, 0.0, 1.0 );
  gl_FragColor = tex;
}