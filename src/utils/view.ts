import * as THREE from "three";
import type { Base } from "../base/base";

/**
 * 定义画布尺寸的类型。
 */
export type CanvasSize = {
  top: number;
  left: number;
  height: number;
  width: number;
};

/**
 * 计算容器的位置和是否离屏。
 * 
 * @param canvasSize 画布的尺寸。
 * @param trackRect 跟踪元素的矩形信息。
 * @returns 返回包含位置信息和离屏状态的对象。
 */
const computeContainerPosition = (
  canvasSize: CanvasSize,
  trackRect: DOMRect,
): {
  position: CanvasSize & { bottom: number; right: number };
  isOffscreen: boolean;
} => {
  // 解构获取轨道元素的矩形信息
  const {
    right,
    top,
    left: trackLeft,
    bottom: trackBottom,
    width,
    height,
  } = trackRect;
  // 判断轨道元素是否离屏
  const isOffscreen =
    trackRect.bottom < 0 ||
    top > canvasSize.height ||
    right < 0 ||
    trackRect.left > canvasSize.width;
  // 计算画布底部和元素底部的距离
  const canvasBottom = canvasSize.top + canvasSize.height;
  const bottom = canvasBottom - trackBottom;
  // 计算元素左边缘到画布左边缘的距离
  const left = trackLeft - canvasSize.left;
  // 返回包含位置信息和离屏状态的对象
  return {
    position: { width, height, left, top, bottom, right },
    isOffscreen,
  };
};

/**
 * 应用视图剪裁，将渲染视图限制在指定的DOM元素内。
 * 
 * @param base 基础渲染设置，包含渲染器和相机。
 * @param viewEl 视图容器的DOM元素。
 */
// 应用视图裁剪，用于把画布放在一个div视图容器内
const applyViewScissor = (base: Base, viewEl: HTMLElement) => {
  // 获取渲染器的画布尺寸
  const canvasSize = base.renderer.domElement.getBoundingClientRect();
  // 获取视图容器的尺寸
  const rect = viewEl.getBoundingClientRect();
  // 如果视图容器尺寸有效，则进行剪裁设置
  if (rect) {
    // 计算容器的位置和是否离屏
    const {
      position: { left, bottom, width, height },
    } = computeContainerPosition(canvasSize, rect);
    // 根据容器宽高比设置相机的宽高比
    const aspect = width / height;
    (base.camera as THREE.PerspectiveCamera).aspect = aspect;
    (base.camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    // 设置渲染器的视口和剪裁区域
    base.renderer.setViewport(left, bottom, width, height);
    base.renderer.setScissor(left, bottom, width, height);
    base.renderer.setScissorTest(true);
  }
};

/**
 * 计算视图窗口的缩放比例。
 * 
 * @param viewEl 视图容器的DOM元素。
 * @returns 返回x轴和y轴的缩放比例。
 */
// 计算视图窗口缩放，用于在div视图容器内HTML元素的缩放
const computeViewWindowScale = (viewEl: HTMLElement) => {
  const viewRect = viewEl.getBoundingClientRect();
  const { width, height } = viewRect;
  // 计算x轴和y轴的缩放比例
  const xScale = width / window.innerWidth;
  const yScale = height / window.innerHeight;
  return { xScale, yScale };
};

export { applyViewScissor, computeViewWindowScale };