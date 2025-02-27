import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {LanguageService} from "../../domain/language.service";
import {User} from "../../domain/classes/user";
import _, {any, uniq} from "underscore";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {UserCardComponent} from "../employees/user-card/user-card.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {TaskAssignComponent} from "./task-assign/task-assign.component";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {MenuItem} from "primeng/api";
import {ContextMenu} from "primeng/contextmenu";
import {LV} from "../../domain/classes/lv";
import {ShowTaskComponent} from "../navi/daily-tasks/show-task/show-task.component";
import {TaskComponent} from "../task/task.component";
import {Issue} from "../../domain/classes/issue";
import {DailyTask} from "../../domain/interfaces/daily-task";
import {concatAll, zipAll} from "rxjs/operators";
import {concat, forkJoin} from "rxjs";
import {ActivatedRoute} from "@angular/router";

export interface PlanHour{
  day: number;
  month: number;
  year: number;
  hour_type: number;
  day_type: number;
  day_of_week: number;
  user: number;
  id: number;
  task_id: number;
}
export interface ConsumedHour{
  id: number;
  hour_id: number;
  user_id: number;
  date_inserted: number;
  date_consumed: number;
  date_created: number;
  task_id: number;
  comment: string;
  amount: number;
  task: any;
}
export interface PlannedHours{
  taskId: number;
  hours: number;
}
export interface PlanDay{
  day: number;
  month: number;
  year: number;
  day_type: number;
  planHours: PlanHour[];
}
export interface TaskOfDay{
  taskId: number;
  planHours: PlanHour[];
  tooltip: string;
  consumedAmount: number;
}
@Component({
  selector: 'app-work-hours',
  templateUrl: './work-hours.component.html',
  styleUrls: ['./work-hours.component.css']
})
export class WorkHoursComponent implements OnInit {

  departments: any[] = [];
  department = '';
  today = new Date();
  todayStatic = new Date();
  currentMonth = '';
  currentYear = this.today.getFullYear();
  issues: Issue[] = [];
  issuesSrc: Issue[] = [];
  draggableIssue: Issue;
  draggableEvent: DragEvent;
  dragValue = 0;
  specialDays = [
    Object({day: 3, month: 11, year: 2022, hours: 7}),
    Object({day: 4, month: 11, year: 2022, hours: 0}),
    Object({day: 2, month: 1, year: 2023, hours: 0}),
    Object({day: 3, month: 1, year: 2023, hours: 0}),
    Object({day: 4, month: 1, year: 2023, hours: 0}),
    Object({day: 5, month: 1, year: 2023, hours: 0}),
    Object({day: 6, month: 1, year: 2023, hours: 0}),
    Object({day: 22, month: 2, year: 2023, hours: 7}),
    Object({day: 23, month: 2, year: 2023, hours: 0}),
    Object({day: 24, month: 2, year: 2023, hours: 0}),
    Object({day: 7, month: 3, year: 2023, hours: 7}),
    Object({day: 8, month: 3, year: 2023, hours: 0}),
    Object({day: 1, month: 5, year: 2023, hours: 0}),
    Object({day: 8, month: 5, year: 2023, hours: 0}),
    Object({day: 9, month: 5, year: 2023, hours: 0}),
    Object({day: 12, month: 6, year: 2023, hours: 0}),
    Object({day: 3, month: 11, year: 2023, hours: 7}),
    Object({day: 6, month: 11, year: 2023, hours: 0}),
  ];
  users: User[] = [];
  selectedDepartments: string[] = [];
  items: MenuItem[] = [];
  selectedDay: PlanDay;
  dayHover: any = null;
  userHover: any = null;
  hoverEnabled = true;
  taskOfDay: TaskOfDay;
  searchingIssue: Issue;
  pHours: PlanHour[] = [];
  plannedHours: PlannedHours[] = [];
  userPDays: any = Object();
  headerPDays: PlanDay[] = [];
  loading = false;
  currentDate = new Date();
  stages: string[] = [];
  stage = '';
  taskTypes: string[] = [];
  taskDepartments: string[] = [];
  taskType = '';
  statuses: string[] = [];
  status = '';
  searchValue = '';
  selectedIssue: Issue;
  projects: string[] = ['N002', 'N004', 'P701', 'P707'];
  project = '';
  taskDepartment = '';
  issueSpentTime: DailyTask[] = [];
  showWithoutPlan = false;
  showAssigned = false;
  dragValues = Object();
  vacation = 0;
  medical = 0;
  timeOff = 0;
  studies = 0;
  taskId = 0;
  consumed: ConsumedHour[] = [];
  consumedIds: number[] = [];

  constructor(public route: ActivatedRoute, public issueManager: IssueManagerService, public t: LanguageService, public auth: AuthManagerService, private dialogService: DialogService, private issueManagerService: IssueManagerService, public ref: DynamicDialogRef, public cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.taskId = params.taskId != null ? params.taskId : 0;
    });
    this.loading = true;
    this.fill();
    this.items = [
      // {
      //   label: 'Fold left',
      //   icon: 'pi pi-fw pi-arrow-circle-left',
      //   command: (event: any) => this.foldTaskLeft()
      // },
      {
        label: 'Clear task',
        icon: 'pi pi-fw pi-trash',
        command: (event: any) => this.deleteUserTask()
      },
      {
        label: 'Fold left all',
        icon: 'pi pi-fw pi-arrow-circle-left',
        command: (event: any) => this.foldAllTaskLeft()
      },
    ];
  }
  fill(){
    this.auth.getUsers().then(res => {
      this.users = res.filter(x => x.visibility.includes('k'));
      this.users.forEach(user => user.userName = this.auth.getUserName(user.login));
      this.users = _.sortBy(this.users.filter(x => x.surname != 'surname'), x => x.userName);
      this.issueManager.getDepartments().subscribe(departments => {
        this.departments = departments.filter(x => x.visible_man_hours == 1);
        if (localStorage.getItem('selectedDepartments') != null){
          this.selectedDepartments = JSON.parse(localStorage.getItem('selectedDepartments')!);
        }
        else{
          this.selectedDepartments = [...this.departments.map(x => x.name)];
        }
      });
    });
    this.auth.getUsersPlanHours(0, this.currentDate.getTime()).subscribe(planHours => {
      this.pHours = planHours;
      this.auth.getPlannedHours().subscribe(plannedHours => {
        this.plannedHours = plannedHours;
        this.auth.getConsumedPlanHours(0).subscribe(consumed => {
          this.consumed = consumed;
          this.consumedIds = this.consumed.map(x => x.hour_id);
          // this.plannedHours.forEach(pH => {
          //   pH.hours -= this.consumed.filter(x => x.task_id == pH.taskId).length;
          // })
          this.fillIssues();
          this.fillDays();
        });
      });
    });
  }
  fillIssues(){
    this.issueManagerService.getDailyTasks().then(res => {
      this.issueSpentTime = res;
      this.issueManagerService.getIssues('op').then(res => {
        this.issuesSrc = res;
        this.issues = res.filter(x => ['QNA', 'RKD', 'OTHER', 'CORRECTION', 'IT', 'PDSP', 'ITT'].includes(x.issue_type));
        console.log(this.taskTypes)
        this.issues = _.sortBy(this.issues, x => x.doc_number);
        this.stages = _.sortBy(_.uniq(this.issues.map(x => x.period)).filter(x => x != ''), x => this.sortStage(x));
        this.statuses = _.sortBy(_.uniq(this.issues.map(x => this.issueManagerService.localeStatus(x.status, false))).filter(x => x != ''), x => x);
        this.taskTypes = _.sortBy(_.uniq(this.issues.map(x => x.issue_type)).filter(x => x != ''), x => x);
        this.taskDepartments = _.sortBy(_.uniq(this.issues.map(x => x.department)).filter(x => x != ''), x => x);
        this.issuesSrc.forEach(issue => issue.labor = issue.plan_hours == 0 ? 0 : Math.round(this.getConsumedLabor(issue.id, issue.doc_number) / issue.plan_hours * 100));
        this.statuses = ['-'].concat(this.statuses);
        this.taskTypes = ['-'].concat(this.taskTypes);
        this.issuesSrc.forEach(x => this.dragValues[x.id] = (x.plan_hours - this.getPlanned(x)));
        this.filterIssues();
      });
    });
    this.issueManagerService.getIssueProjects().then(projects => {
      this.projects = projects;
      this.projects.forEach((x: any) => x.label = this.getProjectName(x));
    });
  }
  getConsumedLabor(id: number, doc_number: string) {
    let sum = 0;
    this.issueSpentTime.filter(x => x.issueId == id).forEach(spent => {
      sum += spent.time;
    });
    return sum;
  }
  sortStage(stage: string){
    let r = new RegExp('\\d+');
    return r.test(stage) ? this.addLeftZeros(r.exec(stage)![0]) : stage;
  }
  isCurrentPDay(pDay: PlanDay) {
    return pDay.day == this.todayStatic.getDate() && pDay.month == this.todayStatic.getMonth() && pDay.year == this.todayStatic.getFullYear();
  }

  getUsers(){
    return this.users.filter(x => this.selectedDepartments.includes(x.department));
  }
  selectDay(day: any, user: any) {
    this.setHover(day, user);
    this.selectedDay = day;
    this.userHover = user;
  }

  openTaskAssign() {
    this.dialogService.open(TaskAssignComponent, {
      showHeader: false,
      modal: true,
      data: [this.selectedDay, this.userHover, this.userPDays[this.userHover.id]]
    }).onClose.subscribe(() => {
      this.loading = true;
      this.auth.getUsersPlanHours().subscribe(planHours => {
        this.pHours = planHours;
        this.fillDays();
      });
    });
  }


  setHover(day: any, user: User) {
    // if (!this.hoverEnabled){
    //   return;
    // }
    this.dayHover = day;
    this.userHover = user;
  }

  resetHover() {
    if (!this.hoverEnabled){
      return;
    }
    this.userHover = null;
    this.dayHover = null;
  }

  fillDays() {
    let userPDays: any = Object();
    this.users.forEach(user => {
      let planDays: PlanDay[] = [];
      let userPlanHours = this.pHours.filter(x => x.user == user.id);
      _.forEach(_.groupBy(userPlanHours, x => x.day + '-' + x.month + '-' + x.year), group => {
        planDays.push({day: group[0].day, month: group[0].month, year: group[0].year, day_type: group[0].day_type, planHours: group});
      });
      userPDays[user.id] = _.sortBy(planDays, x => this.addLeftZeros(x.year) + '-' + this.addLeftZeros(x.month) + '-' + this.addLeftZeros(x.day));
      if (planDays.length > this.headerPDays.length){
        this.headerPDays = planDays;
      }
    });
    this.userPDays = userPDays;
    this.loading = false;
    this.currentMonth = this.formatMonth(this.headerPDays[0].month, true).toString();
  }
  addLeftZeros(input: any, length: number = 4){
    let res = input.toString();
    while (res.length < length){
      res = '0' + res;
    }
    return res;
  }

  getDayStyle(day: TaskOfDay) {
    let oneHourLength = 40 / 8;
    let width = day.planHours.length - day.consumedAmount;
    return {
      height: '100%',
      width: (width * oneHourLength) + 'px',
      'background-color': width == 0 ? 'transparent' : this.getTaskColor(day.taskId),
      'background': width == 0 ? 'transparent' : this.getTaskExtraColor(day.taskId),
      'border': this.getSearchingBorder(day),
      'padding-left': width == 0 ? '0' : '2px',
    };
  }
  getConsumedDayStyle(day: TaskOfDay) {
    let oneHourLength = 40 / 8;
    return {
      height: '100%',
      width: (day.consumedAmount * oneHourLength) + 'px',
      'background-color': this.getTaskColor(day.taskId),
      'background': this.getTaskExtraColor(day.taskId),
    };
  }
  // showBusyHoursCount(day: PlanDay){
  //   let busyHours = day.planHours.filter(x => x.hour_type == 1 && x.task_id != 0);
  //   console.log(busyHours);
  // }
  getSearchingBorder(day: TaskOfDay){
    if (this.searchingIssue != null && this.searchingIssue.id == day.taskId){
      return '2px solid #FFB240';
    }
    else{
      return 'none';
    }
  }
  getTasksOfDay(day: PlanDay) {
    let res: TaskOfDay[] = [];
    let busyHours = _.sortBy(day.planHours.filter(x => x.hour_type == 1 && x.task_id != 0), x => x.id);
    _.forEach(_.groupBy(busyHours, x => x.task_id),group => {
      let consumedHours = 0;
      group.forEach(ph => {
        if (this.consumedIds.includes(ph.id)){
          consumedHours += 1;
        }
      });
      res.push({taskId: group[0].task_id, planHours: group, tooltip: this.getIssueDesc(group[0].task_id), consumedAmount: consumedHours});
    });
    return _.sortBy(res, x => _.min(x.planHours.map(y => y.id)));
  }
  getTaskColor(taskId: number){
    switch (taskId){
      default:{
        let eq1 = Math.pow(taskId, 1);
        let eq2 = Math.pow(taskId, 2);
        let eq3 = Math.pow(taskId, 3);
        let r = eq1 % 255;
        let g = eq2 % 255;
        let b = eq3 % 255;
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
      }
    }
  }
  getTaskExtraColor(taskId: number){
    switch (taskId){
      case -5:{ //УЧЁБА
        return 'repeating-linear-gradient(0deg, #F7F7F8, #F7F7F8 2px, #8DB6FA 2px, #8DB6FA 4px)';
      }
      case -4:{ //ОТГУЛ
        return 'repeating-linear-gradient(0deg, #F7F7F8, #F7F7F8 2px, #96A1B0 2px, #96A1B0 4px)';
      }
      case -3:{ //ОПЕРГРУППА
        return 'rgb(53,50,54)';
      }
      case -2:{ //ОТПУСК
        return 'repeating-linear-gradient(0deg, #F7F7F8, #F7F7F8 2px, #86DE5E 2px, #86DE5E 4px)';
      }
      case -1:{ //БОЛЬНИЧНЫЙ
        return 'repeating-linear-gradient(0deg, #F7F7F8, #F7F7F8 2px, #F37878 2px, #F37878 4px)';
      }
      default:{
        let eq1 = Math.pow(taskId, 1);
        let eq2 = Math.pow(taskId, 2);
        let eq3 = Math.pow(taskId, 3);
        let r = eq1 % 255;
        let g = eq2 % 255;
        let b = eq3 % 255;
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
      }
    }
  }
  nextDaySameTask(day: TaskOfDay){
    if (day.planHours.length == 8){
      let last = day.planHours[day.planHours.length - 1];
      let next = this.pHours.filter(x => x.id > last.id && x.task_id == day.taskId);
      return next.length > 0;
    }
    return false;
  }
  prevDaySameTask(day: TaskOfDay){
    if (day.planHours.length > 0){
      let first = day.planHours[0];
      let prev = this.pHours.filter(x => x.id < first.id && x.task_id == day.taskId);
      return prev.length > 0;
    }
    return false;
  }
  checkNextPrev(day: TaskOfDay){
    return this.prevDaySameTask(day) || this.nextDaySameTask(day);
  }
  hasTask(day: PlanDay){
    return day.planHours.find(x => x.task_id != 0);
  }

  openTask(taskId: number){
    if (taskId < 0){
      return;
    }
    this.cd.detach();
    this.issueManagerService.getIssueDetails(taskId).then(res => {
      this.dialogService.open(TaskComponent, {
        showHeader: false,
        modal: true,
        data: res
      }).onClose.subscribe(res => {
        setTimeout(() => {
          if (res == 'updated'){
            this.loading = true;
            this.fill();
          }
          this.cd.reattach();
        }, 100);
      });
    });
  }

  deleteUserTask() {
    this.loading = true;
    let planned = this.taskOfDay.planHours.filter(x => !this.consumedIds.includes(x.id));
    if (planned.length > 0){
      this.auth.deleteUserTask(this.taskOfDay.planHours[0].user, this.taskOfDay.taskId, planned[0].id).subscribe(res => {
        this.auth.getUsersPlanHours(0, this.currentDate.getTime()).subscribe(planHours => {
          this.auth.getPlannedHours().subscribe(plannedHours => {
            this.plannedHours = plannedHours;
            this.pHours = planHours;
            this.fillDays();
            this.filterIssues();
            let task = this.issuesSrc.find(x => x.id == this.taskOfDay.taskId);
            if (task != null){
              this.issueManager.assignUser(task.id, '', '0', '0', 'Нет', task.action, this.auth.getUser().login);
              task.status = 'New';
              task.action = task.status;
              this.issueManager.updateIssue(this.auth.getUser().login, 'status', task);
            }
            // let daysBefore = this.pHours.filter(x => x.id < this.taskOfDay.planHours[0].id && x.user == this.taskOfDay.planHours[0].user);
            // let daysBeforeR = _.sortBy(daysBefore, x => x.id).reverse();
            // this.selectedDay = this.userPDays[daysBeforeR[0].user].find((x: any) => x.planHours.includes(daysBeforeR[0]));
            // if (this.selectedDay != null){
            //   //this.foldAllTaskLeft();
            // }
          });
        });
      });
    }
    else{
      this.loading = false;
    }
  }
  fillNextDays() {
    this.loading = true;
    let latestPHour = _.sortBy(this.pHours,x => x.id);
    if (latestPHour.length > 0){
      this.currentDate = new Date(latestPHour[0].year, latestPHour[0].month + 1, latestPHour[0].day);
      this.headerPDays.splice(0, this.headerPDays.length);
      this.userPDays = Object();
      this.auth.getUsersPlanHours(0, this.currentDate.getTime()).subscribe(planHours => {
        this.pHours = planHours;
        this.fillDays();
      });
    }
  }

  fillPrevDays() {
    this.loading = true;
    let latestPHour = _.sortBy(this.pHours,x => x.id);
    if (latestPHour.length > 0){
      this.currentDate = new Date(latestPHour[0].year, latestPHour[0].month - 1, latestPHour[0].day);
      this.headerPDays.splice(0, this.headerPDays.length);
      this.userPDays = Object();
      this.auth.getUsersPlanHours(0, this.currentDate.getTime()).subscribe(planHours => {
        this.pHours = planHours;
        this.fillDays();
      });
    }
  }
  fillNextDaysAux() {
    this.loading = true;
    let latestPHour = _.sortBy(this.pHours,x => x.id).reverse();
    if (latestPHour.length > 0){
      let newDate = new Date(latestPHour[0].year, latestPHour[0].month, latestPHour[0].day);
      this.headerPDays.splice(0, this.headerPDays.length);
      this.userPDays = Object();
      this.auth.getUsersPlanHours(0, newDate.getTime()).subscribe(planHours => {
        this.pHours = planHours;
        this.fillDays();
      });
    }
  }

  fillPrevDaysAux() {
    this.loading = true;
    let latestPHour = _.sortBy(this.pHours,x => x.id);
    if (latestPHour.length > 0){
      let newDate = new Date(latestPHour[0].year, latestPHour[0].month, latestPHour[0].day);
      newDate.setDate(-27);
      this.headerPDays.splice(0, this.headerPDays.length);
      this.userPDays = Object();
      this.auth.getUsersPlanHours(0, newDate.getTime()).subscribe(planHours => {
        this.pHours = planHours;
        this.fillDays();
      });
    }
  }
  projectChanged() {
    localStorage.setItem('project', this.project);
    this.filterIssues();
  }
  departmentChanged() {
    localStorage.setItem('taskDepartment', this.taskDepartment);
    this.filterIssues();
  }
  stageChanged() {
    localStorage.setItem('stage', this.stage);
    this.filterIssues();
  }
  taskTypeChanged() {
    localStorage.setItem('taskType', this.taskType);
    this.filterIssues();
  }
  statusChanged() {
    localStorage.setItem('status', this.status);
    this.filterIssues();
  }
  showAssignedChanged(){
    localStorage.setItem('showAssigned', this.showAssigned ? '1' : '0');
    this.filterIssues();
  }
  showWithoutPlanChanged(){
    localStorage.setItem('showWithoutPlan', this.showWithoutPlan ? '1' : '0');
    this.filterIssues();
  }
  filterIssues(){
    this.project = localStorage.getItem('project') != null ? localStorage.getItem('project')! : this.project;
    this.taskDepartment = localStorage.getItem('taskDepartment') != null ? localStorage.getItem('taskDepartment')! : this.taskDepartment;
    this.stage = localStorage.getItem('stage') != null ? localStorage.getItem('stage')! : this.stage;
    this.taskType = localStorage.getItem('taskType') != null ? localStorage.getItem('taskType')! : this.taskType;
    this.status = localStorage.getItem('status') != null ? localStorage.getItem('status')! : this.status;
    this.showWithoutPlan = localStorage.getItem('showWithoutPlan') != null ? (+localStorage.getItem('showWithoutPlan')! == 1) : this.showWithoutPlan;
    this.showAssigned = localStorage.getItem('showAssigned') != null ? (+localStorage.getItem('showAssigned')! == 1) : this.showAssigned;

    this.issues = [...this.issuesSrc];
    this.issues = this.issues.filter(x => !x.closing_status.includes(x.status));
    this.issues = this.issues.filter(x => x.project == this.project || this.project == '' || this.project == '-' || this.project == null);
    this.issues = this.issues.filter(x => x.department == this.taskDepartment || this.taskDepartment == '' || this.taskDepartment == '-' || this.taskDepartment == null);
    this.issues = this.issues.filter(x => x.period == this.stage || this.stage == '' || this.stage == '-' || this.stage == null);
    this.issues = this.issues.filter(x => x.issue_type == this.taskType || this.taskType == '' || this.taskType == '-' || this.taskType == null);
    this.issues = this.issues.filter(x => this.issueManagerService.localeStatus(x.status, false) == this.issueManagerService.localeStatus(this.status, false) || this.status == '' || this.status == '-' || this.status == null);
    this.issues = this.issues.filter(x => x.plan_hours > 0 || this.showWithoutPlan);
    //this.issues = this.issues.filter(x => (this.getPlanned(x) != x.plan_hours || x.plan_hours == 0) || this.showAssigned);
    this.issues = this.issues.filter(x => (this.dragValues[x.id] != 0 || x.plan_hours == 0) || this.showAssigned);
    this.issues = _.sortBy(this.issues, x => x.doc_number);
    if (this.searchValue.trim() != ''){
      this.issues = this.issues.filter(x => (x.name + x.doc_number).trim().toLowerCase().includes(this.searchValue.trim().toLowerCase()));
    }
    if (this.taskId != 0){
      console.log(this.taskId);
      this.issues = this.issuesSrc.filter(x => x.id == this.taskId);
      this.taskId = 0;
    }
  }
  close() {
    this.ref.close();
  }
  getProjectName(project: any){
    let res = project.name;
    if (project.rkd != ''){
      res += ' (' + project.rkd + ')';
    }
    return res;
  }
  selectIssue(issue: any) {
    this.selectedIssue = issue;
  }
  formatMonth(month: number, full: Boolean = false) {
    if (this.t.language == 'en'){
      switch (month) {
        case 0: return 'Jan' + (full ? 'uary' : '');
        case 1: return 'Feb' + (full ? 'rary' : '');
        case 2: return 'Mar' + (full ? 'ch' : '');
        case 3: return 'Apr' + (full ? 'il' : '');
        case 4: return 'May' + (full ? '' : '');
        case 5: return 'Jun' + (full ? 'e' : '');
        case 6: return 'Jul' + (full ? 'y' : '');
        case 7: return 'Aug' + (full ? 'ust' : '');
        case 8: return 'Sep' + (full ? 'tember' : '');
        case 9: return 'Oct' + (full ? 'ober' : '');
        case 10: return 'Nov' + (full ? 'ember' : '');
        case 11: return 'Dec' + (full ? 'ember' : '');
        default: return month;
      }
    }
    else{
      switch (month) {
        case 0: return 'Янв' + (full ? 'арь' : '');
        case 1: return 'Февр' + (full ? 'аль' : '');
        case 2: return 'Март' + (full ? '' : '');
        case 3: return 'Апр' + (full ? 'ель' : '');
        case 4: return 'Май' + (full ? '' : '');
        case 5: return 'Июнь' + (full ? '' : '');
        case 6: return 'Июль' + (full ? '' : '');
        case 7: return 'Авг' + (full ? 'уст' : '');
        case 8: return 'Сент' + (full ? 'ябрь' : '');
        case 9: return 'Окт' + (full ? 'ябрь' : '');
        case 10: return 'Нояб' + (full ? 'рь' : '');
        case 11: return 'Дек' + (full ? 'абрь' : '');
        default: return month;
      }
    }
  }

  drag(event: DragEvent, issue: any, dragValue: number) {
    this.cd.detach();
    this.draggableIssue = issue;
    this.draggableEvent = event;
    this.dragValue = dragValue;
  }

  dragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  dragDrop(event: DragEvent, pDay: PlanDay, user: User) {
    event.preventDefault();
    this.cd.reattach();
    console.log(pDay);
    console.log(this.draggableIssue);
    let date = new Date(pDay.year, pDay.month, pDay.day);
    let current = new Date();
    let compare = new Date(current.getFullYear(), current.getMonth(), current.getDate());
    if (date.getTime() < compare.getTime()){
      alert('Планирование на прошлые дни невозможно');
      return;
    }


    let planHours = pDay.planHours;
    let freeHour = _.sortBy(planHours, x => x.hour_type).find(x => x.hour_type == 1 && (x.task_id == 0 || this.draggableEvent.ctrlKey || this.draggableIssue.id < 0) && !this.consumedIds.includes(x.id));
    if (freeHour == null){
      freeHour = planHours[0];
    }

    if (this.draggableIssue.id < 0 || this.dragValue <= this.draggableIssue.plan_hours - this.getPlanned(this.draggableIssue)){
      this.loading = true;
      this.auth.planUserTask(user.id, this.draggableIssue.id, freeHour.id, this.dragValue, (this.draggableEvent.ctrlKey || this.draggableIssue.id < 0) ? 1 : 0).subscribe({
        next: () => {
          this.auth.getUsersPlanHours(0, this.currentDate.getTime(), 0).subscribe(planHours => {
            this.auth.getPlannedHours().subscribe(plannedHoursAlready => {
              this.plannedHours = plannedHoursAlready;
              this.pHours = planHours;
              this.fillDays();
              this.filterIssues();
              this.loading = false;

              if (this.draggableIssue.id > 0){
                this.auth.getUsersPlanHours(user.id, 0, 1).subscribe(userPlanHours => {
                  let plannedHours = _.sortBy(userPlanHours.filter(x => x.task_id == this.draggableIssue.id && x.user == user.id && x.id >= freeHour!.id), x => x.id);

                  if (plannedHours.length > 0){
                    let first = plannedHours[0];
                    let last = plannedHours[plannedHours.length - 1];
                    let dateStart = new Date(first.year, first.month, first.day);
                    let dateDue = new Date(last.year, last.month, last.day);
                    this.issueManager.assignUser(this.draggableIssue.id, user.login, dateStart.getTime().toString(), dateDue.getTime().toString(), 'Нет', this.draggableIssue.action, this.auth.getUser().login)
                    this.draggableIssue.status = 'AssignedTo';
                    this.draggableIssue.action = this.draggableIssue.status;
                    this.issueManager.updateIssue(this.auth.getUser().login, 'status', this.draggableIssue);
                  }
                });
              }

            });

          });
        }
      });
    }
    else{
      alert('no hours left to assign');
    }

  }

  getConsumed(issue: Issue) {
    return this.consumed.filter(x => x.task_id == issue.id).length;
  }
  getPlanned(issue: Issue) {
    let planned = this.plannedHours.find(x => x.taskId == issue.id);
    return planned != null ? planned.hours : 0;
  }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" + date.getFullYear();
  }

  clearFilters() {
    localStorage.clear();
    location.reload();
  }

  getDateOnly(dateLong: number): string {
    if (dateLong == 0){
      return '--/--/--';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
    // let date = new Date(dateLong);
    // let ye = new Intl.DateTimeFormat('ru', { year: '2-digit' }).format(date);
    // let mo = new Intl.DateTimeFormat('ru', { month: '2-digit' }).format(date);
    // let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
    // return da + '.' + mo + '.' + ye;
  }

  getIssueDesc(taskId: number) {
    let res = '';
    let find = this.issuesSrc.find(x => x.id == taskId);
    if (find != null){
      res = find.doc_number + ' ' + find.name;
    }
    return res;
  }

  dragEnd(event: DragEvent) {
    this.cd.reattach();
  }

  foldTaskLeftAux() {
    if (this.taskOfDay.planHours.length > 0){
      this.loading = true;
      let user = this.taskOfDay.planHours[0].user;
      let freeHour = _.sortBy(this.pHours.filter(x => x.task_id == this.taskOfDay.taskId && x.user == user),x => x.id)[0];
      let findPlanned = this.plannedHours.find(x => x.taskId == this.taskOfDay.taskId);
      if (findPlanned != null){
        this.auth.deleteUserTask(user, this.taskOfDay.taskId, 0).subscribe(res => {
          this.auth.planUserTask(user, this.taskOfDay.taskId, freeHour.id, findPlanned!.hours, 0).subscribe({
            next: () => {
              this.auth.getUsersPlanHours(0, this.currentDate.getTime()).subscribe(planHours => {
                this.auth.getPlannedHours().subscribe(plannedHoursAlready => {
                  this.plannedHours = plannedHoursAlready;
                  this.pHours = planHours;
                  this.fillDays();
                  this.filterIssues();
                  this.loading = false;

                  let findUser = this.users.find(x => x.id == user);
                  if (findUser != null){
                    let plannedHours = _.sortBy(this.pHours.filter(x => x.task_id == this.taskOfDay.taskId && x.user == user), x => x.id);
                    if (planHours.length > 0){
                      let first = plannedHours[0];
                      let last = plannedHours[plannedHours.length - 1];
                      let dateStart = new Date(first.year, first.month, first.day);
                      let dateDue = new Date(last.year, last.month, last.day);
                      this.issueManager.assignUser(this.taskOfDay.taskId, findUser.login, dateStart.getTime().toString(), dateDue.getTime().toString(), 'Нет', 'AssignedTo', this.auth.getUser().login, 1);
                    }
                  }
                });
              });
            }
          });
        });
      }
    }
  }
  foldAllTaskLeft() {
    this.loading = true;
    let user = this.selectedDay.planHours[0].user;
    let freeHour = this.selectedDay.planHours[0];
    if (freeHour.task_id > 0){
      freeHour = this.pHours.filter(x => x.user == freeHour.user && x.task_id == freeHour.task_id)[0];
    }
    this.auth.getUsersPlanHours(user, 0, 1).subscribe(userPlanHours => {
      let plannedHours = _.sortBy(userPlanHours.filter((x: any) => x.id >= freeHour.id && x.task_id > 0), x => x.id);
      let tasks = _.uniq(plannedHours.map(x => x.task_id).filter(x => x > 0), x => x);
      let assign: any[] = [];
      _.forEach(_.groupBy(plannedHours, x => x.task_id), group => {
        assign.push({task: group[0].task_id, hours: group.length, min: _.sortBy(group, y => y.id)[0].id});
      });
      assign = _.sortBy(assign, x => x.min);
      forkJoin(tasks.map(x => this.auth.deleteUserTask(user, x, freeHour.id))).subscribe({
        next: value => {
          concat(assign.map((x: any) => this.auth.planUserTask(user, x.task, freeHour.id, x.hours, 0).subscribe())).subscribe({
            next: assignRes => {
              this.auth.getUsersPlanHours(0, this.currentDate.getTime()).subscribe(planHours => {
                this.auth.getPlannedHours().subscribe(plannedHoursAlready => {
                  this.plannedHours = plannedHoursAlready;
                  this.pHours = planHours;
                  this.fillDays();
                  this.filterIssues();
                  this.loading = false;
                });
              });
            }
          });
        }
      });
    });
  }

  selectTaskOfDay(task: TaskOfDay, day: any, user: any, cm: ContextMenu, event: MouseEvent) {
    console.log(day);
    console.log(task);
    event.preventDefault();
    event.stopPropagation();
    if (task.taskId == 0){
      this.items = [
        {
          label: 'Fold left all',
          icon: 'pi pi-fw pi-arrow-circle-left',
          command: (event: any) => this.foldAllTaskLeft()
        }
      ];
    }
    else{
      this.items = [
        {
          label: 'Clear task',
          icon: 'pi pi-fw pi-trash',
          command: (event: any) => this.deleteUserTask()
        },
        {
          label: 'Fold left all',
          icon: 'pi pi-fw pi-arrow-circle-left',
          command: (event: any) => this.foldAllTaskLeft()
        },
      ];
    }
    this.cd.reattach();
    setTimeout(() => {
      this.cd.detach();
      this.taskOfDay = task;
      this.selectDay(day, user);
      cm.position(event);
      cm.show();
      cm.onHide.subscribe(() => {
        this.cd.reattach();
      });
    }, 100);
  }

  searchIssue(issue: Issue) {
    if (this.searchingIssue == issue){
      // @ts-ignore
      this.searchingIssue = null;
    }
    else{
      this.searchingIssue = issue;
    }
  }

  getIssue(name: string) {
    return this.issuesSrc.find(x => x.issue_type == name);
  }

  saveSelectedDepartments() {
    localStorage.setItem('selectedDepartments', JSON.stringify(this.selectedDepartments));
  }
}
