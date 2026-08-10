/**
 * Firefox MV3 background event page entry point.
 * Firefox uses background scripts instead of service workers.
 */

import { registerMessageListener } from './message-handler.js';

registerMessageListener();
