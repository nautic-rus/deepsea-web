import {Component, OnInit, ViewChild} from '@angular/core';
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
import {getTsHelperFnFromIdentifier} from "@angular/compiler-cli/ngcc/src/utils";
import {Subscription} from "rxjs";
// @ts-ignore
import * as Hammer from 'node_modules/hammerjs/hammer.js';
import {HttpClient} from "@angular/common/http";
import {PdfViewerComponent} from "ng2-pdf-viewer";
import {NgxExtendedPdfViewerService, pdfDefaultOptions} from 'ngx-extended-pdf-viewer';


@Component({
  selector: 'app-pdf-view',
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.css']
})
export class PdfViewComponent implements OnInit {
  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private pdfView: NgxExtendedPdfViewerService ) { }

  loadingStatus = 'loaded';
  dxfViewer: DxfViewer;
  dxfContent: any;
  search = '422P';
  searchNesting = '';
  dxfUrl = '';
  pdfUrl = 'https://deep-sea.ru/rest/files/0c30d707/210101-102-0104.pdf';
  loadedUrl = '';
  fontUrl = 'assets/fonts/gost_type_au.ttf';
  windowMode = 0;
  querySubscription: Subscription | null = null;
  log = 1;
  log1 = '';
  log2 = 1;
  scale = 0;
  camera = {
    x: 0,
    y: 0,
    zoom: 1
  };



  ngOnInit(): void {
    window.addEventListener('message', (event) => {
      if (event.data.PART_CODE != null){
        this.search = this.trimLeftZeros(event.data.PART_CODE) + event.data.SYMMETRY;
        this.move();
      }
    });
    this.querySubscription = this.route.queryParams.subscribe(params => {
      this.dxfUrl = params.dxf != null ? params.dxf : this.dxfUrl;
      this.windowMode = params.window != null ? params.window : this.windowMode;
      let search = params.search != null ? params.search : '';
      let searchNesting = params.searchNesting != null ? params.searchNesting : '';
      if (search != '' && this.loadingStatus == 'loaded'){
        this.search = search;
        this.move();
      }
      if (searchNesting != '' && this.loadingStatus == 'loaded'){
        this.searchNesting = searchNesting;
        this.moveNesting();
      }
      if (this.dxfUrl != '' && this.loadedUrl != this.dxfUrl && this.loadingStatus == 'loaded'){
        this.dxfViewer?.Clear();
        this.loadingStatus = 'load';
        this.loadedUrl = this.dxfUrl;
        this.fetchDxf();
      }
    });
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
  }

  trimLeftZeros(input: string){
    let result = input;
    while (result.length > 0 && result[0] == '0'){
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
            if (this.search != ''){
              this.move();
            }
            if (this.searchNesting != ''){
              this.moveNesting();
            }
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
  moveNesting() {
    console.log('move nest');
    let find = this.dxfContent?.entities.find((x: any) => x?.text?.includes(this.searchNesting));
    // let find = this.dxfContent?.entities.find((x: any) => x.layer == 'Labels' && x.type == 'MTEXT' && x.text.includes(this.searchNesting));
    console.log(find);
    if (find != null){
      let origin = this.dxfViewer.GetOrigin();
      let x = find.position.x;
      let y = find.position.y;
      x -= origin.x;
      y -= origin.y;

      this.setView({x, y}, 3000);
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

  mouseZoom(event: any) {
    event.preventDefault();
    event.stopPropagation();
    let step = 0.1;
    this.camera.zoom = this.camera.zoom + (event.deltaY > 0 ? -step : step);
    if (this.camera.zoom < 0.1){
      this.camera.zoom = 0.1;
    }
    if (this.view == null){
      // @ts-ignore
      this.view = document.getElementsByClassName('ng2-pdf-viewer-container')[0];
    }
    // @ts-ignore
    let width = this.pdfView.element.nativeElement.clientWidth;
    // @ts-ignore
    let height = this.pdfView.element.nativeElement.clientHeight;


    // @ts-ignore
    //this.view.scrollLeft += width * step * this.camera.zoom;
    // @ts-ignore
    //this.view.scrollTop += height * step * this.camera.zoom;

  }
  view = null;
  mousePan(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.buttons == 1){
      if (this.view == null){
        // @ts-ignore
        this.view = document.getElementsByClassName('ng2-pdf-viewer-container')[0];
      }

      // @ts-ignore
      this.view.scrollLeft -= event.movementX;
      // @ts-ignore
      this.view.scrollTop -= event.movementY;
    }
  }

  updateView(event: MouseEvent) {
    this.camera.zoom += 0.00000000000001;
    setTimeout(() => {
      this.camera.zoom -= 0.00000000000001;
    }, 100);
  }

}
