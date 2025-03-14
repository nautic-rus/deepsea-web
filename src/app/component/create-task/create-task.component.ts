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
import {LV} from "../../domain/classes/lv";
import {PrimeNGConfig} from "primeng/api";
import {lab, nice} from "d3";
import _ from "underscore";
export class CheckIssue{
  docNumber: string;
  issueType: string;
  constructor(docNumber: string, issueType: string) {
    this.docNumber = docNumber;
    this.issueType = issueType;
  }
}

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
  onlyManagers: User[] = [];
  hideUsers = true;
  itUsers: User[] = [];
  itTypes: string[] = ['BUG', 'FEATURE', 'REQUIREMENTS'];
  selectedItType: string = '';
  startDate: Date = new Date();
  dueDate: Date = new Date(this.startDate.getTime() + 259200000);
  contractDueDate: Date = new Date(this.startDate.getTime() + 259200000);
  today: Date = new Date();
  taskProjects: string[] = [];
  taskProjectsFullInfo: any[] = [];
  taskContracts: string[] = [];
  taskContract: string = '';
  sfiCodes: LV[] = [];
  taskDepartments: string[] = [];
  taskPeriods: LV[] = [];
  taskPeriod: string = new LV('-').value;
  // taskPeriods: LV[] = [new LV('-'), new LV('Stage 1'), new LV('Stage 2'), new LV('Stage 3'), new LV('Stage 4'), new LV('Stage 5'), new LV('Stage 6'), new LV('Stage 7'), new LV('Stage 8')];
  // taskPeriod: string = this.taskPeriods[0].value;
  taskTypes: any[] = [];
  taskPriorities: any[] = [];
  assignedToUser = '';
  responsibleUser = '';
  planLabor = 0;
  selectedUsers: string[] = [];
  awaitForLoad: string[] = [];
  taskProject = '-';
  taskProjectId: number | null = null;
  sfiCode = '';
  taskType = 'IT';
  taskPriority = '';
  loaded: FileAttachment[] = [];
  taskStart: any;
  dragOver = false;
  image = '';
  showImages = false;
  parent_id = 0;
  action = '';
  // @ts-ignore
  editor;
  // @ts-ignore
  @ViewChild('img') img;
  // @ts-ignore
  wz;
  reasonOfModification = '';
  modificationOfExisting = 'no';
  modificationDescription = '';
  reasonsOfChange: any[] = [];
  yesNo: any[] = [new LV(this.changeLang('Yes'), 'Yes'), new LV(this.changeLang('No'), 'No')];
  checkIssues: CheckIssue[] = [];
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
  constructor(private config: PrimeNGConfig, public t: LanguageService, public issues: IssueManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, private appRef: ApplicationRef, public conf: DynamicDialogConfig) { }
  ngOnInit(): void {
    // this.getProjectId('NR002');


    this.issue = this.conf.data[0] as Issue;
    this.action = this.conf.data[1];
    this.config.setTranslation({
      dayNamesMin: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
      weekHeader: "№",
      monthNames: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
    });
    this.issues.getIssues('op').then(res => {
      this.checkIssues = _.uniq(res.map(x => new CheckIssue(x.doc_number, x.issue_type))).filter(x => x.docNumber != '');
    });
    //this.users = this.auth.users;
    this.users = this.getUsers();
    if (this.auth.getUser().groups.includes('Chief of Department')){
      this.onlyManagers = this.users.filter(x => x.groups.includes('Managers'));
    }
    else{
      this.onlyManagers = this.users.filter(x => x.groups.includes('Chief of Department'));
    }
    this.itUsers = this.users.filter(x => x.department == 'IT');
    this.issues.getIssueTypes().then(types => {
      // console.log("this.issues.getIssueTypes()");
      // console.log(types);
      types.filter(x => this.action == '' ? x.visibility_main_form == 1 : x.visibility_subtask == 1).forEach(type => {
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
        if (type.type_name == 'PSD' && !this.auth.hasPerms('create_psd_task')){
          allow = false;
        }
        if (type.type_name == 'ED' && !this.auth.hasPerms('create_ed_task')){
          allow = false;
        }
        if (type.type_name == 'ITT' && !this.auth.hasPerms('create_itt_task')){
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
    this.issues.getReasonsOfChange().then(reasons => {
      this.reasonsOfChange = reasons;
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
      this.taskProjectsFullInfo = projects;
      this.taskProjects = projects.map((x: any) => x.name).filter(x => x != '' && this.auth.getUser().visible_projects.includes(x));
      if (this.taskProjects.length > 0 && this.taskProject == '-') {
        this.taskProject = this.taskProjects[0];
      }
      this.issues.getProjectContracts(this.taskProject).subscribe(taskContracts => {
        this.taskContracts = ['-'].concat(taskContracts);
      });
    });
    // this.taskPeriods.splice(0, this.taskPeriods.length);
    // this.issues.getIssuePeriods().then(periods => {
    //   periods.filter(x => x.project == this.taskProject).forEach(period => {
    //     this.taskPeriods.push({label: this.issues.localeTaskPeriod(period.name), value: period.name});
    //   });
    //   if (this.taskPeriods.length > 0) {
    //     this.taskPeriod = this.taskPeriods[0].value;
    //   }
    // });

    this.sfiCodes.splice(0, this.sfiCodes.length);
    this.issues.getSfiCodes().then(sfiCodes => {
      console.log(sfiCodes);
      sfiCodes.map(x => new LV(this.t.language == 'ru' ? (x.code + ' - ' + x.ru) : (x.code + ' - ' + x.en), x.code)).forEach(sfiCode => {
        this.sfiCodes.push(sfiCode);
      });
      if (this.sfiCodes.length > 0) {
        this.sfiCode = this.sfiCodes[0].value;
      }
    });

    this.issues.getDepartments().subscribe(departments => {
      this.taskDepartments = departments.filter(x => x.visible_task == 1).map(x => x.name);
      this.taskDepartment = '-';
    });

    let issue = this.conf.data[0] as Issue;
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

  // getProjectId(projectName: String) {  //mine
  //   this.issues.getProjectNamesD().subscribe((res) => {
  //     console.log(res)
  //   })
  // }
  //
  // async getProjectId(projectName: string) {  //mine
  //   const projectId = await this.issues.getProjectIdByName(projectName);
  //   if (projectId) {
  //     this.taskProjectId = projectId;
  //   } else {
  //     this.taskProjectId = null;
  //   }
  // }

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
    issue.due_date = 0;
    //issue.due_date = this.dueDate.getTime();;
    issue.department = this.taskDepartment;
    issue.doc_number = this.taskDocNumber;
    issue.responsible = this.responsibleUser;
    issue.period = this.taskPeriod;
    issue.started_by = this.auth.getUser().login;
    issue.sfi_code = this.sfiCode;
    issue.status = 'New';
    issue.action = 'New';
    issue.for_revision = this.for_revision;
    issue.parent_id = this.action == 'child' ? this.parent_id : 0;
    issue.plan_hours = this.planLabor;
    issue.reason_of_changes = this.reasonOfModification;
    issue.modification_of_existing = this.modificationOfExisting ? 1 : 0;
    issue.modification_description = this.modificationDescription;
    issue.contract = this.taskContract;
    issue.it_type = this.selectedItType
    console.log(issue.it_type)
    if (!issue.issue_type.includes('RKD') && !issue.issue_type.includes('ED') && !issue.issue_type.includes('PDSP')  && !issue.issue_type.includes('PSD') && !issue.issue_type.includes('OR') && !issue.issue_type.includes('IZ')){
      issue.doc_number = '';
    }
    if (issue.issue_type == 'IT'){
      issue.department = 'IT';
    }
    if (issue.issue_type == 'APPROVAL'){
      issue.doc_number = '';
    }
    if (issue.issue_type == 'APPROVAL'){
      // @ts-ignore
      this.selectedUsers.forEach(user => {
        issue.file_attachments = this.loaded;
        issue.responsible = user;
        this.issues.startIssue(issue).then(res => {
          console.log('this.issues.startIssue(issue)')
          console.log(res);
          if (this.action == 'combine'){
            this.issues.combineIssues(this.parent_id, +res, this.auth.getUser().login);
          }
          this.issues.setIssueViewed(+res, this.auth.getUser().login).then(() => {
            this.ref.close(res);
          });
        });
      });
    }
    else {
      // @ts-ignore
      issue.file_attachments = this.loaded;
      this.issues.startIssue(issue).then(res => {
        console.log('this.issues.startIssue(issue)')
        console.log(res);
        console.log(issue)
        if (this.action == 'combine'){
          this.issues.combineIssues(this.parent_id, +res, this.auth.getUser().login);
        }
        this.issues.setIssueViewed(+res, this.auth.getUser().login).then(() => {
          this.ref.close(res);
        });
      });
    }
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
    let desc = this.taskDetails == null ? '' : this.taskDetails;
    // console.log(this.responsibleUser);
    let taskExists = this.checkIssues.find(x => x.docNumber == this.taskDocNumber && x.issueType == this.taskType) != null;
    switch (this.taskType) {
      case 'IT': return this.taskSummary.trim() == '' || desc.trim() == '' || this.selectedItType == '' || this.awaitForLoad.filter(x => !this.isLoaded(x)).length > 0;
      case 'RKD': return this.taskDocNumber.trim() == '' || this.taskSummary.trim() == '' || desc.trim() == '' || this.responsibleUser == '' || this.taskDocNumber == '' || taskExists || this.docNumberExist();
      case 'PDSP': return this.taskDocNumber.trim() == '' || this.taskSummary.trim() == '' || desc.trim() == '' || this.responsibleUser == '' || this.taskDocNumber == '' || taskExists || this.docNumberExist();
      case 'ED': return this.taskDocNumber.trim() == '' || this.taskSummary.trim() == '' || desc.trim() == '' || this.responsibleUser == '' || this.taskDocNumber == '' || taskExists || this.docNumberExist();
      case 'PSD': return this.taskDocNumber.trim() == '' || this.taskSummary.trim() == '' || desc.trim() == '' || this.responsibleUser == '' || this.taskDocNumber == '' || taskExists || this.docNumberExist();
      case 'ITT': return this.taskDocNumber.trim() == '' || this.taskSummary.trim() == '' || desc.trim() == '' || this.responsibleUser == '' || this.taskDocNumber == '' || taskExists || this.docNumberExist();
      case 'RKD-T': return this.taskDocNumber.trim() == '' || this.taskSummary.trim() == '' || this.responsibleUser == '' || taskExists || this.docNumberExist();
      case 'OTHER': return this.taskSummary.trim() == '' || this.responsibleUser == '' || this.responsibleUser == null || desc.trim() == '';
      case 'DEVELOPMENT': return  this.taskSummary.trim() == '' || desc.trim() == '' ;
      case 'NON-PROJECT': return  this.taskSummary.trim() == '' || desc.trim() == '' || this.responsibleUser == '' || this.responsibleUser == null;
      case 'APPROVAL': return  this.taskSummary.trim() == '' || desc.trim() == '' || this.selectedUsers.length == 0;
      case 'CORRECTION': return this.taskDepartment.trim() == '' || this.modificationDescription == '' || this.taskDocNumber.trim() == '' || this.responsibleUser == '';
      default: return false;
    }
  }

  docNumberExist() {
    if (this.taskDocNumber === '-')
      return true
    let a = this.checkIssues.find(x => x.docNumber === this.taskDocNumber.toString())

    if (a) {
      // console.log(a)
      return true;
    } else {
      // console.log("Element not found")
      return false;
    }
  }

  quillCreated(event: any) {
    this.editor = event;
  }

  getUsers() {
    return this.auth.users.filter(x => x.visibility.includes('c'));
  }

  taskTypeChanged() {
    this.taskProjectChanged();
    // if (this.taskType == 'RKD' || this.taskType == 'PDSP'){
    //   this.taskProject = this.taskProjects[1];
    //   this.taskProjectChanged();
    // }

    // this.assignedToUser = this.auth.getUser().login;
    // this.responsibleUser = this.auth.getUser().login;
  }

  fillStageOptions() {
    this.taskPeriods = [];
    let prId = this.taskProjectsFullInfo.find(project  => project.name === this.taskProject).id;  //находим айди выбранного проекта чтлбы получить допустимые
    this.issues.getIssueStagesByProject(prId).subscribe(res => {
      res.forEach(x => {
        if (x.issue_type === this.taskType) {
          this.taskPeriods.push(new LV(x.stage_name));
        }
      })
      console.log(this.taskPeriods);
      this.taskPeriods = _.sortBy(this.taskPeriods,  x => {
        let r = new RegExp('\\d+');
        let sort = r.test(x.value) ? r.exec(x.value)![0] : '';
        console.log(sort);
        return +sort;
      });
      console.log(this.taskPeriods);
    });
  }

  taskProjectChanged() {

    // this.taskPeriods.splice(0, this.taskPeriods.length);
    // this.issues.getIssuePeriods().then(periods => {
    //   periods.filter(x => x.project == this.taskProject).forEach(period => {
    //     this.taskPeriods.push({label: this.issues.localeTaskPeriod(period.name), value: period.name});
    //   });
    //   if (this.taskPeriods.length > 0) {
    //     this.taskPeriod = this.taskPeriods[0].value;
    //   }
    // });

    this.issues.getProjectContracts(this.taskProject).subscribe(taskContracts => {
      this.taskContracts = ['-'].concat(taskContracts);
    });
    this.fillStageOptions();
    this.sfiCodeChanged();
  }
  sfiCodeChanged(){
    //this.taskDocNumber = this.taskProject + '-' + this.sfiCode + '-';
  }

  changeLang(label: string) {
    if (this.t.language == 'ru'){
      return label.replace('Yes', 'Да').replace('No', 'Нет');
    }
    else {
      return label;
    }
  }

  userDepartment() {
    let findUser = this.users.find(x => x.login == this.selectedUsers[0]);
    if (findUser != null){
      this.taskDepartment = findUser.department;
    }
  }
}
