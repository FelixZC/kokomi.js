import * as THREE from "three";
import { Component } from "./component";
import { Base } from "../base/base";
import * as nipplejs from "nipplejs";
import { preventDefaultAndStopBubble } from "../utils";
/**
 * Joystick配置接口，继承自nipplejs的JoystickManagerOptions。
 */
export interface JoystickConfig extends nipplejs.JoystickManagerOptions {}
/**
 * 手柄类，通过nipplejs实现。
 * 提供了一个图形化手柄，用于控制三维场景中的物体移动或旋转等操作。
 */
/**
 * An encapsuled class by [nipplejs](https://github.com/yoannmoinet/nipplejs).
 */
class Joystick extends Component {
  manager: nipplejs.JoystickManager;
  data: Partial<nipplejs.JoystickOutputData>;
  /**
   * 创建一个手柄实例。
   * @param base 基类实例，通常是一个包含场景、相机等核心元素的基类。
   * @param config 手柄的配置选项，可选，默认为空对象。
   */
  constructor(base: Base, config: Partial<JoystickConfig> = {}) {
    super(base);
    // 配置手柄的触发区域，阻止默认行为以避免浏览器的默认响应。
    if (config.zone) {
      config.zone.onmousedown = preventDefaultAndStopBubble;
      config.zone.onpointerdown = preventDefaultAndStopBubble;
      config.zone.ontouchstart = preventDefaultAndStopBubble;
    }
    // 初始化nipplejs手柄管理器。
    const manager = nipplejs.create({
      mode: "static",
      position: {
        left: "75px",
        bottom: "75px",
      },
      ...config,
    });
    this.manager = manager;
    this.data = {};
  }
  /**
   * 监听手柄的操作手势，包括开始、移动和结束。
   * 开始和结束时触发特定事件，移动时更新手柄的数据。
   */
  listenForGesture() {
    // 当手柄操作开始时触发的事件。
    this.manager.on("start", () => {
      this.emit("move-start", this.data);
    });
    // 当手柄移动时触发的事件，更新手柄的数据。
    this.manager.on("move", (_, data) => {
      this.emit("move", data);
      this.data = data;
    });
    // 当手柄操作结束时触发的事件。
    this.manager.on("end", () => {
      this.emit("move-end", this.data);
    });
  }
}
export { Joystick };
