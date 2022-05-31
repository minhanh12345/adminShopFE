export interface ChatUser {
   id:number;
   user1:number;
   user2:number;
  timeCreate:string;
}

export interface ChatMessage {
    id: number;
  content: string;
  byUser: number;
  idRoom: number;
  timeCreate:String;
}
