import {VarMap} from "./var-map";
import {FileAttachment} from "./file-attachment";

export class IssueMessage {
  author: string = '';
  content: string = '';
  date: number = 0;
  file_attachments: FileAttachment[] = [];
  prefix: string = '';
  to_be_replied = 0;
}
