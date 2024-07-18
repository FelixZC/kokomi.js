import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
import { hyperbolicHelicoidFunction } from "../utils/parametric";
/**
 * A [HyperbolicHelicoid](https://mathworld.wolfram.com/HyperbolicHelicoid.html) geometry
 * Demo: https://kokomi-js.vercel.app/examples/#hyperbolicHelicoid
 * HyperbolicHelicoidGeometry 类继承自 ParametricGeometry，用于创建双曲螺线几何体。
 * 双曲螺线是一种特殊的几何形状，由一个平面内的双曲线绕一轴旋转而成。
 *
 * @extends ParametricGeometry
 * @param {number} [slices=64] - 用于定义几何体表面的切片数量，决定了形状的细分精度。
 * @param {number} [stacks=32] - 用于定义几何体高度方向的堆栈数量，也影响细分精度。
 */
class HyperbolicHelicoidGeometry extends ParametricGeometry {
  constructor(slices?: number, stacks?: number) {
    super(hyperbolicHelicoidFunction, slices, stacks);
  }
}
export { HyperbolicHelicoidGeometry };
