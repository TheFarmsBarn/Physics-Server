class GameObject {
    constructor(position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0, w: 1 }) {
        this.position = position;  // Position of the object
        this.rotation = rotation;  // Quaternion rotation of the object (default: no rotation)
    }

    // Method to be overridden by subclasses to return geometry as a flat array
    getGeometry() {
        return [];  // Default returns an empty array
    }

    // Cleanup method for derived classes to override if necessary
    cleanup(world) {
        // This method can be overridden in derived classes (e.g., Chassis, Wheel)
    }
}

export default GameObject;
