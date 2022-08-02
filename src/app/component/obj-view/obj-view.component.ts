import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-obj-view',
  templateUrl: './obj-view.component.html',
  styleUrls: ['./obj-view.component.css']
})
export class ObjViewComponent implements OnInit {

  constructor() { }
  camera: any;
  renderer: any;
  scene: any;
  controls: any;

  ngOnInit(): void {
    const container = document.getElementById( 'model' );

    this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    this.camera.position.set( 0, 0, 100 );

    this.scene = new THREE.Scene();

    const loader = new OBJLoader();
    loader.load( 'assets/spool-test.obj', (object: any) => {
      object.position.set( 0, 0, 0 );
      this.scene.add( object );
      this.render();
      this.fitCameraToObject(object);
      this.render();
    });

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    // @ts-ignore
    container.appendChild( this.renderer.domElement );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.addEventListener( 'change', () => this.render()) ; // use if there is no animation loop
    this.controls.minDistance = 10;
    this.controls.maxDistance = 100;

    window.addEventListener( 'resize', () => this.resize() );
  }

  resize() {
    this.camera.position =
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.render();
  }

  render() {
    this.renderer.render( this.scene, this.camera );
  }

  fitCameraToObject(object: any, offset = 1.25) {
    offset = offset || 1.25;
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(object);
    console.log(boundingBox);
    //boundingBox.getCenter(this.camera.)
    // @ts-ignore
    const center = boundingBox.getCenter();
    // @ts-ignore
    const size = boundingBox.getSize();
    // get the max side of the bounding box (fits to width OR height as needed )
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));
    cameraZ *= offset; // zoom out a little so that objects don't fill the screen
    this.camera.position.z = cameraZ;
    const minZ = boundingBox.min.z;
    const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;
    this.camera.far = cameraToFarEdge * 3;
    this.camera.updateProjectionMatrix();
    this.controls.target = center;
    // prevent camera from zooming out far enough to create far plane cutoff
    this.controls.maxDistance = cameraToFarEdge * 2;
    this.controls.saveState();
  }
}
