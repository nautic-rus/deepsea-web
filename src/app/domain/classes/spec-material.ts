import {Material} from "./material";

export class SpecMaterial {
  code: string;
  name: string;
  descr: string;
  units: string;
  weight: number;
  supplier: string;
  statem_id: number;
  dir_id: number;
  user_id:number;
  label: string;
  last_upd: number;
  note: string;
  manufacturer: string;
  coef: number;

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
