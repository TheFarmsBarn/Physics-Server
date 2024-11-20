class Helper {
    constructor() {
        // No need to use the constructor for static methods
    }

    // Static method for magnitude calculation
    static magnitude(Rapier, vector) {
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    }

    // Static method for scaling a vector
    static scale(Rapier, vector, scaler) {
        return new Rapier.Vector3(vector.x * scaler, vector.y * scaler, vector.z * scaler);
    }

    // Static method for linear interpolation
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }
}

module.exports = Helper;
export default Helper;
