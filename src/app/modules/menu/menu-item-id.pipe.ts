import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'menuItemId',
})
export class MenuItemIdPipe implements PipeTransform {

  transform(col: any, isManagerMenu: boolean, isTechnicienMenu: boolean): any {
    return isManagerMenu ? 'MENU_Manager-' + col.id + '-item' : (isTechnicienMenu ? 'MENU_Technicien-' + col.id + '-item' :'MENU_Employee-' + col.id + '-item')
  }
}
