1. **index.ts**:

- 这个文件导出了`PackedMipMapGenerator`类，它负责生成Mipmap。这个类从`./PackedMipMapGenerator`模块中导入。

2. **MipGenerationShader.ts**:

- 这个文件定义了用于生成Mipmap的着色器程序。它包括了顶点着色器和片段着色器的代码，以及一些宏定义和uniform变量。片段着色器中使用了`<mipmap_logic>`标记，用于插入自定义的Mipmap逻辑代码。
- 这个着色器程序还定义了一些宏，比如`X_IS_EVEN`和`Y_IS_EVEN`，这些宏用于确定纹理的尺寸是否为偶数，这对于采样逻辑是重要的。

3. **mipSampleFunctions.ts**:

- 这个文件提供了一组GLSL（OpenGL Shading Language）函数，这些函数用于在着色器中对纹理进行采样。函数支持不同的采样方式，包括对非2的幂次纹理（Non-Power-Of-Two, NPOT）的采样。

4. **PackedMipMapGenerator.ts**:

- 这是核心类文件，它实现了自定义Mipmap生成的逻辑。这个类使用了`MipGenerationShader`定义的着色器，并提供了`update`方法来生成Mipmap。
- 类中使用了`FullScreenQuad`来渲染全屏四边形，这是Three.js中用于渲染全屏效果的常用方法。
- `update`方法接受一个纹理、目标渲染目标、渲染器和一个可选的强制为2的幂次参数。它首先将原始纹理渲染到目标上，然后递归地生成更小的Mipmap级别。
- 这个类还处理了纹理尺寸不是2的幂次的情况，通过计算下一个最接近的2的幂次尺寸来创建Mipmap。
  整体来看，这些文件提供了一个完整的自定义Mipmap生成解决方案，可以用于Three.js项目中，以支持非2的幂次纹理的Mipmap生成。这对于提高WebGL渲染性能和视觉效果是非常有用的。
