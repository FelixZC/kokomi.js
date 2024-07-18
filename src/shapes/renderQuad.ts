import * as THREE from "three";
import type { Base } from "../base/base";
import { CustomMesh, CustomMeshConfig } from "./customMesh";

/**
 * RenderQuad类继承自CustomMesh，用于创建一个渲染四边形。
 * 它专门用于作为渲染目标，通常是一个平面几何体，可以应用纹理。
 * 
 * @param base 基础接口实例，提供底层逻辑支持。
 * @param map 用于四边形的纹理，决定了四边形的外观。
 * @param config 可选的自定义网格配置，用于进一步定制四边形的外观和行为。
 */
class RenderQuad extends CustomMesh {
  constructor(
    base: Base,
    map: THREE.Texture,
    config: Partial<CustomMeshConfig> = {}
  ) {
    super(base, {
      vertexShader: "",
      fragmentShader: "",
      baseMaterial: new THREE.MeshBasicMaterial(),
      geometry:
        config.geometry ||
        new THREE.PlaneGeometry(window.innerWidth, window.innerHeight),
      materialParams: {
        map,
        transparent: true,
        ...config.materialParams,
      },
    });
  }
}

export { RenderQuad };