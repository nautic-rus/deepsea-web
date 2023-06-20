import {ApplicationRef, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Issue} from "../../domain/classes/issue";
import * as _ from 'underscore';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {IssueMessage} from "../../domain/classes/issue-message";
import {FileAttachment} from "../../domain/classes/file-attachment";
import {mouseWheelZoom} from "mouse-wheel-zoom";
import {ConfirmationService, MenuItem, MessageService, PrimeNGConfig} from "primeng/api";
import {VarMap} from "../../domain/classes/var-map";
import Delta from "quill-delta";
import {AssignComponent} from "./assign/assign.component";
import {SendToApprovalComponent} from "./send-to-approval/send-to-approval.component";
import {ChangeResponsibleComponent} from "./change-responsible/change-responsible.component";
import {SendToCloudComponent} from "./send-to-cloud/send-to-cloud.component";
import {DeleteComponent} from "./delete/delete.component";
import {LV, LVn} from "../../domain/classes/lv";
import {LanguageService} from "../../domain/language.service";
import {UserCardComponent} from "../employees/user-card/user-card.component";
import {SendToYardApprovalComponent} from "./send-to-yard-approval/send-to-yard-approval.component";
import {ConfirmAlreadyExistComponent} from "./confirm-already-exist/confirm-already-exist.component";
import {ConfirmAlreadyExistSendToApprovalComponent} from "./confirm-already-exist-send-to-approval/confirm-already-exist-send-to-approval.component";
import {LaboriousnessComponent} from "./laboriousness/laboriousness.component";
import {ConfirmAlreadyExistSendToYardComponent} from "./confirm-already-exist-send-to-yard/confirm-already-exist-send-to-yard.component";
import {CreateTaskComponent} from "../create-task/create-task.component";
import {CreateCheckListComponent} from "./create-check-list/create-check-list.component";
import {IssueCheck} from "../../domain/classes/issue-check";
import * as props from "../../props";
import {IssueType} from "../../domain/classes/issue-type";
import {AcceptToWorkComponent} from "./accept-to-work/accept-to-work.component";
import {AssignToResponsibleComponent} from "./assign-to-responsible/assign-to-responsible.component";
import {CombineIssuesComponent} from "./combine-issues/combine-issues.component";
import {AssignResponsibleComponent} from "../qna/assign-responsible/assign-responsible.component";
import {AssignQuestionComponent} from "../qna/assign-question/assign-question.component";
import {Router} from "@angular/router";
import {concat, forkJoin} from "rxjs";
import {ConsumedHour} from "../work-hours/work-hours.component";
import {ConsumedDetailsComponent} from "./consumed-details/consumed-details.component";

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TaskComponent implements OnInit {
  issue: Issue = new Issue();
  message = '';
  answerMessage = '';
  answerMessageBeforeEdit = '';
  answerFiles: FileAttachment[] = [];
  comment = false;
  answer = false;
  messageFilter = 'all';
  issueRevisions = ['-', 'A', 'B', 'C', 'D', '0', '1', '2', '3', '4']
  awaitForLoad: string[] = [];
  loaded: FileAttachment[] = [];
  edit = '';
  updated = false;
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
  // @ts-ignore
  editorAnswer;
  showHistory = ['_taskStatus'];
  availableActions: any[] = [];
  reasonsOfChange: any[] = [];
  taskDepartments: string[] = [];
  userDepartments: any[] = [];
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
  yesNo: any[] = [new LVn('Yes', 1), new LVn('No', 0)];
  planned: any[];
  quillModulesModificationDescription =
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
  quillModulesAnswer =
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
  issueProjects: any[] = [];
  consumed: ConsumedHour[] = [];

  constructor(public t: LanguageService, private config: PrimeNGConfig, public ref: DynamicDialogRef, private messageService: MessageService, private dialogService: DialogService, public conf: DynamicDialogConfig, public issueManager: IssueManagerService, public auth: AuthManagerService, private confirmationService: ConfirmationService, private appRef: ApplicationRef, public router: Router) { }

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
    this.issue = this.conf.data as Issue;
    let findAnswer = this.issue.messages.filter(x => x.prefix == 'answer');
    if (findAnswer.length > 0){
      this.answerMessage = findAnswer[findAnswer.length - 1].content;
      this.answerFiles = findAnswer[findAnswer.length - 1].file_attachments;
      console.log(this.answerMessage);
    }

    this.auth.getPlannedHours().subscribe(res => {
      this.planned = res;
    });
    this.auth.getConsumedPlanHours(0).subscribe(consumed => {
      this.consumed = consumed;
    });
    this.selectedChecks = this.issue.checks.filter(x => x.check_status != 0).map(x => x.check_description);

    this.issueManager.getIssueProjects().then(projects => {
      this.issueProjects = projects;
      this.issueManager.getDepartments().subscribe(userDepartments => {
        this.userDepartments = userDepartments;
        this.availableActions = this.getAvailableActions(this.issue);
      });
    });

    this.issueManager.getReasonsOfChange().then(reasons => {
      this.reasonsOfChange = reasons;
    });

    this.issueManager.getIssueDepartments().then(departments => {
      this.taskDepartments = departments;
    });

    // this.issueManager.getIssueProjects().then(projects => {
    //   this.taskProjects = projects.filter((x: any) => x.pdsp != '').map(x => x.pdsp);
    // });
    this.issueManager.getIssueProjects().then(projects => {
      this.taskProjects = projects.map((x: any) => x.name);
      // if (this.taskProjects.length > 0 && this.taskProject == '-') {
      //   this.taskProject = this.taskProjects[0];
      // }
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

    let readySplit = this.issue.ready.split('|');
    if (this.issue.ready.includes('|')){
      this.ready.model = +readySplit[0];
      this.ready.drawing = +readySplit[1];
      this.ready.nesting = +readySplit[2];
    }

    this.fillGroupedChecks();
  }
  close(){
    this.ref.close(this.updated ? 'updated' : 'exit');
  }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear() + ' ' + date.getHours() + ':' + ('0' + (date.getMinutes())).slice(-2);
  }
  quillCreatedDescription(event: any) {
    this.editorDescription = event;
  }
  quillCreatedAnswer(event: any) {
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
    issue.messages.filter(x => x.prefix != 'answer').forEach(x => res.push(x));
    issue.history.forEach(x => res.push(x));
    // @ts-ignore
    return _.sortBy(res, x => x.date != null ? x.date : x.update_date).reverse();
  }

  getAvailableActions(issue: Issue) {
    const res: any[] = [];
    issue.actions.forEach(action => {
      let allow = false;
      let isManager = false;
      let issueDep = this.userDepartments.find(x => x.name == issue.department);
      if (issueDep != null){
        isManager = issueDep.manager.includes(this.auth.getUser().login);
      }
      allow = action.rule.includes('r') && (issue.responsible == this.auth.getUser().login || isManager) || allow;
      allow = action.rule.includes('a') && issue.assigned_to == this.auth.getUser().login || allow;
      allow = action.rule.includes('s') && issue.started_by == this.auth.getUser().login || allow;
      allow = action.rule.includes('g') && this.auth.getUser().groups.includes(issue.issue_type) || allow;
      allow = action.rule.includes('h') ? issue.child_issues.length == 0 && allow : allow;
      allow = action.rule.includes('n') ? issue.child_issues.length != 0 && allow : allow;
      allow = action.rule.includes('f') ? issue.first_send_date != 0 && allow : allow;
      allow = action.rule.includes('d') ? issue.delivered_date != 0 && allow : allow;
      allow = action.rule.includes('c') ? issue.child_issues.filter(x => x.status != x.closing_status).length == 0 && allow : allow;
      allow = action.rule.includes('t') ? issue.labor != 0 && allow : allow;
      allow = action.rule.includes('m') ? this.issueProjects.find(x => x.name == issue.project).managers.includes(this.auth.getUser().login) || allow : allow;


      if (issue.issue_type == 'QNA' && this.auth.getUser().login == 'stropilov'){
        allow = true;
      }
      if (allow){
        res.push({label: this.issueManager.localeStatusAsButton(action.action, false), value: action.action});
      }
    });
    return _.uniq(res,x => x.value);
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
  showAnswer() {
    this.answer = true;
    this.answerMessageBeforeEdit = this.answerMessage;
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
  sendAnswer() {
    let message = new IssueMessage();
    message.author = this.auth.getUser().login;
    message.content = this.answerMessage;
    message.prefix = 'answer';
    message.file_attachments = this.loaded;

    // @ts-ignore
    this.issueManager.setIssueMessage(this.issue.id, message).then(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
      });
    });
    this.answer = false;
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
  trimFileAnswerName(input: string, length: number = 20): string{
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
  editorClicked(event: any, allowEdit = true) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target.localName == 'img'){
      this.showImage(event.target.currentSrc);
      //window.open(event.target.currentSrc);
    }
    else if (event.target.localName == 'a'){
      window.open(event.target.href, '_blank');
    }
    else if (this.isEditable() && allowEdit){
      this.edit = 'description';
    }
  }
  editorModificationClicked(event: any){
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
      this.edit = 'modification_description';
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
  openLaboriousness(){
    this.dialogService.open(LaboriousnessComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.messageService.add({key:'task', severity:'success', summary:'Set Man Hours', detail:'You have successfully updated issue man hours.'});
        this.issueManager.getIssueDetails(this.issue.id).then(issue => {
          this.issue = issue;
          this.availableActions = this.getAvailableActions(issue);
        });
      }
      this.updated = true;
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
      res = this.t.language == 'ru' ? 'Не назначен' : 'Not assigned';
    }
    return res;
  }
  getDueDate(date: number){
    return date == 0 ? '-' : this.getDate(date);
  }

  changeStatus(value: string) {
    let assignedTo = this.issue.assigned_to;
    this.issueManager.getIssueDetails(this.issue.id).then(issue => {
      if (this.issue.status != issue.status){
        this.messageService.add({key:'task', severity:'error', summary:'Update', detail:'This task has been already changed before you have made some changes. Please refresh this page and try again.', life: 8000});
        return;
      }
      else{
        if (value == 'AssignedTo'){
          if (this.issue.issue_type == 'QNA'){
            this.assignQNATask();
          }
          else{
            this.assignTask();
          }
        }
        else if (value == 'Assign responsible'){
          this.assignQNAResponsible();
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
        else if (value == 'Check' || value == 'Paused' || this.issue.closing_status.includes(value)){
          this.updated = true;
          let findUser = this.auth.users.find(x => x.login == assignedTo);
          if (findUser != null){
            this.auth.getConsumedPlanHours(findUser.id).subscribe(consumed => {
              this.auth.getUsersPlanHours(findUser!.id, 0, 1).subscribe(userPlanHours => {
                let userPlanHoursToday = _.sortBy(userPlanHours.filter(x => x.day == this.today.getDate() && x.month == this.today.getMonth() && x.year == this.today.getFullYear() && x.hour_type == 1), x => x.id);
                if (userPlanHoursToday.length > 0){
                  let consumedByTask = consumed.filter(x => x.task_id == this.issue.id && userPlanHoursToday.map(y => y.id).includes(x.hour_id));
                  let latestConsumed = userPlanHoursToday[0].id;
                  let plannedHours = _.sortBy(userPlanHours.filter((x: any) => x.id >= latestConsumed).filter(x => x.task_id != 0), x => x.id);
                  if (consumedByTask.length > 0){
                    latestConsumed = _.sortBy(consumedByTask, x => x.hour_id).reverse()[0].hour_id;
                    plannedHours = _.sortBy(userPlanHours.filter((x: any) => x.id > latestConsumed).filter(x => x.task_id != 0), x => x.id);
                  }
                  let taskHours = plannedHours.filter(x => x.task_id == this.issue.id);
                  if (consumedByTask.length == 0){
                    if (!confirm('Несписанные часы на задачу будут убраны из плана, подтверждаете действие?')){
                      return;
                    }
                    //this.messageService.add({key:'task', severity:'error', summary:'Ошибка', detail:'Вы не списали сегодня часы на эту задачу. Необходимо списать использованные часы, затем перевести задачу в другой статус. Несписанные часы будут убраны из плана'});
                    //return;
                  }
                  if (this.issue.closing_status.includes(value)){
                    let plan = issue.plan_hours;
                    let consumed = this.consumed.filter(x => x.task_id == issue.id).length;
                    if (consumed < plan){
                      this.auth.savePlanHours(findUser!.id, issue.id, consumed - plan, plan).subscribe(res => {
                        console.log(res);
                      });
                    }
                  }
                  if (taskHours.length > 0){
                    this.auth.deleteUserTask(findUser!.id, this.issue.id, taskHours[0].id).subscribe(() => {
                      let assign: any[] = [];
                      _.forEach(_.groupBy(plannedHours.filter(x => x.task_id != this.issue.id), x => x.task_id), group => {
                        assign.push({task: group[0].task_id, hours: group.length, min: _.sortBy(group, y => y.id)[0].id});
                      });
                      assign = _.sortBy(assign, x => x.min);
                      console.log(assign);
                      forkJoin(assign.map(x => this.auth.deleteUserTask(findUser!.id, x.task, latestConsumed))).subscribe({
                        next: value => {
                          concat(assign.reverse().map((x: any) => this.auth.planUserTask(findUser!.id, x.task, latestConsumed, x.hours, 0).subscribe())).subscribe();
                        }
                      });
                    });
                  }
                  if (value == 'Paused'){
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
                  }
                  else{
                    this.issue.status = value;
                    this.issue.action = value;
                    this.statusChanged();
                  }
                }
              });
            });
          }
          else{
            this.issue.status = value;
            this.issue.action = value;
            this.statusChanged();
          }
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
  commitIssueEdit(event: MouseEvent) {
    this.updated = true;
    if (this.edit == 'plan_hours' && !event.ctrlKey){
      if (this.issue.plan_hours_locked == 1){
        this.messageService.add({key:'task', severity:'error', summary:'Update', detail:'The amount of planned hours is locked'});
        this.cancelIssueEdit();
        return;
      }
      let find = this.planned.find(x => x.taskId == this.issue.id);
      if (find != null){
        if (find.hours > this.issue.plan_hours){
          this.messageService.add({key:'task', severity:'error', summary:'Update', detail:'The amount of planned hours is less then amount of you entered'});
          this.cancelIssueEdit();
          return;
        }
      }
    }
    console.log(this.issue.modification_of_existing);
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
    if (this.issue.issue_type == 'QNA'){
      navigator.clipboard.writeText(location.origin + '/qna?taskId=' + this.issue.id);
    }
    else{
      navigator.clipboard.writeText(location.origin + '?taskId=' + this.issue.id);
    }
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
  trimMin(input: string, length: number = 35): string {
    if (input.length <= length) {
      return input;
    } else {
      return input.substr(0, length) + '...';
    }
  }

  isEditable() {
    let isManager = false;
    let issueDep = this.userDepartments.find(x => x.name == this.issue.department);
    if (issueDep != null){
      isManager = issueDep.manager.includes(this.auth.getUser().login);
    }
    return this.auth.getUser().login == this.issue.started_by || this.auth.getUser().login == this.issue.responsible || isManager;
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
    this.newTask(issue, 'child');
  }

  getIssuesOfType(child_issues: Issue[], issue_type: string) {
    return child_issues.filter(x => x.issue_type == issue_type);
  }

  newTask(issue: object | null, action: string) {
    this.dialogService.open(CreateTaskComponent, {
      showHeader: false,
      modal: true,
      data: [issue, action]
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
            this.fillGroupedChecks();
          });
        });
      }
    });
  }

  fillGroupedChecks() {
    this.groupedChecks.splice(0, this.groupedChecks.length);
    _.forEach(_.groupBy(_.sortBy(this.issue.checks, c => c.id + '-' + c.sort), x => x.check_group), x => {
      this.groupedChecks.push(x);
    });
  }

  setChecked(check: any) {
    let newStatus = check.check_status == 1 ? 0 : 1;
    check.check_status = newStatus;
    let issueCheck = this.issue.checks.find(x => x.check_description == check.check_description && x.check_group == check.check_group);
    if (issueCheck != null){
      this.issue.checks[this.issue.checks.indexOf(issueCheck)].check_status = newStatus;
      this.issueManager.updateIssueCheck(this.issue.id, this.auth.getUser().login, issueCheck.check_description, issueCheck.check_group, newStatus).then(() => {
      });
    }
  }

  isDisabledStatus(value: string) {
    let res = false;
    if (value == 'Check' && (this.issue.checks.find(x => x.check_status == 0) != null)){
      res = true;
    }
    return res;
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
  viewTask(issueId: number, project: string, docNumber: string, department: string, assistant: string) {
    let foranProject = project.replace('NR', 'N');
    this.issueManager.getProjectNames().then(projectNames => {
      let findProject = projectNames.find((x: any) => x.pdsp == project || x.rkd == project);
      if (findProject != null){
        foranProject = findProject.foran;
      }
      switch (department) {
        case 'Hull': window.open(`/hull-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'System': window.open(`/pipe-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'Devices': window.open(`/device-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'Electric': window.open(`/electric-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'Accommodation': window.open(`/accommodation-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'General': window.open(`/general-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        default: break;
      }
      switch (assistant) {
        case 'Hull': window.open(`/hull-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'System': window.open(`/pipe-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'Devices': window.open(`/device-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'Electric': window.open(`/electric-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'Accommodation': window.open(`/accommodation-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'General': window.open(`/general-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        default: break;
      }
    });
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

  createCombined() {
    let issue = new Issue();
    issue.parent_id = this.issue.id;
    issue.project = this.issue.project;
    issue.doc_number = this.issue.doc_number;
    //issue.name = this.issue.name;
    issue.department = this.issue.department;
    issue.for_revision = this.issue.revision;
    this.newTask(issue, 'combine');
  }

  assignQNAResponsible() {
    this.dialogService.open(AssignResponsibleComponent, {
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

  assignQNATask() {
    this.dialogService.open(AssignQuestionComponent, {
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

  addCombinedIssue() {
    this.dialogService.open(CombineIssuesComponent, {
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

  formatChanges(rChange: string) {
    let find = this.reasonsOfChange.find(x => x.value == rChange);
    if (find != null){
      return find.label;
    }
    else{
      return '';
    }
  }

  commentDone() {

  }

  goToPlan(taskId: number) {
    this.ref.close();
    this.router.navigate(['work-hours'], {queryParams: {taskId}});
  }

  getConsumedHours() {
    return this.consumed.filter(x => x.task_id == this.issue.id).length;
  }

  openConsumedDetails() {
    this.dialogService.open(ConsumedDetailsComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {

    });
  }
}
