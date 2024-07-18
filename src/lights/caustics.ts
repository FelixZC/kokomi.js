import * as THREE from "three";
import { FullScreenQuad } from "three-stdlib";
import { Component } from "../components/component";
import { Base } from "../base/base";
import { FBO } from "../renderTargets";
import { getBound, getBoundsVertices } from "../utils";
export interface CausticsConfig {
  lightSource: THREE.Vector3;
  intensity: number;
  normalMaterial: THREE.MeshNormalMaterial;
  ior: number;
  chromaticAberration: number;
  samples: number;
  saturation: number;
  noiseIntensity: number;
  scaleCorrection: number;
}
const vertexShader = /* glsl */ `
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
varying vec2 vUv;
varying vec3 vWorldPosition;
void main(){
   vec3 p=position;
   gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
   
   vUv=uv;
   vWorldPosition=vec3(modelMatrix*vec4(p,1));
}
`;
// 定义一个片段着色器程序
const fragmentShader = /* glsl */ `
#ifndef saturate
#define saturate(a)clamp(a,0.,1.)
#endif
// 时间统一量，用于动画效果
uniform float iTime;
// 分辨率统一量，用于根据屏幕大小进行调整
uniform vec3 iResolution;
// 鼠标统一量，用于交互效果
uniform vec4 iMouse;
// UV坐标变量，用于纹理映射
varying vec2 vUv;
// 世界空间位置变量，用于计算光照
varying vec3 vWorldPosition;
// 正常贴图统一量，用于获取表面法线
uniform sampler2D uNormalTexture;
// 光源位置统一量，用于计算光照方向
uniform vec3 uLightPosition;
// 光照强度统一量，用于控制亮度
uniform float uIntensity;
// 折射率统一量，用于计算光的折射
uniform float uIor;

void main() {
   vec2 uv=vUv;

   // 从正常贴图中获取表面法线，并归一化
   vec3 normal=normalize(texture(uNormalTexture,uv).xyz);
   // 计算光线方向
   vec3 lightDir=normalize(uLightPosition);

   // 根据折射率计算折射光线方向
   vec3 ray=refract(lightDir,normal,1./uIor);

   // 计算原始位置和新的位置
   vec3 oldPos=vWorldPosition;
   vec3 newPos=vWorldPosition+ray;

   // 计算原始面积和新面积
   // https://medium.com/@evanwallace/rendering-realtime-caustics-in-webgl-2a99a29a0b2c
   float oldArea=length(dFdx(oldPos))*length(dFdy(oldPos));
   float newArea=length(dFdx(newPos))*length(dFdy(newPos));

   // 根据面积变化和光照强度计算光照效果
   float result=saturate(oldArea/newArea)*uIntensity;
   // 使用指数函数增强光照效果
   result=pow(result,2.);

   // 设置片段颜色
   gl_FragColor=vec4(vec3(result),1.);
}
`;
// 定义一个顶点着色器的GLSL代码片段
// 该片段主要负责计算顶点的位置和纹理坐标
const vertexShader2 = /* glsl */ `
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
varying vec2 vUv;
void main(){
   vec3 p=position;
   gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);

   vUv=uv;
}
`;

// 定义一个片段着色器的GLSL代码片段
// 该片段主要负责根据纹理和一些参数计算像素的颜色
const fragmentShader2 = /* glsl */ `
uniform float iTime; // 时间统一变量
uniform vec3 iResolution; // 分辨率统一变量
uniform vec4 iMouse; // 鼠标状态统一变量
varying vec2 vUv; // 纹理坐标变量
uniform sampler2D uTexture; // 输入纹理统一变量
uniform float uCa; // 颜色偏移量
uniform float uSaturation; // 饱和度控制
uniform float uNoiseIntensity; // 噪声强度控制

// 函数用于调整颜色的饱和度
vec3 saturation(vec3 rgb,float adjustment){
   const vec3 W=vec3(.2125,.7154,.0721); // 用于计算亮度的权重常量
   vec3 intensity=vec3(dot(rgb,W)); // 计算颜色的亮度
   return mix(intensity,rgb,adjustment); // 按调整值混合亮度和原颜色
}

// 函数生成一个基于坐标co的随机数
highp float random(vec2 co)
{
   highp float a=12.9898;
   highp float b=78.233;
   highp float c=43758.5453;
   highp float dt=dot(co.xy,vec2(a,b));
   highp float sn=mod(dt,3.14);
   return fract(sin(sn)*c);
}

void main(){
   vec2 uv=vUv; // 获取纹理坐标
   vec3 col=vec3(0.); // 初始化颜色变量
   // 对每个样本进行处理
   for(int i=0;i<SAMPLES;i++){
       // 生成噪声并应用到滑块位置
       float noise=random(uv)*uNoiseIntensity;
       float slide=float(i)/float(SAMPLES)*.1+noise;

       vec2 dir=vec2(1.); // 定义采样方向
       dir=i%2==0?vec2(-.5,0.):vec2(0.,.5); // 根据样本索引交替方向

       // 从纹理中采样红、绿、蓝分量
       float R=texture(uTexture,uv+(uCa*slide*dir*1.)).r;
       float G=texture(uTexture,uv+(uCa*slide*dir*2.)).g;
       float B=texture(uTexture,uv+(uCa*slide*dir*3.)).b;
       // 累加颜色分量
       col.r+=R;
       col.g+=G;
       col.b+=B;
   }
   // 平均颜色值
   col/=float(SAMPLES);
   // 调整颜色饱和度
   col=saturation(col,uSaturation);

   gl_FragColor=vec4(col,1.); // 设置最终的颜色值
}
`;
/**
 * Reference: https://blog.maximeheckel.com/posts/caustics-in-webgl/
 * 波纹效果类，用于在三维场景中添加折射和反射效果。
 * 通过模拟水面上的波纹来增强场景的真实感。
 */
class Caustics extends Component {
  // 波纹效果的物体组
  group: THREE.Group;
  // 渲染波纹效果的场景
  scene: THREE.Scene;
  // 光源位置，用于计算焦散效果
  lightSource: THREE.Vector3;
  // 光源强度
  intensity: number;
  // 物体表面的正常材质
  normalMaterial: THREE.MeshNormalMaterial;
  // 物体的折射率，影响焦散效果
  ior: number;
  // 色差，用于产生彩虹效果
  chromaticAberration: number;
  // 投射到屏幕上的样本数量，影响效果质量和性能
  samples: number;
  // 色彩饱和度，影响焦散颜色的强度
  saturation: number;
  // 噪声强度，用于产生随机扰动
  noiseIntensity: number;
  // 缩放修正，用于调整物体的缩放比例
  scaleCorrection: number;
  // 用于渲染焦散效果的着色器材质
  material: THREE.ShaderMaterial;
  // 用于存储正常映射的帧缓冲区对象
  causticsPlane: THREE.Mesh;
  // 用于存储正常映射的帧缓冲区
  normalFBO: FBO;
  // 用于存储焦散计算的帧缓冲区相机
  normalCamera: THREE.PerspectiveCamera;
  // 用于存储焦散计算的帧缓冲区对象
  causticsFBO: FBO;
  // 用于执行焦散计算的着色器材质
  causticsComputeMaterial: THREE.ShaderMaterial;
  // 用于全屏渲染的四边形物体
  causticsQuad: FullScreenQuad;
  // 边界信息，用于调整波纹平面的位置和大小
  bound!: ReturnType<typeof getBound>;

  /**
   * Caustics类的构造函数。
   * 
   * @param base 基础类实例，提供渲染器和其他基础功能
   * @param config 配置对象，用于初始化类的属性
   */
  constructor(base: Base, config: Partial<CausticsConfig> = {}) {
    super(base);
    // 从配置对象中解析属性值，提供默认值
    const {
      lightSource = new THREE.Vector3(-10, 13, -10),
      intensity = 0.5,
      normalMaterial = new THREE.MeshNormalMaterial(),
      ior = 1.25,
      chromaticAberration = 0.16,
      samples = 16,
      saturation = 1.265,
      noiseIntensity = 0.01,
      scaleCorrection = 1.75,
    } = config;
    // 设置类的属性
    this.lightSource = lightSource;
    this.intensity = intensity;
    this.normalMaterial = normalMaterial;
    this.ior = ior;
    this.chromaticAberration = chromaticAberration;
    this.samples = samples;
    this.saturation = saturation;
    this.noiseIntensity = noiseIntensity;
    this.scaleCorrection = scaleCorrection;

    // 初始化用于展示波纹效果的物体组和场景
    const group = new THREE.Group();
    this.group = group;
    const scene = new THREE.Scene();
    this.scene = scene;
    group.add(this.scene);

    // 创建并配置用于渲染焦散效果的Mesh物体
    const geometry = new THREE.PlaneGeometry();
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader2,
      fragmentShader: fragmentShader2,
      transparent: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTexture: {
          value: null,
        },
        uCa: {
          value: this.chromaticAberration,
        },
        uSaturation: {
          value: this.saturation,
        },
        uNoiseIntensity: {
          value: this.noiseIntensity,
        },
      },
      defines: {
        SAMPLES: this.samples,
      },
    });
    this.material = material;
    const causticsPlane = new THREE.Mesh(geometry, material);
    this.causticsPlane = causticsPlane;
    // 调整波纹平面的初始位置和朝向
    this.causticsPlane.rotation.set(-Math.PI / 2, 0, 0);
    this.causticsPlane.position.set(5, 0, 5);
    this.causticsPlane.scale.setScalar(10);
    this.group.add(this.causticsPlane);

    // 初始化用于存储正常映射的帧缓冲区对象和相机
    const normalFBO = new FBO(this.base);
    this.normalFBO = normalFBO;
    const normalCamera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);
    this.normalCamera = normalCamera;

    // 初始化用于存储焦散计算结果的帧缓冲区对象和着色器材质
    const causticsFBO = new FBO(this.base);
    this.causticsFBO = causticsFBO;
    const causticsComputeMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uNormalTexture: {
          value: null,
        },
        uLightPosition: {
          value: this.lightSource,
        },
        uIntensity: {
          value: this.intensity,
        },
        uIor: {
          value: this.ior,
        },
      },
    });
    this.causticsComputeMaterial = causticsComputeMaterial;

    // 创建用于全屏渲染的四边形物体
    const causticsQuad = new FullScreenQuad(causticsComputeMaterial);
    this.causticsQuad = causticsQuad;
  }

  /**
   * 将波纹效果组添加到容器中。
   */
  addExisting() {
    this.container.add(this.group);
  }

  /**
   * 向场景中添加对象。
   * 
   * @param object 需要添加到场景中的THREE.Object3D对象。
   */
  add(...object: THREE.Object3D[]) {
    this.scene.add(...object);
  }


  /**
   * 调整波纹平面的位置和规模，以适应场景的边界。
   */
  adjustPlane() {
    const bounds = this.bound.boundingBox;
    const boundsVertices = getBoundsVertices(bounds);
    const lightDir = this.lightSource.clone().normalize();
    const newVertices = boundsVertices.map((vert) =>
      vert.add(lightDir.clone().multiplyScalar(-vert.y / lightDir.y)),
    );
    const centerPos = newVertices
      .reduce((a, b) => a.add(b), new THREE.Vector3(0, 0, 0))
      .divideScalar(newVertices.length);
    this.causticsPlane.position.copy(centerPos);
    const scale = newVertices
      .map((vert) => Math.hypot(vert.x - centerPos.x, vert.z - centerPos.z))
      .reduce((a, b) => Math.max(a, b), 0);
    this.causticsPlane.scale.setScalar(scale * this.scaleCorrection);
  }

  /**
   * 更新波纹效果，包括正常映射和焦散计算。
   */
  update() {
    const bound = getBound(this.scene);
    this.bound = bound;
    this.adjustPlane();
    // 更新材质参数
    this.material.uniforms.uCa.value = this.chromaticAberration;
    this.material.defines.SAMPLES = this.samples;
    this.material.uniforms.uSaturation.value = this.saturation;
    this.material.uniforms.uNoiseIntensity.value = this.noiseIntensity;
    // 设置正常映射相机和渲染目标
    this.normalCamera.position.copy(this.lightSource);
    this.normalCamera.lookAt(this.bound.center);
    this.scene.overrideMaterial = this.normalMaterial;
    this.scene.overrideMaterial.side = THREE.BackSide;
    this.base.renderer.setRenderTarget(this.normalFBO.rt);
    this.base.renderer.render(this.scene, this.normalCamera);
    this.scene.overrideMaterial = null;
    // 进行焦散计算
    this.causticsComputeMaterial.uniforms.uNormalTexture.value =
      this.normalFBO.rt.texture;
    this.causticsComputeMaterial.uniforms.uLightPosition.value =
      this.lightSource;
    this.causticsComputeMaterial.uniforms.uIntensity.value = this.intensity;
    this.causticsComputeMaterial.uniforms.uIor.value = this.ior;
    this.causticsQuad.material = this.causticsComputeMaterial;
    this.base.renderer.setRenderTarget(this.causticsFBO.rt);
    this.causticsQuad.render(this.base.renderer);
    (
      this.causticsPlane.material as THREE.ShaderMaterial
    ).uniforms.uTexture.value = this.causticsFBO.rt.texture;
    this.base.renderer.setRenderTarget(null);
  }
}
export { Caustics };
