import type { Updatable } from "./Updatable"

export class GameObject implements Updatable {
  private components: Updatable[] = []

  addComponent(component: Updatable): void {
    this.components.push(component)
  }
  
  removeComponent(component: Updatable): void {
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

