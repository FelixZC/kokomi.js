import type { Base } from "../base/base";
/**
 * 动画师接口定义了动画管理的功能，包括自动渲染和任务管理。
 */
export interface AnimatorConfig {
  /**
   * 是否自动渲染每一帧。
   */
  autoRender: boolean;
}
/**
 * Animator类负责管理一系列动画任务。
 * 它与基础渲染器配合，可以自动或手动渲染每一帧。
 */
class Animator {
  base: Base;
  tasks: any[];
  autoRender: boolean;
  /**
   * 创建一个Animator实例。
   * @param base 基础渲染器，用于实际的渲染工作。
   * @param config 配置对象，可选参数，默认启用自动渲染。
   */
  constructor(base: Base, config: Partial<AnimatorConfig> = {}) {
    const { autoRender = true } = config;
    this.autoRender = autoRender;
    this.base = base;
    this.tasks = [];
  }
  /**
   * 添加一个动画任务到任务列表。
   * @param fn 动画任务函数，接受当前时间作为参数。
   */
  add(fn: any) {
    this.tasks.push(fn);
  }
  /**
   * 启用动画循环。
   * 此方法告诉基础渲染器开始循环调用指定的动画回调。
   */
  update() {
    this.base.renderer.setAnimationLoop((time: number) => {
      this.tick(time);
    });
  }
  /**
   * 执行动画的一帧。
   * @param time 当前时间，可选参数，默认为0。
   * 此方法将执行所有任务，并根据配置决定是否自动渲染。
   */
  tick(time = 0) {
    this.tasks.forEach((task) => {
      task(time);
    });
    if (this.autoRender) {
      this.base.render();
    }
  }
}
export { Animator };