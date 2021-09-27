import { Component, OnInit } from '@angular/core';
import {Material} from "../../domain/classes/material";
import {MaterialManagerService} from "../../domain/material-manager.service";
import {MessageService} from "primeng/api";
import { v4 as uuidv4 } from 'uuid';
import {ImportxlsComponent} from "../home/importxls/importxls.component";
import {DialogService} from "primeng/dynamicdialog";
import {AddMaterialComponent} from "./add-material/add-material.component";

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.css']
})
export class MaterialsComponent implements OnInit {
  products = [];
  projects: string[] = ['NR-002', '170701'];
  project = this.projects[1];
  categories: string[] = ['00002 (Заказ материалов)', '09003 (Трубный прокат)', '09004 (Расход кабелей)', '12116 (Дельные вещи)', '13112 (Изоляция и зашивка)', '13124 (Мебель)', '14109 (Мех. оборуд.)', '14122 (КИП)', '15107 (Арматура)', '16101 (Электрооборудование)', '17108 (АСИ и ППИ)', '18123 (Инв. имущество)', '19127 (ЗИП)', '30000 (МСЧ)', '30005 (Компл. оборудование)'];
  selectedCategories: string[] = this.categories;
  materials: Material[] = [];
  selectedMaterial: Material | null = null;
  constructor(private materialManager: MaterialManagerService, private messageService: MessageService, private dialogService: DialogService) { }

  ngOnInit(): void {
    let proj = this.project.replace('170701', 'P701');
    this.materialManager.getMaterials(proj).then(res => {
      this.materials = res;
    });
  }
  updateMaterial(): void{
    if (this.selectedMaterial != null){
      this.materialManager.updateMaterial(this.selectedMaterial).then(res => {
        if (res == 'success'){
          this.messageService.add({severity:'success', summary:'Create Material', detail:'You have created new material.'});
        }
        else if (res == 'updated'){
          this.messageService.add({severity:'success', summary:'Update Material', detail:'You have updated material.'});
        }
      });
    }
  }
  removeMaterial(){
    if (this.selectedMaterial != null){
      this.selectedMaterial.removed = 1;
      this.updateMaterial();
    }
  }
  addMaterial(){
    this.dialogService.open(AddMaterialComponent, {
      header: 'Добавление материала',
      modal: true,
    })
    if (this.selectedMaterial != null){
      this.selectedMaterial.id = uuidv4();
      this.updateMaterial();
    }
  }
}
