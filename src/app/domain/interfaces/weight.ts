export interface WeightData {
  issue_name: string;
  department: string;
  doc_number: string;
  name: string;
  status: string;
  perc: number;
  t_weight: number;
  x_cog: number;
  y_cog: number;
  z_cog: number;
  mx: number;
  my: number;
  mz: number;
  modify_date: number;
  stock_code: string;
  room: string;
}

export interface TreeNode {
  data: {
    name: string;
    status?: string;
    perc?: number;
    t_weight?: number;
    x_cog?: number;
    y_cog?: number;
    z_cog?: number;
    mx?: number;
    my?: number;
    mz?: number;
    modify?: Date;
    stock_code?: string;
  };
  children?: TreeNode[];
}
