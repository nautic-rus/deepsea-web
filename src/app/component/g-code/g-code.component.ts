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

  code = 'G21\n' +
    'G40\n' +
    'G90\n' +
    'M37T5\n' +
    'G00X255.0Y130.0\n' +
    'M09\n' +
    'G04 P0.5\n' +
    'G01X255.0Y130.0\n' +
    'G01X255.0Y464.998\n' +
    'G01X255.0Y464.998\n' +
    'G01X205.0Y505.0\n' +
    'G01X205.0Y505.0\n' +
    'G01X255.0Y545.0\n' +
    'G01X255.0Y545.0\n' +
    'G01X255.0Y880.0\n' +
    'G01X255.0Y880.0\n' +
    'M10\n' +
    'G00X755.0Y880.0\n' +
    'M09\n' +
    'G04 P0.5\n' +
    'G01X755.0Y880.0\n' +
    'G01X755.0Y545.0\n' +
    'G01X755.0Y545.0\n' +
    'G01X805.0Y505.0\n' +
    'G01X805.0Y505.0\n' +
    'G01X755.0Y464.998\n' +
    'G01X755.0Y464.998\n' +
    'G01X755.0Y130.0\n' +
    'G01X755.0Y130.0\n' +
    'M10\n' +
    'M37T3\n' +
    'G00X454.388Y483.011\n' +
    'M07\n' +
    'G04 P1.8\n' +
    'G02X484.389Y453.011I0.0J-30.001000000000033\n' +
    'G01X570.389Y453.011\n' +
    'G01X570.389Y453.011\n' +
    'G01X570.389Y468.009\n' +
    'G01X570.389Y468.009\n' +
    'G01X469.388Y569.009\n' +
    'G01X469.388Y569.009\n' +
    'G01X454.388Y569.009\n' +
    'G01X454.388Y569.009\n' +
    'G01X454.388Y483.011\n' +
    'G01X454.388Y483.011\n' +
    'M08\n' +
    'G00X405.0Y505.0\n' +
    'M07\n' +
    'G04 P1.8\n' +
    'G02X505.0Y605.0I100.0J0.0\n' +
    'G02X605.0Y505.0I0.0J-100.0\n' +
    'G02X505.0Y405.0I-100.0J0.0\n' +
    'G02X405.0Y505.0I0.0J100.0\n' +
    'M08\n' +
    'G00X5.0Y5.0\n' +
    'M07\n' +
    'G04 P1.8\n' +
    'G01X5.0Y5.0\n' +
    'G01X992.5Y5.0\n' +
    'G02X996.162Y13.8379I12.5J8.400000000001739E-4\n' +
    'G02X1005.0Y17.5I8.837999999999965J-8.828619999999999\n' +
    'G01X1005.0Y967.498\n' +
    'G02X967.5Y1005.0I0.0J37.50199999999995\n' +
    'G01X55.0005Y1005.0\n' +
    'G02X5.0Y955.0I-50.002660000000006J0.0\n' +
    'G01X5.0Y5.0\n' +
    'G01X5.0Y5.0\n' +
    'M08\n' +
    'M02\n';
  cmap = '';
  querySubscription: any;
  windowMode = 0;
  loading = true;

  constructor(@Inject(DOCUMENT) private document: Document, private renderer2: Renderer2, public route: ActivatedRoute, public s: SpecManagerService) { }


  ngOnInit(): void {
    document.addEventListener('simulation', () => {
      this.loading = false;
    });

    this.querySubscription = this.route.queryParams.subscribe(params => {
      this.cmap = params.cmap != null ? params.cmap : this.cmap;
      let cmapuser = params.cmapuser != null ? params.cmapuser : '';
      let cmapdate = params.cmapdate != null ? params.cmapdate : 0;
      let project = params.foranProject != null ? params.foranProject : 'N004';
      if (this.cmap != ''){
        fetch(this.cmap).then(res => {
          res.text().then(text => {
            if (project == 'N002'){
              this.s.createTAP(text.split('\n'), cmapuser + ' at ' + new Date(+cmapdate).toDateString()).then(res => {
                this.code = '';
                let newCode = '';
                res.forEach(x => newCode += (newCode != '' ? '\n' : '') + x);
                this.code = newCode;
              });
            }
            else{
              this.s.createCNC(text.split('\n'), cmapuser + ' at ' + new Date(+cmapdate).toDateString()).then(res => {
                this.code = '';
                let newCode = '';
                res.forEach(x => newCode += (newCode != '' ? '\n' : '') + x);
                this.code = newCode;
              });
            }
          });
        });
      }
      this.windowMode = params.window != null ? params.window : this.windowMode;
    });


    let textScript = this.renderer2.createElement('script');
    textScript.src = 'assets/test/webapp/libs/require.js';
    this.renderer2.appendChild(this.document.head, textScript);


    setTimeout(() => {
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


    }, 1000);
  }

  ngOnDestroy(): void {
    this.querySubscription.unsubscribe();
  }

}
