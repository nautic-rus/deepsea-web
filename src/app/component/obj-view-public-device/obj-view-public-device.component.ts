import {Component, OnInit, ViewChild} from '@angular/core';
import * as THREE from "three";
import {ActivatedRoute} from "@angular/router";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {SpecManagerService} from "../../domain/spec-manager.service";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

@Component({
  selector: 'app-obj-view-public-device',
  templateUrl: './obj-view-public-device.component.html',
  styleUrls: ['./obj-view-public-device.component.css']
})
export class ObjViewPublicDeviceComponent implements OnInit {


  @ViewChild('model', {static: true})
  public rendererCanvas: any;
  private canvas: any;
  private renderer: any;
  private camera: any;
  private scene: any;
  private light: any;
  private controls: any;

  private model: any;

  hurl = '';
  eurl = '';
  surl = '';

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

  bcol = '#a8c3ed';
  hcol = '#00ff00';
  ecol = '#c55e13';
  scol = '#0077ff';

  groupsCount = 0;
  groupsAdded = 0;

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  hullVisible = true;
  equipmentVisible = true;
  structureVisible = true;

  public constructor(public route: ActivatedRoute, public issues: IssueManagerService, public s: SpecManagerService) {
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      this.hurl = params.hurl ? params.hurl : '';
      this.eurl = params.eurl ? params.eurl : '';
      this.surl = params.surl ? params.surl : '';

      this.bcol = params.bcol ? ('#' + params.bcol) : this.bcol;
      this.hcol = params.hcol ? ('#' + params.hcol) : this.hcol;
      this.ecol = params.ecol ? ('#' + params.ecol) : this.ecol;
      this.scol = params.scol ? ('#' + params.scol) : this.scol;

      if (this.hurl == '' && this.eurl == '' && this.surl == ''){
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

    this.scene.background = new THREE.Color( this.bcol );


    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.addEventListener( 'change', () => this.render()) ; // use if there is no animation loop
    this.controls.minDistance = 10;
    this.controls.maxDistance = 30000;

    const light = new THREE.PointLight( 0xffffff, 0.6);
    this.camera.add( light );

    const hm = new THREE.MeshStandardMaterial( {color: this.hcol} );
    const em = new THREE.MeshStandardMaterial( {color: this.ecol} );
    const sm = new THREE.MeshStandardMaterial( {color: this.scol} );


    let group = new THREE.Group();
    this.groupsCount = [this.hurl, this.surl, this.eurl].filter(x => x != '').length;

    if (this.hurl != ''){
      objLoader.load(this.hurl, (object) => {
        let hull = object;
        hull.children.forEach((x: any) => {
          x.material = hm;
        });
        hull.name = 'hull';
        group.add(hull);
        this.groupAdded(group);
      }, (xhr ) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, (error) => {
        console.log(error);
      });
    }
    if (this.eurl != ''){
      objLoader.load(this.eurl, (object) => {
        let equip = object;
        equip.children.forEach((x: any) => {
          x.material = em;
        });
        equip.name = 'equip';
        group.add(equip);
        this.groupAdded(group);
      }, (xhr ) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, (error) => {
        console.log(error);
      });
    }
    if (this.surl != ''){
      objLoader.load(this.surl, (object) => {
        let structure = object;
        structure.children.forEach((x: any) => {
          x.material = sm;
        });
        structure.name = 'structure';
        group.add(structure);
        this.groupAdded(group);
      }, (xhr ) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, (error) => {
        console.log(error);
      });
    }

  }

  groupAdded(group: THREE.Group){
    if (++this.groupsAdded == this.groupsCount){
      this.model = group;
      this.loading = false;
      this.scene.add(this.model);
      this.setView(this.model);
      this.render();
    }
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

  changeVisible() {
    (this.model as THREE.Group).children.forEach(ch => {
      if (ch.name == 'hull'){
        ch.visible = this.hullVisible;
      }
      if (ch.name == 'equip'){
        ch.visible = this.equipmentVisible;
      }
      if (ch.name == 'structure'){
        ch.visible = this.structureVisible;
      }
    });
    this.render();
  }
}
