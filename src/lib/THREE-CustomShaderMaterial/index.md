### index.ts

- 这个文件作为库的入口点，它导出了`vanilla`模块和`types`模块中的内容。

### keywords.ts

- 定义了一组用于着色器中的关键字，这些关键字对应于自定义着色器材质中的特殊变量。

### patchMaps.ts

- 包含了默认的着色器代码补丁（patch），这些补丁用于替换Three.js着色器库中的特定代码段，以便插入自定义着色器代码。

### shaders.ts

- 提供了默认的GLSL定义和代码片段，这些定义可以在自定义着色器中使用。

### types.ts

- 定义了一组类型，包括`AllMaterialParams`、`iCSMShader`、`CSMPatchMap`、`CSMBaseMaterial`和`iCSMParams`等，这些类型用于类型检查和确保着色器材质的正确配置。

### vanilla.ts

- 定义了`CustomShaderMaterial`类，它继承自Three.js的`Material`类。这个类允许开发者通过传递`baseMaterial`、`vertexShader`、`fragmentShader`、`uniforms`等参数来创建自定义着色器材质。
- 类中的方法`update`允许开发者更新着色器代码和uniforms，而`generateMaterial`方法负责将自定义着色器代码整合到Three.js的渲染流程中。
- 还提供了`clone`方法来克隆材质实例，以及`parseShader`和`patchShader`方法来处理和注入自定义着色器代码。

### 功能概述

- **CustomShaderMaterial** 类是这个库的核心，它提供了一种简便的方法来扩展Three.js材质，通过自定义着色器代码来实现特殊的视觉效果，如动态纹理、光照效果、自定义的几何变换等。
- 通过`patchMap`属性，开发者可以指定要替换的着色器代码段，以及用于替换的自定义代码。
- 支持多种Three.js材质作为基础材质，包括`MeshPhysicalMaterial`、`MeshStandardMaterial`、`ShaderMaterial`等。

### 使用场景

- 在游戏开发、数据可视化、艺术作品、科学模拟等领域，开发者可以使用这个库来创建复杂的视觉效果。
- 特别适合需要高度定制化视觉元素的场合，例如在VR/AR应用中实现特殊的视觉风格。
  这些代码片段展示了如何通过自定义着色器来扩展Three.js的功能，为3D图形开发提供了更大的灵活性和创造力。
