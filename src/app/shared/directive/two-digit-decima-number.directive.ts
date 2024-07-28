import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[rhisTwoDigitDecimaNumber]'
})
export class TwoDigitDecimaNumberDirective {
  // Allow decimal numbers
  private regex: RegExp = new RegExp(/^\d+\.?\d{0,2}$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home Delete left right si on veut une valeur negative on ajoute -
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'Delete', 'ArrowLeft', 'ArrowRight'];

  constructor(private el: ElementRef) {
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, home, Delete, left,  and right  keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    let next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }

  // this to update field to 0 instead of an empty one
  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    const current: string = this.el.nativeElement.value;
    if (current === '') {
      // this.el.nativeElement.value = '0';
      this.el.nativeElement.dispatchEvent(new Event('input'));
    }
  }
}
