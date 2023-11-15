import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {SpecManagerService} from "../../../../domain/spec-manager.service";

@Component({
  selector: 'app-add-complect',
  templateUrl: './add-complect.component.html',
  styleUrls: ['./add-complect.component.css']
})
export class AddComplectComponent implements OnInit {

  project = '';
  constructor(public c: DynamicDialogConfig, public ref: DynamicDialogRef, public s: SpecManagerService) {
    this.project = c.data[0];
  }
  complect = new FormGroup({
    drawingId: new FormControl('', Validators.required),
    drawingName: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
  }

  save() {
    let drawing = this.complect.get('drawingId')?.value;
    let drawingName = this.complect.get('drawingName')?.value;
    let complect = Object({
      drawingId: drawing,
      drawingDescr: drawingName,
      deck: '',
      project: this.project,
      systemNames: [],
      zoneNames: []
    });
    this.s.getEleComplects(this.project).subscribe(complects => {
      if (complects.find(x => x.drawingId == complect.drawingId) != null){
        alert('Ошибка! Такой номер комплекта уже существует.')
      }
      else{
        this.s.addEleComplect(complect).subscribe(res => {
          this.ref.close('success');
        });
      }
    });
  }

  close() {
    this.ref.close();
  }

}
