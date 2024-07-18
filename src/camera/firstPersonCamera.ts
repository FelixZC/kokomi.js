import * as THREE from "three";
import type { Base } from "../base/base";
import { Component } from "../components/component";
/**
 * 第一人称摄像机控制类，用于管理摄像机的旋转和移动。
 * 通过鼠标和键盘输入来调整摄像机的位置和朝向。
 *
 * @extends Component 组件基类
 */
export interface FirstPersonCameraConfig {
  camera: THREE.Camera;
  phiSpeed: number;
  thetaSpeed: number;
  translation: THREE.Vector3;
  forwardSpeed: number;
  leftSpeed: number;
}
class FirstPersonCamera extends Component {
  camera: THREE.Camera;
  rotation: THREE.Quaternion;
  phi: number;
  theta: number;
  phiSpeed: number;
  thetaSpeed: number;
  rotationEnabled: boolean;
  translation: THREE.Vector3;
  forwardSpeed: number;
  leftSpeed: number;
  translationEnabled: boolean;
  /**
   * 创建一个第一人称摄像机实例。
   *
   * @param base 基类实例，提供全局共享的服务和状态。
   * @param config 摄像机的配置参数，包括初始摄像机、旋转速度、移动速度等。
   */
  constructor(base: Base, config: Partial<FirstPersonCameraConfig> = {}) {
    super(base);
    // 解构配置参数，并提供默认值
    const {
      camera = this.base.camera,
      phiSpeed = 8,
      thetaSpeed = 5,
      translation = new THREE.Vector3(0, 2, 0),
      forwardSpeed = 1,
      leftSpeed = 1,
    } = config;
    // 初始化摄像机和其他属性
    this.camera = camera;
    this.rotation = new THREE.Quaternion();
    this.phi = 0;
    this.theta = 0;
    this.phiSpeed = phiSpeed;
    this.thetaSpeed = thetaSpeed;
    this.rotationEnabled = true;
    this.translation = translation;
    this.forwardSpeed = forwardSpeed;
    this.leftSpeed = leftSpeed;
    this.translationEnabled = true;
  }
  /**
   * 更新摄像机的状态，包括旋转和移动。
   *
   * @param time 当前时间，用于计算dt。
   */
  update(time: number): void {
    // 根据配置更新摄像机的旋转和位置
    if (this.rotationEnabled) {
      this.updateRotation();
    }
    this.updateCamera();
    if (this.translationEnabled) {
      this.updateTranslation();
    }
  }
  /**
   * 根据鼠标输入更新摄像机的旋转。
   */
  updateRotation() {
    // 计算鼠标相对于窗口宽度和高度的比例
    const xh = this.base.iMouse.mouseDOMDelta.x / window.innerWidth;
    const yh = this.base.iMouse.mouseDOMDelta.y / window.innerHeight;
    // 更新phi和theta的角度
    this.phi += -xh * this.phiSpeed;
    this.theta = THREE.MathUtils.clamp(
      this.theta + -yh * this.thetaSpeed,
      -Math.PI / 3,
      Math.PI / 3,
    );
    // 根据phi和theta创建旋转四元数
    const qx = new THREE.Quaternion();
    qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
    const qz = new THREE.Quaternion();
    qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta);
    // 组合phi和theta的旋转
    const q = new THREE.Quaternion();
    q.multiply(qx);
    q.multiply(qz);
    // 更新摄像机的旋转
    this.rotation.copy(q);
  }
  /**
   * 根据键盘输入更新摄像机的移动。
   */
  updateTranslation() {
    // 计算前进和侧移的速度
    const fv =
      (this.base.keyboard.isUpKeyDown ? 1 : 0) +
      (this.base.keyboard.isDownKeyDown ? -1 : 0);
    const sv =
      (this.base.keyboard.isLeftKeyDown ? 1 : 0) +
      (this.base.keyboard.isRightKeyDown ? -1 : 0);
    // 使用deltaTime来平滑移动
    const dt = this.base.clock.deltaTime;
    // 根据当前旋转创建前进和侧移的方向向量
    const qx = new THREE.Quaternion();
    qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(qx);
    forward.multiplyScalar(fv * dt * 10 * this.forwardSpeed);
    const left = new THREE.Vector3(-1, 0, 0);
    left.applyQuaternion(qx);
    left.multiplyScalar(sv * dt * 10 * this.leftSpeed);
    // 更新摄像机的位置
    this.translation.add(forward);
    this.translation.add(left);
  }
  /**
   * 更新摄像机的旋转和位置。
   */
  updateCamera() {
    // 将旋转和位置应用到摄像机
    this.camera.quaternion.copy(this.rotation);
    this.camera.position.copy(this.translation);
  }
}
export { FirstPersonCamera };
