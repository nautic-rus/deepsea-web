import {ApplicationRef, Component, OnInit, ViewChild} from '@angular/core';
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {DeviceDetectorService} from "ngx-device-detector";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LanguageService} from "../../../domain/language.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {DialogService} from "primeng/dynamicdialog";
import {Issue} from "../../../domain/classes/issue";
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {File} from "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system";
import Delta from "quill-delta";
import _ from "underscore";
import {IssueMessage} from "../../../domain/classes/issue-message";
import {UserCardComponent} from "../../employees/user-card/user-card.component";
import JSZip from "jszip";
import {mouseWheelZoom} from "mouse-wheel-zoom";
import {UploadRevisionFilesComponent} from "../hull-esp/upload-revision-files/upload-revision-files.component";
import {saveAs} from "file-saver";
import {PipeEspGenerationWaitComponent} from "../pipe-esp/pipe-esp-generation-wait/pipe-esp-generation-wait.component";
import {ClearFilesComponent} from "../hull-esp/clear-files/clear-files.component";
import * as XLSX from "xlsx";
import {DeviceEspGenerationWaitComponent} from "./device-esp-generation-wait/device-esp-generation-wait.component";
import {AddMaterialToEspComponent} from "./add-material-to-esp/add-material-to-esp.component";
import {AddGroupDeviceComponent} from "./add-group-device/add-group-device.component";
import {RemoveWeightComponent} from "../../weight-control/remove-weight/remove-weight.component";
import {
  RemoveDeviceFromSystemComponent
} from "./device-esp-generation-wait/remove-device-from-system/remove-device-from-system.component";
import {Material} from "../../../domain/classes/material";
import {UploadMultipleFilesComponent} from "../upload-multiple-files/upload-multiple-files.component";
import {TaskComponent} from "../../task/task.component";

@Component({
  selector: 'app-device-esp',
  templateUrl: './device-esp.component.html',
  styleUrls: ['./device-esp.component.css']
})
export class DeviceEspComponent implements OnInit {

  devices: any = [];
  devicesGrouped: any = [];
  devicesSrc: any = [];
  devicesSrcGrouped: any = [];
  noResult = false;
  docNumber = '';
  project = '';
  department = '';
  selectedRevision = 'PROD';
  messageFilter = 'all';
  comment = false;
  issueId = 0;
  issue: Issue = new Issue();
  selectedDevice = Object();
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
  nestContentRead = false;
  miscIssues: Issue[] = [];
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
  editing: number = 0;
  newLabel = '';
  prevLabel: string = '';
  revEsp = '';
  kindEsp = '';
  foranProject = '';
  revEspNoDate = '';
  revUser = '';
  userIdsReplace: any[] = [];

  constructor(public device: DeviceDetectorService, public auth: AuthManagerService, private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public t: LanguageService, public issueManager: IssueManagerService, private dialogService: DialogService, private appRef: ApplicationRef) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.foranProject != null ? params.foranProject : '';
      this.docNumber = params.docNumber != null ? params.docNumber : '';
      this.department = params.department != null ? params.department : '';
      this.issueId = params.issueId != null ? params.issueId : 0;
      this.dxfDoc = params.dxf != null ? params.dxf : '';

      let r = new RegExp('200101-100-10[0-8]');
      if (r.test(this.docNumber)){
        this.project = 'NT02';
      }


      if (this.issue.id == 0){
        this.issueManager.getIssueDetails(this.issueId).then(res => {
          this.issue = res;
          this.fillRevisions();
        })
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
  fillDevicesAux(){
    this.s.getDevices(this.docNumber).then(res => {
      if (res.length > 0){
        console.log(res);
        this.devices = _.sortBy(res.filter((x: any) => x.elemType != 'accommodation'), x => this.addLeftZeros(x.userId, 5));
        if (this.devices.find((x: any) => x.userId.includes('#')) != null){
          this.devices.forEach((d: any) => {
            if (d.userId.includes('#')){
              let r = new RegExp('\\d+(?=#)');
              d.userIdGrouped = (d.parentUserId != '' ? d.origUserId : r.exec(d.userId)?.[0]);
            }
          });
          this.devicesGrouped.splice(0, this.devicesGrouped.length);
          _.forEach(_.groupBy(this.devices, x => x.userIdGrouped), g => {
            let newDevice = JSON.parse(JSON.stringify(g[0]));
            newDevice.userId = newDevice.userIdGrouped;
            let count = 0;
            g.forEach(x => count += x.count);
            newDevice.count = count;
            this.devicesGrouped.push(newDevice);
          });
          this.devices = this.devicesGrouped;
        }

        _.forEach(_.groupBy(res.filter((x: any) => x.elemType == 'accommodation'), x => x.material.code), g => {
          let newDevice = JSON.parse(JSON.stringify(g[0]));
          let sum = 0;
          g.forEach(x => sum += x.weight);
          newDevice.weight = sum;
          this.devices.push(newDevice);
        });

        let findSplit = this.devices.filter((x: any) => x.userId.includes('.') && x.userId.split('.').length > 1);
        if (findSplit.length > 0){
          let min = _.sortBy(findSplit,x => x.userId.split('.').length)[0].userId.split('.').length;
          this.devices.forEach((x: any) => x.label = x.userId.includes('.') ? x.userId.split('.').slice(0, min).join('.') : x.userId);
          this.devicesGrouped = _.map(_.groupBy(this.devices, x => x.label), (x: any) => Object({label: x[0].label, devices: x, accommodation: x.find((y: any) => y.elemType == 'accommodation') != null}));
        }
        else{
          this.devices.forEach((x: any) => x.label = x.userId);
          this.devicesGrouped = _.map(_.groupBy(this.devices, x => x.label), (x: any) => Object({label: x[0].label, devices: x, accommodation: x.find((y: any) => y.elemType == 'accommodation') != null}));
        }


        this.devices.forEach((d: any) => d.userId = this.removeLeftZeros(d.userId));
        this.devicesSrc = [...this.devices];
        this.devicesSrcGrouped = [...this.devices];
      }
      else{
        this.noResult = true;
      }
    });
  }
  fillDevices(){
    this.s.getDevices(this.docNumber).then(res => {
      console.log(res);
      if (res != null){
        this.revEsp = res.rev + ' (' + this.getDateModify(res.date) + ')';
        this.revEspNoDate = res.rev;
        this.kindEsp = res.kind;
        this.foranProject = res.foranProject;
        this.revUser = this.auth.getUserName(res.user);
      }
      if (res != null && res.elements.length > 0){
        let devices = res.elements;
        this.devices = _.sortBy(devices, x => x.userId.includes('.') ? (this.addLeftZeros(x.userId.split('.')[0]) + this.addLeftZeros(x.userId.split('.')[1])) : this.addLeftZeros(x.userId, 5));
        this.devices.forEach((d: any) => {
          if (d.userId.includes('#')){
            d.userId = d.userId.split('#')[0];
          }
          //d.label = d.userId.includes('.') ? d.userId.split('.')[0] : d.userId;
          let find = this.devices.find((x: any) => d.userId.startsWith(x.userId + '.'));
          if (find == null){
            d.label = d.userId;
          }
          else{
            d.label = find.userId;
          }
        });

        this.devicesGrouped = _.map(_.groupBy(this.devices, x => x.label), (x: any) => Object({label: x[0].label, devices: x, accommodation: x.find((y: any) => y.elemType == 'accommodation') != null}));
        this.devicesGrouped = _.sortBy(this.devicesGrouped, x => {
          let numDots = x.label.split('.').length;
          let order = '';
          if (numDots > 0){
            x.label.split('.').forEach((s: string) => {
              order = order + this.addLeftZeros(s);
            });
          }
          return numDots + '-' + this.addLeftZeros(order);
        });

        console.log(this.devicesGrouped);
        this.devicesGrouped.forEach((dg: any) => {
          dg.devices = _.sortBy(dg.devices, x => {
            let numDots = x.userId.split('.').length;
            let order = '';
            if (numDots > 0){
              order = x.userId.split('.').pop();
            }
            return numDots + '-' + this.addLeftZeros(order);
          });
        })
        //x.userId.filter((y: string) => y == '.').length

        this.devices.forEach((d: any) => d.userId = this.removeLeftZeros(d.userId));
        this.devicesSrc = [...this.devices];
        this.devicesSrcGrouped = [...this.devices];
      }
      else{
        this.noResult = true;
      }

      this.s.getAccomUserIds(this.docNumber).subscribe(res => {
        this.userIdsReplace = res;
      });
    });
  }
  getDateModify(dateLong: number){
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  removeLeftZeros(input: string){
    let res = input;
    while (res.length > 0 && res[0] == '0'){
      res = res.substr(1);
    }
    return res;
  }
  hideGroup(userId: string, group: string){
    return userId.replace(group + '.', '');
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
      console.log(this.miscIssues)
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

      this.fillDevices();
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
    if (input < 0.01) return 0.01;
    return Math.round(input * 100) / 100;
  }
  roundAny(input: number[]) {
    let res = 0;
    input.forEach(x => {
      if (x != 0){
        res = this.round(x);
      }
    });
    return res;
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
    this.dialogService.open(DeviceEspGenerationWaitComponent, {
      showHeader: false,
      modal: true,
      data: {issue: this.issue, spools: value, project: this.project}
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
    data = this.devices;

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    //worksheet['!cols'] = [{wch:10},{wch:85},{wch:10},{wch:10},{wch:15}];

    XLSX.writeFile(workbook, fileName);
  }

  getArchive() {
    return _.sortBy(this.issue.archive_revision_files, x => x.removed_date).reverse();
  }


  selectDevice(pipe: any) {
    this.selectedDevice = pipe;
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
    return values.find((x: any) => x.smat.toLowerCase().includes('gs')) != null;
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
      this.devices = this.devicesSrc;
    } else {
      this.devices = this.devicesSrc.filter((x: any) => {
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

  addNextMaterial() {
    let sorted = _.sortBy(this.devices, (x: any) => x.userId.split('.')[0]);
    let label = sorted.length > 0 ? (+sorted.reverse()[0].userId.split('.')[0] + 1) : 1;

    this.dialogService.open(AddMaterialToEspComponent, {
      showHeader: false,
      modal: true,
      data: [this.docNumber, label, 'NEW', '']
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.s.createDeviceEsp(this.foranProject, this.issue.doc_number, this.revEspNoDate, this.auth.getUser().login, 'device', this.issue.id).subscribe(res => {
          this.issueManager.getIssueDetails(this.issue.id).then(issue => {
            this.issue = issue;
            this.fillRevisions();
          });
        });
      }
    });
  }
  addMaterial(label: string = '', userId: string = '') {
    let sorted = _.sortBy(this.devices.filter((x: any) => x.userId.includes(label + '.')), (x: any) => +x.userId.split('.').pop());
    let labelNew = label + '.' + (sorted.length > 0 ? (+sorted.reverse()[0].userId.split('.').pop() + 1) : 1);

    this.dialogService.open(AddMaterialToEspComponent, {
      showHeader: false,
      modal: true,
      data: [this.docNumber, labelNew, 'NEW', '']
      //data: [this.docNumber, label, userId, '']
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.s.createDeviceEsp(this.foranProject, this.issue.doc_number, this.revEspNoDate, this.auth.getUser().login, 'device', this.issue.id).subscribe(res => {
          this.issueManager.getIssueDetails(this.issue.id).then(issue => {
            this.issue = issue;
            this.fillRevisions();
          });
        });
      }
    });
  }
  addMaterialForZone(label: string, devices: any[]) {
    let findZone = devices.find(x => x.zone != '');
    let zone = findZone != null ? findZone.zone : '';
    this.dialogService.open(AddMaterialToEspComponent, {
      showHeader: false,
      modal: true,
      data: [this.docNumber, label, '', zone]
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.s.createDeviceEsp(this.foranProject, this.issue.doc_number, this.revEspNoDate, this.auth.getUser().login, 'device', this.issue.id).subscribe(res => {
          this.issueManager.getIssueDetails(this.issue.id).then(issue => {
            this.issue = issue;
            this.fillRevisions();
          });
        });
      }
    });
  }
  getZones(zone: string) {
    return zone.split(',');
  }

  addGroupAccommodation() {
    this.dialogService.open(AddGroupDeviceComponent, {
      showHeader: false,
      modal: true,
      data: [this.docNumber, this.devices, this.issue, this.foranProject, this.revEspNoDate]
    }).onClose.subscribe(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
        this.fillRevisions();
      });
    });
  }

  // removeDeviceFromSystem(device: any) {
  //   this.s.removeDeviceFromSystem(this.docNumber, device.material.code, device.units, device.count, device.userId, '').then(res => {
  //     this.issueManager.getIssueDetails(this.issue.id).then(issue => {
  //       this.issue = issue;
  //       this.fillRevisions();
  //     });
  //   });
  // }

  removeDeviceFromSystem(device: any) {
    this.dialogService.open(RemoveDeviceFromSystemComponent, {
      showHeader: false,
      modal: true,
      data: [this.docNumber, device.material.code, device.units, device.count, device.userId, '']
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.s.createDeviceEsp(this.foranProject, this.issue.doc_number, this.revEspNoDate, this.auth.getUser().login, 'device', this.issue.id).subscribe(res => {
          if (this.devices.length == 1){
            location.reload();
          }
          else{
            this.issueManager.getIssueDetails(this.issue.id).then(issue => {
              this.issue = issue;
              this.fillRevisions();
            });
          }
        });
      }
    });
  }


  // saveEditing() {
  //   this.s.setAccommodationLabel(this.docNumber, this.addLeftZeros(this.newLabel, 8), this.editing).then(res => {
  //     this.issueManager.getIssueDetails(this.issue.id).then(issue => {
  //       this.issue = issue;
  //       this.fillRevisions();
  //     });
  //   });
  // }
  saveEditing(userId: string) {
    let edited = this.isEdited(userId) ? '#' : '';
    this.s.updateAccommodataionUserId(this.docNumber, this.prevLabel, this.newLabel + edited).subscribe(res => {
      this.s.createDeviceEsp(this.project.replace('NT02', "N002"), this.issue.doc_number, this.issue.revision, this.auth.getUser().login, 'device', this.issue.id).subscribe(res => {
        this.fillDevices();
      });
    });
    this.editing = 0;
  }
  // getDeviceName(material: Material){
  //   let res = material.name;
  //   let findName = material.translations.find(x => x.lang == this.t.language);
  //   if (findName != null){
  //     res = findName.name;
  //   }
  //   let desc = material.description;
  //   if (findName != null){
  //     desc = findName.description;
  //   }
  //   if (desc != ''){
  //     res = res + ', ' + desc;
  //   }
  //   return res;
  // }
  getDeviceName(material: Material){
    let res = material.name;
    let findName = material.translations.find(x => x.lang == this.t.language);
    if (findName != null){
      res = findName.name;
    }
    return res;
  }
  getDeviceDescr(material: Material){
    let res = material.description;
    let findName = material.translations.find(x => x.lang == this.t.language);
    if (findName != null){
      res = findName.description;
    }
    return res;
  }
  openIssue(id: number) {
    window.open('/?taskId=' + id, '_blank');
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

  addFilesCommon() {
    this.dialogService.open(UploadMultipleFilesComponent, {
      showHeader: false,
      modal: true,
      data: [this.issue, this.project, this.kindEsp, this.revEspNoDate]
    }).onClose.subscribe(() => {
      this.fillRevisions();
    });
  }

  isEdited(userId: any) {
    return this.userIdsReplace.find(x => x.userIdNew == userId);
  }

  getPrevId(userId: any) {
    return this.userIdsReplace.find(x => x.userIdNew == userId).userId;
  }

  toPrevUserId(userId: any) {
    let prevId = this.userIdsReplace.find(x => x.userIdNew == userId);
    this.s.updateAccommodataionUserId(this.docNumber, prevId.userId, '0').subscribe(res => {
      this.s.createDeviceEsp(this.project.replace('NT02', "N002"), this.issue.doc_number, this.issue.revision, this.auth.getUser().login, 'device', this.issue.id).subscribe(res => {
        this.fillDevices();
      });
    });
  }
}
