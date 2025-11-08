import type { LogLevel } from '../types';

/**
 * 로깅 유틸리티
 * 구조화된 로그를 제공하고, 디버그 모드와 프로덕션 모드를 구분합니다.
 */
class Logger {
  private static instance: Logger;
  private debugMode: boolean = import.meta.env.DEV;
  private logs: Array<{ level: LogLevel; message: string; data?: unknown; timestamp: number }> =
    [];
  private maxLogs: number = 100;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 디버그 모드 설정
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * 로그 기록
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = Date.now();
    const logEntry = { level, message, data, timestamp };

    // 메모리에 저장 (최대 100개)
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 콘솔 출력
    const prefix = `[${level.toUpperCase()}]`;
    const formattedMessage = `${prefix} ${message}`;

    switch (level) {
      case 'debug':
        if (this.debugMode) {
          console.debug(formattedMessage, data || '');
        }
        break;
      case 'info':
        console.info(formattedMessage, data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'error':
        console.error(formattedMessage, data || '');
        break;
    }
  }

  /**
   * 디버그 로그
   */
  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  /**
   * 정보 로그
   */
  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  /**
   * 경고 로그
   */
  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  /**
   * 에러 로그
   */
  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  /**
   * 저장된 로그 가져오기
   */
  getLogs(): typeof this.logs {
    return [...this.logs];
  }

  /**
   * 로그 초기화
   */
  clear(): void {
    this.logs = [];
  }
}

// 싱글톤 인스턴스 내보내기
export default Logger.getInstance();
