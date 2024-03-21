// Attribute
attribute vec2 layoutUv;

// attribute float lineIndex;

attribute float lineLettersTotal;
// attribute float lineLetterIndex;

// attribute float lineWordsTotal;
// attribute float lineWordIndex;

// attribute float wordIndex;

// attribute float letterIndex;

// add Attribute
attribute vec3 position1;
attribute vec2 uv1_;

attribute vec3 position2;
attribute vec2 uv2_;

attribute vec3 position3;
attribute vec2 uv3_;

attribute vec3 position4;
attribute vec2 uv4_;

attribute vec3 position5;
attribute vec2 uv5_;


// Varyings
varying vec2 vUv;
varying vec2 vLayoutUv;

varying vec3 vViewPosition;
varying vec3 vNormal;

varying float vLineIndex;

varying float vLineLettersTotal;
varying float vLineLetterIndex;

varying float vLineWordsTotal;
varying float vLineWordIndex;

varying float vWordIndex;

varying float vLetterIndex;

// add Varying
varying vec2 vUv1;
varying vec2 vLayoutUv1;

varying vec2 vUv2;
varying vec2 vLayoutUv2;

varying vec2 vUv3;
varying vec2 vLayoutUv3;

varying vec2 vUv4;
varying vec2 vLayoutUv4;

varying vec2 vUv5;
varying vec2 vLayoutUv5;

// add Uniform
uniform float uWidth;
uniform float uHeight;

uniform float uWidth1;
uniform float uHeight1;

uniform float uWidth2;
uniform float uHeight2;

uniform float uWidth3;
uniform float uHeight3;

uniform float uWidth4;
uniform float uHeight4;

uniform float uWidth5;

uniform float uProgress0;
uniform float uProgress1;
uniform float uProgress2;
uniform float uProgress3;
uniform float uProgress4;
uniform float uProgress5;
uniform float uProgress6;



void main() {
    // Mix
    vec3 _pos = mix(position, position1, uProgress1);
    _pos.x = _pos.x + (uWidth - uWidth1) / 2. * uProgress1;

    _pos = mix(_pos, position2, uProgress2);
    _pos.x = _pos.x + (uWidth - uWidth2) / 2. * uProgress2;

    _pos = mix(_pos, position3, uProgress3);
    _pos.x = _pos.x + (uWidth - uWidth3) / 2. * uProgress3;

    _pos = mix(_pos, position4, uProgress4);
    _pos.x = _pos.x + (uWidth - uWidth4) / 2. * uProgress4;

    _pos = mix(_pos, position5, uProgress5);
    _pos.x = _pos.x + (uWidth - uWidth5) / 2. * uProgress5;

    _pos = mix(_pos, position, uProgress6);
    _pos.x = _pos.x;

    // Output
    vec4 mvPosition = vec4(_pos, 1.0);
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;

    // Varyings
    vUv = uv;
    vUv1 = uv1_;
    vUv2 = uv2_;
    vUv3 = uv3_;
    vUv4 = uv4_;
    vUv5 = uv5_;
    vLayoutUv = layoutUv;
    vViewPosition = -mvPosition.xyz;
    // vNormal = normal;

    // vLineIndex = lineIndex;

    vLineLettersTotal = lineLettersTotal;
    // vLineLetterIndex = lineLetterIndex;

    // vLineWordsTotal = lineWordsTotal;
    // vLineWordIndex = lineWordIndex;

    // vWordIndex = wordIndex;

    // vLetterIndex = letterIndex;
}