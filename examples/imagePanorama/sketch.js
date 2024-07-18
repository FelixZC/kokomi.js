/**
 * 导入kokomi库，用于创建全景图像查看器。
 */
import * as kokomi from "kokomi.js";
/**
 * 导入THREE库，用于处理3D图形和场景。
 */
import * as THREE from "three";
/**
 * 导入gsap库，用于平滑的动画过渡效果。
 */
import gsap from "gsap";
/**
 * 导入dat.gui库，用于创建用户界面以控制参数。
 */
import * as dat from "lil-gui";

/**
 * Sketch类继承自kokomi.Base，用于创建全景图像演示。
 */
class Sketch extends kokomi.Base {
  /**
   * 创建函数，初始化全景图像查看器和资源管理器。
   */
  create() {
    /**
     * 创建kokomi的Viewer实例，用于显示全景图像。
     */
    const viewer = new kokomi.Viewer(this);

    /**
     * 创建kokomi的AssetManager实例，用于加载全景图像资源。
     */
    const am = new kokomi.AssetManager(this, [
      {
        name: "panoramaImage",
        type: "texture",
        path: "https://s2.loli.net/2023/02/10/yuOEkBgKmTvQi3b.jpg",
      },
    ]);
    /**
     * 资源加载完成后的处理逻辑。
     */
    am.on("ready", () => {
      // 隐藏加载屏幕
      document.querySelector(".loader-screen").classList.add("hollow");

      /**
       * 获取加载的全景图像资源。
       */
      const panoramaImage = am.items["panoramaImage"];
      // 设置图像的颜色空间
      panoramaImage.colorSpace = THREE.SRGBColorSpace;
      /**
       * 创建全景图像对象，并将其添加到查看器。
       */
      const panorama = new kokomi.ImagePanorama(this, panoramaImage);
      viewer.add(panorama);
    });
  }
}