### BlurPass.ts

`BlurPass` 类用于创建一个模糊通道，它可以用来实现图像的模糊效果。这个类使用了`ConvolutionMaterial`着色器材质来对场景进行模糊处理。

- **构造函数**：接受一个配置对象，包括WebGL渲染器引用、分辨率、宽度、高度、深度阈值和缩放比例等属性。
- **render 方法**：使用提供的输入和输出纹理，以及可选的屏幕渲染目标，执行模糊效果的渲染。

### ConvolutionMaterial.ts

`ConvolutionMaterial` 类扩展了Three.js的`ShaderMaterial`，用于实现卷积模糊效果。

- **构造函数**：接受一个texelSize参数，用于设置材质的像素级偏移量。
- **setTexelSize 和 setResolution 方法**：分别用于设置材质的像素级偏移和分辨率。

### MeshReflectorMaterial.ts

`MeshReflectorMaterial` 类是`MeshStandardMaterial`的扩展，用于创建反射效果的材质。

- **构造函数**：接受一个参数对象，包含用于反射效果的各种属性，如混合模糊、反射强度、纹理矩阵等。
- **onBeforeCompile 方法**：在着色器编译前修改顶点和片段着色器，添加自定义的反射和模糊效果。
- **各种get和set方法**：用于获取和设置材质的属性，如纹理、混合比例、扭曲等。

### 功能概述

- **模糊效果**：`BlurPass` 和 `ConvolutionMaterial` 联合使用，可以实现对场景或特定纹理的模糊效果，这在创建景深、运动模糊等效果时非常有用。
- **反射效果**：`MeshReflectorMaterial` 可以应用于反射表面上，如水面、镜子等，它可以模拟光线在表面的反射效果，包括扭曲和模糊效果。

### 使用场景

- 在3D渲染中，这些类可以用来增强视觉效果，例如实现复杂的后处理效果、动态模糊、景深、水面反射等。
- 它们可以用于游戏开发、电影特效、虚拟现实等领域，提供更加丰富和逼真的视觉体验。
  这些代码片段展示了Three.js在高级着色和后处理方面的强大能力，通过自定义着色器和材质，开发者可以实现各种复杂的视觉效果。
