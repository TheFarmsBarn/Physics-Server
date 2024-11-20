import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

import GameObject from './GameObject.js';

class Chassis extends GameObject {
    constructor(world, position = { x: 0, y: 5, z: 0 }, rotation = { x: 0, y: 0, z: 0, w: 1 }, width = 2.5, height = 1.5, length = 5, mass = 0.5, restitution = 0.5) {
        super(position);

        this.width = width;
        this.height = height;
        this.length = length;

        // Create chassis rigid body and collider
        this.chassisBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(position.x, position.y, position.z)
                .setRotation({ x: 0, y: 0, z: 0, w: 1 })
        );
        this.chassisCollider = world.createCollider(
            RAPIER.ColliderDesc
                .cuboid(this.width / 2, this.height / 2, this.length / 2)
                .setRestitution(restitution)
                .setMass(mass),
            this.chassisBody
        );
    }

    // Get the geometry of the chassis (position, rotation, dimensions)
    getGeometry() {
        return {
            type: 'chassis',
            position: this.chassisBody.translation(),
            rotation: this.chassisBody.rotation(),
            width: this.width,
            height: this.height,
            length: this.length
        };
    }

    // Cleanup method to remove the chassis body and collider from the world
    cleanup(world) {
        if (this.chassisBody) {
            world.removeRigidBody(this.chassisBody);  // Remove the chassis body from the world
        }
        if (this.chassisCollider) {
            world.removeCollider(this.chassisCollider);  // Remove the chassis collider from the world
        }
    }
}

export default Chassis;
