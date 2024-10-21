import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Issue} from "../../domain/classes/issue";
import {Router} from "@angular/router";
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import { MessageService} from "primeng/api";
import _ from "underscore";
import {Table} from "primeng/table";
import * as XLSX from "xlsx";
import {LV} from "../../domain/classes/lv";
import {UntieComponent} from "../task/untie/untie.component";
import {DownloadAllDocsComponent} from "./download-all-docs/download-all-docs.component";
import {DialogService} from "primeng/dynamicdialog";
import * as events from "events";
import {TaskComponent} from "../task/task.component";

@Component({
  selector: 'app-doclist',
  templateUrl: './doclist.component.html',
  styleUrls: ['./doclist.component.css']
})
export class DoclistComponent implements OnInit {

  projects: any[] = [];
  project: any;
  department: string = '';
  //departments: string[] = ['Hull', 'System', 'Devices', 'Trays', 'Cables', 'Electric', 'Accommodation' ];
  departments: any[] = [];
  selectedDepartments: string[] = [];
  selectedTaskTypes: string[] = [];
  selectedProjects: string[] = [];
  selectedTaskStages: string[] = [];
  issuesSrc: Issue[] = [];
  issues: Issue[] = [];
  issuesCorrection: any[] = [];
  filters:  { status: any[],  revision: any[], department: any[] } = { status: [], revision: [], department: [] };
  projectNames: any[] = [];
  taskType = '';
  taskTypes: LV[] = ['RKD', 'PDSP', 'ED', 'PSD', 'ITT', 'MSH'].map(x => new LV(this.issueManagerService.localeTaskType(x), x));
  taskStages: LV[] = [];
  statuses: any[] = [];
  contracts: any[] = [];
  status = '';
  showWithFilesOnly = true;
  loading = true;
  revisionFiles: any[] = [];
  zipDocsUrl = '';
  searchValue = '';



  constructor(private router: Router, public t: LanguageService, public issueManager: IssueManagerService, public auth: AuthManagerService, private issueManagerService: IssueManagerService,
              private messageService: MessageService, private dialogService: DialogService, public cd: ChangeDetectorRef) { }


  @ViewChild('table') table: Table;


  ngOnInit(): void {
    console.log(this.auth.getUser().permissions)
    this.selectedTaskTypes = this.taskTypes.map(x => x.value);
    // this.issueManager.getIssueProjects().then(projects => {
    //   this.projects = projects;
    //   this.projects.forEach((x: any) => x.label = this.getProjectName(x));
    //   this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x.name));
    //   this.selectedProjects = [...this.projects.map(x => x.name)];
    //   this.selectedProjects = localStorage.getItem('selectedProjects') != null ? JSON.parse(localStorage.getItem('selectedProjects')!) : this.selectedProjects;
    //   this.showWithFilesOnly = localStorage.getItem('showWithFilesOnly') != null ? localStorage.getItem('showWithFilesOnly')! == 'true' : this.showWithFilesOnly;
    // });
    this.loading = true;

    setTimeout(() => {
      this.cd.detach();
    }, 100);

    this.issueManager.getIssues('op').then(res => {
      // console.log(res.find(x => x.id == 17974))
      // this.statuses = _.sortBy(_.uniq(res.map(x => x.status)).filter(x => x != ''), x => x);

      this.issuesSrc = res.filter(x => this.selectedTaskTypes.find(y => x.issue_type.includes(y)) != null).sort((a, b) => a.id > b.id ? 1 : -1);
      this.issuesSrc = this.issuesSrc.filter(x => this.auth.getUser().visible_projects.includes(x.project)).sort((a, b) => a.id > b.id ? 1 : -1);


      this.issueManager.getIssuesCorrection().subscribe(res => {
        this.issuesCorrection = res.filter(x => x.count!=0).sort((a, b) => a.id > b.id ? 1 : -1);
        // console.log(this.issuesCorrection)
        this.issuesSrc = this.addCorrection(this.issuesSrc, this.issuesCorrection)
        console.log(this.issuesSrc)
      })

      this.issues = this.issuesSrc;
      console.log("typeof this.issuesSrc[1].contract_due_date")
      console.log(typeof this.issuesSrc[1].contract_due_date)
      this.statuses = this.getFilters(this.issues, 'status');
      this.contracts = _.sortBy(_.uniq(this.issues.map(x => x.contract)).filter(x => x != ''), x => x);
      // console.log(this.issues)
      this.issueManager.getRevisionFiles().then(revisionFiles => {
        this.revisionFiles = revisionFiles;
        this.filterIssues();
        this.loading = false;
        this.cd.reattach();
      });

      this.projects = _.sortBy(_.uniq(this.issues.map(x => x.project)), x => x).map(x => new LV(x));
      this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x.label));


      this.selectedProjects = localStorage.getItem('selectedProjects') != null ? JSON.parse(localStorage.getItem('selectedProjects')!) : this.selectedProjects;
      this.showWithFilesOnly = localStorage.getItem('showWithFilesOnly') != null ? localStorage.getItem('showWithFilesOnly')! == 'true' : this.showWithFilesOnly;

      if (this.selectedProjects.length > this.projects.length){
        this.selectedProjects = this.projects.map(x => x.value);
        localStorage.setItem('selectedProjects', JSON.stringify(this.projects.map(x => x.value)));
      }
      if (this.selectedProjects.length == 0){
        localStorage.setItem('selectedProjects', JSON.stringify(this.projects.map(x => x.value)));
      }
      if (this.selectedProjects.find(x => !this.auth.getUser().visible_projects.includes(x)) != null){
        localStorage.setItem('selectedProjects', JSON.stringify(this.projects.map(x => x.value)));
      }

      this.departments = _.sortBy(_.uniq(this.issues.map(x => x.department)), x => x).map(x => new LV(x));
      this.selectedDepartments = [...this.departments.map(x => x.name)];
      this.selectedDepartments = localStorage.getItem('selectedDepartments') != null ? JSON.parse(localStorage.getItem('selectedDepartments')!) : this.selectedDepartments;


      this.taskStages = _.sortBy(_.uniq(this.issues.map(x => x.period)), x => this.getNumber(x)).map(x => new LV(x));
      this.selectedTaskStages = this.taskStages.map(x => x.value);
      this.selectedTaskStages = localStorage.getItem('selectedTaskStages') != null ? JSON.parse(localStorage.getItem('selectedTaskStages')!) : this.selectedTaskStages;



    });
    // this.issueManager.getDepartments().subscribe(departments => {
    //   this.departments = departments.filter(x => x.visible_documents == 1);
    //   this.selectedDepartments = [...this.departments.map(x => x.name)];
    //   this.selectedDepartments = localStorage.getItem('selectedDepartments') != null ? JSON.parse(localStorage.getItem('selectedDepartments')!) : this.selectedDepartments;
    // });
  }

  getFilteredData() {
    console.log(this.table.filteredValue)
    return this.table.filteredValue;
  }

  getFilters(issues: any[], field: string): any[] {
    let res: any[] = [];
    let uniq = _.uniq(issues, x => x[field]);
    uniq.forEach(x => {
      res.push({
        label: this.localeFilter(field, x[field]),
        value: x[field]
      })
    });
    return _.sortBy(res, x => x.label.toString().replace('Не назначен', '0').replace('Not assigned', '0'));
  }

  localeFilter(column: string, field: string): string {
    switch (column) {
      case 'issue_type':
        return this.issueManager.localeTaskType(field);
      case 'started_by':
        return this.auth.getUserName(field);
      case 'assigned_to':
        return this.auth.getUserName(field);
      case 'responsible':
        return this.auth.getUserName(field);
      case 'priority':
        return this.issueManager.localeTaskPriority(field);
      case 'status':
        return this.issueManager.localeStatus(field, false);
      default:
        return field;
    }
  }

  openIssueModal(id: number) {
    console.log(id)
    console.log("openIssue")
    this.issueManager.getIssueDetails(id).then(res => {
      console.log(res);
      if (res.id != null) {
        this.dialogService.open(TaskComponent, {
          showHeader: false,
          modal: true,
          data: res
        })
      }
    });
    return false
  }

  addCorrection(arr1: any[], arr2: any[]) {
    return arr1.map(item1 => {
      item1.contract_due_date = new Date(item1.contract_due_date)
      item1.last_update = new Date(item1.last_update)
      const matchingItem = arr2.find(item2 => item2.id === item1.id);
      // console.log(matchingItem)
      if (matchingItem) {
        // Если найден элемент с таким же id, добавляем поле correction с значением 1
        return { ...item1, correction: true, max_due_date: matchingItem.max_due_date };
      } else {
        // Если не найден, добавляем поле correction с значением 0
        return { ...item1, correction: false };
      }
    });
  }

  getNumber(text: string){
    let r = new RegExp('\\d+');
    let res = r.test(text) ? r.exec(text)![0] : '0';
    while (res.length < 4){
      res = '0' + res;
    }
    return res;
  }
  getProjectName(project: any){
    let res = project.name;
    if (project.rkd != ''){
      res += ' (' + project.rkd + ')';
    }
    return res;
  }
  projectChanged() {
    localStorage.setItem('selectedProjects', JSON.stringify(this.selectedProjects));
    localStorage.setItem('showWithFilesOnly', this.showWithFilesOnly ? 'true' : 'false');
    this.filterIssues();
  }
  exportXLS() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = [];
    let exportedArray = []
    if (this.getFilteredData()) {
      exportedArray = this.getFilteredData()
    } else
      exportedArray = this.issues

    exportedArray.filter((x: any) => x != null).forEach(issue => {
      data.push({
        'Doc number': issue.doc_number,
        'Title': issue.name,
        'Type': issue.issue_type,
        'Project': issue.project,
        'Contract': issue.contract,
        'Department': issue.department,
        'Status': issue.status,
        'Revision': issue.revision,
        'Stage': issue.period,
        'Contract due date': this.getDateOnly(issue.contract_due_date),
        'Last update': this.getDateOnly(issue.last_update),
        'Note': issue.issue_comment,
        'Comment': issue.author_comment,
        'Correction': issue.correction
      })
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    XLSX.writeFile(workbook, fileName);
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
  getDateOnly(dateLong: number): string {
    if (dateLong == 0){
      return '--/--/--';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }


  viewTask(issueId: number, project: string, docNumber: string, department: string, assistant: string) {
    console.log(issueId)
    let foranProject = project.replace('NR', 'N');
    let findProject = this.projectNames.find((x: any) => x != null && (x.name == project || x.pdsp == project || x.rkd == project));
    if (findProject != null){
      foranProject = findProject.foran;
    }
    // console.log(department);
    // console.log(project);

    if (this.selectedDepartments.includes(assistant)){
      department = assistant;
    }

    let hullTasks = ['200101-452-001'];
    if (hullTasks.includes(docNumber)){
      department = 'Hull';
    }

    switch (department) {
      case 'Hull': window.open(`/hull-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'System': window.open(`/pipe-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Devices': window.open(`/device-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Trays': window.open(`/trays?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Cables': window.open(`/cables?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Electric': window.open(`/electric-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Accommodation': window.open(`/accommodation-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Design': window.open(`/design-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'General': window.open(`/general-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      default: break;
    }
  }
  filterIssues(){
    this.selectedProjects = localStorage.getItem('selectedProjects') != null ? JSON.parse(localStorage.getItem('selectedProjects')!) : this.selectedProjects;
    this.selectedDepartments = localStorage.getItem('selectedDepartments') != null ? JSON.parse(localStorage.getItem('selectedDepartments')!) : this.selectedDepartments;
    this.selectedTaskTypes = localStorage.getItem('selectedTaskTypes') != null ? JSON.parse(localStorage.getItem('selectedTaskTypes')!) : this.selectedTaskTypes;
    this.selectedTaskStages = localStorage.getItem('selectedTaskStages') != null ? JSON.parse(localStorage.getItem('selectedTaskStages')!) : this.selectedTaskStages;
    this.showWithFilesOnly = localStorage.getItem('showWithFilesOnly') != null ? localStorage.getItem('showWithFilesOnly')! == 'true' : this.showWithFilesOnly;


    this.issues = [...this.issuesSrc];
    this.issues = this.issues.filter(issue => !this.showWithFilesOnly || this.revisionFiles.find((x: any) => issue.id == x.issue_id) != null);
    this.issues = this.issues.filter(x => this.selectedProjects.includes(x.project));

    this.issues = this.issues.filter(x => this.selectedDepartments.includes(x.department) || this.selectedDepartments.includes(x.assistant));
    this.issues = this.issues.filter(x => this.selectedTaskTypes.find(y => x.issue_type.includes(y)) != null);
    this.issues = this.issues.filter(x => this.selectedTaskStages.includes(x.period));
    this.issues = this.issues.filter(x => (x.id + x.doc_number + x.name))
    // this.issues = _.sortBy(this.issues, x => x.doc_number);

    setTimeout(() => {
      if (this.searchValue != ''){
        this.table.filterGlobal(this.searchValue, 'contains');
      }
    }, 100);
  }

  copyUrl(issueId: number, project: string, docNumber: string, department: string){
    let foranProject = project.replace('NR', 'N');
    navigator.clipboard.writeText(location.origin + `/esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`);
    this.messageService.add({key:'doclist', severity:'success', summary:'Copied', detail:'You have copied document url.'});
  }

  departmentChanged() {
    localStorage.setItem('selectedDepartments', JSON.stringify(this.selectedDepartments));
    this.filterIssues();
  }

  taskTypeChanged() {
    localStorage.setItem('selectedTaskTypes', JSON.stringify(this.selectedTaskTypes));
    this.filterIssues();
  }

  getDate(dateLong: number): string {
    if (dateLong == 0) {
      return '--/--/--';
    }
    if (!dateLong) {
      return '';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

  greenCorrectionSign(correctionDate: number): boolean {
    let today = new Date()
    if (correctionDate == 0) {
      return true
    }
    // @ts-ignore
    if (correctionDate > today) {
      return true
    }
    return false
  }



  taskStagesChanged() {
    localStorage.setItem('selectedTaskStages', JSON.stringify(this.selectedTaskStages));
    this.filterIssues();
  }

  hasFiles(issue: Issue) {
    return this.revisionFiles.filter(x => x.issue_id == issue.id).length;
  }

  // downloadAllDocsOld() {
  //   this.loading = true;
  //   this.zipDocsUrl = '';
  //   this.issueManager.downloadAllDocs(this.issues.map(x => x.id)).subscribe(res => {
  //     this.loading = false;
  //     this.zipDocsUrl = res;
  //   });
  // }

  downloadAllDocs() {
    this.dialogService.open(DownloadAllDocsComponent, {
      showHeader: false,
      modal: true,
      data: [this.issues.map(x => x.id)]
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.messageService.add({key:'doclist', severity:'success', summary:'Please wait.', detail:'Your operation is being processed, please wait for email.'});
      }
    });
  }

  openUrl(url: string) {
    window.open(url);
  }
}
