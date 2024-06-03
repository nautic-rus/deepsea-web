import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../../domain/spec-manager.service";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import _ from "underscore";
import {AddComplectComponent} from "../../complect-manager/add-complect/add-complect.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MaterialManagerService} from "../../../../domain/material-manager.service";
import {AuthManagerService} from "../../../../domain/auth-manager.service";

@Component({
  selector: 'app-add-material-complect',
  templateUrl: './add-material-complect.component.html',
  styleUrls: ['./add-material-complect.component.css']
})
export class AddMaterialComplectComponent implements OnInit {

  project: number = 0;
  kind = '';
  constructor(public c: DynamicDialogConfig, public ref: DynamicDialogRef, public s: SpecManagerService, public materialManagerService: MaterialManagerService, public auth: AuthManagerService) {
    this.project = +c.data[0];
    this.kind = c.data[1];
  }
  complect = new FormGroup({
    name: new FormControl('',  [Validators.required, Validators.min(5)])
  });

  ngOnInit(): void {
  }

  save() {
    let name = this.complect.get('name')?.value;
    this.materialManagerService.getMaterialComplects(this.project).subscribe(complects => {
      if (complects.find(x => x.name == name) != null){
        alert('Ошибка! Такое название комплекта уже существует.')
      }
      else{
        this.materialManagerService.addMaterialComplect(this.project, name, this.kind, this.auth.getUser().id).subscribe(res => {
          this.ref.close('success');
        });
      }
    });
  }

  close() {
    this.ref.close();
  }

}
