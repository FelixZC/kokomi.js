import * as THREE from "three";/**
 * 根据提供的数量和生成函数，创建一个Float32Array缓冲区。
 * @param count 缓冲区中元素的数量，默认为100。
 * @param fn 生成每个缓冲区元素值的函数。
 * @param dimension 每个元素的维度，默认为3。
 * @returns 返回生成的Float32Array缓冲区。
 */
const makeBuffer = (count = 100, fn: any, dimension = 3) => {
  const buffer = Float32Array.from({ length: count * dimension }, (v, k) => {
    return fn(k);
  });
  return buffer;
};

/**
 * 对缓冲区中的数据进行迭代处理。
 * @param buffer 要处理的缓冲区。
 * @param count 需要处理的元素数量。
 * @param fn 对每个元素执行的处理函数。
 * @param dimension 每个元素的维度，默认为3。
 */
const iterateBuffer = (
  buffer: ArrayLike<number>,
  count: number,
  fn: any,
  dimension = 3,
) => {
  for (let i = 0; i < count; i++) {
    const axis = i * dimension;
    const x = axis;
    const y = axis + 1;
    const z = axis + 2;
    const w = axis + 3;
    fn(buffer, { x, y, z, w }, i);
  }
};

/**
 * 将Three.js的BufferAttribute或InterleavedBufferAttribute转换为Vector数组。
 * @param bufferAttribute 要转换的BufferAttribute或InterleavedBufferAttribute。
 * @param dimension 每个元素的维度，默认为3。
 * @returns 返回转换后的Vector数组。
 */
const convertBufferAttributeToVector = (
  bufferAttribute: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  dimension = 3,
) => {
  const vectorDimensionMap = {
    2: new THREE.Vector2(),
    3: new THREE.Vector3(),
    4: new THREE.Vector4(),
  };
  const vectors = Array.from(
    { length: bufferAttribute.array.length / dimension },
    (v, k) => {
      const vector = (vectorDimensionMap as any)[dimension].clone();
      return vector.fromBufferAttribute(bufferAttribute, k);
    },
  );
  return vectors;
};

/**
 * 判断传入的对象是否为Three.js的Vector2、Vector3或Vector4。
 * @param v 要判断的对象。
 * @returns 如果是Vector2、Vector3或Vector4，则返回true，否则返回false。
 */
const isVector = (v: any): v is THREE.Vector2 | THREE.Vector3 | THREE.Vector4 =>
  v instanceof THREE.Vector2 ||
  v instanceof THREE.Vector3 ||
  v instanceof THREE.Vector4;

/**
 * 将Vector或数字转换为数字数组。
 * @param v 要转换的Vector或数字。
 * @returns 返回转换后的数字数组。
 */
const normalizeVector = (v: any): number[] => {
  if (Array.isArray(v)) return v;
  else if (isVector(v)) return v.toArray();
  return [v, v, v] as number[];
};

/**
 * 判断传入的对象是否为Float32Array。
 * @param def 要判断的对象。
 * @returns 如果是Float32Array，则返回true，否则返回false。
 */
const isFloat32Array = (def: any): def is Float32Array =>
  def && (def as Float32Array).constructor === Float32Array;

/**
 * 将Three.js的颜色对象扩展为包含RGB值的数组。
 * @param v Three.js的颜色对象。
 * @returns 返回包含RGB值的数组。
 */
const expandColor = (v: THREE.Color) => [v.r, v.g, v.b];

/**
 * 根据属性的类型，以适当的方式使用属性值或将其转换为BufferAttribute。
 * @param count 需要处理的元素数量。
 * @param prop 属性值，可以是Float32Array、Three.js的颜色对象、Vector或数字。
 * @param setDefault 用于为未定义的属性设置默认值的函数。
 * @returns 返回处理后的Float32Array。
 */
const usePropAsIsOrAsAttribute = <T extends any>(
  count: number,
  prop: T | Float32Array,
  setDefault?: (v: T) => number,
) => {
  if (prop !== undefined) {
    if (isFloat32Array(prop)) {
      return prop as Float32Array;
    } else {
      if (prop instanceof THREE.Color) {
        const a = Array.from({ length: count * 3 }, () =>
          expandColor(prop),
        ).flat();
        return Float32Array.from(a);
      } else if (isVector(prop) || Array.isArray(prop)) {
        const a = Array.from({ length: count * 3 }, () =>
          normalizeVector(prop),
        ).flat();
        return Float32Array.from(a);
      }
      return Float32Array.from({ length: count }, () => prop as number);
    }
  }
  return Float32Array.from({ length: count }, setDefault!);
};

export {
  makeBuffer,
  iterateBuffer,
  convertBufferAttributeToVector,
  isVector,
  normalizeVector,
  isFloat32Array,
  expandColor,
  usePropAsIsOrAsAttribute,
};