import type { Base } from "../base/base";
import { Component } from "../components/component";
import { FBO, FBOConfig } from "./fbo";
/**
 * 双重帧缓冲对象（Double Frame Buffer Object）接口，扩展了FBOConfig以提供额外的配置选项。
 */
export interface DoubleFBOConfig extends FBOConfig {}
/**
 * DoubleFBO类用于管理两个帧缓冲对象（Frame Buffer Object，FBO），以实现渲染目标的交换。
 * 这在某些渲染技术中，如屏幕空间反射等，是非常有用的。
 * @extends Component 继承自组件基类，使得DoubleFBO可以被添加到游戏或应用程序的组件系统中。
 */
class DoubleFBO extends Component {
  readFBO: FBO;
  writeFBO: FBO;
  /**
   * 创建一个DoubleFBO实例。
   * @param base Base实例，提供底层的渲染环境和相关资源管理。
   * @param options 配置选项，用于初始化两个FBO。这些选项应符合FBOConfig的结构。
   */
  constructor(base: Base, options: Partial<DoubleFBOConfig> = {}) {
    super(base);
    const readFBO = new FBO(this.base, options);
    this.readFBO = readFBO;
    const writeFBO = new FBO(this.base, options);
    this.writeFBO = writeFBO;
  }
  /**
   * 交换读取和写入帧缓冲对象的角色。
   * 这个方法允许在渲染循环中交替使用两个FBO，从而实现某些特殊的渲染效果。
   */
  swap() {
    [this.readFBO, this.writeFBO] = [this.writeFBO, this.readFBO];
  }
}
export { DoubleFBO };