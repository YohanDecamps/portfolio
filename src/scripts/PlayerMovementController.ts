import type { Updatable } from '../objects/Updatable'
import type { InputManager } from '../InputManager'
import type { Player } from '../objects/Player'

export class PlayerMovementController implements Updatable {
  private input: InputManager
  private player: Player

  private engineForce = 10
  private brakeForce = 0.7
  private maxSteering = 0.2
  private boostForce = 15

  constructor(input: InputManager, player: Player) {
    this.input = input
    this.player = player
  }

  update(_: number) {
    const vehicle = this.player['vehicle']

    if (!vehicle) return

    let engine = 0
    let brake = 0

    if (this.input.isKeyDown('ArrowUp')) {
      engine = this.engineForce
    }

    if (this.input.isKeyDown('ArrowDown')) {
      engine = this.engineForce * -1
    }

    if (this.input.isKeyDown('Space')) {
      engine = 0
      brake = this.brakeForce
    }

    if (this.input.isKeyDown('ShiftLeft')) {
      engine *= this.boostForce
    }

    let steering = 0
    if (this.input.isKeyDown('ArrowLeft')) steering = -this.maxSteering
    if (this.input.isKeyDown('ArrowRight')) steering = this.maxSteering

    vehicle.setWheelSteering(2, steering)
    vehicle.setWheelSteering(3, steering)

    vehicle.setWheelEngineForce(0, engine)
    vehicle.setWheelEngineForce(1, engine)

    vehicle.setWheelBrake(0, brake)
    vehicle.setWheelBrake(1, brake)
  }
}
