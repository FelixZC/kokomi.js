import * as THREE from "three";
import { Component } from "../components/component";
import { Base } from "../base/base";

/**
 * 表示灯光形状的类型。
 */
export type Form = "circle" | "ring" | "rect";

/**
 * 灯光形成器的配置接口。
 */
export interface LightFormerConfig {
  color: string;
  form: Form;
  intensity: number;
}

/**
 * LightFormer 类继承自 Component，用于创建具有特定形状和颜色的灯光效果。
 * @extends Component 组件基类
 */
class LightFormer extends Component {
  material: THREE.MeshBasicMaterial;
  mesh: THREE.Mesh;

  /**
   * 创建一个 LightFormer 实例。
   * @param base 基类实例，提供共享的底层逻辑和状态。
   * @param config 灯光形成器的配置，包括颜色、形状和强度。
   */
  constructor(base: Base, config: Partial<LightFormerConfig> = {}) {
    super(base);
    const { color = "white", form = "rect", intensity = 1 } = config;
    // 根据配置的形状创建对应的几何体
    const geometry = {
      circle: new THREE.RingGeometry(0, 1, 64),
      ring: new THREE.RingGeometry(0.5, 1, 64),
      rect: new THREE.PlaneGeometry(),
    }[form as Form];
    // 创建基本材质，并根据配置设置颜色和透明度
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: new THREE.Color(color),
    });
    // 根据配置的强度调整材质颜色的亮度
    material.color.multiplyScalar(intensity);
    this.material = material;
    // 创建网格对象，并应用几何体和材质
    const mesh = new THREE.Mesh(geometry, material);
    this.mesh = mesh;
  }

  /**
   * 将灯光网格添加到容器中。
   */
  addExisting(): void {
    this.container.add(this.mesh);
  }
}

export { LightFormer };