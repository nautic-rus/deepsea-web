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
  for_revision = '';
  users: User[] = [];
  itUsers: User[] = [];
  startDate: Date = new Date();
  dueDate: Date = new Date(this.startDate.getTime() + 259200000);
  today: Date = new Date();
  taskProjects: string[] = [];
  sfiCodes: LV[] = [];
  taskDepartments: string[] = [];
  taskPeriods: LV[] = [];
  taskPeriod: string = '';
  taskTypes: any[] = [];
  taskPriorities: any[] = [];
  assignedToUser = '';
  responsibleUser = '';
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
    //this.users = this.auth.users;
    this.users = this.getUsers();
    this.itUsers = this.users.filter(x => x.department == 'IT');
    this.issues.getIssueTypes().then(types => {
      types.forEach(type => {
        let allow = true;
        if (type.type_name == 'RKD' && !this.auth.hasPerms('create_rkd_task')){
          allow = false;
        }
        if (type.type_name == 'PDSP' && !this.auth.hasPerms('create_pdsp_task')){
          allow = false;
        }
        if (type.type_name == 'ORIZ' && !this.auth.hasPerms('create_oriz_task')){
          allow = false;
        }
        if (allow){
          this.taskTypes.push({label: this.issues.localeTaskType(type.type_name), value: type.type_name});
        }
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
      this.taskProjects = projects.filter(x => this.auth.getUser().visible_projects.includes(x));
      if (this.taskProjects.length > 0 && this.taskProject == '-') {
        this.taskProject = this.taskProjects[0];
      }
    });
    this.taskPeriods.splice(0, this.taskPeriods.length);
    this.issues.getIssuePeriods().then(periods => {
      periods.filter(x => x.project == this.taskProject).forEach(period => {
        this.taskPeriods.push({label: this.issues.localeTaskPeriod(period.name), value: period.name});
      });
      if (this.taskPeriods.length > 0) {
        this.taskPeriod = this.taskPeriods[0].value;
      }
    });

    this.sfiCodes.splice(0, this.sfiCodes.length);
    this.issues.getSfiCodes().then(sfiCodes => {
      console.log(sfiCodes);
      sfiCodes.map(x => new LV(this.l.language == 'ru' ? (x.code + ' - ' + x.ru) : (x.code + ' - ' + x.en), x.code)).forEach(sfiCode => {
        this.sfiCodes.push(sfiCode);
      });
      if (this.sfiCodes.length > 0) {
        this.sfiCode = this.sfiCodes[0].value;
      }
    });

    this.issues.getIssueDepartments().then(departments => {
      this.taskDepartments = departments;
      this.taskDepartment = '-';
    });

    let issue = this.conf.data as Issue;
    if (issue != null && issue.id != null) {
      this.taskSummary = issue.name;
      this.taskType = issue.issue_type;
      this.taskDetails = issue.details;
      this.loaded = issue.file_attachments;
      this.taskPriority = issue.priority;
      this.assignedToUser = issue.assigned_to;
      this.responsibleUser = issue.responsible;
      this.awaitForLoad = issue.file_attachments.map(x => x.name);
      this.taskProject = issue.project;
      this.taskDepartment = issue.department;
      this.taskPriority = issue.priority;
      this.taskDocNumber = issue.doc_number;
      this.taskPeriod = issue.period;
      this.parent_id = issue.parent_id;
      this.for_revision = issue.for_revision;
      console.log(issue);
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
    issue.issue_type = this.taskType;
    issue.started_by = this.auth.getUser().login;
    issue.project = this.taskProject;
    issue.assigned_to = this.assignedToUser;
    issue.priority = this.taskPriority;
    issue.start_date = this.startDate.getTime();
    issue.due_date = this.dueDate.getTime();
    issue.department = this.taskDepartment;
    issue.doc_number = this.taskDocNumber;
    issue.responsible = this.responsibleUser;
    issue.period = this.taskPeriod;
    issue.started_by = this.auth.getUser().login;
    issue.sfi_code = this.sfiCode;
    issue.status = 'New';
    issue.action = 'New';
    issue.for_revision = this.for_revision;
    issue.parent_id = this.parent_id;
    if (!issue.issue_type.includes('RKD') && !issue.issue_type.includes('PDSP')){
      issue.doc_number = '';
    }
    if (issue.issue_type == 'IT'){
      issue.department = 'IT';
    }

    // @ts-ignore
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
    switch (this.taskType) {
      case 'IT': return this.taskSummary.trim() == '' || this.taskDetails != null && this.taskDetails.trim() == '' || this.awaitForLoad.filter(x => !this.isLoaded(x)).length > 0;
      case 'RKD': return this.taskDocNumber.trim() == '' || this.taskSummary.trim() == '' || this.responsibleUser == '' || !((new RegExp('^\\d{6}-\\d{3}-\\d{4}$')).test(this.taskDocNumber));
      case 'RKD-T': return this.taskDocNumber.trim() == '' || this.taskSummary.trim() == '' || this.responsibleUser == '';
      case 'OTHER': return this.taskSummary.trim() == '' || this.responsibleUser == '';
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
    if (this.taskType == 'RKD' || this.taskType == 'PDSP'){
      this.taskProject = this.taskProjects[1];
      this.taskProjectChanged();
    }
    // this.assignedToUser = this.auth.getUser().login;
    // this.responsibleUser = this.auth.getUser().login;
  }

  taskProjectChanged() {
    this.taskPeriods.splice(0, this.taskPeriods.length);
    this.issues.getIssuePeriods().then(periods => {
      periods.filter(x => x.project == this.taskProject).forEach(period => {
        this.taskPeriods.push({label: this.issues.localeTaskPeriod(period.name), value: period.name});
      });
      if (this.taskPeriods.length > 0) {
        this.taskPeriod = this.taskPeriods[0].value;
      }
    });
    this.sfiCodeChanged();
  }
  sfiCodeChanged(){
    //this.taskDocNumber = this.taskProject + '-' + this.sfiCode + '-';
  }
}
