import {VarMap} from "./var-map";
import {FileAttachment} from "./file-attachment";

export class IssueMessage {
  owner: string = '';
  author: string = '';
  content: string = '';
  date: number = 0;
  variables: VarMap[] = [];
  fileAttachments: FileAttachment[] = [];
}
