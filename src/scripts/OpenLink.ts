import type { ActionComponent } from "../components/ActionComponent"
import { Component } from "../components/Component"

export class OpenLink extends Component implements ActionComponent {
  private link: string = ""

  constructor() {
    super()
  }

  executeAction(): void {
    if (this.link) {
      window.open(this.link, "_blank")
    }
  }
}
