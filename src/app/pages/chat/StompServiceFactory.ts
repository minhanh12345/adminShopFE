import {RxStompService} from "./RxStompService";
import {myRxStompConfig} from "./WebsocketConfig";

export function rxStompServiceFactory() {
  const rxStomp = new RxStompService();
  rxStomp.configure(myRxStompConfig);
  rxStomp.activate();
  return rxStomp;
}
