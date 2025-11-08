import type { GameEvent } from '../types';
import Logger from './Logger';

/**
 * 이벤트 버스
 * 게임 내 컴포넌트 간 느슨한 결합을 위한 pub/sub 패턴 구현
 */
class EventBus {
  private static instance: EventBus;
  private listeners: Map<GameEvent['type'], Array<(event: GameEvent) => void>> = new Map();

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * 이벤트 구독
   */
  on<T extends GameEvent['type']>(
    eventType: T,
    callback: (event: Extract<GameEvent, { type: T }>) => void
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const callbacks = this.listeners.get(eventType)!;
    callbacks.push(callback as (event: GameEvent) => void);

    Logger.debug(`EventBus: Subscribed to "${eventType}"`, {
      totalListeners: callbacks.length,
    });

    // 구독 해제 함수 반환
    return () => this.off(eventType, callback);
  }

  /**
   * 이벤트 구독 해제
   */
  off<T extends GameEvent['type']>(
    eventType: T,
    callback: (event: Extract<GameEvent, { type: T }>) => void
  ): void {
    const callbacks = this.listeners.get(eventType);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback as (event: GameEvent) => void);
    if (index > -1) {
      callbacks.splice(index, 1);
      Logger.debug(`EventBus: Unsubscribed from "${eventType}"`, {
        remainingListeners: callbacks.length,
      });
    }
  }

  /**
   * 이벤트 발행
   */
  emit(event: GameEvent): void {
    const callbacks = this.listeners.get(event.type);
    if (!callbacks || callbacks.length === 0) {
      Logger.debug(`EventBus: No listeners for "${event.type}"`);
      return;
    }

    Logger.debug(`EventBus: Emitting "${event.type}"`, event);

    callbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        Logger.error(`EventBus: Error in listener for "${event.type}"`, error);
      }
    });
  }

  /**
   * 특정 타입의 모든 리스너 제거
   */
  removeAllListeners(eventType?: GameEvent['type']): void {
    if (eventType) {
      this.listeners.delete(eventType);
      Logger.debug(`EventBus: Removed all listeners for "${eventType}"`);
    } else {
      this.listeners.clear();
      Logger.debug('EventBus: Removed all listeners');
    }
  }

  /**
   * 등록된 리스너 수 조회
   */
  getListenerCount(eventType: GameEvent['type']): number {
    return this.listeners.get(eventType)?.length || 0;
  }
}

// 싱글톤 인스턴스 내보내기
export default EventBus.getInstance();
