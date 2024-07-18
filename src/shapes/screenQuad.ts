import * as THREE from "three";
import type { Base } from "../base/base";
import { Component } from "../components/component";
import { UniformInjector } from "../components/uniformInjector";

/**
 * 平面配置接口，定义了屏幕四边形的着色器和统一变量。
 */
export interface PlaneConfig {
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [uniform: string]: THREE.IUniform<any> };
  shadertoyMode: boolean;
}

// 默认的顶点着色器，用于屏幕四边形的基本几何形状定义。
const defaultVertexShader = /* glsl */ `
varying vec2 vUv;
void main(){
   vec3 p=position;
   gl_Position=vec4(p,1.);

   vUv=uv;
}
`;

// 默认的片段着色器，用于屏幕四边形的基本颜色渲染。
const defaultFragmentShader = /* glsl */ `
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
varying vec2 vUv;
void main(){
   vec2 p=vUv;
   vec3 color=vec3(p,0.);
   gl_FragColor=vec4(color,1.);
}
`;

// ShaderToy模式的前置附加代码，包含了一系列统一变量，用于ShaderToy风格的着色器编写。
const shadertoyPrepend = /* glsl */ `
uniform float iGlobalTime;
uniform float iTime;
uniform float iTimeDelta;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform int iFrame;
uniform vec4 iDate;
uniform float iSampleRate;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
uniform samplerCube iChannel0Cube;
uniform samplerCube iChannel1Cube;
uniform samplerCube iChannel2Cube;
uniform samplerCube iChannel3Cube;
uniform float iChannelTime[4];
`;

// ShaderToy模式的后置附加代码，定义了主要图像渲染函数的调用方式。
const shadertoyAppend = /* glsl */ `
varying vec2 vUv;
void main(){
   mainImage(gl_FragColor,vUv*iResolution.xy);
}
`;

/**
 * ScreenQuad类继承自Component，用于创建一个覆盖整个屏幕的四边形，并在其上渲染自定义的着色器效果。
 * 支持ShaderToy模式，可以通过配置切换到该模式并使用额外的统一变量。
 */
class ScreenQuad extends Component {
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  uniformInjector: UniformInjector;

  constructor(base: Base, config: Partial<PlaneConfig> = {}) {
    super(base);
    // 解构并设置默认值 for 配置参数。
    const {
      vertexShader = defaultVertexShader,
      fragmentShader = defaultFragmentShader,
      uniforms = {},
      shadertoyMode = false,
    } = config;

    // 根据是否启用ShaderToy模式，合并着色器代码。
    const finalFragmentShader = shadertoyMode
      ? `
   ${shadertoyPrepend}
   ${fragmentShader}
   ${shadertoyAppend}
   `
      : fragmentShader;

    // 初始化UniformInjector，用于注入额外的统一变量。
    const uniformInjector = new UniformInjector(base);
    this.uniformInjector = uniformInjector;

    // 创建一个二维平面几何体，并配置着色器材料。
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: finalFragmentShader,
      uniforms: {
        ...uniformInjector.shadertoyUniforms,
        ...uniforms,
      },
      side: THREE.DoubleSide,
    });

    this.material = material;
    const mesh = new THREE.Mesh(geometry, material);
    this.mesh = mesh;
  }

  /**
   * 将四边形网格添加到场景中。
   */
  addExisting(): void {
    this.container.add(this.mesh);
  }

  /**
   * 更新着色器材料中的统一变量。
   * @param time 当前时间，用于更新统一变量。
   */
  update(time: number): void {
    const uniforms = this.material.uniforms;
    this.uniformInjector.injectShadertoyUniforms(uniforms);
  }
}

export { ScreenQuad };