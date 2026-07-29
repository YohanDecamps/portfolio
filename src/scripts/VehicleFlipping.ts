import RAPIER from "@dimforge/rapier3d-compat";
import { Component } from "../components/Component";
import { RigidBody } from "../components/RigidBody";
import { Transform } from "../components/Transform";
import { world } from "../main";

export class VehicleFlipping extends Component {
  // How far below the vehicle we look for ground before allowing flip-recovery.
  private groundCheckDistance = 1;
  // dot(vehicleUp, worldUp) below this counts as "tipped" (on its side or upside down).
  private uprightThreshold = 0.4;
  private torqueStrength = 0.1;

  constructor() {
    super();
  }

  update(dt: number): void {
  }
}
