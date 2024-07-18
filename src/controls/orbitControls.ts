import type { Base } from "../base/base";
import { Component } from "../components/component";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
/**
 * OrbitControls类提供了三维场景中相机的轨道控制功能。
 * 它继承自Component类，为基于Three.js的项目提供了便捷的相机操作。
 *
 * @extends Component 组件基类
 */
export interface OrbitControlsConfig {
  /**
   * 启用阻尼效果。阻尼会让相机的移动更加平滑自然，类似于物理中的摩擦力。
   */
  enableDamping: boolean;
}
/**
 * A drop-in orbitControls
 */
class OrbitControls extends Component {
  controls: OrbitControlsImpl;
  /**
   * 创建一个OrbitControls实例。
   *
   * @param base 基类实例，通常包含相机和渲染器等核心组件。
   * @param config 控制行为的配置对象，其中enableDamping用于启用或禁用阻尼效果。
   */
  constructor(base: Base, config: Partial<OrbitControlsConfig> = {}) {
    super(base);
    // 解构配置对象，并设置默认值为true
    const { enableDamping = true } = config;
    // 初始化OrbitControlsImpl实例，绑定到相机和渲染器的DOM元素
    const controls = new OrbitControlsImpl(
      base.camera,
      base.renderer.domElement,
    );
    this.controls = controls;
    // 启用或禁用阻尼效果
    controls.enableDamping = enableDamping;
  }
  /**
   * 更新控制状态。通常在渲染循环中调用，以确保控制的平滑运动。
   *
   * @param time 当前时间，用于更新动态效果，如阻尼。
   */
  update(time: number): void {
    this.controls.update();
  }
}
export { OrbitControls };
