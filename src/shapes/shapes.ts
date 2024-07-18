import * as THREE from "three";
/*
 * ref: https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_shapes.html
 * 创建一个带有圆角的矩形形状。
 * 
 * 此函数通过指定上下左右边界的坐标和圆角半径，生成一个具有圆角的矩形形状。形状通过一组路径命令定义，
 * 包括移动到起点、绘制直线、绘制二次贝塞尔曲线等，最后返回这个形状对象。
 * 
 * @param ctx THREE.Shape对象，用于构建形状的上下文。
 * @param x 矩形左上角的x坐标，默认为0。
 * @param y 矩形左上角的y坐标，默认为0。
 * @param width 矩形的宽度，默认为1。
 * @param height 矩形的高度，默认为1。
 * @param radius 矩形的圆角半径，默认为0.05。
 * @returns 返回修改后的THREE.Shape对象，带有圆角的矩形形状。
 */
const roundedRect = (
  ctx: THREE.Shape,
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  radius = 0.05,
) => {
  // 从左上角的起点开始，移动到左上角的圆角处
  ctx.moveTo(x, y + radius);
  // 从左上角的圆角绘制到右上角的圆角
  ctx.lineTo(x, y + height - radius);
  ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
  // 从右上角的圆角绘制到右下角的圆角
  ctx.lineTo(x + width - radius, y + height);
  ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  // 从右下角的圆角绘制到左下角的圆角
  ctx.lineTo(x + width, y + radius);
  ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
  // 从左下角的圆角绘制到左上角的圆角
  ctx.lineTo(x + radius, y);
  ctx.quadraticCurveTo(x, y, x, y + radius);
  // 返回带有圆角矩形路径的形状对象
  return ctx;
};
export { roundedRect };