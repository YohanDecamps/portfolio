import { Component } from "../components/Component";
import { VehicleController } from "../components/VehicleController";
import { Text } from "../components/Text";
import { app } from "../main";

export class DetectStuck extends Component {
  private stuckTimer: number = 0;
  private stuckThreshold: number = 5; // seconds

  constructor() {
    super();
  }
  
  update(dt: number): void {
    const vehicleController = this.gameObject?.getComponent(VehicleController);
    if (!vehicleController) {
      console.warn("VehicleController component not found on the game object.");
      return;
    }

    if (!vehicleController.isWheelGrounded(2) && !vehicleController.isWheelGrounded(3)) {
      this.stuckTimer += dt;
      if (this.stuckTimer >= this.stuckThreshold) {
        console.log("Vehicle is stuck.");
        const stuckMessage = app.findGameObjectById("unstuck-message");
        if (stuckMessage) {
          const textComponent = stuckMessage.getComponent(Text);
          if (textComponent) {
            textComponent.setVisibility(true);
          }
        }
      }
    } else {
      this.stuckTimer = 0; // Reset the timer if the vehicle is not stuck
      const stuckMessage = app.findGameObjectById("unstuck-message");
      if (stuckMessage) {
        const textComponent = stuckMessage.getComponent(Text);
        if (textComponent) {
          textComponent.setVisibility(false);
        }
      }
    }
  }
}
