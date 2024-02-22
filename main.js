import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import * as GEO from "./geometry";

const SCENE = new THREE.Scene();

const CAMERA = new THREE.PerspectiveCamera(
    75, // FOV
    window.innerWidth / window.innerHeight, // Aspect Ratio
    0.1, // NEAR
    1000 // FAR
);
CAMERA.position.set(0, -20, 20);
CAMERA.lookAt(0, 0, 0);

//SET UP THE RENDERER
const RENDERER = new THREE.WebGL1Renderer();
RENDERER.setSize(window.innerWidth, window.innerHeight);
RENDERER.setClearColor(0xe8f5f3);

document.body.appendChild(RENDERER.domElement);

//ORBIT CONTROLS
const CONTROLS = new OrbitControls(CAMERA, RENDERER.domElement);
CONTROLS.update();

/*
class SplineG extends GEO.Spline3D {
    handles = [];
    constructor(points, interpolation) {
        super(points, interpolation);
        this.#genHandles();
    }

    #genHandles() {
        this.handles = [];
        const handleMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        this.points.forEach((point) => {
            const handleLine = point.handleLine();
            if (handleLine.length < 2) {
                return;
            }
            let drawableLine = [];

            handleLine.forEach((pos) => {
                drawableLine.push(new THREE.Vector3(pos.x, pos.y, pos.z));
            });

            const geometry = new THREE.BufferGeometry().setFromPoints(drawableLine);

            const line = new THREE.Line(geometry, handleMaterial);
            const positionAttribute = line.geometry.getAttribute("position");
            positionAttribute.needsUpdate = true;

            this.handles.push(line);
        });
    }

    connectedLine() {
        const connectedMaterial = new THREE.LineBasicMaterial({
            color: 0x0000ff,
        });
        const linePoints = [];
        this.points.forEach((point) => {
            linePoints.push(new THREE.Vector3(point.x, point.y, point.z));
        });

        const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);

        const line = new THREE.Line(geometry, connectedMaterial);
        const positionAttribute = line.geometry.getAttribute("position");
        positionAttribute.needsUpdate = true;

        return line;
    }

    drawableSplineLine() {
        const connectedMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000,
        });
        const linePoints = [];
        this.splineLine.forEach((point) => {
            linePoints.push(new THREE.Vector3(point.x, point.y, point.z));
        });

        const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);

        const line = new THREE.Line(geometry, connectedMaterial);
        const positionAttribute = line.geometry.getAttribute("position");
        positionAttribute.needsUpdate = true;

        return line;
    }
}

class SplineExtrudedG extends GEO.SplineExtruded3D {
    mesh = null;
    lineMesh = null;
    constructor(splinesuface3d) {
        super(splinesuface3d.points, splinesuface3d.indices);
        this.#genMesh();
        this.#genLineMesh();
    }

    #genMesh() {
        const geometry = new THREE.BufferGeometry();

        const vertex = new Float32Array([...this.points]);
        geometry.setIndex(this.indices);
        geometry.setAttribute("position", new THREE.BufferAttribute(vertex, 3));

        const material = new THREE.MeshBasicMaterial({ color: 0x28f57f, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(geometry, material);
    }

    #genLineMesh() {
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xc10909,
        });
        const linePoints = [];

        this.indices.forEach((pos, idx) => {
            linePoints.push(
                new THREE.Vector3(
                    this.points[pos * 3],
                    this.points[pos * 3 + 1],
                    this.points[pos * 3 + 2]
                )
            );
            if (idx % 6 == 0) {
                linePoints.push(
                    new THREE.Vector3(
                        this.points[(pos + 3) * 3],
                        this.points[(pos + 3) * 3 + 1],
                        this.points[(pos + 3) * 3 + 2]
                    )
                );
            }
        });

        const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);

        const line = new THREE.Line(geometry, lineMaterial);
        const positionAttribute = line.geometry.getAttribute("position");
        positionAttribute.needsUpdate = true;

        this.lineMesh = line;
    }
}

// SET UP THE SCENE

const s1 = new SplineG(
    [
        new GEO.SplinePoint3D(5, 0, 0),
        new GEO.SplinePoint3D(0, 5, 0),
        new GEO.SplinePoint3D(-5, 0, 0),
        new GEO.SplinePoint3D(0, -5, 0),
        new GEO.SplinePoint3D(5, 0, 0),
    ],
    10
);

SCENE.add(s1.drawableSplineLine());

const sf1 = new SplineExtrudedG(s1.extrude(new GEO.Vector3D(new GEO.Point3D(0, 0, 5))));

SCENE.add(sf1.mesh);
SCENE.add(sf1.lineMesh);
*/

class GridG extends GEO.Grid3D {
    mesh = null;

    constructor(segmentsX, segmentsY, sizeX, sizeY, z = 0) {
        super(segmentsX, segmentsY, sizeX, sizeY, z);
        this.#genMesh();
    }

    #genMesh() {
        const geometry = new THREE.BufferGeometry();

        const vertex = new Float32Array([...this.positions]);
        geometry.setIndex(this.indices);
        geometry.setAttribute("position", new THREE.BufferAttribute(vertex, 3));

        const material = new THREE.MeshBasicMaterial({
            color: 0x049ef4,
            side: THREE.DoubleSide,
            wireframe: true,
            wireframeLinewidth: 10,
            transparent: true,
            opacity: 0.5,
        });

        this.mesh = new THREE.Mesh(geometry, material);
    }

    getPoint(idx) {
        const positionAttribute = this.mesh.geometry.getAttribute("position");
        const prev = new THREE.Vector3();
        prev.fromBufferAttribute(positionAttribute, idx);

        return { x: prev.x, y: prev.y, z: prev.z };
    }

    movePoint(idx, point) {
        const positionAttribute = this.mesh.geometry.getAttribute("position");

        const prev = new THREE.Vector3();

        prev.fromBufferAttribute(positionAttribute, idx);

        positionAttribute.setXYZ(idx, point.x || prev.x, point.y || prev.y, point.z || prev.z);
        positionAttribute.needsUpdate = true;
        positionAttribute.setUsage(THREE.DynamicDrawUsage);

        return prev.fromBufferAttribute(positionAttribute, idx);
    }

    movePointX(idx, posX) {
        const positionAttribute = this.mesh.geometry.getAttribute("position");
        const prev = new THREE.Vector3();
        prev.fromBufferAttribute(positionAttribute, idx);
        positionAttribute.setXYZ(idx, posX, prev.y, prev.z);
        positionAttribute.needsUpdate = true;
        positionAttribute.setUsage(THREE.DynamicDrawUsage);

        return prev.fromBufferAttribute(positionAttribute, idx);
    }

    movePointY(idx, posY) {
        const positionAttribute = this.mesh.geometry.getAttribute("position");
        const prev = new THREE.Vector3();
        prev.fromBufferAttribute(positionAttribute, idx);
        positionAttribute.setXYZ(idx, prev.x, posY, prev.z);
        positionAttribute.needsUpdate = true;
        positionAttribute.setUsage(THREE.DynamicDrawUsage);

        return prev.fromBufferAttribute(positionAttribute, idx);
    }

    movePointZ(idx, posZ) {
        const positionAttribute = this.mesh.geometry.getAttribute("position");
        const prev = new THREE.Vector3();
        prev.fromBufferAttribute(positionAttribute, idx);
        positionAttribute.setXYZ(idx, prev.x, prev.y, posZ);
        positionAttribute.needsUpdate = true;
        positionAttribute.setUsage(THREE.DynamicDrawUsage);

        return prev.fromBufferAttribute(positionAttribute, idx);
    }
}

class SplineSurfaceG extends GridG {
    controlPoints = [];
    controlPointsShperes = [];

    constructor(sizeX, sizeY, controlPointsX = 3, controlPointsY = 3, interpolation = 2) {
        if (controlPointsX < 3 || controlPointsY < 3)
            throw new Error("there should be at least 3 control points for each axis");

        if (interpolation < 1) throw new Error("interpolation should be at least 1");

        const sx = controlPointsX - 1;
        const sy = controlPointsY - 1;
        const segmentsX = interpolation * sx + sx;
        const segmentsY = interpolation * sy + sy;

        super(segmentsX, segmentsY, sizeX, sizeY, 0);

        this.interpolation = interpolation;
        this.cpx = controlPointsX;
        this.cpy = controlPointsY;
        this.#setControlPoints();
    }

    selectPointSphere(idx) {
        this.controlPointsShperes.forEach((s, sIdx) => {
            if (idx == sIdx) {
                s.material.color.setHex(0x00ff00);
            } else {
                s.material.color.setHex(0xff0000);
            }
        });
    }

    #setControlPoints() {
        for (let x = 0; x <= this.segmentsX; x += this.interpolation + 1) {
            const row = x * (this.segmentsY + 1);
            for (let y = 0; y <= this.segmentsY; y += this.interpolation + 1) {
                this.controlPoints.push(y + row);
            }
        }

        this.#setControlPointsSpheres();
    }

    #setControlPointsSpheres() {
        this.controlPoints.forEach((cp) => {
            const geometry = new THREE.SphereGeometry(0.3, 16, 16);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const sphere = new THREE.Mesh(geometry, material);

            const cpPos = this.getPoint(cp);
            sphere.position.x = cpPos.x;
            sphere.position.y = cpPos.y;
            sphere.position.z = cpPos.z;

            this.controlPointsShperes.push(sphere);
        });
    }

    addSpheresToScene(scene) {
        this.controlPointsShperes.forEach((s) => {
            scene.add(s);
        });
    }

    calculateMesh() {
        //Vertical Splines
        for (let i = 0; i < this.cpx; i++) {
            const row = i * this.cpy;
            const sPoints = [];
            for (let j = 0; j < this.cpy; j++) {
                sPoints.push(this.getPoint(this.controlPoints[j + row]));
            }

            const spline = new GEO.Spline3D(
                sPoints.map((p) => new GEO.Point3D(p.x, p.y, p.z)),
                this.interpolation
            );

            const realRow = i * ((this.interpolation + 1) * (this.segmentsY + 1));
            for (let j = 0; j < spline.splineLine.length; j++) {
                this.movePoint(j + realRow, spline.splineLine[j]);
            }
        }
        //horizontal Splines
        for (let i = 0; i < this.cpy; i++) {
            const col = i;
            const sPoints = [];
            for (let j = 0; j < this.cpx; j++) {
                sPoints.push(this.getPoint(this.controlPoints[col + j * this.cpy]));
            }

            const spline = new GEO.Spline3D(
                sPoints.map((p) => new GEO.Point3D(p.x, p.y, p.z)),
                this.interpolation
            );

            const realCol = i * (this.interpolation + 1);
            for (let j = 0; j < spline.splineLine.length; j++) {
                const pointIdx = realCol + j * (this.segmentsY + 1);

                this.movePoint(pointIdx, spline.splineLine[j]);
            }
        }

        //interpolated

        for (let i = 0; i < this.cpy - 1; i++) {
            const cp = this.controlPoints[i];
            for (let j = 1; j <= this.interpolation; j++) {
                const startPointIdx = cp + j;
                const sPoints = [];

                for (let h = 0; h < this.cpx; h++) {
                    const pointIdx =
                        startPointIdx + h * (this.interpolation + 1) * (this.segmentsY + 1);
                    sPoints.push(this.getPoint(pointIdx));
                }

                const spline = new GEO.Spline3D(
                    sPoints.map((p) => new GEO.Point3D(p.x, p.y, p.z)),
                    this.interpolation
                );

                for (let h = 0; h < spline.splineLine.length; h++) {
                    const pointIdx = startPointIdx + h * (this.segmentsY + 1);
                    this.movePoint(pointIdx, spline.splineLine[h]);
                }
            }
        }

        this.controlPoints.forEach((p, idx) => {
            this.moveControlPoint(idx, this.getPoint(this.controlPoints[idx]));
        });
    }

    moveControlPoint(idx, point) {
        this.controlPointsShperes[idx].position.x = point.x;
        this.controlPointsShperes[idx].position.y = point.y;
        this.controlPointsShperes[idx].position.z = point.z;

        this.movePoint(this.controlPoints[idx], point);
    }

    moveControlPointX(idx, posX) {
        this.controlPointsShperes[idx].position.x = posX;
        this.movePointX(this.controlPoints[idx], posX);
    }

    moveControlPointY(idx, posY) {
        this.controlPointsShperes[idx].position.y = posY;
        this.movePointY(this.controlPoints[idx], posY);
    }

    moveControlPointZ(idx, posZ) {
        this.controlPointsShperes[idx].position.z = posZ;
        this.movePointZ(this.controlPoints[idx], posZ);

        this.calculateMesh();
    }
}

let g1 = undefined;

const zSlider = document.getElementById("z-slider");
const pSelector = document.getElementById("point-selector");

let zSliderValue = 0;
zSlider.oninput = () => {
    zSliderValue = zSlider.value;
};

function changeOnSelector() {
    g1.selectPointSphere(pSelector.value);
    const posz = g1.getPoint(g1.controlPoints[pSelector.value]).z;
    zSlider.value = posz;
    zSliderValue = posz;
}

pSelector.addEventListener("change", changeOnSelector);

const meshGenerator = document.getElementById("genMesh-btn");
meshGenerator.addEventListener("click", (e) => {
    const meshForm = document.querySelector("div.gen-mesh-form");
    const meshFormContent = document.querySelector("div.gen-mesh-form-content");

    meshForm.classList.add("disappear");
    meshFormContent.classList.add("moveOut-Down");

    setTimeout(() => {
        meshForm.remove();
    }, 1000);

    const cpx = parseInt(cpxField.innerText);
    const cpy = parseInt(cpyField.innerText);
    const ip = parseInt(ipField.innerText);

    g1 = new SplineSurfaceG(20, 20, cpx, cpy, ip);

    SCENE.add(g1.mesh);
    g1.addSpheresToScene(SCENE);
    g1.calculateMesh();

    for (let i = 0; i < cpx * cpy; i++) {
        const opt = new Option(`Point ${i + 1}`, i);

        pSelector.add(opt, undefined);
    }

    g1.selectPointSphere(0);
    document.querySelector("div.toolbox").classList.add("moveIn-Right");

    window.addEventListener("keydown", (evt) => {
        let currentPoint = parseInt(pSelector.value);
        if (evt.key === "ArrowLeft") {
            currentPoint -= 1;
            if (currentPoint < 0) {
                currentPoint += cpx * cpy;
            }
            pSelector.value = currentPoint;

            changeOnSelector();
        } else if (evt.key === "ArrowRight") {
            currentPoint += 1;
            if (currentPoint >= cpx * cpy) {
                currentPoint = 0;
            }
            pSelector.value = currentPoint;

            changeOnSelector();
        } else if (evt.key === "ArrowUp") {
            zSliderValue += 1;
            if (zSliderValue > 10) zSliderValue = 10;
        } else if (evt.key === "ArrowDown") {
            zSliderValue -= 1;
            if (zSliderValue < -10) zSliderValue = -10;
        }
    });
});

const colorSelector = document.getElementById("color-picker");
colorSelector.oninput = () => {
    const hex = colorSelector.value.slice(1);
    g1.mesh.material.color.setHex(parseInt(hex, 16));
};

const wireframeEnabled = document.getElementById("wireframe-cb");
wireframeEnabled.addEventListener("change", (evt) => {
    g1.mesh.material.wireframe = wireframeEnabled.checked;
});

//RENDERING
function animate() {
    requestAnimationFrame(animate);
    //cube.rotation.x += 0.01;
    //cube.rotation.y += 0.01;
    CONTROLS.update();
    if (g1 === undefined) return;
    g1.moveControlPointZ(pSelector.value, zSliderValue);

    RENDERER.render(SCENE, CAMERA);
}

//CHECKING FOR WEBGL COMPATIBILITY
if (WebGL.isWebGLAvailable()) {
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById("container").appendChild(warning);
}
