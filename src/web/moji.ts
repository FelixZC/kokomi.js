import * as THREE from "three";
import { Scroller } from "maku.js";
import type { Base } from "../base/base";
import { Component } from "../components/component";
import { UniformInjector } from "../components/uniformInjector";
import { AllMaterialParams } from "../lib/THREE-CustomShaderMaterial";
import { TextMesh } from "../shapes";

/**
 * Moji配置接口
 * 定义了创建Moji对象所需的各种配置参数
 */
export interface MojiConfig {
  elList: HTMLElement[];
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [uniform: string]: THREE.IUniform<any> };
  textMeshConfig: any;
  isScrollPositionSync: boolean;
  scroller: Scroller;
  materialParams: AllMaterialParams;
}

// 默认的顶点着色器，用于没有指定顶点着色器的情况
const defaultVertexShader = /* glsl */ `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
varying vec2 vUv;
void main(){
   vec3 p=position;
   gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);

   vUv=uv;
}
`;

// 默认的片段着色器，用于没有指定片段着色器的情况
const defaultFragmentShader = /* glsl */ `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
varying vec2 vUv;
void main(){
   vec2 p=vUv;
   vec3 color=vec3(p,0.);
   gl_FragColor=vec4(color,1.);
}
`;

/**
 * Moji类
 * 用于将TextMesh对象与HTML元素同步的位置
 */
class Moji {
  el: HTMLElement;
  textMesh: TextMesh;
  rect: DOMRect;
  constructor(el: HTMLElement, textMesh: TextMesh) {
    this.el = el;
    this.textMesh = textMesh;
    const rect = el.getBoundingClientRect();
    this.rect = rect;
  }
  /**
   * 设置TextMesh的位置
   * @param deltaY 垂直滚动位置的偏移量，默认为window.scrollY
   */
  setPosition(deltaY = window.scrollY) {
    const { textMesh, rect } = this;
    const { mesh } = textMesh;
    const { x, y, height } = rect;
    const px = x - window.innerWidth / 2;
    const py = -(y + height / 2 - window.innerHeight / 2) + deltaY;
    mesh.position.set(px, py, 0);
  }
}

/**
 * MojiGroup类
 * 用于管理一组Moji对象，实现多个TextMesh与HTML元素的同步
 */
class MojiGroup extends Component {
  elList: HTMLElement[];
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [uniform: string]: THREE.IUniform<any> };
  textMeshConfig: any;
  isScrollPositionSync: boolean;
  textMeshMaterial: THREE.ShaderMaterial | null;
  mojis: Moji[];
  scroller: Scroller | null;
  uniformInjector: UniformInjector;
  materialParams: AllMaterialParams;
  useSelfScroller: boolean;
  constructor(base: Base, config: Partial<MojiConfig> = {}) {
    super(base);
    const {
      elList = [...document.querySelectorAll(".webgl-text")],
      vertexShader = defaultVertexShader,
      fragmentShader = defaultFragmentShader,
      uniforms = {},
      textMeshConfig = {},
      isScrollPositionSync = true,
      scroller = null,
      materialParams = {},
    } = config;
    this.elList = elList as HTMLElement[];
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.uniforms = uniforms;
    this.textMeshConfig = textMeshConfig;
    this.isScrollPositionSync = isScrollPositionSync;
    this.textMeshMaterial = null;
    this.mojis = [];
    this.scroller = scroller;
    this.materialParams = materialParams;
    const uniformInjector = new UniformInjector(base);
    this.uniformInjector = uniformInjector;
    this.useSelfScroller = false;
    if (!scroller) {
      this.useSelfScroller = true;
    }
  }
  /**
   * 添加已存在的HTML元素对应的TextMesh
   */
  addExisting() {
    const { uniformInjector } = this;
    const textMeshMaterial = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        ...{
          uTextColor: {
            value: new THREE.Color("black"),
          },
        },
        ...uniformInjector.shadertoyUniforms,
        ...this.uniforms,
      },
      ...this.materialParams,
    });
    this.textMeshMaterial = textMeshMaterial;
    const mojis = this.elList.map((el, i) => {
      const tm = new TextMesh(this.base, el.innerText.trim());
      tm.mesh.material = textMeshMaterial.clone();
      tm.container = this.container;
      tm.addExisting();
      const styleFontSize = window
        .getComputedStyle(el, null)
        .getPropertyValue("font-size");
      const fontSize = parseFloat(styleFontSize);
      tm.mesh.fontSize = fontSize;
      const styleTextAlign = window
        .getComputedStyle(el, null)
        .getPropertyValue("text-align");
      const alignMap = {
        start: "left",
        end: "right",
        center: "center",
      };
      tm.mesh.anchorX = (alignMap as any)[styleTextAlign];
      const color = el.dataset["webglTextColor"] || "black";
      tm.mesh.material.uniforms.uTextColor.value = new THREE.Color(color);
      const font = el.dataset["webglFontUrl"] || "";
      if (font) {
        tm.mesh.font = font;
      }
      const fontWeight = el.dataset["webglFontWeight"] || "";
      if (fontWeight) {
        tm.mesh.fontWeight = fontWeight;
      }
      const letterSpacing = this.textMeshConfig.letterSpacing;
      if (letterSpacing) {
        tm.mesh.letterSpacing = letterSpacing;
      }
      const moji = new Moji(el, tm);
      return moji;
    });
    this.mojis = mojis;
    // 同步文字位置
    this.mojis.forEach((moji) => {
      moji.setPosition();
    });
    // 使用内置的滚动监听器
    if (this.useSelfScroller) {
      const scroller = new Scroller();
      this.scroller = scroller;
      this.scroller.listenForScroll();
    }
    // 处理窗口大小改变事件
    this.base.resizer.on("resize", () => {
      mojis.forEach((moji) => {
        moji.rect = moji.el.getBoundingClientRect();
      });
    });
  }
  /**
   * 更新MojiGroup的状态
   * 用于同步滚动位置和更新uniforms
   */
  update() {
    const { scroller, mojis } = this;
    scroller?.syncScroll();
    mojis.forEach((moji) => {
      const material = moji.textMesh.mesh.material as THREE.ShaderMaterial;
      const uniforms = material.uniforms;
      this.uniformInjector.injectShadertoyUniforms(uniforms);
      if (this.isScrollPositionSync) {
        if (moji.el.classList.contains("webgl-fixed")) {
          // 固定元素位置不随滚动同步
          moji.setPosition(0);
        } else {
          // 滚动元素位置随滚动同步
          moji.setPosition(scroller?.scroll.current);
        }
      }
    });
  }
}

export { Moji, MojiGroup };