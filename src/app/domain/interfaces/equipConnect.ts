

export class EquipmentConnection {
  OID: string = '';
  LABEL: string = '';
  TYPE: number = 0;
  USERID: string = '';
  NODE_USERID: string = '';
  ZONE_SEQID: number = 0;
  ZONE_NAME: string = '';
  ZONE_DESCR: string = '';
  SYSTEM_OID: number = 0;
  SYSTEM_NAME: string = '';
  SYSTEM_DESCR: string = '';
  ABBREV: string = '';
  XCOG: number = 0.0;
  YCOG: number = 0.0;
  ZCOG: number = 0.0;
  PX: number = 0.0;
  PY: number = 0.0;
  PZ: number = 0.0;
  WEIGHT: number = 0.0;
  STOCK_CODE: string = '';
  CLASS_NAME: string = '';
  SURFACE: string = '';
  SUPPORTS: any[] = [];
  workShopMaterial: any;

}
