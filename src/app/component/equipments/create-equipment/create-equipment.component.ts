import {Component, OnInit} from '@angular/core';
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {EquipmentsService} from "../../../domain/equipments.service";
import {ProjectsManagerService} from "../../../domain/projects-manager.service";
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {EquipmentToDB} from "../../../domain/classes/equipment-to-db";
import {Isfi} from "../../../domain/interfaces/sfi";
import {EquipmentsFiles} from "../../../domain/classes/equipments-files";
import {AddFilesComponent} from "../add-files/add-files.component";
import {AddFilesDataService} from "../../../domain/add-files-data.service";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-create-equipment',
  templateUrl: './create-equipment.component.html',
  styleUrls: ['./create-equipment.component.css']
})
export class CreateEquipmentComponent implements OnInit {
  // @ts-ignore
  equipmentForm = this.formBuilder.group({
    sfi: ['', Validators.required],
    project: ['', [Validators.required, this.customProjectValidator]],
    department: ['', [Validators.required, this.customProjectValidator]],
    name: ['', Validators.required],
    description: [''],
    commentText: [''],
  });
  equipmentProjects: string[] = [];
   // equipmentProject = '-';
  equipmentDepartments: string[] = [];

  equipmentFiles: EquipmentsFiles[] = [];  //хранит файлы для отправки на БД

  sfis: Isfi[] = [];
  sfiAndName: string = '';



  constructor( public prService: ProjectsManagerService, public auth: AuthManagerService, private formBuilder: FormBuilder, public issues: IssueManagerService,
               public ref: DynamicDialogRef, public eqService: EquipmentsService, private dialogService: DialogService, public t: LanguageService) {
  }

  ngOnInit(): void {
    this.eqService.getSfis().subscribe(sfis=>{
      this.sfis = sfis;
    });
    this.equipmentProjects = this.prService.projects.map((x: any) => x.name).filter(x => x != '' && this.auth.getUser().visible_projects.includes(x));

    this.equipmentForm.get('project')?.setValue(this.equipmentProjects[0]); //изначально установим значение первого пришедшего проекта (если там '-' то не даст отправить форму из-за кастом валидатор, )


    // this.equipmentDepartments = this.prService.departments.map((x: any) => x.name)
    this.equipmentDepartments = this.prService.departments.filter(x => x.visible_documents == 1).map((x: any) => x.name)
    this.equipmentDepartments.unshift('-')
    console.log("this.equipmentDepartments")
    console.log(this.equipmentDepartments)
    // console.log(this.equipmentForm.value)
  }

  customProjectValidator(control: AbstractControl) {
    if (control.value === '-') {
      return { projectInvalid: true };
    }
    return null;
  }

  changeSFI() {
    let res = this.sfis.filter(item => item.code == this.equipmentForm.get('sfi')?.value);
    if (this.t.language == 'ru') {
      this.sfiAndName = res[0].code + ' ' + res[0].ru
    } else if (this.t.language == 'en') {
      console.log("res")
      console.log(res)
      this.sfiAndName = res[0].code + ' ' + res[0].eng
    }
  }


  close() {
    console.log(this.equipmentForm.value)
    this.eqService.setWaitingCreateFiles([]);
    this.equipmentForm.reset();
    this.ref.close();
  }

  addFiles() {
    const dialog = this.dialogService.open(AddFilesComponent, {
      header: 'Uploading files',
      modal: true,
      showHeader: false,
      data: {
        service: this.eqService,
        equ_id: 0,
        isEqService: true,
        //getCreateEqFilesFunction: this.eqService.getCreateEqFiles(),
        //setCreateEqFilesFunction: this.eqService.setCreateEqFiles(),
      }
    })
    dialog.onClose.subscribe(() => {
      this.eqService.getCreateFiles().forEach(file => {
        this.equipmentFiles.push(file);
      })
      this.eqService.setCreateFiles([]);
      //this.equipmentFiles = this.eqService.getCreateEqFiles();
    })
  }

  getFileExtensionIcon(fileUrl: string) {
    const fileName = this.extractFileName(fileUrl);
    switch (fileName.toLowerCase().split('.').pop()) {
      case 'pdf':
        return 'pdf.svg';
      case 'dwg':
        return 'dwg.svg';
      case 'xls':
        return 'xls.svg';
      case 'xlsx':
        return 'xls.svg';
      case 'doc':
        return 'doc.svg';
      case 'docx':
        return 'doc.svg';
      case 'png':
        return 'png.svg';
      case 'jpg':
        return 'jpg.svg';
      case 'txt':
        return 'txt.svg';
      case 'zip':
        return 'zip.svg';
      case 'mp4':
        return 'mp4.svg';
      default:
        return 'file.svg';
    }
  }

  trimFileName(fileUrl: string, length: number = 10): string {
    const fileName = this.extractFileName(fileUrl);
    let split = fileName.split('.');
    let name = split[0];
    let extension = split[1];
    if (name.length > length) {
      return name.substr(0, length - 2) + '..' + name.substr(name.length - 2, 2) + '.' + extension;
    } else {
      return fileName;
    }
  }

  extractFileName(fileUrl: string): string {
    const parts = fileUrl.split('/');
    return parts[parts.length - 1];
  }

  downloadFile(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  getDateOnly(dateLong: number): string {  //преобразовать поле create_date в человеческий вид
    if (dateLong == 0){
      return '--/--/--';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

  deleteFile(file: EquipmentsFiles) {
    console.log("deleteFile file")
    console.log(file)
    this.equipmentFiles.splice(this.equipmentFiles.indexOf(file), 1);
    console.log(this.equipmentFiles);
  }

  findProjectId(project_name: string) {
    const project = this.prService.projects.find(project => project.name === project_name);
    return project? project.id : undefined;
  }

  findDepartmentId(department_name: string) {
    const department = this.prService.departments.find(department => department.name === department_name);
    return department? department.id : undefined;
  }

  createEquipment() {
    //добавить equipment
    const eqFormValue = this.equipmentForm.value;
    const eqToDB = new EquipmentToDB();
    eqToDB.name = eqFormValue.name;
    eqToDB.description = eqFormValue.description;
    eqToDB.sfi = eqFormValue.sfi;
    eqToDB.project_id = this.findProjectId(eqFormValue.project);
    eqToDB.responsible_id = this.auth.getUser().id;
    eqToDB.department_id = this.findDepartmentId(eqFormValue.department);
    eqToDB.comment = eqFormValue.commentText;
    eqToDB.parent_id = 0;
    eqToDB.sfi_unit = '-';
    // eqToDB.status_id = '-';
    console.warn(this.equipmentForm.value);
    console.log(eqToDB);


    this.eqService.addEquipment(JSON.stringify(eqToDB)).subscribe(res => {
      console.log(eqToDB);
      console.log('res .addEquipment');
      console.log(res);
      if (res.includes('error')){
        alert(res);
      }
      else{
        this.equipmentFiles.forEach(file => { //добавляем файлы в БД
          file.equ_id = parseInt(res);
          console.log(JSON.stringify(file));
          this.eqService.addEquipmentFiles(JSON.stringify(file)).subscribe(res => {
            if (res.includes('error')){
              alert(res);
            }
            else{
              this.ref.close(res);
            }
          })
        })
        this.ref.close('success');
      }
    });
    this.equipmentForm.reset();
  }
}
