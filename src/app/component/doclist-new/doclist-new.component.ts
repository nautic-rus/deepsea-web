import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import * as events from "events";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {Issue} from "../../domain/classes/issue";
import {LanguageService} from "../../domain/language.service";
import * as XLSX from "xlsx";
import {Table} from "primeng/table";
import {DownloadAllDocsComponent} from "../doclist/download-all-docs/download-all-docs.component";
import {DialogService} from "primeng/dynamicdialog";
import {MessageService} from "primeng/api";
import _ from "underscore";
import {TaskComponent} from "../task/task.component";

@Component({
  selector: 'app-doclist-new',
  templateUrl: './doclist-new.component.html',
  styleUrls: ['./doclist-new.component.css']
})
export class DoclistNewComponent implements OnInit {

  // projects: string[] = ["NR002", "170707", "170701", '123']
  projects: any[] = [];
  selectedProjects: string[] | null= [];
  selectedProjectsLength: number | undefined = 0;
  issuesSrc: any[] = [];
  issuesCorrection: any[] = [];
  revisionFiles: any[] = [];
  dep: any[] = [];

  //for filters
  contracts: any[] = [];
  statuses: any[] = [];
  department: any[] = [];
  issue_types: any[] = [];
  revisions: any[] = [];
  periods: any[] = []; //stages

  cols: any[];
  searchValue = '';

  _selectedColumns: any[];




  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }
  constructor(public issueManager: IssueManagerService, private messageService: MessageService, private dialogService: DialogService,  public auth: AuthManagerService, public t: LanguageService) { }

  @ViewChild('tableDoclist') table: Table;
  ngOnInit(): void {
    this.cols = [
      { field: 'id', header: 'Id', sort: true, width: '60px', visible: true},
      { field: 'doc_number', header: 'Номер чертежа', sort: true, width: '140px', visible: true},
      { field: 'issue_name', header: 'Название' , sort: true, width: '250px', visible: true},
      { field: 'issue_type', header: 'Тип' , sort: true, width: '150px', visible: true},
      { field: 'project', header: 'Проект', sort: true, width: '150px', visible: true},
      { field: 'contract', header: 'Договор', sort: true, width: '150px', visible: true},
      { field: 'department', header: 'Отдел', sort: true , width: '150px', visible: true},
      { field: 'status', header: 'Статус', sort: true, width: '150px', visible: this.auth.getUser().permissions.includes('visible_doc_status') },
      { field: 'revision', header: 'Ревизия', sort: true, width: '150px', visible: true },
      { field: 'period', header: 'Этап', sort: true, width: '150px', visible: true },
      { field: 'contract_due_date', header: 'Срок исполнения', sort: true, width: '150px', visible: true },
      { field: 'issue_comment', header: 'Комментарий',sort: true, width: '150px', visible: this.auth.getUser().permissions.includes('visible_doc_comment') },
      { field: 'author_comment', header: 'Комментарий автора',sort: true, width: '150px', visible: this.auth.getUser().permissions.includes('visible_doc_comment_auth') },
      { field: 'correction', header: 'Корректировка',sort: true, width: '200px', visible: this.auth.getUser().permissions.includes('visible_doc_correction') },
      { field: 'fileData', header: 'Файл', sort: true, width: '150px', visible: true  },
    ];
    setTimeout(() => {
      this.cols = this.cols.filter(col => {
        return col.visible;
      });
      this.table.filterGlobal(null, 'contains');
    }, 100);


    // this._selectedColumns = this.cols;
    if (localStorage.getItem("selectedColumnsDoclist")) {
      // @ts-ignore
      this._selectedColumns = JSON.parse(localStorage.getItem("selectedColumnsDoclist"))
      if (!this.auth.getUser().permissions.includes('visible_doc_status')) {
        this._selectedColumns = this._selectedColumns.filter(x => x.field != 'status');
      }
      if (!this.auth.getUser().permissions.includes('visible_doc_comment')) {
        this._selectedColumns = this._selectedColumns.filter(x => x.field != 'issue_comment');
      }
      if (!this.auth.getUser().permissions.includes('visible_doc_comment_auth')) {
        this._selectedColumns = this._selectedColumns.filter(x => x.field != 'author_comment');
      }
      if (!this.auth.getUser().permissions.includes('visible_doc_correction')) {
        this._selectedColumns = this._selectedColumns.filter(x => x.field != 'correction');
      }
    } else {
      this._selectedColumns = this.cols;
      localStorage.setItem("selectedColumnsDoclist", JSON.stringify(this._selectedColumns));
    }

    this.issueManager.getProjectNamesD().subscribe((res) => {
      res.forEach(i => {
        if (i.name != 'NR004') {
          this.projects.push(i.name);
        }
      })
    })

    this.fill()

    this.selectedProjects?.forEach(project => {
      this.showProjectIssues(project);
    })

  }

  set selectedColumns(val: any[]) {
    this._selectedColumns.splice(0, this._selectedColumns.length);
    val.forEach(col => {
        this._selectedColumns.push(col);
    });
    localStorage.setItem("selectedColumnsDoclist", JSON.stringify(this._selectedColumns));
  }

  openIssueModal(id: number) {
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
    return false;
  }


  showProjectIssues(project: string) {
    this.issueManager.getDoclistByProject(project).subscribe(res => {
      this.issuesSrc.push(...res);
      this.issuesSrc = this.issuesSrc.filter((x: { project: string; }) => this.auth.getUser().visible_projects.includes(x.project)).sort((a: { id: number; }, b: { id: number; }) => a.id > b.id ? 1 : -1);

      this.issueManager.getIssuesCorrection().subscribe(res => {
        this.issuesCorrection = res.filter(x => x.count!=0).sort((a, b) => a.id > b.id ? 1 : -1);
        this.issuesSrc = this.addCorrection(this.issuesSrc, this.issuesCorrection);
        this.contracts = _.sortBy(_.uniq(this.issuesSrc.map(x => x.contract)).filter(x => x != ''), x => x);
        this.issue_types = _.sortBy(_.uniq(this.issuesSrc.map(x => x.issue_type)).filter(x => x != ''), x => x);
        this.statuses = this.getFilters(this.issuesSrc, 'status');
        this.department = _.sortBy(_.uniq(this.issuesSrc.map(x => x.department)).filter(x => x != ''), x => x);
        this.revisions = _.sortBy(_.uniq(this.issuesSrc.map(x => x.revision)).filter(x => x != ''), x => x).sort((a, b) => a - b);
        this.periods = _.sortBy(_.uniq(this.issuesSrc.map(x => x.period)).filter(x => x != ''), x => x).sort((a, b) => parseInt(a.split(" ")[1]) - parseInt(b.split(" ")[1]));
      })

      this.issueManager.getRevisionFiles().then(revisionFiles => {
        this.revisionFiles = revisionFiles;
        this.issuesSrc.forEach(x => {
          x.fileData = this.getFilesData(x);
        })
      });
    })
  }

  addCorrection(arr1: any[], arr2: any[]) {
    return arr1.map(item1 => {
      item1.contract_due_date = new Date(item1.contract_due_date);
      item1.last_update = new Date(item1.last_update);
      const matchingItem = arr2.find(item2 => item2.id === item1.id);
      if (matchingItem) {
        // Если найден элемент с таким же id, добавляем поле correction с значением 1
        return { ...item1, correction: true, max_due_date: matchingItem.max_due_date };
      } else {
        // Если не найден, добавляем поле correction с значением 0
        return { ...item1, correction: false };
      }
    });
  }

  fill() {
    // @ts-ignore
    this.selectedProjects = localStorage.getItem('selectedProjectsDoclist').split(',');
    this.selectedProjectsLength = this.selectedProjects?.length;
  }

  projectChanged(e:any) {
    // @ts-ignore
    localStorage.setItem('selectedProjectsDoclist', this.selectedProjects);
    // @ts-ignore
    if (this.selectedProjectsLength < e.value.length) {  //то есть мы выбрали еще один, то
      // console.log("Добавляю новое")
      this.showProjectIssues(e.itemValue);
    } else {  //то есть мы удалили
      // console.log("Удаляю данные проекта " + e.itemValue)
      this.issuesSrc = this.issuesSrc.filter(x => x.project != e.itemValue);
    }
    this.fill()
  }

  viewTask(issueId: number, project: string, docNumber: string, department: string, assistant: string) {
    let foranProject = project.replace('NR', 'N');
    let findProject = this.projects.find((x: any) => x != null && (x.name == project || x.pdsp == project || x.rkd == project));
    if (findProject != null) {
      foranProject = findProject.foran;
    }

    if (this.dep.includes(assistant)){
      department = assistant;
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
      return true;
    }
    // @ts-ignore
    if (correctionDate > today) {
      return true;
    }
    return false;
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

  getFilesData(issue: any) {
    let arr: any[] = this.revisionFiles.filter(x => x.issue_id == issue.id);
    if (arr.length) {
      let max = 0;
      arr.forEach(i => {
        if (i.upload_date > max) {
          max = i.upload_date;
        }
      })
      issue.hasFiles = true;
      return max;
    } else {
      issue.hasFiles = false;
      return null;
    }

  }


  hasFiles(issue: Issue) {
    let arr: any[] = this.revisionFiles.filter(x => x.issue_id == issue.id);
    if (arr.length) {
      let max = 0;
      arr.forEach(i => {
        if (i.upload_date > max) {
          max = i.upload_date;
        }
      })
      return this.getDate(max);
    } else
      return null;
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

  cleanFilter() {
    this.table.clear();
    this.table.reset();
    this.table.clearState();
  }

  exportXls() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let issues = this.table.filteredValue;
    if (this.table.filteredValue == null) {
      issues = this.issuesSrc;
    }
    let data: any[] = [];
    let cols = this.selectedColumns.map(x => x.field);
    data.push(this.selectedColumns.map(x => x.header));
    issues.forEach(issue => {
      let newIssue: Issue = JSON.parse(JSON.stringify(issue));
      let rowData: any[] = [];
      let findSrc = this.issuesSrc.find(x => x.id == newIssue.id);

      cols.forEach(c => {
        // console.log(c)
        if (findSrc != null && c != 'correction' && c != 'fileData') {
          // @ts-ignore
          newIssue[c] = findSrc[c];
          // @ts-ignore
          rowData.push(this.localeColumnForPDF(newIssue[c], c));
        }
        // @ts-ignore
        if (c == 'correction') {
          // @ts-ignore
          rowData.push(this.localeColumnForPDF(newIssue[c], c, newIssue.max_due_date));
        }

        if (c == 'fileData') {
          // @ts-ignore
          rowData.push(this.localeColumnForPDF(newIssue[c], c));
        }

      });
      //console.log(rowData)
      data.push(rowData);
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    XLSX.writeFile(workbook, fileName);
  }

  localeColumnForPDF(issueElement: string, field: string, coreectionDate?: any): string {
    if (field == 'started_by') {
      return this.auth.getUserName(issueElement);
    } else if (field == 'assigned_to') {
      return this.auth.getUserName(issueElement);
    } else if (field == 'status') {
      return this.issueManager.localeStatus(issueElement, false);
    } else if (field == 'started_date') {
      return this.getDateOnly(+issueElement);
    } else if (field == 'issue_type') {
      return this.issueManager.localeTaskType(issueElement);
    } else if (field == 'name') {
      return issueElement;
    } else if (field == 'priority') {
      return this.issueManager.localeTaskPriority(issueElement);
    } else if (field == 'department') {
      return this.issueManager.localeTaskDepartment(issueElement);
    } else if (field == 'due_date') {
      return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
    } else if (field == 'contract_due_date') {
      return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
    } else if (field == 'last_update') {
      return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
    }  else if (field == 'fileData') {
      return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
    }
    else if (field == 'responsible') {
      return this.auth.getUserName(issueElement);
    } else if (field == 'doc_number') {
      return issueElement != '' ? issueElement : '-';
    } else if (field == 'issue_comment') {
      return issueElement.replace(/<[^>]+>/g, '');
    } else if (field == 'correction') {
      return this.formatExcelCorrection(issueElement, coreectionDate)
    } else {
      return issueElement;
    }
  }

  formatExcelCorrection(issueElement: string,  coreectionDate: any): string {
    // @ts-ignore
    if (issueElement === true) {
      let d = this.getDate(coreectionDate);
      if (d === '--/--/--') {
        return 'Планируется';
      } else return 'Планируется ' + d;
    } else {
      return '';
    }
  }

  downloadAllDocs() {
    this.dialogService.open(DownloadAllDocsComponent, {
      showHeader: false,
      modal: true,
      data: [this.issuesSrc.map(x => x.id)]
    }).onClose.subscribe(res => {
      if (res == 'success') {
        this.messageService.add({key:'doclist', severity:'success', summary:'Please wait.', detail:'Your operation is being processed, please wait for email.'});
      }
    });
  }
}
