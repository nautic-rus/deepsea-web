import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highLight'
})
export class HighLightPipe implements PipeTransform {

  transform(value: any, args: any): any {
    try {
      let result = value;
      let split = args.trim().split(' ').filter((x: any) => x.trim() != '');
      split.forEach((arg: any) => {
        const regex = new RegExp(arg, 'gi');
        const match = value.match(regex);
        if (match) {
          result = result.replace(regex, `<span class='highlight'>${match[0]}</span>`);
        }
      });
      return result;
    }
    catch {
      return null;
    }
  }
}
