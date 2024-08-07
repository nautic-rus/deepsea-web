import { Injectable } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  language = 'en';
  constructor(private route: ActivatedRoute, private router: Router) {
    if (localStorage.getItem('lang') != null){
      this.language = localStorage.getItem('lang')!;
    }
    else{
      if (navigator.language == 'ru-RU'){
        this.language = 'ru';
      }
      else{
        this.language = 'en';
      }
    }
    // this.route.queryParams.subscribe(res => {
    //   this.language = res.lang != null ? res.lang : 'en';
    // });
  }
  switchLang(lang: string){
    localStorage.setItem('lang', lang);
    location.reload();
    //let lang = this.language == 'ru' ? 'en' : 'ru';
    // this.router.navigate([], {queryParams: {lang}, queryParamsHandling: 'merge'}).then(() => {
    //   location.reload();
    // });
  }
  tr(input: string){
    switch (this.language) {
      case 'en':{
        switch (input) {
          case 'Проект': return 'Project';
          case 'Проекты': return 'Projects';
          case 'Приоритет': return 'Priority';
          case 'Тип задачи': return 'Task Type';
          case 'Этап': return 'Stage';
          case 'Перетащите файлы или нажмите для загрузки': return 'Drop files here or click this to upload';
          case 'Новый': return 'New';
          case 'В работе': return 'In work';
          case 'На согласовании': return 'On Approval';
          case 'Отправлен заказчику': return 'Send To ShipYard';
          case 'Поставлен': return 'Delivered';
          case 'СЕКЦИИ': return 'SECTIONS';
          case 'Описание задачи': return 'Task description';
          case 'Описание задачи*': return 'Task description*';
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
          case 'Показать еще': return 'Show more';
          case 'Скрыть': return 'Show less';
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
          case 'Экспорт XLS': return 'Export XLS';
          case 'Экспорт PDF': return 'Export PDF';
          case 'Экспорт': return 'Export';
          case 'Поиск...': return 'Search...';
          case 'Количество задач:': return 'Number of tasks';
          case '(Всего:': return '(Total:';
          case 'Создать задачу': return 'Create task';
          case 'Номер документа': return 'Document number';
          case 'Номер документа*': return 'Document number*';
          case 'Название документа': return 'Document name';
          case 'Название документа*': return 'Document name*';
          case 'Назначить ответственного': return 'Assign responsible';
          case 'Назначить ответственного*': return 'Assign responsible*';
          case 'Назначить': return 'Assign';
          case 'Вложение': return 'File attachments';
          case 'Создать': return 'Create';
          case 'Отмена': return 'Cancel';
          case 'Название задачи': return 'Task name';
          case 'Название задачи*': return 'Task name*';
          case 'Срок завершения': return 'Date due';
          case 'МОЯ СТРАНИЦА': return 'HOME';
          case 'МАТЕРИАЛЫ': return 'MATERIALS';
          case 'СОТРУДНИКИ': return 'EMPLOYEES';
          case 'Выйти': return 'Exit';
          case 'Копировать ссылку задачи': return 'Copy link to task';
          case 'Копировать ссылку поставщика': return 'Copy link to supplier';
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
          case 'приоритет': return 'priority';
          case 'исполнителя': return 'assignee';
          case 'Исполнителя': return 'Assignee';
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
          case 'Отправить на согласование': return 'Send for approval';
          case 'Описание': return 'Description';
          case 'На согласование:': return 'For approval:';
          case '{0} выбрано': return '{0} selected';
          case 'Выберите номер ревизии': return 'Select the revision number';
          case 'Очистить фильтры': return 'Clear filters';
          case 'Удалить фильтр?': return 'Delete your filter?';
          case 'Скрыть исполненные': return 'Hide completed';
          case 'Показать исполненные': return 'Show completed';
          case 'Автор/ответственный': return 'Author/responsible';
          case 'Изменилось описание к задаче': return 'Task description has changed';
          case 'Внимание': return 'Attention';
          case 'Номер чертежа': return 'Document number';
          case 'Ревизия': return 'Revision';
          case 'Дата поставки': return 'Delivery date';
          case 'Родительская задача': return 'Parent task';
          case 'Примечание': return 'Note';
          case 'сообщение': return 'message';
          case 'Текущая ревизия': return 'Current revision';
          case 'Предыдущие ревизии': return 'Previous revisions';
          case 'Дата обновления': return 'Update date';
          case 'Файлы ревизии': return 'Revisions files';
          case 'Электронная СП': return 'Specification';
          case 'Дата первой отправки': return 'First send date';
          case 'Трудоемкость': return 'Laboriousness';
          case 'Продолжить без создания задачи на согласование': return 'Continue without creating a task for approval';
          case 'Создать новую задачу на согласование': return 'Create new task for approval';
          case 'Задача уже была в статусе "Отправлен на верфь", выберете дальнейшее действие:': return 'Task was already in status "Sent to shipyard", choose the next action:';
          case 'Выберете дальнейшее действие:': return 'Select the next action:';
          case 'Назначен': return 'Assigned';
          case 'Приостановлено': return 'Paused';
          case 'На проверке': return 'On check';
          case 'На доработке': return 'In rework';
          case 'Готов к отправке': return 'Ready to send';
          case 'Отправлен на верфь': return 'Sent to shipyard';
          case 'Готов к поставке': return 'Ready to delivery';
          case 'Сегодня': return 'Today';
          case 'ОТДЕЛ': return 'Department';
          case 'Сотрудники': return 'Employees';
          case 'Б': return 'S';
          case 'О': return 'V';
          case 'В': return 'O';
          case 'Январь': return 'January';
          case 'Февраль': return 'February';
          case 'Март': return 'March';
          case 'Апрель': return 'April';
          case 'Май': return 'May';
          case 'Июнь': return 'June';
          case 'Июль': return 'July';
          case 'Август': return 'August';
          case 'Сентябрь': return 'September';
          case 'Октябрь': return 'October';
          case 'Ноябрь': return 'November';
          case 'Декабрь': return 'December';
          case 'Контроль времени': return 'Time Control';
          case 'Передать права': return 'Share Rights';
          case 'ИНСТРУМЕНТЫ': return 'TOOLS';
          case 'Поделиться': return 'Share';
          case 'Сменить': return 'Change';
          case 'Удалить': return 'Remove';
          case 'Отправить': return 'Send';
          case 'Сгенерировать': return 'Generate';
          case 'Создать подзадачу': return 'Create subtask';
          case 'Создать подзадачу для': return 'Create subtask for';
          case 'Прочее': return 'Other';
          case 'Комплект': return 'Bundle';
          case '': return 'Create list of tray bundles';
          case 'Открыть': return 'Open';
          case 'Название, описание': return 'Name/description';
          case 'Поставщик': return 'Supplier';
          case 'КЕИ': return 'Units';
          case 'Маркировка': return 'Label';
          case 'Вес': return 'Weight';
          case 'Вес, кг': return 'Weight, kg';
          case 'Продолжить': return 'Login';
          case 'РАСЧЁТ': return 'BILLING';
          case 'ТРУДОЗАТРАТЫ': return 'LABORIOUSNESS';
          case 'Чертеж': return 'Drawing';
          case 'Рев.': return 'Rev';
          case 'Отдeл': return 'Dept.';
          case 'Добавить файлы': return 'Add files';
          case 'Загрузить файлы': return 'Upload files';
          case 'Скачать': return 'Download';
          case 'Задач': return 'Tasks';
          case 'Подзадачи': return 'Subtasks';
          case 'Вы уверены, что хотите удалить эти файлы?': return 'Are you sure you want to delete these files?';
          case 'Чек-лист': return 'Checklist';
          case 'Добавить строку': return 'Add row';
          case 'Названиe': return 'Name';
          case 'Группа': return 'Group';
          case 'Вставить из буфера': return 'Paste from clipboard';
          case 'КАБЕЛИ': return 'ELEC CABELS';
          case 'РАСКРОЙ': return 'NESTING';
          case 'Сгенерируйте материалы из FORAN': return 'Generate materials from FORAN';
          case 'Создать спецификацию': return 'Create a specification';
          case 'КОРПУС': return 'HULL';
          case 'Лист': return 'Plate';
          case 'Профиль': return 'Profile';
          case 'Трубы': return 'Pipes';
          case 'Сталь': return 'Steel';
          case 'Алюминий': return 'Aluminium';
          case 'Бронза': return 'Bronze';
          case 'Нержавеющая сталь': return 'Stainless steel';
          case 'Пластик': return 'Plastic';
          case 'Комбинированный материал': return 'Combined material';
          case 'Медно-никелевая (МНЖ)': return 'Cupro-nickel steel';
          case 'Медь': return 'Cuprum';
          case 'Латунь': return 'Brass';
          case 'Крепеж': return 'Fasteners';
          case 'Технологический': return 'Technological';
          case 'Пиломатериал': return 'Lumber';
          case 'Сварочные материалы': return 'Welding consumables';
          case 'СУДОВЫЕ УСТРОЙСТВА': return 'SHIP EQUIPMENT';
          case 'Якорное': return 'Anchor';
          case 'Оборудование': return 'Equipment';
          case 'Швартовое': return 'Mooring';
          case 'Буксирное': return 'Towing';
          case 'Якорно-швартовное': return 'Anchor-mooring';
          case 'Грузовое': return 'Cargo';
          case 'Спасательное': return 'Rescue';
          case 'Шлюпочное': return 'Boat';
          case 'Рулевое': return 'Steering';
          case 'Люковое': return 'Hatch';
          case 'Мачтовое': return 'Mast';
          case 'Промысловое': return 'Fishing';
          case 'ОБОРУДОВАНИЕ ПОМЕЩЕНИЙ': return 'ROOM EQUIPMENT';
          case 'Изоляция': return 'Insulation';
          case 'Съемное': return 'Removable';
          case 'Приварное': return 'Welded';
          case 'Зашивка': return 'Lining';
          case 'Дельные вещи': return 'Practical things';
          case 'Мебель': return 'Furniture';
          case 'Оборудование, техника': return 'Technique';
          case 'Инвентарное имущество': return 'Inventory property';
          case 'Аварийно-спасательное и противопожарное имущество': return 'Rescue and fire fighting equipment';
          case 'СУДОВЫЕ СИСТЕМЫ': return 'SHIP SYSTEMS';
          case 'Арматура': return 'Fittings';
          case 'Ручная': return 'Hand';
          case 'Дистанционная': return 'Remote';
          case 'Автоматическая': return 'Automatic';
          case 'Фасонные части (часть трубы)': return 'Fittings (pipe part)';
          case 'Изоляция труб': return 'Pipe insulation';
          case 'Насос': return 'Pump';
          case 'Вентиляция и кондиционирование': return 'Ventilation and air conditioning';
          case 'Механическое оборудование': return 'Mechanical equipment';
          case 'Контрольно-измерительные приборы': return 'Control and measuring instruments';
          case 'Давление': return 'Pressure';
          case 'Температура': return 'Temperature';
          case 'Уровень': return 'Layer';
          case 'ЭНЕРГЕТИЧЕСКАЯ УСТАНОВКА': return 'POWER PLANT';
          case 'ЭЛЕКТРИЧЕСКОЕ ОБОРУДОВАНИЕ': return 'ELECTRICAL EQUIPMENT';
          case 'Источники электрической энергии': return 'Electrical energy sources';
          case 'Генератор': return 'Generator';
          case 'Трансформатор': return 'Transformer';
          case 'Преобразователь напряжения': return 'Voltage transformer';
          case 'Аккумуляторная батарея': return 'Accumulator battery';
          case 'Щит питания и управления': return 'Power and control board';
          case 'Коробки соединительные, розетки, выключатели, штепсели': return 'MGA';
          case 'Навигационное оборудование': return 'Navigation equipment';
          case 'Оборудование радиосвязи': return 'Radio communication';
          case 'Освещение': return 'Lighting';
          case 'Автоматизация': return 'Automation';
          case 'Сигнализация': return 'Signaling';
          case 'Электрообогрев': return 'Electrical heating';
          case 'Сигнальные средства': return 'Signal means';
          case 'Защита от коррозии': return 'Corrosion protection';
          case 'Специальное оборудование (рыбопоисковое и т.п.)': return 'Special equipment';
          case 'Кабель': return 'Cable';
          case 'Кабель в поставке': return 'Cable supplier';
          case 'Кабель завод-строитель': return 'Сable Yard';
          case 'МСЧ': return 'ENGINEERING PART';
          case 'Наименование': return 'Name';
          case 'Обозначение': return 'Description';
          case 'КВЗ': return 'CSS';
          case 'Коэф.': return 'Coef.';
          case 'Код ведомости': return 'Statement code';
          case 'Примечания': return 'Notes';
          case 'Заводской код': return 'Shipyard code';
          case 'Клапаны': return 'Valves';
          case 'Кабели': return 'Cables';
          case 'Листы': return 'Plates';
          case 'Профили': return 'Profiles';
          case 'Раздел находится в разработке.': return 'Page under construction!';
          case 'Приносим свои извинения.': return 'Please come back later...';
          case 'Швартовное': return 'Mooring';
          case 'Добавить': return 'Add';
          case 'Добавить материал': return 'Add material';
          case 'Копировать': return 'Copy material';
          case 'Редактировать': return 'Edit';
          case 'Номер': return 'Number';
          case 'ВЕС': return 'WEIGHT';
          case 'Вес, кг': return 'Weight, kg';
          case 'Не согласован': return 'Not approved';
          case 'Вы собираетесь навсегда удалить эту задачу, а также связанные с ней комментарии, данные и вложения.': return 'You are going to permanently delete this task, as well as related comments, data, and attachments.';
          case 'КОНТРОЛЬ ВЕСА': return 'WEIGHT CONTROL';
          case 'Выгрузить в Excel': return 'Export XLS';
          case 'Общая масса:': return 'Total weight';
          case 'Документация': return 'Documentation';
          case 'Исполнитель - ': return 'Assignee - ';
          case 'Ответственный - ': return 'Responsible - ';
          case 'ОР': return 'OR';
          case 'ИЗ': return 'IZ';
          case 'Ссылка': return 'Link';
          case 'Автор - ': return 'Author - ';
          case 'Назначить исполнителя': return 'Assign assignee';
          case 'Конвертировать': return 'Convert';
          case 'Открыть файлы': return 'Open files';
          case 'Загрузить': return 'Download';
          case 'Формат': return 'Format';
          case 'Прошло конвертацию': return 'Passed the conversion';
          case 'Выбор даты': return 'Selected date';
          case 'Отработанные часы': return 'Hours worked';
          case 'Добавление часов': return 'Task hours to add';
          case 'Нажмите здесь, чтобы заполнить свои ежедневные задачи': return 'Click here to fill in your daily tasks';
          case 'Ежедневные отчеты': return 'Daily reports';
          case 'Заполните информацию о ваших задачах на выбранный день': return 'Please fill information about your tasks for selected day';
          case 'Добавить задачу': return 'Add a task';
          case 'Действие': return 'Action';
          case 'Подробности': return 'Details';
          case 'Вы использовали:': return 'You used:';
          case 'из': return 'from';
          case 'часов': return 'hours';
          case 'Количество часов для задачи': return 'Hours you worked with this task';
          case 'Вы действительно хотите удалить эту задачу?': return 'Do you really want to delete this task?';
          case 'Введите проект...': return 'Enter project...';
          case 'Введите документ...': return 'Enter document...';
          case 'Введите действие...': return 'Enter action...';
          case 'Введите описание...': return 'Enter details...';
          case 'Введите название новой папки': return 'Enter the name of the new folder';
          case 'Код': return 'Code';
          case 'Название папки': return 'Folder name';
          case 'Код (вставьте код вместо ###)': return 'Code (insert code instead of ###)';
          case 'Добавить новую папку': return 'Add a new folder';
          case 'Выгрузить ексель': return 'Export excel';
          case 'Ед. изм.': return 'Units';
          case 'Контрактный срок исп.': return 'Stage due date';
          case 'Месяц': return 'Month';
          case 'День': return 'Day';
          case 'Задачи': return 'Tasks';
          case 'Опергруппа': return 'Operations group';
          case 'Обновить готовность': return 'Update preparedness' ;
          case 'Сгруппировать по материалу': return 'Group by material';
          case 'Выгрузить excel': return 'Upload excel';
          case 'Вы подтверждаете статус готовности оборудования?': return 'Do you confirm the equipment readiness status?';
          case 'Связанная задача': return 'Link issue';
          case 'Accepted': return 'Принято';
          case 'Вы подтверждаете удаление элемента?': return 'Do you confirm the deletion of the item?';
          case 'Удалить позицию': return 'Delete a position';
          case 'Дата изменения': return 'Last date';
          case 'Дата создания': return 'Date created';
          case 'Задать вопрос': return 'Ask a question';
          case 'Тема': return 'Topic';
          case 'Вопрос': return 'Question';
          case 'Подписаться на уведомления': return 'Subscribe to notifications';
          case 'Описание вопроса': return 'Question description';
          case 'Начать исполнение': return 'Strat date';
          case 'Выполнить до': return 'Due date';
          case 'Подписаться': return 'Subscribe';
          case 'Укажите вариант уведомлений и проверьте актуальность контактов': return 'Specify the notification option and check the relevance of contacts';
          case 'Подписавшиеся пользователи': return 'Subscribed users';
          case 'Задать новый вопрос': return 'Ask a new question';
          case 'Тема вопроса (обязательно для заполнения*)': return 'Subject of the question (required*)';
          case 'Описание вопроса (обязательно для заполнения*)': return 'Description of the question (required*)';
          case 'Документ': return 'Document';
          case 'Трудозатраты': return 'Actual man-hours';
          case 'Корректировки': return 'Correction';
          case 'Разработка': return 'Development';
          case 'ПДСП': return 'PDSP';
          case 'РКД': return 'RKD';
          case 'Зафиксировать все': return 'Lock them all';
          case 'Трудоёмкость': return 'Plan man-hours';
          case 'Добавить часы': return 'Add an hours';
          case 'Создать связанную задачу': return 'Create related task';
          case 'Плановая трудоёмкость': return 'Plan man-hours';
          case 'Связанные задачи': return 'Related tasks';
          case 'Выберите': return 'Select';
          case 'Связать задачи': return 'Link Tasks';
          case 'Выбрать задачи': return 'Select tasks';
          case 'Привязать задачу': return 'Link a task';
          case 'Причина изменения': return 'Reason of modification';
          case 'Описание изменения': return 'Modification description';
          case 'Изменение существующего': return 'Modification of existing';
          case 'Доработка задела': return 'Modification of existing';
          case 'доработку задела': return 'modification of existing';
          case 'Связанные': return 'Linked';
          case 'Исполнено': return 'Done';
          case 'Роль': return 'Role';
          case 'Роли': return 'Roles';
          case 'Новый пользователь': return 'New user';
          case 'Новая роль': return 'New role';
          case 'Новый проект': return 'New project';
          case 'Аватар': return 'Avatar';
          case 'Имя': return 'Name';
          case 'Фамилия': return 'Surname';
          case 'Должность': return 'Profession';
          case 'День рождения': return 'Birthday';
          case 'Почта': return 'Mail';
          case 'Телефон': return 'Phone';
          case 'Рокет логин': return 'Rocket login';
          case 'Видимость': return 'Visibility';
          case 'Доступные проекты': return 'Visible projects';
          case 'Доступные страницы': return 'Visible pages';
          case 'Права': return 'Permissions';
          case 'Токен': return 'Token';
          case 'Файлы': return 'Files';
          case 'Инфо': return 'Info';
          case 'Сводка': return 'Summary';
          case 'Архив': return 'Archive';
          case 'Исп.': return 'Assign to';
          case 'Карточка пользователя': return 'User Card';
          case 'Создание пользователя': return 'Create User';
          case 'Общий доступ': return 'Shared access';
          case 'Пол': return 'Gender';
          case 'Проекты пользователя': return 'User Projects';
          case 'Завод': return 'Factory';
          case 'Менеджеры': return 'Managers';
          case 'Создать роль': return 'Create a role';
          case 'Новое право': return 'New right';
          case 'Право': return 'Right';
          case 'Тип': return 'Type';
          case 'Выберите задачу из списка': return 'Select a task from the list';
          case 'Гендер': return 'Gender';
          case 'Логин RocketChat': return 'Login RocketChat';
          case 'Показать незапланированные': return 'Show without plan';
          case 'Кабельные коробки': return 'Cable boxes';
          case 'Сводные данные': return 'Summary';
          case 'Пользователи': return 'Users';
          case 'назначить': return 'assign';
          case 'использовано': return 'used';
          case 'план': return 'plan';
          case 'Показать назначенные': return 'Show assigned';
          case 'срок исполнения': return 'due date';
          case 'отдел': return 'department';
          case 'Отпуск': return 'Vacation';
          case 'дни': return 'days';
          case 'Больничный': return 'Medical';
          case 'Поправка длины': return 'Correction';
          case 'Проложен': return 'Full routed';
          case 'Не проложен': return 'Not routed';
          case 'Частично проложен': return 'Partially routed';
          case 'примечание': return 'note';
          case 'Перейти к плану': return 'Go to Plan';
          case 'Добавить закупку': return 'Add purchased';
          case 'Номер договора': return 'Contract number';
          case 'Сумма': return 'Amount';
          case 'Домой': return 'Home';
          case 'Рекомендованная дата ответа': return 'Recommended response date';
          case 'Пучковая прокладка': return 'Bundle gasket';
          case 'Отв.': return 'Resp.';
          case 'Срок исп.': return 'Due date';
          case 'Новый - ': return 'New - ';
          case 'В работе - ': return 'In work - ';
          case 'Приостановлено - ': return 'Paused - ';
          case 'Исполнено - ': return 'Resolved - ';
          case 'Закрыто - ': return 'Closed - ';
          case 'Отклонено - ': return 'Rejected - ';
          case 'Информация': return 'Info';
          case 'Применить ко всем': return 'Apply to all';
          case 'Отправить данные для входа': return 'Send login information';
          case 'Удаление пользователя': return 'Deleting a user';
          case 'Пользователь удалён': return 'User deleted';
          case 'Не удалось удалить пользователя': return 'Failed to delete user';
          case 'Данные для входа': return 'Login information';
          case 'Данные для входа доставлены': return 'Login data delivered';
          case 'Не удалось доставить данные для входа': return 'Failed to deliver login data';
          case 'Сохранение пользователя': return 'Saving a user';
          case 'Данные пользователя сохранены': return 'User data saved';
          case 'Не удалось сохранить данные пользователя': return 'Failed to save user data';
          case 'Новый пользователь создан': return 'A new user has been created';
          case 'Не удалось создать нового пользователя': return 'Failed to create a new user';
          case 'Создание роли': return 'Creating a Role';
          case 'Роль создана': return 'Role created';
          case 'Не удалось создать роль': return 'Failed to create a role';
          case 'Удаление роли': return 'Removing a Role';
          case 'Роль удалена': return 'Role deleted';
          case 'Не удалось удалить роль': return 'Failed to remove a role';
          case 'Сохранение роли': return 'Saving a role';
          case 'Данные роли сохранены и применены ко всем пользователям': return 'These roles are saved and applied to all users';
          case 'Данные роли сохранены': return 'Role data is saved';
          case 'Не удалось сохранить данные роли': return 'Failed to save role data';
          case 'Удаление проекта': return 'Deleting a project';
          case 'Проект удалён': return 'Project deleted';
          case 'Не удалось удалить проект': return 'Failed to delete project';
          case 'Сохранение проекта': return 'Saving the project';
          case 'Проект сохранён': return 'The project has been saved';
          case 'Не удалось сохранить проект': return 'Failed to save the project';
          case 'Создание проекта': return 'Creating a project';
          case 'Новый проект создан': return 'A new project has been created';
          case 'Не удалось создать новый проект': return 'Failed to create a new project';
          case 'Без позиций': return 'Show no spool';
          case 'Обновлено': return 'Last update';
          case 'Отдел *': return 'Department *';
          case 'Номер документа *': return 'Document number *';
          case 'Описание изменения *': return 'Modification description *';
          case 'Назначить ответственного *': return 'Assign responsible *';
          case 'исп.': return 'used';
          case 'Комментарий': return 'Comment';
          case 'Учёба': return 'Study';
          case 'Отгул': return 'Day off';
          case 'Дата': return 'Date';
          case 'Пользователь': return 'User';
          case 'Часы': return 'Hours';
          case 'Ответ к задаче': return 'Answer to the task';
          case 'Файл': return 'File';
          case 'Помощь': return 'Help';
          case 'Открыть облако': return 'Open Cloud';
          case 'Открыть задачу': return 'Open task';
          case 'Экспорт эскизов': return 'Export Sketches';
          case 'Показать чертеж': return 'Show Drawing';
          case 'Получить спецификацию': return 'Get Spec';
          case 'Очистить всё': return 'Clear files';
          case 'Загрузка файлов': return 'Uploading files';
          case 'Оперативное решение': return 'Correction';
          case 'Отправить уведомление на e-mail': return 'Send email notification';
          case 'Удалить выбранные': return 'Delete selected';
          case 'Настройка уведомлений': return 'Notifications settings';
          case 'Новое уведомление': return 'New notification';
          case 'Удалить уведомление': return 'Delete notification';
          case 'Метод': return 'Method';
          case 'Создание уведомления': return 'Create notification';
          case 'Новое уведомление создано': return 'Notification has been created';
          case 'Не удалось создать новое уведомление': return 'Failed to create notification'
          case 'Удаление уведомления': return 'Removing a notification'
          case 'Уведомление удалено': return 'Notification removed'
          case 'Не удалось удалить уведомление': return 'Failed to delete notification'
          case 'Сохранить изменения': return 'Save changes'
          case 'Сохранить фильтр': return 'Save filter'
          case 'Удалить фильтр': return 'Delete filter'
          case 'трудоёмкость': return 'man-hours'
          case 'Списано часов': return 'Actual man-hours'
          case 'Скачать все': return 'Download all'
          case 'ПН': return 'Mon'
          case 'ВТ': return 'Tue'
          case 'СР': return 'Wed'
          case 'ЧТ': return 'Thu'
          case 'ПТ': return 'Fri'
          case 'СБ': return 'Sat'
          case 'ВС': return 'Sun'
          case 'Прим.': return 'Note'
          case 'Корр.': return 'Corr.'
          case 'Договор': return 'Contract'
          case 'Комментарий автора': return 'Comment by author'
          case 'Удалить связь': return 'Untie a task'
          case 'Выберите период': return 'Choose the period'
          case 'Текущая неделя': return 'Current week'
          case 'Текущий месяц': return 'Current month'
          case 'Вчера': return 'Yesterday'
          case 'Прошлая неделя': return 'Last week'
          case 'Прошлый месяц': return 'Last month'
          case 'Выберите отделы': return 'Choose the departments'
          case 'Временные графики': return 'Time charts'
          case 'План': return 'Plan'
          case 'Офис': return 'Office'
          case 'Только инженеры': return 'Only engineers'
          case 'Выберите сотрудника': return 'Choose the user'
          case 'Отчет пользователя': return 'User report'
          case 'Сотрудник': return 'User'
          case 'Date': return 'Дата'
          case 'Time': return 'Время'
          case 'Type': return 'Тип'
          case 'Name': return 'Название'
          case 'Document': return 'Документ'
          case 'Hours': return 'Часы'
          case 'Написать': return 'Message'
          case 'Выходной': return 'Day off'
          case 'За выбранный период': return 'In chosen period'
          case 'Больнич.': return 'Sick'
          case 'д.': return 'd'
          case 'ч.': return 'h'
          case 'Удален': return 'Removed'
          case 'договор': return 'contract'
          case 'Закрыть задачу (установить статус "Поставлен")': return 'Close the task (set the status to "Delivered")'
          case 'Назначить себе': return 'Assign myself'
          case 'Поставить задачу в конец плана': return 'Place the task at the end of the plan'
          case 'Добавить комплект': return 'Add a set'
          case 'Удалить комплект': return 'Delete set'
          case 'Установки': return 'Features'
          case 'На согласование': return 'To approval'
          case 'Создать задачи "Согласование"': return 'Create new "Approval" tasks'
          case 'Продолжить не создавая задач "Согласование"': return 'Continue without creating new "Approval" tasks'
          case 'Трудoёмкость': return 'Man-hours progress'
          case 'Общий прогресс': return 'General progress'
          case 'Прогресс по отделам': return 'Progress by department'
          case 'Прогресс по чертежам': return 'Documents progress'
          case 'Прогресс по этапам': return 'Stage progress'
          case 'Создать группу': return 'Add group'
          case 'Создать оборудование': return 'Create equipment'
          case 'Создать новое оборудование': return 'Create a new equipment'
          case 'Редактировать оборудование': return 'Edit a equipment'
          case 'Редактировать группу': return 'Edit a group'
          case 'Добавить оборудование': return 'Add a new equipment'
          case 'Поставщики': return 'Suppliers'
          case 'Добавить поставщика': return 'Add a new supplier'
          case 'Добавить поставку': return 'Add supply'
          case 'Создать поставщика': return 'Create a new supplier'
          case 'Редактировать поставщика': return 'Edit a supplier'
          case 'Удалить поставщика': return 'Delete a supplier'
          case 'Модель': return 'Model'
          case 'Эл. парам': return 'Electric. param'
          case 'Мех. парам': return 'Mech. param'
          case 'Производитель': return 'Manufacturer'
          case 'Удалить оборудование?': return 'Delete a equipment?'
          case 'Удалить поставщика?': return 'Delete a supplier?'
          case 'Удалить файл оборудования?': return 'Delete a equipment`s file?'
          case 'Удалить файл поставщика?': return 'Delete a supplier`s files?'
          case 'добавил(а) поставщика': return 'created a supplier'
          case 'добавил(а) файл': return 'added a file'
          case 'изменил(а) производителя': return 'changed a manufacturer'
          case 'изменил(а) комментарий': return 'changed a comment'
          case 'изменил(а) поставщика': return 'changed a supplier'
          case 'изменил(а) описание': return 'changed a description'
          case 'изменил(а) наименование': return 'changed a name'
          case 'изменил(а) мех. парам': return 'changed a mech. param'
          case 'изменил(а) эл. парам': return 'changed a elec. param'
          case 'изменил(а) статус': return 'changed a status'
          case 'Загружен': return 'Uploaded'
          case 'Корректировка': return 'Correction'
          case 'Здесь пока нет заархивированных файлов': return 'There are no archived files here yet'
          case '': return ''
          default: return input;
        }
      }
      default: {
        return input;
      }
    }
  }
}
