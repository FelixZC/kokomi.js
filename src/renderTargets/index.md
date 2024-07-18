### DoubleFBO

- **DoubleFBO** 类是一个双向缓冲区实现，它继承自 `Component` 类。
- 它包含两个 `FBO`（帧缓冲对象）实例，分别用于读取和写入操作。
- 提供了 `swap` 方法，用于在读取和写入缓冲区之间进行切换。

### FBO

- **FBO** 类同样继承自 `Component` 类，用于创建帧缓冲对象。
- 它接受一个 `FBOConfig` 配置对象，包括宽度、高度、采样数、是否启用深度纹理等。
- 使用 Three.js 的 `WebGLRenderTarget` 创建渲染目标，并根据配置动态调整其大小。
- 如果配置中有深度纹理或多重采样，相应的深度纹理和采样值会被设置。

### RenderTexture

- **RenderTexture** 类继承自 `Component` 类，用于将场景渲染到纹理上。
- 它接受一个 `RenderTextureConfig` 配置对象，其中包括场景、相机、纹理宽度、高度等属性。
- 在构造函数中，会创建一个 `FBO` 实例，并将渲染目标的纹理赋值给 `RenderTexture` 的 `texture` 属性。
- `update` 方法用于将指定场景渲染到纹理上，而 `add` 方法允许向渲染纹理的场景中添加对象。

这些类和接口共同构成了一个灵活且功能丰富的渲染目标系统，可以用于多种Web3D应用，如后处理效果、环境映射等。