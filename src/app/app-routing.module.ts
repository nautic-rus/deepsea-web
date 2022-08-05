import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./component/home/home.component";
import {LoginComponent} from "./component/login/login.component";
import {AuthGuard} from "./domain/classes/auth.guard";
import {BpmnComponent} from "./component/bpmn/bpmn.component";
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

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard], data: {animation: 'HomeComponent'} },
  { path: 'bpmn', component: BpmnComponent, canActivate: [AuthGuard], data: {animation: 'BpmnComponent'} },
  { path: 'login', component: LoginComponent, data: {animation: 'LoginComponent'} },
  { path: 'create-task', component: CreateTaskComponent, canActivate: [AuthGuard], data: {animation: 'CreateTaskComponent'} },
  { path: 'task', component: TaskComponent, canActivate: [AuthGuard], data: {animation: 'TaskComponent'} },
  { path: 'materials', component: MaterialsComponent, canActivate: [AuthGuard], data: {animation: 'MaterialsComponent'} },
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
  { path: 'accommodation-esp', component: AccommodationEspComponent, canActivate: [AuthGuard], data: {animation: 'AccommodationEspComponent'} },
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
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
