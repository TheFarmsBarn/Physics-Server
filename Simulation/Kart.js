import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

import GameObject from './GameObject.js';
import Chassis from './Chassis.js';
import Wheel from './Wheel.js';

import GlobalMath from './MathUtils/GlobalMath.js';
import { Vector3 } from './MathUtils/Vector3.js';
import { Quaternion } from './MathUtils/Quaternion.js';
const Vector3Static = new Vector3();

class Kart extends GameObject {
    constructor(world, position = { x: 0, y: 5, z: 0 }, rotation = { x: 0, y: 0, z: 0, w: 1 }, height = 1, width = 1, length = 2) {
        super(position, rotation);

        this.height = height;
        this.width = width;
        this.length = length;

        this.chassis = new Chassis(world, position, rotation, width, height, length); // Create the chassis
        this.wheels = [];

        let axleSize = 0.1;
        let wheelWidth = 0.1;
        let wheelRadius = 0.3;

        this.currentVelocity = 0;
        this.currentSteeringAngle = 0;

        const parentPosition = new Vector3(position.x, position.y, position.z);
        const parentRotation = new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);

        let frontLeftWheelLocalPosition = new Vector3(this.width / 2, -this.height / 2, this.length / 2);
        let frontLeftWheelLocalRotation = new Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);

        let frontLeftWheelGlobalPosition = GlobalMath.getGlobalPosition(parentPosition, parentRotation, frontLeftWheelLocalPosition);
        let frontLeftWheelGlobalRotation = GlobalMath.getGlobalRotation(parentRotation, frontLeftWheelLocalRotation);

        this.frontLeftWheel = new Wheel(world, frontLeftWheelGlobalPosition, frontLeftWheelGlobalRotation, 1, axleSize, wheelRadius, wheelWidth);
        this.frontLeftWheel.attachAxle(world, this.chassis.chassisBody, frontLeftWheelLocalPosition, new RAPIER.Vector3(0, 1, 0));
        
        let backLeftWheelLocalPosition = new Vector3(this.width / 2, -this.height / 2, -this.length / 2);
        let backLeftWheelLocalRotation = new Quaternion();//.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);

        let backLeftWheelGlobalPosition = GlobalMath.getGlobalPosition(parentPosition, parentRotation, backLeftWheelLocalPosition);
        let backLeftWheelGlobalRotation = GlobalMath.getGlobalRotation(parentRotation, backLeftWheelLocalRotation);

        this.backLeftWheel = new Wheel(world, backLeftWheelGlobalPosition, backLeftWheelGlobalRotation, 1, axleSize, wheelRadius, wheelWidth);
        this.backLeftWheel.attachAxle(world, this.chassis.chassisBody, backLeftWheelLocalPosition, new RAPIER.Vector3(0, 1, 0), false);
        
        let frontRightWheelLocalPosition = new Vector3(-this.width / 2, -this.height / 2, this.length / 2);
        let frontRightWheelLocalRotation = new Quaternion();//.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);

        let frontRightWheelGlobalPosition = GlobalMath.getGlobalPosition(parentPosition, parentRotation, frontRightWheelLocalPosition);
        let frontRightWheelGlobalRotation = GlobalMath.getGlobalRotation(parentRotation, frontRightWheelLocalRotation);

        this.frontRightWheel = new Wheel(world, frontRightWheelGlobalPosition, frontRightWheelGlobalRotation, -1, axleSize, wheelRadius, wheelWidth);
        this.frontRightWheel.attachAxle(world, this.chassis.chassisBody, frontRightWheelLocalPosition, new RAPIER.Vector3(0, 1, 0));
        
        let backRightWheelLocalPosition = new Vector3(-this.width / 2, -this.height / 2, -this.length / 2);
        let backRightWheelLocalRotation = new Quaternion();//.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);

        let backRightWheelGlobalPosition = GlobalMath.getGlobalPosition(parentPosition, parentRotation, backRightWheelLocalPosition);
        let backRightWheelGlobalRotation = GlobalMath.getGlobalRotation(parentRotation, backRightWheelLocalRotation);

        this.backRightWheel = new Wheel(world, backRightWheelGlobalPosition, backRightWheelGlobalRotation, -1, axleSize, wheelRadius, wheelWidth);
        this.backRightWheel.attachAxle(world, this.chassis.chassisBody, backRightWheelLocalPosition, new RAPIER.Vector3(0, 1, 0), false);

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

    setSteeringAngle(angle) {

        const maxSteerAngle = Math.PI / 4; // 45 degrees
        angle = Math.max(-maxSteerAngle, Math.min(maxSteerAngle, angle)); // Clamp angle

        this.frontLeftWheel.setSteeringAngle(angle);
        this.frontRightWheel.setSteeringAngle(angle);

        this.currentSteeringAngle = angle;
    }
    
    setWheelVelocity(velocity) {
        this.currentVelocity = velocity;

        // this.frontLeftWheel.setMotorVelocity(velocity);
        // this.frontRightWheel.setMotorVelocity(velocity);
        this.backLeftWheel.setMotorVelocity(velocity);
        this.backRightWheel.setMotorVelocity(velocity);
    }
}

export default Kart;
