// msdf font generator
// https://msdf-bmfont.donmccurdy.com/

// library
// https://github.com/leochocolat/three-msdf-text-utils

float median(float r, float g, float b) { // msdfの中央値を求める
    return max(
        min(r, g),
        min(max(r, g), b)
    );
}

float sdf2alpha(float sdf) {
    const float THRESHOLD = 0.5;
    const float BLUR_RADIUS = 0.01;

    float alpha = smoothstep(
        THRESHOLD - BLUR_RADIUS,
        THRESHOLD + BLUR_RADIUS,
        sdf
    );

    return alpha;
}