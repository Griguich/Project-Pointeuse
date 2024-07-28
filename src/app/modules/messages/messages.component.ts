import {Component} from '@angular/core';

@Component({
  selector: 'rhis-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent {
  public list: any[] = [
    {
      nom: 'mariam',
      prenom: 'badis'
    },
    {
      nom: 'mariam',
      prenom: 'badis'
    },
    {
      nom: 'mariam',
      prenom: 'badis'
    },
    {
      nom: 'mariam',
      prenom: 'badis'
    }
  ];

}
