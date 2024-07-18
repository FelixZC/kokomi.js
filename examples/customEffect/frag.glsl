// Uniform变量，用于接受外部输入的数据
uniform float iTime; // 时间统一变量
uniform vec2 iResolution; // 屏幕分辨率统一变量
uniform vec2 iMouse; // 鼠标位置统一变量

uniform sampler2D tDiffuse; // 纹理采样器统一变量

varying vec2 vUv; // 带到片段着色器的UV坐标

uniform float uRGBShift; // RGB偏移量控制统一变量

// 通过不同UV坐标采样纹理来实现RGB分离 shift效果的函数
vec4 RGBShift(sampler2D t, vec2 rUv, vec2 gUv, vec2 bUv) {
    // 采样红色、绿色和蓝色通道
    vec4 color1 = texture(t, rUv);
    vec4 color2 = texture(t, gUv);
    vec4 color3 = texture(t, bUv);
    // 组合红色、绿色、蓝色和透明度通道
    vec4 color = vec4(color1.r, color2.g, color3.b, color2.a);
    return color;
}

// 生成高精度随机数的函数
highp float random(vec2 co) {
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt = dot(co.xy, vec2(a, b));
    highp float sn = mod(dt, 3.14);
    return fract(sin(sn) * c);
}

void main() {
    vec2 p = vUv; // 当前片段的UV坐标
    
    vec4 col = vec4(0.); // 初始化颜色变量
    
    // 应用RGB偏移效果
    // RGB Shift
    float n = random(p + mod(iTime, 1.)) * .1 + .5;
    vec2 offset = vec2(cos(n), sin(n)) * .0025 * uRGBShift;
    vec2 rUv = p + offset;
    vec2 gUv = p;
    vec2 bUv = p - offset;
    col = RGBShift(tDiffuse, rUv, gUv, bUv);
    
    gl_FragColor = col; // 设置最终渲染的颜色
}