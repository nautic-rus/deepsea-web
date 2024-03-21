export class SupplierHistory {
  user_id: number;
  value: string = '';
  old_value: string = '';
  new_value: string = '';
  //update_date: number = 0;
  supplier_id: number;

  constructor(user_id: number,  name_value: string, prev_value: string, new_value: string, supplier_id: number) {
    this.user_id = user_id;
    this.value = name_value;
    this.old_value = prev_value;
    this.new_value = new_value;
    this.supplier_id = supplier_id;
  }
}
