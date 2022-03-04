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
import {HomeComponentMobile} from "./component/home_mobile/home-mobile.component";

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
  { path: 'esp', component: HullEspComponent, canActivate: [AuthGuard], data: {animation: 'HullEspComponent'} },
  { path: 'dxf-view', component: DxfViewComponent, canActivate: [AuthGuard], data: {animation: 'DxfViewComponent'} },
  { path: 'pdf-view', component: PdfViewComponent, canActivate: [AuthGuard], data: {animation: 'PdfViewComponent'} },
  { path: 'elec-cables', component: ElecCablesComponent, canActivate: [AuthGuard], data: {animation: 'ElecCablesComponent'} },
  { path: 'nesting', component: NestingComponent, canActivate: [AuthGuard], data: {animation: 'NestingComponent'} },
  { path: 'gcode', component: GCodeComponent, canActivate: [AuthGuard], data: {animation: 'GCodeComponent'} },
  { path: 'mobile', component: Home-MobileComponent, canActivate: [AuthGuard], data: {animation: 'HomeComponentMobile'} },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
