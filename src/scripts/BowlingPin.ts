import { Component } from "../components/Component"
import type { GameObject } from "../components/GameObject"
import { app } from "../main"
import { Transform } from "../components/Transform"

export class BowlingPin extends Component {
  private bowlingPins: GameObject[] = []
  private startPositions: { x: number, y: number, z: number }[] = []
  private movedPins: Set<number> = new Set()
  private hasStriked: boolean = false

  constructor() {
    super()
  }

  start(): void {
    this.bowlingPins = app.findGameObjectsByTag("bowling-pin")
    console.log(`Found ${this.bowlingPins.length} bowling pins`)

    for (let i = 0; i < this.bowlingPins.length; i++) {
      const transform: Transform | null = this.bowlingPins[i]?.getComponent(Transform) || null
      if (transform) {
        this.startPositions.push({ x: transform.position.x, y: transform.position.y, z: transform.position.z })
      }
    }
  }

  update(dt: number) {
    for (let i = 0; i < this.bowlingPins.length; i++) {
      const transform: Transform | null = this.bowlingPins[i]?.getComponent(Transform) || null
      if (transform) {
        const startPos = this.startPositions[i]
        const distance = Math.sqrt(
          Math.pow(transform.position.x - startPos.x, 2) +
          Math.pow(transform.position.y - startPos.y, 2) +
          Math.pow(transform.position.z - startPos.z, 2)
        )

        if (distance > 0.5) {
          this.movedPins.add(i)
        }
      }
    }

    if (this.movedPins.size > 3 && !this.hasStriked) {
      console.log("Strike! More than 3 pins have moved.")
      this.hasStriked = true

    }
  }
}
