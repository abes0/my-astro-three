// VertexShaderから受け取った色を格納するだけ。
varying vec4 vColor;
void main() {

    // 丸い形に色をぬるための計算
    // float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
    // if ( f > 0.1 ) {
    //     discard;
    // }
    gl_FragColor = vColor;
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}