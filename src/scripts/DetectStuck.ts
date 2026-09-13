import { Component } from "../components/Component";
import { VehicleController } from "../components/VehicleController";
import { Text } from "../components/Text";
import { app } from "../main";
import { RigidBody } from "../components/RigidBody";

export class DetectStuck extends Component {
  private stuckTimer: number = 0;
  private stuckThreshold: number = 3; // seconds
  private stuckMessage: Text | null = null;
  private vehicleController: VehicleController | null = null;

  constructor() {
    super();
  }

  start(): void {
    // Cache lookups once; update() runs every frame and must not allocate/scam.
    this.vehicleController = this.gameObject?.getComponent(VehicleController) ?? null;
    this.stuckMessage = app.findGameObjectById("unstuck-message")?.getComponent(Text) ?? null;
  }
  
  vectorLength(vector: { x: number, y: number, z: number }): number {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z)
  }
  
  update(dt: number): void {
    const rb = this.gameObject?.getComponent(RigidBody)
    const linvel = rb?.getBody().linvel()
    if (!this.vehicleController) return;

    if (linvel && this.vectorLength(linvel) > 0.1) {
      this.stuckTimer = 0;
      this.stuckMessage?.setVisibility(false);
      return;
    }
    const grounded = this.vehicleController.isWheelGrounded(2) || this.vehicleController.isWheelGrounded(3);
    if (!grounded) {
      this.stuckTimer += dt;
      if (this.stuckTimer >= this.stuckThreshold) {
        console.log("Vehicle is stuck.");
        this.stuckMessage?.setVisibility(true);
      }
    } else {
      this.stuckTimer = 0; // Reset the timer if the vehicle is not stuck
      this.stuckMessage?.setVisibility(false);
    }
  }
}
