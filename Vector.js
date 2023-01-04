/**
 * basic vector
 * @param {number} x
 * @param {number} y
 */
class VectorPlain {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other) {
        return new Vector(other.x + this.x, other.y + this.y);
    }
    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }
    scaleBy(koef) {
        return new Vector(this.x * koef, this.y * koef);
    }
}


class Vector extends VectorPlain {
    static toRadians(degree) {
        return degree * Math.PI / 180;
    }

    static toDegrees(rads) {
        return (rads / Math.PI) * 180;
    }
        

    constructor(x, y) {
        super(x, y);
    }
    // scalar 
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    mag() {
        return Math.hypot(this.x, this.y);
    }
    angle(other) {
        const dotOther = this.dot(other);
        const magMult = this.mag() * other.mag();

        const result = Math.acos(dotOther / magMult)
        
        if (Number.isNaN(result)) return 0;

        return result;
    }
    fullAngle() {
        const angle = Math.atan2(this.y, this.x);

        // if (angle < 0) return angle + 2 * Math.PI

        return angle;
    }
    distance(other) {
        return this.sub(other).mag();
    }

    rotate(angle) {
        const x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
        const y = this.x * Math.sin(angle) + this.y * Math.cos(angle);

        return new Vector(x, y);
    }
    //

    // toAngle(angle) {
    //     return new Vector(Math.cos(angle), Math.sin(angle));
    // }

    normalize() {
        const mag = this.mag();

        if (mag === 0) return this;

        return this.scaleBy(1 / mag);
    }
    negate() {
        return this.scaleBy(-1);
    }
} 