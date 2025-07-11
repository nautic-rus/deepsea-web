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
import _ from "underscore";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.css']
})
export class CreateQuestionComponent implements OnInit {

  issue: Issue = new Issue();
  taskSummary = '';
  taskDetails = '';
  taskDocNumber = '-';
  taskDepartment = '';
  for_revision = '';
  users: User[] = [];
  itUsers: User[] = [];
  startDate: Date = new Date();
  dueDate: Date = new Date(this.startDate.getTime() + 259200000);
  contractDueDate: Date = new Date(this.startDate.getTime() + 259200000);
  today: Date = new Date();
  taskProjects: LV[] = [];
  sfiCodes: LV[] = [];
  taskDepartments: string[] = [];
  taskPeriods: LV[] = [];
  taskPeriod: string = '';
  taskTypes: any[] = [];
  taskPriorities: any[] = [new LV(this.issues.localeTaskPriority('High'), 'High'), new LV(this.issues.localeTaskPriority('Low'), 'Low'), new LV(this.issues.localeTaskPriority('Medium'), 'Medium')];
  assignedToUser = '';
  responsibleUser = '';
  selectedUsers: string[] = [];
  awaitForLoad: string[] = [];
  taskProject = '-';
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
  docNumbersSrc: string[] = [];
  docNumbers: string[] = [];
  rkdIssues: Issue[] = [];
  issuesSrc: any[] = [];
  selectedIssues: any[] = [];
  issueTypes: string[] = ['ED', 'ITT', 'PSD', 'RKD', 'PDSP'];
  projects: string[] = [];
  projectDefs: any[] = [];

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
  constructor(public t: LanguageService, private config: PrimeNGConfig, public issues: IssueManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, private appRef: ApplicationRef, public conf: DynamicDialogConfig, public l: LanguageService) { }
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
      this.taskProjects = projects.filter(x => this.auth.getUser().visible_projects.includes(x.name));
      this.taskProjects.forEach((x: any) => x.label = this.getProjectName(x));
      this.taskProject = '-';
    });
    this.projects = this.conf.data;
    this.issues.getIssueProjects().then(projects => {
      this.projectDefs = projects;
      this.issues.getIssuesAllShort().subscribe(res => {
        console.log(res);
        if (this.auth.getUser().groups.includes('MR')) {
          res = res.filter(issue => {
            // issue.department === 'Electric';
            const author = this.auth.users.find(user => user.login === issue.started_by);  //проверяем что только те задачи, где автор тоже из роли MR
            return  issue.department === 'Electric' && issue.issue_type === 'RKD' && issue.status === 'Delivered'
          });
        }
        console.log(res);
        this.issuesSrc = res.filter(x => x.removed == 0).filter(x => this.issueTypes.includes(x.issue_type)).filter(x => this.projects.includes(x.project));

        this.issueSelected();
      });
    });

    // this.issues.getIssues('op').then(res => {
    //   this.rkdIssues = res;
    // });
    // this.issues.getTaskPriorities().then(priorities => {
    //   this.taskPriorities = priorities.map(x => new LV(x));
    //   if (this.taskPriorities.length > 0 && this.taskPriority == '-') {
    //     this.taskPriority = this.taskPriorities[0];
    //   }
    // });
    this.issues.getDepartments().subscribe(departments => {
      this.taskDepartments = departments.filter(x => x.visible_qna == 1).map(x => x.name);
      this.taskDepartment = '-';
    });
  }
  getProjectName(project: any){
    // return project.factory;
    // if (project.name == '-'){
    //   return '-';
    // }
    let res = project.name;
    // if (project.rkd != ''){
    //   res += ' (' + project.rkd + ')';
    // }
    return res;
  }
  getProject(project: string){
    let find = this.projectDefs.find(x => x.name == project);
    if (find != null){
      return this.getProjectNameQnA(find);
    }
    else{
      return project;
    }
  }
  getProjectNameQnA(project: any){
    return project.factory;
    let res = project.pdsp;
    if (res == ''){
      res = project.name;
    }
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
    if (this.selectedIssues.length > 5){
      alert('Запрещено выбирать более 5 связанных задач');
      return;
    }

    let findIssue = this.issuesSrc.find(x => this.selectedIssues.includes(x.id));
    if (findIssue != null){
      this.taskProject = findIssue.project;
      this.taskDepartment = findIssue.department;
      this.taskDocNumber = findIssue.doc_number;
    }

    const issue = new Issue();
    issue.name = this.taskSummary;
    issue.details = this.taskDetails;
    issue.issue_type = 'QNA';
    issue.started_by = this.auth.getUser().login;
    issue.project = this.taskProject;
    issue.assigned_to = 'nautic-rus';
    issue.priority = 'Medium';
    issue.start_date = new Date().getTime();
    issue.department = this.taskDepartment;
    //issue.doc_number = this.taskDocNumber;
    issue.doc_number = '';
    issue.started_by = this.auth.getUser().login;
    issue.status = 'New';
    issue.action = 'New';
    issue.file_attachments = this.loaded;


    this.issues.startIssue(issue).then(res => {
      this.selectedIssues.forEach(selected => {
        this.issues.combineIssues(selected, +res, this.auth.getUser().login).then(() => {});
      });
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
    return this.selectedIssues.length == 0 || this.taskDetails.replace('-', '').trim() == '' || this.taskSummary.replace('-', '').trim() == '';
  }
  quillCreated(event: any) {
    this.editor = event;
  }

  getUsers() {
    return this.auth.users.filter(x => x.visibility.includes('c'));
  }

  filterDocNumbers(event: any) {
    this.docNumbers = this.docNumbersSrc.filter(x => x.toLowerCase().includes(event.query.toLowerCase().trim()));
  }

  projectChanged() {
    this.docNumbersSrc = _.sortBy(_.uniq(this.rkdIssues.filter(x => x.project == this.taskProject && x.issue_type == 'RKD').map(x => x.doc_number), x => x), x => x);
    this.docNumbers = [...this.docNumbersSrc];
  }

  setDepartmentOnDocNumberSelect() {
    let find = this.rkdIssues.find(x => x.doc_number == this.taskDocNumber);
    if (find != null){
      this.taskDepartment = find.department;
    }
  }

  locale(input: string) {
    switch (input){
      case 'No project': return 'Без проекта';
      case 'No Department': return 'Без отдела';
      case 'No document': return 'Без документа';
      case 'No summary': return 'Без темы';
      default: return input;
    }
  }
  trimName(name: string, length: number = 75) {
    if (name == null){
      return '';
    }
    return name.substr(0, length) + (name.length > length ? '...' : '');
  }

  issueSelected() {
    this.issuesSrc = _.sortBy(this.issuesSrc, x => {
      if (this.selectedIssues.includes(x.id)){
        return '0' + x.issue_name;
      }
      else{
        return '1' + x.issue_name;
      }
    });
  }
}
