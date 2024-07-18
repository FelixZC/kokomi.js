import * as THREE from "three";
import { Component } from "./component";
import { Base } from "../base/base";
import { getBound } from "../utils";
export interface CenterConfig {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  front?: boolean;
  back?: boolean;
  disable?: boolean;
  disableX?: boolean;
  disableY?: boolean;
  disableZ?: boolean;
  precise?: boolean;
}
/**
 * 中心调整组件，用于在3D场景中精确定位对象。
 * 该组件通过配置六个面（顶部、右侧、底部、左侧、前面、后面）的对齐选项，以及X、Y、Z轴的禁用状态，
 * 实现对3D对象在场景中的精确放置和调整。
 */
class Center extends Component {
  /* 是否对齐顶部 */
  top?: boolean;
  /* 是否对齐右侧 */
  right?: boolean;
  /* 是否对齐底部 */
  bottom?: boolean;
  /* 是否对齐左侧 */
  left?: boolean;
  /* 是否对齐前面 */
  front?: boolean;
  /* 是否对齐后面 */
  back?: boolean;
  /* 是否整体禁用对齐 */
  disable?: boolean;
  /* 是否禁用X轴对齐 */
  disableX?: boolean;
  /* 是否禁用Y轴对齐 */
  disableY?: boolean;
  /* 是否禁用Z轴对齐 */
  disableZ?: boolean;
  /* 是否使用高精度计算边界 */
  precise?: boolean;
  /* 用于包含所有对象的外部组 */
  group: THREE.Group;
  /* 用于调整对齐的外部辅助组 */
  groupOuter: THREE.Group;
  /* 用于放置实际对象的内部组 */
  groupInner: THREE.Group;
  /* 对象边界信息，用于计算对齐位置 */
  bound: ReturnType<typeof getBound> | null;

  /**
   * 创建一个中心调整组件。
   * @param base 基础组件实例，提供底层支持。
   * @param config 配置对象，包含各种对齐和禁用选项。
   */
  constructor(base: Base, config: Partial<CenterConfig> = {}) {
    super(base);
    /* 解构配置项，并设置默认值 */
    const {
      top = false,
      right = false,
      bottom = false,
      left = false,
      front = false,
      back = false,
      disable = false,
      disableX = false,
      disableY = false,
      disableZ = false,
      precise = true,
    } = config;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
    this.front = front;
    this.back = back;
    this.disable = disable;
    this.disableX = disableX;
    this.disableY = disableY;
    this.disableZ = disableZ;
    this.precise = precise;
    /* 初始化三个组，用于实现对齐逻辑 */
    const group = new THREE.Group();
    this.group = group;
    const groupOuter = new THREE.Group();
    this.groupOuter = groupOuter;
    const groupInner = new THREE.Group();
    this.groupInner = groupInner;
    this.bound = null;
    this.adjustPosition();
  }

  /**
   * 将已存在的对象添加到组件中，并调整位置。
   * 此方法用于在组件初始化后添加已经存在的3D对象。
   */
  addExisting(): void {
    this.container.add(this.group);
    this.group.add(this.groupOuter);
    this.groupOuter.add(this.groupInner);
    this.adjustPosition();
  }

  /**
   * 向组件中添加一个或多个对象，并调整位置。
   * @param object 一个或多个THREE.Object3D类型的对象。
   */
  add(...object: THREE.Object3D[]) {
    this.groupInner.add(...object);
    this.adjustPosition();
  }

  /**
   * 根据当前配置和对象边界，调整组件内对象的位置。
   * 此方法核心在于计算对象边界，并根据配置的对齐选项，调整对象在场景中的位置。
   */
  adjustPosition() {
    /* 解构配置和边界信息 */
    const {
      top,
      right,
      bottom,
      left,
      front,
      back,
      disable,
      disableX,
      disableY,
      disableZ,
      precise,
    } = this;
    /* 重置外部辅助组的矩阵 */
    this.groupOuter.matrix.identity();
    /* 计算内部组的对象边界 */
    const bound = getBound(this.groupInner, precise);
    this.bound = bound;
    /* 解构边界信息中的中心点、宽度、高度和深度 */
    const { center, width, height, depth } = bound;
    /* 计算垂直对齐偏移 */
    const vAlign = top ? height / 2 : bottom ? -height / 2 : 0;
    /* 计算水平对齐偏移 */
    const hAlign = left ? -width / 2 : right ? width / 2 : 0;
    /* 计算深度对齐偏移 */
    const dAlign = front ? depth / 2 : back ? -depth / 2 : 0;
    /* 根据配置和边界计算的结果，调整外部辅助组的位置，从而实现对齐效果 */
    this.groupOuter.position.set(
      disable || disableX ? 0 : -center.x + hAlign,
      disable || disableY ? 0 : -center.y + vAlign,
      disable || disableZ ? 0 : -center.z + dAlign,
    );
  }
}

export { Center };