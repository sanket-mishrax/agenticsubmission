/**
 * Chrome MV3 service worker entry point.
 */

import { registerMessageListener } from './message-handler.js';

registerMessageListener();
