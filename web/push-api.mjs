import { startPushApiServer } from './push-server.mjs';

startPushApiServer(Number(process.env.PUSH_API_PORT) || 3001);
