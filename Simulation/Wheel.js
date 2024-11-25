import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

import GameObject from './GameObject.js';

import GlobalMath from './MathUtils/GlobalMath.js';
import { Vector3 } from './MathUtils/Vector3.js';
import { Quaternion } from './MathUtils/Quaternion.js';
const Vector3Static = new Vector3();

class Wheel extends GameObject {
    constructor(world, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0, w: 1 }, side = 1, axleSize = 0.1, radius = 0.11, width = 0.12) {
        super(position, rotation);

        this.radius = radius;
        this.width = width;
        this.side = side;
        this.axleSize = axleSize;


        const parentPosition = new Vector3(position.x, position.y, position.z);
        const parentRotation = new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
        
        let axleLocalPosition = new Vector3(0, 0, 0);
        let axleLocalRotation = new Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        let axleGlobalPosition = GlobalMath.getGlobalPosition(parentPosition, parentRotation, axleLocalPosition);
        let axleGlobalRotation = GlobalMath.getGlobalRotation(parentRotation, axleLocalRotation);

        this.axleBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(axleGlobalPosition.x, axleGlobalPosition.y, axleGlobalPosition.z)
                .setRotation(axleGlobalRotation)
                .setAngularDamping(100000.0)
                .setCanSleep(false)
        );

        this.axleCollider = world.createCollider(
            RAPIER.ColliderDesc.cuboid(this.axleSize/2, this.axleSize/2, this.axleSize/2)
                .setRotation(new Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2))
                .setMass(0.1)
                .setCollisionGroups(589823),
            this.axleBody
        );

        let wheelLocalPosition = Vector3Static.addVectors(axleLocalPosition, new Vector3(0, 0, 0));
        let wheelLocalRotation = new Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        let wheelGlobalPosition = GlobalMath.getGlobalPosition(parentPosition, parentRotation, wheelLocalPosition);
        let wheelGlobalRotation = GlobalMath.getGlobalRotation(parentRotation, wheelLocalRotation);
                
        this.wheelBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(wheelGlobalPosition.x, wheelGlobalPosition.y, wheelGlobalPosition.z)
                .setRotation(wheelGlobalRotation)
                .setAngularDamping(10.0)
                .setCanSleep(false)
        );
        this.wheelCollider = world.createCollider(
            RAPIER.ColliderDesc.roundCylinder(this.width, this.radius, this.radius*0.8)
                .setTranslation(wheelLocalPosition.x, wheelLocalPosition.y, wheelLocalPosition.z)
                .setRotation(new Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2))
                .setRestitution(0.5)
                .setFriction(2.5)
                .setFrictionCombineRule(RAPIER.CoefficientCombineRule.Multiply)
                .setCollisionGroups(262145),
            this.wheelBody
        );



        // this.moterJoint.setLimits(0, 0);

    }
    attachAxle(world, body, localPositionOnBody, rotationRestriction, allowSteering = true, maxSteerAngle = Math.PI / 6) {
        
        const axleLocalPosition = new Vector3(0, 0, 0);
    
        if(allowSteering) {
            this.steerJoint = world.createImpulseJoint(
                RAPIER.JointData.revolute(localPositionOnBody, new RAPIER.Vector3(0, 0, 0), new RAPIER.Vector3(0, 1, 0)),
                body,
                this.axleBody,
                true
            )
            this.moterJoint = world.createImpulseJoint(
                RAPIER.JointData.revolute(new RAPIER.Vector3(0, 0, 0), new RAPIER.Vector3(0, 0, 0), new RAPIER.Vector3(1, 0, 0)),
                this.axleBody,
                this.wheelBody,
                true
            );
        
            const minLimit = allowSteering ? -maxSteerAngle : 0;
            const maxLimit = allowSteering ? maxSteerAngle : 0;
            this.steerJoint.setLimits(minLimit, maxLimit);
            
            this.steerJoint.configureMotorModel(RAPIER.MotorModel.ForceBased)

            this.steerJoint.configureMotorPosition(0, 1000, 10);


            // this.moterJoint = world.createImpulseJoint(
            //     RAPIER.JointData.revolute(localPositionOnBody, axleLocalPosition, new RAPIER.Vector3(1, 0, 0)),
            //     body,
            //     this.wheelBody,
            //     true
            // )

            this.moterJoint.configureMotorModel(RAPIER.MotorModel.AccelerationBased);
        } else {
            this.moterJoint = world.createImpulseJoint(
                RAPIER.JointData.revolute(localPositionOnBody, axleLocalPosition, new RAPIER.Vector3(1, 0, 0)),
                body,
                this.wheelBody,
                true
            )

            this.moterJoint.configureMotorModel(RAPIER.MotorModel.AccelerationBased);
            this.moterJoint.configureMotorPosition(0, 1000, 10);


        }
    }
    
    setSteeringAngle(targetSteer) {
        if(this.steerJoint) {
            this.steerJoint.configureMotorPosition(targetSteer, 20000.0, 200.0);
        }
    }
    setMotorVelocity(velocity) {
        // console.log("Debugging stationary state");
        if (this.moterJoint) {
            // Lock the wheel at position 0
            this.moterJoint.configureMotorVelocity(velocity, 1000, 10); // High stiffness and damping
        }
    
        // Optionally log wheel dynamics
        // console.log("Wheel Angular Velocity:", this.wheelBody.angvel());
        // console.log("Motor Position Target:", this.moterJoint.motorPosition());
    }
    // setSteeringAngle(targetSteer) {
    //     this.steerJoint.configureMotorPosition(targetSteer, 10000.0, 100.0)
    // }
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
