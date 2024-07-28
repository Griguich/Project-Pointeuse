import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MessagesComponent} from "./messages.component";
import {HistoriquesComponent} from "./historiques/historiques.component";


const routes: Routes = [
  {path: '', component: MessagesComponent},
  {path: 'historique', component: HistoriquesComponent},
  {path: 'messagesTexte', component: MessagesComponent},
  {path: 'messagesAudio', component: MessagesComponent},
  {path: 'messagesBanderole', component: MessagesComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagesRoutingModule { }
