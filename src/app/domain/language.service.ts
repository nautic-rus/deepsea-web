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
          case 'Сверхурочные': return 'Out of work';
          case 'ID задачи': return 'Task ID';
          case 'Активность': return 'Activity';
          case 'Показать': return 'Show';
          case 'Все': return 'All';
          case 'Комментарии': return 'Messages';
          case 'История': return 'History';
          case 'создал': return 'created';
          case 'задачу': return 'task';
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
          case 'Копировать ссылку задачи': return 'Copy link to task';
          case 'Копировать задачу': return 'Copy task';
          case 'Удалить задачу': return 'Remove task';
          case 'Полужирный Ctrl+B': return 'Bold Ctrl+B';
          case 'Курсив Ctrl+I': return 'Italic Ctrl+I';
          case 'Подчеркнутый Ctrl+U': return 'Underline Ctrl+U';
          case 'Цвет текста': return 'Font color';
          case 'Фон текста': return 'Font background';
          case 'Нумерованный список': return 'Numbered list';
          case 'Маркированный список': return 'Bulleted list';
          case 'Выравнивание': return 'Alignment';
          case 'Ссылка Ctrl+K': return 'Link Ctrl+K';
          case 'Файлы и изображения': return 'Files and images';
          case 'Фрагмент кода': return 'Code snippet';
          case 'Отменить форматирование': return 'Clear all formatting';
          case 'Отменить': return 'Cancel';
          case 'Сохранить': return 'Save';
          case 'Согласование': return 'Approvement';
          case 'Добавить комментарий...': return 'Post your message here...';
          case 'изменил': return 'changed';
          case 'назначил': return 'assigned';
          case 'Исполнителя': return 'Executor';
          case 'информацию': return 'information';
          case 'Да': return 'Yes';
          case 'Нет': return 'No';
          case 'Подтверждение': return 'Confirmation';
          case 'Создано': return 'Created';
          case 'Назначение задачи': return 'Task assign';
          case 'Ответственный': return 'Responsible';
          case 'Сделать задачу сверхурочной': return 'Overtime work';
          case 'Сменить ответственного': return 'Change responsible';
          case 'Вы подтверждаете удаление задачи?': return 'Are you sure you want to delete this task?';
          case 'Отправить на согласование': return 'Send to approval';
          case 'Описание': return 'Description';
          case 'На согласование:': return 'For approval:';
          case '{0} выбрано': return '{0} selected';
          case 'Выберите номер ревизии': return 'Select the revision number';
          case 'Очистить фильтры': return 'Clear filters';
          case 'Скрыть исполненные': return 'Hide completed';
          case 'Показать исполненные': return 'Show completed';
          case 'Автор/ответственный': return 'Author/responsible';
          case 'Изменилось описание к задаче': return 'Task description has changed';
          case 'Внимание': return 'Attention';
          case 'Номер чертежа': return 'Document number';
          case 'Ревизия': return 'Revision';
          case 'Дата поставки': return 'Delivery date';
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
