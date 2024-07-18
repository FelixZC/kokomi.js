import * as THREE from "three";
import { Component } from "./component";
import { Base } from "../base/base";
import {
  GPUComputationRenderer,
  type Variable,
} from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { UniformInjector } from "./uniformInjector";

/**
 * GPU计算器配置接口
 */
export interface GPUComputerConfig {
  width: number; // 宽度
  height: number; // 高度
}

/**
 * GPU计算器类
 * 用于通过GPU进行计算任务的封装
 */
class GPUComputer extends Component {
  gpu: GPUComputationRenderer; // GPU计算渲染器
  uj: UniformInjector; // 统一注入器，用于处理统一变量的注入

  /**
   * 构造函数
   * @param base 基础设施对象，提供渲染器等资源
   * @param config GPU计算器的配置，包括宽度和高度
   */
  constructor(base: Base, config: Partial<GPUComputerConfig> = {}) {
    super(base);
    // 解构配置参数，设置默认值
    const { width = 128, height = 128 } = config;
    // 初始化GPU计算渲染器
    // gpu
    const gpu = new GPUComputationRenderer(width, height, base.renderer);
    this.gpu = gpu;
    // 初始化统一变量注入器
    const uj = new UniformInjector(this.base);
    this.uj = uj;
  }

  /**
   * 创建一个新的纹理
   * @returns 创建的纹理对象
   */
  createTexture() {
    return this.gpu.createTexture();
  }

  /**
   * 创建一个计算变量
   * @param name 变量名
   * @param computeShader 计算着色器代码
   * @param texture 关联的纹理
   * @param uniforms 需要注入的统一变量
   * @returns 创建的计算变量
   */
  createVariable(
    name: string,
    computeShader: string,
    texture: THREE.DataTexture,
    uniforms: { [uniform: string]: THREE.IUniform },
  ) {
    const variable = this.gpu.addVariable(name, computeShader, texture);
    // 设置纹理的包裹方式
    variable.wrapS = THREE.RepeatWrapping;
    variable.wrapT = THREE.RepeatWrapping;
    // 合并注入的统一变量和自定义统一变量
    variable.material.uniforms = {
      ...variable.material.uniforms,
      ...this.uj.shadertoyUniforms,
      ...uniforms,
    };
    return variable;
  }

  /**
   * 设置计算变量的依赖关系
   * @param variable 需要设置依赖的计算变量
   * @param dependencies 变量的依赖列表
   */
  setVariableDependencies(variable: Variable, dependencies: Variable[] | null) {
    this.gpu.setVariableDependencies(variable, dependencies);
  }

  /**
   * 初始化GPU计算渲染器
   */
  init() {
    this.gpu.init();
  }

  /**
   * 更新计算状态
   * @param time 当前时间，用于更新统一变量
   */
  update(time: number): void {
    // 获取所有计算变量
    const variables = (this.gpu as any).variables as Variable[];
    if (variables) {
      // 遍历变量，注入统一变量
      variables.forEach((variable) => {
        this.uj.injectShadertoyUniforms(variable.material.uniforms);
      });
    }
    // 执行计算
    this.gpu.compute();
  }

  /**
   * 获取计算变量对应的渲染目标纹理
   * @param variable 计算变量
   * @returns 对应的纹理对象
   */
  getVariableRt(variable: Variable) {
    return this.gpu.getCurrentRenderTarget(variable).texture;
  }
}

export { GPUComputer };