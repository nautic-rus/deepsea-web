import {IssueMessage} from "./issue-message";
import {FileAttachment} from "./file-attachment";
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
  profession: string = '';
  messages: IssueMessage[] = [];
  fileAttachments: FileAttachment[] = [];
  availableStatuses: string[] = [];
}
