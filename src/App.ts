import * as THREE from 'three'
import type { Updatable } from './objects/Updatable'
import type { PhysicsWorld } from './physics/physics'

export class App {
  private clock = new THREE.Clock()

  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.Camera
  private physicsWorld: PhysicsWorld
  
  private updatables: Updatable[] = []
  
  add(updatable: Updatable) {
    this.updatables.push(updatable)
  }

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, physicsWorld: PhysicsWorld
  ) {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera
    this.physicsWorld = physicsWorld
  }

  start() {
    this.loop()
  }

  private loop = () => {
    const delta = this.clock.getDelta()

    this.update(delta)
    this.render()

    requestAnimationFrame(this.loop)
  }

  private update(dt: number) {
    this.physicsWorld.step(dt)
    for (const u of this.updatables) {
      u.update(dt)
    }
  }

  private render() {
    this.renderer.render(this.scene, this.camera)
  }
}
