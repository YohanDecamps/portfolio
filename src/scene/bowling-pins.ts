import { GameObject } from "../objects/GameObject";
import * as THREE from 'three'
import RAPIER from "@dimforge/rapier3d-compat"
import { Mesh } from "../objects/Mesh";
import { RigidBody } from "../objects/RigidBody";
import type { PhysicsWorld } from "../physics/physics";
import { loadGLB } from "../loadGLB";

export async function useBowlingPins(physicsWorld: PhysicsWorld, scene: THREE.Scene): Promise<GameObject> {
  const bowlingPinModel = await loadGLB('/models/bowling-pin.glb')
  bowlingPinModel.scale.set(0.5, 0.5, 0.5)
  bowlingPinModel.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      mesh.castShadow = true;
    }
  })
  
  const bowlingPinRigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(2, 0, -5)
  
  let bowlingPinBody = physicsWorld.world.createRigidBody(bowlingPinRigidBodyDesc)
  let bowlingPinCollider = RAPIER.ColliderDesc.capsule(0.6, 0.3).setTranslation(0, 1, 0)
  bowlingPinCollider.setMass(0.5)
  const bowlingPinRigidBody = new RigidBody(physicsWorld, bowlingPinBody, bowlingPinModel)
  physicsWorld.world.createCollider(bowlingPinCollider, bowlingPinBody)
  let bowlingPin = new GameObject()
  bowlingPin.addComponent(bowlingPinRigidBody)
  bowlingPin.addComponent(new Mesh(bowlingPinModel, scene))
  return bowlingPin
}
