import { Component } from "../components/Component"
import { Camera } from '../components/Camera'
import { Transform } from '../components/Transform'
import { app } from "../main"

export class LookAtPlayer extends Component {
  private camera: Camera | null = null
  private target: Transform | null = null
  public offset: { x: number, y: number, z: number } = { x: 20, y: 20, z: 20 }

  constructor() {
    super()
  }

  start(): void {
    const cameraComponent = this.gameObject?.getComponent(Camera)
    if (cameraComponent) {
      this.camera = cameraComponent
    } else {
      console.error("FollowCameraController: No Camera component found on the GameObject.")
    }
    this.target = app.findGameObjectsByTag("player")[0]?.getComponent(Transform) || null
    this.camera?.lookAt(this.target?.position.x || 0, this.target?.position.y || 0, this.target?.position.z || 0)
  }


  update(dt: number) {
    if (this.camera && this.target) {
      this.camera.lookAt(this.target.position.x, this.target.position.y, this.target.position.z)
    }
  }
}
