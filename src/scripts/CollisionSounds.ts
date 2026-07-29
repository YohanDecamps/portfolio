import RAPIER from "@dimforge/rapier3d-compat";
import { Component } from "../components/Component";
import { RigidBody } from "../components/RigidBody";
import { app, audioLoader, eventQueue, listener, world } from "../main";
import * as THREE from "three";

export class CollisionSounds extends Component {
  rigidbodies: RigidBody[] = []

  // How long to wait (in seconds) before the same pair of objects can play a sound again
  private cooldownDuration = 1

  // Tracks elapsed time since start(), driven by dt each update
  private elapsedTime = 0

  // Maps a canonical pair-key -> last time (in elapsedTime seconds) a sound was played
  private lastPlayed: Map<string, number> = new Map()

  constructor() {
    super()
  }

  start(): void {
    this.rigidbodies = app.findGameObjectsByTag("collision-sound").map(go => go.getComponent(RigidBody)).filter(rb => rb !== null) as RigidBody[]
    console.log(`CollisionSounds component started. Found ${this.rigidbodies.length} rigidbodies with collision-sound tag.`)
  }

  // Builds a stable key for a pair of handles regardless of order
  private getPairKey(handle1: RAPIER.ColliderHandle, handle2: RAPIER.ColliderHandle): string {
    return handle1 < handle2 ? `${handle1}_${handle2}` : `${handle2}_${handle1}`
  }

  update(dt: number) {
    this.elapsedTime += dt

    eventQueue.drainCollisionEvents((handle1: RAPIER.ColliderHandle, handle2: RAPIER.ColliderHandle, started: boolean) => {
      if (started) {

        const rb1 = world.getCollider(handle1).parent()
        const rb2 = world.getCollider(handle2).parent()

        if (rb1 && rb2) {
          const pairKey = this.getPairKey(rb1?.handle, rb2?.handle)
          const lastPlayedTime = this.lastPlayed.get(pairKey)

          if (lastPlayedTime !== undefined && this.elapsedTime - lastPlayedTime < this.cooldownDuration) {
            // Still on cooldown, skip playing a sound for this pair
            return
          }
          const gameObject1 = this.rigidbodies.find(rb => rb.getBody() === rb1)
          const gameObject2 = this.rigidbodies.find(rb => rb.getBody() === rb2)

          if (gameObject1 && gameObject2) {
            // Mark this pair as played now, before the async load resolves,
            // so rapid repeated collision events don't all slip through
            this.lastPlayed.set(pairKey, this.elapsedTime)

            const velocityDiff = Math.abs(rb1.linvel().x - rb2.linvel().x) + Math.abs(rb1.linvel().y - rb2.linvel().y) + Math.abs(rb1.linvel().z - rb2.linvel().z)

            const averageMass = (rb1.mass() + rb2.mass()) / 2

            const sound = new THREE.Audio(listener)
            audioLoader.load('sounds/stone-impact-' + Math.floor(Math.random() * 6) + '.ogg', function (buffer) {
              sound.setBuffer(buffer)
              sound.setLoop(false)
              sound.setVolume(Math.random() * velocityDiff * averageMass * 0.1 + 0.1) // Volume based on velocity difference, with a minimum volume
              sound.setDetune(Math.random() * 400 - 400 * averageMass) // Detune based on average mass
              sound.play()
            })
          }
        }
      }
    })
  }
}
