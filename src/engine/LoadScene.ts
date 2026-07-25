import { AmbientLight } from "../components/AmbientLight"
import { BoxCollider } from "../components/BoxCollider"
import { Camera } from "../components/Camera"
import type { Component } from "../components/Component"
import { DirectionalLight } from "../components/DirectionalLight"
import { GameObject } from "../components/GameObject"
import { Mesh } from "../components/Mesh"
import { RigidBody } from "../components/RigidBody"
import { Transform } from "../components/Transform"
import { VehicleController } from "../components/VehicleController"
import { FollowCamera } from "../scripts/FollowCamera"
import { PlayerMovementController } from "../scripts/PlayerMovementController"

// Recursively merge plain-object attributes onto a component instance,
// instead of blindly overwriting nested objects by reference.
// This preserves any default sub-fields that aren't present in the scene data.
function applyAttributes(target: any, attributes: Record<string, unknown>) {
  for (const key of Object.keys(attributes)) {
    const value = attributes[key]
    const existing = target[key]

    if (
      isPlainObject(value) &&
      isPlainObject(existing)
    ) {
      // Merge into the existing nested object instead of replacing it,
      // so untouched sub-properties keep their defaults.
      applyAttributes(existing, value as Record<string, unknown>)
    } else {
      console.log(`Setting ${target.constructor.name}.${key} =`, value)
      target[key] = value
    }
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export async function loadScene(scenePath: string): Promise<GameObject[]> {
  const gameObjects: GameObject[] = []

  const response = await fetch(scenePath)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while fetching ${scenePath}`)
  }
  const sceneData = await response.json()

  for (const gameObjectData of sceneData.gameObjects) {
    console.log(`Loading game object: ${gameObjectData.name}`)
    const gameObject = new GameObject()
    gameObject.id = gameObjectData.name

    for (const componentData of gameObjectData.components) {
      let component: Component | null = null
      switch (componentData.type) {
        case 'Transform':
          component = gameObject.getComponent(Transform)
          break
        case 'Mesh':
          component = new Mesh()
          break
        case 'RigidBody':
          component = new RigidBody()
          break
        case 'BoxCollider':
          component = new BoxCollider()
          break
        case 'Camera':
          component = new Camera()
          break
        case 'AmbientLight':
          component = new AmbientLight()
          break
        case 'DirectionalLight':
          component = new DirectionalLight()
          break
        case 'VehicleController':
          component = new VehicleController()
          break
        case 'FollowCamera':
          component = new FollowCamera()
          break
        case 'PlayerMovementController':
          component = new PlayerMovementController()
          break
        default:
          console.warn(`Unknown component type: ${componentData.type}`)
      }
      if (component) {
        if (componentData.attributes) {
          applyAttributes(component, componentData.attributes)
        }
        gameObject.addComponent(component)
      }
    }
    gameObjects.push(gameObject)
  }

  return gameObjects
}
