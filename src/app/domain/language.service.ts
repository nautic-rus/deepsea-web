import { Injectable } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  language = 'ru';
  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe(res => {
      this.language = res.lang != null ? res.lang : 'ru';
    });
  }
  switchLang(){
    let lang = this.language == 'ru' ? 'en' : 'ru';
    this.router.navigate([], {queryParams: {lang}, queryParamsHandling: 'merge'}).then(() => {
      location.reload();
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
          case 'Описание задачи': return 'Task Description';
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
          case 'Очистить': return 'Clear';
          case 'Название': return 'Title';
          case 'Новая задача': return 'New task';
          case '{0} выбрано колонок': return '{0} columns selected';
          case 'Импорт': return 'Import';
          case 'Экспорт': return 'Export';
          case 'Поиск...': return 'Search...';
          case 'Количество задач:': return 'Number of tasks';
          case '(Всего:': return '(Total:';
          case 'Создать задачу': return 'Create task';
          case 'Номер документа': return 'Document number';
          case 'Название документа': return 'Document name';
          case 'Назначить ответственного': return 'Assign responsible';
          case 'Назначить': return 'Assign';
          case 'Вложение': return 'File attachments';
          case 'Создать': return 'Create';
          case 'Отмена': return 'Cancel';
          case 'Название задачи': return 'Task name';
          case 'Срок завершения': return 'Date due';
          case 'МОЯ СТРАНИЦА': return 'HOME';
          case 'МАТЕРИАЛЫ': return 'MATERIALS';
          case 'СОТРУДНИКИ': return 'EMPLOYEES';
          case 'Выйти': return 'Exit';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
          case '': return '';
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
