export class EquipmentToDB {
  name: string;
  description: string;
  sfi: number;
  project_id: number;
  responsible_id: number;
  department_id: string;
  comment: string;
  status_id: number = 1;

  // @ts-ignore
  // constructor(name :string,  descriptions?: string, sfi: number, project_id: number, responsible_id: number, department_id: string, comment?: string, status_is: number ) {
  //   this.name = name;
  //   this.sfi = sfi;
  //   this.descriptions = descriptions;
  //   this.project_id = project_id;
  //   this.responsible_id = responsible_id;
  //   this.department_id = department_id;
  //   this.comment = comment;
  //   this.status_is = status_is;
  // }
}
