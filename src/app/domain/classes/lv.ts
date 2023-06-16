export class LV {
  label: string = '';
  value: string = '';

  constructor(label: string, value: string = '') {
    this.label = label;
    this.value = value;
    if (value == ''){
      this.value = label;
    }
  }
}
export class LVn {
  label: string = '';
  value: number = 0;
  constructor(label: string, value: number = 0) {
    this.label = label;
    this.value = value;
  }
}
