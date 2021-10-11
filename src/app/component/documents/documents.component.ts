import { Component, OnInit } from '@angular/core';
import {Material} from "../../domain/classes/material";
import {MaterialManagerService} from "../../domain/material-manager.service";

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  materials: Material[] = [];
  projects: string[] = ['NR-002', '170701'];
  project = this.projects[1];

  constructor(private materialManager: MaterialManagerService) { }

  ngOnInit(): void {
    let proj = this.project.replace('170701', 'P701');
    this.materialManager.getMaterials(proj).then(res => {
      this.materials = res;
    });
  }

}
