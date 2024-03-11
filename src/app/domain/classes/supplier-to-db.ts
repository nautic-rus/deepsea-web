import {ISupplier} from "../interfaces/supplier";

export class SupplierToDB {
  approvement: number = 0;
  comment: string = '';
  description: string;
  equ_id: number;
  manufacturer: string;
  name: string;
  status_id: number = 1;
  user_id: number;
}
