import * as THREE from "three";
import type { Base } from "../base/base";
import { Component } from "../components/component";
import {
  CustomShaderMaterial,
  AllMaterialParams,
  CSMPatchMap,
} from "../lib/THREE-CustomShaderMaterial";
import { UniformInjector } from "../components/uniformInjector";

/**
 * 自定义点材质配置接口。
 * 描述了用于创建自定义点材质的必要参数。
 */
export interface CustomPointsConfig {
  geometry: THREE.BufferGeometry;
  baseMaterial: THREE.Material;
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [uniform: string]: THREE.IUniform<any> };
  patchMap: CSMPatchMap;
  materialParams: AllMaterialParams;
}

// 默认的顶点着色器，用于处理点的位置和大小
const defaultVertexShader = /* glsl */ `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
varying vec2 vUv;
uniform float uPointSize;
void main(){
   vec3 p=position;
   csm_Position=p;
   gl_PointSize=uPointSize;
   vUv=uv;
}
`;

// 默认的片段着色器，用于处理点的颜色
const defaultFragmentShader = /* glsl */ `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
varying vec2 vUv;
void main(){
   vec2 p=vUv;
   vec3 col=vec3(p,0.);

   csm_DiffuseColor=vec4(col,1.);
}
`;

/**
 * CustomPoints 类继承自 Component，用于创建和管理具有自定义着色器的 THREE.Points 对象。
 * 它通过组合传入的几何形状、材质参数、着色器代码等来初始化自定义点材质和 THREE.Points 对象。
 */
class CustomPoints extends Component {
  material: CustomShaderMaterial;
  points: THREE.Points;
  uniformInjector: UniformInjector;

  /**
   * CustomPoints 类的构造函数。
   * @param base 基础对象，提供全局共享的服务或属性。
   * @param config 配置对象，用于初始化自定义点的各种参数。
   */
  constructor(base: Base, config: Partial<CustomPointsConfig> = {}) {
    super(base);
    // 解构并设置默认值 for 配置参数
    const {
      geometry = new THREE.PlaneGeometry(1, 1, 16, 16),
      baseMaterial = new THREE.ShaderMaterial(),
      vertexShader = defaultVertexShader,
      fragmentShader = defaultFragmentShader,
      uniforms = {},
      patchMap = {},
      materialParams = {},
    } = config;

    // 初始化 UniformInjector，用于注入额外的统一变量
    const uniformInjector = new UniformInjector(base);
    this.uniformInjector = uniformInjector;

    // 创建自定义着色器材质
    const material = new CustomShaderMaterial({
      baseMaterial,
      vertexShader,
      fragmentShader,
      uniforms: {
        ...uniformInjector.shadertoyUniforms,
        ...{
          uPointSize: {
            value: 10,
          },
        },
        ...uniforms,
      },
      patchMap,
      ...materialParams,
    });

    this.material = material;

    // 创建 THREE.Points 对象并应用自定义材质
    const points = new THREE.Points(geometry, material);
    this.points = points;
  }

  /**
   * 将点对象添加到容器中。
   * 用于在场景或相机等容器中显示点。
   */
  addExisting(): void {
    this.container.add(this.points);
  }

  /**
   * 更新自定义点材质的统一变量。
   * 此方法通常在每一帧中调用，以更新与时间、鼠标位置等相关的统一变量。
   * @param time 当前时间，用于动画效果。
   */
  update(time: number): void {
    const uniforms = this.material.uniforms;
    this.uniformInjector.injectShadertoyUniforms(uniforms);
  }
}

export { CustomPoints };