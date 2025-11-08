import type { GameStateData } from '../types';
import Logger from '../utils/Logger';

/**
 * StorageManager
 * localStorage를 사용하여 게임 상태를 저장하고 복구합니다.
 */
export class StorageManager {
  private static readonly STORAGE_KEY = 'match3-game-state';

  /**
   * 게임 상태 저장
   */
  static save(gameState: GameStateData): void {
    try {
      const json = JSON.stringify(gameState);
      localStorage.setItem(this.STORAGE_KEY, json);

      Logger.info('Game state saved', {
        score: gameState.score,
        moves: gameState.moves,
        phase: gameState.phase,
      });
    } catch (error) {
      Logger.error('Failed to save game state', error);
    }
  }

  /**
   * 게임 상태 불러오기
   */
  static load(): GameStateData | null {
    try {
      const json = localStorage.getItem(this.STORAGE_KEY);

      if (!json) {
        Logger.debug('No saved game state found');
        return null;
      }

      const gameState = JSON.parse(json) as GameStateData;

      Logger.info('Game state loaded', {
        score: gameState.score,
        moves: gameState.moves,
        phase: gameState.phase,
      });

      return gameState;
    } catch (error) {
      Logger.error('Failed to load game state', error);
      return null;
    }
  }

  /**
   * 저장된 데이터 삭제
   */
  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      Logger.info('Game state cleared');
    } catch (error) {
      Logger.error('Failed to clear game state', error);
    }
  }

  /**
   * 저장된 데이터 존재 여부 확인
   */
  static hasSave(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }
}
