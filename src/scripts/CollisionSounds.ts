import RAPIER from "@dimforge/rapier3d-compat";
import { Component } from "../components/Component";
import { RigidBody } from "../components/RigidBody";
import { app, audioLoader, eventQueue, listener, world } from "../main";
import * as THREE from "three";

const IMPACT_SOUND_COUNT = 6
const AUDIO_POOL_SIZE = 8 // simultaneous impact sounds; tune to taste

export class CollisionSounds extends Component {
  rigidbodies: RigidBody[] = []

  // How long to wait (in seconds) before the same pair of objects can play a sound again
  private cooldownDuration = 1

  // Tracks elapsed time since start(), driven by dt each update
  private elapsedTime = 0

  // Maps a canonical pair-key -> last time (in elapsedTime seconds) a sound was played
  private lastPlayed: Map<string, number> = new Map()

  // O(1) lookup from Rapier RigidBody -> owning component, instead of Array.find() per collision
  private bodyToRigidbody: Map<RAPIER.RigidBody, RigidBody> = new Map()

  // Preloaded audio buffers, loaded once instead of per-collision
  private impactBuffers: AudioBuffer[] = []
  private buffersReady = false

  // Small pool of reusable THREE.Audio objects to avoid per-collision allocation
  private audioPool: THREE.Audio[] = []
  private audioPoolIndex = 0

  // Periodic cleanup of stale cooldown entries so the map doesn't grow unbounded
  private timeSinceLastCleanup = 0
  private cleanupInterval = 10 // seconds

  constructor() {
    super()
  }

  start(): void {
    this.rigidbodies = app.findGameObjectsByTag("collision-sound")
      .map(go => go.getComponent(RigidBody))
      .filter(rb => rb !== null) as RigidBody[]

    // Build lookup map once instead of scanning the array on every collision
    for (const rb of this.rigidbodies) {
      this.bodyToRigidbody.set(rb.getBody(), rb)
    }

    // Preload all impact sound buffers once, up front
    let loadedCount = 0
    for (let i = 0; i < IMPACT_SOUND_COUNT; i++) {
      audioLoader.load(`sounds/stone-impact-${i}.ogg`, (buffer) => {
        this.impactBuffers[i] = buffer
        loadedCount++
        if (loadedCount === IMPACT_SOUND_COUNT) {
          this.buffersReady = true
        }
      })
    }

    // Pre-create a pool of THREE.Audio objects to reuse instead of `new THREE.Audio()` per impact
    for (let i = 0; i < AUDIO_POOL_SIZE; i++) {
      this.audioPool.push(new THREE.Audio(listener))
    }

    console.log(`CollisionSounds component started. Found ${this.rigidbodies.length} rigidbodies with collision-sound tag.`)
  }

  // Builds a stable key for a pair of handles regardless of order
  private getPairKey(handle1: RAPIER.ColliderHandle, handle2: RAPIER.ColliderHandle): string {
    return handle1 < handle2 ? `${handle1}_${handle2}` : `${handle2}_${handle1}`
  }

  private getNextAudioFromPool(): THREE.Audio {
    const sound = this.audioPool[this.audioPoolIndex]
    this.audioPoolIndex = (this.audioPoolIndex + 1) % this.audioPool.length
    if (sound.isPlaying) sound.stop()
    return sound
  }

  update(dt: number) {
    this.elapsedTime += dt

    // Periodically prune old cooldown entries so the map doesn't grow forever
    this.timeSinceLastCleanup += dt
    if (this.timeSinceLastCleanup >= this.cleanupInterval) {
      this.timeSinceLastCleanup = 0
      for (const [key, time] of this.lastPlayed) {
        if (this.elapsedTime - time > this.cooldownDuration) {
          this.lastPlayed.delete(key)
        }
      }
    }

    if (!this.buffersReady) {
      // Still drain the queue even if sounds aren't loaded yet, so events don't pile up
      eventQueue.drainCollisionEvents(() => {})
      return
    }

    eventQueue.drainCollisionEvents((handle1: RAPIER.ColliderHandle, handle2: RAPIER.ColliderHandle, started: boolean) => {
      if (!started) return

      const rb1 = world.getCollider(handle1).parent()
      const rb2 = world.getCollider(handle2).parent()

      if (!rb1 || !rb2) return

      const pairKey = this.getPairKey(rb1.handle, rb2.handle)
      const lastPlayedTime = this.lastPlayed.get(pairKey)

      if (lastPlayedTime !== undefined && this.elapsedTime - lastPlayedTime < this.cooldownDuration) {
        // Still on cooldown, skip playing a sound for this pair
        return
      }

      const gameObject1 = this.bodyToRigidbody.get(rb1)
      const gameObject2 = this.bodyToRigidbody.get(rb2)

      if (!gameObject1 || !gameObject2) return

      // Mark this pair as played now, so rapid repeated collision events don't all slip through
      this.lastPlayed.set(pairKey, this.elapsedTime)

      const velocityDiff =
        Math.abs(rb1.linvel().x - rb2.linvel().x) +
        Math.abs(rb1.linvel().y - rb2.linvel().y) +
        Math.abs(rb1.linvel().z - rb2.linvel().z)

      const averageMass = (rb1.mass() + rb2.mass()) / 2

      const buffer = this.impactBuffers[Math.floor(Math.random() * IMPACT_SOUND_COUNT)]
      const sound = this.getNextAudioFromPool()
      sound.setBuffer(buffer)
      sound.setLoop(false)
      sound.setVolume(Math.random() * velocityDiff * averageMass * 0.1 + 0.1)
      sound.setDetune(Math.random() * 400 - 400 * averageMass)
      sound.play()
    })
  }
}
