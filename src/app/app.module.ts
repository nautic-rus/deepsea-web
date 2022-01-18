import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { HomeComponent } from './component/home/home.component';
import { NaviComponent } from './component/navi/navi.component';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { BpmnComponent } from './component/bpmn/bpmn.component';
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
import {ChartModule} from "primeng/chart";
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
import { HullEspGenerationWaitComponent } from './component/documents/hull-esp/hull-esp-generation-wait/hull-esp-generation-wait.component';
Quill.register('modules/imageResize', ImageResize);



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    NaviComponent,
    BpmnComponent,
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
    HullEspGenerationWaitComponent
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
        ChartModule,
        QrCodeModule,
        StyleClassModule,
        TabViewModule
    ],
  providers: [MessageService, DialogService, DynamicDialogRef, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
