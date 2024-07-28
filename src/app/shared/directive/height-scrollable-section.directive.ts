import {Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2} from '@angular/core';

@Directive({
  selector: '[rhisHeightScrollableSection]'
})
export class HeightScrollableSectionDirective implements OnInit {
  @Output()
  public rhisHeightScrollableSection = new EventEmitter();
  @Input()
  public offset: number;

  constructor(private renderer: Renderer2, private el: ElementRef) {
  }

  ngOnInit() {
    this.sendHeight();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.sendHeight();
  }

  /**
   * Send height of scrollable section
   */
  private sendHeight():any {
    this.rhisHeightScrollableSection.emit(window.innerHeight - (this.el.nativeElement.offsetHeight + this.offset));
  }
}
