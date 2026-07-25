
export class InputManager {
  private keys = new Set<string>()
  private mouseDelta = { x: 0, y: 0 }

  constructor() {
    window.addEventListener('keydown', e => this.keys.add(e.code))
    window.addEventListener('keyup', e => this.keys.delete(e.code))

    window.addEventListener('mousemove', e => {
      this.mouseDelta.x += e.movementX
      this.mouseDelta.y += e.movementY
    })
  }

  isKeyDown(code: string): boolean {
    return this.keys.has(code)
  }

  consumeMouseDelta() {
    const d = { ...this.mouseDelta }
    this.mouseDelta.x = 0
    this.mouseDelta.y = 0
    return d
  }
}
