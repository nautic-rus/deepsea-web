import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Issue} from "../../domain/classes/issue";
import {User} from "../../domain/classes/user";
import {MenuItem} from "primeng/api";
import {DailyTask} from "../../domain/interfaces/daily-task";
import {ActivatedRoute} from "@angular/router";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {LanguageService} from "../../domain/language.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import _ from "underscore";
import {TaskAssignComponent} from "../work-hours/task-assign/task-assign.component";
import {TaskComponent} from "../task/task.component";
import {concat, forkJoin} from "rxjs";
import {ContextMenu} from "primeng/contextmenu";
import {ConsumedHour, PlanDay, PlanHour, PlannedHours, TaskOfDay} from "../work-hours/work-hours.component";
export interface MonthDay{
  year: number;
  month: number;
  day: number;
  kind: number;
  ms: number;
}
export interface PlanInterval{
  id: number;
  task_id: number;
  user_id: number;
  date_start: number;
  date_finish: number;
  task_type: number;
  hours_amount: number;
}
export interface PlanByDays{
  day: number;
  month: number;
  year: number;
  ints: DayInterval[];
}
export interface DayInterval{
  taskId: number;
  hours: number;
  hours_total: number;
  id: number;
}
export interface UserPlan{
  userId: number;
  plan: PlanByDays[];
}

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css']
})
export class PlanComponent implements OnInit {

  departments: any[] = [];
  department = '';
  today = new Date();
  todayStatic = new Date();
  currentMonth = '';
  currentYear = this.today.getFullYear();
  issues: any[] = [];
  issuesSrc: Issue[] = [];
  draggableIssue: any;
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
  usersSrc: User[] = [];
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
  loadingIssues = false;
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
  monthDays: MonthDay[] = [];
  plan: PlanInterval[] = [];
  planByDays: UserPlan[] = [];
  usersPlan = Object();
  cmMenuInt: DayInterval;
  constructor(public route: ActivatedRoute, public issueManager: IssueManagerService, public t: LanguageService, public auth: AuthManagerService, private dialogService: DialogService, private issueManagerService: IssueManagerService, public ref: DynamicDialogRef, public cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.taskId = params.taskId != null ? params.taskId : 0;
    });
    this.loading = true;
    this.fill();
    this.items = [
      {
        label: 'Clear task',
        icon: 'pi pi-fw pi-trash',
        command: (event: any) => this.deleteInterval()
      },
    ];
  }
  fill(){
    this.fillIssues();
    this.auth.getUsers().then(res => {
      this.usersSrc = res.filter(x => x.visibility.includes('k'));
      this.usersSrc.forEach(user => user.userName = this.auth.getUserName(user.login));
      this.usersSrc = _.sortBy(this.usersSrc.filter(x => x.surname != 'surname'), x => x.userName);
      this.issueManager.getDepartments().subscribe(departments => {
        this.departments = departments.filter(x => x.visible_man_hours == 1);
        if (localStorage.getItem('selectedDepartments') != null){
          this.selectedDepartments = JSON.parse(localStorage.getItem('selectedDepartments')!);
        }
        else{
          this.selectedDepartments = [...this.departments.map(x => x.name)];
        }
        this.users = this.usersSrc.filter(x => this.selectedDepartments.includes(x.department));
      });
      this.fillDays();
    });
  }
  fillIssues(){
    this.loadingIssues = true;
    this.auth.getPlanIssues().subscribe(res => {
      this.issuesSrc = res;
      this.issues = res.filter(x => ['QNA', 'RKD', 'OTHER', 'CORRECTION', 'IT', 'PDSP'].includes(x.issue_type));
      this.issues = _.sortBy(this.issues, x => x.doc_number);
      this.stages = _.sortBy(_.uniq(this.issues.map(x => x.period)).filter(x => x != ''), x => this.sortStage(x));
      this.statuses = _.sortBy(_.uniq(this.issues.map(x => this.issueManagerService.localeStatus(x.status, false))).filter(x => x != ''), x => x);
      this.taskTypes = _.sortBy(_.uniq(this.issues.map(x => x.issue_type)).filter(x => x != ''), x => x);
      this.taskDepartments = _.sortBy(_.uniq(this.issues.map(x => x.department)).filter(x => x != ''), x => x);
      this.issuesSrc.forEach(issue => issue.labor = issue.plan_hours == 0 ? 0 : Math.round(this.getConsumedLabor(issue.id, issue.doc_number) / issue.plan_hours * 100));
      this.statuses = ['-'].concat(this.statuses);
      this.taskTypes = ['-'].concat(this.taskTypes);
      this.filterIssues();
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
  isCurrentDay(d: MonthDay) {
    return d.day == this.todayStatic.getDate() && d.month == this.todayStatic.getMonth() && d.year == this.todayStatic.getFullYear();
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
    let month = this.today.getMonth();
    let year = this.today.getFullYear();
    this.currentMonth = this.formatMonth(month, true).toString();
    let monthDays: MonthDay[] = [];
    let daysInMonth = this.daysInMonth(month, this.today.getFullYear());
    for (let x = 1; x <= daysInMonth; x ++){
      monthDays.push({
        day: x,
        month: month,
        year: year,
        kind: this.dayKind(x, month, year),
        ms: new Date(year, month, x).getTime(),
      });
    }
    this.monthDays = monthDays;
    this.loading = false;
    this.fillPlan();
  }
  intervalSameDay(d1: number, d2: number, int1: number, int2: number){
    let c1 = int2 >= d1 && int1 <= d1;
    let c2 = int1 >= d1 && int1 <= d2 && int2 <= d2 && int2 >= d1;
    let c3 = int1 >= d1 && int1 <= d2 && int2 >= d2;
    return c1 || c2 || c3;
  }
  dayKind(day: number, month: number, year: number): number{
    let sp = this.specialDays.find(x => x.day == day && ((x.month - 1) == month) && x.year == year);
    if (sp != null){
      return sp.hours == 0 ? 1 : 2;
    }
    else{
      let d = new Date(year, month, day);
      return (d.getDay() == 6 || d.getDay() == 0) ? 1 : 0;
    }
  }
  daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
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

  deleteInterval() {
    this.auth.deleteInterval(this.cmMenuInt.id).subscribe(res => {
      let findIssue = this.issues.find(x => x.id == this.cmMenuInt.taskId);
      if (findIssue != null){
        this.auth.getPlanIssue(findIssue.id).subscribe(upd => {
          let updIssue = upd[0];
          findIssue.inPlan = updIssue.inPlan;
          findIssue.available = updIssue.available;
          findIssue.available_limit = updIssue.available_limit;
        });
      }
      this.fillPlan();
    });
  }
  fillNextDays() {
    this.loading = true;
    this.today = new Date(this.today.setMonth(this.today.getMonth() + 1));
    this.fillDays();
  }

  fillPrevDays() {
    this.loading = true;
    this.today = new Date(this.today.setMonth(this.today.getMonth() - 1));
    this.fillDays();
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
    // this.issues = this.issues.filter(x => x.plan_hours > 0 || this.showWithoutPlan);
    // this.issues = this.issues.filter(x => (this.dragValues[x.id] != 0 || x.plan_hours == 0) || this.showAssigned);
    this.issues = _.sortBy(this.issues, x => x.doc_number);
    if (this.searchValue.trim() != ''){
      this.issues = this.issues.filter(x => (x.name + x.doc_number).trim().toLowerCase().includes(this.searchValue.trim().toLowerCase()));
    }
    if (this.taskId != 0){
      this.issues = this.issuesSrc.filter(x => x.id == this.taskId);
      this.taskId = 0;
    }
    this.loadingIssues = false;
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
    if (dragValue <= 0){
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.cd.detach();
    this.draggableIssue = issue;
    this.draggableEvent = event;
    this.dragValue = dragValue;
  }

  dragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
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

  private fillPlan() {
    this.auth.getPlanByDays(this.today.getTime()).subscribe(res => {
      this.planByDays = res;
      this.users.forEach(user => {
        let findUserPlan = this.planByDays.find(x => x.userId == user.id);
        if (findUserPlan != null){
          let userPlan = Object();
          this.monthDays.forEach(d => {
            let findUserPlanDay = findUserPlan!.plan.find(x => x.day == d.day);
            if (findUserPlanDay != null){
              userPlan[d.ms] = findUserPlanDay.ints;
            }
          });
          this.usersPlan[user.id] = userPlan;
        }
      });
      console.log(this.usersPlan);
    });
  }

  onDayDrop(user: User, d: MonthDay, event: MouseEvent) {
    let id = this.draggableIssue.id;
    let taskType = 0;
    switch (id){
      case -1: taskType = 1; break;
      case -2: taskType = 2; break;
      case -3: taskType = 3; break;
      default: taskType = 0; break;
    }
    if (event.ctrlKey){
      this.auth.insertPlanInterval(id, user.id, d.ms, this.dragValue, taskType).subscribe(res => {
        this.fillPlan();

        let findIssue = this.issues.find(x => x.id == id);
        if (findIssue != null){
          this.auth.getPlanIssue(findIssue.id).subscribe(upd => {
            console.log(upd);
            let updIssue = upd[0];
            findIssue.inPlan = updIssue.inPlan;
            findIssue.available = updIssue.available;
            findIssue.available_limit = updIssue.available_limit;
          });
        }
      });
    }
    else{
      this.auth.addPlanInterval(id, user.id, d.ms, this.dragValue, taskType).subscribe(res => {
        this.fillPlan();

        let findIssue = this.issues.find(x => x.id == id);
        if (findIssue != null){
          this.auth.getPlanIssue(findIssue.id).subscribe(upd => {
            console.log(upd);
            let updIssue = upd[0];
            findIssue.inPlan = updIssue.inPlan;
            findIssue.available = updIssue.available;
            findIssue.available_limit = updIssue.available_limit;
          });
        }
      });
    }
  }

  drawTaskInterval(int: any) {
    let oneHourLength = 40 / 8;
    let width = int.hours;
    return {
      height: '100%',
      width: (width * oneHourLength) + 'px',
      'background': width == 0 ? 'transparent' : this.getTaskExtraColor(int.taskId),
      'padding-left': width == 0 ? '0' : '2px',
    };
  }

  openIntervalMenu(cm: ContextMenu, event: MouseEvent, int: DayInterval) {
    this.cmMenuInt = int;
    cm.show(event);
  }
}
