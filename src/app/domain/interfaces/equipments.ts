import {ISupplier} from "./supplier";


export interface IEquipment {
  id: number;
  sfi: number;
  name: string;
  description: string;
  department: string;
  comment: string;
  responsible_id: number;
  respons_name: string;
  respons_surname: string;
  itt: number;
  project_name: string;
  suppliers?: ISupplier[]; // Опциональный массив поставщиков
  status: string;
  parent_id: number;
  sfi_unit: string;
  create_date: number;

}

// export interface ISuppliersInEq{
//   suppliers_id: number;
//   equipm_id: number;
//   description: string;
//   status: string
// }
