export interface IEquipment {
  id: number;
  sfi: number;
  name: string;
  department: string;
  respons_name: string;
  respons_surname: string;
  itt: number;
  suppliers?: ISuppliersInEq[]; // Опциональный массив комментариев
}

export interface ISuppliersInEq{
  suppliers_id: number;
  equipm_id: number;
  description: string;
  status: string
}
