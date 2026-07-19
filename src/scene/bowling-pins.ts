import { GameObject } from "../objects/GameObject";
import * as THREE from 'three'
import RAPIER from "@dimforge/rapier3d-compat"
import { Mesh } from "../objects/Mesh";
import { RigidBody } from "../objects/RigidBody";
import { loadGLB } from "../loadGLB";

export async function useBowlingPins(world: RAPIER.World, scene: THREE.Scene): Promise<GameObject[]> {
  const bowlingPinModel = await loadGLB('/models/bowling-pin.glb')
  bowlingPinModel.scale.set(0.5, 0.5, 0.5)
  bowlingPinModel.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      mesh.castShadow = true;
    }
  })
  
  let bowlingPins: GameObject[] = []
  const formation = [
    [0, 0],
    [-1, -0.5],
    [-1, 0.5],
    [-2, -1],
    [-2, 0],
    [-2, 1],
    [-3, -1.5],
    [-3, -0.5],
    [-3, 0.5],
    [-3, 1.5],
  ]
  
  for (let i = 0; i < formation.length; i++) {
    const [xOffset, zOffset] = formation[i]
    const pinModel = bowlingPinModel.clone()
    
    const pinRigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(xOffset - 30, 0, zOffset)
    
    let pinBody = world.createRigidBody(pinRigidBodyDesc)
    let pinCollider = RAPIER.ColliderDesc.cylinder(0.8, 0.3).setTranslation(0, 1, 0)
    pinCollider.setMass(0.1)
    let pinBaseCollider = RAPIER.ColliderDesc.cylinder(0.1, 0.2).setTranslation(0, 0.1, 0)
    pinBaseCollider.setRestitution(0.4)
    world.createCollider(pinBaseCollider, pinBody)
    world.createCollider(pinCollider, pinBody)
    
    const pinRigidBody = new RigidBody(pinBody, pinModel)
    let bowlingPin = new GameObject()
    bowlingPin.addComponent(pinRigidBody)
    bowlingPin.addComponent(new Mesh(pinModel, scene))
    
    bowlingPins.push(bowlingPin)
  }

  return bowlingPins
}
