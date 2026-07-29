import { ActiveEvents, ColliderDesc } from "@dimforge/rapier3d-compat"
import { Component } from "./Component"
import { RigidBody } from "./RigidBody"
import { assetPool, world } from "../main"
import * as THREE from 'three'

export class ConvexMeshCollider extends Component {
  private colliderDescriptions: ColliderDesc[] = []
  private mesh: THREE.Object3D
  public meshName: string = ""
  public density: number = 1
  public position: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 }

  constructor() {
    super()
    this.mesh = null as unknown as THREE.Object3D
  }

  start(): void {
    this.mesh = assetPool.getModel(this.meshName)?.clone() || new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1)
    )

    const rigidBody = this.gameObject?.getComponent(RigidBody)
    if (!rigidBody) {
      throw new Error("ConvexMeshCollider requires a RigidBody component")
    }

    this.mesh.updateWorldMatrix(true, true)

    const subMeshes: THREE.Mesh[] = []
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        subMeshes.push(child)
      }
    })

    if (subMeshes.length === 0) {
      const fallback = ColliderDesc.cuboid(1, 1, 1)
      fallback.setDensity(this.density)
      fallback.setTranslation(this.position.x, this.position.y, this.position.z)
      fallback.setActiveEvents(ActiveEvents.COLLISION_EVENTS)
      this.colliderDescriptions.push(fallback)
      world.createCollider(fallback, rigidBody.getBody())
      return
    }

    for (const child of subMeshes) {
      const vertices = this.extractVertices(child)
      if (vertices.length < 12) {
        continue
      }

      const arrayVertices = new Float32Array(vertices)
      const colliderDescription = ColliderDesc.convexMesh(arrayVertices)
      if (!colliderDescription) {
        continue
      }

      colliderDescription.setDensity(this.density)

      const localPosition = new THREE.Vector3()
      const localQuaternion = new THREE.Quaternion()
      const localScale = new THREE.Vector3()
      child.matrix.decompose(localPosition, localQuaternion, localScale)

      colliderDescription.setTranslation(
        localPosition.x + this.position.x,
        localPosition.y + this.position.y,
        localPosition.z + this.position.z
      )
      colliderDescription.setRotation({
        x: localQuaternion.x,
        y: localQuaternion.y,
        z: localQuaternion.z,
        w: localQuaternion.w
      })
      colliderDescription.setActiveEvents(ActiveEvents.COLLISION_EVENTS)

      this.colliderDescriptions.push(colliderDescription)
      world.createCollider(colliderDescription, rigidBody.getBody())
    }
  }

  private extractVertices(mesh: THREE.Mesh): number[] {
    const vertices: number[] = []
    const geometry = mesh.geometry
    geometry.computeBoundingBox()
    const positionAttribute = geometry.getAttribute('position')

    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(positionAttribute, i)
      vertices.push(vertex.x, vertex.y, vertex.z)
    }

    return vertices
  }
}
