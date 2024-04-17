import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./component/home/home.component";
import {LoginComponent} from "./component/login/login.component";
import {AuthGuard} from "./domain/classes/auth.guard";
import {CreateTaskComponent} from "./component/create-task/create-task.component";
import {TaskComponent} from "./component/task/task.component";
import {MaterialsComponent} from "./component/materials/materials.component";
import {GanttComponent} from "./component/gantt/gantt.component";
import {SectionsComponent} from "./component/sections/sections.component";
import {DocumentsComponent} from "./component/documents/documents.component";
import {EmployeesComponent} from "./component/employees/employees.component";
import {DocExplorerComponent} from "./component/doc-explorer/doc-explorer.component";
import {TimeControlComponent} from "./component/time-control/time-control.component";
import {DocMComponent} from "./component/doc-m/doc-m.component";
import {ToolsComponent} from "./component/tools/tools.component";
import {LaborCostsComponent} from "./component/labor-costs/labor-costs.component";
import {TraysByZonesAndSystemsComponent} from "./component/tools/trays-by-zones-and-systems/trays-by-zones-and-systems.component";
import {HullEspComponent} from "./component/documents/hull-esp/hull-esp.component";
import {DxfViewComponent} from "./component/dxf-view/dxf-view.component";
import {PdfViewComponent} from "./component/pdf-view/pdf-view.component";
import {ElecCablesComponent} from "./component/elec-cables/elec-cables.component";
import {NestingComponent} from "./component/nesting/nesting.component";
import {GCodeComponent} from "./component/g-code/g-code.component";
import {ReportComponent} from "./component/report/report.component";
import {BillingComponent} from "./component/billing/billing.component";
import {WeightComponent} from "./component/weight/weight.component";
import {FileExplorerComponent} from "./component/file-explorer/file-explorer.component";
import {BsTreeNodesComponent} from "./component/tools/bs-tree-nodes/bs-tree-nodes.component";
import {WeightControlComponent} from "./component/weight-control/weight-control.component";
import {PipeEspComponent} from "./component/documents/pipe-esp/pipe-esp.component";
import {BillingPipeComponent} from "./component/billing-pipe/billing-pipe.component";
import {UserWatchComponent} from "./component/user-watch/user-watch.component";
import {NestingPipeComponent} from "./component/nesting-pipe/nesting-pipe.component";
import {ObjViewComponent} from "./component/obj-view/obj-view.component";
import {DeviceEspComponent} from "./component/documents/device-esp/device-esp.component";
import {AccommodationEspComponent} from "./component/documents/accommodation-esp/accommodation-esp.component";
import {MonthTasksComponent} from "./component/month-tasks/month-tasks.component";
import {MontageComponent} from "./component/documents/montage/montage.component";
import {QnaComponent} from "./component/qna/qna.component";
import {LaborComponent} from "./component/labor/labor.component";
import {ElectricEspComponent} from "./component/documents/electric-esp/electric-esp.component";
import {QuestionDetailsComponent} from "./component/qna/question-details/question-details.component";
import {CableExplorerComponent} from "./component/tools/cable-explorer/cable-explorer.component";
import {SpyWatchComponent} from "./component/spy-watch/spy-watch.component";
import {AdminComponent} from "./component/admin/admin.component";
import {WorkHoursComponent} from "./component/work-hours/work-hours.component";
import {TraysComponent} from "./component/documents/trays/trays.component";
import {CablesComponent} from "./component/documents/cables/cables.component";
import {MaterialsSummaryComponent} from "./component/materials-summary/materials-summary.component";
import {DoclistComponent} from "./component/doclist/doclist.component";
import {DesignEspComponent} from "./component/documents/design-esp/design-esp.component";
import {MasterComponent} from "./component/master/master.component";
import {GeneralEspComponent} from "./component/documents/general-esp/general-esp.component";
import {PlanComponent} from "./component/plan/plan.component";
import {UserDataComponent} from "./component/user-data/user-data.component";
import {ManHoursChartComponent} from "./component/charts/man-hours-chart/man-hours-chart.component";
import {ComplectManagerComponent} from "./component/tools/complect-manager/complect-manager.component";
import {MaterialComplectManagerComponent} from "./component/tools/material-complect-manager/material-complect-manager.component";
import {ProjectProgressChartComponent} from "./component/charts/project-progress-chart/project-progress-chart.component";
import  {EquipmentsComponent} from "./component/equipments/equipments.component";
import {SpecMaterialsComponent} from "./component/spec-materials/spec-materials.component";
import {EditSupplierComponent} from "./component/equipments/edit-supplier/edit-supplier.component";
import {ObjViewPublicComponent} from "./component/obj-view-public/obj-view-public.component";
import {ObjViewUrlCreateComponent} from "./component/tools/obj-view-url-create/obj-view-url-create.component";
import {ObjViewPublicDeviceComponent} from "./component/obj-view-public-device/obj-view-public-device.component";
import {ObjViewUrlCreateDeviceComponent} from "./component/tools/obj-view-url-create-device/obj-view-url-create-device.component";
import {WarehouseComponent} from "./component/warehouse/warehouse.component";
import {MaterialsSummarySpecComponent} from "./component/materials-summary/materials-summary-spec/materials-summary-spec.component";
import {StorageUploadPhotoComponent} from "./component/warehouse/storage-upload-photo/storage-upload-photo.component";

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard], data: {animation: 'HomeComponent'} },
  { path: 'login', component: LoginComponent, data: {animation: 'LoginComponent'} },
  { path: 'create-task', component: CreateTaskComponent, canActivate: [AuthGuard], data: {animation: 'CreateTaskComponent'} },
  { path: 'task', component: TaskComponent, canActivate: [AuthGuard], data: {animation: 'TaskComponent'} },
  { path: 'materials', component: MaterialsComponent, canActivate: [AuthGuard], data: {animation: 'MaterialsComponent'} },
  { path: 'spec-materials', component: SpecMaterialsComponent, canActivate: [AuthGuard], data: {animation: 'SpecMaterialsComponent'} },
  { path: 'gantt', component: GanttComponent, canActivate: [AuthGuard], data: {animation: 'GanttComponent'} },
  { path: 'sections', component: SectionsComponent, canActivate: [AuthGuard], data: {animation: 'SectionsComponent'} },
  { path: 'documents', component: DocumentsComponent, canActivate: [AuthGuard], data: {animation: 'DocumentsComponent'} },
  { path: 'employees', component: EmployeesComponent, canActivate: [AuthGuard], data: {animation: 'EmployeesComponent'} },
  { path: 'doc-explorer', component: DocExplorerComponent, canActivate: [AuthGuard], data: {animation: 'DocExplorerComponent'} },
  { path: 'time-control', component: TimeControlComponent, canActivate: [AuthGuard], data: {animation: 'TimeControlComponent'} },
  { path: 'doc-m', component: DocMComponent, data: {animation: 'DocMComponent'} },
  { path: 'tools', component: ToolsComponent, canActivate: [AuthGuard], data: {animation: 'ToolsComponent'} },
  { path: 'labor-costs', component: LaborCostsComponent, canActivate: [AuthGuard], data: {animation: 'LaborCostsComponent'} },
  { path: 'trays-by-zones-and-systems', component: TraysByZonesAndSystemsComponent, canActivate: [AuthGuard], data: {animation: 'TraysByZonesAndSystemsComponent'} },
  { path: 'hull-esp', component: HullEspComponent, canActivate: [AuthGuard], data: {animation: 'HullEspComponent'} },
  { path: 'pipe-esp', component: PipeEspComponent, canActivate: [AuthGuard], data: {animation: 'PipeEspComponent'} },
  { path: 'device-esp', component: DeviceEspComponent, canActivate: [AuthGuard], data: {animation: 'DeviceEspComponent'} },
  { path: 'design-esp', component: DesignEspComponent, canActivate: [AuthGuard], data: {animation: 'DesignEspComponent'} },
  { path: 'general-esp', component: GeneralEspComponent, canActivate: [AuthGuard], data: {animation: 'GeneralEspComponent'} },
  { path: 'accommodation-esp', component: DeviceEspComponent, canActivate: [AuthGuard], data: {animation: 'DeviceEspComponent'} },
  { path: 'dxf-view', component: DxfViewComponent, canActivate: [AuthGuard], data: {animation: 'DxfViewComponent'} },
  { path: 'pdf-view', component: PdfViewComponent, canActivate: [AuthGuard], data: {animation: 'PdfViewComponent'} },
  { path: 'elec-cables', component: ElecCablesComponent, canActivate: [AuthGuard], data: {animation: 'ElecCablesComponent'} },
  { path: 'nesting', component: NestingComponent, canActivate: [AuthGuard], data: {animation: 'NestingComponent'} },
  { path: 'nesting-pipe', component: NestingPipeComponent, canActivate: [AuthGuard], data: {animation: 'NestingPipeComponent'} },
  { path: 'gcode', component: GCodeComponent, canActivate: [AuthGuard], data: {animation: 'GCodeComponent'} },
  { path: 'report', component: ReportComponent, canActivate: [AuthGuard], data: {animation: 'ReportComponent'} },
  { path: 'billing', component: BillingComponent, canActivate: [AuthGuard], data: {animation: 'BillingComponent'} },
  { path: 'pipe-billing', component: BillingPipeComponent, canActivate: [AuthGuard], data: {animation: 'BillingPipeComponent'} },
  { path: 'test', component: WeightComponent, canActivate: [AuthGuard], data: {animation: 'WeightComponent'} },
  { path: 'weight', component: BsTreeNodesComponent, canActivate: [AuthGuard], data: {animation: 'BsTreeNodesComponent'} },
  { path: 'files', component: FileExplorerComponent, canActivate: [AuthGuard], data: {animation: 'FileExplorerComponent'} },
  { path: 'weight-control', component: WeightControlComponent, canActivate: [AuthGuard], data: {animation: 'WeightControlComponent'} },
  { path: 'user-watch', component: UserWatchComponent, canActivate: [AuthGuard], data: {animation: 'UserWatchComponent'} },
  { path: 'spool-view', component: ObjViewComponent, data: {animation: 'ObjViewComponent'} },
  { path: 'diary', component: MonthTasksComponent, canActivate: [AuthGuard], data: {animation: 'MonthTasksComponent'} },
  { path: 'montage', component: MontageComponent, canActivate: [AuthGuard], data: {animation: 'MontageComponent'} },
  { path: 'qna', component: QnaComponent, canActivate: [AuthGuard], data: {animation: 'QnaComponent'} },
  { path: 'labor', component: LaborComponent, canActivate: [AuthGuard], data: {animation: 'LaborComponent'} },
  { path: 'electric-esp', component: ElectricEspComponent, canActivate: [AuthGuard], data: {animation: 'ElectricEspComponent'} },
  { path: 'qna-details', component: QuestionDetailsComponent, canActivate: [AuthGuard], data: {animation: 'QuestionDetailsComponent'} },
  { path: 'cable-explorer', component: CableExplorerComponent, canActivate: [AuthGuard], data: {animation: 'CableExplorerComponent'} },
  { path: 'spy-watch', component: SpyWatchComponent, canActivate: [AuthGuard], data: {animation: 'SpyWatchComponent'} },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], data: {animation: 'AdminComponent'} },
  { path: 'work-hours', component: PlanComponent, canActivate: [AuthGuard], data: {animation: 'PlanComponent'} },
  { path: 'trays', component: TraysComponent, canActivate: [AuthGuard], data: {animation: 'TraysComponent'} },
  { path: 'cables', component: CablesComponent, canActivate: [AuthGuard], data: {animation: 'CablesComponent'} },
  { path: 'doclist', component: DoclistComponent, canActivate: [AuthGuard], data: {animation: 'DoclistComponent'} },
  { path: 'materials-summary', component: MaterialsSummaryComponent, canActivate: [AuthGuard], data: {animation: 'MaterialsSummaryComponent'} },
  { path: 'statements', component: MaterialsSummarySpecComponent, canActivate: [AuthGuard], data: {animation: 'MaterialsSummarySpecComponent'} },
  { path: 'statements-s', component: MaterialsSummarySpecComponent, canActivate: [AuthGuard], data: {animation: 'MaterialsSummarySpecComponent'} },
  { path: 'master', component: MasterComponent, data: {animation: 'MasterComponent'}, canActivate: [AuthGuard]  },
  { path: 'plan', component: PlanComponent, data: {animation: 'PlanComponent'}, canActivate: [AuthGuard] },
  { path: 'user-data', component: UserDataComponent, data: {animation: 'UserDataComponent'}, canActivate: [AuthGuard] },
  { path: 'man-hours-chart', component: ManHoursChartComponent, data: {animation: 'ManHoursChartComponent'}, canActivate: [AuthGuard] },
  { path: 'project-progress-chart', component: ProjectProgressChartComponent, data: {animation: 'ProjectProgressChartComponent'}, canActivate: [AuthGuard] },
  { path: 'complect-manager', component: ComplectManagerComponent, data: {animation: 'ComplectManagerComponent'}, canActivate: [AuthGuard] },
  { path: 'material-complect-manager', component: MaterialComplectManagerComponent, data: {animation: 'MaterialComplectManagerComponent'}, canActivate: [AuthGuard] },
  { path: 'equipments', component: EquipmentsComponent, data: {animation: 'EquipmentsComponent'}, canActivate: [AuthGuard] },
  { path: '3d', component: ObjViewPublicComponent, data: {animation: 'ObjViewPublicComponent'} },
  { path: '3d-device', component: ObjViewPublicDeviceComponent, data: {animation: 'ObjViewPublicDeviceComponent'} },
  { path: '3d-url-create', component: ObjViewUrlCreateComponent, data: {animation: 'ObjViewUrlCreateComponent'}, canActivate: [AuthGuard] },
  { path: '3d-url-create-device', component: ObjViewUrlCreateDeviceComponent, data: {animation: 'ObjViewUrlCreateDeviceComponent'}, canActivate: [AuthGuard] },
  { path: 'warehouse', component: WarehouseComponent, data: {animation: 'WarehouseComponent'}, canActivate: [AuthGuard] },
  { path: 'storage-upload-photo', component: StorageUploadPhotoComponent, data: {animation: 'StorageUploadPhotoComponent'} },
  // { path: 'equipments/supplier/:id', component: EditSupplierComponent },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
