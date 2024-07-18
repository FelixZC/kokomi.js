import * as kokomi from "kokomi.js";
import * as THREE from "three";
import gsap from "gsap";
import * as dat from "lil-gui";

/**
 * Sketch类继承自kokomi.Base，用于创建一个3D绘图实例。
 * 该类使用Three.js和gpgpu技术进行3D渲染和动画处理。
 */
class Sketch extends kokomi.Base {
  /**
   * 创建Sketch实例时，初始化3D场景、摄像机、控制器、以及用于gpgpu计算的纹理和变量。
   */
  create() {
    // 设置摄像机的初始位置
    this.camera.position.set(0, 0, 2);

    // 初始化轨道控制器，用于交互式控制摄像机视角
    new kokomi.OrbitControls(this);

    // 定义gpgpu计算所需的参数
    const params = {
      width: 128,
      pointSize: 4,
      amplitude: 0.002,
      frequency: 1,
    };

    // 解构参数，以便在后续代码中使用
    const { width, pointSize, amplitude, frequency } = params;

    // 初始化gpgpu计算环境
    // gpgpu
    const gpgpu = new kokomi.GPUComputer(this, {
      width,
    });

    // 创建一个用于存储位置数据的纹理
    const posDt = gpgpu.createTexture();

    // 生成一个球体几何体，用于获取随机点的位置数据
    const geo = new THREE.SphereGeometry(1, 128, 128);
    const posBuffer = geo.attributes.position.array;
    const vertCount = posBuffer.length / 3;

    // 随机填充位置纹理的数据
    const posDtData = posDt.image.data;
    kokomi.iterateBuffer(
      posDtData,
      posDtData.length,
      (arr, axis) => {
        const rand = Math.floor(Math.random() * vertCount);
        arr[axis.x] = posBuffer[rand * 3];
        arr[axis.y] = posBuffer[rand * 3 + 1];
        arr[axis.z] = posBuffer[rand * 3 + 2];
        arr[axis.w] = 1;
      },
      4
    );

    // 创建一个用于计算位置变化的变量
    // pos Variable
    const posVar = gpgpu.createVariable(
      "texturePosition",
      computeShader,
      posDt,
      {
        uAmplitude: {
          value: amplitude,
        },
        uFrequency: {
          value: frequency,
        },
      }
    );

    // 初始化gpgpu计算
    // init gpgpu
    gpgpu.init();

    // 创建一个缓冲几何体，用于存储点的位置和参考坐标
    // geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(width * width * 3);
    const reference = new Float32Array(width * width * 2);
    for (let i = 0; i < width * width; i++) {
      const x = Math.random();
      const y = Math.random();
      const z = Math.random();
      positions.set([x, y, z], i * 3);
      const xx = (i % width) / width;
      const yy = Math.floor(i / width) / width;
      reference.set([xx, yy], i * 2);
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("reference", new THREE.BufferAttribute(reference, 2));

    // 创建自定义点材质和点对象
    // custom points
    const cp = new kokomi.CustomPoints(this, {
      baseMaterial: new THREE.ShaderMaterial(),
      geometry,
      vertexShader,
      fragmentShader,
      materialParams: {
        side: THREE.DoubleSide,
      },
      uniforms: {
        uPositionTexture: {
          value: null,
        },
        uPointSize: {
          value: pointSize,
        },
      },
    });
    cp.addExisting();

    // 更新函数，用于每帧更新点的位置纹理
    this.update(() => {
      const mat = cp.points.material;
      mat.uniforms.uPositionTexture.value = gpgpu.getVariableRt(posVar);
    });
  }
}