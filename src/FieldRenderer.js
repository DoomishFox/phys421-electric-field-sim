import React from 'react';
import { ArcRotateCamera, Color3, Color4, Vector3, Mesh, MeshBuilder, StandardMaterial, PointerEventTypes, GizmoManager } from '@babylonjs/core';
import SceneComponent from './SceneComponent';
import './Field.css';

let particleMesh;

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
    var camera = new ArcRotateCamera("camera1", -0.8, 20, size + 20, new Vector3(0, 5, -10), scene);
    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());
    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
    // set camera panning sensitivity
    camera.panningSensibility = 100;

    

    // ******** Create Field Bounds ******** //
    // You dont really need to worry about how this section works, it just creates an array of
    // vectors to define the bounds cube based on the inputed size.
    var vecSize = size / 2;
    var bounds = Mesh.CreateLines("bounds", [
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
    var axisSize = 10;
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

    // ******** Create First Particle ******** //

    // create material for particle mesh
    var shadelessMat = new StandardMaterial("shadelessMat", scene);
    shadelessMat.emissiveColor = new Color3(1,1,1);

    // create particle object itself
    //var particle = Mesh.CreateSphere('particle', 32, 2, scene);
    particleMesh = MeshBuilder.CreateSphere('particleBox', {diameter: 2}, scene, true);
    particleMesh.material = shadelessMat;
    particleMesh.isPickable = true;
}

/**
 * Will run on every frame render. Simulation would be triggered here
 */
const onRender = scene => {
    
  }

function FieldRenderer() {
    return (
        <div className="field-container">
            <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} className='field-canvas' />
        </div>
    );
}

export default FieldRenderer;
