import {ApplicationRef, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {LanguageService} from "../../../domain/language.service";
import {Issue} from "../../../domain/classes/issue";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {DialogService} from "primeng/dynamicdialog";
import _ from "underscore";
import JSZip from "jszip";
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {saveAs} from "file-saver";
import Delta from "quill-delta";
import {IssueMessage} from "../../../domain/classes/issue-message";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {mouseWheelZoom} from "mouse-wheel-zoom";
import {UserCardComponent} from "../../employees/user-card/user-card.component";
import {GenerationWaitComponent} from "../../tools/trays-by-zones-and-systems/generation-wait/generation-wait.component";
import {DeviceDetectorService} from "ngx-device-detector";
import {group} from "@angular/animations";
import * as XLSX from "xlsx";
import {DeleteComponent} from "../../task/delete/delete.component";
import {File} from "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system";
import { UploadRevisionFilesComponent } from '../hull-esp/upload-revision-files/upload-revision-files.component';
import {HullEspGenerationWaitComponent} from "../hull-esp/hull-esp-generation-wait/hull-esp-generation-wait.component";
import {ClearFilesComponent} from "../hull-esp/clear-files/clear-files.component";
import {AssignNewRevisionComponent} from "../hull-esp/assign-new-revision/assign-new-revision.component";
import {Material} from "../../../domain/classes/material";
import {forkJoin} from "rxjs";
import {PipeEspGenerationWaitComponent} from "./pipe-esp-generation-wait/pipe-esp-generation-wait.component";
import {AddMaterialToEspComponent} from "../device-esp/add-material-to-esp/add-material-to-esp.component";
import {RemoveDeviceFromSystemComponent} from "../device-esp/device-esp-generation-wait/remove-device-from-system/remove-device-from-system.component";
import {GenerateEspComponent} from "../hull-esp/generate-esp/generate-esp.component";
import {UploadMultipleFilesComponent} from "../upload-multiple-files/upload-multiple-files.component";
import {TaskComponent} from "../../task/task.component";

@Component({
  selector: 'app-pipe-esp',
  templateUrl: './pipe-esp.component.html',
  styleUrls: ['./pipe-esp.component.css']
})
export class PipeEspComponent implements OnInit {

  pipes: any = [];
  pipesBySpool: any = [];
  pipesBySpoolSrc: any = [];
  noResult = false;
  docNumber = '';
  project = '';
  department = '';
  selectedRevision = 'PROD';
  messageFilter = 'all';
  comment = false;
  issueId = 0;
  issue: Issue = new Issue();
  selectedPipe = Object();
  cmapView: Window | null = null;
  awaitForLoad: string[] = [];
  loaded: FileAttachment[] = [];
  message = '';
  showImages = false;
  // @ts-ignore
  @ViewChild('img') img;
  image = '';
  // @ts-ignore
  wz;
  // @ts-ignore
  editor;
  groupedByPartCode = false;
  waitForZipFiles = false;
  dxfEnabled = false;
  spoolViewEnabled = false;
  cutEnabled = false;
  dxfEnabledForNesting = false;
  dxfView: Window | null = null;
  spoolView: Window | null = null;
  dxfDoc: string = '';
  search: string = '';
  searchNesting: string = '';
  selectedHeadTab: string = 'Files';
  nestContent: any[] = [];
  miscIssues: Issue[] = [];
  nestContentRead = false;
  showNoSpool = false;
  quillModules =
    {
      imageResize: {},
      clipboard: {
        matchers: [
          // @ts-ignore
          ['img', (node, delta) => {
            let image = delta.ops[0].insert.image;
            if ((image.indexOf(";base64")) != -1){
              let ext = image.substring("data:image/".length, image.indexOf(";base64"))
              let fileName = 'clip' + this.generateId(8)  + '.' + ext;
              const find = this.loaded.find(x => x.name == fileName);
              if (find != null){
                this.loaded.splice(this.loaded.indexOf(find), 1);
              }
              this.awaitForLoad.push(fileName);
              this.appRef.tick();
              fetch(image).then(res => res.blob()).then(blob => {
                const file = new File([blob], fileName,{ type: "image/png" });
                this.issueManager.uploadFile(file, this.auth.getUser().login).then(res => {
                  this.loaded.push(res);
                  this.appRef.tick();
                  this.message += '<img style="cursor: pointer" src="' + res.url + '"/>';
                  this.appRef.tick();
                });
              });
              return new Delta();
            }
            else{
              return delta;
            }
            //return delta;
          }]
        ]
      },
      keyboard: {
        bindings: {
          tab: {
            key: 9,
            handler: function () {
              return true;
            }
          }
        }
      }
    }
  sortValues: any[] = [
    'by Date',
    'by Name',
  ];
  sortValue = this.sortValues[1];
  fileGroups = [
    {
      name: 'Drawings',
      icon: 'assets/icons/drawings.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Part List',
      icon: 'assets/icons/files.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Pipe Spools',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Spool Models',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Other',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Correction',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    }
  ];
  selectedTab = this.fileGroups[0].name;
  issueRevisions: string[] = [];
  filters:  { ELEM_TYPE: any[], MATERIAL: any[], SYMMETRY: any[]  } = { ELEM_TYPE: [],  MATERIAL: [], SYMMETRY: [] };
  cmap = '';
  cmapuser = '';
  cmapdate = 0;
  tooltips: string[] = [];
  selectedView: string = 'tiles';
  pipesSrc: any[] = [];
  spoolsArchive: any;
  spoolsArchiveContent: any[] = [];
  revEsp = '';
  kindEsp = '';
  revEspNoDate = '';
  revUser = '';


  constructor(public device: DeviceDetectorService, public auth: AuthManagerService, private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public t: LanguageService, public issueManager: IssueManagerService, private dialogService: DialogService, private appRef: ApplicationRef) { }

  ngOnInit(): void {

    console.log("pipee")
    this.route.queryParams.subscribe(params => {
      this.project = params.foranProject != null ? params.foranProject : '';
      this.docNumber = params.docNumber != null ? params.docNumber : '';
      this.department = params.department != null ? params.department : '';
      this.issueId = params.issueId != null ? params.issueId : 0;
      this.dxfDoc = params.dxf != null ? params.dxf : '';

      if (this.issue.id == 0){
        this.fillRevisions();
      }
    });
  }
  closeShowImage() {
    this.showImages = false;
    this.img = '';
    this.wz.setSrcAndReset('');
  }
  generateId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }
  getNoneZeroResult(input: string) {
    return input.length == 0 ? '<div class="text-none">Нет</div>' : input;
  }
  getNoneZeroInput(input: string) {
    return input == '-' ? '<div class="text-none">Нет</div>' : input;
  }
  getDateNoTime(dateLong: number): string{
    if (dateLong == 0) {
      return '';
    }
    else{
      let date = new Date(dateLong);
      return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
    }
  }
  getFilters(values: any[], field: string): any[] {
    let res: any[] = [];
    let uniq = _.uniq(values, x => x[field]);
    uniq.forEach(x => {
      res.push({
        label: x[field],
        value: x[field]
      })
    });
    return _.sortBy(res, x => x.label);
  }
  onEditorDrop(event: any) {
    event.preventDefault();
    let files = event.dataTransfer.files;
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          const acceptedImageTypes = ['.jpg', '.jpeg', '.png'];
          let isImage = false;
          acceptedImageTypes.forEach(x => {
            if (file.name.includes(x)){
              isImage = true;
            }
          });
          if (isImage) {
            const find = this.loaded.find(x => x.name == file.name);
            if (find != null) {
              this.loaded.splice(this.loaded.indexOf(find), 1);
            }
            this.awaitForLoad.push(file.name);
            this.issueManager.uploadFile(file, this.auth.getUser().login).then(res => {
              this.message += '<img style="cursor: pointer" src="' + res.url + '"/>';
              this.loaded.push(res);
            });
          }
        }
      }
    }
  }
  getDateModify(dateLong: number){
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  fillPipes(){
    this.s.getPipeSegs(this.docNumber).then(res => {
      if (res != null && res.elements != null && res != '' && res.elements.length != 0){
        this.issue.revision = res.rev;
        let segs = res.elements;
        this.revEsp = res.rev + ' (' + this.getDateModify(res.date) + ')';
        this.revEspNoDate = res.rev;
        this.kindEsp = res.kind;
        this.revUser = this.auth.getUserName(res.user);
        this.pipes = _.sortBy(segs.filter((x: any) => x.spool != '' || this.showNoSpool), x => this.addLeftZeros(x.spool, 5) + this.addLeftZeros(x.spPieceId, 4));
        this.pipesBySpool = _.map(_.groupBy(this.pipes, x => x.spool), x => Object({spool: x[0].spool, values: x, locked: null, dxf: '', aux: x.find(y => y.compType == 'AUX') != null}));
        this.pipesBySpool = _.sortBy(this.pipesBySpool, x => this.addLeftZeros(x.spool, 5));

        this.s.getSpoolLocks(this.docNumber).then(spoolLocks => {
          this.pipesBySpool.forEach((x: any) => {
            x.locked = spoolLocks.find(y => y.spool == x.spool);
          });
        });

        this.issue.revision_files.filter(x => x.group == 'Pipe Spools').forEach(file => {
          // @ts-ignore
          let spool = file.name.split('-').pop().replace('.dxf', '');
          let findSpool = this.pipesBySpool.find((x: any) => x.spool == spool);
          if (findSpool != null){
            findSpool.dxf = file.url;
          }
        });

        this.pipesBySpoolSrc = [...this.pipesBySpool];
        console.log(this.pipesBySpool);

        // let findModel = this.issue.revision_files.find(x => x.group == 'Spool Models');
        // if (findModel != null){
        //
        // }

        // this.filters.ELEM_TYPE = this.getFilters(this.pipes, 'ELEM_TYPE');
        // this.filters.MATERIAL = this.getFilters(this.pipes, 'MATERIAL');
        // this.filters.SYMMETRY = this.getFilters(this.pipes, 'SYMMETRY');
      }
      else{
        this.noResult = true;
      }
    });
  }
  addLeftZeros(value: any, length: number = 4): string {
    let result = value.toString();
    while (result.length < length){
      result = '0' + result;
    }
    return result;
  }
  handleImageInput(files: FileList | null) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          // @ts-ignore
          const find = this.loaded.find(x => x.name == file.name);
          if (find != null){
            this.loaded.splice(this.loaded.indexOf(find), 1);
          }
          this.awaitForLoad.push(file.name);
        }
      }
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          this.issueManager.uploadFile(file, this.auth.getUser().login).then(res => {
            this.message += '<img style="cursor: pointer" src="' + res.url + '"/>';
            this.loaded.push(res);
          });
        }
      }
    }
  }
  sendMessage() {
    let message = new IssueMessage();
    message.author = this.auth.getUser().login;
    message.content = this.message;
    message.file_attachments = this.loaded;
    message.prefix = 'turkey';
    message.to_be_replied = this.auth.hasPerms('needs-reply') ? 1 : 0;
    // @ts-ignore
    this.issueManager.setIssueMessage(this.issue.id, message).then(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
      });
    });
    this.comment = false;
  }
  openUserInfo(author: string) {
    this.dialogService.open(UserCardComponent, {
      showHeader: false,
      modal: true,
      data: author
    });
  }
  getAuthor(author: string) {
    return this.auth.getUserName(author);
  }

  localeGender(userId: string){
    let find = this.auth.users.find(x => x.login == userId);
    return find != null && find.gender == 'female' && this.t.language == 'ru' ? 'а' : '';
  }
  getMessages(issue: Issue) {
    let res: any[] = [];
    issue.messages.filter(x => x.prefix == 'turkey').forEach(x => res.push(x));
    //issue.history.forEach(x => res.push(x));
    // @ts-ignore
    return _.sortBy(res, x => x.date != null ? x.date : x.update_date).reverse();
  }
  remove(file: string) {
    let find = this.loaded.find(x => x.name == file);
    if (find != null){
      this.loaded.splice(this.loaded.indexOf(find), 1);
    }
    let findAwait = this.awaitForLoad.find(x => x == file);
    if (findAwait != null){
      this.awaitForLoad.splice(this.awaitForLoad.indexOf(findAwait), 1);
    }
  }
  handleFileInput(files: FileList | null) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          // @ts-ignore
          const find = this.loaded.find(x => x.name == file.name);
          if (find != null){
            this.loaded.splice(this.loaded.indexOf(find), 1);
          }
          this.awaitForLoad.push(file.name);
        }
      }
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          this.issueManager.uploadFile(file, this.auth.getUser().login).then(res => {
            this.loaded.push(res);
          });
        }
      }
    }
  }
  isLoaded(file: string) {
    return this.loaded.find(x => x.name == file);
  }
  isDesktop() {
    return this.device.isDesktop() && window.innerWidth > 1296;
  }
  fillRevisions(){
    this.issueManager.getIssueDetails(this.issueId).then(res => {
      this.issue = res;
      this.miscIssues.splice(0, this.miscIssues.length);
      this.issueManager.getIssues('op').then(issues => {
        //issues.filter(x => x.doc_number == this.issue.doc_number).forEach(x => this.miscIssues.push(x));
        this.miscIssues.push(this.issue);
        issues.filter(x => this.issue.combined_issues.map(y => y.id).includes(x.id)).forEach(x => {
          if (this.miscIssues.find(y => y.id == x.id) == null){
            this.miscIssues.push(x);
          }
        });
        issues.filter(x => this.issue.child_issues.map(y => y.id).includes(x.id)).forEach(x => {
          if (this.miscIssues.find(y => y.id == x.id) == null){
            this.miscIssues.push(x);
          }
        });
        this.miscIssues.forEach(x => {
          issues.filter(y => y.parent_id == x.id).forEach(ch => {
            if (this.miscIssues.find(y => y.id == ch.id) == null){
              this.miscIssues.push(ch);
            }
          })
        });
      });
      this.issueRevisions.splice(0, this.issueRevisions.length);
      this.issueManager.getIssueDetails(this.issueId).then(res => {
        this.issue = res;
        this.issueRevisions.push(this.issue.revision);
        this.issue.revision_files.map(x => x.revision).forEach(gr => {
          if (!this.issueRevisions.includes(gr)){
            this.issueRevisions.push(gr);
          }
        });
        this.issueRevisions = _.sortBy(this.issueRevisions, x => x).reverse();

        let findSpools = this.issue.revision_files.find(x => x.group == 'Pipe Spools' && x.name.includes('.zip'));
        if (findSpools != null){
          this.spoolsArchive = findSpools;
          this.spoolsArchiveContent.splice(0, this.spoolsArchiveContent.length);
          fetch(findSpools.url).then(response => response.blob()).then(blob => {
            JSZip.loadAsync(blob).then(res => {
              Object.keys(res.files).forEach(file => {
                let name = file.split('/');
                if (name.length > 1 && name[1] != ''){
                  this.spoolsArchiveContent.push(name[1]);
                }
              });
            });
          });

        }
        this.fillPipes();
      });
    });
  }
  editorClicked(event: any) {

    event.preventDefault();
    event.stopPropagation();
    if (event.target.localName == 'img'){
      this.showImage(event.target.currentSrc);
    }
    else if (event.target.localName == 'a'){
      window.open(event.target.href, '_blank');
    }
  }
  showImage(url: string){
    this.image = url;
    this.showImages = true;
    setTimeout(() => {
      if (this.wz == null){
        this.wz = mouseWheelZoom({
          // @ts-ignore
          element: document.querySelector('[data-wheel-zoom]'),
          zoomStep: .25
        });
      }
      this.wz.setSrcAndReset(url);
    });
  }
  round(input: number) {
    return Math.round(input * 100) / 100;
  }
  roundDecimal(input: number){
    return Math.ceil(input);
  }
  roundAngle(input: number) {
    return Math.round( 180 / Math.PI * input * 100) / 100;
  }
  getFileExtensionIcon(file: string) {
    switch (file.toLowerCase().split('.').pop()){
      case 'pdf': return 'pdf.svg';
      case 'dwg': return 'dwg.svg';
      case 'xls': return 'xls.svg';
      case 'xlsx': return 'xls.svg';
      case 'doc': return 'doc.svg';
      case 'docx': return 'doc.svg';
      case 'png': return 'png.svg';
      case 'jpg': return 'jpg.svg';
      case 'txt': return 'txt.svg';
      case 'zip': return 'zip.svg';
      case 'mp4': return 'mp4.svg';
      default: return 'file.svg';
    }
  }
  trimFileName(input: string, length: number = 10): string{
    let split = input.split('.');
    let name = split[0];
    let extension = split[1];
    if (name.length > length){
      return name.substr(0, length - 2) + '..' + name.substr(name.length - 2, 2) + '.' + extension;
    }
    else{
      return input;
    }
  }
  copyTrmCode(code: string, index: string) {
    navigator.clipboard.writeText(code);
    this.tooltips.push(index);
    setTimeout(() => {
      this.tooltips.splice(this.tooltips.indexOf(index), 1);
    }, 1500);
    //this.messageService.add({key:'task', severity:'success', summary:'Copied', detail:'You have copied issue url.'});
  }
  showTooltip(index: string) {
    return this.tooltips.includes(index);
  }
  getDate(dateLong: number): string{
    if (dateLong == 0){
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  localeStatus(status: string){
    if (this.t.language == 'ru'){
      switch (status) {
        case 'Completed' : return 'Завершён';
        case 'In Work': return 'В работе';
        default: return status;
      }
    }
    else{
      return status;
    }
  }
  addFilesToGroup(file_group: string, revision: string) {
    this.dialogService.open(UploadRevisionFilesComponent, {
      showHeader: false,
      modal: true,
      data: [this.issue.id, file_group]
    }).onClose.subscribe(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
        this.fillRevisions();
      });
      if (res == 'uploaded'){
        this.issueManager.notifyDocUpload(this.issue.id).subscribe(() => {});
      }
    });
  }
  downloadFiles(group: string, revision: string) {
    let files = this.getRevisionFilesOfGroup(group, revision);
    let zipped: string[] = [];
    this.waitForZipFiles = true;
    Promise.all(files.map(x => fetch(x.url))).then(blobs => {
      let zip = new JSZip();
      blobs.forEach(blob => {
        // @ts-ignore
        let name: string = blob.url.split('/').pop();
        while (zipped.includes(name)){
          name = name.split('.').reverse().pop() + '$.' + name.split('.').pop();
        }
        name = decodeURI(name);
        zipped.push(name);
        zip.file(name, blob.blob());
      });
      zip.generateAsync({type:"blob"}).then(res => {
        this.waitForZipFiles = false;
        saveAs(res, this.issue.doc_number + '-' + new Date().getTime() + '.zip');
      });
    });
  }


  showComment() {
    this.comment = true;
    this.message = '';
    this.awaitForLoad = [];
    this.loaded = [];
    setTimeout(() => {
      this.editor.focus();
    })
  }
  onEditorPressed(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      this.sendMessage();
    }
  }
  editorInit(event: any) {
    this.editor = event;
  }

  getRevisionFilesOfGroup(fileGroup: string, revision: string): FileAttachment[] {
    return _.sortBy(this.issue.revision_files.filter(x => (x.group == fileGroup || fileGroup == 'all') && x.revision == revision), x => x.upload_date + x.name).reverse();
  }

  createEsp(value: string = '1') {
    this.dialogService.open(PipeEspGenerationWaitComponent, {
      showHeader: false,
      modal: true,
      data: [this.issue, this.project]
    }).onClose.subscribe(() => {
      this.fillRevisions();
    });
  }

  show2dEnabled(){
    return this.issue.revision_files.find(x => x.group == 'Pipe Spools' && x.name.includes('.zip')) != null;
  }
  show3dEnabled(){
    return this.issue.revision_files.find(x => x.group == 'Spool Models' && x.name.includes('.zip')) != null;
  }
  clearFiles(fileGroup: string, revision: string) {
    this.dialogService.open(ClearFilesComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.issueManager.clearRevisionFiles(this.issue.id, this.auth.getUser().login, fileGroup, revision).then(() => {
          this.fillRevisions();
        });
      }
    });
  }
  deleteFile(fileUrl: string){
    this.dialogService.open(ClearFilesComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.issueManager.deleteRevisionFile(fileUrl, this.auth.getUser().login).then(() => {
          this.fillRevisions();
        });
      }
    });
  }

  exportSketches() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = [];
    _.forEach(_.groupBy(_.sortBy(this.pipes, x => x.spool + '#' + x.stock + '#' + x.typeCode + '#' + x.material.name), x => {return x.spool + '#' + x.stock + '#' + x.typeCode}), group => {
      let summ = 0;
      let weight = 0;
      group.forEach((pipe: any) => {
        weight += pipe.weight;
        summ += pipe.length;
      });
      if (group[0].material.units == '796'){
        summ = group.length;
      }
      else{
        summ = Math.round(summ / 10) / 100;
      }
      data.push({
        SPOOL: group[0].spool,
        MATERIAL: group[0].material.name,
        UNITS: group[0].material.units,
        COUNT: summ,
        WEIGHT_TOTAL: Math.round(weight * 100) / 100,
      });
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    worksheet['!cols'] = [{wch:10},{wch:85},{wch:10},{wch:10},{wch:15}];

    XLSX.writeFile(workbook, fileName);
  }

  getArchive() {
    return _.sortBy(this.issue.archive_revision_files, x => x.removed_date).reverse();
  }


  selectPipe(pipe: any) {
    this.selectedPipe = pipe;
  }

  openFile(file: FileAttachment) {
    window.open(file.url, '_blank');
  }
  newImportantMessage() {
    let res = 0;
    let completed = false;
    _.sortBy(this.getMessages(this.issue), x => x.date).reverse().forEach(msg => {
      if (msg.to_be_replied == 1 && msg.author != this.auth.getUser().login && !completed){
        res += 1;
      }
      else{
        completed = true;
      }
    });
    return res;
  }
  mw(value: number){
    return {
      'min-width': value + '%'
    }
  }

  getPipeDefs(selectedPipe: any) {
    let res = [];
    res.push({name: 'Code', value: selectedPipe.material.code});
    res.push({name: 'Units', value: selectedPipe.material.units});
    res.push({name: 'Single Weight', value: selectedPipe.material.singleWeight});
    res.push({name: 'Document', value: selectedPipe.material.document});
    res.push({name: 'Provider', value: selectedPipe.material.provider});
    res.push({name: 'Spool', value: selectedPipe.spool});
    res.push({name: 'Spool Piece', value: selectedPipe.spPieceId});
    res.push({name: 'Type Code', value: selectedPipe.typeCode});
    res.push({name: 'Zone', value: selectedPipe.zone});
    res.push({name: 'SMAT', value: selectedPipe.smat});
    res.push({name: 'Length', value: selectedPipe.length});
    res.push({name: 'Radius', value: selectedPipe.radius});
    res.push({name: 'Angle', value: selectedPipe.angle});
    res.push({name: 'Weight', value: selectedPipe.weight});
    res.push({name: 'Insul', value: selectedPipe.insul});
    return res;
  }

  isGS(values: any[]) {
    return values.find((x: any) => x.smat.toLowerCase().includes('sg1')) != null;
  }

  lockSpool(pipeSpool: any) {
    let curLock = pipeSpool.locked == null ? 0 : pipeSpool.locked.lock;
    this.s.setSpoolLock(Object({issueId: this.issue.id, docNumber: this.docNumber, spool: pipeSpool.spool, lock: curLock, user: this.auth.getUser().login, date: new Date().getTime()})).then(res => {
      this.fillPipes();
    });
  }

  showDxf(){
    if (this.dxfEnabledForNesting){
      this.dxfEnabledForNesting = false;
    }
    else{
      this.dxfEnabled = !this.dxfEnabled;
    }
    this.router.navigate([], {queryParams: {dxf: null, search: null, searchNesting: null}, queryParamsHandling: 'merge'}).then(() => {
      this.router.navigate([], {queryParams: {dxf: this.getRevisionFilesOfGroup('Drawings', this.selectedRevision).find(x => x.name.includes('.dxf'))?.url}, queryParamsHandling: 'merge'});
    });
  }
  isDisabledDxf(){
    return this.issue == null || this.issue.revision_files == null || this.getRevisionFilesOfGroup('Drawings', this.selectedRevision).find(x => x.name.includes('.dxf')) == null;
  }

  showDxfInViewer(url: string) {
    if (!this.dxfEnabled){
      this.dxfEnabled = !this.dxfEnabled;
    }
    this.router.navigate([], {queryParams: {dxf: null, searchSpool: null, searchNesting: null}, queryParamsHandling: 'merge'}).then(() => {
      // @ts-ignore
      this.router.navigate([], {queryParams: {dxf: url, searchSpool: null, searchNesting: null}, queryParamsHandling: 'merge'});
    });
  }
  showDxfInViewerZip(zip: FileAttachment, file: string) {
    fetch(zip.url).then(response => response.blob()).then(blob => {
      JSZip.loadAsync(blob).then(res => {
        let findSpool = Object.keys(res.files).find(x => x.includes(file));
        if (findSpool != null){
          res.files[findSpool].async('string').then(fileBlob => {
            let blob = new Blob([fileBlob], {type: 'text/plain'});
            let fileUpload = new File([blob], file);
            this.issueManager.uploadFile(fileUpload, zip.author, zip.name).then(fileAttachment => {
              if (!this.dxfEnabled){
                this.dxfEnabled = !this.dxfEnabled;
              }
              this.router.navigate([], {queryParams: {dxf: null, searchSpool: null, searchNesting: null}, queryParamsHandling: 'merge'}).then(() => {
                // @ts-ignore
                this.router.navigate([], {queryParams: {dxf: fileAttachment.url, searchSpool: null, searchNesting: null}, queryParamsHandling: 'merge'});
              });
            });
          });
        }
      });
    });
  }
  openDxf() {
    if (this.dxfView != null && !this.dxfView.closed){
      this.dxfView.close();
    }
    let url = '/dxf-view?navi=0&window=1&dxf=' + this.dxfDoc + (this.search != '' ? '&search=' + this.search : '');
    this.dxfEnabledForNesting = false;
    this.dxfEnabled = false;
    this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
  }
  exitDxf(){
    this.dxfEnabled = false;
    this.cutEnabled = false;
    this.dxfEnabledForNesting = false;
  }
  downloadDxf(url: string){
    window.open(url, '_blank');
  }

  searchSpool(spool: string) {
    if (this.dxfView != null && !this.dxfView.closed){
      this.dxfView.postMessage({searchSpool: spool}, '*');
    }
    if (this.dxfEnabled){
      this.router.navigate([], {queryParams: {dxf: null, searchSpool: null}, queryParamsHandling: 'merge'}).then(() => {
        this.router.navigate([], {queryParams: {dxf: this.getRevisionFilesOfGroup('Drawings', this.selectedRevision).find(x => x.name.includes('.dxf'))?.url, searchSpool: spool}, queryParamsHandling: 'merge'});
      });
    }
  }
  searchSpools() {
    if (this.search.trim() == '') {
      this.pipesBySpool = this.pipesBySpoolSrc;
    } else {
      this.pipesBySpool = this.pipesBySpoolSrc.filter((x: any) => {
        let visible = false;
        x.values.forEach((v: any) => {
          if (x == null || (v.spool + v.material.name + v.stock).trim().toLowerCase().includes(this.search.toString().trim().toLowerCase())){
            visible = true;
          }
        });
        return visible;
      });
    }
  }
  showSpoolInViewer(spool: string) {
    if (!this.spoolViewEnabled){
      this.spoolViewEnabled = !this.spoolViewEnabled;
    }
    this.router.navigate([], {queryParams: {docNumber: this.docNumber, spool: null}, queryParamsHandling: 'merge'}).then(() => {
      // @ts-ignore
      this.router.navigate([], {queryParams: {docNumber: this.docNumber, spool: spool}, queryParamsHandling: 'merge'});
    });
  }
  showSpoolModel(spool: any) {
    if (this.spoolView != null && !this.spoolView.closed){
      this.spoolView.close();
    }
    let url = '/spool-view?navi=0&window=1&docNumber=' + this.docNumber + '&spool=' + spool;
    this.spoolViewEnabled = false;
    this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
  }
  getMaterialName(pipe: any){
    let material = pipe.material as Material;
    if (pipe.typeCode == 'HVAC'){
      return material.name;
    }
    else{
      let name = material.name;
      let desc = material.description;
      let findName = material.translations.find(x => x.lang == this.t.language);
      if (findName != null && findName.name != ''){
        name = findName.name;
        desc = material.description;
      }
      let res = name;
      if (desc != ''){
        res = name + ' (' + desc + ')';
      }
      return res;
    }
  }
  downloadFileFromZip(zip: FileAttachment, file: string) {
    fetch(zip.url).then(response => response.blob()).then(blob => {
      JSZip.loadAsync(blob).then(res => {
        let findSpool = Object.keys(res.files).find(x => x.includes(file));
        if (findSpool != null){
          res.files[findSpool].async('string').then(fileBlob => {
            let blob = new Blob([fileBlob], {type: 'text/plain'});
            const element = document.createElement('a');
            element.setAttribute('href', URL.createObjectURL(blob));
            element.setAttribute('download', file);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          });
        }
      });
    });
  }

  showNoSpoolChanged() {
    this.pipes.splice(0, this.pipes.length);
    this.pipesBySpool.splice(0, this.pipesBySpool.length);
    this.fillPipes();
  }

  openIssueModal(id: number) {
    console.log("openIssue")
    this.issueManager.getIssueDetails(id).then(res => {
      console.log(res);
      if (res.id != null) {
        this.dialogService.open(TaskComponent, {
          showHeader: false,
          modal: true,
          data: res
        })
      }
    });
  }

  addMaterial() {
    this.dialogService.open(AddMaterialToEspComponent, {
      showHeader: false,
      modal: true,
      data: [this.docNumber, '-', '', '']
    }).onClose.subscribe(res => {
      this.s.createPipeEsp(this.project, this.issue.doc_number, this.issue.revision, this.auth.getUser().login, 'pipe', this.issue.id).subscribe(res => {
        this.fillPipes();
      });
      // this.issueManager.getIssueDetails(this.issue.id).then(issue => {
      //   this.issue = issue;
      //   this.fillRevisions();
      // });
    });
  }

  deleteAux(p: any) {
    this.search = '';
    this.dialogService.open(RemoveDeviceFromSystemComponent, {
      showHeader: false,
      modal: true,
      data: [this.docNumber, p.material.code, p.material.units, p.length, p.spool, '', 'pipes']
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.issueManager.getIssueDetails(this.issue.id).then(issue => {
          this.issue = issue;
          this.fillRevisions();
        });
      }
    });
  }
  openIssue(id: number) {
    window.open('/?taskId=' + id, '_blank');
  }
  refreshEsp() {
    this.dialogService.open(GenerateEspComponent, {
      showHeader: false,
      modal: true,
      data: [this.issue, this.project, this.kindEsp, this.revEspNoDate]
    }).onClose.subscribe(() => {
      this.fillRevisions();
    });
  }

  addFilesCommon() {
    this.dialogService.open(UploadMultipleFilesComponent, {
      showHeader: false,
      modal: true,
      data: [this.issue, this.project, this.kindEsp, this.revEspNoDate]
    }).onClose.subscribe(() => {
      this.fillRevisions();
    });
  }
}
