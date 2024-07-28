import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges, OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import {DateService} from "../../../shared/services/date.service";
import {RhisTranslateService} from "../../../shared/services/rhis-translate.service";
import {TypePointageModel} from "../../../shared/model/type-pointage.model";
import Keyboard from "simple-keyboard";
import {DatePipe} from "@angular/common";


@Component({
  selector: 'rhis-add-pointage-form',
  templateUrl: './add-pointage-form.component.html',
  styleUrls: ['./add-pointage-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})
export class AddPointageFormComponent implements OnChanges, OnDestroy {
  @Input()
  public pointage;
  @Input()
  public isCreation: boolean;
  @Input()
  public typePointages: TypePointageModel[] = [];
  @Output()
  public hidePopUp = new EventEmitter();
  @Output()
  public update = new EventEmitter();
  @Output()
  public delete = new EventEmitter();
  @Output()
  public add = new EventEmitter();
  private localTypePointages: TypePointageModel[];
  public selectedStatus;
  // A filter to define the nature of the item (``pointage`` | item_to_be_deleted)
  // It takes one of 2 values like a value : (``present`` ``deleted``)
  public statuses: { value: string, code: string } [];
  public types;
  public selectedType: TypePointageModel;
  public startHour: Date;
  public isAcheval: boolean;
  public changedStartHour: Date;
  public endHour: Date;
  public changedEndHour: Date;
  public isSubmitted = false;
  public displayFirstClavier = false;
  public displaySecondClavier = false;
  @ViewChild('keyboardInput', {static: false}) firstKeyboardInput: ElementRef;
  @ViewChild('secondKeyboardInput', {static: false}) secondKeyboardInput: ElementRef;
  public addClickedBtn = false;
  public alreadyRun = false;
  private keyboardOne: Keyboard;
  private keyboardTwo: Keyboard;
  isClickOutsideListenerEnabledForStartTimeInput = false;
  isClickOutsideListenerEnabledForEndTimeInput = false;

  constructor(private dateService: DateService,
              private rhisTranslateService: RhisTranslateService) {
    this.createStatusFilter();
  }

  ngOnDestroy(): void {
      if(this.keyboardOne) {
        this.keyboardOne.destroy();
      }
      if(this.keyboardTwo) {
        this.keyboardTwo.destroy();
      }
    }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isCreation && changes.isCreation.currentValue) {
      this.isCreation = changes.isCreation.currentValue;
    }
    if (changes.typePointages && changes.typePointages.currentValue) {
      this.typePointages = changes.typePointages.currentValue;
      this.localTypePointages = [...this.typePointages];
    }
    if (changes.pointage && changes.pointage.currentValue) {
      this.pointage = changes.pointage.currentValue;
    }
    if (this.isCreation) {
      this.selectedStatus = this.getStatusByCode('present');
      this.selectedType = undefined;
      this.isSubmitted = false;
      this.statuses.pop();
      this.startHour =  new Date();
      this.changedStartHour = new Date();
      this.endHour = this.changedEndHour = null;
    } else if (this.pointage && this.localTypePointages && !this.startHour && !this.isCreation) {
      this.startHour = this.dateService.setTimeFormatHHMM(this.pointage.isAcheval ? JSON.parse(JSON.stringify(this.pointage.heureDebutAcheval)) : JSON.parse(JSON.stringify(this.pointage.heureDebut)));
      this.isAcheval = this.pointage.isAcheval;
      this.changedStartHour = new Date(this.startHour);
      this.endHour = this.pointage['isCompleted'] ? this.dateService.setTimeFormatHHMM(JSON.parse(JSON.stringify(this.pointage.heureFin))) : null;
      this.changedEndHour = this.endHour ? this.dateService.setTimeFormatHHMM(JSON.parse(JSON.stringify(this.pointage.heureFin))) : null;
      this.selectedStatus = this.getStatusByCode('present');
      this.selectedType = this.pointage.typePointageRef || null;
      if (this.selectedType && (!this.getTypePointageByLibelle(this.localTypePointages, this.selectedType.libelle))) {
        this.localTypePointages.unshift(this.pointage.typePointageRef);
      }
    }
    this.types = this.localTypePointages;
  }

  public getTypePointageByLibelle(typesPointages: TypePointageModel[], libelle: string): TypePointageModel {
    return typesPointages.find(typePointage => typePointage.libelle === libelle);
  }

  private createStatusFilter(): void {
    this.statuses = [
      {value: this.rhisTranslateService.translate('PLANNING_PAGE_PRINCIPALE.PRESENT'), code: 'present'},
      {value: '', code: 'deleted'}
    ];
  }

  private getStatusByCode(code: string): { value: string, code: string } {
    return this.statuses.find((status) => status.code === code);
  }

  public hidePopPup(): void {
    this.hidePopUp.emit();
  }

  public setListOfTypesBasedOnStatusFilter(status: { code: string, value: string }): void {
    if (status.code === 'present') {
      this.types = this.localTypePointages;
    }
    this.selectedType = undefined;
    if (this.isSubmitted) {
      this.isSubmitted = false;
    }
  }

  private checkHoursAreDifferent(): void {
    if (this.dateService.isTheSameDates(this.dateService.substractMinuteToDate(this.startHour, 1), (this.endHour || new Date()))) {
      this.pointage.error = true;
    }
  }

  private checkNonModification(updatedPointage, originPointage) {
    const heureDebutIsModified = updatedPointage.heureDebut !== originPointage.heureDebut;
    let heureFinIsModified : boolean;
    if(originPointage.heureFin ===  this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(), ':') && updatedPointage.heureDebut === originPointage.heureDebut){
      heureFinIsModified = true;
    } else {
      heureFinIsModified = updatedPointage.heureFin !== originPointage.heureFin;
    }
    const typePointageRefIsModified = updatedPointage.typePointageRef.id !== originPointage.typePointageRef.id;
    if (!heureDebutIsModified && !heureFinIsModified && !typePointageRefIsModified) {
      this.hidePopPup();
    } else {
      updatedPointage['heureDebutIsModified'] = heureDebutIsModified;
      updatedPointage['heureFinIsModified'] = heureFinIsModified;
      updatedPointage['typePointageRefIsModified'] = typePointageRefIsModified;
      updatedPointage['isCompleted'] = this.changedEndHour !== null;
    }
  }

  public submit(): void {
    this.addClickedBtn = true;
    this.ckeckKeybordTime();
    this.isSubmitted = true;
    this.checkHoursAreDifferent();
    if ((!this.selectedStatus) || ((!this.selectedType) || this.pointage.error) && (this.selectedStatus.code !== 'deleted'))
      return;
    if (this.selectedStatus.code === 'deleted') {
      this.delete.emit();
    } else {
      let updatedPointage = {
        dateJournee: this.pointage.dateJournee,
        heureDebut: this.dateService.getHHmmformatFromDateAndWithSeparator(this.startHour, ':'),
        typePointageRef: this.selectedType,
        heureFin: '',
        hoursInSameDay: true
      };
      if (!this.pointage['isCompleted'] && !this.endHour && !this.isCreation) {
        updatedPointage.heureFin = this.pointage.heureFin;
        updatedPointage.hoursInSameDay = this.startHour <= this.dateService.setTimeFormatHHMM(JSON.parse(JSON.stringify(this.pointage.heureFin)));
      } else {
        updatedPointage.heureFin = this.dateService.getHHmmformatFromDateAndWithSeparator(this.endHour || new Date(), ':');
        updatedPointage.hoursInSameDay = this.startHour <= (this.endHour || new Date());
      }
      if (this.isCreation) {
        updatedPointage['heureDebutIsModified'] = true;
        updatedPointage['heureFinIsModified'] = this.endHour != null;
        this.add.emit(updatedPointage);
      } else {
        this.checkNonModification(updatedPointage, this.pointage);
        this.update.emit(updatedPointage);
      }
    }
  }

  // check start / end time validity before saving
  private ckeckKeybordTime(): void {
    if (this.selectedStatus.code !== 'deleted') {
      this.closeEndHourTimer(this.secondKeyboardInput.nativeElement);
      this.endHour = this.changedEndHour ? new Date(this.changedEndHour) : null;
      this.closeStartHourTimer(this.firstKeyboardInput.nativeElement);
      this.startHour = this.changedStartHour ? new Date(this.changedStartHour) : null;
      this.pointage.error = false;
    }
  }

  /********************************************************* Numeric keyboard *********************************************************/

    // handle the key press event in start hour keyboard
  public onKeyPress = (button: string) => {
    const position = this.firstKeyboardInput.nativeElement.selectionEnd;
    if (button === "{bksp}") {
      this.firstKeyboardInput.nativeElement.value = this.firstKeyboardInput.nativeElement.value.slice(0, (this.firstKeyboardInput.nativeElement.selectionEnd - 1) || 0) +
        this.firstKeyboardInput.nativeElement.value.slice(this.firstKeyboardInput.nativeElement.selectionEnd);
      this.setCaretPosition(this.firstKeyboardInput.nativeElement, ((position - 1) || 0));
    } else {
      this.firstKeyboardInput.nativeElement.value =
        (this.firstKeyboardInput.nativeElement.value + button).split('').length > 5 ?
          this.firstKeyboardInput.nativeElement.value : (
            this.firstKeyboardInput.nativeElement.value.slice(0, position) + button + this.firstKeyboardInput.nativeElement.value.slice(position)
          );
      this.setCaretPosition(this.firstKeyboardInput.nativeElement, (position + 1));
    }
    if (this.isTimeValue(this.firstKeyboardInput.nativeElement.value)) {
        const textElement = this.firstKeyboardInput.nativeElement;
        if (!this.changedStartHour) {
          this.changedStartHour = new Date();
        }
        const timeParts = textElement.value.split(':');
        if (timeParts.length === 1) {
          switch (textElement.value.length) {
            case 1:
              this.changedStartHour.setHours(+textElement.value);
              this.changedStartHour.setMinutes(0);
              break;
            case 2:
              this.changedStartHour.setHours(+textElement.value);
              this.changedStartHour.setMinutes(0);
              break;
            case 3:
              this.changedStartHour.setHours(+textElement.value.substr(0, 2));
              this.changedStartHour.setMinutes(+textElement.value.substr(2, 1));
              break;
            case 4:
              this.changedStartHour.setHours(+textElement.value.substr(0, 2));
              this.changedStartHour.setMinutes(+textElement.value.substr(2, 2));
              break;
          }
        } else {
          this.changedStartHour.setHours(+timeParts[0]);
          this.changedStartHour.setMinutes(+timeParts[1]);
        }
        this.pointage.error = false;
      }
  };

  // handle the key press event in end hour keyboard
  public onKeyPress1 = (button: string) => {
    const position = this.secondKeyboardInput.nativeElement.selectionEnd;
    if (button === "{bksp}") {
      this.secondKeyboardInput.nativeElement.value = this.secondKeyboardInput.nativeElement.value.slice(0, (this.secondKeyboardInput.nativeElement.selectionEnd - 1) || 0) +
        this.secondKeyboardInput.nativeElement.value.slice(this.secondKeyboardInput.nativeElement.selectionEnd);
      this.setCaretPosition(this.secondKeyboardInput.nativeElement, ((position - 1) || 0));
    } else {
      this.secondKeyboardInput.nativeElement.value =
        (this.secondKeyboardInput.nativeElement.value + button).split('').length > 5 ?
          this.secondKeyboardInput.nativeElement.value : (
            this.secondKeyboardInput.nativeElement.value.slice(0, position) + button + this.secondKeyboardInput.nativeElement.value.slice(position)
          );
      this.setCaretPosition(this.secondKeyboardInput.nativeElement, (position + 1));
    }
    if (this.isTimeValue(this.secondKeyboardInput.nativeElement.value)) {
      const textElement = this.secondKeyboardInput.nativeElement;
      if (!this.changedEndHour) {
        this.changedEndHour = new Date();
      }
      const timeParts = textElement.value.split(':');
      if (timeParts.length === 1) {
        switch (textElement.value.length) {
          case 1:
            this.changedEndHour.setHours(+textElement.value);
            this.changedEndHour.setMinutes(0);
            break;
          case 2:
            this.changedEndHour.setHours(+textElement.value);
            this.changedEndHour.setMinutes(0);
            break;
          case 3:
            this.changedEndHour.setHours(+textElement.value.substr(0, 2));
            this.changedEndHour.setMinutes(+textElement.value.substr(2, 1));
            break;
          case 4:
            this.changedEndHour.setHours(+textElement.value.substr(0, 2));
            this.changedEndHour.setMinutes(+textElement.value.substr(2, 2));
            break;
        }
      } else {
        this.changedEndHour.setHours(+timeParts[0]);
        this.changedEndHour.setMinutes(+timeParts[1]);
      }
      this.pointage.error = false;
    }
  };

  private completeHour(time: string): Date {
    const timeParts = time.split(':');
    let date = new Date();
    if (/^([0-9]{2})\:([0-9]{2})$/.test(time)) {
      date.setHours(+time.substr(0, 2), +time.substr(3, 5));
    } else {
      if (timeParts.length === 1) {
        switch (time.length) {
          case 1:
            date.setHours(+time, 0);
            break;
          case 2:
            date.setHours(+time, 0);
            break;
          case 3:
            date.setHours(+time.substr(0, 2), +time.substr(2, 3));
            break;
          case 4:
            date.setHours(+time.substr(0, 2), +time.substr(2, 4));
            break;
        }
      } else {
        date.setHours(+timeParts[0], +timeParts[1]);
      }
    }

    return date;
  }


  // check end hour validity when clicking outside timer
  public async closeEndHourTimer(input: HTMLInputElement): Promise<void> {
    this.isClickOutsideListenerEnabledForEndTimeInput = false;
    this.displaySecondClavier = false;
    if (!this.isTimeValue(input.value)) {
      this.changedEndHour = null;
    } else if (/^\d+$/.test(input.value.substr(0, 1))) {
      this.changedEndHour = await this.completeHour(input.value);
      input.value = ('0' + this.changedEndHour.getHours()).slice(-2) + ':' + ('0' + this.changedEndHour.getMinutes()).slice(-2);
    } else if (this.changedEndHour) {
      input.value = ('0' + this.changedEndHour.getHours()).slice(-2) + ':' + ('0' + this.changedEndHour.getMinutes()).slice(-2);
    }
  }

  // check start hour validity when clicking outside timer
  public async closeStartHourTimer(input: HTMLInputElement): Promise<void> {
    console.log("close start hour timer")
    this.isClickOutsideListenerEnabledForStartTimeInput = false;
    this.displayFirstClavier = false;
    this.alreadyRun = false;
    if (!this.isAcheval) {
      if (!this.isTimeValue(input.value)) {
        const date = this.dateService.setTimeFormatHHMM(JSON.parse(JSON.stringify(this.pointage.heureDebut)));
        input.value = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
        this.changedStartHour = this.pointage.heureDebut ? this.dateService.setTimeFormatHHMM(JSON.parse(JSON.stringify(this.pointage.heureDebut))) : null;
      } else if (/^\d+$/.test(input.value.substr(0, 1))) {
        this.changedStartHour = await this.completeHour(input.value);
        input.value = ('0' + this.changedStartHour.getHours()).slice(-2) + ':' + ('0' + this.changedStartHour.getMinutes()).slice(-2);
      } else if (this.changedStartHour) {
        input.value = ('0' + this.changedStartHour.getHours()).slice(-2) + ':' + ('0' + this.changedStartHour.getMinutes()).slice(-2);
      }
    } else {
      input.value = this.pointage.heureDebutAcheval.length > 5 ? this.pointage.heureDebutAcheval.substring(0, 5) : this.pointage.heureDebutAcheval;
    }
  }

  // check if passing string is a valid time
  public isTimeValue(value: string): boolean {
    if (value.length == 2) {
      return +value <= 23;
    }
    const resultInPatternWithDoublePoint = new RegExp('^(([01]?[0-9])|(2[0-3])):([0-9]|([0-5][0-9]))$').test(value);
    const resultWithoutDoublePoint = new RegExp('^(([01]?[0-9])|(2[0-3]))([0-9]|([0-5][0-9]))?$').test(value);
    return resultInPatternWithDoublePoint || resultWithoutDoublePoint;
  }

  // Instantiate a number keyboard for a start/end hour
  public instantiateKeybord(className: string, keyPressMethod: string, keyboardNumber: number): void {

      this.addClickedBtn = false;
    switch (keyboardNumber) {
      case 1: {
        this.isClickOutsideListenerEnabledForStartTimeInput = true;
        if (!this.displayFirstClavier) {
          this.displayFirstClavier = true;
        }
        if (this.displayFirstClavier) {
          this.displaySecondClavier = false;
          if (!this.alreadyRun){
            let timeoout3 = setTimeout(() => {
              this.keyboardOne = new Keyboard('.' + className, {
                onKeyPress: button => this[keyPressMethod](button),
                layout: {
                  default: ["1 2 3", "4 5 6", "7 8 9", ": 0 {bksp}"],
                },
                theme: "hg-theme-default hg-layout-numeric numeric-theme"
              });
              this.updateBackSpaceIcon();
              clearTimeout(timeoout3);
            }, 50);
            this.alreadyRun = true
          }


        } else {
          return null;
        }

        break;
      }
      case 2: {
        this.isClickOutsideListenerEnabledForEndTimeInput = true;
        if (!this.displaySecondClavier) {
          this.displaySecondClavier = true;
        }
        if (this.displaySecondClavier) {
          this.displayFirstClavier = false;
          let timeout5 = setTimeout(() => {
            this.keyboardTwo = new Keyboard('.' + className, {
              onKeyPress: button => this[keyPressMethod](button),
              layout: {
                default: ["1 2 3", "4 5 6", "7 8 9", ": 0 {bksp}"],
              },
              theme: 'hg-theme-default hg-layout-numeric numeric-theme'
            });
            this.updateBackSpaceIcon();
            clearTimeout(timeout5);
          }, 50);
        } else {
          return null;
        }
        break;
      }
      default : {
        this.alreadyRun = false;
        return null;
      }
    }

  }

  // create a backspace icon for number keyboard
  private updateBackSpaceIcon(): void {
    const backSpaceBtn = document.querySelector('[data-skbtn="{bksp}"]');
    if (backSpaceBtn) {
      backSpaceBtn.innerHTML = '';
      const backSpaceIcon = document.createElement('img');
      backSpaceBtn.setAttribute('style', 'background-color: #ff9b42');
      backSpaceIcon.src = 'assets/icons/pointage/backspace2.svg';
      backSpaceIcon.style.height = '35px';
      backSpaceBtn.appendChild(backSpaceIcon);
    }
  }

  // Set caret position (cursor position) in an input
  private setCaretPosition(elem: any, caretPos: number): void {
    if (elem != null) {
      if (elem.createTextRange) {
        const range = elem.createTextRange();
        range.move('character', caretPos);
        range.select();
      } else {
        if (elem.selectionStart) {
          elem.focus();
          elem.setSelectionRange(caretPos, caretPos);
        } else {
          elem.focus();
        }
      }
    }
  }

}
