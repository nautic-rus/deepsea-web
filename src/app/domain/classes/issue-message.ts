import {VarMap} from "./var-map";

export class IssueMessage {
  owner: string = '';
  author: string = '';
  content: string = '';
  date: number = 0;
  variables: VarMap[] = [];
}
