import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';

import {ChatUser, ChatMessage} from './chat.model';
import {HttpClient} from "@angular/common/http";
import { RxStompService } from './RxStompService';
import { rxStompServiceFactory } from './StompServiceFactory';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {

  @ViewChild('scrollEle') scrollEle;
  @ViewChild('scrollRef') scrollRef;


  username = 'Steven Franklin';

// bread crumb items
  breadCrumbItems: Array<{}>;

  chatData: ChatUser[];
  chatMessagesData: ChatMessage[];
  messageUser: ChatMessage;
  formData: FormGroup;

// Form submit
  chatSubmit: boolean;

  greetings: ChatMessage[];
  usermessage: string;
  disabled = true;
  name: string;




  constructor(public formBuilder: FormBuilder, private http: HttpClient,private rxStompService: RxStompService
    ) {

  }

  ngOnInit() {
    this.breadCrumbItems = [{label: 'Skote'}, {label: 'Chat', active: true}];

    this.formData = this.formBuilder.group({
      message: ['', [Validators.required]],
    });

    this.onListScroll();

    this._fetchData();
    console.log(localStorage.getItem("currentUser"))

    this.rxStompService.watch(`/app/chat/${this.name}`).subscribe(m => {
      const message= JSON.parse(m.body);
      this.chatMessagesData.push(message);
    });


  }

  send(message:string,userId:number,chatRoomId:number){
   let msgUser:ChatMessage
    msgUser.content=message
    msgUser.byUser=userId
    msgUser.idRoom=chatRoomId

  }

  sendMessage(message: ChatMessage) {
    this.rxStompService.publish({destination: `/app/chat/1`, body: JSON.stringify(message)});
  }

  ngAfterViewInit() {
    this.scrollEle.SimpleBar.getScrollElement().scrollTop = 100;
    this.scrollRef.SimpleBar.getScrollElement().scrollTop = 200;
  }

  /**
   * Returns form
   */
  get form() {
    return this.formData.controls;
  }


  _fetchData() {
    this.http.get<any>(`http://localhost:8083/chat/getRoomsByUser?userId=` + localStorage.getItem("currentUser"))
      .subscribe(data => {
        this.chatData = data.content
      })
  }


  onListScroll() {
    if (this.scrollRef !== undefined) {
      setTimeout(() => {
        this.scrollRef.SimpleBar.getScrollElement().scrollTop =
          this.scrollRef.SimpleBar.getScrollElement().scrollHeight + 1500;
      }, 500);
    }
  }

  chatUsername(name) {
    this.username = name;
    this.http.get<any>(`http://localhost:8083/chat/getAllMessByRoom?idRoom=` + name)
      .subscribe(data => {
        this.chatMessagesData = data.content
      })
  }

  /**
   * Save the message in chat
   */
  messageSave() {
    const message = this.formData.get('message').value;
    const currentDate = new Date();
    if (this.formData.valid && message) {
      // Message Push in Chat

      this.onListScroll();

      // Set Form Data Reset
      this.formData = this.formBuilder.group({
        message: null
      });
    }

    this.chatSubmit = true;


  }



}
