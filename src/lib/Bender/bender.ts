import * as THREE from "three";
/**
 * Bender类用于对Three.js中的BufferGeometry进行弯曲处理。
 * 它通过改变几何体顶点的位置来实现弯曲效果，根据指定的轴和角度进行弯曲。
 *
 * Credit: https://github.com/Sean-Bradley/Bender
 */
class Bender {
  /**
   * 对给定的BufferGeometry进行弯曲处理。
   *
   * @param geometry 需要进行弯曲处理的BufferGeometry对象。
   * @param axis 弯曲所沿的轴，可以是"x"、"y"或"z"。
   * @param angle 弯曲的角度，以弧度为单位。
   */
  bend(geometry: THREE.BufferGeometry, axis: string, angle: number) {
    let theta = 0;
    if (angle !== 0) {
      // 获取几何体的顶点位置数组
      // @ts-ignore
      const v = geometry.attributes.position.array;
      for (let i = 0; i < v.length; i += 3) {
        let x = v[i];
        let y = v[i + 1];
        let z = v[i + 2];
        // 根据指定的轴计算theta值
        switch (axis) {
          case "x":
            theta = z * angle;
            break;
          case "y":
            theta = x * angle;
            break;
          default: //z
            theta = x * angle;
            break;
        }
        // 计算sinTheta和cosTheta值
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);
        // 根据指定的轴，更新顶点位置
        switch (axis) {
          case "x":
            (v as any)[i] = x;
            (v as any)[i + 1] = (y - 1.0 / angle) * cosTheta + 1.0 / angle;
            (v as any)[i + 2] = -(y - 1.0 / angle) * sinTheta;
            break;
          case "y":
            (v as any)[i] = -(z - 1.0 / angle) * sinTheta;
            (v as any)[i + 1] = y;
            (v as any)[i + 2] = (z - 1.0 / angle) * cosTheta + 1.0 / angle;
            break;
          default: //z
            (v as any)[i] = -(y - 1.0 / angle) * sinTheta;
            (v as any)[i + 1] = (y - 1.0 / angle) * cosTheta + 1.0 / angle;
            (v as any)[i + 2] = z;
            break;
        }
      }
      // 标记位置属性需要更新
      geometry.attributes.position.needsUpdate = true;
    }
  }
}
export { Bender };
