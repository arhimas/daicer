import type { Core } from '@strapi/strapi';
import chalk from 'chalk';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class DevLogger {
  private scope: string;
  private strapi: Core.Strapi;

  constructor(scope: string, strapi: Core.Strapi) {
    this.scope = scope;
    this.strapi = strapi;
  }

  private getPrefix(level: LogLevel) {
    // const timestamp = new Date().toISOString();
    let icon = 'ℹ️';
    // let color = chalk.blue;

    switch (level) {
      case 'info':
        icon = 'ℹ️';
        // color = chalk.blue;
        break;
      case 'warn':
        icon = '⚠️';
        // color = chalk.yellow;
        break;
      case 'error':
        icon = '❌';
        // color = chalk.red;
        break;
      case 'debug':
        icon = '🐛';
        // color = chalk.magenta;
        break;
    }

    // JSON structure for pino-pretty to pick up if we want, 
    // but here we are wrapping Strapi's logger which might be configured for JSON.
    // If we want human readable logs directly in console without pino-pretty wrapping these specific lines,
    // we might double-encode.
    // However, since we configured config/logger.ts to be JSON, strapi.log.info will output JSON.
    // We should pass the object structure so it merges nicely.
    
    return {
       scope: this.scope,
       icon
    };
  }

  log(level: LogLevel, message: string, meta: Record<string, any> = {}) {
    this.strapi.log[level](message, {
        ...meta,
        scope: this.scope,
    }); 
  }

  info(message: string, meta?: Record<string, any>) {
    this.strapi.log.info(message, { scope: this.scope, ...meta });
  }

  warn(message: string, meta?: Record<string, any>) {
    this.strapi.log.warn(message, { scope: this.scope, ...meta });
  }

  error(message: string, error?: any) {
    this.strapi.log.error(message, { 
        scope: this.scope, 
        error: error instanceof Error ? 
            { message: error.message, stack: error.stack } : 
            error 
    });
  }

  debug(message: string, meta?: Record<string, any>) {
    this.strapi.log.debug(message, { scope: this.scope, ...meta });
  }

  start(jobName: string): { end: () => void; fail: (err: any) => void } {
    const startTime = Date.now();
    this.info(`🚀 Starting: ${jobName}`, { event: 'job_start', job: jobName });

    return {
      end: () => {
        const duration = Date.now() - startTime;
        this.info(`✅ Finished: ${jobName}`, { 
            event: 'job_end', 
            job: jobName, 
            duration: `${duration}ms`,
            durationMs: duration
        });
      },
      fail: (err: any) => {
        const duration = Date.now() - startTime;
        this.error(`❌ Failed: ${jobName}`, { 
            event: 'job_fail', 
            job: jobName, 
            duration: `${duration}ms`,
            durationMs: duration,
            error: err
        });
      }
    };
  }
}
