import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import JSZip from "jszip";
import {forkJoin} from "rxjs";
import {saveAs} from "file-saver";
import {ActivatedRoute} from "@angular/router";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {SpecManagerService} from "../../domain/spec-manager.service";
import {Object3D} from "three";

@Component({
  selector: 'app-obj-view',
  templateUrl: './obj-view.component.html',
  styleUrls: ['./obj-view.component.css']
})
export class ObjViewComponent implements OnInit {

  @ViewChild('model', {static: true})
  public rendererCanvas: any;
  private canvas: any;
  private renderer: any;
  private camera: any;
  private scene: any;
  private light: any;
  private controls: any;

  private model: any;

  errorMessage = '';
  objZip = '';
  spool = '';
  docNumber = '';
  spoolIndexes: number[] = [];
  windowMode = 0;

  loading = true;

  public constructor(public route: ActivatedRoute, public issues: IssueManagerService, public s: SpecManagerService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.spool = params.spool ? params.spool : '';
      this.docNumber = params.docNumber ? params.docNumber : '';
      this.windowMode = params.window != null ? params.window : this.windowMode;
      if (this.spool == '' || this.docNumber == ''){
        this.errorMessage = 'There is no document number or spool specified';
      }

      if (this.errorMessage == ''){
        this.findModelAndLoad();
      }

    });

  }

  findModelAndLoad(){
    this.issues.getIssues('op').then(res => {
      let findDoc = res.find(x => x.doc_number == this.docNumber);
      if (findDoc == null){
        this.errorMessage = 'There is no document found via specified document number. Please contact the issuer.';
        return;
      }
      this.issues.getIssueDetails(findDoc.id).then(docDetails => {
        let findZip = docDetails.revision_files.find(x => x.group == 'Spool Models' && x.name.includes('.zip'));
        if (findZip == null){
          this.errorMessage = 'There is no model for specified document. Please contact to document responsible user';
          return;
        }
        this.objZip = findZip.url;
        if (this.spool == 'full'){
          this.loadModel();
        }
        else{
          this.s.getPipeSegs(this.docNumber).then(res => {
            this.spoolIndexes = res.filter(x => x.spool == this.spool).map(x => x.sqInSystem);
            if (this.spoolIndexes.length == 0){
              this.errorMessage = 'There is an error in FORAN model when trying to find segments of spool. Looks like specified spool doesnt exist in FORAN model';
              return;
            }
            this.loadModel();
          });
        }
        //this.loadModel();
      });
    });
  }
  loadModel(){
    const objLoader = new OBJLoader();
    this.canvas = this.rendererCanvas.nativeElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // create the scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45, window.innerWidth / window.innerHeight, 1, 100000
    );
    this.camera.position.set(0, 0, 1000);
    this.scene.add(this.camera);

    this.scene.background = new THREE.Color( 0x808080 );

    // soft white light
    this.light = new THREE.AmbientLight(0x404040);
    this.light.intensity = 3;
    this.scene.add(this.light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    this.scene.add( directionalLight );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.addEventListener( 'change', () => this.render()) ; // use if there is no animation loop
    this.controls.minDistance = 10;
    this.controls.maxDistance = 30000;

    // objLoader.load('assets/spool-test.obj', (object) => {
    // //objLoader.load('assets/test2.obj', (object) => {
    //   this.model = object;
    //   this.scene.add(this.model);
    //   this.setView(this.model);
    //   this.render();
    // }, (xhr ) => {
    //   console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    // }, (error) => {
    //   console.log(error);
    // });

    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );

    let count = 0;
    let group = new THREE.Group();
    if (this.spool == 'full'){
      fetch(this.objZip).then(response => response.blob()).then(blob => {
        JSZip.loadAsync(blob).then(res => {
          forkJoin(Object.keys(res.files).map(fileName => res.files[fileName].async('string'))).subscribe(texts => {
            let length = texts.length;
            texts.forEach(text => {
              group.add(objLoader.parse(text));
            });
            group.children.forEach(x => {
              // @ts-ignore
              //x.children[0].material = material;
              // @ts-ignore
              //x.children[0].map = 'bricks';
            });
            this.scene.add(group);
            this.setView(group);
            this.render();
            this.loading = false;
          });
        });
      });
    }
    else{
      fetch(this.objZip).then(response => response.blob()).then(blob => {
        JSZip.loadAsync(blob).then(res => {
          forkJoin(Object.keys(res.files)
            .filter(fileName => {
              let found = false;
              this.spoolIndexes.forEach(index => {
                if (fileName.includes('-' + index.toString() + '.obj')){
                  found = true;
                }
              });
              return found;
            }).map(fileName => res.files[fileName].async('string'))).subscribe(texts => {
            texts.forEach(text => {
              group.add(objLoader.parse(text));
            });
            group.children.forEach(x => {
              // @ts-ignore
              // x.children[0].material = material;
            });
            this.scene.add(group);
            this.setView(group);
            this.render();
            this.loading = false;
          });
        });
      });
    }

    this.render();
  }


  setView1(object: any) {

    const boundingBox = new THREE.Box3();

    // get bounding box of object - this will be used to setup controls and camera
    boundingBox.setFromObject( object );

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    boundingBox.getCenter(center);
    boundingBox.getSize(size);


    this.controls.target =  new THREE.Vector3(center.x, center.y, 0);
    this.controls.update();

    //this.camera.updateMatrix();
    //this.camera.updateProjectionMatrix();
  }

  setView(object: any) {

    const boundingBox = new THREE.Box3().setFromObject(object);

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    boundingBox.getCenter(center);
    boundingBox.getSize(size);


    // const radius = Math.max(size.x, size.y, size.z) * 1.1;
    //
    // const geometry = new THREE.SphereGeometry(radius / 2);
    // const material = new THREE.MeshBasicMaterial( { color: 1, wireframe: true, opacity: 0.5 } );
    // const sphere = new THREE.Mesh( geometry, material );
    // sphere.position.set(center.x, center.y, center.z);
    // this.scene.add( sphere );


    const fitOffset = 1.2;
    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * this.camera.fov / 360));
    const fitWidthDistance = fitHeightDistance / this.camera.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

    const direction = this.controls.target.clone()
      .sub(this.camera.position)
      .normalize()
      .multiplyScalar(distance);

    this.controls.maxDistance = distance * 10;
    this.controls.target.copy(center);

    this.camera.near = distance / 100;
    this.camera.far = distance * 100;
    this.camera.updateProjectionMatrix();

    this.camera.position.copy(this.controls.target).sub(direction);

    this.controls.update();


    //this.controls.target = new THREE.Vector3(center.x, center.y, center.z);
    //this.controls.update();

    //this.camera.updateMatrix();
    //this.camera.updateProjectionMatrix();
  }
  render() {
    this.renderer.render( this.scene, this.camera );
  }
}
