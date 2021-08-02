import { Component, OnInit } from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css']
})
export class CreateTaskComponent implements OnInit {
  taskType = 1;
  taskProject = 1;
  constructor(public issueManager: IssueManagerService) { }

  ngOnInit(): void {
  }

}
