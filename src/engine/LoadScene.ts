import { AmbientLight } from "../components/AmbientLight"
import { BoxCollider } from "../components/BoxCollider"
import { Camera } from "../components/Camera"
import { CapsuleCollider } from "../components/CapsuleCollider"
import type { Component } from "../components/Component"
import { CylinderCollider } from "../components/CylinderCollider"
import { DirectionalLight } from "../components/DirectionalLight"
import { GameObject } from "../components/GameObject"
import { Mesh } from "../components/Mesh"
import { RigidBody } from "../components/RigidBody"
import { Transform } from "../components/Transform"
import { VehicleController } from "../components/VehicleController"
import { assetPool } from "../main"
import { FollowCamera } from "../scripts/FollowCamera"
import { PlayerMovementController } from "../scripts/PlayerMovementController"

function applyAttributes(target: any, attributes: Record<string, unknown>) {
  for (const key of Object.keys(attributes)) {
    const value = attributes[key]
    const existing = target[key]

    if (
      isPlainObject(value) &&
      isPlainObject(existing)
    ) {
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

const componentTypeMap: Record<string, new () => Component> = {
  'Transform': Transform,
  'Mesh': Mesh,
  'RigidBody': RigidBody,
  'BoxCollider': BoxCollider,
  'CapsuleCollider': CapsuleCollider,
  'CylinderCollider': CylinderCollider,
  'Camera': Camera,
  'AmbientLight': AmbientLight,
  'DirectionalLight': DirectionalLight,
  'VehicleController': VehicleController,
  'FollowCamera': FollowCamera,
  'PlayerMovementController': PlayerMovementController
}

export function loadGameObject(gameObjectData: any): GameObject {
  const gameObject = new GameObject()
  gameObject.id = gameObjectData.id

  for (const componentData of gameObjectData.components) {
    let component: Component | null = null
    if (componentData.type === 'Transform') {
        component = gameObject.getComponent(Transform)
    } else {
        const componentClass = componentTypeMap[componentData.type]
        if (componentClass) {
            component = new componentClass()
            gameObject.addComponent(component)
        } else {
            console.warn(`Unknown component type: ${componentData.type}`)
        }
    }
    if (component) {
      if (componentData.attributes) {
        applyAttributes(component, componentData.attributes)
      }
    }
  }

  return gameObject
}

export async function loadScene(scenePath: string): Promise<GameObject[]> {
  const gameObjects: GameObject[] = []

  const response = await fetch(scenePath)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while fetching ${scenePath}`)
  }
  const sceneData = await response.json()

  for (const prefabData of sceneData.prefabs) {
    console.log(`Loading prefab: ${prefabData.id}`)
    const prefab: GameObject = loadGameObject(prefabData)
    assetPool.addPrefab(prefabData.id, prefab)
  }

  for (const gameObjectData of sceneData.gameObjects) {
    console.log(`Loading game object: ${gameObjectData.id}`)
    if (gameObjectData.prefab) {
      const prefab = assetPool.getPrefab(gameObjectData.prefab)
      if (!prefab) {
        console.warn(`Prefab not found: ${gameObjectData.prefab}`)
        continue
      }
      const gameObject = prefab.clone()
      gameObject.id = gameObjectData.id
      if (gameObjectData.components) {
        for (const componentData of gameObjectData.components) {
          const existingComponent = gameObject.getComponent(componentTypeMap[componentData.type])
          if (existingComponent) {
            applyAttributes(existingComponent, componentData.attributes || {})
          } else {
            console.warn(`Component type ${componentData.type} not found on prefab ${gameObjectData.prefab}`)
          }
        }
      }
      gameObjects.push(gameObject)
      continue
    }
    const gameObject = loadGameObject(gameObjectData);
    gameObjects.push(gameObject)
  }

  return gameObjects
}
