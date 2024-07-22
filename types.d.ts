import { Logger } from 'pino';

declare global {
    namespace Express {
        interface Request {
            logger?: Logger
        }
    }
}
