import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
import { sphubeFunction } from "../utils/parametric";
/**
 * A [Sphube](https://arxiv.org/pdf/1604.02174.pdf) geometry
 * Demo: https://kokomi-js.vercel.app/examples/#sphube
 * SphubeGeometry类继承自ParametricGeometry，用于创建球形管（Sphube）的几何形状。
 * 球形管是一种参数几何体，可以通过给定的slices和stacks参数来定义其细分。
 *
 * @param {number} [stacks] - 用于控制球形管的轴向细分数量。默认值由父类决定。
 */
class SphubeGeometry extends ParametricGeometry {
  constructor(slices?: number, stacks?: number) {
    super(sphubeFunction, slices, stacks);
  }
}
export { SphubeGeometry };
