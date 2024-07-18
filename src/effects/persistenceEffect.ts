import * as THREE from "three";
import type { Base } from "../base/base";
import { Component } from "../components/component";
/**
 * 始终保留上一帧画面效果的配置接口。
 * 这些设置用于控制淡出效果的颜色、透明度和几何形状属性。
 */
export interface PersistenceEffectConfig {
  clearColor: number;
  fadeFactor: number;
  fadeColor: THREE.Color;
  scaleX: number;
  scaleY: number;
  rotationAngle: number;
}
/**
 * 始终保留上一帧画面效果的类。
 * 该组件通过在渲染管道中添加额外的步骤来实现对上一帧画面的持续显示，创建一种视觉上的持续效果。
 *
 * Credit: https://tympanus.net/codrops/2021/12/28/adding-a-persistence-effect-to-three-js-scenes/
 *
 * Demo: https://kokomi-playground.vercel.app/entries/#starTunnel
 */
class PersistenceEffect extends Component {
  isActive: boolean;
  clearColor: number;
  fadeFactor: number;
  fadeColor: THREE.Color;
  scaleX: number;
  scaleY: number;
  rotationAngle: number;
  orthoCamera: THREE.OrthographicCamera;
  uvMatrix: THREE.Matrix3;
  fadeMaterial: THREE.ShaderMaterial;
  fadePlane: THREE.Mesh;
  resultPlane: THREE.Mesh;
  framebuffer1: THREE.WebGLRenderTarget;
  framebuffer2: THREE.WebGLRenderTarget;
  /**
   * 创建始终保留上一帧画面效果的实例。
   * @param base 底层基础组件，提供渲染器、场景和相机等核心元素的访问。
   * @param config 效果的配置参数，包括清除颜色、淡出因子、淡出颜色等。
   */
  constructor(base: Base, config: Partial<PersistenceEffectConfig> = {}) {
    super(base);
    this.isActive = false;
    // 解构配置参数，并提供默认值。
    const {
      clearColor = 0x111111,
      fadeFactor = 0.2,
      fadeColor = new THREE.Color("#000000"),
      scaleX = 0,
      scaleY = 0,
      rotationAngle = 0,
    } = config;
    this.clearColor = clearColor;
    this.fadeFactor = fadeFactor;
    this.fadeColor = fadeColor;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.rotationAngle = rotationAngle;
    // 设置一个正交相机，用于捕捉整个屏幕的图像。
    const leftScreenBorder = -innerWidth / 2;
    const rightScreenBorder = innerWidth / 2;
    const topScreenBorder = -innerHeight / 2;
    const bottomScreenBorder = innerHeight / 2;
    const near = -100;
    const far = 100;
    this.orthoCamera = new THREE.OrthographicCamera(
      leftScreenBorder,
      rightScreenBorder,
      topScreenBorder,
      bottomScreenBorder,
      near,
      far,
    );
    this.orthoCamera.position.z = -10;
    this.orthoCamera.lookAt(new THREE.Vector3(0, 0, 0));
    // 初始化用于处理淡出效果的几何形状和材质。
    const fullscreenQuadGeometry = new THREE.PlaneGeometry(
      innerWidth,
      innerHeight,
    );
    const uvMatrix = new THREE.Matrix3();
    this.uvMatrix = uvMatrix;
    this.fadeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        inputTexture: { value: null },
        fadeFactor: { value: this.fadeFactor },
        fadeColor: { value: this.fadeColor },
        uvMatrix: { value: uvMatrix },
      },
      vertexShader: /* glsl */ `
       uniform mat3 uvMatrix;
       varying vec2 vUv;
       void main () {
         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
         vUv = (uvMatrix * vec3(uv, 1.0)).xy;
       }
     `,
      fragmentShader: /* glsl */ `
       uniform sampler2D inputTexture;
       uniform float fadeFactor;
       uniform vec3 fadeColor;
       varying vec2 vUv;
       void main () {
         vec4 texColor = texture2D(inputTexture, vUv);
         vec4 fadeColorWithAlpha = vec4(fadeColor, 1.0);
         gl_FragColor = mix(texColor, fadeColorWithAlpha, fadeFactor);
       }
     `,
    });
    // 创建用于淡出和最终显示的两个平面网格。
    const fadePlane = new THREE.Mesh(fullscreenQuadGeometry, this.fadeMaterial);
    this.fadePlane = fadePlane;
    const resultMaterial = new THREE.MeshBasicMaterial({ map: null });
    const resultPlane = new THREE.Mesh(fullscreenQuadGeometry, resultMaterial);
    this.resultPlane = resultPlane;
    // 初始化两个WebGL渲染目标，用于帧缓冲区的交替使用。
    const framebuffer1 = new THREE.WebGLRenderTarget(innerWidth, innerHeight);
    const framebuffer2 = new THREE.WebGLRenderTarget(innerWidth, innerHeight);
    this.framebuffer1 = framebuffer1;
    this.framebuffer2 = framebuffer2;
  }
  /**
   * 将效果添加到现有渲染流程中。
   * 这包括对帧缓冲区的初始化清理和启用效果。
   */
  addExisting(): void {
    const { base } = this;
    const { renderer } = base;
    const { framebuffer1, framebuffer2 } = this;
    // 清理帧缓冲区以避免初始渲染时的干扰。
    renderer.setClearColor(this.clearColor);
    renderer.setRenderTarget(framebuffer1);
    renderer.clearColor();
    renderer.setRenderTarget(framebuffer2);
    renderer.clearColor();
    this.enable();
  }
  /**
   * 启用效果。
   * 将效果的活动状态设置为true，使其开始影响渲染输出。
   */
  enable() {
    this.isActive = true;
  }
  /**
   * 禁用效果。
   * 将效果的活动状态设置为false，使其停止影响渲染输出。
   */
  disable() {
    this.isActive = false;
  }
  /**
   * 更新效果处理器，用于每帧更新画面的持久化效果。
   * @param time 当前时间，用于计算动画效果。
   */
  update(time: number): void {
    if (!this.isActive) {
      return;
    }
    // 解构获取基础渲染器、场景和相机。
    const { base } = this;
    const { renderer, scene, camera } = base;
    const { orthoCamera, uvMatrix, fadeMaterial, fadePlane, resultPlane } =
      this;
    const { framebuffer1, framebuffer2 } = this;
    renderer.autoClearColor = false;
    fadeMaterial.uniforms.inputTexture.value = framebuffer1.texture;
    fadeMaterial.uniforms.fadeFactor.value = this.fadeFactor;
    renderer.setRenderTarget(framebuffer2);
    renderer.render(fadePlane, orthoCamera);
    renderer.render(scene, camera);
    // 恢复渲染目标为默认，然后设置结果平面的材质纹理为framebuffer2的纹理。
    renderer.setRenderTarget(null);
    (resultPlane.material as THREE.MeshBasicMaterial).map =
      framebuffer2.texture;
    renderer.render(resultPlane, orthoCamera);
    // 根据scaleX和scaleY的值计算UV缩放，用于后续的UV变换。
    const uvScaleX = THREE.MathUtils.mapLinear(this.scaleX, -1, 1, 1.05, 0.95);
    const uvScaleY = THREE.MathUtils.mapLinear(this.scaleY, -1, 1, 1.05, 0.95);
    const rotation = THREE.MathUtils.degToRad(this.rotationAngle);
    uvMatrix.setUvTransform(0, 0, uvScaleX, uvScaleY, rotation, 0.5, 0.5);
    // 交换两个帧缓冲区，为下一次更新做准备。
    const swap = framebuffer1;
    this.framebuffer1 = framebuffer2;
    this.framebuffer2 = swap;
  }
}
export { PersistenceEffect };
