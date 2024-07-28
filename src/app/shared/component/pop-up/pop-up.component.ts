import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'rhis-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.scss']
})
export class PopUpComponent implements OnChanges {

  @Input() title: string;
  @Input() showPopUp = false;
  @Output() private closeEvent = new EventEmitter();
  @Input() public height: string;
  @Input() public width: string;
  @Input() public maxHeight: string;

  public closePopUp() {
    this.closeEvent.emit();
  }

  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.title) {
      this.title = changes.title.currentValue;
    }

    if (changes.showPopUp) {
      this.showPopUp = changes.showPopUp.currentValue;
    }
  }
}
