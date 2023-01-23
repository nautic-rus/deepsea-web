import {Component, OnInit, ViewChild} from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {Issue} from "../../domain/classes/issue";
import {TaskComponent} from "../task/task.component";
import {DialogService} from "primeng/dynamicdialog";
import {CreateTaskComponent} from "../create-task/create-task.component";
import {LanguageService} from "../../domain/language.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DeviceDetectorService} from "ngx-device-detector";
import * as _ from "underscore";

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.css']
})
export class SectionsComponent implements OnInit {
  issues: Issue[] = [];
  projects: string[] = ['NR002', 'NR004'];
  project = this.projects[0];
  nestingFiles: any[] = [];

  constructor(public device: DeviceDetectorService, public t: LanguageService, private issueManager: IssueManagerService, public auth: AuthManagerService, private dialogService: DialogService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.fillIssues();
    this.route.queryParams.subscribe(params => {
      this.project = params.project != null ? params.project : this.project;
      this.projects.forEach(project => {
        if (!this.auth.getUser().visible_projects.includes(project)){
          this.projects.splice(this.projects.indexOf(project), 1);
        }
      });
      if (!this.auth.getUser().visible_projects.includes(this.project)){
        this.project = this.projects[0];
      }
    });
  }
  fillIssues() {
    this.issueManager.getIssues('op').then(data => {
      this.issueManager.getNestingFiles().then(nestingFiles => {
        this.issues = data;
        this.nestingFiles = nestingFiles;
      });
    });
  }
  getStyle(s: string) {
    let find = this.issues.find(x => x.name.includes('Секция ' + s));
    let status = '';
    if (find != null){
      status = find.status;
    }
    switch (status){
      case 'In Work': return {'background-color': '#c8e6c9', border: 'none', color: '#256029', 'font-weight': 600};
      case 'Resolved': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'New': return {'background-color': '#b3e5fc', border: 'none', color: '#23547b', 'font-weight': 600};
      case 'AssignedTo': return {'background-color': '#dbe9a0', border: 'none', color: '#606a33', 'font-weight': 600};
      case 'Rejected': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'Check': return {'background-color': '#eccfff', border: 'none', color: '#694382', 'font-weight': 600};
      case 'In Rework': return {'background-color': '#cbebf1', border: 'none', color: '#3f6b73', 'font-weight': 600};
      case 'Paused': return {'background-color': '#feedaf', border: 'none', color: '#8a5340', 'font-weight': 600};
      case 'Archive': return {'background-color': '#C4E1A8', border: '1px solid #606a26', color: '#606a26'};
      case 'Not resolved': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'Closed': return {'background-color': '#C4E1A8', border: '1px solid #606a26', color: '#606a26'};
      case 'Send to Approval': return {'background-color': '#ffd8b2', border: 'none', color: '#805b36', 'font-weight': 600};
      case 'Approved': return {'background-color': '#ceede1', border: 'none', color: '#2e604b', 'font-weight': 600};
      case 'Not approved': return {'background-color': '#F5BBB2', border: 'none', color: '#a3392b', 'font-weight': 600};
      case 'Ready to send': return {'background-color': '#DCEFED', border: 'none', color: '#4A7863', 'font-weight': 600};
      case 'On reApproval': return {'background-color': '#feeccd', border: 'none', color: '#d78a16', 'font-weight': 600};
      case 'Ready to Delivery': return {'background-color': '#cbc4d7', border: 'none', color: '#393346', 'font-weight': 600};
      case 'Send to Yard Approval': return {'background-color': '#f8c1d5', border: 'none', color: '#895169', 'font-weight': 600};
      case 'Delivered': return {'background-color': '#dae4ff', border: 'none', color: '#454955', 'font-weight': 600};
      default: {
      }
    }
    return{};
  }
  getNewIssueStyle(issueId: number) {
    let find = this.issues.find(x => x.id == issueId);
    let status = '';
    if (find != null){
      status = find.status;
    }
    switch (status){
      case 'In Work': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Resolved': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'New': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'AssignedTo': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Rejected': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Check': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'In Rework': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Paused': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Archive': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Not resolved': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Closed': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Send to Approval': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Approved': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Not approved': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Ready to send': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'On reApproval': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Ready to Delivery': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Hold': return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
      case 'Send to Yard Approval': return {'background-color': '#feeccd', border: 'none', color: '#d78a16', 'font-weight': 600};
      case 'Delivered': return {'background-color': '#c8e6c9', border: 'none', color: '#256029', 'font-weight': 600};
      default: {
      }
    }
    return{};
  }
  getStyleTurk(s: string) {
    let find = this.issues.find(x => x.name.includes('Block ' + s));
    let status = '';
    if (find != null){
      status = find.status;
    }
    switch (status){
      case 'In Work': return {'background-color': '#c8e6c9', border: 'none', color: '#256029', 'font-weight': 600};
      case 'Resolved': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'New': return {'background-color': '#b3e5fc', border: 'none', color: '#23547b', 'font-weight': 600};
      case 'AssignedTo': return {'background-color': '#dbe9a0', border: 'none', color: '#606a33', 'font-weight': 600};
      case 'Rejected': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'Check': return {'background-color': '#eccfff', border: 'none', color: '#694382', 'font-weight': 600};
      case 'In Rework': return {'background-color': '#cbebf1', border: 'none', color: '#3f6b73', 'font-weight': 600};
      case 'Paused': return {'background-color': '#feedaf', border: 'none', color: '#8a5340', 'font-weight': 600};
      case 'Archive': return {'background-color': '#C4E1A8', border: '1px solid #606a26', color: '#606a26'};
      case 'Not resolved': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'Closed': return {'background-color': '#C4E1A8', border: '1px solid #606a26', color: '#606a26'};
      case 'Send to Approval': return {'background-color': '#ffd8b2', border: 'none', color: '#805b36', 'font-weight': 600};
      case 'Approved': return {'background-color': '#ceede1', border: 'none', color: '#2e604b', 'font-weight': 600};
      case 'Not approved': return {'background-color': '#F5BBB2', border: 'none', color: '#a3392b', 'font-weight': 600};
      case 'Ready to send': return {'background-color': '#DCEFED', border: 'none', color: '#4A7863', 'font-weight': 600};
      case 'On reApproval': return {'background-color': '#feeccd', border: 'none', color: '#d78a16', 'font-weight': 600};
      case 'Ready to Delivery': return {'background-color': '#cbc4d7', border: 'none', color: '#393346', 'font-weight': 600};
      case 'Send to Yard Approval': return {'background-color': '#f8c1d5', border: 'none', color: '#895169', 'font-weight': 600};
      case 'Delivered': return {'background-color': '#dae4ff', border: 'none', color: '#454955', 'font-weight': 600};
      default: {
      }
    }
    return{};
  }

  getIssueStyle(id: number){
    let filesFound = this.nestingFiles.find(x => id == x.issue_id) != null;
    if (filesFound){
      return {'background-color': '#c8e6c9', border: 'none', color: '#256029', 'font-weight': 600};
    }
    else{
      return { border: '1px solid #CAD2D3', color: '#777777', 'font-weight': 600, background: 'repeating-linear-gradient(45deg, #DFDFDF, #DFDFDF 5px, #fff 5px, #fff 10px)'};
    }
  }
  // viewTask(s: string) {
  //   let find = this.issues.find(x => x.name.includes('Секция ' + s) || x.name.includes('Block ' + s));
  //   if (find != null){
  //     this.issueManager.getIssueDetails(find.id).then(res => {
  //       this.dialogService.open(TaskComponent, {
  //         showHeader: false,
  //         modal: true,
  //         data: res
  //       })
  //     });
  //   }
  // }

  isDesktop() {
    return this.device.isDesktop() && window.innerWidth > 1200;
  }
  viewTask(issueId: number) {
    let issue = this.issues.find(x => x.id == issueId);
    if (issue != null){
      let foranProject = issue.project.replace('NR', 'N');
      let department = issue.department;
      let docNumber = issue.doc_number;
      window.open(`/hull-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank');
    }
  }

  viewTaskTurk(s: string) {
    let find = this.issues.find(x => x.name.includes('Block ' + s));
    if (find != null){
      this.issueManager.getIssueDetails(find.id).then(res => {
        this.dialogService.open(TaskComponent, {
          showHeader: false,
          modal: true,
          data: res
        })
      });
    }
  }

  changeProject() {
    this.router.navigate([], {queryParams: {project: this.project}});
  }
}
