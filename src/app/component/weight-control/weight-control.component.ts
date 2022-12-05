import { Component, OnInit } from '@angular/core';
import {MaterialManagerService} from "../../domain/material-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import * as XLSX from "xlsx";
import {LanguageService} from "../../domain/language.service";
import {DeleteComponent} from "../task/delete/delete.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {RemoveWeightComponent} from "./remove-weight/remove-weight.component";

@Component({
  selector: 'app-weight-control',
  templateUrl: './weight-control.component.html',
  styleUrls: ['./weight-control.component.css']
})
export class WeightControlComponent implements OnInit {

  controls: any = [];
  addNew = false;
  newControl: any = {};
  drawings: any[] = [];
  selectedDrawing: any = {};
  zones: any[] = [];
  selectedZone: any = {};
  totalWeight = 0;
  totalX = 0;
  totalY = 0;
  totalZ = 0;
  loading = true;
  project = '01701.414 - Орион';
  projects: string[] = ['03095.410 - Андромеда', '03095.411 - Кастор', '03095.412 - Поллукс', '03095.413 - Альхена', '01701.414 - Орион', '01701.415 - Лев', '03070.404 - Механик Степанов', '03070.405 - Механик Цуранов', '200101.2220 - Капитан Головатюк', '200101.2221 - Капитан Немо'];
  customNumber = '';
  customName = '';

  constructor(public m: MaterialManagerService, public auth: AuthManagerService, public t: LanguageService, private dialogService: DialogService, public ref: DynamicDialogRef) { }

  ngOnInit(): void {
    // this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x));
    // if (this.projects.length == 0){
    //   this.projects = ['01701.414 - Орион'];
    // }
    //this.project = this.projects[0];
    this.fillControl();
  }
  fillControl(){
    this.m.getWeightControl().then(res => {
      console.log(res);
      this.controls = res.filter(x => x.project == this.project);
      console.log(res);
      this.fillTotals();
    });
    this.m.getWCDrawings().then(res => {
      this.drawings = res.filter(x => x.project == this.project);
      this.drawings.push({name: 'Ввести номер чертежа вручную', number: 'XXXXXX-XXX-XXX'});
      this.drawings.forEach(d => d.filter = d.number + d.name);
      //console.log(res);
    });
    this.m.getWCZones().then(res => {
      this.zones = res.filter(x => x.project == this.project);
      this.zones.forEach(z => z.filter = z.number + z.name);
      //console.log(res);
    });
  }
  fillTotals(){
    this.totalWeight = 0;
    this.totalX = 0;
    this.totalY = 0;
    this.totalZ = 0;
    this.controls.forEach((c: any) => {
      this.totalWeight += c.weight;
      this.totalX += c.x;
      this.totalY += c.y;
      this.totalZ += c.z;
    });
    if (this.totalWeight != 0){
      this.totalX /= this.totalWeight;
      this.totalY /= this.totalWeight;
      this.totalZ /= this.totalWeight;
    }
  }
  openNew() {
    this.newControl = {};
    this.selectedZone = {};
    this.selectedDrawing = {};
    this.newControl.moveElement = '';
    this.newControl.mount = 0;
    this.newControl.side = 0;
    this.newControl.weight = 1;
    this.newControl.x = 1;
    this.newControl.y = 1;
    this.newControl.z = 1;
    this.newControl.removedDate = 0;
    this.newControl.removedUser = '';
    this.addNew = true;
  }

  hide() {
    this.addNew = false;
  }

  getDate(dateLong: number): string{
    if (dateLong == 0){
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  save() {
    this.checkMountChange();
    this.checkSideChange();

    this.newControl.docNumber = this.selectedDrawing.number;
    this.newControl.docName = this.selectedDrawing.name;

    this.newControl.zoneNumber = this.selectedZone.number;
    this.newControl.zoneName = this.selectedZone.name;

    this.newControl.user = this.auth.getUser().login;
    this.newControl.date = new Date().getTime();

    this.newControl.project = this.project;

    if (this.newControl.docName == 'Ввести номер чертежа вручную'){
      this.newControl.docNumber = this.customNumber;
      this.newControl.docName = this.customName;
    }

    this.newControl.removedDate = 0;

    this.newControl.removedUser = '';

    console.log(this.newControl);

    this.m.setWeightControl(this.newControl).then(res => {
      this.controls.push(JSON.parse(JSON.stringify(this.newControl)));
      console.log(this.controls);
      this.fillTotals();
      this.hide();
    });
  }

  isSaveDisabled() {
    return (this.selectedDrawing.name == 'Ввести номер чертежа вручную' && (this.customName.trim() == '' || this.customNumber.trim() == '')) ||
    !this.selectedDrawing.name || !this.selectedZone.name || !this.newControl.weight || !this.newControl.x || !this.newControl.y || !this.newControl.z;
  }
  removeWeightControl(control: any) {
    this.dialogService.open(RemoveWeightComponent, {
      showHeader: false,
      modal: true,
      data: control
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.fillControl();
      }
    });
  }
  checkSideChange() {
    let left = this.newControl.side == 1;
    // if (left && this.newControl.x > 0 || !left && this.newControl.x < 0){
    //   this.newControl.x *= -1;
    // }
    if (left && this.newControl.y > 0 || !left && this.newControl.y < 0){
      this.newControl.y *= -1;
    }
    // if (left && this.newControl.z > 0 || !left && this.newControl.z < 0){
    //   this.newControl.z *= -1;
    // }
  }

  checkMountChange() {
    if (this.newControl.weight < 0 && this.newControl.mount == 0 || this.newControl.weight > 0 && this.newControl.mount == 1){
      this.newControl.weight *= -1;
    }
  }

  exportExcel() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.controls);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    XLSX.writeFile(workbook, fileName);
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
  round(input: number, digit = 100) {
    return Math.round(input * digit) / digit;
  }
}
