#define delta ( 1.0 / 60.0 )
uniform vec3 mouse;
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D( texturePosition, uv ).xyz;
    vec3 vel = texture2D( textureVelocity, uv ).xyz;
    // vec3 mouseVel = normalize(mouse - pos);
    // float mouseDist = distance(mouse, pos);
    // vec3 w = normalize(mouseVel + vel);

    // 移動する方向に速度を掛け合わせた数値を現在地に加える。
    pos += vel;
    // vec3 mouseVel = normalize(mouse - pos) * 0.1;
    // vec3 w = normalize(mouseVel + vel);

    // vec3 dest = vel + w * 0.01 * 0.5;

    // pos = mouse * 100.;

    gl_FragColor = vec4( pos, 1.0 );
}