import * as THREE from "three";
import { Component } from "../components/component";
import { Base } from "../base/base";
/**
 * 环境配置接口，定义了渲染环境的相关参数。
 */
export interface EnvironmentConfig {
  resolution: number; // 分辨率
  near: number; // 靠近平面
  far: number; // 远离平面
  scene: THREE.Scene; // 场景
  options: THREE.RenderTargetOptions; // 渲染目标选项
  textureType: THREE.TextureDataType; // 纹理数据类型
  ignoreObjects: THREE.Object3D[]; // 忽略的物体列表
}
/**
 * 环境类，用于创建和管理渲染环境。
 * 它是一个组件，可以被添加到基类中。
 */
class Environment extends Component {
  fbo: THREE.WebGLCubeRenderTarget; //立方体渲染目标
  cubeCamera: THREE.CubeCamera; //立方体相机
  virtualScene: THREE.Scene; //虚拟场景
  ignoreObjects: THREE.Object3D[]; //在渲染立方体映射时应忽略的物体列表
  /**
   * 环境类的构造函数。
   * @param base 基类实例，提供了渲染器等资源。
   * @param config 环境的配置项，可以部分配置。
   */
  constructor(base: Base, config: Partial<EnvironmentConfig> = {}) {
    super(base);
    // 解构配置项并设置默认值
    const {
      resolution = 256, // 默认分辨率为256
      near = 1, // 默认靠近平面为1
      far = 1000, // 默认远离平面为1000
      scene = null, // 默认场景为null，可以外部提供
      options = {}, // 默认渲染目标选项为空对象
      textureType = THREE.HalfFloatType, // 默认纹理数据类型为HalfFloatType
      ignoreObjects = [], // 默认忽略物体列表为空数组
    } = config;
    this.ignoreObjects = ignoreObjects;
    // 创建立方体渲染目标
    const fbo = new THREE.WebGLCubeRenderTarget(resolution, options);
    fbo.texture.type = textureType;
    this.fbo = fbo;
    // 创建立方体相机
    const cubeCamera = new THREE.CubeCamera(near, far, fbo);
    this.cubeCamera = cubeCamera;
    // 创建虚拟场景，如果外部没有提供场景，则创建新的场景
    const virtualScene = scene || new THREE.Scene();
    this.virtualScene = virtualScene;
  }
  /**
   * 更新环境，这通常在每个渲染周期调用。
   * 它会临时隐藏忽略的物体，然后更新立方体相机，最后恢复物体的可见性。
   */
  update(): void {
    // 短暂隐藏忽略的物体
    this.ignoreObjects.forEach((item) => {
      item.visible = false;
    });
    // 更新立方体相机
    this.cubeCamera.update(this.base.renderer, this.virtualScene);
    // 恢复忽略的物体的可见性
    this.ignoreObjects.forEach((item) => {
      item.visible = true;
    });
  }
  /**
   * 向虚拟场景中添加物体。
   * @param obj 要添加到虚拟场景的THREE.Object3D实例。
   */
  add(obj: THREE.Object3D) {
    this.virtualScene.add(obj);
  }
  /**
   * 获取立方体渲染目标的纹理。
   * @returns 立方体渲染目标的纹理。
   */
  get texture() {
    return this.fbo.texture;
  }
}
export { Environment };