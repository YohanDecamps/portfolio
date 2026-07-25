import { world } from "../main"
import { Component } from "./Component"
import { RigidBody } from "./RigidBody"
import { DynamicRayCastVehicleController } from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import { Mesh } from "./Mesh"

export class VehicleController extends Component {
    private vehicle: DynamicRayCastVehicleController 
    private wheelsSteering: number[] = []
    private wheelsEngineForce: number[] = []
    private wheelsBrakeForce: number[] = []
    public wheels: {x: number, y: number, z: number}[] = []
    public wheelMeshes: Mesh[] = []
    public suspensionStiffness: number = 30
    public maxSuspensionTravel: number = 0.3
    public frictionSlip: number = 5
    public sideFrictionStiffness: number = 3

    constructor() {
      super()

      this.vehicle = null as unknown as DynamicRayCastVehicleController
    }

    start(): void {
      const rigidBody = this.gameObject?.getComponent(RigidBody)
      if (rigidBody) {
        this.vehicle = world.createVehicleController(rigidBody.getBody())
      } else {
        throw new Error("RigidBody component is required for VehicleController component")
      }

      const suspensionDir = { x: 0, y: -1, z: 0 }
      const axle = { x: 1, y: 0, z: 0 }

      this.wheels.forEach((wheel, i) => {
        this.vehicle.addWheel(
          wheel,
          suspensionDir,
          axle,
          0.2,
          0.25
        )
        this.vehicle.setWheelSuspensionStiffness(i, this.suspensionStiffness)
        this.vehicle.setWheelMaxSuspensionTravel(i, this.maxSuspensionTravel)
        this.vehicle.setWheelFrictionSlip(i, this.frictionSlip)
        this.vehicle.setWheelSideFrictionStiffness(i, this.sideFrictionStiffness)
      })

      this.wheelsSteering = new Array(this.wheels.length).fill(0)
      this.wheelsEngineForce = new Array(this.wheels.length).fill(0)
      this.wheelsBrakeForce = new Array(this.wheels.length).fill(0)

      this.wheelMeshes = this.wheels.map(wheel => {
        const meshComponent = new Mesh()
        meshComponent.mesh = this.createWheel(new THREE.Vector3(wheel.x, wheel.y, wheel.z))
        meshComponent.position = { x: wheel.x, y: wheel.y, z: wheel.z }
        this.gameObject?.addComponent(meshComponent)
        return meshComponent
      })
    }

    private createWheel(position: THREE.Vector3): THREE.Mesh {
      const geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16)
      const material = new THREE.MeshStandardMaterial({ color: 0x111111 })
      const wheel = new THREE.Mesh(geometry, material)
      
      wheel.position.copy(position)
      wheel.castShadow = true
      return wheel
    }

    update(dt: number): void {
      if (!this.vehicle) return

      dt = Math.min(dt, 0.1)

      // Update wheel meshes based on vehicle state
      this.vehicle.updateVehicle(dt)
      const _steeringQuat = new THREE.Quaternion()
      const _rotationQuat = new THREE.Quaternion()
      const UP = new THREE.Vector3(0, 1, 0)
      const _baseRotation = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1),
        Math.PI / 2
      )

      this.wheelMeshes.forEach((wheel, i) => {
        const axle = this.vehicle.wheelAxleCs(i)!
        const connectionY =
          this.vehicle.wheelChassisConnectionPointCs(i)?.y ?? 0
        const suspension =
          this.vehicle.wheelSuspensionLength(i) ?? 0
        const steering =
          this.vehicle.wheelSteering(i) ?? 0
        const rotation =
          this.vehicle.wheelRotation(i) ?? 0

        wheel.position.y = connectionY - suspension

        _steeringQuat.setFromAxisAngle(UP, steering)
        _rotationQuat.setFromAxisAngle(axle, rotation)
        
        const wheelRotation = new THREE.Quaternion().multiplyQuaternions(_steeringQuat, _rotationQuat) 
        wheelRotation.multiply(_baseRotation)
        wheel.rotation = {
          x: wheelRotation.x,
          y: wheelRotation.y,
          z: wheelRotation.z,
          w: wheelRotation.w
        }
      })

      // Update wheels steering and engine force
      this.wheels.forEach((wheel, i) => {
        this.vehicle.setWheelSteering(i, this.wheelsSteering[i] || 0)
        this.vehicle.setWheelEngineForce(i, this.wheelsEngineForce[i] || 0)
      })
    }

    setWheelSteering(wheelIndex: number, steering: number): void {
      if (wheelIndex < 0 || wheelIndex >= this.wheels.length) {
        throw new Error(`Wheel index ${wheelIndex} is out of bounds`)
      }
      this.wheelsSteering[wheelIndex] = steering
    }

    setWheelEngineForce(wheelIndex: number, engineForce: number): void {
      if (wheelIndex < 0 || wheelIndex >= this.wheels.length) {
        throw new Error(`Wheel index ${wheelIndex} is out of bounds`)
      }
      this.wheelsEngineForce[wheelIndex] = engineForce
    }

    setWheelBrake(wheelIndex: number, brakeForce: number): void {
      if (wheelIndex < 0 || wheelIndex >= this.wheels.length) {
        throw new Error(`Wheel index ${wheelIndex} is out of bounds`)
      }
      this.wheelsBrakeForce[wheelIndex] = brakeForce
    }
}
