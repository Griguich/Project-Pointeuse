import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: 'button'
})
export class NoDoubleClickDirective {

  clicked = false;
  timeout: number;

  constructor() {
      this.timeout = 100;
  }

  @HostListener('click', ['$event'])
  onClick(event: any) {
    if (!this.clicked) {
      this.clicked = true;
      setTimeout(() => this.clicked = false, this.timeout);
    } else {
      event.stopPropagation();
      event.preventDefault();
      event.cancelBubble = true;
      event.stopImmediatePropagation();
      event.emit();
    }
  }
}
