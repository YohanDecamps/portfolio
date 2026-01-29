import * as THREE from 'three'
import RAPIER, {
  DynamicRayCastVehicleController,
  RigidBodyDesc
} from '@dimforge/rapier3d-compat'
import type { Updatable } from './Updatable'
import { RigidBody } from './RigidBody'
import type { PhysicsWorld } from '../physics/physics'

const UP = new THREE.Vector3(0, 1, 0)
const _steeringQuat = new THREE.Quaternion()
const _rotationQuat = new THREE.Quaternion()
const _baseRotation = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(0, 0, 1),
  Math.PI / 2
)

export class Player extends RigidBody implements Updatable {
  readonly object: THREE.Object3D
  readonly cameraTarget: THREE.Object3D
  private vehicle: DynamicRayCastVehicleController
  private wheels: THREE.Mesh[]

  constructor(object: THREE.Object3D, world: PhysicsWorld) {
    const body = world.world.createRigidBody(
      RigidBodyDesc.dynamic()
        .setTranslation(0, 1, 0)
        .setCanSleep(false)
    )

    const chassisCollider = RAPIER.ColliderDesc.cuboid(0.528203, 0.254595, 1)
    const turretCollider = RAPIER.ColliderDesc.cylinder(0.15, 0.5)
      .setTranslation(0, 0.4, 0)
    world.world.createCollider(turretCollider, body)
    world.world.createCollider(chassisCollider, body)

    super(world, body, object)
    this.object = object
    this.cameraTarget = new THREE.Object3D()

    this.wheels = [
      this.createWheel(new THREE.Vector3( 0.5, 0, -0.6)),
      this.createWheel(new THREE.Vector3(-0.5, 0, -0.6)),
      this.createWheel(new THREE.Vector3( 0.5, 0,  0.6)),
      this.createWheel(new THREE.Vector3(-0.5, 0,  0.6)),
    ]
    this.wheels.forEach(w => this.object.add(w))

    this.vehicle = world.world.createVehicleController(body)
    const suspensionDir = new THREE.Vector3(0, -1, 0)
    const axle = new THREE.Vector3(1, 0, 0)

    this.wheels.forEach((wheel, i) => {
      this.vehicle.addWheel(
        wheel.position.clone(),
        suspensionDir,
        axle,
        0.4,
        0.1
      )
      this.vehicle.setWheelSuspensionStiffness(i, 30)
      this.vehicle.setWheelMaxSuspensionTravel(i, 0.3)
      this.vehicle.setWheelFrictionSlip(i, 5)
      this.vehicle.setWheelSideFrictionStiffness(i, 2)
    })
  }

  private createWheel(position: THREE.Vector3): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16)
    const material = new THREE.MeshStandardMaterial({ color: 0x111188 })
    const wheel = new THREE.Mesh(geometry, material)
    
    wheel.position.copy(position)
    wheel.castShadow = true
    return wheel
  }

  update(dt: number): void {
    this.vehicle.updateVehicle(dt)

    this.wheels.forEach((wheel, i) => {
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
      
      wheel.quaternion.multiplyQuaternions(_steeringQuat, _rotationQuat)
      wheel.quaternion.multiply(_baseRotation)
    })

    this.cameraTarget.position.copy(this.object.position)
    super.update(0)
  }

  dispose() {
    this.world.world.removeVehicleController(this.vehicle)
  }
}
