import * as THREE from "three";
import type { Base } from "../base/base";
import { Component } from "../components/component";
import CameraControlsImpl from "camera-controls";
/**
 * 是对 https://github.com/yomotsu/camera-controls 的封装。
 * CameraControls 类，用于管理相机控制功能。
 * 它扩展了 Component 类，表明它是一个可附加到基础对象上的组件。
 * 内部使用 CameraControlsImpl 处理具体相机控制逻辑。
 */
class CameraControls extends Component {
  controls: CameraControlsImpl;
  /**
   * CameraControls 类的构造函数。
   * @param base 相机控制所依附的基础对象，需要相机和渲染器的 DOM 元素进行初始化。
   */
  constructor(base: Base) {
    super(base);
    // 安装 camera-controls 模块，传入 Three.js 库中的 THREE 对象。
    CameraControlsImpl.install({ THREE });
    // 初始化相机控制，传入基础对象的相机和渲染器的 DOM 元素。
    const controls = new CameraControlsImpl(
      base.camera,
      base.renderer.domElement,
    );
    this.controls = controls;
  }
  /**
   * 更新相机控制状态。
   * 此方法应在游戏中每一帧的循环中被调用，以根据用户输入更新相机的位置和方向。
   * @param time 当前时间，通常是从上一帧到现在经过的时间，用于计算运动平滑的增量时间。
   */
  update(time: number): void {
    this.controls.update(this.base.clock.deltaTime);
  }
}
export { CameraControls };
