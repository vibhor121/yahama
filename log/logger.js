const winston = require('winston');
const { createLogger, transports, format } = require('winston');
const { combine, timestamp, printf, errors, json } = format;

const customFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }), // Capture and log stack traces for errors
    json(), // Log in JSON format
    customFormat // Apply custom format for readable logs
  ),
  transports: [
    new transports.Console({
      format: combine(
        format.colorize(), // Colorize output for the console
        customFormat
      )
    }),
    new transports.File({ filename: 'logs/combined.log', format: combine(timestamp(), json()) }),
    new transports.File({ filename: 'logs/errors.log', level: 'error', format: combine(timestamp(), json()) }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' }) // Handle uncaught exceptions
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' }) // Handle unhandled promise rejections
  ]
});

module.exports = logger;
