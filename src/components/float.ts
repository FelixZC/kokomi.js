import * as THREE from "three";
import { Component } from "./component";
import { Base } from "../base/base";
/**
 * 定义浮动效果的配置接口。
 */
export interface FloatConfig {
  speed: number; // 移动速度
  rotationIntensity: number; // 旋转强度
  floatIntensity: number; // 浮动强度
  floatingRange: [number?, number?]; // 浮动范围
}
/**
 * Float类继承自Component，为物体提供浮动效果。
 * 它通过调整物体的位置和旋转来实现浮动效果。
 */
/**
 * A class that can make objects float.
 */
class Float extends Component {
  group: THREE.Group; // 存储浮动物体的组
  speed: number; // 移动速度
  rotationIntensity: number; // 旋转强度
  floatIntensity: number; // 浮动强度
  floatingRange: [number?, number?]; // 浮动范围
  offset: number; // 随机偏移量，用于增加多样性
  /**
   * 构造函数初始化浮动效果组件。
   * @param base 基类实例，提供共享的属性和方法。
   * @param config 配置对象，用于定制浮动效果。
   */
  constructor(base: Base, config: Partial<FloatConfig> = {}) {
    super(base);
    // 解构并默认化配置参数
    const {
      speed = 1,
      rotationIntensity = 1,
      floatIntensity = 1,
      floatingRange = [-0.1, 0.1],
    } = config;
    this.speed = speed;
    this.rotationIntensity = rotationIntensity;
    this.floatIntensity = floatIntensity;
    this.floatingRange = floatingRange;
    // 创建一个THREE.Group来持有浮动物体
    const group = new THREE.Group();
    this.group = group;
    // 设置一个随机偏移量，增加浮动效果的多样性
    this.offset = Math.random() * 114514;
  }
  /**
   * 将浮动组添加到场景中。
   */
  addExisting(): void {
    this.container.add(this.group);
  }
  /**
   * 向浮动组中添加一个或多个物体。
   * @param object(s) 要添加到组中的THREE.Object3D实例。
   */
  add(...object: THREE.Object3D[]) {
    this.group.add(...object);
  }
  /**
   * 每帧更新函数，应用浮动和旋转效果。
   * @param time 当前时间，用于计算动画效果。
   */
  update(time: number): void {
    // 解构配置参数以简化代码
    const { speed, rotationIntensity, floatIntensity, floatingRange, offset } =
      this;
    const t = offset + this.base.clock.elapsedTime; // 计算时间变量
    // 应用旋转效果
    this.group.rotation.x = (Math.cos((t / 4) * speed) / 8) * rotationIntensity;
    this.group.rotation.y = (Math.sin((t / 4) * speed) / 8) * rotationIntensity;
    this.group.rotation.z =
      (Math.sin((t / 4) * speed) / 20) * rotationIntensity;
    // 计算浮动效果
    let yPosition = Math.sin((t / 4) * speed) / 10;
    yPosition = THREE.MathUtils.mapLinear(
      yPosition,
      -0.1,
      0.1,
      floatingRange?.[0] ?? -0.1,
      floatingRange?.[1] ?? 0.1,
    );
    this.group.position.y = yPosition * floatIntensity;
  }
}
export { Float };
