import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

import GameObject from './GameObject.js';

class Chassis extends GameObject {
    constructor(world, position = { x: 0, y: 5, z: 0 }, rotation = { x: 0, y: 0, z: 0, w: 1 }, width = 2.5, height = 1.5, length = 5, mass = 1, restitution = 0.5) {
        super(position);

        this.width = width;
        this.height = height;
        this.length = length;

        // Create chassis rigid body and collider
        this.chassisBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(position.x, position.y, position.z)
                .setRotation(rotation)
        );
        this.chassisCollider = world.createCollider(
            RAPIER.ColliderDesc
                .cuboid(this.width / 2, this.height / 2, this.length / 2)
                .setRestitution(restitution)
                .setMass(mass),
            this.chassisBody
        )
        .setCollisionGroups(131073);

        // Add two "headlight" colliders as directional markers
        const headlightOffset = this.width / 3; // Offset for headlights from center
        const headlightDepth = this.length / 2 + 0.1; // Slightly in front of the chassis

        // Left headlight
        this.leftHeadlight = world.createCollider(
            RAPIER.ColliderDesc
                .cuboid(0.1, 0.1, 0.1) // Small cuboid for the headlight
                .setTranslation(-headlightOffset, 0, headlightDepth) // Position on the left front
                .setMass(0), // Non-physical
            this.chassisBody
        );

        // Right headlight
        this.rightHeadlight = world.createCollider(
            RAPIER.ColliderDesc
                .cuboid(0.1, 0.1, 0.1) // Small cuboid for the headlight
                .setTranslation(headlightOffset, 0, headlightDepth) // Position on the right front
                .setMass(0), // Non-physical
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

    // Cleanup method to remove the chassis body and colliders from the world
    cleanup(world) {
        if (this.chassisBody) {
            world.removeRigidBody(this.chassisBody); // Remove the chassis body from the world
        }
        if (this.chassisCollider) {
            world.removeCollider(this.chassisCollider); // Remove the chassis collider from the world
        }
        if (this.leftHeadlight) {
            world.removeCollider(this.leftHeadlight); // Remove the left headlight collider
        }
        if (this.rightHeadlight) {
            world.removeCollider(this.rightHeadlight); // Remove the right headlight collider
        }
    }
}

export default Chassis;
