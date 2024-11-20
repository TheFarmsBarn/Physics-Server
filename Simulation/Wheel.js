import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

import GameObject from './GameObject.js';

class Wheel extends GameObject {
    constructor(world, position = { x: 0, y: 5, z: 0 }, rotation = { x: 0, y: 0, z: 0, w: 1 }, radius = 0.2, width = 0.1) {
        super(position, rotation);

        this.radius = radius;
        this.width = width;

        // Create wheel rigid body and collider
        this.wheelBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic().setTranslation(position.x, position.y, position.z).setRotation(rotation)
        );
        this.wheelCollider = world.createCollider(
            RAPIER.ColliderDesc.cylinder(this.width, this.radius),
            this.wheelBody
        );
    }

    // Get the geometry of the wheel (position, radius, width, and rotation)
    getGeometry() {
        return {
            type: 'wheel',
            position: this.wheelBody.translation(),
            rotation: this.wheelBody.rotation(),
            radius: this.radius,
            width: this.width
        };
    }

    // Cleanup method to remove the wheel body and collider from the world
    cleanup(world) {
        if (this.wheelBody) {
            world.removeRigidBody(this.wheelBody);  // Remove the wheel body from the world
        }
        if (this.wheelCollider) {
            world.removeCollider(this.wheelCollider);  // Remove the wheel collider from the world
        }
    }
}

export default Wheel;
