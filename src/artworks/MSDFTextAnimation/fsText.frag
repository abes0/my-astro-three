// Varyings
              varying vec2 vUv;
              varying vec2 vLayoutUv;
      
              // Uniforms: Common
              uniform float uOpacity;
              uniform float uThreshold;
              uniform float uAlphaTest;
              uniform vec3 uColor;
              uniform sampler2D uMap;
              uniform float uProgress1;
              uniform float uProgress2;
              uniform float uProgress3;
              uniform float uProgress4;
      
              // Uniforms: Strokes
              uniform vec3 uStrokeColor;
              uniform float uStrokeOutsetWidth;
              uniform float uStrokeInsetWidth;
      
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

              float getPattern(vec2 uv, vec2 scale) {
                float x = floor(uv.x * scale.x);
                float y = floor(uv.y * scale.y);
                float pattern = noise(vec2(x, y));
                return pattern;
              }

              float getMixProgress(vec2 uv, float progress, float range, float pattern) {
                float p = progress;
                p = map(p, range, 1.0, 0.0, 1.0);
                p = smoothstep(p, p + range, uv.x);
                float mix_ = 2.0 * p - (pattern);
                mix_ = clamp(mix_, 0., 1.);

                return 1.0 - mix_;
              }
      
              void main() {
                  // Common
                  // Texture sample
                  vec3 s = texture2D(uMap, vUv).rgb;
      
                  // Signed distance
                  float sigDist = median(s.r, s.g, s.b) - 0.5;
      
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
                  float sigDistInset = sigDist - uStrokeInsetWidth * 0.2;
      
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

                  // float p1 = transition(vUv, uProgress);

                  vec3 pink = vec3(0.834, 0.066, 0.780);

                  vec4 color0 = vec4(0.0, 0.0, 0.0, 0.0);
                  vec4 color1 = vec4(1.0, 1.0, 1.0, border);
                  vec4 color2 = vec4(pink, border);
                  vec4 color3 = vec4(pink, 1.);
                  vec4 color4 = vec4(1.0, 1.0, 1.0, 1.0);

                  float pattern = getPattern(vLayoutUv, vec2(7.0, 3.0));

                  float range = 0.4;

                  float mix1 = getMixProgress(vLayoutUv, uProgress1, range, pattern);
                  float mix2 = getMixProgress(vLayoutUv, uProgress2, range, pattern);
                  float mix3 = getMixProgress(vLayoutUv, uProgress3, range, pattern);
                  float mix4 = getMixProgress(vLayoutUv, uProgress4, range, pattern);

                  vec4 layer1 = mix(color0, color1, mix1);
                  vec4 layer2 = mix(layer1, color2, mix2);
                  vec4 layer3 = mix(layer2, color3, mix3);
                  vec4 layer4 = mix(layer3, color4, mix4);


                  gl_FragColor = filledFragColor;
                  gl_FragColor = vec4(1.0 , 0.0, 0.0, border );
                  gl_FragColor = vec4(vec3(pattern), 1.0 );;
                  gl_FragColor = layer4;
                  // gl_FragColor = vec4(vLayoutUv, 0., 1.0 );
                  // gl_FragColor = vec4(vUv, 0., 1.0 );
              }