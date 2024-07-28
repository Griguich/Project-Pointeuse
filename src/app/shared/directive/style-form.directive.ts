import {AfterViewInit, Directive, ElementRef, Input, Renderer2} from '@angular/core';

@Directive({
  selector: '[rhisStyleForm]'
})
export class StyleFormDirective implements AfterViewInit {
  private element: any;
  @Input()
  private set hasError(state) {
    state ? this.addErrorClass() : this.removeErrorClass();
  }
  @Input()
  private selector: string;

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }
  public ngAfterViewInit(): void {
    this.element = this.selector ? this.el.nativeElement.querySelector(this.selector) : this.el.nativeElement;
  }

  private addErrorClass() {
    if (this.element) {
      this.renderer.addClass(this.element, 'has-error');
    }
  }

  private removeErrorClass() {
    if (this.element) {
      this.renderer.removeClass(this.element, 'has-error');
    }
  }
}
