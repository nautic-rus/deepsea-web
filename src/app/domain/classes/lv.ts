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
