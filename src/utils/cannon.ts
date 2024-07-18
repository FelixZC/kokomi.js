import * as THREE from "three";
import * as CANNON from "cannon-es";
import { mergeVertices } from "three-stdlib";

/**
 * 将THREE.js的BufferGeometry转换为CANNON.js的形状。
 * 
 * 此函数旨在桥接THREE.js和CANNON.js两个库之间的几何形状差距。
 * 它通过分析THREE.js几何形状的类型，并根据其特点创建相应的CANNON.js形状，
 * 从而可以在物理引擎中使用这些几何形状。
 * 
 * @param geometry THREE.js的BufferGeometry对象。
 * @returns 返回对应的CANNON.js形状对象。
 */
// 将three.js的geometry转化为cannon.js的shape
const convertGeometryToShape = (geometry: THREE.BufferGeometry) => {
  // 根据geometry的类型进行不同的处理
  switch (geometry.type) {
    // 箱体几何形状转换
    case "BoxGeometry":
    case "BoxBufferGeometry": {
      // 解构获取箱体的宽、高、深参数
      const {
        width = 1,
        height = 1,
        depth = 1,
      } = (geometry as THREE.BoxGeometry).parameters;
      // 创建CANNON.js的箱体形状
      const halfExtents = new CANNON.Vec3(width / 2, height / 2, depth / 2);
      return new CANNON.Box(halfExtents);
    }
    // 平面几何形状转换
    case "PlaneGeometry":
    case "PlaneBufferGeometry": {
      // 创建CANNON.js的平面形状
      return new CANNON.Plane();
    }
    // 球体几何形状转换
    case "SphereGeometry":
    case "SphereBufferGeometry": {
      // 解构获取球体的半径参数
      const { radius } = (geometry as THREE.SphereGeometry).parameters;
      // 创建CANNON.js的球体形状
      return new CANNON.Sphere(radius);
    }
    // 圆柱体几何形状转换
    case "CylinderGeometry":
    case "CylinderBufferGeometry": {
      // 解构获取圆柱体的参数
      const { radiusTop, radiusBottom, height, radialSegments } = (
        geometry as THREE.CylinderGeometry
      ).parameters;
      // 创建CANNON.js的圆柱体形状
      return new CANNON.Cylinder(
        radiusTop,
        radiusBottom,
        height,
        radialSegments,
      );
    }
    // Ref: https://github.com/pmndrs/cannon-es/issues/103#issuecomment-1002183975
    // 对于不支持的几何形状，进行手动处理
    default: {
      // 创建一个新的THREE.js BufferGeometry来处理不支持的形状
      let geo = new THREE.BufferGeometry();
      geo.setAttribute("position", geometry.getAttribute("position"));
      // 合并顶点以减少物理引擎中的计算复杂度
      geo = mergeVertices(geo);
      // 忽略TypeScript的类型检查，因为CANNON.js所需的格式可能与THREE.js不同
      // @ts-ignore
      const position = geo.attributes.position.array;
      const index = geo.index!.array;
      // 构建点的数组
      const points = [];
      for (let i = 0; i < position.length; i += 3) {
        points.push(
          new CANNON.Vec3(position[i], position[i + 1], position[i + 2]),
        );
      }
      // 构建面的数组
      const faces = [];
      for (let i = 0; i < index.length; i += 3) {
        faces.push([index[i], index[i + 1], index[i + 2]]);
      }
      // 创建一个凸多面体形状来表示不支持的几何形状
      return new CANNON.ConvexPolyhedron({ vertices: points, faces });
    }
  }
};
export { convertGeometryToShape };