import {Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';

@Directive({
  selector: '[rhisClickOutside]'
})
export class ClickOutsideDirective {
  @Output()
  public rhisClickOutside = new EventEmitter();
  @Input()
  public skipFirstClick = false;
  @Input()
  isClickOutsideEmittionEnabled = true;
  private times = 0;

  constructor(private elementRef: ElementRef, ) {
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    const event = this.elementRef.nativeElement.contains(targetElement);
    if (targetElement && !event) {
      if (!this.skipFirstClick || (this.skipFirstClick && this.times !== 0)) {
        if(this.isClickOutsideEmittionEnabled) {
          this.rhisClickOutside.emit(event);
        }
      }
      this.times++;
    }
  }
}
