import {AfterViewInit, Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {ActivatedRoute} from "@angular/router";
import {SpecManagerService} from "../../domain/spec-manager.service";
declare var initGCode: any;
@Component({
  selector: 'app-g-code',
  templateUrl: './g-code.component.html',
  styleUrls: ['./g-code.component.css']
})
export class GCodeComponent implements OnInit, OnDestroy {

  code = '';
  cmap = '';
  path = '';
  querySubscription: any;
  windowMode = 0;
  loading = true;
  fileFound = false;

  constructor(@Inject(DOCUMENT) private document: Document, private renderer2: Renderer2, public route: ActivatedRoute, public s: SpecManagerService) { }


  ngOnInit(): void {
    document.addEventListener('simulation', () => {
      this.loading = false;
    });

    this.querySubscription = this.route.queryParams.subscribe(params => {
      this.cmap = params.cmap != null ? params.cmap : this.cmap;
      this.path = params.path != null ? params.path : this.path;
      let cmapuser = params.cmapuser != null ? params.cmapuser : '';
      let cmapdate = params.cmapdate != null ? params.cmapdate : 0;
      let project = params.foranProject != null ? params.foranProject : 'N004';
      this.windowMode = params.window != null ? params.window : this.windowMode;

      if (this.windowMode){
        this.cmap = this.cmap + '?path=' + this.path;
        console.log(this.cmap);
      }
      if (this.cmap != ''){
        fetch(this.cmap).then(res => {
          res.text().then(text => {
            if (project == 'N002'){
              console.log('GENERATING TAP');
              this.s.createTAP(text.split('\n'), cmapuser + ' at ' + new Date(this.getCloudDateNoTime(+cmapdate)).toDateString()).then(res => {
                this.code = '';
                let newCode = '';
                res.forEach(x => newCode += (newCode != '' ? '\n' : '') + x);
                this.code = newCode;
              });
            }
            else{
              this.s.createCNC(text.split('\n'), cmapuser + ' at ' + new Date(this.getCloudDateNoTime(+cmapdate)).toDateString()).then(res => {
                this.code = '';
                let newCode = '';
                res.forEach(x => newCode += (newCode != '' ? '\n' : '') + x);
                this.code = newCode;
              });
            }
          });
        });
      }
    });

    let textScript = this.renderer2.createElement('script');
    textScript.src = 'assets/test/webapp/libs/require.js';
    this.renderer2.appendChild(this.document.head, textScript);

    this.setCode();


  }
  setCode(){
    setTimeout(() => {
      if (this.code != ''){

        let textScript = this.renderer2.createElement('script');
        textScript.src = 'assets/test/webapp/config.js';
        this.renderer2.appendChild(this.document.head, textScript);
        textScript = this.renderer2.createElement('script');
        textScript.type = 'text/javascript';
        textScript.text = `
          requirejs.config({
                baseUrl: 'assets/test/webapp'
            });
        `;
        this.renderer2.appendChild(this.document.head, textScript);
        textScript = this.renderer2.createElement('script');
        textScript.src = 'assets/test/GCode.js';
        this.renderer2.appendChild(this.document.body, textScript);
      }
      else{
        this.setCode();
      }
    }, 1000);
  }
  getCloudDateNoTime(dateLong: number): number{
    let date = new Date(0);
    date.setUTCSeconds(dateLong);
    return date.getTime();
  }
  ngOnDestroy(): void {
    this.querySubscription.unsubscribe();
  }

}
