import _ from "underscore";

export class Material {
  id: string = Material.generateId(20);
  projects: string[] = [];
  name: string = 'New Material';
  description: string = '';
  category: string = '00002';
  code: string = '';
  units: string = '796';
  singleWeight: number = 0;
  document: string = '';
  provider: string = '';
  note: string = '';
  removed: number = 0;
  coefficient: number = 1;
  comment: string = '';
  private static generateId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }
  public static generateCode(prefix: string, materials: Material[]): string {
    let code = '0001';
    let filter = _.sortBy(materials.filter(x => x.code.includes(prefix)), x => x.code);
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
