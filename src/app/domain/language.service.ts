import { Injectable } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  language = 'ru';
  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(res => {
      this.language = res.lang != null ? res.lang : 'ru';
    });
  }
  tr(input: string){
    switch (this.language) {
      case 'en':{
        switch (input) {
          case 'Проект': return 'Project';
          case 'Приоритет': return 'Priority';
          case 'Тип задачи': return 'Task Type';
          case 'Этап': return 'Priority';
          case 'Перетащите файлы или нажмите для загрузки': return 'Drop files here or click this to upload';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          default: return input;
        }
      }
      default: {
        return input;
      }
    }
  }
}
