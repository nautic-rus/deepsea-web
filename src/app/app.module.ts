import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { HomeComponent } from './component/home/home.component';
import { NaviComponent } from './component/navi/navi.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AccordionModule} from 'primeng/accordion';     //accordion and accordion tab
import {ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {TableModule} from "primeng/table";
import {MultiSelectModule} from "primeng/multiselect";
import {InputTextModule} from "primeng/inputtext";
import {ProgressBarModule} from "primeng/progressbar";
import {ButtonModule} from "primeng/button";
import {SliderModule} from "primeng/slider";
import {DropdownModule} from "primeng/dropdown";
import {TooltipModule} from "primeng/tooltip";
import {ToastModule} from "primeng/toast";
import { CreateTaskComponent } from './component/create-task/create-task.component';
import { TaskComponent } from './component/task/task.component';                  //api
import {EditorModule} from "primeng/editor";
import {DialogModule} from "primeng/dialog";
import {CascadeSelectModule} from "primeng/cascadeselect";
import {CalendarModule} from "primeng/calendar";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {MessagesModule} from "primeng/messages";
import { SafeHtmlPipe } from './domain/safe-html.pipe';                  //api
import {GalleriaModule} from "primeng/galleria";
import {QuillModule} from "ngx-quill";
import Quill from "quill";                  //api
// @ts-ignore
import ImageResize from 'quill-image-resize-module';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import { NgInitDirective } from './domain/ng-init.directive';
import {RippleModule} from "primeng/ripple";
import { AssignComponent } from './component/task/assign/assign.component';
import {InputSwitchModule} from "primeng/inputswitch";
import { ImportxlsComponent } from './component/home/importxls/importxls.component';
import { SendToApprovalComponent } from './component/task/send-to-approval/send-to-approval.component';
import {InputTextareaModule} from "primeng/inputtextarea";
import { MaterialsComponent } from './component/materials/materials.component';
import { AddMaterialComponent } from './component/materials/add-material/add-material.component';
import {InputNumberModule} from "primeng/inputnumber";
import { ChangeResponsibleComponent } from './component/task/change-responsible/change-responsible.component';
import {CheckboxModule} from "primeng/checkbox";
import { SendToCloudComponent } from './component/task/send-to-cloud/send-to-cloud.component';
import { GanttComponent } from './component/gantt/gantt.component';
import { SectionsComponent } from './component/sections/sections.component';
import { DocumentsComponent } from './component/documents/documents.component';
import { EmployeesComponent } from './component/employees/employees.component';
import { DeleteComponent } from './component/task/delete/delete.component';
import { DocExplorerComponent } from './component/doc-explorer/doc-explorer.component';
import { UserCardComponent } from './component/employees/user-card/user-card.component';
import {NgxCollapseModule} from 'ngx-collapse';
import {ToggleButtonModule} from "primeng/togglebutton";
import { SendToYardApprovalComponent } from './component/task/send-to-yard-approval/send-to-yard-approval.component';
import { ConfirmAlreadyExistComponent } from './component/task/confirm-already-exist/confirm-already-exist.component';
import { ConfirmAlreadyExistSendToApprovalComponent } from './component/task/confirm-already-exist-send-to-approval/confirm-already-exist-send-to-approval.component';
import { ConfirmAlreadyExistSendToYardComponent } from './component/task/confirm-already-exist-send-to-yard/confirm-already-exist-send-to-yard.component';
import { ViewDocumentComponent } from './component/documents/view-document/view-document.component';
import {MenuModule} from "primeng/menu";
import { LaboriousnessComponent } from './component/task/laboriousness/laboriousness.component';
import { StatsComponent } from './component/stats/stats.component';
import { TimeControlComponent } from './component/time-control/time-control.component';
import {OverlayPanelModule} from "primeng/overlaypanel";
import { ShareRightsComponent } from './component/navi/share-rights/share-rights.component';
import {QrCodeModule} from "ng-qrcode";
import { DocMComponent } from './component/doc-m/doc-m.component';
import { ToolsComponent } from './component/tools/tools.component';
import {StyleClassModule} from "primeng/styleclass";
import { LaborCostsComponent } from './component/labor-costs/labor-costs.component';
import { TraysByZonesAndSystemsComponent } from './component/tools/trays-by-zones-and-systems/trays-by-zones-and-systems.component';
import { HullEspComponent } from './component/documents/hull-esp/hull-esp.component';
import {TabViewModule} from "primeng/tabview";
import {UploadRevisionFilesComponent} from "./component/documents/hull-esp/upload-revision-files/upload-revision-files.component";
import { AssignNewRevisionComponent } from './component/documents/hull-esp/assign-new-revision/assign-new-revision.component';
import { DxfViewComponent } from './component/dxf-view/dxf-view.component';
import { GenerationWaitComponent } from './component/tools/trays-by-zones-and-systems/generation-wait/generation-wait.component';
import {FieldsetModule} from "primeng/fieldset";
import { HullEspGenerationWaitComponent } from './component/documents/hull-esp/hull-esp-generation-wait/hull-esp-generation-wait.component';
import { ClearFilesComponent } from './component/documents/hull-esp/clear-files/clear-files.component';
import { PdfViewComponent } from './component/pdf-view/pdf-view.component';
import {NgxExtendedPdfViewerModule} from "ngx-extended-pdf-viewer";
import { CreateCheckListComponent } from './component/task/create-check-list/create-check-list.component';
import { ElecCablesComponent } from './component/elec-cables/elec-cables.component';
import {NgxGanttModule} from "@worktile/gantt";
import { NestingComponent } from './component/nesting/nesting.component';
import {BarChartModule, PieChartModule} from "@swimlane/ngx-charts";
import { WebgcodeComponent } from './component/webgcode/webgcode.component';
import { GCodeComponent } from './component/g-code/g-code.component';
import { HighLightPipe } from './domain/high-light.pipe';
import { BillingComponent } from './component/billing/billing.component';
import {TreeModule} from "primeng/tree";
import { ReportComponent } from './component/report/report.component';
import { PartsQtyComponent } from './component/billing/parts-qty/parts-qty.component';
import {ContextMenuModule} from "primeng/contextmenu";
import { WastageComponent } from './component/billing/wastage/wastage.component';
import { BlocksComponent } from './component/billing/blocks/blocks.component';
import { WeightComponent } from './component/weight/weight.component';
import { PartsQtyProfileComponent } from './component/billing/parts-qty-profile/parts-qty-profile.component';
import { FileExplorerComponent } from './component/file-explorer/file-explorer.component';
import {TreeTableModule} from "primeng/treetable";
import { VacantWastageComponent } from './component/nesting/vacant-wastage/vacant-wastage.component';
import { BsTreeNodesComponent } from './component/tools/bs-tree-nodes/bs-tree-nodes.component';
import {VirtualScrollerModule} from "primeng/virtualscroller";
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import { WeightControlComponent } from './component/weight-control/weight-control.component';
import {ToolbarModule} from "primeng/toolbar";
import {RadioButtonModule} from "primeng/radiobutton";
import { RemoveConfirmationComponent } from './component/materials/remove-confirmation/remove-confirmation.component';
import { PipeEspComponent } from './component/documents/pipe-esp/pipe-esp.component';
import { BillingPipeComponent } from './component/billing-pipe/billing-pipe.component';
import {SidebarModule} from "primeng/sidebar";
import {PanelMenuModule} from "primeng/panelmenu";
import { UserWatchComponent } from './component/user-watch/user-watch.component';
import { NestingPipeComponent } from './component/nesting-pipe/nesting-pipe.component';
import { ObjViewComponent } from './component/obj-view/obj-view.component';
import { DeviceEspComponent } from './component/documents/device-esp/device-esp.component';
import { AccommodationEspComponent } from './component/documents/accommodation-esp/accommodation-esp.component';
import { PipeEspGenerationWaitComponent } from './component/documents/pipe-esp/pipe-esp-generation-wait/pipe-esp-generation-wait.component';
import { DeviceEspGenerationWaitComponent } from './component/documents/device-esp/device-esp-generation-wait/device-esp-generation-wait.component';
import { AddMaterialToEspComponent } from './component/documents/device-esp/add-material-to-esp/add-material-to-esp.component';
import { MpgEsiConverterComponent } from './component/tools/mpg-esi-converter/mpg-esi-converter.component';
import { DailyTasksComponent } from './component/navi/daily-tasks/daily-tasks.component';
import { MonthTasksComponent } from './component/month-tasks/month-tasks.component';
import {FullCalendarModule} from "primeng/fullcalendar";
import { ShowTaskComponent } from './component/navi/daily-tasks/show-task/show-task.component';
import { DeleteDailyTaskComponent } from './component/navi/daily-tasks/show-task/delete-daily-task/delete-daily-task.component';
import {AutoCompleteModule} from "primeng/autocomplete";
import { AccommodationsEspGenerationWaitComponent } from './component/documents/accommodation-esp/accommodations-esp-generation-wait/accommodations-esp-generation-wait.component';
import { BlocksProfileComponent } from './component/billing/blocks-profile/blocks-profile.component';
import { AddGroupDeviceComponent } from './component/documents/device-esp/add-group-device/add-group-device.component';
import { AcceptToWorkComponent } from './component/task/accept-to-work/accept-to-work.component';
import { AssignToResponsibleComponent } from './component/task/assign-to-responsible/assign-to-responsible.component';
import { UserTasksComponent } from './component/employees/user-tasks/user-tasks.component';
import { MontageComponent } from './component/documents/montage/montage.component';
import { CheckedConfirmationComponent } from './component/documents/montage/checked-confirmation/checked-confirmation.component';
import { RemoveWeightComponent } from './component/weight-control/remove-weight/remove-weight.component';
import { RemoveDeviceFromSystemComponent } from './component/documents/device-esp/device-esp-generation-wait/remove-device-from-system/remove-device-from-system.component';
import { QnaComponent } from './component/qna/qna.component';
import { CreateQuestionComponent } from './component/qna/create-question/create-question.component';
import { LaborComponent } from './component/labor/labor.component';
import { ElectricEspComponent } from './component/documents/electric-esp/electric-esp.component';
import { QuestionDetailsComponent } from './component/qna/question-details/question-details.component';
import {ChartModule} from "primeng/chart";
import { AssignQuestionComponent } from './component/qna/assign-question/assign-question.component';
import { SubscribeForNotificationsComponent } from './component/qna/subscribe-for-notifications/subscribe-for-notifications.component';
import {ScrollingModule} from "@angular/cdk-experimental/scrolling";
import { AssignResponsibleComponent } from './component/qna/assign-responsible/assign-responsible.component';
import { CombineIssuesComponent } from './component/task/combine-issues/combine-issues.component';
import { CableExplorerComponent } from './component/tools/cable-explorer/cable-explorer.component';
import { SpyWatchComponent } from './component/spy-watch/spy-watch.component';
import { AdminComponent } from './component/admin/admin.component';
import { CreateUserComponent } from './component/admin/user/create-user/create-user.component';
import { UserComponent } from './component/admin/user/user.component';
import { RoleComponent } from './component/admin/role/role.component';
import { CreateRoleComponent } from './component/admin/role/create-role/create-role.component';
import { ProjectComponent } from './component/admin/project/project.component';
import { CreateProjectComponent } from './component/admin/project/create-project/create-project.component';
import { RightComponent } from './component/admin/right/right.component';
import { CreateRightComponent } from './component/admin/right/create-right/create-right.component';
import { WorkHoursComponent } from './component/work-hours/work-hours.component';
import { TaskAssignComponent } from './component/work-hours/task-assign/task-assign.component';
import { TraysComponent } from './component/documents/trays/trays.component';
import {DragDropModule} from "primeng/dragdrop";
import { TrayEspGenerationWaitComponent } from './component/documents/trays/tray-esp-generation-wait/tray-esp-generation-wait.component';
import { CablesComponent } from './component/documents/cables/cables.component';
import { GenerateEspComponent } from './component/documents/hull-esp/generate-esp/generate-esp.component';
import { MaterialsSummaryComponent } from './component/materials-summary/materials-summary.component';
import { DoclistComponent } from './component/doclist/doclist.component';
import { AddMaterialStockComponent } from './component/materials-summary/add-material-stock/add-material-stock.component';
import { DrawingShowComponent } from './component/materials-summary/drawing-show/drawing-show.component';
import { DesignEspComponent } from './component/documents/design-esp/design-esp.component';
import { MasterComponent } from './component/master/master.component';
import { ConsumedDetailsComponent } from './component/task/consumed-details/consumed-details.component';
import { GeneralEspComponent } from './component/documents/general-esp/general-esp.component';
import { UploadMultipleFilesComponent } from './component/documents/upload-multiple-files/upload-multiple-files.component';
import { DeleteUserComponent } from './component/admin/user/delete-user/delete-user.component';
import { DeleteProjectComponent } from './component/admin/project/delete-project/delete-project.component';
import { DeleteRightComponent } from './component/admin/right/delete-right/delete-right.component';
import { DeleteRoleComponent } from './component/admin/role/delete-role/delete-role.component';
import { PlanComponent } from './component/plan/plan.component';
import {SkeletonModule} from "primeng/skeleton";
import { UserDataComponent } from './component/user-data/user-data.component';
import {NotificationsComponent} from "./component/user-data/notifications/notifications.component";
import {
  CreateNotificationComponent
} from "./component/user-data/notifications/create-notification/create-notification.component";
import {
  DeleteNotificationComponent
} from "./component/user-data/notifications/delete-notification/delete-notification.component";
import {InputMaskModule} from "primeng/inputmask";
import { TaskAddPlanComponent } from './component/task/task-add-plan/task-add-plan.component';
import { UntieComponent } from './component/task/untie/untie.component';
import { DownloadAllDocsComponent } from './component/doclist/download-all-docs/download-all-docs.component';
import { ManHoursChartComponent } from './component/charts/man-hours-chart/man-hours-chart.component';
import { ComplectManagerComponent } from './component/tools/complect-manager/complect-manager.component';
import { AddComplectComponent } from './component/tools/complect-manager/add-complect/add-complect.component';
import { MaterialComplectManagerComponent } from './component/tools/material-complect-manager/material-complect-manager.component';
import { AddMaterialComplectComponent } from './component/tools/material-complect-manager/add-material-complect/add-material-complect.component';
import { ProjectProgressChartComponent } from './component/charts/project-progress-chart/project-progress-chart.component';
import { AddHullMaterialToEspComponent } from './component/documents/hull-esp/add-hull-material-to-esp/add-hull-material-to-esp.component';
import { EquipmentsComponent } from './component/equipments/equipments.component';
import { CreateEquipmentComponent } from './component/equipments/create-equipment/create-equipment.component';
import {TreeSelectModule} from "primeng/treeselect";
import {ScrollPanelModule} from "primeng/scrollpanel";
import { AddFilesComponent } from './component/equipments/add-files/add-files.component';
import { AddSupplierComponent } from './component/equipments/add-supplier/add-supplier.component';
import { EditEquipmentComponent } from './component/equipments/edit-equipment/edit-equipment.component';
import { AgreeModalComponent } from './component/equipments/agree-modal/agree-modal.component';
import { EditSupplierComponent } from './component/equipments/edit-supplier/edit-supplier.component';
import { EleEspGenerationWaitComponent } from './component/documents/electric-esp/ele-esp-generation-wait/ele-esp-generation-wait.component';
import { SpecMaterialsComponent } from './component/spec-materials/spec-materials.component';
import { ObjViewPublicComponent } from './component/obj-view-public/obj-view-public.component';
import { ObjViewUrlCreateComponent } from './component/tools/obj-view-url-create/obj-view-url-create.component';
import {ColorPickerModule} from "primeng/colorpicker";
import { ObjViewPublicDeviceComponent } from './component/obj-view-public-device/obj-view-public-device.component';
import { ObjViewUrlCreateDeviceComponent } from './component/tools/obj-view-url-create-device/obj-view-url-create-device.component';
import { SpecMaterialComponent } from './component/spec-materials/spec-material/spec-material.component';
import { WarehouseComponent } from './component/warehouse/warehouse.component';
import { MaterialsSummarySpecComponent } from './component/materials-summary/materials-summary-spec/materials-summary-spec.component';
import { ActControlComponent } from './component/warehouse/act-control/act-control.component';
import { StorageUploadPhotoComponent } from './component/warehouse/storage-upload-photo/storage-upload-photo.component';
import { CreateGroupComponent } from './component/equipments/create-group/create-group.component';
import { EditGroupComponent } from './component/equipments/edit-group/edit-group.component';
import { WarehouseFullComponent } from './component/warehouse-full/warehouse-full.component';
import { FilterNameComponent } from './component/home/filter-name/filter-name.component';

Quill.register('modules/imageResize', ImageResize);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    NaviComponent,
    CreateTaskComponent,
    TaskComponent,
    SafeHtmlPipe,
    NgInitDirective,
    AssignComponent,
    ImportxlsComponent,
    SendToApprovalComponent,
    MaterialsComponent,
    AddMaterialComponent,
    ChangeResponsibleComponent,
    GanttComponent,
    SectionsComponent,
    SendToCloudComponent,
    DocumentsComponent,
    EmployeesComponent,
    DeleteComponent,
    DocExplorerComponent,
    UserCardComponent,
    SendToYardApprovalComponent,
    ConfirmAlreadyExistComponent,
    ConfirmAlreadyExistSendToApprovalComponent,
    ConfirmAlreadyExistSendToYardComponent,
    ViewDocumentComponent,
    LaboriousnessComponent,
    StatsComponent,
    TimeControlComponent,
    ShareRightsComponent,
    DocMComponent,
    ToolsComponent,
    LaborCostsComponent,
    TraysByZonesAndSystemsComponent,
    HullEspComponent,
    UploadRevisionFilesComponent,
    AssignNewRevisionComponent,
    DxfViewComponent,
    GenerationWaitComponent,
    HullEspGenerationWaitComponent,
    PdfViewComponent,
    CreateCheckListComponent,
    HullEspGenerationWaitComponent,
    ClearFilesComponent,
    ElecCablesComponent,
    NestingComponent,
    WebgcodeComponent,
    GCodeComponent,
    HighLightPipe,
    ReportComponent,
    BillingComponent,
    PartsQtyComponent,
    WastageComponent,
    BlocksComponent,
    WeightComponent,
    PartsQtyProfileComponent,
    FileExplorerComponent,
    VacantWastageComponent,
    BsTreeNodesComponent,
    WeightControlComponent,
    RemoveConfirmationComponent,
    PipeEspComponent,
    BillingPipeComponent,
    UserWatchComponent,
    NestingPipeComponent,
    ObjViewComponent,
    DeviceEspComponent,
    AccommodationEspComponent,
    PipeEspGenerationWaitComponent,
    DeviceEspGenerationWaitComponent,
    AddMaterialToEspComponent,
    MpgEsiConverterComponent,
    DailyTasksComponent,
    MonthTasksComponent,
    ShowTaskComponent,
    DeleteDailyTaskComponent,
    AccommodationsEspGenerationWaitComponent,
    BlocksProfileComponent,
    AddGroupDeviceComponent,
    AcceptToWorkComponent,
    AssignToResponsibleComponent,
    UserTasksComponent,
    MontageComponent,
    CheckedConfirmationComponent,
    RemoveWeightComponent,
    RemoveDeviceFromSystemComponent,
    QnaComponent,
    CreateQuestionComponent,
    RemoveDeviceFromSystemComponent,
    LaborComponent,
    ElectricEspComponent,
    CreateQuestionComponent,
    QuestionDetailsComponent,
    AssignQuestionComponent,
    SubscribeForNotificationsComponent,
    AssignResponsibleComponent,
    CombineIssuesComponent,
    CableExplorerComponent,
    SpyWatchComponent,
    AdminComponent,
    CreateUserComponent,
    UserComponent,
    RoleComponent,
    CreateRoleComponent,
    ProjectComponent,
    CreateProjectComponent,
    RightComponent,
    CreateRightComponent,
    WorkHoursComponent,
    TaskAssignComponent,
    TraysComponent,
    TrayEspGenerationWaitComponent,
    CablesComponent,
    GenerateEspComponent,
    MaterialsSummaryComponent,
    DoclistComponent,
    AddMaterialStockComponent,
    DrawingShowComponent,
    DesignEspComponent,
    MasterComponent,
    ConsumedDetailsComponent,
    GeneralEspComponent,
    UploadMultipleFilesComponent,
    DeleteUserComponent,
    DeleteProjectComponent,
    DeleteRightComponent,
    DeleteRoleComponent,
    PlanComponent,
    UserDataComponent,
    NotificationsComponent,
    CreateNotificationComponent,
    DeleteNotificationComponent,
    TaskAddPlanComponent,
    UntieComponent,
    DownloadAllDocsComponent,
    ManHoursChartComponent,
    ComplectManagerComponent,
    AddComplectComponent,
    MaterialComplectManagerComponent,
    AddMaterialComplectComponent,
    ProjectProgressChartComponent,
    AddHullMaterialToEspComponent,
    EquipmentsComponent,
    CreateEquipmentComponent,
    AddFilesComponent,
    AddSupplierComponent,
    EditEquipmentComponent,
    AgreeModalComponent,
    EditSupplierComponent,
    EleEspGenerationWaitComponent,
    SpecMaterialsComponent,
    ObjViewPublicComponent,
    ObjViewUrlCreateComponent,
    ObjViewPublicDeviceComponent,
    ObjViewUrlCreateDeviceComponent,
    SpecMaterialComponent,
    WarehouseComponent,
    MaterialsSummarySpecComponent,
    ActControlComponent,
    StorageUploadPhotoComponent,
    CreateGroupComponent,
    EditGroupComponent,
    WarehouseFullComponent,
    FilterNameComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AccordionModule,
    TableModule,
    MultiSelectModule,
    InputTextModule,
    ProgressBarModule,
    ButtonModule,
    SliderModule,
    DropdownModule,
    TooltipModule,
    ToastModule,
    EditorModule,
    DialogModule,
    CascadeSelectModule,
    CalendarModule,
    ProgressSpinnerModule,
    MessagesModule,
    GalleriaModule,
    QuillModule.forRoot(),
    ConfirmDialogModule,
    RippleModule,
    InputSwitchModule,
    InputTextareaModule,
    InputNumberModule,
    CheckboxModule,
    NgxCollapseModule,
    ToggleButtonModule,
    MenuModule,
    OverlayPanelModule,
    QrCodeModule,
    StyleClassModule,
    TabViewModule,
    FieldsetModule,
    NgxExtendedPdfViewerModule,
    NgxGanttModule,
    PieChartModule,
    BarChartModule,
    TreeModule,
    ContextMenuModule,
    TreeTableModule,
    ToolbarModule,
    RadioButtonModule,
    SidebarModule,
    PanelMenuModule,
    FullCalendarModule,
    AutoCompleteModule,
    ChartModule,
    VirtualScrollerModule,
    ScrollingModule,
    DragDropModule,
    SkeletonModule,
    InputMaskModule,
    ReactiveFormsModule,
    TreeSelectModule,
    ScrollPanelModule,
    ColorPickerModule
  ],
  providers: [MessageService, DialogService, DynamicDialogRef, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
export class FullCalendarDemoModule {}
