import {Component, OnInit, ViewChild} from '@angular/core';
import * as THREE from "three";
import {ActivatedRoute} from "@angular/router";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {SpecManagerService} from "../../domain/spec-manager.service";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import JSZip from "jszip";
import {forkJoin} from "rxjs";
import {group} from "@angular/animations";

@Component({
  selector: 'app-obj-view-public',
  templateUrl: './obj-view-public.component.html',
  styleUrls: ['./obj-view-public.component.css']
})
export class ObjViewPublicComponent implements OnInit {

  @ViewChild('model', {static: true})
  public rendererCanvas: any;
  private canvas: any;
  private renderer: any;
  private camera: any;
  private scene: any;
  private light: any;
  private controls: any;

  private model: any;

  url = '';
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

  materialColor = '#00ff00';
  backgroundColor = '#a8c3ed';

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  public constructor(public route: ActivatedRoute, public issues: IssueManagerService, public s: SpecManagerService) {
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.url = params.url ? params.url : '';
      this.materialColor = params.mcol ? ('#' + params.mcol) : this.materialColor;
      this.backgroundColor = params.bcol ? ('#' + params.bcol) : this.backgroundColor;
      if (this.url == ''){
        this.errorMessage = 'There is no document number or spool specified';
      }
      if (this.errorMessage == ''){
        this.loadModel();
      }
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

    this.scene.background = new THREE.Color( this.backgroundColor );

    // soft white light
    // this.light = new THREE.AmbientLight(0x404040, 3);
    // this.scene.add(this.light);

    // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    // this.scene.add( directionalLight );


    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.addEventListener( 'change', () => this.render()) ; // use if there is no animation loop
    this.controls.minDistance = 10;
    this.controls.maxDistance = 30000;

    const light = new THREE.PointLight( 0xffffff, 0.6);
    this.camera.add( light );
    const material = new THREE.MeshStandardMaterial( {color: this.materialColor} );


    objLoader.load(this.url, (object) => {
      this.model = object;
      this.model.children.forEach((x: any) => {
        x.material = material;
        // @ts-ignore
        //x.children[0].map = 'bricks';
      });
      this.scene.add(this.model);
      this.setView(this.model);
      this.render();
      this.loading = false;
    }, (xhr ) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, (error) => {
      console.log(error);
    });


  }

  setView(object: any) {

    const boundingBox = new THREE.Box3().setFromObject(object);

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    boundingBox.getCenter(center);
    boundingBox.getSize(size);

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
  }
  render() {
    this.renderer.render( this.scene, this.camera );
  }

}
