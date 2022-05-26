import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Material} from "../../../domain/classes/material";
import {MaterialManagerService} from "../../../domain/material-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import _ from "underscore";
import {MessageService} from "primeng/api";

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

  constructor(public t: LanguageService, public dialog: DynamicDialogConfig, public materialManager: MaterialManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, public messageService: MessageService) {
    this.projects = dialog.data[0];
    this.project = this.projects[0];
    this.material = JSON.parse(JSON.stringify(dialog.data[1]));
    this.action = dialog.data[2];
    this.materials = dialog.data[3];
    this.materialPrefix = dialog.data[4];


    if ((this.action == 'add' || this.action == 'clone') && this.materialPrefix != ''){
      this.material.code = Material.generateCode(this.materialPrefix, this.materials);
    }
  }

  ngOnInit(): void {

  }

  createMaterial() {
    if (this.material.code.substring(0, 12) != Material.generateCode(this.materialPrefix, this.materials).substring(0, 12)){
      this.messageService.add({severity:'error', summary:'Code Error', detail:'You cannot modify base first 12 length symbols of code. Please create another block with code you wish.', life: 8000});
      return;
    }
    if (this.material.code.length != 16){
      this.messageService.add({severity:'error', summary:'Code Error', detail:'You cannot set length of code different from 16.', life: 8000});
      return;
    }
    let r = new RegExp('^[A-Z]{12}\\d{4}');
    if (!r.test(this.material.code)){
      this.messageService.add({severity:'error', summary:'Code Error', detail:'You can only use latin uppercase symbols and numbers in code. Code pattern: 12 uppercase latin symbols and 4 digits.', life: 8000});
      return;
    }
    if (this.action != 'update' && this.materials.find(x => x.code == this.material.code)){
      this.messageService.add({severity:'error', summary:'Code Error', detail:'Material with the same code already exists.', life: 8000});
      return;
    }
    if (this.material.name == 'New Material' || this.material.name.trim() == ''){
      this.messageService.add({severity:'error', summary:'Code Error', detail:'You need to specify material name.', life: 8000});
      return;
    }
    if (this.material.singleWeight == 0 || this.material.singleWeight == null){
      this.messageService.add({severity:'error', summary:'Code Error', detail:'You need to specify material weight.', life: 8000});
      return;
    }
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
    return action.replace('add', 'Create').replace('edit', 'Update').replace('clone', 'Clone');
  }
}
