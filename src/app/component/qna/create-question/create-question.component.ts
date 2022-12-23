import {ApplicationRef, Component, OnInit, ViewChild} from '@angular/core';
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {Issue} from "../../../domain/classes/issue";
import {User} from "../../../domain/classes/user";
import {LanguageService} from "../../../domain/language.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import Delta from "quill-delta";
import {mouseWheelZoom} from "mouse-wheel-zoom";
import {LV} from "../../../domain/classes/lv";
import {PrimeNGConfig} from "primeng/api";

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.css']
})
export class CreateQuestionComponent implements OnInit {

  issue: Issue = new Issue();
  taskSummary = '';
  taskDetails = '';
  taskDocNumber = '';
  taskDepartment = '';
  for_revision = '';
  users: User[] = [];
  itUsers: User[] = [];
  startDate: Date = new Date();
  dueDate: Date = new Date(this.startDate.getTime() + 259200000);
  contractDueDate: Date = new Date(this.startDate.getTime() + 259200000);
  today: Date = new Date();
  taskProjects: string[] = [];
  sfiCodes: LV[] = [];
  taskDepartments: string[] = [];
  taskPeriods: LV[] = [];
  taskPeriod: string = '';
  taskTypes: any[] = [];
  taskPriorities: any[] = [new LV('Средний'), new LV('Низкий'), new LV('Высокий')];
  assignedToUser = '';
  responsibleUser = '';
  selectedUsers: string[] = [];
  awaitForLoad: string[] = [];
  taskProject = '';
  sfiCode = '';
  taskType = 'IT';
  taskPriority = '';
  loaded: FileAttachment[] = [];
  taskStart: any;
  dragOver = false;
  image = '';
  showImages = false;
  parent_id = 0;
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
                this.issues.uploadFile(file, this.auth.getUser().login).then(res => {
                  this.loaded.push(res);
                  this.appRef.tick();
                  let newDelta = new Delta();
                  newDelta.retain(this.editor.getSelection().index);
                  newDelta.insert({image: res.url});
                  this.editor.updateContents(newDelta, 'user');
                  this.editor.setSelection(this.editor.getLength());
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
  constructor(private config: PrimeNGConfig, public lang: LanguageService, public issues: IssueManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, private appRef: ApplicationRef, public conf: DynamicDialogConfig, public l: LanguageService) { }
  ngOnInit(): void {
    this.issue = this.conf.data as Issue;
    this.config.setTranslation({
      dayNamesMin: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
      weekHeader: "№",
      monthNames: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
    });
    this.users = this.getUsers();
    this.itUsers = this.users.filter(x => x.department == 'IT');
    this.issues.getIssueProjects().then(projects => {
      this.taskProjects = projects;
      this.taskProjects.forEach((x: any) => x.label = this.getProjectName(x));
      if (this.taskProjects.length > 0 && this.taskProject == '-') {
        this.taskProject = this.taskProjects[0];
      }
    });
    // this.issues.getTaskPriorities().then(priorities => {
    //   this.taskPriorities = priorities.map(x => new LV(x));
    //   if (this.taskPriorities.length > 0 && this.taskPriority == '-') {
    //     this.taskPriority = this.taskPriorities[0];
    //   }
    // });

    this.issues.getIssueDepartments().then(departments => {
      this.taskDepartments = departments;
      this.taskDepartment = '-';
    });

    let issue = new Issue();

  }
  getProjectName(project: any){
    let res = project.name;
    if (project.rkd != ''){
      res += ' (' + project.rkd + ')';
    }
    return res;
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
          this.issues.uploadFile(file, this.auth.getUser().login).then(res => {
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
          this.issues.uploadFile(file, this.auth.getUser().login).then(res => {
            this.taskDetails += '<img src="' + res.url + '"/>';
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
    issue.issue_type = 'QNA';
    issue.started_by = this.auth.getUser().login;
    issue.project = this.taskProject;
    issue.assigned_to = 'nautic-rus';
    issue.priority = this.taskPriority;
    issue.start_date = new Date().getTime();
    issue.department = this.taskDepartment;
    issue.doc_number = this.taskDocNumber;
    issue.started_by = this.auth.getUser().login;
    issue.status = 'Новый';
    issue.file_attachments = this.loaded;
    this.issues.startIssue(issue).then(res => {
      this.issues.setIssueViewed(+res, this.auth.getUser().login).then(() => {
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
            this.issues.uploadFile(file, this.auth.getUser().login).then(res => {
              this.taskDetails += '<img src="' + res.url + '"/>';
              this.loaded.push(res);
            });
          }
        }
      }
    }
  }

  isCreateTaskDisabled() {
    return this.taskDetails.trim() == '';
  }
  quillCreated(event: any) {
    this.editor = event;
  }

  getUsers() {
    return this.auth.users.filter(x => x.visibility.includes('c'));
  }

}
