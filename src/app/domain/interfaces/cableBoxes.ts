import {Material} from "../classes/material";

export interface CableBoxes {
  system: string;
  userId: string;
  oid: number;
  zone: string;
  line: number;
  weight: number;
  x_cog: number;
  y_cog: number;
  z_cog: number;
  sType: string;
  tType: number;
  code: string;
  stockCode: string;
  desc: string;
  node1: string;
  x_n1: number;
  y_n1: number;
  z_n1: number;
  node2: string;
  x_n2: number;
  y_n2: number;
  z_n2: number;
  length: number;
  material: Material;
}
