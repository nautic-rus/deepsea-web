import {ApplicationRef, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Issue} from "../../domain/classes/issue";
import * as _ from 'underscore';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {Editor} from "primeng/editor";
import {IssueMessage} from "../../domain/classes/issue-message";
import {FileAttachment} from "../../domain/classes/file-attachment";
import {mouseWheelZoom} from "mouse-wheel-zoom";
import {ConfirmationService, MessageService, PrimeNGConfig} from "primeng/api";
import {VarMap} from "../../domain/classes/var-map";
import Delta from "quill-delta";
import {AssignComponent} from "./assign/assign.component";
import {SendToApprovalComponent} from "./send-to-approval/send-to-approval.component";
import {ChangeResponsibleComponent} from "./change-responsible/change-responsible.component";
import {SendToCloudComponent} from "./send-to-cloud/send-to-cloud.component";
import {DeleteComponent} from "./delete/delete.component";
import {IdName} from "../../domain/classes/id-name";
import {LV} from "../../domain/classes/lv";
import {LanguageService} from "../../domain/language.service";
import {UserCardComponent} from "../employees/user-card/user-card.component";
import {all} from "underscore";

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TaskComponent implements OnInit {
  issue: Issue = new Issue();
  message = '';
  comment = false;
  messageFilter = 'all';
  awaitForLoad: string[] = [];
  loaded: FileAttachment[] = [];
  edit = '';
  image = '';
  selectedUser = '';
  showImages = false;
  // @ts-ignore
  @ViewChild('img') img;
  // @ts-ignore
  wz;
  // @ts-ignore
  editor;
  showHistory = ['_taskStatus'];
  availableActions: any[] = [];
  taskDepartments: LV[] = [];
  taskPriorities: LV[] = [];
  taskPeriods: string[] = [];
  taskProjects: string[] = [];
  issueNameEdit = false;
  startDate: Date = new Date();
  dueDate: Date = new Date();
  today: Date = new Date();
  collapsed: string[] = [];
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
                this.issueManager.uploadFile(file, this.auth.getUser().login).then(res => {
                  this.loaded.push(res);
                  this.appRef.tick();
                  let newDelta = new Delta();
                  newDelta.retain(this.editor.getSelection().index);
                  newDelta.insert({image: res.url});
                  this.editor.updateContents(newDelta);
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
  constructor(public t: LanguageService, private config: PrimeNGConfig, public ref: DynamicDialogRef, private messageService: MessageService, private dialogService: DialogService, public conf: DynamicDialogConfig, public issueManager: IssueManagerService, public auth: AuthManagerService, private confirmationService: ConfirmationService, private appRef: ApplicationRef) { }

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
  assignTask(){
    this.dialogService.open(AssignComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
        this.availableActions = this.getAvailableActions(issue);
      });
    });
  }
  ngOnInit(): void {
    this.config.setTranslation({
      dayNamesMin: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
      weekHeader: "№",
      monthNames: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
    });
    this.issue = this.conf.data as Issue;
    this.availableActions = this.getAvailableActions(this.issue);
    this.issueManager.getIssueDepartments().then(departments => {
      departments.forEach(d => {
        this.taskDepartments.push(new LV(this.issueManager.localeTaskDepartment(d), d));
      })
    });
    this.issueManager.getIssueProjects().then(projects => {
      this.taskProjects = projects;
    });
    this.issueManager.getIssuePeriods().then(periods => {
      this.taskPeriods = periods;
    });
    this.issueManager.getTaskPriorities().then(priorities => {
      priorities.forEach(priority => {
        this.taskPriorities.push(new LV(this.issueManager.localeTaskPriority(priority), priority));
      });
    });
    this.startDate = this.issue.start_date != 0 ? new Date(this.issue.start_date) : new Date();
    this.dueDate = this.issue.due_date != 0 ? new Date(this.issue.due_date) : new Date();
  }
  close(){
    this.ref.close('exit');
  }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    let ye = new Intl.DateTimeFormat('ru', { year: 'numeric' }).format(date);
    let mo = new Intl.DateTimeFormat('ru', { month: 'long' }).format(date);
    let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
    let hours = new Intl.DateTimeFormat('ru', { hour: '2-digit' }).format(date);
    let minutes = new Intl.DateTimeFormat('ru', { minute: '2-digit' }).format(date);
    return da + ' ' + this.localeMonth(mo) + ' ' + ye + ' ' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
  }
  getFileDate(dateLong: number): string{
    let date = new Date(dateLong);
    let ye = new Intl.DateTimeFormat('ru', { year: 'numeric' }).format(date);
    let mo = new Intl.DateTimeFormat('ru', { month: '2-digit' }).format(date);
    let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
    let hours = new Intl.DateTimeFormat('ru', { hour: '2-digit' }).format(date);
    let minutes = new Intl.DateTimeFormat('ru', { minute: '2-digit' }).format(date);
    return da + ' ' + this.localeMonth(mo) + ' ' + ye + ' ' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
  }
  quillCreated(event: any) {
    this.editor = event;
  }
  localeMonth(month: string) {
    switch (month){
      case 'январь': return 'января';
      case 'февраль': return 'февраля';
      case 'март': return 'марта';
      case 'апрель': return 'апреля';
      case 'май': return 'мая';
      case 'июнь': return 'июня';
      case 'июль': return 'июля';
      case 'август': return 'августа';
      case 'сентябрь': return 'сентября';
      case 'октябрь': return 'октября';
      case 'ноябрь': return 'ноября';
      case 'декабрь': return 'декабрь';
      default: return month;
    }
  }
  getDateNoTime(dateLong: number): string{
    if (dateLong == 0){
      return '-';
    }
    else{
      let date = new Date(dateLong);
      let ye = new Intl.DateTimeFormat('ru', { year: '2-digit' }).format(date);
      let mo = new Intl.DateTimeFormat('ru', { month: '2-digit' }).format(date);
      let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
      return da + '.' + mo + '.' + ye;
    }
  }
  getWithNoResult(value: string){
    return value == '' ? '-' : value;
  }
  getMessages(issue: Issue) {
    let res: any[] = [];
    issue.messages.forEach(x => res.push(x));
    issue.history.forEach(x => res.push(x));
    // @ts-ignore
    return _.sortBy(res, x => x.date != null ? x.date : x.update_date).reverse();
  }

  getAvailableActions(issue: Issue) {
    const res: any[] = [];
    issue.actions.forEach(action => {
      let allow = false;
      allow = action.rule.includes('r') && issue.responsible == this.auth.getUser().login || allow;
      allow = action.rule.includes('a') && issue.assigned_to == this.auth.getUser().login || allow;
      allow = action.rule.includes('s') && issue.started_by == this.auth.getUser().login || allow;
      allow = action.rule.includes('c') ? issue.child_issues.filter(x => x.status != 'Approved').length == 0 && allow : allow;
      if (allow){
        res.push({label: this.issueManager.localeStatusAsButton(action.action, false), value: action.action});
      }
    });
    return res;
  }

  statusChanged() {
    // @ts-ignore
    this.issueManager.updateIssue(this.auth.getUser().login, "status", this.issue).then(issue => {
      if (issue.id != null){
        this.issue = issue;
        this.availableActions = this.getAvailableActions(issue);
        this.issueManager.setIssueViewed(this.issue.id, this.auth.getUser().login);
      }
      else{
        this.availableActions = [];
      }
    });
  }

  openFile(url: string) {
    window.open(url);
  }

  showComment() {
    this.comment = true;
    this.message = '';
    this.awaitForLoad = [];
    this.loaded = [];
    setTimeout(() => {
      this.editor.focus();
    })
  }
  localeGender(userId: string){
    let find = this.auth.users.find(x => x.login == userId);
    return find != null && find.gender == 'female' && this.t.language == 'ru' ? 'а' : '';
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
      case 'mp4': return 'mp4.svg';
      default: return 'file.svg';
    }
  }
  sendMessage() {
    let message = new IssueMessage();
    message.author = this.auth.getUser().login;
    message.content = this.message;
    message.fileAttachments = this.loaded;

    // @ts-ignore
    this.issueManager.setIssueMessage(this.issue.id, message).then(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
      });
    });
    this.comment = false;
  }
  trimFileName(input: string, length: number = 8): string{
    let split = input.split('.');
    let name = split[0];
    let extension = split[1];
    if (input.length > length){
      return name.substr(0, length) + '..' + name.substr(name.length - 2, 2) + '.' + extension;
    }
    else{
      return input;
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
          this.issueManager.uploadFile(file, this.auth.getUser().login).then(res => {
            if (this.edit == 'description'){
              this.issue.details += '<img style="cursor: pointer" src="' + res.url + '"/>';
            }
            else{
              this.message += '<img style="cursor: pointer" src="' + res.url + '"/>';
            }
            this.loaded.push(res);
          });
        }
      }
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
          this.issueManager.uploadFile(file, this.auth.getUser().login).then(res => {
            this.loaded.push(res);
          });
        }
      }
    }
  }
  isLoaded(file: string) {
    return this.loaded.find(x => x.name == file);
  }
  closeShowImage() {
    this.showImages = false;
    this.img = '';
    this.wz.setSrcAndReset('');
  }
  onImagesDrop(event: DragEvent) {
    event.preventDefault();
    // @ts-ignore
    this.handleImageInput(event.dataTransfer.files);
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
            this.issueManager.uploadFile(file, this.auth.getUser().login).then(res => {
              if (this.edit == 'description'){
                this.issue.details += '<img src="' + res.url + '"/>';
              }
              else{
                this.message += '<img src="' + res.url + '"/>';
              }
              this.loaded.push(res);
            });
          }
        }
      }
    }
  }
  editorClicked(event: any) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target.localName == 'img'){
      this.showImage(event.target.currentSrc);
      //window.open(event.target.currentSrc);
    }
    else if (event.target.localName == 'a'){
      window.open(event.target.href, '_blank');
    }
    else if (this.isEditable()){
      this.edit = 'description';
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

  removeIssue() {
    this.dialogService.open(DeleteComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.ref.close();
      }
    });
  }
  editorInit(event: any) {
    this.editor = event;
  }

  filterVariables(variables: VarMap[]) {
    return variables.filter(x => this.showHistory.includes(x.name));
  }

  getAuthor(author: string) {
    return this.auth.getUserName(author);
  }

  onEditorPressed(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      this.sendMessage();
    }
  }

  copyIssue() {
    this.ref.close(this.issue);
  }

  getAssignedTo(user: string) {
    let res = this.auth.getUserName(user);
    if (res == ''){
      res = 'Не назначен';
    }
    return res;
  }
  getDueDate(date: number){
    return date == 0 ? '-' : this.getDate(date);
  }

  changeStatus(value: string) {
    if (value == 'AssignedTo'){
      this.issue.status = value;
      this.issue.action = value;
      this.assignTask();
    }
    else{
      this.issue.status = value;
      this.issue.action = value;
      this.statusChanged();
    }
  }
  askForSendToCloud(){
    this.dialogService.open(SendToCloudComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
        this.availableActions = this.getAvailableActions(issue);
      });
    });
  }
  askForSendToApproval(){
    this.dialogService.open(SendToApprovalComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
        this.availableActions = this.getAvailableActions(issue);
      });
    });
  }
  commitIssueEdit() {
    if (this.edit == 'startDate'){
      this.issue.start_date = this.startDate.getTime();
    }
    if (this.edit == 'dueDate'){
      this.issue.due_date = this.dueDate.getTime();
    }
    this.issueManager.updateIssue(this.auth.getUser().login, "edit-" + this.edit, this.issue).then(issue => {
      this.edit = '';
      if (issue.id != null){
        this.issue = issue as Issue;
        this.messageService.add({key:'task', severity:'success', summary:'Update', detail:'You have successfully updated issue.'});
        this.issueManager.setIssueViewed(this.issue.id, this.auth.getUser().login);
      }
    });
  }

  cancelIssueEdit() {
    this.edit = '';
    this.startDate = new Date(this.issue.start_date);
    this.dueDate = new Date(this.issue.due_date);
    this.issueManager.getIssueDetails(this.issue.id).then(res => {
      this.issue = res;
    });
  }

  changeResponsible() {
    this.dialogService.open(ChangeResponsibleComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(res => {
        this.issue = res;
      });
    });
  }

  openIssue(id: string) {
    window.open('/?taskId=' + id, '_blank');
  }

  copyIssueUrl() {
    navigator.clipboard.writeText(location.origin + '?taskId=' + this.issue.id);
    this.messageService.add({key:'task', severity:'success', summary:'Copied', detail:'You have copied issue url.'});
  }

  trim(input: string, length: number = 55): string{
    if (input.length <= length){
      return input;
    }
    else {
      return input.substr(0, length) + '...';
    }
  }

  isEditable() {
    return this.auth.getUser().login == this.issue.started_by || this.auth.getUser().login == this.issue.responsible;
  }

  openUserInfo(author: string) {
    this.dialogService.open(UserCardComponent, {
      showHeader: false,
      modal: true,
      data: author
    });
  }
  contentClick(content: string): void{
    this.collapsed.includes(content) ? this.collapsed.splice(this.collapsed.indexOf(content), 1) : this.collapsed.push(content);
  }

  deleteFile(url: string) {
    this.issueManager.deleteFile(url).then(() => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
        this.availableActions = this.getAvailableActions(issue);
      });
    });
  }
}
