import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";

// @ts-ignore
import { OrbitControls } from 'node_modules/dxf-viewer/src/OrbitControls.js';
// @ts-ignore
import { DxfFetcher } from 'node_modules/dxf-viewer/src/DxfFetcher.js';
// @ts-ignore
import { DxfViewer } from 'node_modules/dxf-viewer/src/DxfViewer.js';
// @ts-ignore
import * as three from "node_modules/three/build/three.js"
// @ts-ignore
import DxfViewerWorker from "node_modules/dxf-viewer/src/DxfViewerWorker"
// @ts-ignore
import * as ThreeDxf from 'node_modules/three-dxf/dist/three-dxf.js';
// @ts-ignore
import {FontLoader} from 'node_modules/three/examples/jsm/loaders/FontLoader.js';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-dxf-view',
  templateUrl: './dxf-view.component.html',
  styleUrls: ['./dxf-view.component.css']
})
export class DxfViewComponent implements OnInit {

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

  loadingStatus = '';
  dxfViewer: DxfViewer;
  dxfContent: any;
  search = '242';
  dxfUrl = '/assets/123.dxf';
  fontUrl = 'assets/fonts/gost_type_au.ttf';
  windowMode = 0;

  ngOnInit(): void {
    window.addEventListener('message', (event) => {
      this.search = this.trimLeftZeros(event.data.PART_CODE) + event.data.SYMMETRY;
      this.move();
    });
    this.route.queryParams.subscribe(params => {
      this.dxfUrl = params.dxf != null ? params.dxf : this.dxfUrl;
      this.windowMode = params.window != null ? params.window : this.windowMode;
      let search = params.search != null ? params.search : '';
      if (search != '' && this.loadingStatus == 'loaded'){
        this.search = search;
        this.move();
      }
      if (this.loadingStatus != 'loaded'){
        this.fetchDxf();
      }
    });
  }

  trimLeftZeros(input: string){
    let result = input;
    while (result[0] == '0' && result.length > 0){
      result = result.substr(1);
    }
    return result;
  }
  fetchDxf(){
    try {
      new DxfFetcher(this.dxfUrl).Fetch().then((res: any) => {
        this.dxfContent = res;
        this.http.get(this.dxfUrl, {responseType: "text"}).subscribe(res => {
          let options = Object.create(DxfViewer.DefaultOptions);
          options.autoResize = true;
          this.dxfViewer = new DxfViewer(document.getElementById('cad-view'), options);
          this.dxfViewer.Load({url: this.dxfUrl, progressCbk: (res: any) => {console.log(res); this.loadingStatus = res.toString()}, fonts: [this.fontUrl]}).then(() => {
            this.loadingStatus = 'loaded';
          });
          this.dxfViewer.SetSize(1080, 720);
        });
      });
    }catch(err) {
      return console.error(err.stack);
    }
  }
  move() {
    let find = this.dxfContent?.entities.find((x: any) => x.layer == 'NR-POS' && x.type == 'TEXT' && x.text == this.search);
    if (find != null){
      let origin = this.dxfViewer.GetOrigin();
      let x = find.startPoint.x;
      let y = find.startPoint.y;
      x -= origin.x;
      y -= origin.y;

      this.setView({x, y}, 5000);
      this.dxfViewer.Render();
    }
  }
  setView(center: any, width: any) {
    const aspect = this.dxfViewer.GetCanvas().clientWidth / this.dxfViewer.GetCanvas().clientHeight;
    const height = width / aspect;
    this.dxfViewer.camera.left = -width / 2;
    this.dxfViewer.camera.right = width / 2;
    this.dxfViewer.camera.top = height / 2;
    this.dxfViewer.camera.bottom = -height / 2;
    this.dxfViewer.camera.zoom = 1;
    this.dxfViewer.camera.position.x = center.x;
    this.dxfViewer.camera.position.y = center.y;
    this.dxfViewer.camera.position.z = 1;

    this.dxfViewer.controls.target =  new three.Vector3(center.x, center.y, 0);
    this.dxfViewer.controls.update();

    this.dxfViewer.camera.updateMatrix();
    this.dxfViewer.camera.updateProjectionMatrix();
  }
  // setView(center: any, width: any) {
  //   const aspect = this.dxfViewer.GetCanvas().clientWidth / this.dxfViewer.GetCanvas().clientHeight;
  //   const height = width / aspect;
  //   this.dxfViewer.camera = new three.OrthographicCamera(-1, 1, 1, -1, 0.1, 2);
  //   this.dxfViewer.camera.left = -width / 2;
  //   this.dxfViewer.camera.right = width / 2;
  //   this.dxfViewer.camera.top = height / 2;
  //   this.dxfViewer.camera.bottom = -height / 2;
  //   this.dxfViewer.camera.zoom = 1;
  //   this.dxfViewer.camera.position.x = center.x;
  //   this.dxfViewer.camera.position.y = center.y;
  //   this.dxfViewer.camera.position.z = 1;
  //   this.dxfViewer.camera.updateMatrix();
  //   this.dxfViewer.camera.updateProjectionMatrix();
  //   this.dxfViewer._CreateControls();
  //   this.dxfViewer._Emit("viewChanged");
  // }

}
