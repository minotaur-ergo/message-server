import WinstonLogger from '@rosen-bridge/winston-logger';
import { logs } from './configs';

await WinstonLogger.init(logs);
