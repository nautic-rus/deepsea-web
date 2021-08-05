import {IssueMessage} from "./issue-message";
export class Issue {
  id: string = '';
  status: string = '';
  project: string = '';
  department: string = '';
  startedBy: string = '';
  startedDate: number = 0;
  taskType: string = '';
  name: string = '';
  details: string = '';
  assignedTo: string = '';
  messages: IssueMessage[] = [];
  availableStatuses: string[] = [];
}
