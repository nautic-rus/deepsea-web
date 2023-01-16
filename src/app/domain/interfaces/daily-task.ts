export class DailyTask {
  issueId: number = 0;
  date: any;
  dateCreated: any;
  userLogin: string = '';
  project: string = '';
  details: string = '';
  time: number = 0;
  id: number = 0;
  userName: string = '';
  docNumber: string = '';
  action: string = '';
  hours: number = 0;
  minutes: number = 0;
  actionValue: string = '';
  projectValue: string = '';
  docNumberValue: string = '';
  hidden: boolean = false;

  constructor(issueId: number, date: any, dateCreated: any, userLogin: string, project: string, details: string, time: number, id: number, userName: string, docNumber: string, action: string, hours: number, minutes: number, actionValue: string, projectValue: string, docNumberValue: string, hidden: boolean) {
    this.issueId = issueId;
    this.date = date;
    this.dateCreated = dateCreated;
    this.userLogin = userLogin;
    this.project = project;
    this.details = details;
    this.time = time;
    this.id = id;
    this.userName = userName;
    this.docNumber = docNumber;
    this.action = action;
    this.hours = hours;
    this.minutes = minutes;
    this.actionValue = actionValue;
    this.projectValue = projectValue;
    this.docNumberValue = docNumberValue;
    this.hidden = hidden;
  }

  toJson(){
    return JSON.stringify(Object({issueId: this.issueId, date: this.date, dateCreated: this.dateCreated, userLogin: this.userLogin, project: this.project, details: this.details, time: this.time, id: this.id}));
  }
}
