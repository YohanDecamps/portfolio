import type { Component } from "./Component"
import { Transform } from "./Transform"

export class GameObject {
  private components: Component[] = [new Transform()]
  public id: number = Math.floor(Math.random() * 1000000)

  start(): void {
    for (const component of this.components) {
      component.start()
    }
  }

  addComponent(component: Component): void {
    this.components.push(component)
    component.setGameObject(this)
    component.awake()
  }

  getComponent<T extends Component>(componentType: new (...args: any[]) => T): T | null {
    for (const component of this.components) {
      if (component instanceof componentType) {
        return component as T
      }
    }
    return null
  }
  
  removeComponent(component: Component): void {
    const index = this.components.indexOf(component)
    if (index !== -1) {
      this.components.splice(index, 1)
    }
  }

  update(dt: number): void {
    for (const component of this.components) {
      component.update(dt)
    }
  }
}

