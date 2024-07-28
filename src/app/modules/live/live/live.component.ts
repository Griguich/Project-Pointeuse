import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Injector,
  OnDestroy,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ParameterJsStoreService} from "../../../shared/services/JsStoreServices/parameter-js-store.service";
import {ParametreModel} from "../../../shared/model/parametre.model";
import {ListEmployeePageComponent} from "../list-employee-page/list-employee-page.component";
import {ClockPageComponent} from "../clock-page/clock-page.component";

@Component({
  selector: 'app-live',
  templateUrl: './live.component.html'
})
export class LiveComponent implements AfterViewInit, OnDestroy {

  @ViewChild("vc", {read: ViewContainerRef, static: true}) vc: ViewContainerRef;

  constructor(public parameterJsStoreParameter: ParameterJsStoreService,
              private injector: Injector,
              private r: ComponentFactoryResolver) {}

  async ngAfterViewInit() {
    const pageLiveParam: ParametreModel = (await this.parameterJsStoreParameter.getParamatreByParam('PAGELIVE')).pop();
    const factory = (pageLiveParam == null) || (pageLiveParam.valeur === 'true') ? this.r.resolveComponentFactory(ListEmployeePageComponent) : this.r.resolveComponentFactory(ClockPageComponent);
    const componentRef = factory.create(this.injector);
    const view = componentRef.hostView;
    this.vc.insert(view);
  }

  ngOnDestroy() {
    this.vc.clear();
  }

}
