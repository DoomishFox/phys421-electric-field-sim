class Particle {
    constructor(mesh, charge) {
        this.mesh = mesh;
        this.charge = charge;
        this.isSelected = false;
    }

    get name() {
        return this.mesh.name;
    }

    get x() {
        return this.mesh.position.x;
    }

    get y() {
        return this.mesh.position.y;
    }

    get z() {
        return this.mesh.position.z;
    }
}

export default Particle;