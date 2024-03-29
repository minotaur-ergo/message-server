import { TransportOptions } from '@rosen-bridge/winston-logger';
import config from 'config';
import { exit } from 'process';

export const Port = config.get<number>('port');

const logs = config.get<TransportOptions[]>('logs');
const wrongLogTypeIndex = logs.findIndex((log) => {
  const logTypeValidation = ['console', 'file', 'loki'].includes(log.type);
  let loggerChecks = true;
  if (log.type === 'loki') {
    loggerChecks =
      log.host != undefined &&
      typeof log.host === 'string' &&
      log.level != undefined &&
      typeof log.level === 'string' &&
      (log.serviceName ? typeof log.serviceName === 'string' : true) &&
      (log.basicAuth ? typeof log.basicAuth === 'string' : true);
  } else if (log.type === 'file') {
    loggerChecks =
      log.path != undefined &&
      typeof log.path === 'string' &&
      log.level != undefined &&
      typeof log.level === 'string' &&
      log.maxSize != undefined &&
      typeof log.maxSize === 'string' &&
      log.maxFiles != undefined &&
      typeof log.maxFiles === 'string';
  }
  return !(loggerChecks && logTypeValidation);
});
if (wrongLogTypeIndex >= 0) {
  console.error(`Wrong logging config at index ${wrongLogTypeIndex}`);
  exit(1);
}
export { logs };
