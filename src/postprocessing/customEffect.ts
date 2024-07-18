import * as THREE from "three";
import { EffectComposer, RenderPass, ShaderPass } from "three-stdlib";
import type { Base } from "../base/base";
import { Component } from "../components/component";
import { UniformInjector } from "../components/uniformInjector";
/**
 * 定义自定义效果的配置接口。
 * 包括顶点着色器、片段着色器和统一变量的定义。
 */
export interface CustomEffectConfig {
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [uniform: string]: THREE.IUniform<any> };
}
// 默认的顶点着色器，用于处理基本的几何体渲染位置。
const defaultVertexShader = /* glsl */ `...`;
// 默认的片段着色器，用于处理基本的纹理映射。
const defaultFragmentShader = /* glsl */ `...`;
/**
 * 自定义效果类，继承自Component。
 * 通过提供顶点着色器、片段着色器和统一变量的配置，实现特定的后期处理效果。
 */
class CustomEffect extends Component {
  composer: EffectComposer;
  customPass: ShaderPass;
  uniformInjector: UniformInjector;
  /**
   * 创建一个自定义效果实例。
   * @param base 基础对象，包含渲染器、场景和相机等信息。
   * @param config 自定义效果的配置，包括着色器代码和统一变量。
   */
  constructor(base: Base, config: Partial<CustomEffectConfig> = {}) {
    super(base);
    // 解构配置，设置默认值。
    const {
      vertexShader = defaultVertexShader,
      fragmentShader = defaultFragmentShader,
      uniforms = {},
    } = config;
    // 初始化效果，用于管理多个渲染 pass。
    const composer = new EffectComposer(base.renderer);
    this.composer = composer;
    // 添加渲染 pass，用于常规场景的渲染。
    const renderPass = new RenderPass(base.scene, base.camera);
    composer.addPass(renderPass);
    // 初始化统一变量注入器，用于向着色器注入额外的统一变量。
    const uniformInjector = new UniformInjector(base);
    this.uniformInjector = uniformInjector;
    // 创建自定义着色器 pass，用于应用自定义的着色器效果。
    const customPass = new ShaderPass({
      vertexShader,
      fragmentShader,
      uniforms: {
        ...{
          tDiffuse: {
            value: null,
          },
        },
        ...uniformInjector.shadertoyUniforms,
        ...uniforms,
      },
    });
    this.customPass = customPass;
    customPass.renderToScreen = true;
    composer.addPass(customPass);
  }
  /**
   * 将当前的效果混合器赋值给基类，使基类能够通过composer进行渲染。
   */
  addExisting(): void {
    this.base.composer = this.composer;
  }
  /**
   * 更新统一变量，特别是时间变量，以实现动画效果。
   * @param time 当前时间，用于更新统一变量中的时间值。
   */
  update(time: number): void {
    const uniforms = this.customPass.uniforms;
    this.uniformInjector.injectShadertoyUniforms(uniforms);
  }
}
export { CustomEffect };
