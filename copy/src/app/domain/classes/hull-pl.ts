import {Room} from "./room";
import {BsTreeItem} from "./bs-tree-item";

export class HullPL {
  name: string = '';
  descr: string = '';
  project: string = '';
  rev: number = 0;
  taskId: string = '';
  user: string = '';
  path: string = '';
  date: number = 0;
  content: BsTreeItem[] = [];
  rooms: Room[] = [];
}
