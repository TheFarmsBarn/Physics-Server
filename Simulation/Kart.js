import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

import GameObject from './GameObject.js';
import Chassis from './Chassis.js';
import Wheel from './Wheel.js';
import Quaternion from './quaternion.js';

class Kart extends GameObject {
    constructor(world, position = { x: 0, y: 5, z: 0 }, rotation = { x: 0, y: 0, z: 0, w: 1 }, height = 1.5, width = 2.5, length = 5) {
        super(position, rotation);

        this.height = height;
        this.width = width;
        this.length = length;

        this.chassis = new Chassis(world, position, rotation, width, height, length); // Create the chassis
        this.wheels = [];
        // this.joints = [];

        // Calculate wheel positions and create the wheel objects
        let wheelWidth = 0.1
        let wheelRadius = 0.3

        let frontRightPosition = new RAPIER.Vector3(this.width / 2 + 0.05, this.height / 2, this.length / 2);
        this.axelFRBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(frontRightPosition.x, frontRightPosition.y, frontRightPosition.z)
                .setCanSleep(false)
        )
        this.wheelFRBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(frontRightPosition.x, frontRightPosition.y, frontRightPosition.z)
                .setCanSleep(false)
        );

        this.wheelFRShape = RAPIER.ColliderDesc.cylinder(0.1, 0.3)
            .setRotation(Quaternion.fromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2))
            .setTranslation(0.2, 0, 0)
            .setRestitution(0.5)
            .setFriction(2.5);

        this.axelFRShape = RAPIER.ColliderDesc.cuboid(0.1, 0.1, 0.1)
            .setRotation(Quaternion.fromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2))
            .setMass(0.1)

        this.wheelFRAxel = world.createImpulseJoint(
            RAPIER.JointData.revolute(frontRightPosition, new RAPIER.Vector3(0, 0, 0), new RAPIER.Vector3(0, 1, 0)),
            this.chassis.chassisBody,
            this.axelFRBody,
            true
        )
        this.wheelFRAxel.configureMotorModel(RAPIER.MotorModel.ForceBased);


        world.createImpulseJoint(
            RAPIER.JointData.revolute(new RAPIER.Vector3(0, 0, 0), new RAPIER.Vector3(0, 0, 0), new RAPIER.Vector3(1, 0, 0)),
            this.axelFRBody,
            this.wheelFRBody,
            true
        )

        world.createCollider(this.wheelFRShape, this.wheelFRBody)
        world.createCollider(this.axelFRShape, this.axelFRBody)

            // .setCollisionGroups(262145)
        // this.frontRightWheel = new Wheel(
        //     world,
        //     frontRightPosition,
        //     { x: 1, y: 0, z: 0, w: 1 },
        //     wheelRadius,
        //     wheelWidth
        // );
        // let joint = RAPIER.JointData.revolute(
        //     this.frontRightWheel.position,
        //     { x: 0.0, y: 0.0, z: 0.0 },
        //     { x: -1, y: 0.0, z: 0.0 }
        // );
        // world.createImpulseJoint(joint, this.chassis.chassisBody, this.frontRightWheel.wheelBody, true)


        // const wheels = [
        //     {
        //         position: { x: -this.width / 2 - wheelWidth*1.1, y: -this.height / 2, z: this.length / 2 },
        //         width: wheelWidth,
        //         radius: wheelRadius,
        //         axis: { x: -1, y: 0.0, z: 0.0 }
        //     },
        //     {
        //         position: { x: this.width / 2 + wheelWidth*1.1, y: -this.height / 2, z: this.length / 2 },
        //         width: wheelWidth,
        //         radius: wheelRadius,
        //         axis: { x: -1, y: 0.0, z: 0.0 }
        //     },
        //     {
        //         position: { x: -this.width / 2 - wheelWidth*1.1, y: -this.height / 2, z: -this.length / 2 },
        //         width: wheelWidth,
        //         radius: wheelRadius,
        //         axis: { x: 1, y: 0.0, z: 0.0 }
        //     },
        //     {
        //         position: { x: this.width / 2 + wheelWidth*1.1, y: -this.height / 2, z: -this.length / 2 },
        //         width: wheelWidth,
        //         radius: wheelRadius,
        //         axis: { x: 1, y: 0.0, z: 0.0 }
        //     }
        // ];

        // this.carBody = world.createRigidBody(
        //     RigidBodyDesc.dynamic()
        //         .setTranslation(...position)
        //         .setCanSleep(false)
        // )    

        // // world.createCollider(carShape, this.carBody)
        // world.createCollider(wheelFRShape, wheelFRBody)
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

export default Kart;
