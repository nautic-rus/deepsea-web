import {ApplicationRef, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {Issue} from "../../../domain/classes/issue";
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {LV} from "../../../domain/classes/lv";
import {IssueType} from "../../../domain/classes/issue-type";
import Delta from "quill-delta";
import {ConfirmationService, MenuItem, MessageService, PrimeNGConfig} from "primeng/api";
import {LanguageService} from "../../../domain/language.service";
import {DialogService} from "primeng/dynamicdialog";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {AssignComponent} from "../../task/assign/assign.component";
import * as _ from "underscore";
import {IssueMessage} from "../../../domain/classes/issue-message";
import {mouseWheelZoom} from "mouse-wheel-zoom";
import {DeleteComponent} from "../../task/delete/delete.component";
import {LaboriousnessComponent} from "../../task/laboriousness/laboriousness.component";
import {VarMap} from "../../../domain/classes/var-map";
import {ConfirmAlreadyExistSendToApprovalComponent} from "../../task/confirm-already-exist-send-to-approval/confirm-already-exist-send-to-approval.component";
import {SendToCloudComponent} from "../../task/send-to-cloud/send-to-cloud.component";
import {SendToApprovalComponent} from "../../task/send-to-approval/send-to-approval.component";
import {SendToYardApprovalComponent} from "../../task/send-to-yard-approval/send-to-yard-approval.component";
import {ChangeResponsibleComponent} from "../../task/change-responsible/change-responsible.component";
import {UserCardComponent} from "../../employees/user-card/user-card.component";
import {CreateTaskComponent} from "../../create-task/create-task.component";
import {CreateCheckListComponent} from "../../task/create-check-list/create-check-list.component";
import * as props from "../../../props";
import {AcceptToWorkComponent} from "../../task/accept-to-work/accept-to-work.component";
import {AssignToResponsibleComponent} from "../../task/assign-to-responsible/assign-to-responsible.component";
import {ActivatedRoute, Router} from "@angular/router";
import {SubscribeForNotificationsComponent} from "../subscribe-for-notifications/subscribe-for-notifications.component";

@Component({
  selector: 'app-question-details',
  templateUrl: './question-details.component.html',
  styleUrls: ['./question-details.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class QuestionDetailsComponent implements OnInit {

  issue: Issue = new Issue();
  message = '';
  comment = false;
  messageFilter = 'all';
  issueRevisions = ['-', 'A', 'B', 'C', 'D', '0', '1', '2', '3', '4']
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
  // @ts-ignore
  editorDescription;
  showHistory = ['_taskStatus'];
  availableActions: any[] = [];
  taskDepartments: string[] = [];
  taskPriorities: LV[] = [];
  taskPeriods: LV[] = [];
  taskProjects: string[] = [];
  issueNameEdit = false;
  startDate: Date = new Date();
  dueDate: Date = new Date();
  contractDueDate: Date = new Date();
  today: Date = new Date();
  collapsed: string[] = [];
  issueTypes: IssueType[] = [];
  quillModulesDescription =
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
                  newDelta.retain(this.editorDescription.getSelection().index);
                  newDelta.insert({image: res.url});
                  this.editorDescription.updateContents(newDelta, 'user');
                  this.editorDescription.setSelection(this.editorDescription.getLength());
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
  dragOver = false;
  checked = false;
  viewers: MenuItem[] = [{
    label: 'File',
    items: [
      {label: 'New', icon: 'pi pi-plus'},
      {label: 'Open', icon: 'pi pi-download'}
    ]
  },
    {
      label: 'Edit',
      items: [
        {label: 'Undo', icon: 'pi pi-refresh'},
        {label: 'Redo', icon: 'pi pi-repeat'}
      ]
    }];
  selectedChecks: any = [];
  groupedChecks: any[] = [];
  ready = Object({model: 0, drawing: 0, nesting: 0});

  constructor(public t: LanguageService, private config: PrimeNGConfig, private messageService: MessageService, private dialogService: DialogService, public issueManager: IssueManagerService, public auth: AuthManagerService, private confirmationService: ConfirmationService, private appRef: ApplicationRef, private route: ActivatedRoute, private router: Router) { }

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
  onFilesDrop(event: DragEvent) {
    event.preventDefault();
    // @ts-ignore
    this.handleFileInput(event.dataTransfer.files);
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

    this.route.queryParams.subscribe(params => {
      if (params.id != null){
        this.issueManager.getIssueDetails(params.id).then(issue => {
          this.issue = issue;
          console.log(issue);
          this.issueManager.getIssueDepartments().then(departments => {
            this.taskDepartments = departments;
          });
          this.issueManager.getIssueProjects().then(projects => {
            this.taskProjects = projects.filter((x: any) => x.pdsp != '').map(x => x.pdsp);
          });
          this.issueManager.getIssuePeriods().then(periods => {
            periods.filter(x => x.project == this.issue.project).forEach(x => {
              this.taskPeriods.push(new LV(this.issueManager.localeTaskPeriod(x.name), x.name));
            });
          });
          this.issueManager.getTaskPriorities().then(priorities => {
            priorities.forEach(priority => {
              this.taskPriorities.push(new LV(this.issueManager.localeTaskPriority(priority), priority));
            });
          });
          this.issueManager.getIssueTypes().then(res => {
            this.issueTypes = res;
          });
          this.startDate = this.issue.start_date != 0 ? new Date(this.issue.start_date) : new Date();
          this.dueDate = this.issue.due_date != 0 ? new Date(this.issue.due_date) : new Date();
          this.availableActions = this.getAvailableActions(this.issue);
        });
      }
    });





  }
  close(){
    this.router.navigate(['qna']);
  }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear() + ' ' + date.getHours() + ':' + ('0' + (date.getMinutes())).slice(-2);
  }
  quillCreatedDescription(event: any) {
    this.editorDescription = event;
  }
  quillCreated(event: any) {
    this.editor = event;
  }
  localeMonth(month: number) {
    switch (month){
      case 1: return 'января';
      case 2: return 'февраля';
      case 3: return 'марта';
      case 4: return 'апреля';
      case 5: return 'мая';
      case 6: return 'июня';
      case 7: return 'июля';
      case 8: return 'августа';
      case 9: return 'сентября';
      case 10: return 'октября';
      case 11: return 'ноября';
      case 12: return 'декабрь';
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
      allow = action.rule.includes('g') && this.auth.getUser().groups.includes(issue.issue_type) || allow;
      allow = action.rule.includes('h') ? issue.child_issues.length == 0 && allow : allow;
      allow = action.rule.includes('n') ? issue.child_issues.length != 0 && allow : allow;
      allow = action.rule.includes('f') ? issue.first_send_date != 0 && allow : allow;
      allow = action.rule.includes('d') ? issue.delivered_date != 0 && allow : allow;
      allow = action.rule.includes('c') ? issue.child_issues.filter(x => x.status != 'Approved').length == 0 && allow : allow;
      allow = action.rule.includes('t') ? issue.labor != 0 && allow : allow;
      if (allow){
        res.push({label: action.action, value: action.action});
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
    message.file_attachments = this.loaded;

    // @ts-ignore
    this.issueManager.setIssueMessage(this.issue.id, message).then(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
      });
    });
    this.comment = false;
  }
  trimFileName(input: string, length: number = 10): string{
    let split = input.split('.');
    let name = split[0];
    let extension = split[1];
    if (name.length > length){
      return name.substr(0, length - 2) + '..' + name.substr(name.length - 2, 2) + '.' + extension;
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
          else{
            this.handleFileInput(event.dataTransfer.files);
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

    });
  }
  openLaboriousness(){
    this.dialogService.open(LaboriousnessComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.messageService.add({key:'task', severity:'success', summary:'Set Labor', detail:'You have successfully updated issue labor.'});
        this.issueManager.getIssueDetails(this.issue.id).then(issue => {
          this.issue = issue;
          this.availableActions = this.getAvailableActions(issue);
        });
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
    this.issueManager.getIssueDetails(this.issue.id).then(issue => {
      if (this.issue.status != issue.status){
        this.messageService.add({key:'task', severity:'error', summary:'Update', detail:'This task has been already changed before you have made some changes. Please refresh this page and try again.', life: 8000});
        return;
      }
      else{
        if (value == 'AssignedTo'){
          this.assignTask();
        }
        else if (value == 'Send to Approval'){
          if (this.issue.first_local_approval_date != 0){
            this.dialogService.open(ConfirmAlreadyExistSendToApprovalComponent, {
              showHeader: false,
              modal: true,
              data: this.issue
            }).onClose.subscribe(res => {
              if (res == 'yes'){
                this.issue.status = 'Send to Approval';
                this.issue.action = 'Send to Approval';
                this.statusChanged();
              }
              else if (res == 'no'){
                this.askForSendToApproval();
              }
            });
          }
          else{
            this.askForSendToApproval();
          }
        }
        else if (value == 'Paused'){
          this.issue.assigned_to = '';
          this.issueManager.updateIssue(this.auth.getUser().login, "hidden", this.issue).then(() => {
            this.issue.status = value;
            this.issue.action = value;
            this.statusChanged();
          });
        }
        else if (value == 'Delivered' || value == 'New Revision'){
          this.issue.delivered_date = new Date().getTime();
          this.issueManager.updateIssue(this.auth.getUser().login, 'hidden', this.issue).then(() => {
            this.issue.revision = '0';
            this.issueManager.updateIssue(this.auth.getUser().login, 'hidden', this.issue).then(() => {
              this.issue.status = 'Delivered';
              this.issue.action = this.issue.status;
              this.statusChanged();
            });
          });
          // this.askForSendToCloud();
        }
        else if (value == 'Recovery'){
          this.issue.status = 'New';
          this.issue.action = 'New';
          this.statusChanged();
        }
        else if (value == 'Send to Yard Approval'){
          if (this.issue.first_send_date == 0){
            this.issue.first_send_date = new Date().getTime();
          }
          this.issueManager.updateIssue(this.auth.getUser().login, "hidden", this.issue).then(() => {
            this.issue.status = 'Send to Yard Approval';
            this.issue.action = this.issue.status;
            this.statusChanged();
          });
          // if (this.issue.first_send_date != 0){
          //   this.dialogService.open(ConfirmAlreadyExistSendToYardComponent, {
          //     showHeader: false,
          //     modal: true,
          //     data: this.issue
          //   }).onClose.subscribe(res => {
          //     if (res == 'yes'){
          //       this.issue.status = 'Send to Yard Approval';
          //       this.issue.action = 'Send to Yard Approval';
          //       this.statusChanged();
          //     }
          //     else if (res == 'no'){
          //       this.askForSendToYardToApproval();
          //     }
          //   });
          // }
          // else{
          //   this.askForSendToYardToApproval();
          // }
        }
        else if (value == 'Reject' && this.issue.issue_type == 'DEVELOPMENT'){
          this.issue.responsible = '';
          this.issueManager.updateIssue(this.auth.getUser().login, "hidden", this.issue).then(() => {
            this.issue.status = 'Rejected';
            this.issue.action = 'Rejected';
            this.statusChanged();
          });
        }
        else if (value == 'Accept' && this.issue.issue_type == 'DEVELOPMENT'){
          this.askForAcceptToWork()
        }
        else if (value == 'To publish' && this.issue.issue_type == 'DEVELOPMENT'){
          this.assignToResponsible()
        }
        else{
          this.issue.status = value;
          this.issue.action = value;
          this.statusChanged();
        }
      }
    });
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
  askForSendToYardToApproval(){
    this.dialogService.open(SendToYardApprovalComponent, {
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
    if (this.edit == 'contractDueDate'){
      this.issue.contract_due_date = this.contractDueDate.getTime();
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

  openIssue(id: number) {
    window.open('/?taskId=' + id, '_blank');
  }

  copyIssueUrl() {
    navigator.clipboard.writeText(location.origin + '/qna-details?id=' + this.issue.id);
    this.messageService.add({key:'task', severity:'success', summary:'Ссылка скопирована', detail:'Вы скопировали ссылку на вопрос.'});
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

  getNoneZeroResult(input: string) {
    return input.length == 0 ? '<div class="text-none">Нет</div>' : input;
  }
  getNoneZeroInput(input: string) {
    return input == '-' ? '<div class="text-none">Нет</div>' : input;
  }

  getDateOnly(dateLong: number): string{
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
    // let date = new Date(dateLong);
    // let ye = new Intl.DateTimeFormat('ru', { year: '2-digit' }).format(date);
    // let mo = new Intl.DateTimeFormat('ru', { month: '2-digit' }).format(date);
    // let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
    // return da + '.' + mo + '.' + ye;
  }

  createChildIssue() {
    let issue = new Issue();
    issue.parent_id = this.issue.id;
    issue.project = this.issue.project;
    issue.doc_number = this.issue.doc_number;
    //issue.name = this.issue.name;
    issue.department = this.issue.department;
    issue.for_revision = this.issue.revision;
    this.newTask(issue);
  }

  getIssuesOfType(child_issues: Issue[], issue_type: string) {
    return child_issues.filter(x => x.issue_type == issue_type);
  }

  newTask(issue: object | null) {
    this.dialogService.open(CreateTaskComponent, {
      showHeader: false,
      modal: true,
      data: issue
    }).onClose.subscribe(() => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
        this.availableActions = this.getAvailableActions(issue);
      });
    });
  }

  createCheckList() {
    this.dialogService.open(CreateCheckListComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe((res) => {
      if (res == 'save'){
        this.issueManager.setIssueChecks(this.issue.id, this.issue.checks).then(() => {
          this.issueManager.getIssueDetails(this.issue.id).then(issue => {
            this.issue = issue;
            this.availableActions = this.getAvailableActions(issue);
          });
        });
      }
    });
  }



  setIssueReady(number: number, value: number) {
    let ready = this.issue.ready.split('|');
    if (number == 0){
      this.issue.ready = (value.toString()) + '' + ready[1] + '' + ready[2];
    }
    else if (number == 1){
      this.issue.ready = ready[0] + '' + (value.toString()) + ready[2] + '';
    }
    else if (number == 2){
      this.issue.ready = ready[0] + '' + ready[1] + '' + (value.toString());
    }
    this.issueManager.updateIssue(this.auth.getUser().login, 'hidden', this.issue).then(() => {
      this.issueManager.setIssueViewed(this.issue.id, this.auth.getUser().login).then(() => {
        this.messageService.add({key:'task', severity:'success', summary:'Set Labor', detail:'You have successfully updated issue.'});
      });
    });
  }
  viewTask(issueId: number, project: string, docNumber: string, department: string) {
    let foranProject = project.replace('NR', 'N');
    switch (department) {
      case 'Hull': window.open(`/hull-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank'); break;
      case 'Pipe': window.open(`/pipe-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank'); break;
      case 'Devices': window.open(`/device-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank'); break;
      default: break;
    }
  }

  dingUser(user: string) {
    let message = 'Пользователь ' + this.auth.getUserName(this.auth.getUser().login) + ' просит обратить внимание на задачу ' + `<${props.baseUrl}/?taskId=${this.issue.id}| ${this.issue.name}>`;
    this.issueManager.dingUser(user, message).then(res => {});
    this.messageService.add({key:'task', severity:'success', summary:'Send notification', detail:'You have send notification to ' + this.auth.getUserName(user) + ' via RocketChat.'});
  }

  isVisible(value: string) {
    return this.issueTypes.find(x => x.type_name == this.issue.issue_type && x.visible_row.includes(value));
  }
  changePreparedness(){
    return this.auth.getUser().login != this.issue.responsible && this.auth.getUser().login != this.issue.assigned_to;
  }

  nonZero(number: number) {
    return number >= 0 ? number : 0;
  }
  limitPreparedness(number: number){
    if (number < 0){
      return 0;
    }
    else if (number > 100){
      return 100;
    }
    else{
      return number;
    }
  }

  updatePreparedness() {
    this.issue.ready = [this.ready.model, this.ready.drawing, this.ready.nesting].join('|');
    this.issueManager.updateIssue(this.auth.getUser().login, 'hidden', this.issue).then(() => {
      this.issueManager.setIssueViewed(this.issue.id, this.auth.getUser().login).then(() => {
        this.messageService.add({key:'task', severity:'success', summary:'Set Labor', detail:'You have successfully updated issue.'});
      });
    });
  }

  askForAcceptToWork() {
    this.dialogService.open(AcceptToWorkComponent, {
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

  assignToResponsible() {
    this.dialogService.open(AssignToResponsibleComponent, {
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

  subscribeForNotifications() {
    this.dialogService.open(SubscribeForNotificationsComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {

    });
  }
}
