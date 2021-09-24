import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.css']
})
export class MaterialsComponent implements OnInit {
  products = [];
  projects: string[] = ['NR-002', '170701'];
  project = this.projects[0];
  categories: string[] = ['00002 (Заказ материалов)', '09003 (Трубный прокат)', '09004 (Расход кабелей)', '12116 (Дельные вещи)', '13112 (Изоляция и зашивка)', '13124 (Мебель)', '14109 (Мех. оборуд.)', '14122 (КИП)', '15107 (Арматура)', '16101 (Электрооборудование)', '17108 (АСИ и ППИ)', '18123 (Инв. имущество)', '19127 (ЗИП)', '30000 (МСЧ)', '30005 (Компл. оборудование)'];
  selectedCategories: string[] = this.categories;
  constructor() { }

  ngOnInit(): void {
  }

}
