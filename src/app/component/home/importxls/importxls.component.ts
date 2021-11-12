import { Component, OnInit } from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import * as XLSX from "xlsx";
import {Issue} from "../../../domain/classes/issue";
import {IssueManagerService} from "../../../domain/issue-manager.service";

@Component({
  selector: 'app-importxls',
  templateUrl: './importxls.component.html',
  styleUrls: ['./importxls.component.css']
})
export class ImportxlsComponent implements OnInit {

  constructor(public ref: DynamicDialogRef, private issueManager: IssueManagerService) { }

  ngOnInit(): void {
  }
  handleFileImport(files: FileList | null) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          const reader: FileReader = new FileReader();
          reader.onload = (e: any) => {
            /* read workbook */
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

            /* grab first sheet */
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];

            const json = XLSX.utils.sheet_to_json(ws, {header: 1, range: 1});
            json.forEach(x => {
              let row = x as any[];
              let col = -1;
              let issue = new Issue();
              issue.issue_type = row[++col];
              issue.project = row[++col];
              issue.doc_number = row[++col];
              issue.name = row[++col];
              issue.started_by = row[++col];
              issue.responsible = row[++col];
              issue.department = row[++col];
              issue.details = row[++col];
              issue.period = row[++col];
              this.issueManager.startIssue(issue).then(res => {
                this.ref.close('imported');
              });
            });

          };
          reader.readAsBinaryString(file);
        }
      }
    }
  }

  getTemplate() {
    window.open('/assets/importIssues.xlsx');
  }
  close(){
    this.ref.close('exit');
  }
}
