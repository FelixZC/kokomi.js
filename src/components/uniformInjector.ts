import * as THREE from "three";
import { Component } from "./component";
import { Base } from "../base/base";

/**
 * UniformInjector类继承自Component，用于为ShaderToy注入统一变量。
 * 它初始化并管理一系列与时间、分辨率、鼠标状态等相关的统一变量，这些变量在Shader中常用。
 */
class UniformInjector extends Component {
  /* 存储ShaderToy使用的统一变量 */
  shadertoyUniforms: { [key: string]: THREE.IUniform<any> };

  /**
   * 构造函数初始化UniformInjector。
   * @param base 组件的基础对象，提供clock和iMouse等服务。
   */
  constructor(base: Base) {
    super(base);
    this.shadertoyUniforms = {
      iGlobalTime: {
        value: 0,
      },
      iTime: {
        value: 0,
      },
      iTimeDelta: {
        value: 0,
      },
      iResolution: {
        value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1),
      },
      iMouse: {
        value: new THREE.Vector4(0, 0, 0, 0),
      },
      iFrame: {
        value: 0,
      },
      iDate: {
        value: new THREE.Vector4(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          new Date().getDate(),
          new Date().getHours(),
        ),
      },
      iSampleRate: {
        value: 44100,
      },
      iChannelTime: {
        value: [0, 0, 0, 0],
      },
    };
  }

  /**
   * 注入与时间、分辨率、鼠标等相关的统一变量到Shader中。
   * 此方法应定期调用，以更新统一变量的值。
   * @param uniforms 可选参数，允许外部定义统一变量的集合。如果不提供，则使用类内部的默认统一变量。
   */
  injectShadertoyUniforms(
    uniforms: { [key: string]: THREE.IUniform<any> } = this.shadertoyUniforms,
  ) {
    /* 获取自场景开始以来的经过时间，用于更新iGlobalTime和iTime */
    const t = this.base.clock.elapsedTime;
    uniforms.iGlobalTime.value = t;
    uniforms.iTime.value = t;
    /* 获取最近一次渲染到当前渲染的时间间隔，用于更新iTimeDelta */
    const delta = this.base.clock.deltaTime;
    uniforms.iTimeDelta.value = delta;
    /* 更新屏幕分辨率的统一变量 */
    uniforms.iResolution.value = new THREE.Vector3(
      window.innerWidth,
      window.innerHeight,
      1,
    );
    /* 更新鼠标位置的统一变量 */
    const { x, y } = this.base.iMouse.mouse;
    uniforms.iMouse.value = new THREE.Vector4(x, y, 0, 0);
    /* 更新日期的统一变量 */
    uniforms.iDate.value = new THREE.Vector4(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate(),
      new Date().getHours(),
    );
    /* 更新每个通道的播放时间 */
    uniforms.iChannelTime.value = [t, t, t, t];
    /* 增加帧数 */
    uniforms.iFrame.value += 1;
  }
}

export { UniformInjector };