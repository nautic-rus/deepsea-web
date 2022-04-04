import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Material} from "../../../domain/classes/material";
import {MaterialManagerService} from "../../../domain/material-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import _ from "underscore";

@Component({
  selector: 'app-add-material',
  templateUrl: './add-material.component.html',
  styleUrls: ['./add-material.component.css']
})
export class AddMaterialComponent implements OnInit {
  projects: string[] = [];
  project = '';
  categories = ['00002', '13112', '14109', '14122', '13124', '19127', '09003', '09004', '30000', '30005', '15107', '17108', '16101', '18123', '12116' ];
  units = ['796', '006'];
  category = this.categories[0];
  material: Material = new Material();
  action = '';
  materialPrefix = '';
  materials: Material[] = [];
  layer1: any[] = [];
  layer2: any[] = [];
  layer3: any[] = [];
  layer4: any[] = [];
  selectedCode1: any;
  selectedCode2: any;
  selectedCode3: any;
  selectedCode4: any;
  codeSelectors: any[] = [];
  noneCode = {
    data: 'NON',
    label: 'No specified type',
  };

  constructor(public t: LanguageService, public dialog: DynamicDialogConfig, public materialManager: MaterialManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef) {
    this.projects = dialog.data[0];
    this.project = this.projects[0];
    this.material = JSON.parse(JSON.stringify(dialog.data[1]));
    this.action = dialog.data[2];
    this.materials = dialog.data[3];
    this.materialPrefix = dialog.data[4];
    this.materialManager.getMaterialNodes().then(res => {
      this.layer3.push(this.noneCode);
      this.layer4.push(this.noneCode);
      _.sortBy(res.filter(x => x.layer == "1"), x => x.data).forEach(x => this.layer1.push(x));
       _.sortBy(res.filter(x => x.layer == "2"), x => x.data).forEach(x => this.layer2.push(x));
      _.sortBy(res.filter(x => x.layer == "3"), x => x.data).forEach(x => this.layer3.push(x));
      _.sortBy(res.filter(x => x.layer == "4"), x => x.data).forEach(x => this.layer4.push(x));
      this.selectedCode1 = this.layer1[0];
      this.selectedCode2 = this.layer2[0];
      this.selectedCode3 = this.noneCode;
      this.selectedCode4 = this.noneCode;
      if ((this.action == 'add' || this.action == 'edit') && this.materialPrefix != ''){
        this.material.code = this.materialPrefix;
        for (let x = 0; x < 4; x ++){
          this.material.code += 'NON';
        }
      }
      if (this.action != 'add'){
        this.selectedCode1 = this.layer1.find(x => x.data == this.material.code.substring(0, 3));
        this.selectedCode2 = this.layer2.find(x => x.data == this.material.code.substring(3, 6));
        this.selectedCode3 = this.layer3.find(x => x.data == this.material.code.substring(6, 9));
        this.selectedCode4 = this.layer4.find(x => x.data == this.material.code.substring(9, 12));
      }
      this.layer1.forEach(l => l.info = l.data + ' ' + l.label);
      this.layer2.forEach(l => l.info = l.data + ' ' + l.label);
      this.layer3.forEach(l => l.info = l.data + ' ' + l.label);
      this.layer4.forEach(l => l.info = l.data + ' ' + l.label);
      this.codeSelectors.push({layer: this.layer1, code: this.selectedCode1});
      this.codeSelectors.push({layer: this.layer2, code: this.selectedCode2});
      this.codeSelectors.push({layer: this.layer3, code: this.selectedCode3});
      this.codeSelectors.push({layer: this.layer4, code: this.selectedCode4});
      if (this.action == 'add' || this.action == 'clone'){
        this.selectorChanged();
      }
    });
  }

  ngOnInit(): void {

  }

  createMaterial() {
    this.materialManager.updateMaterial(this.material, this.auth.getUser().login, 0).then(res => {
      this.ref.close(this.material);
    });
  }

  selectorChanged() {
    let prefix = '';
    for (let x = 0; x < 4; x ++){
      if (this.codeSelectors[x].code == null){
        prefix += 'NON';
      }
      else{
        prefix += this.codeSelectors[x].code.data;
      }
    }
    this.material.code = Material.generateCode(prefix, this.materials);
  }

  getLabel(action: string) {
    return action.replace('add', 'Create').replace('edit', 'Update');
  }
}
