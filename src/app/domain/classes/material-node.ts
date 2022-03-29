export class MaterialNode {
  label: string = '';
  data: string = '';
  expandedIcon: string = '';
  collapsedIcon: string = '';
  icon: string = '';
  children: MaterialNode[] = [];
  parent: MaterialNode | null = null;
}
