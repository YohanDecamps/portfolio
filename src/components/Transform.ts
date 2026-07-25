import { Component } from "./Component"

export class Transform extends Component {
  public position: { x: number, y: number, z: number }
  public rotation: { x: number, y: number, z: number, w: number }
  public scale: { x: number, y: number, z: number }
  
  constructor() {
    super()
    this.position = { x: 0, y: 0, z: 0 }
    this.rotation = { x: 0, y: 0, z: 0, w: 1 }
    this.scale = { x: 1, y: 1, z: 1 }
  }

  setPosition(x: number, y: number, z: number): void {
    this.position.x = x
    this.position.y = y
    this.position.z = z
  }
}
