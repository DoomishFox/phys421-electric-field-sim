import React from 'react';
import { ArcRotateCamera, Color3, Color4, Vector3, Mesh, MeshBuilder, StandardMaterial, GizmoManager } from '@babylonjs/core';
import SceneComponent from './SceneComponent';
import './Field.css';

import Particle from './Particle';

let camera;

let particleUI;
let chargeDisplay;
let chargeSlider;

let particleMaterial;

let createNewParticleFlag = false;

let selectedParticle;
let particles = [];

let colors;
let lines;
let fieldMesh;

const onSceneReady = scene => {
    
    // ******** Scene Creation ******** //
    var size = 100

    //first set the scene background to be transparent
    scene.clearColor = new Color4(0,0,0,0);
    const canvas = scene.getEngine().getRenderingCanvas();

    var gizmoManager = new GizmoManager(scene);
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = false;
    gizmoManager.scaleGizmoEnabled = false;
    gizmoManager.boundingBoxGizmoEnabled = false;

    // ******** Create Camera ******** //

    // This creates and positions a free camera (non-mesh)
    camera = new ArcRotateCamera("camera1", -0.8, 20, size + 50, new Vector3(0, 5, -10), scene);
    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());
    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
    // set camera panning sensitivity
    camera.panningSensibility = 100;


    
    // ******** Create GUI ******** //

    var button = document.getElementById("add-button-id");
    button.addEventListener("click", addButton_Click);

    particleUI = document.getElementById("ui-dynamic");
    particleUI.style.display = "none";

    chargeDisplay = document.getElementById("dynamic-label-id");
    chargeDisplay.textContent = "0";

    chargeSlider = document.getElementById("charge-id");
    chargeSlider.addEventListener("input", chargeSliderChange);

    scene.onPointerPick = onPointerPick;
    

    // ******** Create Field Bounds ******** //
    // You dont really need to worry about how this section works, it just creates an array of
    // vectors to define the bounds cube based on the inputed size.
    let vecSize = size / 2;
    let bounds = Mesh.CreateLines("bounds", [
        new Vector3(-vecSize, -vecSize, vecSize), new Vector3(vecSize, -vecSize, vecSize),
        new Vector3(vecSize, -vecSize, -vecSize), new Vector3(vecSize, -vecSize, vecSize),
        new Vector3(vecSize, vecSize, vecSize), new Vector3(vecSize, vecSize, -vecSize),
        new Vector3(vecSize, vecSize, vecSize), new Vector3(-vecSize, vecSize, vecSize),
        new Vector3(-vecSize, vecSize, -vecSize), new Vector3(-vecSize, vecSize, vecSize),
        new Vector3(-vecSize, -vecSize, vecSize), new Vector3(-vecSize, -vecSize, -vecSize),
        new Vector3(-vecSize, -vecSize, -vecSize), new Vector3(vecSize, -vecSize, -vecSize),
        new Vector3(vecSize, vecSize, -vecSize), new Vector3(-vecSize, vecSize, -vecSize),
        new Vector3(-vecSize, -vecSize, -vecSize)
    ], scene);
    bounds.color = new Color3(0.5, 0.5, 0.5);
    bounds.isPickable = false;

    // create an Axis to be rendered with that
    // create the axis lines
    let axisSize = 10;
    var axisX = Mesh.CreateLines("axisX", [ 
        new Vector3.Zero(), new Vector3(axisSize, 0, 0), new Vector3(axisSize * 0.95, 0.05 * axisSize, 0), 
        new Vector3(axisSize, 0, 0), new Vector3(axisSize * 0.95, -0.05 * axisSize, 0)
    ], scene);
    axisX.position = new Vector3(-vecSize - 2, -vecSize - 2, -vecSize - 2);
    axisX.color = new Color3(1, 0, 0);
    axisX.isPickable = false;
    var axisY = Mesh.CreateLines("axisY", [
        new Vector3.Zero(), new Vector3(0, axisSize, 0), new Vector3( -0.05 * axisSize, axisSize * 0.95, 0), 
        new Vector3(0, axisSize, 0), new Vector3( 0.05 * axisSize, axisSize * 0.95, 0)
    ], scene);
    axisY.position = new Vector3(-vecSize - 2, -vecSize - 2, -vecSize - 2);
    axisY.color = new Color3(0, 1, 0);
    axisY.isPickable = false;
    var axisZ = Mesh.CreateLines("axisZ", [
        new Vector3.Zero(), new Vector3(0, 0, axisSize), new Vector3( 0 , -0.05 * axisSize, axisSize * 0.95),
        new Vector3(0, 0, axisSize), new Vector3( 0, 0.05 * axisSize, axisSize * 0.95)
    ], scene);
    axisZ.position = new Vector3(-vecSize - 2, -vecSize - 2, -vecSize - 2);
    axisZ.color = new Color3(0, 0, 1);
    axisZ.isPickable = false;

    // ******** Create Field Lines ******** //

    lines = createFieldLines(100, 10);
    colors = createFieldColors(100, 10);

    //let colors = array of colors
    //let lines = 2 dimensional array of points
    fieldMesh = MeshBuilder.CreateLineSystem("fieldLines",
        { colors: colors, lines: lines, updatable: true }, scene)
    fieldMesh.isPickable = false;

    //fieldMesh.color = new Color3(1,0,0);

    // ******** Create First Particle ******** //

    // create material for particle mesh
    particleMaterial = new StandardMaterial("shadelessMat", scene);
    particleMaterial.emissiveColor = new Color3(1,1,1);

    particles.push(createParticle(scene, 1));
}

/**
 * Will run on every frame render. Simulation would be triggered here
 */
const onRender = scene => {
    // first check to see if we need to create a new particle. this is a
    // little ugly but the meshes need a reference to the scene and this
    // seems like the best place to get that
    if (createNewParticleFlag)
    {
        particles.push(createParticle(scene, -1));
        createNewParticleFlag = false;
    }

    // set the charge position to be the same as the mesh representation
    // charge1Position = [particleMesh.position.x, particleMesh.position.y, particleMesh.position.z];

    // update the lines array with new values based on electric field equations
    // calculateOnePointFieldLines(lines, charge1, charge1Position, 100, 10);
    calculateMultiPointFieldLines(lines, colors, particles, 100, 10);

    // pass this in with an instance of the lines mesh to update
    fieldMesh = MeshBuilder.CreateLineSystem("fieldLines",
        { colors: colors, lines: lines, instance: fieldMesh }, scene)
  }

function FieldRenderer() {
    return (
        <div className="field-container">
            <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} className='field-canvas' />
        </div>
    );
}

export default FieldRenderer;

// ******** Runtime Functions ******** //

var onPointerPick = function(pointerEvent, pickInfo) {
    console.log("Picked " + pickInfo.pickedMesh.name);

    // show the particle UI
    particleUI.style.display = "block";

    // lets get our particle object based on the mesh name
    selectedParticle = particles.filter( (particle) => particle.name == pickInfo.pickedMesh.name)[0];

    //console.log(selectedParticle);

    chargeDisplay.textContent = selectedParticle.charge;
    chargeSlider.value = selectedParticle.charge;
}

var createParticle = function(scene, charge) {
    // create particle object itself
    let particleName = "particle" + particles.length;
    let particleMesh = MeshBuilder.CreateSphere(particleName, {diameter: 2}, scene, true);
    particleMesh.material = particleMaterial;
    particleMesh.isPickable = true;
    
    return new Particle(particleMesh, charge);
}

// ******** Event Handlers ******** //

var addButton_Click = function() {
    createNewParticleFlag = true;
}

var chargeSliderChange = function() {
    selectedParticle.charge = chargeSlider.value;
    chargeDisplay.textContent = chargeSlider.value;
}

// ******** Field Line Functions ******** //

const fieldLineArrowHeight = 0.1
// create the points array because im sure as heck not gonna do that by hand
var createFieldLines = function(size, count) {
    let lineLength = 2;
    // ok so we need to create count^3, but lets do this logically
    // lets start with across the X axis
    let xArray = [];

    for (let ypos = 0; ypos < count; ypos++) {

        let currentYPoint = (ypos * (size / count)) + ((size / count) / 2) -(size / 2);

        for (let zpos = 0; zpos < count; zpos++) {

            let currentZPoint = (zpos * (size / count)) + ((size / count) / 2) -(size / 2);

            for (let xpos = 0; xpos < count; xpos++) {

                let currentXPoint = (xpos * (size / count)) + ((size / count) / 2) - (size / 2);

                let xPoint = [new Vector3(currentXPoint - (lineLength / 2), currentYPoint - (lineLength / 2), currentZPoint - (lineLength / 2)),
                            new Vector3(currentXPoint, currentYPoint, currentZPoint),
                            new Vector3(currentXPoint + (lineLength / 2), currentYPoint + (lineLength / 2), currentZPoint + (lineLength / 2)),
                        ];

                let pointer = (ypos * count * count) + (zpos * count) + xpos;
                xArray[pointer] = xPoint;
            }
        }
    }
    return xArray;
}

var createFieldColors = function(size, count) {
    // ok so we need to create count^3, but lets do this logically
    // lets start with across the X axis
    let xArray = [];

    for (let ypos = 0; ypos < count; ypos++) {
        
        //var currentYPoint = (ypos * (size / count)) + ((size / count) / 2) -(size / 2);

        for (let zpos = 0; zpos < count; zpos++) {

            //var currentZPoint = (zpos * (size / count)) + ((size / count) / 2) -(size / 2);

            for (let xpos = 0; xpos < count; xpos++) {

                //var currentXPoint = (xpos * (size / count)) + ((size / count) / 2) - (size / 2);

                let xPoint = [new Color4(0,0.5,1,1), new Color4(0,0.5,1,1), new Color4(1,1,1,1)];

                let pointer = (ypos * count * count) + (zpos * count) + xpos;
                xArray[pointer] = xPoint;
            }
        }
    }
    return xArray;
}

// this isnt used anymore but its still in here as a bit of a reference
var calculateOnePointFieldLines = function (xArray, charge1, charge1pos, size, count) {
    const lineLength = 10000000;
    const maxLineLength = 4;
    // ok so we need to create count^3, but lets do this logically
    // lets start with across the X axis

    for (let ypos = 0; ypos < count; ypos++) {

        let currentYPoint = (ypos * (size / count)) + ((size / count) / 2) -(size / 2);

        for (let zpos = 0; zpos < count; zpos++) {

            let currentZPoint = (zpos * (size / count)) + ((size / count) / 2) -(size / 2);

            for (let xpos = 0; xpos < count; xpos++) {

                let currentXPoint = (xpos * (size / count)) + ((size / count) / 2) - (size / 2);

                // first lets get x_1, y_1, and z_1
                let x_1 = currentXPoint - charge1pos[0];
                let y_1 = currentYPoint - charge1pos[1];
                let z_1 = currentZPoint - charge1pos[2];
                // next lets calculate r_1_squared
                let r_1_squared = (x_1 * x_1) + (y_1 * y_1) + (z_1 * z_1);
                // now lets calculate r_1_inverse
                // r_1_inverse is 1 / sqrt(r_squared) for which we will use the black magic of Q_rsqrt()
                let r_1_inverse = Q_rsqrt(r_1_squared);
                //let r_1_inverse = 1 / Math.sqrt(r_1_squared);
                // thats everything we need for calculating the field lines from charge 1!
                let E = getFieldVector(x_1, y_1, z_1, charge1, r_1_squared, r_1_inverse);
                // now lets scale E_1 with our linelength
                E[0] = E[0] / lineLength;
                E[1] = E[1] / lineLength;
                E[2] = E[2] / lineLength;
                // lastly we need to divide E_1 by half to center the drawn line
                E[0] = E[0] / 2;
                E[1] = E[1] / 2;
                E[2] = E[2] / 2;

                // now we have vector components of both fields!
                // lets sum them together in our array
                let pointer = (ypos * count * count) + (zpos * count) + xpos;
                let xPoint = xArray[pointer];

                xPoint[0].x = currentXPoint - E[0];
                xPoint[0].y = currentYPoint - E[1];
                xPoint[0].z = currentZPoint - E[2];
                xPoint[2].x = currentXPoint + E[0];
                xPoint[2].y = currentYPoint + E[1];
                xPoint[2].z = currentZPoint + E[2];
            }
        }
    }
}

var calculateMultiPointFieldLines = function (xArray, cArray, particles, size, count) {
    const lineLength = 10000000;
    const maxLineLength = 4;
    // ok so we need to create count^3, but lets do this logically
    // lets start with across the X axis

    for (let ypos = 0; ypos < count; ypos++) {

        let currentYPoint = (ypos * (size / count)) + ((size / count) / 2) -(size / 2);

        for (let zpos = 0; zpos < count; zpos++) {

            let currentZPoint = (zpos * (size / count)) + ((size / count) / 2) -(size / 2);

            for (let xpos = 0; xpos < count; xpos++) {

                let currentXPoint = (xpos * (size / count)) + ((size / count) / 2) - (size / 2);

                // this is our total electric field
                let E = [0, 0, 0];
                // so lets add the field from all particles in view to it
                for (let i = 0; i < particles.length; i++)
                {
                    // first lets get x_1, y_1, and z_1
                    let x_1 = currentXPoint - particles[i].x;
                    let y_1 = currentYPoint - particles[i].y;
                    let z_1 = currentZPoint - particles[i].z;
                    // next lets calculate r_1_squared
                    let r_1_squared = (x_1 * x_1) + (y_1 * y_1) + (z_1 * z_1);
                    // now lets calculate r_1_inverse
                    // r_1_inverse is 1 / sqrt(r_squared) for which we will use the black magic of Q_rsqrt()
                    let r_1_inverse = Q_rsqrt(r_1_squared);
                    // thats everything we need for calculating the field lines from charge 1!
                    let E_1 = getFieldVector(x_1, y_1, z_1, particles[i].charge, r_1_squared, r_1_inverse);
                    // now lets scale E_1 with our linelength
                    E_1[0] = E_1[0] / lineLength;
                    E_1[1] = E_1[1] / lineLength;
                    E_1[2] = E_1[2] / lineLength;
                    // lastly we need to divide E_1 by half to center the drawn line
                    E_1[0] = E_1[0] / 2;
                    E_1[1] = E_1[1] / 2;
                    E_1[2] = E_1[2] / 2;

                    // now we can combine the vectors into one so we can do that just once
                    E[0] += E_1[0];
                    E[1] += E_1[1];
                    E[2] += E_1[2];
                }

                // now we have vector components of both fields!
                // lets sum them together in our array
                let pointer = (ypos * count * count) + (zpos * count) + xpos;
                let xPoint = xArray[pointer];

                xPoint[0].x = currentXPoint - E[0];
                xPoint[0].y = currentYPoint - E[1];
                xPoint[0].z = currentZPoint - E[2];
                xPoint[2].x = currentXPoint + E[0];
                xPoint[2].y = currentYPoint + E[1];
                xPoint[2].z = currentZPoint + E[2];

                
                // lets also edit the colors while we're here
                // first lets get x_m, y_m, and z_m
                let x_m = E[0];
                let y_m = E[1];
                let z_m = E[2];
                // next lets calculate r_m_squared
                let r_m_squared = (x_m * x_m) + (y_m * y_m) + (z_m * z_m);
                // now lets calculate r_m_inverse is 1 / sqrt(r_m_squared)
                let r_m_inverse = Q_rsqrt(r_m_squared);
                // using that lets get the final magnitude of the vector
                let E_m = r_m_squared * r_m_inverse;
                // then we clamp that vector between 0.1 and 1 so we can
                // use it for opacity
                let opacity = clamp(E_m, 0.1, 1);

                let cPoint = cArray[pointer];

                cPoint[0].a = opacity;
                cPoint[1].a = opacity;
                cPoint[2].a = opacity;
            }
        }
    }
}

// So this was taken from someone much smarter than I on stackoverflow that
// implemented the fast inverse square root method used in quake iii.
// it is absolutely disgusting and abuses computers in ways I never thought
// possible before. I love it.
// The inline comments from the original programmer and the quake iii source
// has been preserved because there is no better way to describe what is
// happening here.
const bytes = new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT);
const floatView = new Float32Array(bytes);
const intView = new Uint32Array(bytes);
const threehalfs = 1.5;
function Q_rsqrt(number) {
    const x2 = number * 0.5;
    floatView[0] = number;                              // evil floating point bit level hacking
    intView[0] = 0x5f3759df - ( intView[0] >> 1 );      // What the fuck?
    let y = floatView[0];
    y = y * ( threehalfs - ( x2 * y * y ) );            // 1st iteration
//	y  = y * ( threehalfs - ( x2 * y * y ) );           // 2nd iteration, this can be removed
    return y;
}

// I managed to condense the equation for the components of an electric
// field down to these. No trig, the only tricky but is a square root
// but because its divided by that we can use the fast inverse square root
// method and just multiply instead!
const k = 8987742438;
function getFieldVector(x_0, y_0, z_0, Q, r_squared, r_inverse) {
    let E_y = (k) * (y_0 * Q * r_inverse) / (r_squared);
    let E_z = (k) * (z_0 * Q * r_inverse) / (r_squared);
    let E_x = (k) * (x_0 * Q * r_inverse) / (r_squared);
    return [E_x, E_y, E_z];
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}