// 移動方向についていろいろ計算できるシェーダー。
// 今回はなにもしてない。
// ここでVelのx y zについて情報を上書きすると、それに応じて移動方向が変わる
#include <common>

uniform vec3 mouse;

const float SPEED = 0.1;
const float VELOCITY = 30.;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D( texturePosition, uv ).xyz;
    vec3 vel = texture2D( textureVelocity, uv ).xyz;
    float velW = texture2D( textureVelocity, uv ).w;
    // vec2 nMouse = mouse.xy / resolution.xy;
    vec3 mouseVel = normalize(mouse - pos) * 0.08;
    float mouseDist = normalize(distance(mouse, pos)); // 0 ~ 1
    vec3 w = normalize(mouseVel + vel);
    // vel = normalize(mouseVel + vel);
    // float idParticle = uv.y * resolution.x + uv.x;

    // vel = vel + (SimplexPerlin3D_Deriv(pos * 3.0) * 0.1).xyz;
    // vel = vel + snoiseDelta(pos * 3.0) * 0.1;
    

    // vec3 dest = vel + w * 0.01;
    vel = w * SPEED * VELOCITY * velW;

    // vel = clamp(vel, -0.5, 0.5);

    // vel *= 0.5;

    // dest = clamp(dest, -1.0, 1.0);

    gl_FragColor = vec4( vel, velW );
}