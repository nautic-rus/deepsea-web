import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-material',
  templateUrl: './add-material.component.html',
  styleUrls: ['./add-material.component.css']
})
export class AddMaterialComponent implements OnInit {
  projects: string[] = ['NR-002', '170701'];
  project = this.projects[1];
  categories = ['00002', '13112', '14109', '14122', '13124', '19127', '09003', '09004', '30000', '30005', '15107', '17108', '16101', '18123', '12116' ];
  category = this.categories[1];
  newUnits = '';

  constructor() { }

  ngOnInit(): void {
  }

}
