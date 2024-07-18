import * as THREE from "three";
import { Component } from "./component";
import { Base } from "../base/base";
/**
 * AnimationManager class, responsible for managing the animations of a model.
 * It extends the Component class, indicating it is a component that can be attached to a base object.
 * @extends Component
 */
/**
 * This class can manage the animations of a model.
 */
class AnimationManager extends Component {
  /**
   * Animation clips, representing a set of available animations.
   */
  clips: THREE.AnimationClip[];
  /**
   * The root object of the animation, the object whose animations are to be managed.
   */
  root: THREE.Object3D;
  /**
   * The AnimationMixer instance, responsible for mixing and playing animations.
   */
  mixer: THREE.AnimationMixer;
  /**
   * Constructor method for the AnimationManager class.
   * @param base The base object to which this component is attached, providing necessary services such as clock.
   * @param clips An array of animation clips, containing all the animations that can be played.
   * @param root The root object of the animation, the object to be animated.
   */
  constructor(base: Base, clips: THREE.AnimationClip[], root: THREE.Object3D) {
    super(base);
    this.clips = clips;
    this.root = root;
    this.mixer = new THREE.AnimationMixer(root);
  }
  /**
   * Getter for animation clip names.
   * @returns An array of animation clip names.
   */
  get names() {
    return this.clips.map((item) => item.name);
  }
  /**
   * Getter for animation actions.
   * Creates and returns an object containing animation actions corresponding to each animation clip, allowing for easy access and control of animations.
   * @returns An object mapping animation clip names to their corresponding animation actions.
   */
  get actions() {
    return Object.fromEntries(
      this.clips.map((item) => [item.name, this.mixer.clipAction(item)]),
    );
  }
  /**
   * Updates the animation mixer, advancing the animation by a frame.
   * This method should be called in the update loop of the application to ensure the animation is updated and played correctly.
   */
  update(): void {
    this.mixer.update(this.base.clock.deltaTime);
  }
}
export { AnimationManager };
