import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
// import Modeler from 'bpmn-js/lib/Modeler.js';
// @ts-ignore
import propertiesPanelModule from 'bpmn-js-properties-panel';
// @ts-ignore
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
// @ts-ignore
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
// @ts-ignore
import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.production.min.js';
import * as _ from 'underscore';
import * as props from "../../props";
import {FileAttachment} from "../../domain/classes/file-attachment";
import {MessageService} from "primeng/api";


@Component({
  selector: 'app-bpmn',
  templateUrl: './bpmn.component.html',
  styleUrls: ['./bpmn.component.css']
})
export class BpmnComponent implements OnInit {

  modeler: BpmnJS;
  selectedModel = '';
  models: string[] = [];
  // @ts-ignore
  @ViewChild('canvas') canvesRef: ElementRef;

  constructor(private http: HttpClient, private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.modeler = new BpmnJS({
      container: '#canvas',
      width: '100%',
      height: '100%',
      propertiesPanel: {
        parent: '#properties'
      },
      additionalModules: [
        propertiesPanelModule,
        propertiesProviderModule,
      ],
      moddleExtensions: {
        camunda: camundaModdleDescriptor
      },
      keyboard: {
        bindTo: document
      }
    });
    // @ts-ignore
    this.modeler.on('import.done', ({some}) => {
      this.modeler.get('canvas').zoom('fit-viewport', 'auto');
    });
    this.getModels();
  }
  getModels(){
    this.http.get<string[]>(props.http + '/getUploadedDeployments').subscribe(res => {
      this.models = res;
      if (this.models.length > 0){
        this.selectedModel = this.models[0];
        this.getModel();
      }
    });
  }
  getModel(){
    this.http.get(props.http + '/getDeploymentResource', { responseType: 'arraybuffer', params: {id: this.selectedModel}}).subscribe(res => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.modeler.importXML(reader.result);
      };
      let blob = new Blob([new Uint8Array(res)]);
      reader.readAsText(blob);
    });
  }
  generateId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }
  createNew(): void {
    this.http.get('/assets/initial.bpmn', {responseType: 'text'}).subscribe(data => {
      let newDoc = data;
      newDoc = this.replaceAll(newDoc, 'PROCESSID', this.generateId(8));
      newDoc = this.replaceAll(newDoc, 'STARTEVENTID', this.generateId(8));
      this.modeler.importXML(newDoc);
    });
  }
  uploadFile(event: any) {
    _.forEach(event.target.files, file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.modeler.importXML(reader.result);
      };
      reader.readAsText(<File>file);
    });
  }
  replaceAll(input: string, replaceFrom: string, replaceTo: string): string{
    let result = input;
    while (result.includes(replaceFrom)){
      result = result.replace(replaceFrom, replaceTo);
    }
    return result;
  }
  save(): void{
    // @ts-ignore
    this.modeler.saveXML({ format: true }).then(res => {
      const fileName = 'diag-' + new Date().getTime();
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(res.xml));
      element.setAttribute('download', fileName + '.bpmn');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
  }
  depoloy() {
    const formData: FormData = new FormData();
    // @ts-ignore
    this.modeler.saveXML().then(res => {
      let utf8 = unescape(encodeURIComponent(res.xml));
      let arr = [];
      for (let i = 0; i < utf8.length; i++) {
        arr.push(utf8.charCodeAt(i));
      }
      let blob = new Blob([new Uint8Array(arr)]);
      formData.append('file', blob, 'upload.bpmn');
      this.http.post<string>(props.http + '/deployProcess', formData).subscribe(res => {
        if (res == "success"){
          this.messageService.add({severity:'success', summary:'Deployment', detail:'You have uploaded this model to server'});
          this.getModels();
        }
      });
    });
  }

  onModelChanged() {
    this.getModel();
  }
}
