1. **basicPanorama.ts**: 定义了一个`BasicPanorama`类，它继承自`Component`类，用于创建一个基本的全景图。这个类包含了添加到场景、显示、隐藏、淡入淡出、添加信息点、更新和切换信息点可见性等方法。
2. **imagePanorama.ts**: 定义了一个`ImagePanorama`类，它继承自`BasicPanorama`类，并添加了使用纹理创建图像全景图的功能。
3. **index.ts**: 导出了`basicPanorama`、`imagePanorama`、`panoramaGenerator`和`viewer`模块的所有公共类和接口。
4. **panoramaGenerator.ts**: 定义了一个`PanoramaGenerator`类，用于根据配置生成全景图和信息点。它包括设置配置、生成全景图、生成信息点、生成场景跳转和输出当前场景位置等功能。
5. **viewer.ts**: 定义了一个`Viewer`类，用于查看全景图。它包括添加全景图、设置当前全景图和使用轨道控制器浏览全景图的功能。
   这些类和接口共同构成了一个功能完整的Web 3D全景图解决方案，允许开发者在网页上创建和展示交互式的全景图内容。
