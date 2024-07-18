import * as THREE from "three";
import type { Base } from "../base/base";
import { Component } from "../components/component";
export interface FBOConfig {
  width: number;
  height: number;
  samples: number;
  depth: boolean;
  options: THREE.RenderTargetOptions;
}
/**
 * FBO类用于管理帧缓冲对象（Frame Buffer Object），这是Three.js渲染器中一个重要的部分，
 * 它允许我们离屏渲染，即渲染到一个纹理而不是屏幕。
· * @extends Component 继承自组件基类，提供帧缓冲对象的配置和管理功能。
 */
class FBO extends Component {
  /**
   * 帧缓冲对象的宽度，可选。
   */
  width?: number;
  /**
   * 帧缓冲对象的高度，可选。
   */
  height?: number;
  /**
   * WebGL渲染目标对象，用于实际的离屏渲染。
   */
  rt: THREE.WebGLRenderTarget;

  /**
   * 创建一个FBO对象。
   * 
   * @param base 基础对象，提供底层的渲染器和场景等资源。
   * @param config 配置对象，用于定制帧缓冲对象的属性。
   */
  constructor(base: Base, config: Partial<FBOConfig> = {}) {
    super(base);
    // 解构配置参数，并提供默认值
    const { width, height, samples = 0, depth = false, options = {} } = config;
    this.width = width;
    this.height = height;
    // 创建WebGLRenderTarget对象，用于离屏渲染
    const rt = new THREE.WebGLRenderTarget(
      this.actualWidth,
      this.actualHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        type: THREE.HalfFloatType,
        ...options,
      },
    );
    this.rt = rt;
    // 根据配置，为帧缓冲对象添加深度纹理
    if (depth) {
      rt.depthTexture = new THREE.DepthTexture(
        this.actualWidth,
        this.actualHeight,
        THREE.FloatType,
      );
    }
    // 根据配置，设置多采样抗锯齿
    if (samples) {
      rt.samples = samples;
    }
    // 监听窗口大小改变事件，以调整帧缓冲对象的大小
    this.base.resizer.on("resize", () => {
      this.rt.setSize(this.actualWidth, this.actualHeight);
    });
  }

  /**
   * 获取实际的宽度，如果未指定，则使用窗口的设备像素比计算得到。
   * 
   * @returns 实际的宽度。
   */
  get actualWidth() {
    return this.width || window.innerWidth * window.devicePixelRatio;
  }

  /**
   * 获取实际的高度，如果未指定，则使用窗口的设备像素比计算得到。
   * 
   * @returns 实际的高度。
   */
  get actualHeight() {
    return this.height || window.innerHeight * window.devicePixelRatio;
  }
}

export { FBO };