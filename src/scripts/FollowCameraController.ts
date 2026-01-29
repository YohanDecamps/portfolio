import * as THREE from 'three'
import type { Updatable } from "../objects/Updatable"

export class FollowCameraController implements Updatable {
  private camera: THREE.Camera
  private target: THREE.Object3D

  constructor(camera: THREE.Camera, target: THREE.Object3D
  ) {
    this.camera = camera
    this.target = target
  }

  private offset = new THREE.Vector3(20, 20, 20)
  private smoothedPosition = new THREE.Vector3()

  update(dt: number) {
    const desired = this.offset.clone()
      .applyQuaternion(this.target.getWorldQuaternion(new THREE.Quaternion()))
      .add(this.target.getWorldPosition(new THREE.Vector3()))

    this.smoothedPosition.lerp(desired, 1 - Math.exp(-dt * 5))
    this.camera.position.copy(this.smoothedPosition)

  }
}
