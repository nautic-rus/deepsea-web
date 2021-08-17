import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {FileAttachment} from "../../domain/classes/file-attachment";
import {Issue} from "../../domain/classes/issue";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {Editor} from "primeng/editor";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import { mouseWheelZoom } from 'mouse-wheel-zoom';



@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css']
})
export class CreateTaskComponent implements OnInit {
  taskSummary = '';
  taskDetails = '';
  taskProjects: string[] = [];
  taskTypes: string[] = [];
  awaitForLoad: string[] = [];
  taskProject = '';
  taskType = 'IT';
  loaded: FileAttachment[] = [];
  taskResponsible: any;
  taskStart: any;
  dragOver = false;
  image = '';
  showImages = false;
  // @ts-ignore
  @ViewChild('editor') editor;
  // @ts-ignore
  @ViewChild('toolbar') toolbar;
  // @ts-ignore
  @ViewChild('img') img;
  // @ts-ignore
  wz;
  constructor(public issues: IssueManagerService, private auth: AuthManagerService, public ref: DynamicDialogRef) { }

  ngOnInit(): void {


    this.issues.getIssueTypes().then(types => {
      this.taskTypes = types;
      if (this.taskTypes.length > 0){
        this.taskType = this.taskTypes[0];
      }
    });
    this.issues.getIssueProjects().then(projects => {
      this.taskProjects = projects;
      if (this.taskProjects.length > 0){
        this.taskProject = this.taskProjects[0];
      }
    });
  }

  handleFileInput(files: FileList | null) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          // @ts-ignore
          const find = this.loaded.find(x => x.name == file.name);
          if (find != null){
            this.loaded.splice(this.loaded.indexOf(find), 1);
          }
          this.awaitForLoad.push(file.name);
        }
      }
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          this.issues.uploadFile(file).then(res => {
            this.loaded.push(res);
          });
        }
      }
    }
  }
  handleImageInput(files: FileList | null) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          // @ts-ignore
          const find = this.loaded.find(x => x.name == file.name);
          if (find != null){
            this.loaded.splice(this.loaded.indexOf(find), 1);
          }
          this.awaitForLoad.push(file.name);
        }
      }
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          const q = "'";
          this.issues.uploadFile(file).then(res => {
            this.taskDetails += '<img style="cursor: pointer; width: 200px; height: 200px" src="' + res.url + '"/>';
            this.loaded.push(res);
          });
        }
      }
    }
  }
  createTask() {
    const issue = new Issue();
    issue.name = this.taskSummary;
    issue.details = this.taskDetails;
    issue.taskType = this.taskType;
    issue.startedBy = this.auth.getUser().login;
    issue.project = this.taskProject;
    // @ts-ignore
    issue.fileAttachments = this.loaded;
    this.issues.startIssue(this.auth.getUser().login, issue).then(res => {
      this.ref.close(res);
    });
  }

  isLoaded(file: string) {
    return this.loaded.find(x => x.name == file);
  }

  remove(file: string) {
    let find = this.loaded.find(x => x.name == file);
    if (find != null){
      this.loaded.splice(this.loaded.indexOf(find), 1);
    }
    let findAwait = this.awaitForLoad.find(x => x == file);
    if (findAwait != null){
      this.awaitForLoad.splice(this.awaitForLoad.indexOf(findAwait), 1);
    }
  }
  getFileExtensionIcon(file: string) {
    switch (file.toLowerCase().split('.').pop()){
      case 'pdf': return 'pdf.svg';
      case 'dwg': return 'dwg.svg';
      case 'xls': return 'xls.svg';
      case 'xlsx': return 'xls.svg';
      case 'doc': return 'doc.svg';
      case 'docx': return 'doc.svg';
      case 'png': return 'png.svg';
      case 'jpg': return 'jpg.svg';
      case 'txt': return 'txt.svg';
      case 'zip': return 'zip.svg';
      default: return 'file.svg';
    }
  }


  close() {
    this.ref.close();
  }

  onFilesDrop(event: DragEvent) {
    event.preventDefault();
    // @ts-ignore
    this.handleFileInput(event.dataTransfer.files);
  }
  onImagesDrop(event: DragEvent) {
    event.preventDefault();
    // @ts-ignore
    this.handleImageInput(event.dataTransfer.files);
  }
  editorClicked(event: any) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target.localName == 'img'){
      this.showImage(event.target.currentSrc);
      //window.open(event.target.currentSrc);
    }
  }

  showImage(url: string){
    this.image = url;
    this.showImages = true;
    setTimeout(() => {
      if (this.wz == null){
        this.wz = mouseWheelZoom({
          // @ts-ignore
          element: document.querySelector('[data-wheel-zoom]'),
          zoomStep: .25
        });
      }
      this.wz.setSrcAndReset(url);
    });
  }

  closeShowImage() {
    this.showImages = false;
    this.img = '';
    this.wz.setSrcAndReset('');
  }

  onEditorDrop(event: any) {
    this.onImagesDrop(event);
  }

  isCreateTaskDisabled() {
    switch (this.taskType) {
      case 'it-task': return this.taskSummary.trim() == '' || this.taskDetails.trim() == '' || this.awaitForLoad.length > 0;
      default: return false;
    }
  }
}
