import * as THREE from "three";
import { Component } from "./component";
import { Base } from "../base/base";
import { detectDeviceType } from "../utils";

/**
 * 封装鼠标位置处理功能的类。
 * 提供了处理DOM坐标系统及屏幕坐标系统中鼠标位置的属性与方法。
 * 继承自Component类，表明它是一个可附加到基础对象上的组件。
 */
class IMouse extends Component {
  mouse: THREE.Vector2; // 存储WebGL坐标系中的鼠标位置
  mouseDOM: THREE.Vector2; // 存储DOM坐标系中的鼠标位置
  mouseScreen: THREE.Vector2; // 存储相对于屏幕中心的WebGL坐标系中的鼠标位置
  prevMouseDOM: THREE.Vector2; // 前一帧DOM坐标系中的鼠标位置
  isMouseMoving: boolean; // 标记鼠标是否正在移动
  mouseMoveOffset: number; // 鼠标移动偏移量，用于判断鼠标是否发生有效移动
  mouseDOMDelta: THREE.Vector2; // DOM坐标系中鼠标位置的增量

  constructor(base: Base) {
    super(base);
    // 初始化WebGL坐标系中的鼠标位置向量
    const mouse = new THREE.Vector2(0, 0);
    this.mouse = mouse;
    // 初始化DOM坐标系中的鼠标位置向量
    const mouseDOM = new THREE.Vector2(0, 0);
    this.mouseDOM = mouseDOM;
    // 初始化相对于屏幕中心的WebGL坐标系中的鼠标位置向量
    const mouseScreen = new THREE.Vector2(0, 0);
    this.mouseScreen = mouseScreen;
    // 初始化前一帧DOM坐标系中的鼠标位置
    this.prevMouseDOM = new THREE.Vector2(0, 0);
    // 初始化鼠标移动状态标记为未移动
    this.isMouseMoving = false;
    // 设置鼠标移动的触发偏移量
    this.mouseMoveOffset = 4;
    // 初始化DOM坐标系中鼠标位置的增量向量
    this.mouseDOMDelta = new THREE.Vector2(0, 0);
  }

  // 根据传入的x、y坐标获取WebGL坐标系中的鼠标位置
  getMouse(x: number, y: number): THREE.Vector2 {
    return new THREE.Vector2(x, window.innerHeight - y);
  }

  // 根据传入的x、y坐标获取DOM坐标系中的鼠标位置
  getMouseDOM(x: number, y: number): THREE.Vector2 {
    return new THREE.Vector2(x, y);
  }

  // 根据传入的x、y坐标获取相对于屏幕中心的WebGL坐标系中的鼠标位置
  getMouseScreen(x: number, y: number): THREE.Vector2 {
    return new THREE.Vector2(x - window.innerWidth / 2, -(y - window.innerHeight / 2));
  }

  // 监听鼠标事件，根据设备类型分别调用桌面或移动设备的监听方法
  listenForMouse() {
    const deviceType = detectDeviceType();
    if (deviceType === "Desktop") {
      this.listenForDesktop();
    } else if (deviceType === "Mobile") {
      this.listenForMobile();
    }
  }

  // 桌面设备的鼠标监听逻辑
  listenForDesktop() {
    window.addEventListener("mousemove", (e) => {
      this.updateMousePositions(e.clientX, e.clientY);
    });
  }

  // 移动设备的触摸监听逻辑
  listenForMobile() {
    window.addEventListener("touchstart", (e) => this.updateMousePositions(e.touches[0].clientX, e.touches[0].clientY));
    window.addEventListener("touchmove", (e) => this.updateMousePositions(e.touches[0].clientX, e.touches[0].clientY));
  }

  // 更新鼠标位置信息
  private updateMousePositions(x: number, y: number) {
    const iMouseNew = this.getMouse(x, y);
    this.mouse = iMouseNew;
    const mouseDOM = this.getMouseDOM(x, y);
    this.mouseDOM = mouseDOM;
    const mouseScreen = this.getMouseScreen(x, y);
    this.mouseScreen = mouseScreen;
  }

  // 同步上一帧与当前帧的DOM坐标系鼠标位置
  syncMouseDOM() {
    this.prevMouseDOM.x = this.mouseDOM.x;
    this.prevMouseDOM.y = this.mouseDOM.y;
  }

  // 判断鼠标是否在移动
  judgeIsMouseMoving() {
    this.isMouseMoving = Math.abs(this.mouseDOMDelta.x) >= this.mouseMoveOffset || Math.abs(this.mouseDOMDelta.y) >= this.mouseMoveOffset;
  }

  // 计算DOM坐标系中鼠标位置的增量
  getMouseDOMDelta() {
    const x = this.mouseDOM.x - this.prevMouseDOM.x;
    const y = this.mouseDOM.y - this.prevMouseDOM.y;
    this.mouseDOMDelta.set(x, y);
  }

  // 更新方法，调用各更新逻辑
  update(time: number): void {
    this.getMouseDOMDelta();
    this.judgeIsMouseMoving();
    this.syncMouseDOM();
  }
}

export { IMouse };