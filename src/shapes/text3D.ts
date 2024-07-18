import {
  Font,
  FontLoader,
  TextGeometry,
  TextGeometryParameters,
} from "three-stdlib";
import type { Base } from "../base/base";
import { CustomMesh, CustomMeshConfig } from "./customMesh";
const defaultFontUrl =
  "https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_regular.typeface.json";
/**
 * 从给定的字体URL或默认字体URL加载Font对象。
 * @param url 字体文件的URL，默认为Helvetiker常规字体的URL。
 * @returns 返回Promise，解析后得到Font对象。
 */
const loadFont = (url = defaultFontUrl): Promise<Font> => {
  return new Promise((resolve) => {
    new FontLoader().load(url, (font) => {
      resolve(font);
    });
  });
};
/**
 * 使用`TextGeometry`渲染3D文本的网格模型。
 *
 * 示例: https://kokomi-js.vercel.app/examples/#text3D
 */
class Text3D extends CustomMesh {
  /**
   * 初始化一个显示3D文本的Text3D实例。
   * @param base 基础Base对象。
   * @param text 要渲染的文本字符串。
   * @param font 文本所用的Font对象。
   * @param textParams 控制文本外观的参数对象，默认提供了一组基本配置。
   * @param config 自定义Mesh的额外配置信息。
   */
  constructor(
    base: Base,
    text: string,
    font: Font,
    textParams: TextGeometryParameters = {
      size: 0.5,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      // @ts-ignore 忽略类型检查，因为bevelSegments未在类型定义中声明
      bevelSegments: 5,
    },
    config: Partial<CustomMeshConfig> = {},
  ) {
    super(base, {
      geometry: new TextGeometry(text, { ...textParams, font }), // 使用提供的文本、字体及参数创建几何体
      ...config, // 合并自定义配置
    });
  }
}
// 导出loadFont函数和Text3D类以供外部使用
export { loadFont, Text3D };
