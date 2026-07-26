import type { Component } from "./Component"
import { Transform } from "./Transform"

export class GameObject {
  private components: Component[] = [new Transform()]
  public id: string
  
  constructor() {
    this.id = crypto.randomUUID()
  }

  clone(): GameObject {
    const newGameObject = new GameObject()
    newGameObject.id = this.id // Keep the same ID for the clone
    for (const component of this.components) {
      const clonedComponent = Object.create(Object.getPrototypeOf(component))
      Object.assign(clonedComponent, component)
      newGameObject.addComponent(clonedComponent)
    }
    return newGameObject
  }

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

