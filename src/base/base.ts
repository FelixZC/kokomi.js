/**
 * 导入THREE库及其扩展，为后续的3D渲染及交互功能做准备。
 */
import * as THREE from "three";
import { InteractionManager } from "three.interactive";
import type { EffectComposer } from "three-stdlib";
/**
 * 导入自定义组件，包括动画、时钟、物理引擎、大小调整器、鼠标和键盘控制等，
 * 用于实现场景中的各种动态效果和交互功能。
 */
import {
  Animator,
  Clock,
  Physics,
  Resizer,
  IMouse,
  Keyboard,
} from "../components";
/**
 * 导入实用工具函数，用于后续可能的文件下载功能。
 */
import { downloadBlob } from "../utils";
/**
 * 定义基础配置接口，包含了一系列用于初始化场景的配置项。
 *
 * @property {boolean} hello - 一个示例布尔配置项，可能用于判断是否打印欢迎信息。
 * @property {THREE.WebGLRendererParameters} gl - WebGL渲染器的参数配置。
 * @property {boolean} autoAdaptMobile - 自动适应移动端的配置项，可能用于调整渲染器的设置以适应移动设备。
 * @property {boolean} autoRender - 自动渲染的配置项，用于控制场景是否自动按帧渲染。
 */
export interface BaseConfig {
  hello: boolean;
  gl: THREE.WebGLRendererParameters;
  autoAdaptMobile: boolean;
  autoRender: boolean;
}
/**
 * By extending this class, you can kickstart a basic three.js scene easily.
 *
 * Demo: https://kokomi-js.vercel.app/examples/#base
 */
// 定义了一个基类 Base，包含了创建和管理3D场景所需的基本属性和方法。
class Base {
  // 类的属性列表，包括相机、场景、渲染器、容器元素、动画器、交互管理器、合成器、时钟、鼠标交互、物理引擎、大小调整器和键盘监听器。
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  container: HTMLElement;
  animator: Animator;
  interactionManager: InteractionManager;
  composer: EffectComposer | null;
  clock: Clock;
  iMouse: IMouse;
  physics: Physics;
  resizer: Resizer;
  keyboard: Keyboard;
  // 构造函数，用于初始化场景和相关组件。
  // sel 参数用于指定挂载3D场景的HTML元素的选择器。
  // config 参数是一个对象，包含了场景配置的选项。
  constructor(sel = "#sketch", config: Partial<BaseConfig> = {}) {
    const {
      hello = true, // 是否在控制台打印欢迎信息。
      gl = {}, // WebGLRenderer 的额外配置。
      autoAdaptMobile = false, // 是否自动适配移动端。
      autoRender = true, // 是否自动渲染。
    } = config;
    // 如果配置要求打印欢迎信息，则在控制台打印。
    if (hello) {
      console.log(
        `%c- powered by kokomi.js -`,
        `padding: 5px 10px; background: #030A8C; font-size: 11px`,
      );
    }
    // 创建透视相机并设置其位置。
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      100,
    );
    camera.position.z = 1;
    this.camera = camera;
    // 创建场景。
    const scene = new THREE.Scene();
    this.scene = scene;
    // 创建WebGL渲染器，并设置抗锯齿和透明度支持。
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      ...gl,
    });
    renderer.setSize(window.innerWidth, window.innerHeight); // 设置渲染器大小。
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio)); // 设置像素比例。
    this.renderer = renderer;
    // 根据选择器获取容器元素，并将其添加到渲染器的DOM元素中。
    const container = document.querySelector(sel) as HTMLElement;
    container?.appendChild(renderer.domElement);
    this.container = container;
    // 创建动画器并设置是否自动渲染。
    const animator = new Animator(this, {
      autoRender,
    });
    this.animator = animator;
    // 创建交互管理器。
    const interactionManager = new InteractionManager(
      this.renderer,
      this.camera,
      this.renderer.domElement,
    );
    this.interactionManager = interactionManager;
    // 初始化合成器为null。
    this.composer = null;
    // 创建时钟。
    const clock = new Clock(this);
    this.clock = clock;
    // 创建鼠标交互。
    const iMouse = new IMouse(this);
    this.iMouse = iMouse;
    // 创建物理引擎。
    const physics = new Physics(this);
    this.physics = physics;
    // 创建大小调整器，并设置是否自动适配移动端。
    const resizer = new Resizer(this, {
      autoAdaptMobile,
    });
    this.resizer = resizer;
    // 创建键盘监听器。
    const keyboard = new Keyboard();
    this.keyboard = keyboard;
    // 调用 init 方法进行初始化。
    this.init();
    // 添加事件监听器。
    this.addEventListeners();
  }
  // 添加事件监听器的方法。
  addEventListeners() {
    // 监听窗口大小变化事件，用于调整渲染器大小。
    this.resizer.listenForResize();
    // 监听鼠标事件。
    this.iMouse.listenForMouse();
    // 监听键盘事件。
    this.keyboard.listenForKey();
  }
  // 更新动画的方法，接受一个函数作为参数，该函数将在每一帧中被调用。
  update(fn: any) {
    this.animator.add(fn);
  }
  // 初始化方法，设置动画器更新交互管理器，并启动动画器。
  init() {
    this.update(() => {
      this.interactionManager.update();
    });
    this.animator.update();
  }
  // 渲染方法，根据是否有合成器，选择渲染方式。
  render() {
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
  // 异步保存截图的方法。
  async saveScreenshot(name = `screenshot.png`) {
    this.render();
    const blob: Blob | null = await new Promise((resolve) => {
      this.renderer.domElement.toBlob(resolve, "image/png");
    });
    if (blob) {
      downloadBlob(blob, name); // 假设 downloadBlob 是一个下载Blob的方法。
    }
  }
  // 销毁场景的方法，释放资源。
  destroy() {
    // 遍历场景中的所有对象，释放网格和材质资源。
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        Object.values(child.material).forEach((value: any) => {
          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        });
      }
    });
    // 释放渲染器资源。
    this.renderer.dispose();
  }
}
export { Base };
