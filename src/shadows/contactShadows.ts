
/**
 * 联系阴影组件类，用于生成和管理场景中的接触阴影。
 * 接触阴影是指当两个物体近距离接触时产生的阴影，能为场景增添更多真实感。
 * 此类继承自Component基类，便于在Three.js项目中集成和使用。
 *
 * @param base - 组件所属的基础对象，通常是一个场景或一个更大的容器对象。
 * @param config - 配置对象，用于自定义阴影效果的各种参数。
 */
import * as THREE from "three";
import type { Base } from "../base/base";
import { Component } from "../components/component";
import { HorizontalBlurShader, VerticalBlurShader } from "three-stdlib";
export interface ContactShadowsConfig {
  opacity: number; // 阴影的不透明度
  width: number; // 阴影平面的宽度
  height: number; // 阴影平面的高度
  blur: number; // 模糊程度
  far: number; // 阴影相机的远裁剪面距离
  smooth: boolean; // 是否应用额外模糊以平滑阴影边缘
  resolution: number; // 渲染目标的分辨率
  frames: number; // 阴影渲染的帧数，Infinity表示持续渲染直到手动停止
  scale: number | [x: number, y: number]; // 阴影缩放比例
  color: THREE.ColorRepresentation; // 阴影颜色
  depthWrite: boolean; // 是否允许深度写入
}
/**
 * 联系阴影组件实现。
 * Credit: https://github.com/mrdoob/three.js/blob/master/examples/webgl_shadow_contact.html
 */
class ContactShadows extends Component {
  frames: number;
  blur: number;
  smooth: boolean;
  shadowCamera: THREE.OrthographicCamera;
  renderTarget: THREE.WebGLRenderTarget;
  renderTargetBlur: THREE.WebGLRenderTarget;
  blurPlane: THREE.Mesh;
  depthMaterial: THREE.MeshDepthMaterial;
  horizontalBlurMaterial: THREE.ShaderMaterial;
  verticalBlurMaterial: THREE.ShaderMaterial;
  count: number;
  group: THREE.Group;
  mesh: THREE.Mesh;
  /**
   * 联系阴影组件的构造函数。
   * 该组件用于生成和处理联系阴影，联系阴影是一种增强场景中物体深度感的视觉效果。
   * @param base 组件的基础对象，用于挂载渲染器等依赖项。
   * @param config 配置对象，用于自定义阴影的各个方面，如大小、模糊程度等。
   */
  constructor(base: Base, config: Partial<ContactShadowsConfig> = {}) {
    super(base);
    // 解构并默认化配置参数，这些参数定义了阴影的属性，如大小、模糊度、颜色等。
    let {
      scale = 10,
      frames = Infinity,
      opacity = 1,
      width = 1,
      height = 1,
      blur = 1,
      far = 10,
      resolution = 512,
      smooth = true,
      color = "#000000",
      depthWrite = false,
    } = config;

    // 初始化组件的属性，这些属性控制着阴影的渲染方式和效果。
    this.frames = frames;
    this.blur = blur;
    this.smooth = smooth;

    // 根据提供的缩放配置调整阴影的宽度和高度。
    width = width * (Array.isArray(scale) ? scale[0] : scale || 1);
    height = height * (Array.isArray(scale) ? scale[1] : scale || 1);

    // 获取渲染器，这是创建阴影效果的基础。
    const gl = this.base.renderer;

    // 创建并配置阴影相机，它定义了阴影的视口和深度范围。
    const shadowCamera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0,
      far,
    );
    this.shadowCamera = shadowCamera;

    // 创建渲染目标，这是存储阴影图像的纹理。
    const renderTarget = new THREE.WebGLRenderTarget(resolution, resolution);
    this.renderTarget = renderTarget;

    // 创建另一个渲染目标，用于模糊处理。
    const renderTargetBlur = new THREE.WebGLRenderTarget(
      resolution,
      resolution,
    );
    this.renderTargetBlur = renderTargetBlur;

    // 配置渲染目标的纹理，关闭Mipmap生成，这是优化性能的常见做法。
    renderTargetBlur.texture.generateMipmaps =
      renderTarget.texture.generateMipmaps = false;

    // 创建一个平面几何体，用于渲染阴影。
    const planeGeometry = new THREE.PlaneGeometry(width, height).rotateX(
      Math.PI / 2,
    );

    // 创建一个用于模糊处理的平面网格。
    const blurPlane = new THREE.Mesh(planeGeometry);
    this.blurPlane = blurPlane;

    // 创建深度材质，用于生成阴影贴图。
    const depthMaterial = new THREE.MeshDepthMaterial();
    this.depthMaterial = depthMaterial;

    // 配置深度材质，关闭深度测试和写入，这是为了确保阴影正确渲染。
    depthMaterial.depthTest = depthMaterial.depthWrite = false;

    // 为深度材质添加自定义着色器代码，用于颜色化阴影。
    depthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        ucolor: {
          value: new THREE.Color(color),
        },
      };
      shader.fragmentShader = shader.fragmentShader.replace(
        `void main() {`, //
        `uniform vec3 ucolor;
        void main() {
       `,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "vec4( vec3( 1.0 - fragCoordZ ), opacity );",
        // Colorize the shadow, multiply by the falloff so that the center can remain darker
        "vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );",
      );
    };

    // 创建水平和垂直模糊材质，这些材质用于通过多次渲染来模糊阴影边缘，增强真实感。
    const horizontalBlurMaterial = new THREE.ShaderMaterial(
      HorizontalBlurShader,
    );
    this.horizontalBlurMaterial = horizontalBlurMaterial;

    const verticalBlurMaterial = new THREE.ShaderMaterial(VerticalBlurShader);
    this.verticalBlurMaterial = verticalBlurMaterial;

    // 关闭模糊材质的深度测试，这是为了确保模糊处理时不干扰阴影的正确渲染。
    verticalBlurMaterial.depthTest = horizontalBlurMaterial.depthTest = false;

    // 初始化计数器，用于跟踪阴影渲染的帧数。
    this.count = 0;

    // 创建一个组对象，用于容纳阴影渲染所需的全部网格和材质。
    const group = new THREE.Group();
    this.group = group;

    // 配置组的旋转，这是为了确保阴影平面与相机的视口匹配。
    group.rotation.x = Math.PI / 2;

    // 创建基本材质，用于在屏幕上显示阴影。
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: renderTarget.texture,
      transparent: true,
      opacity,
      depthWrite,
    });

    // 创建一个网格，用于显示阴影。
    const mesh = new THREE.Mesh(planeGeometry, planeMaterial);
    this.mesh = mesh;

    // 配置网格的缩放和旋转，以适应阴影渲染的需要。
    mesh.scale.set(1, -1, 1);
    mesh.rotation.set(-Math.PI / 2, 0, 0);
  }
  /**
   * 将已存在的阴影相关对象添加到场景中。
   */
  addExisting(): void {
    this.group.add(this.mesh);
    this.group.add(this.shadowCamera);
    this.container.add(this.group);
  }
  /**
   * 对阴影进行模糊处理。
   * 该方法通过水平和垂直两个方向的模糊操作，来实现阴影的模糊效果，提高阴影的视觉真实感。
   * @param blur 模糊的强度。强度越大，阴影的模糊效果越明显。
   */
  blurShadows(blur: number) {
    // 解构获取用于阴影模糊处理的相关对象和材质
    const {
      shadowCamera,
      renderTarget,
      renderTargetBlur,
      blurPlane,
      horizontalBlurMaterial,
      verticalBlurMaterial,
    } = this;
    // 获取渲染器对象
    const gl = this.base.renderer;

    // 启用阴影平面的可见性，用于后续的渲染操作
    blurPlane.visible = true;
    // 设置阴影平面的材质为水平模糊材质
    blurPlane.material = horizontalBlurMaterial;
    // 将渲染目标的纹理赋值给水平模糊材质，作为模糊处理的输入
    horizontalBlurMaterial.uniforms.tDiffuse.value = renderTarget.texture;
    // 设置水平模糊的强度，通过调整模糊的像素步长实现
    horizontalBlurMaterial.uniforms.h.value = (blur * 1) / 256;
    // 设置渲染目标为模糊渲染目标，准备进行模糊处理
    gl.setRenderTarget(renderTargetBlur);
    // 使用阴影相机渲染阴影平面，完成水平模糊处理
    gl.render(blurPlane, shadowCamera);

    // 更改阴影平面的材质为垂直模糊材质
    blurPlane.material = verticalBlurMaterial;
    // 将模糊渲染目标的纹理赋值给垂直模糊材质，作为模糊处理的输入
    verticalBlurMaterial.uniforms.tDiffuse.value = renderTargetBlur.texture;
    // 设置垂直模糊的强度，同样通过调整像素步长实现
    verticalBlurMaterial.uniforms.v.value = (blur * 1) / 256;
    // 将渲染目标重新设置为原始渲染目标，准备接收垂直模糊处理的结果
    gl.setRenderTarget(renderTarget);
    // 再次使用阴影相机渲染阴影平面，完成垂直模糊处理
    gl.render(blurPlane, shadowCamera);
    // 关闭阴影平面的可见性，因为它只是用于模糊处理的中间步骤，并不应该在最终渲染中可见
    blurPlane.visible = false;
  }
  /**
   * 根据指定时间更新阴影效果。
   * 此方法用于动态更新场景中的阴影，通过渲染场景到一个渲染目标来实现。
   * 如果当前帧数未达到设定的最大帧数，或者未设定最大帧数，则会执行阴影的更新。
   * 更新过程包括渲染场景到阴影相机的渲染目标，应用模糊效果，以及根据是否开启平滑选项进行额外的模糊处理。
   * @param time 当前时间戳，用于动画或动态效果的同步。
   */
  update(time: number): void {
    // 解构获取所需的阴影相机、帧数、模糊程度、平滑选项、深度材质和渲染目标。
    let { shadowCamera, frames, blur, smooth, depthMaterial, renderTarget } =
      this;
    // 获取容器场景和WebGL渲染器。
    const scene = this.container;
    const gl = this.base.renderer;

    // 如果阴影相机存在，且帧数为无限或当前帧数未达到设定的帧数上限，则进行阴影更新。
    if (shadowCamera && (frames === Infinity || this.count < frames)) {
      // 保存场景原有的背景和覆盖材质。
      const initialBackground = scene.background;
      const initialOverrideMaterial = scene.overrideMaterial;

      // 设置场景背景为null，以确保在渲染阴影时不会受到场景背景的影响。
      scene.background = null;
      // 使用深度材质覆盖场景的原有材质，以便正确渲染阴影。
      scene.overrideMaterial = depthMaterial;

      // 设置渲染目标为阴影渲染目标，开始渲染场景到该目标。
      gl.setRenderTarget(renderTarget);
      // 使用阴影相机渲染场景。
      gl.render(scene, shadowCamera);

      // 恢复场景的原有覆盖材质。
      scene.overrideMaterial = initialOverrideMaterial;
      // 根据模糊程度进行阴影的模糊处理。
      this.blurShadows(blur);
      // 如果启用了平滑选项，则再次进行模糊处理，以获得更平滑的阴影边缘。
      if (smooth) {
        this.blurShadows(blur * 0.4);
      }

      // 停止使用渲染目标，恢复到默认的屏幕渲染。
      gl.setRenderTarget(null);
      // 恢复场景的原有背景。
      scene.background = initialBackground;

      // 增加帧计数，用于判断是否达到设定的最大帧数。
      this.count += 1;
    }
  }
}
export { ContactShadows };
