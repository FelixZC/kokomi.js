/**
 * Sketch 类，继承自 kokomi.Base，用于创建三维素描。
 */
import * as kokomi from "kokomi.js";
import * as THREE from "three";
import gsap from "gsap";
import * as dat from "lil-gui";

class Sketch extends kokomi.Base {
  /**
   * 此函数初始化 Marching Squares 算法，设置材质，定义 SDF 地图函数，并启用轨道控制以操纵相机。
   */
  create() {
    // 初始化 Marching Squares 算法的 Marcher 对象
    const mar = new marcher.Marcher({
      antialias: false,
      showIsoline: false,
    });

    // 初始化 SDF 材质用于渲染
    const mat = new marcher.SDFMaterial();
    // 向 SDF 材质添加 isoline 材质
    mat.addIsolineMaterial(marcher.DEFAULT_MATERIAL_ID, 1, 1, 0);
    // 设置 Marcher 的材质
    mar.setMaterial(mat);

    // 初始化 SDF 地图函数来定义三维对象的形状
    const map = new marcher.SDFMapFunction();

    // 初始化 SDF 地图的层
    const layer = new marcher.SDFLayer();

    // 使用 SDF 算法初始化立方体形状
    const box = new marcher.BoxSDF({
      sdfVarName: "d1",
    });
    // 将立方体形状添加到层中
    layer.addPrimitive(box);
    // 使立方体的边缘变圆
    box.round(0.1);

    // 将层添加到 SDF 地图函数中
    map.addLayer(layer);

    // 为 Marcher 设置 SDF 地图函数
    mar.setMapFunction(map);

    // 启用轨道控制以操纵相机
    mar.enableOrbitControls();

    // 初始化光线追踪四边形进行渲染
    const rayMarchingQuad = new kokomi.RayMarchingQuad(this, mar);
    // 开始渲染
    rayMarchingQuad.render();

    // 打印片段着色器代码以供调试
    console.log(mar.fragmentShader);
  }
}