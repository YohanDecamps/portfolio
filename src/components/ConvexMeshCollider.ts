import RAPIER, { ColliderDesc } from "@dimforge/rapier3d-compat"
import { Component } from "./Component"
import { RigidBody } from "./RigidBody"
import { assetPool, world } from "../main"
import * as THREE from 'three'

export class ConvexMeshCollider extends Component {
  private colliderDescription: ColliderDesc
  private mesh: THREE.Object3D

  public meshName: string = ""
  public density: number = 1
  public position: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 }
  
  constructor() {
    super()
    this.colliderDescription = null as unknown as ColliderDesc
    this.mesh = null as unknown as THREE.Object3D
  }

  start(): void {
    this.mesh = assetPool.getModel(this.meshName)?.clone() || new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1)
    )

    const vertices: number[] = []
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const geometry = child.geometry
        geometry.computeBoundingBox()
        const positionAttribute = geometry.getAttribute('position')
        for (let i = 0; i < positionAttribute.count; i++) {
          const vertex = new THREE.Vector3().fromBufferAttribute(positionAttribute, i)
          vertices.push(vertex.x, vertex.y, vertex.z)
        }
      }
    })

    const arrayVertices = new Float32Array(vertices)
    
    this.colliderDescription = ColliderDesc.convexMesh(arrayVertices) || ColliderDesc.cuboid(1, 1, 1)
    this.colliderDescription.setDensity(this.density)
    // Rotate 90 on the X axis to align with the Y axis
    this.colliderDescription.setRotation(new RAPIER.Quaternion(-Math.sin(Math.PI / 4), 0, 0, Math.cos(Math.PI / 4)))
    this.colliderDescription.setTranslation(this.position.x, this.position.y, this.position.z)
    
    const rigidBody = this.gameObject?.getComponent(RigidBody)
    if (!rigidBody) {
      throw new Error("CylinderCollider requires a RigidBody component")
    }
    world.createCollider(this.colliderDescription, rigidBody.getBody())
  }
}
