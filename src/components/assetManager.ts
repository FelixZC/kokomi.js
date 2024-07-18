import * as THREE from "three";
import {
  DRACOLoader,
  EXRLoader,
  // FBXLoader,
  FontLoader,
  GLTFLoader,
  KTX2Loader,
  OBJLoader,
  RGBELoader,
  SVGLoader,
  MeshoptDecoder,
} from "three-stdlib";
import { FBXLoader } from "../lib";
import { Component } from "./component";
import { Base } from "../base/base";
import { loadVideoTexture } from "../utils";

/**
 * 资源类型的枚举，定义了支持的各类资源类型。
 */
export type ResoureType =
  | "gltfModel"
  | "texture"
  | "cubeTexture"
  | "font"
  | "fbxModel"
  | "audio"
  | "objModel"
  | "hdrTexture"
  | "svg"
  | "exrTexture"
  | "video"
  | "ktx2Texture";

/**
 * 资源项的接口，描述了每个资源的属性，包括名称、类型和路径。
 */
export interface ResourceItem {
  name: string;
  type: ResoureType;
  path: string | string[];
}

/**
 * 资源列表的类型定义，是一个资源项的数组。
 */
export type ResoureList = ResourceItem[];

/**
 * 加载器的接口，定义了各种资源加载器的属性。
 */
export interface Loaders {
  gltfLoader: GLTFLoader;
  textureLoader: THREE.TextureLoader;
  cubeTextureLoader: THREE.CubeTextureLoader;
  fontLoader: FontLoader;
  fbxLoader: FBXLoader;
  audioLoader: THREE.AudioLoader;
  objLoader: OBJLoader;
  hdrTextureLoader: RGBELoader;
  svgLoader: SVGLoader;
  exrLoader: EXRLoader;
  ktx2Loader: KTX2Loader;
}

/**
 * 资产管理器的配置接口，包括是否使用DracoLoader和MeshoptDecoder以及它们的路径。
 */
export interface AssetManagerConfig {
  useDracoLoader: boolean;
  useMeshoptDecoder: boolean;
  dracoDecoderPath: string;
  ktx2TranscoderPath: string;
}

/**
 * 资产管理器类，负责加载和管理各种类型的资源。
 * 
 * @extends Component 继承自组件基类。
 */
class AssetManager extends Component {
  config: AssetManagerConfig;
  resourceList: ResoureList;
  items: any;
  toLoad: number;
  loaded: number;
  loaders: Partial<Loaders>;

  /**
   * 创建一个AssetManager实例。
   * 
   * @param base 父基类实例。
   * @param list 资源列表。
   * @param config 资产管理器的配置项。
   */
  constructor(
    base: Base,
    list: ResoureList,
    config: Partial<AssetManagerConfig> = {}
  ) {
    super(base);
    const {
      useDracoLoader = false,
      useMeshoptDecoder = false,
      dracoDecoderPath = "https://unpkg.com/three/examples/jsm/libs/basis/draco/",
      ktx2TranscoderPath = "https://unpkg.com/three/examples/jsm/libs/basis/",
    } = config;
    this.config = {
      useDracoLoader,
      useMeshoptDecoder,
      dracoDecoderPath,
      ktx2TranscoderPath,
    };
    this.resourceList = list;
    this.items = {};
    this.toLoad = list.length;
    this.loaded = 0;
    this.loaders = {};
    this.setLoaders();
    if (useDracoLoader) {
      this.setDracoLoader();
    }
    if (useMeshoptDecoder) {
      this.setMeshoptDecoder();
    }
    this.setKTX2Loader();
    this.startLoading();
  }
  // 设置加载器
  setLoaders() {
    this.loaders.gltfLoader = new GLTFLoader();
    this.loaders.textureLoader = new THREE.TextureLoader();
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.loaders.fontLoader = new FontLoader();
    // @ts-ignore
    this.loaders.fbxLoader = new FBXLoader();
    this.loaders.audioLoader = new THREE.AudioLoader();
    this.loaders.objLoader = new OBJLoader();
    this.loaders.hdrTextureLoader = new RGBELoader();
    this.loaders.svgLoader = new SVGLoader();
    this.loaders.exrLoader = new EXRLoader();
    this.loaders.ktx2Loader = new KTX2Loader();
  }
  // 设置draco加载器
  setDracoLoader() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(this.config.dracoDecoderPath);
    this.loaders.gltfLoader?.setDRACOLoader(dracoLoader);
  }
  // 设置meshopt解码器
  setMeshoptDecoder() {
    const meshoptDecoder = MeshoptDecoder();
    this.loaders.gltfLoader?.setMeshoptDecoder(meshoptDecoder);
  }
  // 设置ktx2转码器
  setKTX2Loader() {
    this.loaders.ktx2Loader
      ?.setTranscoderPath(this.config.ktx2TranscoderPath)
      ?.detectSupport(this.base.renderer);
    if (this.loaders.ktx2Loader) {
      this.loaders.gltfLoader?.setKTX2Loader(this.loaders.ktx2Loader);
    }
  }
  // 开始加载
  startLoading() {
    for (const resource of this.resourceList) {
      if (resource.type === "gltfModel") {
        this.loaders.gltfLoader?.load(resource.path as string, (file) => {
          this.resourceLoaded(resource, file);
        });
      } else if (resource.type === "texture") {
        this.loaders.textureLoader?.load(resource.path as string, (file) => {
          this.resourceLoaded(resource, file);
        });
      } else if (resource.type === "cubeTexture") {
        this.loaders.cubeTextureLoader?.load(
          resource.path as string[],
          (file) => {
            this.resourceLoaded(resource, file);
          },
        );
      } else if (resource.type === "font") {
        this.loaders.fontLoader?.load(resource.path as string, (file) => {
          this.resourceLoaded(resource, file);
        });
      } else if (resource.type === "fbxModel") {
        // @ts-ignore
        this.loaders.fbxLoader?.load(resource.path as string, (file) => {
          this.resourceLoaded(resource, file);
        });
      } else if (resource.type === "audio") {
        this.loaders.audioLoader?.load(resource.path as string, (file) => {
          this.resourceLoaded(resource, file);
        });
      } else if (resource.type === "objModel") {
        this.loaders.objLoader?.load(resource.path as string, (file) => {
          this.resourceLoaded(resource, file);
        });
      } else if (resource.type === "hdrTexture") {
        this.loaders.hdrTextureLoader?.load(resource.path as string, (file) => {
          this.resourceLoaded(resource, file);
        });
      } else if (resource.type === "svg") {
        this.loaders.svgLoader?.load(resource.path as string, (file) => {
          this.resourceLoaded(resource, file);
        });
      } else if (resource.type === "exrTexture") {
        this.loaders.exrLoader?.load(resource.path as string, (file) => {
          this.resourceLoaded(resource, file);
        });
      } else if (resource.type === "video") {
        loadVideoTexture(resource.path as string).then((file) => {
          this.resourceLoaded(resource, file);
        });
      } else if (resource.type === "ktx2Texture") {
        this.loaders.ktx2Loader?.load(resource.path as string, (file) => {
          this.resourceLoaded(resource, file);
        });
      }
    }
  }
  // 加载完单个素材
  resourceLoaded(resource: ResourceItem, file: any) {
    this.items[resource.name] = file;
    this.loaded += 1;
    if (this.isLoaded) {
      this.emit("ready");
    }
  }
  // 加载进度
  get loadProgress() {
    return this.loaded / this.toLoad;
  }
  // 是否加载完毕
  get isLoaded() {
    return this.loaded === this.toLoad;
  }
}
export { AssetManager };
