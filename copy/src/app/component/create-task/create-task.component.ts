import {ApplicationRef, ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {FileAttachment} from "../../domain/classes/file-attachment";
import {Issue} from "../../domain/classes/issue";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {mouseWheelZoom} from 'mouse-wheel-zoom';
// @ts-ignore
import ImageResize from 'quill-image-resize-module';
import Quill from "quill";
import Delta from "quill-delta";
import {User} from "../../domain/classes/user";
import {LanguageService} from "../../domain/language.service";
import {PrimeNGConfig} from "primeng/api";
import {LV} from "../../domain/classes/lv";

Quill.register('modules/imageResize', ImageResize);


@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css'],
})
export class CreateTaskComponent implements OnInit {
  issue: Issue = new Issue();
  taskSummary = '';
  taskDetails = '';
  taskDocNumber = '';
  taskDepartment = '';
  users: User[] = [];
  startDate: Date = new Date();
  dueDate: Date = new Date();
  today: Date = new Date();
  taskProjects: string[] = [];
  taskDepartments: LV[] = [];
  taskPeriods: string[] = ['Этап 1', 'Этап 2', 'Этап 3', 'Этап 4', 'Этап 5'];
  taskPeriod: string = this.taskPeriods[0];
  taskTypes: any[] = [];
  taskPriorities: any[] = [];
  selectedUser = '';
  awaitForLoad: string[] = [];
  taskProject = '';
  taskType = 'IT';
  taskPriority = '';
  loaded: FileAttachment[] = [];
  taskResponsible: any;
  taskStart: any;
  dragOver = false;
  image = '';
  showImages = false;
  // @ts-ignore
  editor;
  // @ts-ignore
  @ViewChild('img') img;
  // @ts-ignore
  wz;

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
  quillModules =
    {
      imageResize: {},
      clipboard: {
        matchers: [
            // @ts-ignore
            ['img', (node, delta) => {
              let image = delta.ops[0].insert.image;
              if ((image.indexOf(";base64")) != -1){
                let ext = image.substring("data:image/".length, image.indexOf(";base64"))
                let fileName = 'clip' + this.generateId(8)  + '.' + ext;
                const find = this.loaded.find(x => x.name == fileName);
                if (find != null){
                  this.loaded.splice(this.loaded.indexOf(find), 1);
                }
                this.awaitForLoad.push(fileName);
                this.appRef.tick();
                fetch(image).then(res => res.blob()).then(blob => {
                  const file = new File([blob], fileName,{ type: "image/png" });
                  this.issues.uploadFile(file).then(res => {
                    this.loaded.push(res);
                    this.appRef.tick();
                    this.taskDetails += '<img src="' + res.url + '"/>';
                    // this.editor.updateContents(new Delta().insert({image: res.url}));
                    this.appRef.tick();
                  });
                });
                return new Delta();
              }
              else{
                return delta;
              }
              //return delta;
            }]
        ]
      },
      keyboard: {
        bindings: {
          tab: {
            key: 9,
            handler: function () {
              return true;
            }
          }
        }
      }
    }
  constructor(private config: PrimeNGConfig, public lang: LanguageService, public issues: IssueManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, private appRef: ApplicationRef, public conf: DynamicDialogConfig) { }
  ngOnInit(): void {
    this.issue = this.conf.data as Issue;
    this.config.setTranslation({
      dayNamesMin: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
      weekHeader: "№",
      monthNames: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
    });
    //this.users = this.auth.users;
    this.users = this.getUsers();
    this.issues.getIssueTypes().then(types => {
      types.filter(x => this.issues.localeTaskType(x) != x).forEach(type => {
        this.taskTypes.push({label: this.issues.localeTaskType(type), value: type});
      });
      if (this.taskTypes.length > 0) {
        this.taskType = this.taskTypes[0].value;
      }
    });
    this.issues.getTaskPriorities().then(priorities => {
      priorities.forEach(priority => {
        this.taskPriorities.push(new LV(this.issues.localeTaskPriority(priority), priority));
      });
      this.taskPriorities = this.taskPriorities.reverse();
      if (this.taskPriorities.length > 0) {
        this.taskPriority = this.taskPriorities[0].value;
      }
    });
    this.issues.getIssueProjects().then(projects => {
      this.taskProjects = projects;
      if (this.taskProjects.length > 0) {
        this.taskProject = this.taskProjects[0];
      }
    });
    this.issues.getIssueDepartments().then(departments => {
      departments.forEach(d => {
        this.taskDepartments.push(new LV(this.issues.localeTaskDepartment(d), d));
      })
      this.taskDepartments = this.taskDepartments.reverse();
      if (this.taskDepartments.length > 0) {
        this.taskDepartment = this.taskDepartments[0].value;
      }
    });

    let issue = this.conf.data as Issue;
    if (issue != null && issue.id != null) {
      this.taskSummary = issue.name;
      this.taskType = issue.taskType;
      this.taskDetails = issue.details;
      this.loaded = issue.fileAttachments;
      this.taskPriority = issue.priority;
      this.selectedUser = issue.assignedTo;
      this.awaitForLoad = issue.fileAttachments.map(x => x.name);
      this.taskProject = issue.project;
      this.taskDepartment = issue.department;
      this.taskPriority = issue.priority;
      this.taskDocNumber = issue.docNumber;
      this.taskResponsible = issue.responsible;
      this.taskPeriod = issue.period;
    }

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
            console.log(res);
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
            this.taskDetails += '<img src="' + res.url + '"/>';
            console.log(res);
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
    issue.assignedTo = this.selectedUser;
    issue.priority = this.taskPriority;
    issue.startDate = this.startDate.getTime();
    issue.dueDate = this.dueDate.getTime();
    issue.department = this.taskDepartment;
    issue.docNumber = this.taskDocNumber;
    issue.responsible = this.selectedUser;
    issue.period = this.taskPeriod;
    // @ts-ignore
    issue.fileAttachments = this.loaded;
    this.issues.startIssue(this.auth.getUser().login, issue).then(res => {
      this.issues.setIssueViewed(res, this.auth.getUser().login).then(() => {
        this.ref.close(res);
      });
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
    event.preventDefault();
    let files = event.dataTransfer.files;
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          const acceptedImageTypes = ['.jpg', '.jpeg', '.png'];
          let isImage = false;
          acceptedImageTypes.forEach(x => {
            if (file.name.includes(x)){
              isImage = true;
            }
          });
          if (isImage) {
            const find = this.loaded.find(x => x.name == file.name);
            if (find != null) {
              this.loaded.splice(this.loaded.indexOf(find), 1);
            }
            this.awaitForLoad.push(file.name);
            this.issues.uploadFile(file).then(res => {
              this.taskDetails += '<img src="' + res.url + '"/>';
              this.loaded.push(res);
            });
          }
        }
      }
    }
  }

  isCreateTaskDisabled() {
    switch (this.taskType) {
      case 'it-task': return this.taskSummary.trim() == '' || this.taskDetails != null && this.taskDetails.trim() == '' || this.awaitForLoad.filter(x => !this.isLoaded(x)).length > 0;
      case 'task-rkd': return this.taskDocNumber.trim() == '' || this.taskSummary.trim() == '' || this.taskResponsible == '';
      default: return false;
    }
  }
  quillCreated(event: any) {
    this.editor = event;
  }

  getUsers() {
    return this.auth.users.filter(x => x.visibility.includes('c'));
  }

  taskTypeChanged() {
    this.selectedUser = this.auth.getUser().login;
  }
}
