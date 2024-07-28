import {Component, Input, OnInit} from '@angular/core';
import {MessageModel} from "../../../../shared/model/message.model";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-message-display',
  templateUrl: './message-display.component.html',
  styleUrls: ['./message-display.component.scss']
})
export class MessageDisplayComponent implements OnInit {
  @Input()
  public selectedMessage: MessageModel = new MessageModel();
  public source: any;
  public messageAudio: any;

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    if (this.selectedMessage.typeMessage === 'Audio') {
      this.messageAudio = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.selectedMessage.messageAudio));
    }
  }


}
