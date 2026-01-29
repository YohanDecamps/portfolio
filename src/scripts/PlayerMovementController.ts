import type { Updatable } from '../objects/Updatable'
import type { InputManager } from '../InputManager'
import type { Player } from '../objects/Player'

export class PlayerMovementController implements Updatable {
  private input: InputManager
  private player: Player

  private engineForce = 2
  private brakeForce = 10
  private maxSteering = 0.4

  constructor(input: InputManager, player: Player) {
    this.input = input
    this.player = player
  }

  update(_: number) {
    const vehicle = this.player['vehicle']

    if (!vehicle) return

    let engine = 0
    let brake = 0

    if (this.input.isKeyDown('KeyW')) {
      engine = this.engineForce
    }

    if (this.input.isKeyDown('KeyS')) {
      engine = this.engineForce * -1
    }

    if (this.input.isKeyDown('Space')) {
      brake = this.brakeForce
    }

    let steering = 0
    if (this.input.isKeyDown('KeyA')) steering = -this.maxSteering
    if (this.input.isKeyDown('KeyD')) steering = this.maxSteering

    vehicle.setWheelSteering(2, steering)
    vehicle.setWheelSteering(3, steering)

    vehicle.setWheelEngineForce(0, engine)
    vehicle.setWheelEngineForce(1, engine)

    vehicle.setWheelBrake(2, brake)
    vehicle.setWheelBrake(3, brake)
  }
}
