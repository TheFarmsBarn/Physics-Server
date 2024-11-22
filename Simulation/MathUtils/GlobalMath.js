class GlobalMath {
    constructor() {
        // No need to use the constructor for static methods
    }

    // Calculate global position
    static getGlobalPosition(parentPosition, parentRotation, localPosition) {
        // Rotate the local position by the parent's rotation
        const rotatedPosition = localPosition.clone().applyQuaternion(parentRotation);
        // Add the parent's position to get the global position
        return parentPosition.clone().add(rotatedPosition);
    }

    // Calculate global rotation
    static getGlobalRotation(parentRotation, localRotation) {
        // Multiply the parent's rotation with the local rotation
        return parentRotation.clone().multiply(localRotation);
    }
}

export default GlobalMath;
