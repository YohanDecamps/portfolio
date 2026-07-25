import { Component } from '../components/Component'
import { VehicleController } from '../components/VehicleController'
import { InputManager } from '../lib/InputManager'

export class PlayerMovementController extends Component {
  private input: InputManager

  public engineForce = 2
  public brakeForce = 0.7
  public maxSteering = 0.3
  public boostForce = 15

  constructor() {
    super()
    this.input = new InputManager()
  }

  update(_: number) {
    const vehicle = this.gameObject?.getComponent(VehicleController)

    if (!vehicle) return

    let engine = 0
    let brake = 0

    if (this.input.isKeyDown('ArrowUp')) {
      engine = this.engineForce * -1
    }

    if (this.input.isKeyDown('ArrowDown')) {
      engine = this.engineForce * 1
    }

    if (this.input.isKeyDown('Space')) {
      engine = 0
      brake = this.brakeForce
    }

    if (this.input.isKeyDown('ShiftLeft')) {
      engine *= this.boostForce
    }

    let steering = 0
    if (this.input.isKeyDown('ArrowLeft')) steering = this.maxSteering
    if (this.input.isKeyDown('ArrowRight')) steering = -this.maxSteering

    vehicle.setWheelSteering(2, steering)
    vehicle.setWheelSteering(3, steering)

    vehicle.setWheelEngineForce(0, engine)
    vehicle.setWheelEngineForce(1, engine)

    vehicle.setWheelBrake(0, brake)
    vehicle.setWheelBrake(1, brake)
  }
}
