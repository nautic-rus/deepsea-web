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
          case 'Этап': return 'Stage';
          case 'Перетащите файлы или нажмите для загрузки': return 'Drop files here or click this to upload';
          case 'Новый': return 'New';
          case 'В работе': return 'In Work';
          case 'На согласовании': return 'On Approval';
          case 'Отправлен заказчику': return 'Send To ShipYard';
          case 'Поставлен': return 'Approved';
          case 'СЕКЦИИ': return 'SECTIONS';
          case 'Описание задачи': return 'Issue Description';
          case 'Вложения': return 'File Attachments';
          case 'Сведения': return 'Details';
          case 'Статус': return 'Status';
          case 'Дата начала': return 'Date begin';
          case 'Срок исполнения': return 'Date due';
          case 'Отдел': return 'Department';
          case 'Автор': return 'Author';
          case 'Отвественный': return 'Responsible';
          case 'Исполнитель': return 'Assignee';
          case 'Сверхурочные': return 'Out of Work';
          case 'ID задачи': return 'Issue ID';
          case 'Активность': return 'Activity';
          case 'Показать': return 'Show';
          case 'Все': return 'All';
          case 'Комментарии': return 'Messages';
          case 'История': return 'History';
          case 'создал': return 'created';
          case 'задачу': return 'issue';
          case 'ДОКУМЕНТЫ': return 'DOCUMENTS';
          case 'Логин': return 'Login';
          case 'Пароль': return 'Password';
          case 'Запомнить меня': return 'Remember me';
          case 'Если вы не являетесь зарегистрированным пользователем, для получения логина и пароля обратитесь к системному администратору.': return 'If you are not a registered user, contact your system administrator to obtain a username and password.';
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
