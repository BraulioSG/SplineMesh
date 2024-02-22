export class Coord3D {
    /**
     * Coordinate3D
     * @param {number} x coordinate in x
     * @param {number} y coordinate in y
     * @param {number} z coordinate in z
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
export class Point3D extends Coord3D {
    /**
     * Point3D
     * @param {number} x position in x
     * @param {number} y position in y
     * @param {number} z position in z
     */
    constructor(x, y, z) {
        super(x, y, z);
    }

    static add(pointA, pointB) {
        return new Point3D(pointA.x + pointB.x, pointA.y + pointB.y, pointA.z + pointB.z);
    }

    static sub(pointA, pointB) {
        return new Point3D(pointA.x - pointB.x, pointA.y - pointB.y, pointA.z - pointB.z);
    }

    /**
     * Move this point to the direction of the vector
     * @param {Vector3D} vector direction
     */
    move(vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
    }

    /**
     * Creates a new Point3D that is displaced in a vector direction
     * @param {Vector3D} vector direction;
     * @returns A new Point3D
     */
    addVector(vector) {
        return Point3D.add(this, vector);
    }
}

export class Vector3D extends Point3D {
    /**
     * Vector3D
     * @param {Point3D | Coord3D} point direction
     */
    constructor(point) {
        super(point.x, point.y, point.z);
        this.magnitude = this.#calcMagnitude();
    }

    /**
     * Calculates the magnitude of the vector
     * @returns The magnitude of the Vector
     */
    #calcMagnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
    }

    /**
     * Calculates a vector with magnitude 1 in the same direction
     * @returns the normilized vector
     */
    normalize() {
        return new Vector3D(
            new Point3D(this.x / this.magnitude, this.y / this.magnitude, this.z / this.magnitude)
        );
    }

    /**
     * returns a Vector multiplied by a scalar
     * @param {number} num scalar
     * @returns
     */
    byScalar(num) {
        return new Vector3D(new Point3D(this.x * num, this.y * num, this.z * num));
    }
}

export class BezierCurve3D {
    points = [];
    constructor(fragments, pointA, pointB, pointC, pointD) {
        const delta = 1 / fragments;
        for (let step = 0; step <= fragments; step++) {
            const t = step * delta;
            const A = new Vector3D(pointA);
            const B = new Vector3D(pointB);
            const C = new Vector3D(pointC);
            const D = new Vector3D(pointD);

            const part1 = A.byScalar(Math.pow(1 - t, 3));
            const part2 = B.byScalar(3 * Math.pow(1 - t, 2) * t);
            const part3 = C.byScalar(3 * (1 - t) * Math.pow(t, 2));
            const part4 = D.byScalar(Math.pow(t, 3));

            const p12 = Point3D.add(part1, part2);
            const p123 = Point3D.add(p12, part3);
            const p1234 = Point3D.add(p123, part4);
            this.points.push(p1234);
        }
    }
}

export class SplinePoint3D extends Point3D {
    handle1 = null;
    handle2 = null;

    /**
     * SplinePoint3D
     * @param {number} x position in x
     * @param {number} y posiiton in y
     * @param {number} z position in z
     */
    constructor(x, y, z) {
        super(x, y, z);
    }

    handleLine() {
        let line = [];
        if (this.handle1) line.push(this.handle1);
        line.push(new Point3D(this.x, this.y, this.z));
        if (this.handle2) line.push(this.handle2);

        return line;
    }
}

export class Spline3D {
    /**
     * Spline 3D
     * @param {SplinePoint3D} points
     * @returns
     */
    constructor(points, interpolation = 2) {
        if (points.length < 3) throw new Error("Splines should have a minimun of 3 points");

        this.interpolation = interpolation;

        this.points = points;
        this.#calculateHandles();

        this.curves = [];
        this.#calculateCurves();

        this.splineLine = [];
        this.#calculateSplineLine();
    }

    setInterpolation(num) {
        if (num < 1) return;
        this.interpolation = num;
        this.#calculateSplineLine();
    }

    #calculateHandles() {
        const last = this.points.length - 1;
        //first 3 points
        const dirAC = new Vector3D(Point3D.sub(this.points[2], this.points[0]));
        const dirAC_norm = dirAC.normalize();
        const handleBsize = dirAC.magnitude / 6;

        //POINT B HANDLES
        this.points[1].handle2 = this.points[1].addVector(dirAC_norm.byScalar(handleBsize));
        this.points[1].handle1 = this.points[1].addVector(dirAC_norm.byScalar(-handleBsize));

        //POINT A HANDLE
        const dirBA = new Vector3D(Point3D.sub(this.points[0], this.points[1]));
        const dirBA_norm = dirBA.normalize();
        const handleAsize = dirBA.magnitude / 3;

        this.points[0].handle2 = this.points[1].handle1.addVector(dirBA_norm.byScalar(handleAsize));

        //Middle points
        for (let idx = 2; idx < last; idx++) {
            const dir = new Vector3D(Point3D.sub(this.points[idx + 1], this.points[idx - 1]));
            const dir_norm = dir.normalize();
            const handle_size = dir.magnitude / 6;
            this.points[idx].handle2 = this.points[idx].addVector(dir_norm.byScalar(handle_size));
            this.points[idx].handle1 = this.points[idx].addVector(dir_norm.byScalar(-handle_size));
        }

        //LAST POINT HANDLE
        const dirBC = new Vector3D(Point3D.sub(this.points[last], this.points[last - 1]));
        const dirBC_norm = dirBC.normalize();
        const handleCsize = dirBC.magnitude / 3;

        this.points[last].handle1 = this.points[last - 1].handle2.addVector(
            dirBC_norm.byScalar(handleCsize)
        );
    }

    #calculateCurves() {
        for (let i = 1; i < this.points.length; i++) {
            const prev = this.points[i - 1];
            const curr = this.points[i];

            this.curves.push(
                new BezierCurve3D(this.interpolation + 1, prev, prev.handle2, curr.handle1, curr)
            );
        }
    }

    #calculateSplineLine() {
        this.splineLine = [];
        this.curves.forEach((curve, curveIdx) => {
            curve.points.forEach((point, pointIdx) => {
                if (pointIdx === 0 && curveIdx !== 0) return;
                this.splineLine.push(point);
            });
        });
    }

    extrude(extrudeDirection) {
        let surfacePoints = []; //odd points are the spline, even are the extuded
        let indices = [];

        this.splineLine.forEach((p) => {
            surfacePoints.push(p.x);
            surfacePoints.push(p.y);
            surfacePoints.push(p.z);

            const extruded = p.addVector(extrudeDirection);
            surfacePoints.push(extruded.x);
            surfacePoints.push(extruded.y);
            surfacePoints.push(extruded.z);
        });

        for (let i = 0; i + 3 < this.splineLine.length * 2; i += 2) {
            indices.push(i);
            indices.push(i + 1);
            indices.push(i + 3);

            indices.push(i + 3);
            indices.push(i + 2);
            indices.push(i);
        }

        return new SplineExtruded3D(surfacePoints, indices);
    }
}

export class SplineExtruded3D {
    constructor(points, indices) {
        this.points = points;
        this.indices = indices;
    }
}

export class SplineSurface3D {
    constructor(splines, interpolation) {
        this.splines = [];
        this.interpolation = interpolation;
    }
}

export class Grid3D {
    points = [];
    positions = [];
    indices = [];
    count = 0;

    constructor(segmentsX, segmentsY, sizeX, sizeY, z = 0) {
        this.segmentsX = segmentsX;
        this.segmentsY = segmentsY;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.z = z;

        this.#genGrid();
    }

    #genGrid() {
        this.count = 0;
        const deltaX = this.sizeX / this.segmentsX;
        const deltaY = this.sizeY / this.segmentsY;

        const halfX = this.sizeX / 2;
        const halfy = this.sizeY / 2;

        for (let x = 0; x <= this.sizeX; x += deltaX) {
            for (let y = 0; y <= this.sizeY; y += deltaY) {
                const p = new Point3D(x - halfX, y - halfy, this.z);
                this.positions.push(p.x);
                this.positions.push(p.y);
                this.positions.push(this.z);
                this.count++;
            }
        }

        for (let i = 0; i + this.segmentsY + 2 < this.positions.length / 3; i++) {
            const row = Math.floor(i / (this.segmentsY + 1));
            if (i % (this.segmentsY + (this.segmentsY + 1) * row) === 0 && i !== 0) {
                continue;
            }
            this.indices.push(i);
            this.indices.push(i + 1);
            this.indices.push(i + this.segmentsY + 2);

            this.indices.push(i + this.segmentsY + 2);
            this.indices.push(i + this.segmentsY + 1);
            this.indices.push(i);
        }
    }
}
