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
 * 定义自定义网格配置接口。
 * 这些配置用于创建具有自定义着色器的THREE.Mesh对象。
 */
export interface CustomMeshConfig {
  geometry: THREE.BufferGeometry;
  baseMaterial: THREE.Material;
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [uniform: string]: THREE.IUniform<any> };
  patchMap: CSMPatchMap;
  materialParams: AllMaterialParams;
}
/**
 * 默认的顶点着色器代码。
 * 提供了基本的变量设置和传递给片段着色器的UV坐标。
 */
const defaultVertexShader = /* glsl */ `...`;
/**
 * 默认的片段着色器代码。
 * 提供了基本的变量设置和产生颜色输出的逻辑。
 */
const defaultFragmentShader = /* glsl */ `...`;
/**
 * CustomMesh类继承自Component，用于创建具有自定义着色器的三维网格对象。
 * 它封装了THREE.Mesh的创建和管理过程，支持通过配置自定义着色器的各种参数。
 */
/**
 * It contains a `THREE.Mesh` object in which you can custom its base material (which is based on [THREE-CustomShaderMaterial](https://github.com/FarazzShaikh/THREE-CustomShaderMaterial)). Also, it provides all the shadertoy uniforms.
 *
 * Demo: https://kokomi-js.vercel.app/examples/#customMesh
 */
class CustomMesh extends Component {
  material: CustomShaderMaterial;
  mesh: THREE.Mesh;
  uniformInjector: UniformInjector;
  /**
   * CustomMesh类的构造函数。
   * @param base 父基类，通常是一个场景或容器对象。
   * @param config 自定义网格的配置对象，可以部分配置。
   */
  constructor(base: Base, config: Partial<CustomMeshConfig> = {}) {
    super(base);
    // 解构并设置默认值 for the config
    const {
      geometry = new THREE.PlaneGeometry(1, 1, 16, 16),
      baseMaterial = new THREE.ShaderMaterial(),
      vertexShader = defaultVertexShader,
      fragmentShader = defaultFragmentShader,
      uniforms = {},
      patchMap = {},
      materialParams = {},
    } = config;
    // 创建uniforms注入器，用于管理shadertoy统一变量
    const uniformInjector = new UniformInjector(base);
    this.uniformInjector = uniformInjector;
    // 创建自定义着色器材料，合并统一变量和参数
    const material = new CustomShaderMaterial({
      baseMaterial,
      vertexShader,
      fragmentShader,
      uniforms: {
        ...uniformInjector.shadertoyUniforms,
        ...uniforms,
      },
      patchMap,
      ...materialParams,
    });
    this.material = material;
    // 创建网格对象，并使用自定义着色器材料
    const mesh = new THREE.Mesh(geometry, material);
    this.mesh = mesh;
  }
  /**
   * 将网格对象添加到其父容器中。
   */
  addExisting(): void {
    this.container.add(this.mesh);
  }
  /**
   * 更新网格的着色器统一变量。
   * @param time 当前时间，用于更新动画相关的统一变量。
   */
  update(time: number): void {
    const uniforms = this.material.uniforms;
    this.uniformInjector.injectShadertoyUniforms(uniforms);
  }
}
export { CustomMesh };
