import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';

import {ChatUser, ChatMessage} from './chat.model';
import * as Stomp from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

import {chatData, chatMessagesData} from './data';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";


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

  formData: FormGroup;

// Form submit
  chatSubmit: boolean;

  greetings: ChatMessage[];
  usermessage: string;
  disabled = true;
  name: string;
  private stompClient = null;

  constructor(public formBuilder: FormBuilder, private http: HttpClient
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

  private

  _fetchData() {
    this.http.get<any>(`http://localhost:8080/chat/getRoomsByUser?userId=` + localStorage.getItem("currentUser"))
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
    this.http.get<any>(`http://localhost:8080/chat/getAllMessByRoom?idRoom=` + name)
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

    this.stompClient.send(
      '/gkz/hello',
      {},
      JSON.stringify({'name': this.name})
    );
  }

  connect() {
    const socket = new SockJS('http://localhost:8080/gkz-stomp-endpoint');
    this.stompClient = Stomp.Stomp.over(socket);

    const _this = this;
    this.stompClient.connect({}, function (frame) {
      _this.setConnected(true);
      console.log('Connected: ' + frame);

      _this.stompClient.subscribe('/topic/hi', function (hello) {
        _this.showGreeting(JSON.parse(hello.body).greeting);
      });
    });
  }

  setConnected(connected: boolean) {
    this.disabled = !connected;

    if (connected) {
      this.greetings = [];
    }
  }

  showGreeting(message) {
    this.greetings.push(message);
  }


}
