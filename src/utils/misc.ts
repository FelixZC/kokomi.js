import * as THREE from "three";
import * as STDLIB from "three-stdlib";

// 优化模型渲染
const optimizeModelRender = (renderer: THREE.WebGLRenderer) => {
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
};

// 开启真实渲染
const enableRealisticRender = (renderer: THREE.WebGLRenderer) => {
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 3;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
};

// 从hdr贴图中提取envmap
const getEnvmapFromHDRTexture = (
  renderer: THREE.WebGLRenderer,
  texture: THREE.Texture
) => {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envmap = pmremGenerator.fromEquirectangular(texture).texture;
  pmremGenerator.dispose();
  return envmap;
};

// 获取重心坐标系
const getBaryCoord = (bufferGeometry: THREE.BufferGeometry) => {
  // https://gist.github.com/mattdesl/e399418558b2b52b58f5edeafea3c16c
  const length = bufferGeometry.attributes.position.array.length;
  const count = length / 3;
  const bary = [];
  for (let i = 0; i < count; i++) {
    bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0);
  }
  const aCenter = new Float32Array(bary);
  bufferGeometry.setAttribute("aCenter", new THREE.BufferAttribute(aCenter, 3));
};

// 从mesh上取样微粒位置信息
const sampleParticlesPositionFromMesh = (
  geometry: THREE.BufferGeometry,
  count = 10000
) => {
  const material = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  const sampler = new STDLIB.MeshSurfaceSampler(mesh).build();
  const particlesPosition = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const position = new THREE.Vector3();
    sampler.sample(position);
    particlesPosition.set([position.x, position.y, position.z], i * 3);
  }
  return particlesPosition;
};

// 遍历模型，使其扁平化
const flatModel = (model: THREE.Object3D): THREE.Object3D[] => {
  const modelPartsArray: THREE.Object3D[] = [];
  model.traverse((obj) => {
    modelPartsArray.push(obj);
  });
  return modelPartsArray;
};

// 打印扁平模型的所有部分
const printModel = (modelParts: THREE.Object3D[], modelName = "modelParts") => {
  const strArray = modelParts.map((obj, i) => {
    const row = `const ${obj.name} = ${modelName}[${i}];`;
    return row;
  });
  const str = strArray.join("\n");
  console.log(str);
  return str;
};

// 获取viewport
const getViewport = (camera: THREE.Camera) => {
  const position = new THREE.Vector3();
  const target = new THREE.Vector3();
  const distance = camera.getWorldPosition(position).distanceTo(target);
  const fov = ((camera as any).fov * Math.PI) / 180; // convert vertical fov to radians
  const h = 2 * Math.tan(fov / 2) * distance; // visible height
  const w = h * (window.innerWidth / window.innerHeight);
  const viewport = { width: w, height: h };
  return viewport;
};

export {
  optimizeModelRender,
  enableRealisticRender,
  getEnvmapFromHDRTexture,
  getBaryCoord,
  sampleParticlesPositionFromMesh,
  flatModel,
  printModel,
  getViewport,
};
