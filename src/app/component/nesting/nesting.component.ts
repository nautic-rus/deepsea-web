import {ApplicationRef, Component, OnInit, ViewChild} from '@angular/core';
import {Issue} from "../../domain/classes/issue";
import {FileAttachment} from "../../domain/classes/file-attachment";
import {DeviceDetectorService} from "ngx-device-detector";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../domain/spec-manager.service";
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {DialogService} from "primeng/dynamicdialog";
import _ from "underscore";
import {UserCardComponent} from "../employees/user-card/user-card.component";
import {mouseWheelZoom} from "mouse-wheel-zoom";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-nesting',
  templateUrl: './nesting.component.html',
  styleUrls: ['./nesting.component.css']
})
export class NestingComponent implements OnInit {
  parts: any = [];
  nesting: any = [];
  nestingSource: any = [];
  noResult = false;
  docNumber = '';
  project = '';
  department = '';
  selectedRevision = '';
  messageFilter = 'all';
  comment = false;
  issueId = 0;
  selectedNest = Object();
  awaitForLoad: string[] = [];
  loaded: FileAttachment[] = [];
  message = '';
  showImages = false;
  // @ts-ignore
  @ViewChild('table') dt: Table;
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
  dxfEnabledForNesting = false;
  dxfView: Window | null = null;
  dxfDoc: string = '';
  search: string = '';
  searchNesting: string = '';
  selectedHeadTab: string = 'Files';
  nestContent: any[] = [];
  nestContentRead = false;
  nestingFiles: any[] = [];
  issueRevisions: string[] = [];
  filters:  { BLOCKS: any[], MATERIAL: any[]  } = { BLOCKS: [],  MATERIAL: [] };

  constructor(public device: DeviceDetectorService, public auth: AuthManagerService, private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, public issueManager: IssueManagerService, private dialogService: DialogService, private appRef: ApplicationRef) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.foranProject != null ? params.foranProject : '';
      this.dxfDoc = params.dxf != null ? params.dxf : '';
      this.issueManager.getNestingFiles().then(files => {
        this.nestingFiles = files;
      });
      this.s.getHullNesting(this.project).then(res => {
        if (this.nesting.length == 0){
          this.nesting = res;
          if (res.length == 0){
            this.noResult = true;
          }
          else{
            this.nesting.flatMap((x: any) => x.BLOCKS.split(';')).forEach((block: string) => {
              if (!this.filters.BLOCKS.map(x => x.label).includes(block)){
                this.filters.BLOCKS.push({
                  label: block,
                  value: block
                });
              }
            });
            this.filters.BLOCKS = _.sortBy(this.filters.BLOCKS, x => x);
            this.filters.MATERIAL = this.getFilters(this.nesting, 'MATERIAL');
            this.nesting.forEach((nest: any) => {
              nest.FILE = 'N-' + this.project + '-' + nest.ID.substr(1, 4) + '-' + nest.ID.substr(5);
              nest.doughnut = [
                {
                  name: "Usage",
                  value: nest.USAGE
                },
                {
                  name: "Left",
                  value: (100 - nest.USAGE)
                }
              ]
              nest.LOCKED = false;
            });
            this.nestingSource = [...this.nesting];
          }
        }
      });

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
  getParts(){
    return this.parts.filter((x: any) => this.isPartVisible(x));
  }
  isPartVisible(part: any){
    return true;
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
    return find != null && find.gender == 'female' && this.l.language == 'ru' ? 'а' : '';
  }
  getMessages(issue: Issue) {
    let res: any[] = [];
    issue.messages.forEach(x => res.push(x));
    issue.history.forEach(x => res.push(x));
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
    return Math.round(+input * 100) / 100;
  }
  openFile(url: string) {
    window.open(url);
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
  getDate(dateLong: number): string{
    if (dateLong == 0){
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

  getDeliveredStatus(status: string, styled = true): any {
    let tr = this.localeStatus(status);
    switch (status){
      case 'Completed': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'In Work': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      default: return status;
    }
  }
  localeStatus(status: string){
    if (this.l.language == 'ru'){
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


  downloadFiles() {

    let nesting = this.dt.filteredValue;
    if (this.dt.filteredValue == null){
      nesting = this.nesting;
    }
    let files: any[] = [];
    nesting.forEach((nest: any) => {
      let find = this.nestingFiles.find(x => x.name == nest.FILE + '.dxf');
      if (find != null){
        files.push(find);
      }
    });
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
        zipped.push(name);
        zip.file(name, blob.blob());
      });
      zip.generateAsync({type:"blob"}).then(res => {
        this.waitForZipFiles = false;
        saveAs(res, 'export' + '-' + new Date().getTime() + '.zip');
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
  editorInit(event: any) {
    this.editor = event;
  }

  getRevisionFilesOfGroup(fileGroup: string, revision: string): FileAttachment[] {
    return [];
  }
  getCount(parts: any[], PART_CODE: any) {
    if (this.groupedByPartCode){
      return parts.filter(x => x.PART_CODE == PART_CODE).length;
    }
    else{
      return 1;
    }
  }
  selectNest(part: any){
    this.selectedNest = part;
    if (this.dxfView != null && !this.dxfView.closed){
      this.dxfView.postMessage(this.selectedNest, '*');
    }
    if (this.dxfEnabled){
      let search = this.trimLeftZeros(part.PART_CODE) + (part.SYMMETRY != 'C' ? part.SYMMETRY : '');
      this.router.navigate([], {queryParams: {dxf: null, search: null}, queryParamsHandling: 'merge'}).then(() => {
        this.router.navigate([], {queryParams: {dxf: this.getRevisionFilesOfGroup('Drawings', this.selectedRevision).find(x => x.name.includes('.dxf'))?.url, search}, queryParamsHandling: 'merge'});
      });
    }
  }
  trimLeftZeros(input: string){
    let result = input;
    while (result[0] == '0' && result.length > 0){
      result = result.substr(1);
    }
    return result;
  }
  isDisabledDxf(){
    return this.getRevisionFilesOfGroup('Drawings', this.selectedRevision).find(x => x.name.includes('.dxf')) == null;
  }
  showDxf(){
    if (this.dxfEnabledForNesting){
      this.dxfEnabledForNesting = false;
    }
    else{
      this.dxfEnabled = !this.dxfEnabled;
      let viewport = document.getElementsByTagName('cdk-virtual-scroll-viewport').item(0);
      // @ts-ignore
      viewport.style.height = this.dxfEnabled ? '20vh' : '70vh';
    }
    this.router.navigate([], {queryParams: {dxf: null, search: null, searchNesting: null}, queryParamsHandling: 'merge'}).then(() => {
      this.router.navigate([], {queryParams: {dxf: this.getRevisionFilesOfGroup('Drawings', this.selectedRevision).find(x => x.name.includes('.dxf'))?.url}, queryParamsHandling: 'merge'});
    });
  }
  showDxfTablet(){
    if (this.dxfEnabledForNesting){
      this.dxfEnabledForNesting = false;
    }
    else{
      this.dxfEnabled = !this.dxfEnabled;
    }

    if (this.dxfView != null && !this.dxfView.closed){
      this.dxfView.close();
    }
    let url = '/dxf-view?navi=0&window=1&dxf=' + this.getRevisionFilesOfGroup('Drawings', this.selectedRevision).find(x => x.name.includes('.dxf'))?.url + (this.search != '' ? '&search=' + this.search : '') + (this.dxfEnabledForNesting ? '&searchNesting=' + this.selectedNest.PART_CODE : '');
    this.dxfEnabledForNesting = false;
    this.dxfEnabled = false;
    this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
  }
  openDxf() {
    if (this.dxfView != null && !this.dxfView.closed){
      this.dxfView.close();
    }
    let url = '/dxf-view?navi=0&window=1&dxf=' + this.dxfDoc;
    this.dxfEnabledForNesting = false;
    this.dxfEnabled = false;
    this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
  }
  exitDxf(){
    this.dxfEnabled = false;
    this.dxfEnabledForNesting = false;
    let viewport = document.getElementsByTagName('cdk-virtual-scroll-viewport').item(0);
    // @ts-ignore
    viewport.style.height = '70vh';
  }
  exitDxfTablet(){
    this.dxfEnabled = false;
    this.dxfEnabledForNesting = false;
    let viewport = document.getElementsByTagName('cdk-virtual-scroll-viewport').item(0);
    // @ts-ignore
    viewport.style.height = '360px';
  }

  isDisabledNest(part: any) {
    let nesting = part.NESTING != null && part.NESTING[0] == 'N' ? this.getRevisionFilesOfGroup('Nesting Plates', this.selectedRevision) : (this.getRevisionFilesOfGroup('Nesting Profiles', this.selectedRevision));
    let searchDxf = nesting.find(x => x.name == part.NESTING + '.dxf');
    return searchDxf == null;
  }
  isDisabledNestTemplate(nest: any) {
    let searchDxf = this.nestingFiles.find(x => x.name == nest.FILE + '.dxf');
    return searchDxf == null;
  }

  showNesting(part: any) {
    this.selectedNest = part;
    this.dxfEnabledForNesting = true;
    let nesting = part.NESTING[0] == 'N' ? this.getRevisionFilesOfGroup('Nesting Plates', this.selectedRevision) : (this.getRevisionFilesOfGroup('Nesting Profiles', this.selectedRevision));
    let searchDxf = nesting.find(x => x.name == part.NESTING + '.dxf');
    if (searchDxf != null){
      if (!this.dxfEnabled){
        this.dxfEnabled = !this.dxfEnabled;
        let viewport = document.getElementsByTagName('cdk-virtual-scroll-viewport').item(0);
        // @ts-ignore
        viewport.style.height = this.dxfEnabled ? '20vh' : '70vh';
      }
      this.router.navigate([], {queryParams: {dxf: null, search: null, searchNesting: null}, queryParamsHandling: 'merge'}).then(() => {
        // @ts-ignore
        this.router.navigate([], {queryParams: {dxf: searchDxf.url, search: null, searchNesting: part.PART_CODE + part.SYMMETRY}, queryParamsHandling: 'merge'});
      });

    }

  }

  showDxfInViewer(url: string) {
    if (!this.dxfEnabled){
      this.dxfEnabled = !this.dxfEnabled;
      let viewport = document.getElementsByTagName('cdk-virtual-scroll-viewport').item(0);
      // @ts-ignore
      viewport.style.height = this.dxfEnabled ? '20vh' : '70vh';
    }
    this.router.navigate([], {queryParams: {dxf: null, search: null, searchNesting: null}, queryParamsHandling: 'merge'}).then(() => {
      // @ts-ignore
      this.router.navigate([], {queryParams: {dxf: url, search: null, searchNesting: null}, queryParamsHandling: 'merge'});
    });
  }


  showNestingTablet(part: any) {
    this.selectedNest = part;
    this.dxfEnabledForNesting = true;
    let search = '';
    if (part.NEST_ID != null){
      if (part.NEST_ID[0] == 'a'){
        search = this.project + '_' + part.NEST_ID.substr(1, 4) + '_' + part.NEST_ID.substr(5, 4);
      }
      else{
        search = this.project + '_' + part.NEST_ID.substr(1, 4) + '_0_' + part.NEST_ID.substr(5, 4);
      }
    }

    let nesting = this.getRevisionFilesOfGroup('Nesting Plates', this.selectedRevision).concat(this.getRevisionFilesOfGroup('Nesting Profiles', this.selectedRevision));
    let searchDxf = nesting.find(x => x.name == search + '.dxf');
    if (searchDxf != null){
      if (this.dxfView != null && !this.dxfView.closed){
        this.dxfView.close();
      }
      let url = '/dxf-view?navi=0&window=1&dxf=' + searchDxf.url + (this.search != '' ? '&search=' + this.search : '') + (this.dxfEnabledForNesting ? '&searchNesting=' + this.selectedNest.PART_CODE : '');
      this.dxfEnabledForNesting = false;
      this.dxfEnabled = false;
      this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
    }

  }
  showNestingTemplate(nest: any) {
    let searchDxf = this.nestingFiles.find(x => x.name == nest.FILE + '.dxf');
    if (searchDxf != null){
      if (!this.dxfEnabled){
        this.dxfEnabled = !this.dxfEnabled;
      }
      this.router.navigate([], {queryParams: {dxf: null, search: null, searchNesting: null}, queryParamsHandling: 'merge'}).then(() => {
        // @ts-ignore
        this.router.navigate([], {queryParams: {dxf: searchDxf.url, search: null, searchNesting: null}, queryParamsHandling: 'merge'});
      });
    }
  }

  showNestingTabletTemplate(part: any) {
    this.selectedNest = part;
    this.dxfEnabledForNesting = true;
    let search = '';
    search = part.PART_CODE + '-' + part.SYMMETRY;
    if (search != ''){
      let nesting = this.getRevisionFilesOfGroup('Profile Sketches', this.selectedRevision);
      if (!this.nestContentRead){
        this.nestContentRead = true;
        nesting.filter(x => x.name.includes('profiles')).forEach(file => {
          fetch(file.url).then(response => response.text()).then(text => {
            text.split(';').filter(x => x.trim() != '').forEach(row => {
              let splitRow = row.split(':');
              this.nestContent.push({
                file: splitRow[0].trim(),
                parts: splitRow[1].trim().split(',')
              });
            });
          });
        });
      }
      let find = this.nestContent.find(x => x.parts.includes(search));
      if (find != null){
        let searchDxf = nesting.find(x => x.name == find.file);
        if (searchDxf != null){
          if (this.dxfView != null && !this.dxfView.closed){
            this.dxfView.close();
          }
          let url = '/dxf-view?navi=0&window=1&dxf=' + searchDxf.url + (this.search != '' ? '&search=' + this.search : '') + (this.dxfEnabledForNesting ? '&searchNesting=' + this.selectedNest.PART_CODE : '');
          this.dxfEnabledForNesting = false;
          this.dxfEnabled = false;
          this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
        }
      }
    }
  }
  exportXls() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let nesting = this.dt.filteredValue as Issue[];
    if (this.dt.filteredValue == null){
      nesting = this.nesting;
    }
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(nesting);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    XLSX.writeFile(workbook, fileName);
  }

  downloadNestingFile(nest: any) {
    let searchDxf = this.nestingFiles.find(x => x.name == nest.FILE + '.dxf');
    if (searchDxf != null){
      window.open(searchDxf.url);
    }
  }

  searchChanged() {
    if (this.search.trim() == ''){
      this.nesting = this.nestingSource;
    }
    else{
      this.nesting = this.nestingSource.filter((x: any) => {
        return (x.ID + x.BLOCKS + x.THICKNESS + x.NEST_LENGTH + x.NEST_WIDTH + x.MATERIAL + x.PARTS_WEIGHT + x.NUM_EQ_NEST + x.FILE + x.USAGE).trim().toLowerCase().includes(this.search.trim().toLowerCase())
      });
    }
  }
}