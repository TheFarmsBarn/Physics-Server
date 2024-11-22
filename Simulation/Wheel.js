import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

import GameObject from './GameObject.js';

import GlobalMath from './MathUtils/GlobalMath.js';
import { Vector3 } from './MathUtils/Vector3.js';
import { Quaternion } from './MathUtils/Quaternion.js';
const Vector3Static = new Vector3();

class Wheel extends GameObject {
    constructor(world, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0, w: 1 }, side = 1, axleSize = 0.1, radius = 0.3, width = 0.1) {
        super(position, rotation);

        this.radius = radius;
        this.width = width;
        this.side = side;
        this.axleSize = axleSize;


        const parentPosition = new Vector3(position.x, position.y, position.z);
        const parentRotation = new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
        
        let axleLocalPosition = new Vector3(this.side * axleSize * 2, 0, 0);
        let axleLocalRotation = new Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        let axleGlobalPosition = GlobalMath.getGlobalPosition(parentPosition, parentRotation, axleLocalPosition);
        let axleGlobalRotation = GlobalMath.getGlobalRotation(parentRotation, axleLocalRotation);

        this.axleBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(axleGlobalPosition.x, axleGlobalPosition.y, axleGlobalPosition.z)
                .setRotation(axleGlobalRotation)
                .setCanSleep(false)
        );

        this.axleCollider = world.createCollider(
            RAPIER.ColliderDesc.cuboid(this.axleSize/2, this.axleSize/2, this.axleSize/2)
                .setRotation(new Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2))
                .setMass(0.1),
            this.axleBody
        )
        .setCollisionGroups(589823);

        let wheelLocalPosition = Vector3Static.addVectors(axleLocalPosition, new Vector3(this.side * this.width, 0, 0));
        let wheelLocalRotation = new Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        let wheelGlobalPosition = GlobalMath.getGlobalPosition(parentPosition, parentRotation, wheelLocalPosition);
        let wheelGlobalRotation = GlobalMath.getGlobalRotation(parentRotation, wheelLocalRotation);
                
        this.wheelBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(wheelGlobalPosition.x, wheelGlobalPosition.y, wheelGlobalPosition.z)
                .setRotation(wheelGlobalRotation)
                .setCanSleep(false)
        );

        this.wheelCollider = world.createCollider(
            RAPIER.ColliderDesc.cylinder(this.width, this.radius)
                .setTranslation(wheelLocalPosition.x, wheelLocalPosition.y, wheelLocalPosition.z)
                .setRotation(new Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2))
                .setRestitution(0.5)
                .setFriction(2.5),
            this.wheelBody
        )
        .setCollisionGroups(262145);

        this.moterJoint = world.createImpulseJoint(
            RAPIER.JointData.revolute(new RAPIER.Vector3(0, 0, 0), new RAPIER.Vector3(0, 0, 0), new RAPIER.Vector3(1, 0, 0)),
            this.axleBody,
            this.wheelBody,
            true
        )
        this.moterJoint.configureMotorModel(RAPIER.MotorModel.ForceBased)

        // this.moterJoint.setLimits(0, 0);

    }
    attachAxle(world, body, localPositionOnBody, rotationRestriction, allowSteering = true, maxSteerAngle = Math.PI / 6) {
        const axleLocalPosition = new Vector3(-1 * this.side * this.axleSize * 2, 0, 0);
        this.steerJoint = world.createImpulseJoint(
            RAPIER.JointData.revolute(localPositionOnBody, axleLocalPosition, rotationRestriction),
            body,
            this.axleBody,
            true
        );


        let minLimit = 0;
        let maxLimit = 0;
        if (allowSteering) {
            minLimit = -maxSteerAngle;
            maxLimit = maxSteerAngle;
        }


        this.steerJoint.setLimits(minLimit, maxLimit);
        this.steerJoint.configureMotorPosition(0, 10000.0, 100.0)
        this.moterJoint.configureMotorPosition(0, 10000.0, 100.0)

    }
    setMotorVelocity(velocity) {
        console.log(velocity);
        this.moterJoint.configureMotorVelocity(velocity, 10.0); // 10.0 is the motor force
    }
    setSteeringAngle(targetSteer) {
        this.steerJoint.configureMotorPosition(targetSteer, 10000.0, 100.0)
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
