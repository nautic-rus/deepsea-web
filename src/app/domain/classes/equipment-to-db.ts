export class EquipmentToDB {
  id: number = 0;
  name: string;
  description: string;
  sfi: number;
  project_id: number;
  responsible_id: number;
  department_id: string;
  comment: string;
  status_id: number = 1;
  parent_id: number = 0;
  sfi_unit: string = '';
}
