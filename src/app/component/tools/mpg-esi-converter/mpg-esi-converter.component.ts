import { Component, OnInit } from '@angular/core';
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-mpg-esi-converter',
  templateUrl: './mpg-esi-converter.component.html',
  styleUrls: ['./mpg-esi-converter.component.css']
})
export class MpgEsiConverterComponent implements OnInit {

  constructor(public s: SpecManagerService, public auth: AuthManagerService, public t: LanguageService, public ref: DynamicDialogRef) { }
  loaded: any[] = [];
  loadCount = 0;
  extensions = ['.mpg', '.esi'];
  extension = this.extensions[0];
  ngOnInit(): void {
  }
  handleFileInput(files: FileList | null) {
    if (files != null){
      this.loadCount = files.length;
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        let reader = new FileReader();
        reader.onload = (res) => {
          // @ts-ignore
          let name = file.name.replace('.txt', this.extension);
          // @ts-ignore
          let l = res.target.result;
          if (this.extension == '.mpg'){
            // @ts-ignore
            this.s.createCNC(l.split('\n'), this.auth.getUser().login).then(res => {
              this.loaded.push({fileName: name, data: res.join('\n')});
            });
          }
          else{
            // @ts-ignore
            this.s.createESSI(l.split('\n'), this.auth.getUser().login).then(res => {
              this.loaded.push({fileName: name, data: res.join('\n')});
            });
          }
        };
        if (file != null){
          reader.readAsText(file);
        }
      }
    }
  }
  download(){
    let zip = new JSZip();
    this.loaded.forEach(file => {
      let blob = new Blob([file.data], {type: 'text/plain'});
      zip.file(file.fileName, blob);
    });
    zip.generateAsync({type:"blob"}).then(res => {
      let zipName = this.extension + new Date().getTime() + '.zip';
      saveAs(res, zipName);
    });
  }
  close() {
    this.ref.close();
  }
}
