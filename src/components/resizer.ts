import * as THREE from "three";
import { Component } from "./component";
import { Base } from "../base/base";
import { OrthographicCamera } from "../camera";
import type { EffectComposer } from "three-stdlib";
export interface ResizerConfig {
  autoAdaptMobile: boolean;
}
/**
 * Resizer 类用于管理渲染区域的大小调整，包括渲染器、composer 和相机的适配。
 * 它继承自 Component 类，添加了自动适应移动设备的功能。
 */
class Resizer extends Component {
  enabled: boolean;
  autoAdaptMobile: boolean;

  /**
   * 创建一个 Resizer 实例。
   * @param base 父级基础组件，提供渲染器、相机和composer等资源。
   * @param config 配置对象，包含是否自动适应移动设备的选项。
   */
  constructor(base: Base, config: Partial<ResizerConfig> = {}) {
    super(base);
    this.enabled = true;
    const { autoAdaptMobile = false } = config;
    this.autoAdaptMobile = autoAdaptMobile;
    if (this.autoAdaptMobile) {
      this.resize();
    }
  }

  /**
   * 获取当前窗口的宽高比。
   * @returns 宽高比。
   */
  get aspect() {
    return window.innerWidth / window.innerHeight;
  }

  /**
   * 调整渲染器的大小和像素比。
   * @param renderer THREE.WebGLRenderer 实例。
   */
  resizeRenderer(renderer: THREE.WebGLRenderer) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  }

  /**
   * 调整 EffectComposer 的大小和像素比。
   * @param composer EffectComposer 实例。
   */
  resizeComposer(composer: EffectComposer) {
    composer.setSize(window.innerWidth, window.innerHeight);
    if (composer.setPixelRatio) {
      composer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    }
  }

  /**
   * 根据当前窗口宽高比调整相机的参数。
   * @param camera THREE.Camera 实例。
   */
  resizeCamera(camera: THREE.Camera) {
    const { aspect } = this;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    } else if (camera instanceof OrthographicCamera) {
      const { frustum, useAspect } = camera;
      if (frustum) {
        const actualAspect = useAspect ? aspect : 1;
        [camera.left, camera.right, camera.top, camera.bottom] = [
          actualAspect * frustum * -0.5,
          actualAspect * frustum * 0.5,
          frustum * 0.5,
          frustum * -0.5,
        ];
        camera.updateProjectionMatrix();
      }
    }
  }

  /**
   * 根据当前配置和窗口大小调整渲染器、composer 和相机的大小。
   */
  resize() {
    const { base } = this;
    const { renderer, camera, composer } = base;
    // 调整渲染器大小
    this.resizeRenderer(renderer);
    // 调整composer大小
    if (composer) {
      this.resizeComposer(composer);
    }
    // 调整相机参数
    this.resizeCamera(camera);
    // 自动适应移动设备
    if (this.autoAdaptMobile) {
      this.adaptMobile();
    }
    this.emit("resize");
  }

  /**
   * 监听窗口大小改变事件，触发resize方法。
   */
  listenForResize() {
    window.addEventListener("resize", () => {
      if (!this.enabled) {
        return;
      }
      this.resize();
    });
  }

  /**
   * 启用大小调整功能。
   */
  enable() {
    this.enabled = true;
  }

  /**
   * 禁用大小调整功能。
   */
  disable() {
    this.enabled = false;
  }

  /**
   * 根据设备方向调整渲染器和相机，确保最佳显示效果。
   */
  adaptMobile() {
    const { base } = this;
    const { renderer, camera } = base;
    const width = document.documentElement.clientWidth,
      height = document.documentElement.clientHeight;
    if (width > height) {
      renderer.setSize(width, height);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    } else {
      renderer.setSize(height, width);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = height / width;
        camera.updateProjectionMatrix();
      }
    }
  }
}

export { Resizer };
