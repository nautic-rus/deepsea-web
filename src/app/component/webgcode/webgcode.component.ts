import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
// @ts-ignore
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GCodeLoader} from "three/examples/jsm/loaders/GCodeLoader";


@Component({
  selector: 'app-webgcode',
  templateUrl: './webgcode.component.html',
  styleUrls: ['./webgcode.component.css']
})
export class WebgcodeComponent implements OnInit {

  constructor() { }
  camera: any;
  renderer: any;
  scene: any;

  ngOnInit(): void {
    const container = document.getElementById( 'gcode' );

    this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    this.camera.position.set( 0, 0, 100 );

    this.scene = new THREE.Scene();

    const loader = new GCodeLoader();
    //loader.load( 'assets/test/N004_U702_0_TEST.MPG', (object: any) => {
    loader.load( 'assets/test/benchy.gcode', (object: any) => {
      console.log(object);
      object.position.set( 0, 0, 0 );
      this.scene.add( object );
      this.render();
    });

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    // @ts-ignore
    container.appendChild( this.renderer.domElement );

    const controls = new OrbitControls( this.camera, this.renderer.domElement );
    controls.addEventListener( 'change', () => this.render()) ; // use if there is no animation loop
    controls.minDistance = 10;
    controls.maxDistance = 100;

    window.addEventListener( 'resize', () => this.resize() );
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.render();
  }

  render() {
    this.renderer.render( this.scene, this.camera );
  }

}
