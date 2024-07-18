// 定义全局统一变量，用于存储时间信息
uniform float iTime;

// 定义全局统一变量，用于存储渲染目标的分辨率
uniform vec2 iResolution;

// 定义全局统一变量，用于存储鼠标位置信息
uniform vec2 iMouse;

// 定义varying变量，用于传递纹理坐标到片段着色器
varying vec2 vUv;

// 主着色器函数
void main(){
    // 使用局部变量p存储顶点位置
    vec3 p=position;
    
    // 将顶点位置p赋值给定制的着色器属性csm_Position
    csm_Position=p;
    
    // 将纹理坐标uv赋值给varying变量vUv，以便在片段着色器中使用
    vUv=uv;
}