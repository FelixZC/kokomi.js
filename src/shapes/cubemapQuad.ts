import * as THREE from "three";
import type { Base } from "../base/base";
import { PlaneConfig, ScreenQuad } from "./screenQuad";

// 定义用于立方体贴图着色器的uniform变量，包括视口大小和角落坐标
const cubemapShaderUniforms = /* glsl */ `
uniform vec2 unViewport;
uniform vec3 unCorners[5];
`;

// 立方体贴图着色器的主要部分，计算像素颜色
const cubemapShaderMain = /* glsl */ `
void main()
{
   vec4 color=vec4(0.,0.,0.,1.);
   vec3 ro=vec3(0.);
   vec2 uv=gl_FragCoord.xy/unViewport.xy;
   vec3 rd=normalize(mix(mix(unCorners[0],unCorners[1],uv.x),mix(unCorners[3],unCorners[2],uv.x),uv.y)-ro);
   mainCubemap(color,gl_FragCoord.xy,ro,rd);
   gl_FragColor=color;
}
`;

/**
 * 立方体贴图屏幕四边形类。
 * 此类行为类似于Shadertoy中的CubemapA，用于渲染立方体贴图。
 *
 * @param base {Base} - 应用的基础环境对象。
 * @param config {Partial<PlaneConfig>} - 屏幕四边形的配置对象，默认为空对象。
 */
class CubemapQuad extends ScreenQuad {
  constructor(base: Base, config: Partial<PlaneConfig> = {}) {
    super(base, {
      ...config,
      // 合并自定义片段着色器代码与立方体贴图所需uniforms和main函数
      fragmentShader: `
     ${cubemapShaderUniforms}
     ${config.fragmentShader}
     ${cubemapShaderMain}
     `,
      uniforms: {
        // 视口大小的uniform变量
        unViewport: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        // 立方体贴图角落坐标uniform变量
        unCorners: {
          value: [1, 1, 1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 0, 0, 0], // 修正了注释中的坐标表示，实际数组应对应立方体贴图坐标
        },
      },
    });
  }
}

export { CubemapQuad };