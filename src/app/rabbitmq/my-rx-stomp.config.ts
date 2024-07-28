import { InjectableRxStompConfig } from '@stomp/ng2-stompjs';
import {PathService} from '../shared/services/path.service';
export function myRxStompConfig(pathService: PathService) {
  return {...stompConfig, ...pathService.getRabbitMQ()};
}
const stompConfig: InjectableRxStompConfig = {
  // The heartbeat timeout value defines after what period of time the peer TCP connection
  // should be considered unreachable (down) by RabbitMQ and client libraries.
  // Interval in milliseconds, set to 0 to disable
  heartbeatIncoming: 0, // Typical value 0 - disabled
  heartbeatOutgoing: 20000, // Typical value 20000 - every 20 seconds
  reconnectDelay: 500,
};

