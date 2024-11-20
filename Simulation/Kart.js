const Rapier = require("@dimforge/rapier3d-compat");

const GameObject = require('./GameObject');
const Chassis = require('./Chassis');
const Wheel = require('./Wheel');

class Kart extends GameObject {
    constructor(world, position = { x: 0, y: 5, z: 0 }, rotation = { x: 0, y: 0, z: 0, w: 1 }, height = 1.5, width = 2.5, length = 5) {
        super(position, rotation);

        this.height = height;
        this.width = width;
        this.length = length;

        this.chassis = new Chassis(world, position, width, height, length); // Create the chassis
        this.wheels = [];

        // Calculate wheel positions and create the wheel objects
        const wheelPositions = [
            { x: -this.width / 2, y: -this.height / 2, z: this.length / 2 },  // Front-left
            { x: this.width / 2, y: -this.height / 2, z: this.length / 2 },   // Front-right
            { x: -this.width / 2, y: -this.height / 2, z: -this.length / 2 }, // Back-left
            { x: this.width / 2, y: -this.height / 2, z: -this.length / 2 }   // Back-right
        ];

        wheelPositions.forEach(pos => {
            this.wheels.push(new Wheel(world, pos)); // Create wheel and push to wheels array
        });
    }

    // Get all geometries for the kart (flat array including position and rotation)
    getGeometry() {
        // Gather geometry from chassis and all wheels into a single object
        const geometry = {
            chassis: this.chassis.getGeometry(),    // Chassis geometry
            wheels: this.wheels.map(wheel => wheel.getGeometry())  // Wheels geometry
        };

        return geometry;  // Return aggregated geometry
    }


    // Move the kart forward
    moveForward(force) {
        // const forwardForce = { x: 0, y: 0, z: -force };
        // this.chassisBody.addForce(forwardForce, true);
    }
    
    // Steer the kart
    steer(direction) {
        if (direction === -1) {
            this.steeringAngle = Math.max(this.steeringAngle - this.steeringIncrement, -this.maxSteeringAngle);
        } else if (direction === 1) {
            this.steeringAngle = Math.min(this.steeringAngle + this.steeringIncrement, this.maxSteeringAngle);
        } else if (direction === 0) {
            this.steeringAngle = 0; // Reset steering
        }
    
        // Adjust the orientation of the front wheel joints
        const leftAxis = { x: Math.sin(this.steeringAngle), y: 0, z: Math.cos(this.steeringAngle) };
        const rightAxis = { x: Math.sin(this.steeringAngle), y: 0, z: Math.cos(this.steeringAngle) };
    
        // Assuming front wheels are the first two in `this.wheels`
        // this.joints[0].setAxis(leftAxis);
        // this.joints[1].setAxis(rightAxis);
    }
}

module.exports = Kart;
