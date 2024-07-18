/**
 * Sketch类继承自kokomi.Base，用于创建一个三维Sketch场景。
 */
import * as kokomi from "kokomi.js";
import * as THREE from "three";
import gsap from "gsap";
import * as dat from "lil-gui";

class Sketch extends kokomi.Base {
  /**
   * 创建场景中的物体和灯光。
   */
  create() {
    // 设置相机位置
    this.camera.position.set(1, 1, 2);

    // 初始化轨道控制，用于相机的交互控制
    new kokomi.OrbitControls(this);

    // 创建一个双曲螺线体几何体
    const geometry = new kokomi.HyperbolicHelicoidGeometry(128, 128);
    // 创建一个标准材质，用于渲染几何体
    const material = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
    });
    // 创建一个网格对象，并将几何体和材质应用到它上
    const mesh = new THREE.Mesh(geometry, material);
    // 将网格添加到场景中
    this.scene.add(mesh);

    // 添加环境光，用于整体照明
    const ambiLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambiLight);
    // 添加方向光，用于产生阴影和立体感
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    // 设置方向光的位置
    dirLight.position.set(1, 2, 3);
    this.scene.add(dirLight);
  }
}