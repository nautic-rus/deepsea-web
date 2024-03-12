export interface IEquipment {
  id: number;
  sfi: number;
  name: string;
  description: string;
  department: string;
  comment: string;
  respons_name: string;
  respons_surname: string;
  itt: number;
  project_name: string;
  suppliers?: ISuppliersInEq[]; // Опциональный массив поставщиков
  status: string;
}

export interface ISuppliersInEq{
  suppliers_id: number;
  equipm_id: number;
  description: string;
  status: string
}
