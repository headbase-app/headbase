import winston from "winston"

export interface ILoggerService {
    error: (label: string, message: string, context?: any) => void,
    warn: (label: string, message: string, context?: any) => void,
    info: (label: string, message: string, context?: any) => void,
    debug: (label: string, message: string, context?: any) => void,
}

export interface LoggerConfig {
    level?: winston.LoggerOptions['level']
}

export class LoggerService implements ILoggerService {
    #winston: winston.Logger;

    constructor(config?: LoggerConfig) {
        this.#winston = winston.createLogger({
            ...config,
            transports: [
                new winston.transports.Console(),
            ]
        });
    }

    warn(label: string, message: string, context?: any) {
        this.#winston.warn({
            label,
            message,
            context
        })
    }

    error(label: string, message: string, context?: any) {
        this.#winston.error({
            label,
            message,
            context
        })
    }

    info(label: string, message: string, context?: any) {
        this.#winston.info({
            label,
            message,
            context
        })
    }

    debug(label: string, message: string, context?: any) {
        this.#winston.debug({
            label,
            message,
            context
        })
    }
}
