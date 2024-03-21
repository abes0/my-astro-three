float PI = 3.1415926535897932384626433832795;
// Varyings
varying vec2 vUv;
varying vec2 vLayoutUv;
varying float vLineLettersTotal;

// add Varings
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;
varying vec2 vUv4;
varying vec2 vUv5;


// Uniforms: Common
uniform float uOpacity;
uniform float uThreshold;
uniform float uAlphaTest;
uniform vec3 uColor;
uniform sampler2D uMap;


// Uniforms: Strokes
uniform vec3 uStrokeColor;
uniform float uStrokeOutsetWidth;
uniform float uStrokeInsetWidth;

// add Uniforms
uniform sampler2D uMap1;
uniform sampler2D uMap2;
uniform sampler2D uMap3;
uniform sampler2D uMap4;
uniform sampler2D uMap5;

uniform float uProgress0;
uniform float uProgress1;
uniform float uProgress2;
uniform float uProgress3;
uniform float uProgress4;
uniform float uProgress5;
uniform float uProgress6;

uniform float uProgressA;
uniform float uProgressB;
uniform float uProgressC;
uniform float uProgressD;


// Utils: Median
float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

float rand(float n){return fract(sin(n) * 43758.5453123);}
float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(float p){
  float fl = floor(p);
  float fc = fract(p);
  return mix(rand(fl), rand(fl + 1.0), fc);
}
  
float noise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  
  float _a = mix(rand(b), rand(b + d.yx), f.x);
  float _b = mix(rand(b + d.xy), rand(b + d.yy), f.x);
  return mix(_a, _b, f.y);
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}



vec2 rotate2D (vec2 _st, float _angle) {
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

vec2 tile (vec2 _st, vec2 _zoom) {
    _st *= _zoom;
    return fract(_st);
}

vec2 rotateTilePattern(vec2 _st, float angle1, float angle2, float angle3){

    //  Scale the coordinate system by 2x2
    _st *= 2.0;

    //  Give each cell an index number
    //  according to its position
    float index = 0.0;
    index += step(1., mod(_st.x,2.0));
    index += step(1., mod(_st.y,2.0))*2.0;

    //      |
    //  2   |   3
    //      |
    //--------------
    //      |
    //  0   |   1
    //      |

    // Make each cell between 0.0 - 1.0
    _st = fract(_st);

    // Rotate each cell according to the index
    if(index == 1.0){
        //  Rotate cell 1 by 90 degrees
        _st = rotate2D(_st,PI*angle1); // 0.5
    } else if(index == 2.0){
        //  Rotate cell 2 by -90 degrees
        _st = rotate2D(_st,PI*angle2); // -0.5
    } else if(index == 3.0){
        //  Rotate cell 3 by 180 degrees
        _st = rotate2D(_st,PI*angle3); // 1.0
    }

    return _st;
}

float circle(vec2 uv, float _radius){
    vec2 pos = vec2(0.5)-uv;
    return smoothstep(1.0-_radius,1.0-_radius+_radius*0.2,1.-dot(pos,pos)*3.14);
}

float getPattern(vec2 uv, vec2 scale) {
  float x = floor(uv.x * scale.x);
  float y = floor(uv.y * scale.y);
  float pattern = mod(x + y, 2.0);
  return pattern;
}

float getRattlingPattern(vec2 uv, vec2 scale) {
  uv *= scale;
  float pattern = mod(uv.x + uv.y, 2.0);
  return pattern;
}

float getCirclePattern(vec2 uv, vec2 scale) {
  uv *= scale;
  uv = mod(uv, 2.0) - 1.0;
  float pattern = length(uv);
  pattern = step(0., 1. - pattern);
  return pattern;
}

float getTorucherTile(vec2 uv, vec2 scale) {
  vec2 st = tile(uv, vec2(3.0, 1.5));
  st = rotateTilePattern(st, 0.5, -0.5, 1.0);
  float pattern = step(st.x, st.y);
  return pattern;
}

float getDotPattern(vec2 uv, vec2 scale, float circleRadius) {
  vec2 st = tile(uv, scale);
  float pattern = circle(st, circleRadius);
  return pattern;
}

float getMixProgress(vec2 uv, float progress, float range, float pattern) {
  float p = progress;
  p = map(p, range, 1.0, 0.0, 1.0);
  // p = smoothstep(p, p + range, length(uv - 0.5) * 1.6);
  p = smoothstep(p, p + range, uv.x);
  float mix_ = 2.0 * p - (pattern);
  mix_ = clamp(mix_, 0., 1.);

  return 1.0 - mix_;
}

void main() {
    float pattern = getPattern(vLayoutUv, vec2(15.0, 8.0));
    // pattern = getRattlingPattern(vLayoutUv, vec2(15.0, 8.0));
    pattern = getCirclePattern(vLayoutUv, vec2(15.0, 5.0));
    pattern = getTorucherTile(vLayoutUv, vec2(5.0, 2.5));
    // pattern = 1. - getDotPattern(vLayoutUv, vec2(30.0, 10.0), 0.1);



    float range = 0.4;
    // Common
    // Texture sample
    vec3 s = texture2D(uMap, vUv).rgb;
    vec3 s1 = texture2D(uMap1, vUv1).rgb;
    vec3 s2 = texture2D(uMap2, vUv2).rgb;
    vec3 s3 = texture2D(uMap3, vUv3).rgb;
    vec3 s4 = texture2D(uMap4, vUv4).rgb;
    vec3 s5 = texture2D(uMap5, vUv5).rgb;

    float mix1 = getMixProgress(vLayoutUv, uProgress1, range, pattern);
    float mix2 = getMixProgress(vLayoutUv, uProgress2, range, pattern);
    float mix3 = getMixProgress(vLayoutUv, uProgress3, range, pattern);
    float mix4 = getMixProgress(vLayoutUv, uProgress4, range, pattern);
    float mix5 = getMixProgress(vLayoutUv, uProgress5, range, pattern);
    float mix6 = getMixProgress(vLayoutUv, uProgress6, range, pattern);

    float mixA = getMixProgress(vLayoutUv, uProgressA, range, pattern);
    float mixB = getMixProgress(vLayoutUv, uProgressB, range, pattern);
    float mixC = getMixProgress(vLayoutUv, uProgressC, range, pattern);
    float mixD = getMixProgress(vLayoutUv, uProgressD, range, pattern);

    vec3 smix1 = mix(s, s1, mix1);
    vec3 smix2 = mix(smix1, s2, mix2);
    vec3 smix3 = mix(smix2, s3, mix3);
    vec3 smix4 = mix(smix3, s4, mix4);
    vec3 smix5 = mix(smix4, s5, mix5);
    vec3 smix6 = mix(smix5, s, mix6);

    vec3 _s = smix6;

    // Signed distance
    float sigDist = median(_s.r, _s.g, _s.b) - 0.5;

    float afwidth = 1.4142135623730951 / 2.0;

    #ifdef IS_SMALL
        float alpha = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDist);
    #else
        float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
    #endif

    // Strokes
    // Outset
    float sigDistOutset = sigDist + uStrokeOutsetWidth * 0.5;

    // Inset
    float sigDistInset = sigDist - uStrokeInsetWidth * 0.5;

    #ifdef IS_SMALL
        float outset = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistOutset);
        float inset = 1.0 - smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistInset);
    #else
        float outset = clamp(sigDistOutset / fwidth(sigDistOutset) + 0.5, 0.0, 1.0);
        float inset = 1.0 - clamp(sigDistInset / fwidth(sigDistInset) + 0.5, 0.0, 1.0);
    #endif

    // Border
    float border = outset * inset;

    // Alpha Test
    if (alpha < uAlphaTest) discard;

    // Output: Common
    vec4 filledFragColor = vec4(uColor, uOpacity * alpha);

    // Output: Strokes
    vec4 strokedFragColor = vec4(uStrokeColor, uOpacity * border);

    vec4 colorA = vec4(1.0, 1.0, 1.0, border);
    vec4 colorB = vec4(0.0, 0.0, 1.0, border * 0.75);
    vec4 colorC = vec4(0.0, 1.0, 0.0, border * 0.75);
    vec4 colorD = vec4(1.0, 0.0, 0.0, border * 0.75);
    vec4 colorE = vec4(1.0, 1.0, 1.0, border);

    vec4 layerA = mix(colorA, colorB, mixA);
    vec4 layerB = mix(layerA, colorC, mixB);
    vec4 layerC = mix(layerB, colorD, mixC);
    vec4 layerD = mix(layerC, colorE, mixD);

    gl_FragColor = filledFragColor;
    // gl_FragColor = vec4(1.0, 1.0, 1.0, border );
    gl_FragColor = layerD;
}