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
  blob: any;
  spool = '';
  docNumber = '';
  spoolIndexes: number[] = [];
  windowMode = 0;
  isom = 0;

  loading = true;
  selectedSegment = '';


  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  public constructor(public route: ActivatedRoute, public issues: IssueManagerService, public s: SpecManagerService) {
  }
  onPointerMove(event: any ) {
    console.log('click');
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    this.render('click');
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.spool = params.spool ? params.spool : '';
      this.docNumber = params.docNumber ? params.docNumber : '';
      this.windowMode = params.window != null ? params.window : this.windowMode;
      this.isom = params.isom != null ? params.isom : this.isom;
      if (this.spool == '' || this.docNumber == ''){
        this.errorMessage = 'There is no document number or spool specified';
      }

      if (this.errorMessage == ''){
        this.findModelAndLoad();
      }

    });

  }
  findModelAndLoadAux(){
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
            this.spoolIndexes = res.filter(x => (this.isom == 0 ? x.spool == this.spool : x.isom == this.spool)).map(x => x.sqInSystem);
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
  findModelAndLoad(){
    if (this.spool == 'full'){
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
        });
      });
    }
    else{
      this.s.getSpoolFiles(this.docNumber, this.spool, this.isom).then(res => {
        this.blob = res;
        this.spool = 'blob';
        this.loadModel();
      });
    }
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
    if (this.spool == 'blob'){
      JSZip.loadAsync(this.blob).then(res => {
        forkJoin(Object.keys(res.files).map(fileName => res.files[fileName].async('string'))).subscribe(texts => {
          let length = texts.length;
          texts.forEach(text => {
            let object = objLoader.parse(text);
            object.name = Object.keys(res.files)[texts.indexOf(text)];
            group.add(object);
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
    }
    else if (this.spool == 'full'){
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

    //window.addEventListener( 'click', (ev) => this.onPointerMove(ev) );


    //this.controls.target = new THREE.Vector3(center.x, center.y, center.z);
    //this.controls.update();

    //this.camera.updateMatrix();
    //this.camera.updateProjectionMatrix();
  }
  render(action: string = '') {
    // update the picking ray with the camera and pointer position
    //this.raycaster.setFromCamera( this.pointer, this.camera );

    // this.scene.children.forEach((gr: any) => {
    //   if (gr.type == 'Group'){
    //     gr.children.forEach((ch: any) => {
    //       ch.children.forEach((mesh: any) => {
    //         mesh.material.color?.set( 0xffffff );
    //       });
    //     });
    //   }
    // });
    //
    // if (action == 'click'){
    //   // calculate objects intersecting the picking ray
    //   const intersects = this.raycaster.intersectObjects( this.scene.children );
    //
    //   if (intersects.length > 0){
    //     // @ts-ignore
    //     intersects[0].object.material.color.set( 0xff0000 );
    //     // @ts-ignore
    //     console.log(intersects[0].object.parent?.name.replace('.obj', ''));
    //     // @ts-ignore
    //     this.selectedSegment = intersects[0].object.parent?.name.replace('.obj', '');
    //     //console.log(intersects[0].parent.name);
    //   }
    // }


    this.renderer.render( this.scene, this.camera );
  }
}
