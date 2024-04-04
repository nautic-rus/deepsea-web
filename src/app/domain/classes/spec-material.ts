import {Material} from "./material";

export class SpecMaterial {
  code: string = 'NRxxxxxxxxxxxxxx';
  name: string = '';
  descr: string = '';
  units: string = '';
  weight: number = 0;
  supplier: string = '';
  statem_id: number = 0;
  dir_id: number = 0;
  user_id: number = 0;
  label: string = '';
  last_upd: number = 0;
  note: string = '';
  manufacturer: string = '';
  coef: number = 0;
  id: number = 0;
  removed: number = 0;

  fromMaterial(m: Material, stmt_id: number, dir_id: number, user_id: number, label: string){
    this.code = m.code;
    this.name = m.name;
    this.descr = m.description;
    this.units = m.units;
    this.weight = m.singleWeight;
    this.supplier = m.provider;
    this.statem_id = stmt_id;
    this.dir_id = dir_id;
    this.user_id = user_id;
    this.label = label;
    this.note = m.note;
    this.manufacturer = m.manufacturer;
    this.coef = m.coefficient;
  }
}
