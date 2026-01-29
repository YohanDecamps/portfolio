import type { Updatable } from '../objects/Updatable'
import type { InputManager } from '../InputManager'
import type { Player } from '../objects/Player'

export class PlayerMovementController implements Updatable {
  private input: InputManager
  private player: Player

  // --- Tunables ---
  private engineForce = 2
  private brakeForce = 15
  private maxSteering = 0.4

  constructor(input: InputManager, player: Player) {
    this.input = input
    this.player = player
  }

  update(_: number) {
    const vehicle = this.player['vehicle'] // or expose a getter if you prefer

    if (!vehicle) return

    // --- Throttle / brake ---
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

    // --- Steering ---
    let steering = 0
    if (this.input.isKeyDown('KeyA')) steering = this.maxSteering
    if (this.input.isKeyDown('KeyD')) steering = -this.maxSteering

    // Front wheels steer
    vehicle.setWheelSteering(0, steering)
    vehicle.setWheelSteering(1, steering)

    // Rear wheels drive
    vehicle.setWheelEngineForce(2, engine)
    vehicle.setWheelEngineForce(3, engine)

    // Rear wheels brake
    vehicle.setWheelBrake(2, brake)
    vehicle.setWheelBrake(3, brake)
  }
}
