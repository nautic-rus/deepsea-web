import {Material} from "../classes/material";

export interface Cable {
  system: string;
  code: string;
  description: string;
  nom_section: string;
  diameter: number;
  seg_code: string;
  f_rout: number;
  length: number;
  l_correction: number;
  from_system: string;
  from_eq_id: string;
  from_eq_desc: string;
  from_eq: string;
  from_stock_code: string;
  from_x: number;
  from_y: number;
  from_z: number;
  from_zone: string;
  from_zone_desc: string;
  to_system: string;
  to_eq_id: string;
  to_eq: string;
  to_stock_code: string;
  to_eq_desc: string;
  to_x: number;
  to_y: number;
  to_z: number;
  to_zone: string;
  to_zone_desc: string;
  cab_route_area: string;
  stock_code: string;
  material: Material;
}
