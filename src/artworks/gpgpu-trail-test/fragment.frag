varying vec4 vColor;
varying vec3 vPos;

const vec3 hemiLightDir = vec3(100.0, 100.0, -50.0);
const vec3 hemiLightColor = vec3(0.5882352941176471,0.8274509803921568,0.8823529411764706);
const vec3 dirLightPos = vec3(700, 700, -400);

void main() {
    vec3 normal = normalize(cross(dFdx(vPos), dFdy(vPos)));
    float hemiDotNL = dot(normal, normalize(hemiLightDir)) * 0.6 + 0.5;
    float dirDotNL = dot(normal, normalize(dirLightPos));
    vec3 _color = mix(vColor.rgb, hemiLightColor, hemiDotNL) * max(0.0, dirDotNL);
    gl_FragColor = vec4(_color, 1.0);
    // gl_FragColor = vColor;
} 