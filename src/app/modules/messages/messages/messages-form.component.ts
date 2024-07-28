import {AfterViewInit, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MessageService} from "../service/message.service";
import {MessageModel} from "../../../shared/model/message.model";
import {TypeMessage} from "../../../shared/model/enumeration/TypeMessage.model";
import {BandroleService} from "../../../shared/services/bandrole.service";
import {SessionService} from "../../../shared/services/session.service";
import {EmployeeService} from "../../employes/service/employee.service";
import {AudioRecordingServiceService} from "../service/audio-recording-service.service";
import {DomSanitizer} from "@angular/platform-browser";
import {RhisTranslateService} from "../../../shared/services/rhis-translate.service";
import Keyboard from 'simple-keyboard';
import {MessageJsStoreService} from "../service/messageJsStore.service";
import {NotificationService} from "../../../shared/services/notification.service";

@Component({
  selector: 'rhis-messages-form',
  templateUrl: './messages-form.component.html',
  styleUrls: ['./messages-form.component.scss']
})
export class MessagesFormComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly smallScreen = 991;
  constructor(private router: Router, private messageService: MessageService,
              private bandroleService: BandroleService,
              private sessionService: SessionService,
              private employeeService: EmployeeService,
              private audioRecordingService: AudioRecordingServiceService,
              private sanitizer: DomSanitizer,
              private rhisTranslateService: RhisTranslateService,
              private messageJsStoreService: MessageJsStoreService,
              private notificationService: NotificationService,
              private rhisTranslateservice: RhisTranslateService) {

  let sub6 = this.audioRecordingService.recordingFailed().subscribe(() => {
    this.isRecording = false;
  });
    sub6.unsubscribe();

    let sub = this.audioRecordingService.getRecordedTime().subscribe((time) => {
      this.recordedTime = time;
    });
    sub.unsubscribe();

    let sub5 = this.audioRecordingService.getRecordedBlob().subscribe((data) => {
      this.audioBlob = data.blob;
      this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data.blob));
    });
    sub5.unsubscribe();
  }

  public messageTexte = false;
  public messageAudio = false;
  public messageBandeRole = false;
  public bandroleText: string;
  public message: MessageModel = new MessageModel();
  public textMessage: string;
  public isRecording = false;
  public recordedTime: any;
  public blobUrl: any;
  public placeholderMessage = '';
  public textAreaValue = '';
  private keyboard: Keyboard;
  private keyBoardInput: string;
  public displayClavier: any;
  private audioBlob: Blob;
  public isMobile: boolean;
  public scrHeight: any;
  public scrWidth: any;
  public sizeScreenSmall: any;

  ngOnInit() {
    this.getScreenSize();
    this.bandroleText = this.sessionService.getBandrole();
    this.detectRoute();
    this.placeholderMessage = this.rhisTranslateService.translate('MESSAGE.PLACEHOLDER');
    const details = navigator.userAgent;
    const regexp = /android|iphone|ipad/i;
    this.isMobile = regexp.test(details);
    this.displayClavier = false;
    this.keyboard = new Keyboard({
      onChange: input => this.onChange(input),
      onKeyPress: button => this.onKeyPress(button)
    });
  }

  /**
   * detect l'interface à afficher
   */
  private detectRoute() {
    if (this.router.url == '/messages/messagesTexte') {
      this.messageTexte = true;
    } else if (this.router.url == '/messages/messagesAudio') {
      this.messageAudio = true;
    } else if (this.router.url == '/messages/messagesBanderole') {
      this.messageBandeRole = true;
    }
  }

  public async SaveMessage(): Promise<any> {
    this.message.dateCreation = new Date();
    this.message.isViewed = false;
    this.message.fullNameMessageOwner = this.sessionService.getEmployeFullName();
    this.message.idMessageOwner = +this.sessionService.getEmploye();
    if (this.messageBandeRole) {
      this.messageJsStoreService.getMessages().then((messages: MessageModel[]) => {
        for (let message of  messages) {
          if (message.typeMessage === TypeMessage.BANDEROLE) {
            this.messageJsStoreService.deleteMessage(message.idFront);
          }
        }
      });
      this.saveBabdroleMessage();
    } else if (this.messageTexte) {
      this.saveTexteMassege();
    } else if (this.messageAudio) {
      this.saveAudioMessage();
    }
    if (this.messageTexte || this.messageAudio) {
      for (let idEmployee of this.employeeService.ListIdEmployees) {
        this.message.idFront = this.makeString();
        this.message.idMessageReciever = idEmployee;
        await this.messageJsStoreService.addMessage(this.message);
      }
      this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('MESSAGE.SENT'));
      this.router.navigateByUrl('/employes');
    } else {
      this.message.idFront = this.makeString();
      this.messageJsStoreService.addMessage(this.message);
    }
  }

  private saveAudioMessage() {
    this.message.contenuMessage = "";
    this.message.typeMessage = TypeMessage.AUDIO;
    this.message.messageAudio = this.audioBlob;
  }

  private saveTexteMassege() {
    this.message.contenuMessage = this.textAreaValue;
    this.message.typeMessage = TypeMessage.TEXT;
    this.message.messageAudio = null;
  }

  private saveBabdroleMessage() {
    this.message.contenuMessage = this.textAreaValue;
    this.message.typeMessage = TypeMessage.BANDEROLE;
    this.message.messageAudio = null;
    this.sessionService.setBandrole(this.bandroleText);
    this.bandroleService.changeMessage(this.bandroleText);
  }

  private makeString(): string {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    return outString;
  }


  public startRecording() {
    if (!this.isRecording) {
      this.isRecording = true;
      this.audioRecordingService.startRecording();
    }
  }

  public abortRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.audioRecordingService.abortRecording();
    }
  }

  public stopRecording() {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
    }
  }

  public clearRecordedData() {
    this.blobUrl = null;
  }

  /************************************** clavier virtuel ****************************/
  private onChange = (input: string) => {
    this.textAreaValue = input;
  };

  /**
   * pour activer et désactiver le majuscule avec le shit ou capslock
   */
  private onKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') this.handleShift();
  };

  private handleShift = () => {
    let currentLayout = this.keyboard.options.layoutName;
    let shiftToggle = currentLayout === "default" ? "shift" : "default";
    this.keyboard.setOptions({
      layoutName: shiftToggle
    });
  };


  ngAfterViewInit() {
    this.keyboard = new Keyboard({
      onChange: input => this.onChange(input),
      onKeyPress: button => this.onKeyPress(button)
    });
  }

  /**
   * display keyboard when textarea is clicked
   */
  public displayClavierMessage() {
    this.keyboard = new Keyboard({
      onChange: input => this.onChange(input),
      onKeyPress: button => this.onKeyPress(button)
    });
    if (!this.sizeScreenSmall) {
      this.displayClavier = !this.displayClavier;
    }
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.displayClavier = false;
    this.scrHeight = window.innerHeight;
    this.scrWidth = window.innerWidth;
    this.sizeScreenSmall = this.scrWidth <= this.smallScreen;
  }


  ngOnDestroy(): void {
    this.abortRecording();
  }

}
