import _ from "underscore";
import {MaterialTranslation} from "../interfaces/material-translation";

export class Material {
  id: string = Material.generateId(20);
  project: string = '';
  name: string = 'New Material';
  description: string = '';
  category: string = '00002';
  code: string = '';
  units: string = '796';
  singleWeight: number = 0;
  document: string = '';
  provider: string = '';
  manufacturer: string = '';
  note: string = '';
  removed: number = 0;
  coefficient: number = 1;
  comment: string = '';
  itt: number = 0;
  approved: number = 0;
  translations: MaterialTranslation[] = [];
  materialCloudDirectory = '';
  tp620 = 0;
  certRS = 0;
  density = 0;
  public static generateId(length: number = 20): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }
  public static generateCode(prefixSrc: string, materials: Material[]): string {
    let code = '0001';
    let prefix = prefixSrc;
    while (prefix.length < 12){
      prefix += 'X';
    }
    let filter = _.sortBy(materials.filter(x => x.code.startsWith(prefix)), x => x.code);
    if (filter.length > 0){
      let filterCode = filter.reverse()[0].code;
      code = this.addLeftZeros((+filterCode.substring(13) + 1).toString());
    }
    return prefix + code;
  }
  public static addLeftZeros(value: string, length: number = 4): string {
    let result = value;
    while (result.length < length){
      result = '0' + result;
    }
    return result;
  }
  // public static generateCode(prefix: string): string {
  //   let result = prefix;
  //   let length = 16 - prefix.length;
  //   const characters = '0123456789';
  //   const charactersLength = characters.length;
  //   for (let i = 0; i < length; i++ ) {
  //     result += characters.charAt(Math.floor(Math.random() *
  //       charactersLength));
  //   }
  //   return result;
  // }
}
