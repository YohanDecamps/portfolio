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
import { BowlingPin } from "../scripts/BowlingPin"
import { LookAtPlayer } from "../scripts/LookAtPlayer"
import { FollowPlayer } from "../scripts/FollowPlayer"
import { PlayerMovementController } from "../scripts/PlayerMovementController"
import { ConvexMeshCollider } from "../components/ConvexMeshCollider"
import { SphereCollider } from "../components/SphereCollier"
import { EnterZone } from "../scripts/EnterZone"
import { OpenLink } from "../scripts/OpenLink"
import { CollisionSounds } from "../scripts/CollisionSounds"
import { VehicleFlipping } from "../scripts/VehicleFlipping"
import { Text } from "../components/Text"
import { DetectStuck } from "../scripts/DetectStuck"
import { SpotLight } from "../components/SpotLight"

const jsonPreloadList: string[] = [
  'vehicle.json',
  'arrow.json',
  'panel.json',
  'bowling-pin.json',
  'name-text/name-letter-d.json',
  'name-text/name-letter-e.json',
  'name-text/name-letter-c.json',
  'name-text/name-letter-a.json',
  'name-text/name-letter-m.json',
  'name-text/name-letter-p.json',
  'name-text/name-letter-s.json',
  'name-text/name-letter-y.json',
  'name-text/name-letter-o.json',
  'name-text/name-letter-h.json',
  'name-text/name-letter-n.json',
]

export async function preloadJsonFiles(scenePath: string): Promise<void> {
  await Promise.all(
    jsonPreloadList.map((relativePath) =>
      fetchJson(resolveUrl(scenePath, relativePath))
    )
  )
}

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
  'SphereCollider': SphereCollider,
  'ConvexMeshCollider': ConvexMeshCollider,
  'CylinderCollider': CylinderCollider,
  'Camera': Camera,
  'AmbientLight': AmbientLight,
  'DirectionalLight': DirectionalLight,
  'SpotLight': SpotLight,
  'VehicleController': VehicleController,
  'LookAtPlayer': LookAtPlayer,
  'PlayerMovementController': PlayerMovementController,
  'BowlingPin': BowlingPin,
  'FollowPlayer': FollowPlayer,
  'EnterZone': EnterZone,
  'OpenLink': OpenLink,
  'CollisionSounds': CollisionSounds,
  'VehicleFlipping': VehicleFlipping,
  'Text': Text,
  'DetectStuck': DetectStuck,
}

const jsonCache = new Map<string, Promise<any>>()

async function fetchJson(url: string): Promise<any> {
  let pending = jsonCache.get(url)
  if (!pending) {
    pending = fetch(url).then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} while fetching ${url}`)
      }
      const text = await response.text()
      if (!text.trim()) {
        throw new Error(`Empty response body when fetching ${url} (check the file exists and isn't blank)`)
      }
      try {
        return JSON.parse(text)
      } catch (err) {
        throw new Error(`Invalid JSON in ${url}: ${(err as Error).message}\nBody started with: ${text.slice(0, 100)}`)
      }
    })
    jsonCache.set(url, pending)
  }
  return pending
}

function resolveUrl(basePath: string, relativePath: string): string {
  return new URL(relativePath, new URL(basePath, window.location.href)).toString()
}

async function resolveEntry(entry: any, basePath: string, seen: Set<string> = new Set()): Promise<any> {
  if (!entry?.$ref) return entry

  const refUrl = resolveUrl(basePath, entry.$ref)
  if (seen.has(refUrl)) {
    throw new Error(`Circular $ref detected while resolving: ${refUrl}`)
  }
  seen.add(refUrl)

  const refData = await fetchJson(refUrl)
  const resolvedRefData = await resolveEntry(refData, refUrl, seen)

  const { $ref, ...localFields } = entry
  return { ...resolvedRefData, ...localFields }
}

export function loadGameObject(gameObjectData: any): GameObject {
  const gameObject = new GameObject()
  gameObject.id = gameObjectData.id
  if (gameObjectData.tags) {
    console.log(`GameObject ${gameObject.id} tags: ${gameObject.tags.join(', ')}`)
    gameObject.tags = gameObjectData.tags
  }

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

  const sceneData = await fetchJson(scenePath)

  for (const prefabData of sceneData.prefabs ?? []) {
    const resolvedPrefabData = await resolveEntry(prefabData, scenePath)
    console.log(`Loading prefab: ${resolvedPrefabData.id}`)
    const prefab: GameObject = loadGameObject(resolvedPrefabData)
    assetPool.addPrefab(resolvedPrefabData.id, prefab)
  }

  for (const gameObjectData of sceneData.gameObjects) {
    const resolvedGameObjectData = await resolveEntry(gameObjectData, scenePath)
    console.log(`Loading game object: ${resolvedGameObjectData.id}`)

    if (resolvedGameObjectData.prefab) {
      const prefab = assetPool.getPrefab(resolvedGameObjectData.prefab)
      if (!prefab) {
        console.warn(`Prefab not found: ${resolvedGameObjectData.prefab}`)
        continue
      }
      const gameObject = prefab.clone()
      gameObject.id = resolvedGameObjectData.id
      if (resolvedGameObjectData.tags) {
        gameObject.tags = resolvedGameObjectData.tags
      }
      if (resolvedGameObjectData.components) {
        for (const componentData of resolvedGameObjectData.components) {
          const existingComponent = gameObject.getComponent(componentTypeMap[componentData.type])
          if (existingComponent) {
            applyAttributes(existingComponent, componentData.attributes || {})
          } else {
            console.warn(`Component type ${componentData.type} not found on prefab ${resolvedGameObjectData.prefab}`)
          }
        }
      }
      gameObjects.push(gameObject)
      continue
    }

    const gameObject = loadGameObject(resolvedGameObjectData)
    gameObjects.push(gameObject)
  }

  return gameObjects
}
