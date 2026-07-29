import { Component } from "../components/Component"
import type { GameObject } from "../components/GameObject"
import { app, input } from "../main"
import { Mesh } from "../components/Mesh"
import { Transform } from "../components/Transform"
import type { ActionComponent } from "../components/ActionComponent"

function curveInterpolation(start: number, end: number, t: number): number {
  const overshoot = 1.70158
  const shiftedT = t - 1
  const curvedT = shiftedT * shiftedT * ((overshoot + 1) * shiftedT + overshoot) + 1
  return start + (end - start) * curvedT
}

export class EnterZone extends Component {
  private player: GameObject | null = null
  private maxHeight: number = 1.9
  private heightDisplacement: number = 0
  private speed: number = 4

  private boundaryWidth: number = 2.5
  private boundaryDepth: number = 4.5

  private wasEnterDown: boolean = false
  private enterCooldown: number = 0
  private readonly enterCooldownDuration: number = 1
  
  public actionComponent: string = ""

  constructor() {
    super()
  }

  start(): void {
  }

  private isPlayerInBounds(): boolean {
    this.player = app.findGameObjectsByTag("player")[0]
    if (!this.player || !this.gameObject) return false


    const zonePos = this.gameObject?.getComponent(Transform)?.position
    const playerPos = this.player.getComponent(Transform)?.position
    if (!zonePos || !playerPos) return false

    const halfWidth = this.boundaryWidth / 2
    const halfDepth = this.boundaryDepth / 2

    const withinX = Math.abs(playerPos.x - zonePos.x) <= halfWidth
    const withinZ = Math.abs(playerPos.z - zonePos.z) <= halfDepth

    return withinX && withinZ
  }

  update(dt: number) {
    if (this.enterCooldown > 0) {
      this.enterCooldown -= dt
    }

    if (!this.player) return
    const sensorMesh = this.gameObject?.getComponent(Mesh)
    if (!sensorMesh) return

    const isEnterDown = input.isKeyDown('Enter')
    const isCurrentlyInBounds = this.isPlayerInBounds()

    if (isCurrentlyInBounds) {
      if (isEnterDown && !this.wasEnterDown && this.enterCooldown <= 0) {
        const actionComponent = this.gameObject?.getComponentString(this.actionComponent)

        if (actionComponent && 'executeAction' in actionComponent) {
          (actionComponent as ActionComponent).executeAction()
        }
        this.enterCooldown = this.enterCooldownDuration
      }

      if (this.heightDisplacement < this.maxHeight) {
        this.heightDisplacement += dt * this.speed
      }
    } else {
      if (this.heightDisplacement > 0) {
        this.heightDisplacement -= dt * this.speed
      }
    }

    this.wasEnterDown = isEnterDown

    sensorMesh.position.y = curveInterpolation(0, this.maxHeight, this.heightDisplacement / this.maxHeight)
  }
}
