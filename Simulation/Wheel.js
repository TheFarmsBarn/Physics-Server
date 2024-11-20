const Rapier = require("@dimforge/rapier3d-compat");

const GameObject = require('./GameObject');

class Wheel extends GameObject {
    constructor(world, position = { x: 0, y: 5, z: 0 }, rotation = { x: 0, y: 0, z: 0, w: 1 }, radius = 0.2, width = 0.4) {
        super(position, rotation);

        this.radius = radius;
        this.width = width;

        // Create wheel rigid body and collider
        this.wheelBody = world.createRigidBody(
            Rapier.RigidBodyDesc.dynamic().setTranslation(position.x, position.y, position.z)
        );
        const wheelCollider = world.createCollider(
            Rapier.ColliderDesc.cylinder(this.radius, this.width),
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
}

module.exports = Wheel;
