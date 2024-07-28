import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'user2Lettre'
})
export class User2LettrePipe implements PipeTransform {
  transform(user: any): string {
    let lettre1 = '';
    let lettre2 = '';
    if (user.prenom) {
      lettre1 = user.prenom.charAt(0);
    }
    if (user.nom) {
      lettre2 = user.nom.charAt(0);
    }
    return lettre1 + lettre2;
  }
}
