import {Component, Inject, OnInit} from '@angular/core';
import {AddFilesDataService} from "../../../domain/add-files-data.service";
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import _ from "underscore";
import {EquipmentsFiles} from "../../../domain/classes/equipments-files";
import {fil} from "date-fns/locale";
import {EquipmentsService} from "../../../domain/equipments.service";
import {IEquipment} from "../../../domain/interfaces/equipments";
import {Issue} from "../../../domain/classes/issue";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {
  UploadRevisionFilesComponent
} from "../../documents/hull-esp/upload-revision-files/upload-revision-files.component";

@Component({
  selector: 'app-add-files',
  templateUrl: './add-equipment-files.component.html',
  styleUrls: ['./add-equipment-files.component.css']
})

export class AddEquipmentFilesComponent implements OnInit {
  issue: Issue;
  fileGroups: any[] = ['ITT', 'Specification', 'Documentation', 'Approvement'];
  isCorrection = false;
  isSendNotification = true;
  closeTask = false;
  revs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
  rev = '1';
  changeRev = true;
  comment = '';
  loaded: FileAttachment[] = [];
  awaitForLoad: any[] = [];
  dragFileGroup: string = '';

  equipmentFilesToDB: EquipmentsFiles[] = [];

  constructor(public conf: DynamicDialogConfig, private dialogService: DialogService, public issueManager: IssueManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, public t: LanguageService, public eqService: EquipmentsService) {
    console.log('eqService.getWaitingCreateEqFiles()');
    console.log(eqService.getWaitingCreateEqFiles());
    this.loaded = eqService.getWaitingCreateEqFiles();
  }

  getRevisionFilesOfGroup(fileGroup: string): FileAttachment[] {
    let files = this.loaded.filter(x => (x.group == fileGroup || fileGroup == 'all'));
    return _.sortBy(files, x => x.upload_date).reverse();
  }

  ngOnInit(): void {
  }

  reformatFileName(name: string, fileGroup: string) {
    let result = name;
    if (fileGroup == 'Drawings') {
      //result = this.issue.doc_number + name.split('.').pop();
    }
    if (fileGroup == 'Nesting Plates') {
      result = 'N-' + name.replace('_0_', '_').split('_').join('-');
    }
    if (fileGroup == 'Nesting Profiles') {
      if (name.includes('.pdf')) {
        //result = 'Nesting Profiles' + '.pdf';
      } else {
        result = 'P-' + name.split('_').join('-');
      }
    }
    if (fileGroup == 'Profile Sketches' && !name.includes('.txt')) {
      if (name.includes('.pdf')) {
        //result = 'Profile Sketches' + '.pdf';
      } else {
        result = name.split('_').join('-');
      }
    }
    if (fileGroup == 'Cutting Map' && !name.includes('C-')) {
      result = 'C-' + this.issue.project.replace('NR', 'N') + '-' + name.split('_')[0] + '-' + name.split('_')[1] + '.txt';
      if (name.includes('rev')) {
        result = 'C-' + this.issue.project.replace('NR', 'N') + '-' + name.split('_')[0] + '-' + name.split('_')[1] + '-' + name.split('_')[3];
      }
    }
    return result.replace('-rev', '_rev');
  }

  handleFileInput(files: FileList | null, fileGroup: string) {
    if (files != null) {
      for (let x = 0; x < files.length; x++) {
        let file = files.item(x);
        if (file != null) {
          let fileName = this.reformatFileName(file.name, fileGroup);
          // @ts-ignore
          const find = this.loaded.find(x => x.name == fileName);
          if (find != null) {
            this.loaded.splice(this.loaded.indexOf(find), 1);
          }
          this.awaitForLoad.push(fileName);
        }
      }
      for (let x = 0; x < files.length; x++) {
        let file = files.item(x);
        if (file != null) {
          let fileName = this.reformatFileName(file.name, fileGroup);
          this.issueManager.uploadFile(file, this.auth.getUser().login, fileName).then(res => {
            res.group = fileGroup;
            this.loaded.push(res);
            this.eqService.setWaitingCreateEqFiles(this.loaded);
            console.log(this.loaded);
          });
        }
      }
    }
  }

  onFilesDrop(event: DragEvent, fileGroup: string) {
    event.preventDefault();
    // @ts-ignore
    this.handleFileInput(event.dataTransfer.files, fileGroup);
  }

  getFileExtensionIcon(file: string) {
    switch (file.toLowerCase().split('.').pop()) {
      case 'pdf':
        return 'pdf.svg';
      case 'dwg':
        return 'dwg.svg';
      case 'xls':
        return 'xls.svg';
      case 'xlsx':
        return 'xls.svg';
      case 'doc':
        return 'doc.svg';
      case 'docx':
        return 'doc.svg';
      case 'png':
        return 'png.svg';
      case 'jpg':
        return 'jpg.svg';
      case 'txt':
        return 'txt.svg';
      case 'zip':
        return 'zip.svg';
      case 'mp4':
        return 'mp4.svg';
      default:
        return 'file.svg';
    }
  }

  trimFileName(input: string, length: number = 10): string {
    let split = input.split('.');
    let name = split[0];
    let extension = split[1];
    if (name.length > length) {
      return name.substr(0, length - 2) + '..' + name.substr(name.length - 2, 2) + '.' + extension;
    } else {
      return input;
    }
  }

  openFile(file: FileAttachment) {
    window.open(file.url, '_blank');
  }

  deleteFile(file: FileAttachment) {
    this.loaded.splice(this.loaded.indexOf(file), 1);
    this.eqService.setWaitingCreateEqFiles(this.loaded);
  }

  close() {
    this.ref.close();
  }

  //submit(fileGroup: string) {
  // console.log(fileGroup);
  // const eqFilesByGroupToDB: EquipmentsFiles[] = [];
  // this.loaded.filter(x => x.group == fileGroup).forEach(file => {
  //   console.log(file);
  //   console.log(this.refactorFile(file));
  //   eqFilesByGroupToDB.push(this.refactorFile(file));
  // });
  // this.clearFilesOfGroup(fileGroup);
  // console.log('submit');
  // console.log('this.loaded before' );
  // console.log(this.loaded);
  // console.log('eqFilesByGroupToDB');
  // console.log(eqFilesByGroupToDB);
  // console.log('this.loaded after' );
  // console.log(this.loaded);

  //}

  clearFilesOfGroup(name: string) {
    this.loaded = this.loaded.filter(x => x.group != name);
    this.eqService.setWaitingCreateEqFiles(this.loaded);
  }

  dragEnter(event: DragEvent, name: string) {
    this.dragFileGroup = name;
  }

  dragLeave(event: DragEvent, name: string) {
    this.dragFileGroup = '';
  }

  refactorFile(fromFile: FileAttachment) {
    const resultEqFile = new EquipmentsFiles();
    resultEqFile.equ_id = 0;
    resultEqFile.url = fromFile.url;
    resultEqFile.rev = this.rev;
    resultEqFile.type = fromFile.group;
    resultEqFile.user_id = this.auth.getUser().id;
    return resultEqFile;
  }

  releaseFiles(event: any) {
    event.target.value = null;
  }

  commit() {
    const eqFilesByGroupToDB: EquipmentsFiles[] = [];
    this.loaded.forEach(file => {
      console.log(file);
      console.log(this.refactorFile(file));
      eqFilesByGroupToDB.push(this.refactorFile(file));
    });
    this.eqService.setCreateEqFiles(eqFilesByGroupToDB);
    this.close();
    this.eqService.setWaitingCreateEqFiles([]);
  }
}
