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
}
@Component({
  selector: 'app-work-hours',
  templateUrl: './work-hours.component.html',
  styleUrls: ['./work-hours.component.css']
})
export class WorkHoursComponent implements OnInit {

  departments: LV[] = [];
  department = '';
  today = new Date();
  todayStatic = new Date();
  currentMonth = this.today.getMonth();
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
  pHours: PlanHour[] = [];
  userPDays: any = Object();
  headerPDays: PlanDay[] = [];
  loading = false;
  stages: string[] = [];
  stage = '';
  taskTypes: string[] = [];
  taskType = '';
  statuses: string[] = [];
  status = '';
  searchValue = '';
  selectedIssue: Issue;
  projects: string[] = ['N002', 'N004', 'P701', 'P707'];
  project = '';
  issueSpentTime: DailyTask[] = [];
  showWithoutPlan = false;
  showAssigned = false;
  dragValues = Object();

  constructor(public issueManager: IssueManagerService, public t: LanguageService, public auth: AuthManagerService, private dialogService: DialogService, private issueManagerService: IssueManagerService, public ref: DynamicDialogRef, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loading = true;
    this.fill();
    this.fillIssues();
    this.items = [
      // {
      //   label: 'Add task',
      //   icon: 'pi pi-fw pi-external-link',
      //   command: (event: any) => this.openTaskAssign()
      // },
      {
        label: 'Clear task',
        icon: 'pi pi-fw pi-trash',
        command: (event: any) => this.deleteUserTask()
      }
    ];
  }
  fill(){
    this.auth.getUsers().then(res => {
      this.users = res.filter(x => x.visibility.includes('k'));
      this.users.forEach(user => user.userName = this.auth.getUserName(user.login));
      this.users = _.sortBy(this.users.filter(x => x.surname != 'surname'), x => x.userName);
      this.departments = _.uniq(this.users.map(x => x.department)).map(x => new LV(x));
      this.selectedDepartments = this.departments.map(x => x.value);
    });
    this.auth.getUsersPlanHours().subscribe(planHours => {
      this.pHours = planHours;
      this.fillDays();
    });
  }
  fillIssues(){
    this.issueManagerService.getDailyTasks().then(res => {
      this.issueSpentTime = res;
      this.issueManagerService.getIssues('op').then(res => {
        this.issuesSrc = res;
        this.issues = res;
        this.issues = _.sortBy(this.issues, x => x.doc_number);
        this.stages = _.sortBy(_.uniq(this.issues.map(x => x.period)).filter(x => x != ''), x => x);
        this.statuses = _.sortBy(_.uniq(this.issues.map(x => this.issueManagerService.localeStatus(x.status, false))).filter(x => x != ''), x => x);
        this.taskTypes = _.sortBy(_.uniq(this.issues.map(x => x.issue_type)).filter(x => x != ''), x => x);
        this.issues.forEach(issue => issue.labor = issue.plan_hours == 0 ? 0 : Math.round(this.getConsumedLabor(issue.id, issue.doc_number) / issue.plan_hours * 100));
        this.statuses = ['-'].concat(this.statuses);
        this.taskTypes = ['-'].concat(this.taskTypes);
        this.issues.forEach(x => this.dragValues[x.id] = x.plan_hours);
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
  getDaysInMonth() {
    let daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    let array = [];
    for (let x = 0; x < daysInMonth; x++){
      array.push(x + 1);
    }
    return array;
  }
  isWeekend(day: number) {
    let date = new Date(this.currentYear, this.currentMonth, day).getDay();
    return date == 0 || date == 6 || this.specialDays.find(x => x.day == day && (x.month - 1) == this.currentMonth && x.year == this.currentYear)?.hours == 0;
  }
  isCurrentDay(day: any) {
    return day == this.todayStatic.getDate() && this.currentMonth == this.todayStatic.getMonth();
  }
  isCurrentPDay(pDay: PlanDay) {
    return pDay.day == this.todayStatic.getDate() && pDay.month == this.todayStatic.getMonth() && pDay.year == this.todayStatic.getFullYear();
  }
  isShorter(day: number){
    let special = this.specialDays.find(x => x.day == day && (x.month - 1) == this.currentMonth && x.year == this.currentYear);
    return special != null && special.hours != 0;
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
  }
  addLeftZeros(input: any, length: number = 4){
    let res = input.toString();
    while (res.length < length){
      res = '0' + res;
    }
    return res;
  }

  getDayStyle(day: TaskOfDay) {
    let oneHourLength = 48 / 8;
    return {
      height: '40px',
      width: (day.planHours.length * oneHourLength) + 'px',
      'background-color': this.getTaskColor(day.taskId),
      // 'border-top-left-radius': this.nextDaySameTask(day) ? '6px' : '',
      // 'border-bottom-right-radius': this.prevDaySameTask(day) ? '6px' : '',
    };
  }
  // showBusyHoursCount(day: PlanDay){
  //   let busyHours = day.planHours.filter(x => x.hour_type == 1 && x.task_id != 0);
  //   console.log(busyHours);
  // }

  getTasksOfDay(day: PlanDay) {
    let res: TaskOfDay[] = [];
    let busyHours = _.sortBy(day.planHours.filter(x => x.hour_type == 1 && x.task_id != 0), x => x.id);
    _.forEach(_.groupBy(busyHours, x => x.task_id),group => {
      res.push({taskId: group[0].task_id, planHours: group});
    });
    return _.sortBy(res, x => _.min(x.planHours.map(y => y.id)));
  }
  getTaskColor(taskId: number){
    let eq1 = Math.pow(taskId, 1);
    let eq2 = Math.pow(taskId, 2);
    let eq3 = Math.pow(taskId, 3);
    let r = eq1 % 255;
    let g = eq2 % 255;
    let b = eq3 % 255;
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
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
    console.log(taskId);
    this.issueManagerService.getIssueDetails(taskId).then(res => {
      this.dialogService.open(TaskComponent, {
        showHeader: false,
        modal: true,
        data: res
      });
    });
  }

  deleteUserTask() {
    this.loading = true;
    let pDay = this.dayHover as PlanDay;
    let findTask = pDay.planHours.find(x => x.task_id != 0);
    if (findTask != null){
      this.auth.deleteUserTask(findTask.user, findTask.task_id, 0).subscribe(res => {
        console.log(res);
        this.auth.getUsersPlanHours().subscribe(planHours => {
          this.pHours = planHours;
          this.fillDays();
          this.filterIssues();

          this.issueManager.assignUser(this.draggableIssue.id, '', '0', '0', 'Нет', this.draggableIssue.action, this.auth.getUser().login);

          this.draggableIssue.status = 'New';
          this.draggableIssue.action = this.draggableIssue.status;
          this.issueManager.updateIssue(this.auth.getUser().login, 'status', this.draggableIssue);
          this.loading = false;

        });
      });
    }
  }

  fillNextDays() {
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

  fillPrevDays() {
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
    this.filterIssues();
  }
  departmentChanged() {
    this.filterIssues();
  }
  stageChanged() {
    this.filterIssues();
  }
  taskTypeChanged() {
    this.filterIssues();
  }
  statusChanged() {
    this.filterIssues();
  }
  filterIssues(){
    this.issues = [...this.issuesSrc];
    this.issues = this.issues.filter(x => !x.closing_status.includes(x.status));
    this.issues = this.issues.filter(x => x.project == this.project || this.project == '' || this.project == '-' || this.project == null);
    this.issues = this.issues.filter(x => x.department == this.department || this.department == '' || this.department == '-' || this.department == null);
    this.issues = this.issues.filter(x => x.period == this.stage || this.stage == '' || this.stage == '-' || this.stage == null);
    this.issues = this.issues.filter(x => x.issue_type == this.taskType || this.taskType == '' || this.taskType == '-' || this.taskType == null);
    this.issues = this.issues.filter(x => this.issueManagerService.localeStatus(x.status, false) == this.issueManagerService.localeStatus(this.stage, false) || this.status == '' || this.status == '-' || this.status == null);
    this.issues = this.issues.filter(x => x.plan_hours > 0 || this.showWithoutPlan);
    this.issues = this.issues.filter(x => (this.getPlanned(x) != x.plan_hours || x.plan_hours == 0) || this.showAssigned);
    this.issues = _.sortBy(this.issues, x => x.doc_number);
    if (this.searchValue.trim() != ''){
      this.issues = this.issues.filter(x => (x.name + x.doc_number).trim().toLowerCase().includes(this.searchValue.trim().toLowerCase()));
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
  formatMonth(month: number) {
    if (this.t.language == 'en'){
      switch (month) {
        case 0: return 'Jan';
        case 1: return 'Feb';
        case 2: return 'Mar';
        case 3: return 'Apr';
        case 4: return 'May';
        case 5: return 'Jun';
        case 6: return 'Jul';
        case 7: return 'Aug';
        case 8: return 'Sep';
        case 9: return 'Oct';
        case 10: return 'Nov';
        case 11: return 'Dec';
        default: return month;
      }
    }
    else{
      switch (month) {
        case 0: return 'Янв';
        case 1: return 'Февр';
        case 2: return 'Март';
        case 3: return 'Апр';
        case 4: return 'Май';
        case 5: return 'Июнь';
        case 6: return 'Июль';
        case 7: return 'Авг';
        case 8: return 'Сент';
        case 9: return 'Окт';
        case 10: return 'Нояб';
        case 11: return 'Дек';
        default: return month;
      }
    }
  }

  drag(event: DragEvent, issue: any, dragValue: number) {
    console.log(event);
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
    let planHours = pDay.planHours;
    let freeHour = _.sortBy(planHours, x => x.hour_type).find(x => x.hour_type == 1 && (x.task_id == 0 || this.draggableEvent.ctrlKey));
    if (freeHour == null){
      freeHour = planHours[0];
    }

    if (this.dragValue <= this.draggableIssue.plan_hours - this.getPlanned(this.draggableIssue)){
      this.loading = true;
      this.auth.planUserTask(user.id, this.draggableIssue.id, freeHour.id, this.dragValue, this.draggableEvent.ctrlKey ? 1 : 0).subscribe({
        next: () => {
          this.auth.getUsersPlanHours().subscribe(planHours => {
            this.pHours = planHours;
            this.fillDays();
            this.filterIssues();
            this.loading = false;

            let plannedHours = _.sortBy(this.pHours.filter(x => x.task_id == this.draggableIssue.id && x.user == user.id), x => x.id);

            if (planHours.length > 0){
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
    }
    else{
      alert('no hours left to assign');
    }

  }

  getPlanned(issue: Issue) {
    return this.pHours.filter(x => x.task_id == issue.id).length;
  }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" + date.getFullYear();
  }

  clearFilters() {

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
    let find = this.issues.find(x => x.id == taskId);
    if (find != null){
      res = find.doc_number + ' ' + find.name;
    }
    return res;
  }
}
