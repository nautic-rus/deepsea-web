import {IssueMessage} from "./issue-message";

export class Issue {
  id: number = 0;
  status: string = '';
  department: string = '';
  startedBy: string = '';
  taskModelType: string = '';
  name: string = '';
  details: string = '';
  assignedTo: string = '';
  messages: IssueMessage[] = [];
}
