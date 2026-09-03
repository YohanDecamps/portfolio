import { Component } from "../components/Component";
import { RigidBody } from "../components/RigidBody";
import { Transform } from "../components/Transform";
import { input, world } from "../main";

type Quat = { x: number; y: number; z: number; w: number };

const IDENTITY_QUAT: Quat = { x: 0, y: 1, z: 0, w: 0 };

export class VehicleFlipping extends Component {
  private maxHeight: number = 1.0;
  private startingHeight: number = 0.0;
  private rotationSmoothSpeed: number = 2.0; // higher = snaps back faster
  private snapAngleThreshold: number = 0.5; // degrees, below which we snap to identity

  constructor() {
    super();
  }

  private slerp(a: Quat, b: Quat, t: number): Quat {
    let { x: ax, y: ay, z: az, w: aw } = a;
    let { x: bx, y: by, z: bz, w: bw } = b;

    let dot = ax * bx + ay * by + az * bz + aw * bw;

    if (dot < 0) {
      bx = -bx; by = -by; bz = -bz; bw = -bw;
      dot = -dot;
    }

    const DOT_THRESHOLD = 0.9995;
    if (dot > DOT_THRESHOLD) {
      const result: Quat = {
        x: ax + t * (bx - ax),
        y: ay + t * (by - ay),
        z: az + t * (bz - az),
        w: aw + t * (bw - aw),
      };
      return this.normalizeQuat(result);
    }

    const theta0 = Math.acos(dot);
    const theta = theta0 * t;
    const sinTheta0 = Math.sin(theta0);
    const sinTheta = Math.sin(theta);

    const s0 = Math.cos(theta) - (dot * sinTheta) / sinTheta0;
    const s1 = sinTheta / sinTheta0;

    return {
      x: s0 * ax + s1 * bx,
      y: s0 * ay + s1 * by,
      z: s0 * az + s1 * bz,
      w: s0 * aw + s1 * bw,
    };
  }

  private normalizeQuat(q: Quat): Quat {
    const length = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
    if (length === 0) {
      return { x: 0, y: 0, z: 0, w: 1 };
    }
    return { x: q.x / length, y: q.y / length, z: q.z / length, w: q.w / length };
  }

  private angleBetween(a: Quat, b: Quat): number {
    let dot = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
    dot = Math.min(1, Math.max(-1, Math.abs(dot))); // clamp for safety
    return 2 * Math.acos(dot) * (180 / Math.PI); // degrees
  }

  update(dt: number): void {
    const transform = this.gameObject?.getComponent(Transform);
    const rigidBody = this.gameObject?.getComponent(RigidBody);

    if (transform && rigidBody) {
      if (input.isKeyDown("KeyR")) {
        rigidBody.setDynamic(false);
        if (this.startingHeight === 0.0) {
          this.startingHeight = transform.position.y;
        }

        if (transform.position.y < this.startingHeight + this.maxHeight) {
          rigidBody.setPosition(transform.position.x, transform.position.y + 0.1, transform.position.z);
        } else {
          const current: Quat = {
            x: transform.rotation.x,
            y: transform.rotation.y,
            z: transform.rotation.z,
            w: transform.rotation.w,
          };

          if (this.angleBetween(current, IDENTITY_QUAT) < this.snapAngleThreshold) {
            rigidBody.setRotation(IDENTITY_QUAT.x, IDENTITY_QUAT.y, IDENTITY_QUAT.z, IDENTITY_QUAT.w);
          } else {
            const t = 1 - Math.exp(-this.rotationSmoothSpeed * dt);
            const next = this.slerp(current, IDENTITY_QUAT, t);
            rigidBody.setRotation(next.x, next.y, next.z, next.w);
          }
        }
      } else {
        this.startingHeight = 0.0; // reset so next flip-reset starts fresh
        rigidBody.setDynamic(true);
      }
    }
  }
}
