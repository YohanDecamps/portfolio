import { Component } from '../components/Component'
import { RigidBody } from '../components/RigidBody'
import { VehicleController } from '../components/VehicleController'
import { audioLoader, input, listener, world } from '../main'
import * as THREE from 'three'

export class PlayerMovementController extends Component {
  public engineForce = 1.5
  public brakeForce = 0.05
  public maxSteering = 0.4
  public boostForce = 3
  
  private volume = 0
  private volumeTarget = 0.25
  private volumeChangeRate = 0.75
  private sound: THREE.Audio | null = null
  
  private engineStarted = false

  constructor() {
    super()
  }

  start(): void {
  }

  update(dt: number) {
    const vehicle = this.gameObject?.getComponent(VehicleController)

    if (!vehicle) return

    let engine = 0
    let brake = 0

    if (input.isKeyDown('ArrowUp')) {
      this.engineStarted = true
      engine = this.engineForce * -1
    }

    if (input.isKeyDown('ArrowDown')) {
      this.engineStarted = true
      engine = this.engineForce * 1
    }

    if (input.isKeyDown('Space')) {
      brake = this.brakeForce
    }

    if (input.isKeyDown('ShiftLeft')) {
      engine *= this.boostForce
    }

    let steering = 0
    if (input.isKeyDown('ArrowLeft')) steering = this.maxSteering
    if (input.isKeyDown('ArrowRight')) steering = -this.maxSteering

    vehicle.setWheelSteering(2, steering)
    vehicle.setWheelSteering(3, steering)

    vehicle.setWheelBrake(0, brake)
    vehicle.setWheelBrake(1, brake)
    vehicle.setWheelBrake(2, brake)
    vehicle.setWheelBrake(3, brake)

    vehicle.setWheelEngineForce(2, engine)
    vehicle.setWheelEngineForce(3, engine)


    if (this.engineStarted && engine !== 0) {
      if (this.volume < this.volumeTarget)
        this.volume += dt * this.volumeChangeRate

      if (!this.sound) {
        this.sound = new THREE.Audio(listener)

        audioLoader.load( 'sounds/motor.ogg', ( buffer ) => {
          if (!this.sound) {
            console.error("Audio object is null when trying to set buffer.")
            return
          }
  	      this.sound.setBuffer( buffer );
  	      this.sound.setLoop( true );
  	      this.sound.setVolume( 0.25 );
  	      this.sound.play();
        });
      }
    } else {
      if (this.sound) {
        if (this.volume >= 0.15) {
        this.volume -= dt * this.volumeChangeRate

        }
      }
    }

    if (this.sound) {
      this.sound.setVolume(this.volume)
      const rb = this.gameObject?.getComponent(RigidBody)
      const linvel = rb?.getBody().linvel()
      if (!linvel) {
        console.error("Linear velocity is null.")
        return
      }
      this.sound.setDetune(this.vectorLength({ x: linvel.x, y: linvel.y, z: linvel.z }) * 20)
    }
  }

  vectorLength(vector: { x: number, y: number, z: number }): number {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z)
  }

}
