import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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

@Component({
  selector: 'app-bpmn',
  templateUrl: './bpmn.component.html',
  styleUrls: ['./bpmn.component.css']
})
export class BpmnComponent implements OnInit {

  modeler: BpmnJS;

  // @ts-ignore
  @ViewChild('canvas') canvesRef: ElementRef;

  constructor(private http: HttpClient) {
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
        propertiesProviderModule
      ],
      moddleExtensions: {
        camunda: camundaModdleDescriptor
      }
    });
    // @ts-ignore
    this.modeler.on('import.done', ({some}) => {
      this.modeler.get('canvas').zoom('fit-viewport', 'auto');
    });
    this.createNew();
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
  statusValue = 'noValue';
  taskNumber = 'aa';
  taskName = 'bbb';
  getStatus() {
    this.http.get('http://localhost:8080/get-process-status', {responseType: 'text'}).subscribe({
      next: data => {
        this.statusValue = data;
      },
      error: error => {
        console.log(error);
      }
    });
  }
  setTaskNumber() {
    this.http.post('http://localhost:8080/set-task-number', null, {params: {taskNumber: this.taskNumber}, responseType: 'text'}).subscribe({
      next: data => {
      },
      error: error => {
        console.log(error);
      }
    });
  }
  setTaskName() {
    this.http.post('http://localhost:8080/set-task-name', null, {params: {taskName: this.taskName}, responseType: 'text'}).subscribe({
      next: data => {
      },
      error: error => {
        console.log(error);
      }
    });
  }

  uploadModel() {
    this.http.post('http://localhost:8080/upload', null, {responseType: 'text'}).subscribe({
      next: data => {
      },
      error: error => {
        console.log(error);
      }
    });
  }
}
