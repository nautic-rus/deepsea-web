import { Component, OnInit } from '@angular/core';
import parse, { DxfParser } from 'dxf-parser';
import {HttpClient} from "@angular/common/http";
import { parseDxfMTextContent } from '@dxfom/mtext';

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

@Component({
  selector: 'app-dxf-view',
  templateUrl: './dxf-view.component.html',
  styleUrls: ['./dxf-view.component.css']
})
export class DxfViewComponent implements OnInit {

  constructor(private http: HttpClient) { }

  loadingStatus = '';
  dxfViewer: DxfViewer;
  dxfContent: any;
  search = '242';

  ngOnInit(): void {
    try {
      new DxfFetcher('/assets/1234.dxf').Fetch().then((res: any) => {
        this.dxfContent = res;
        console.log(res);
        this.http.get('/assets/123.dxf', {responseType: "text"}).subscribe(res => {

          this.dxfViewer = new DxfViewer(document.getElementById('cad-view'));


          // this.dxfViewer.Subscribe('loaded', (handler: any) => {
          //   console.log(handler);
          // });
          // this.dxfViewer.Subscribe('pointerdown', (handler: any) => {
          //   console.log(handler);
          // });
          // this.dxfViewer.Subscribe('pointerup', (handler: any) => {
          //   console.log(handler);
          // });
          // this.dxfViewer.Subscribe('message', (handler: any) => {
          //   console.log(handler);
          // });
          // this.dxfViewer.Subscribe('viewChanged', (handler: any) => {
          //   console.log(handler);
          // });


          this.dxfViewer.Load({url: '/assets/1234.dxf', progressCbk: (res: any) => {console.log(res); this.loadingStatus = res.toString()}, fonts: ['assets/fonts/gost_type_au.ttf']}).then(() => {
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
    let find = this.dxfContent?.entities.find((x: any) => x.layer == 'NR-POS' && x.type == 'TEXT' && x.text.includes(this.search));

    let origin = this.dxfViewer.GetOrigin();
    let x = find.startPoint.x;
    let y = find.startPoint.y;
    x -= origin.x;
    y -= origin.y;

    this.setView({x, y}, 5000);
    this.dxfViewer.Render();
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
