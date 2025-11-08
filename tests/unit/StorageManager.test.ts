import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { GameStateData } from '../../src/types';

// StorageManager는 아직 구현되지 않았으므로 테스트가 skip됩니다

describe('StorageManager', () => {
  // TODO: StorageManager 구현 후 import 추가
  // import { StorageManager } from '../../src/storage/StorageManager';

  beforeEach(() => {
    // localStorage 초기화
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe.skip('게임 상태 저장', () => {
    it('should save game state to localStorage', () => {
      const gameState: GameStateData = {
        phase: 'playing',
        score: 1000,
        moves: 15,
        grid: [[]],
        timestamp: Date.now(),
      };

      // StorageManager.save(gameState);

      // const saved = localStorage.getItem('match3-game-state');
      // expect(saved).not.toBeNull();

      // const parsed = JSON.parse(saved!);
      // expect(parsed.score).toBe(1000);
      // expect(parsed.moves).toBe(15);
    });

    it('should overwrite existing save', () => {
      const state1: GameStateData = {
        phase: 'playing',
        score: 100,
        moves: 5,
        grid: [[]],
        timestamp: Date.now(),
      };

      const state2: GameStateData = {
        phase: 'paused',
        score: 500,
        moves: 10,
        grid: [[]],
        timestamp: Date.now(),
      };

      // StorageManager.save(state1);
      // StorageManager.save(state2);

      // const loaded = StorageManager.load();
      // expect(loaded?.score).toBe(500);
      // expect(loaded?.moves).toBe(10);
    });
  });

  describe.skip('게임 상태 불러오기', () => {
    it('should load game state from localStorage', () => {
      const gameState: GameStateData = {
        phase: 'paused',
        score: 2000,
        moves: 25,
        grid: [[]],
        timestamp: Date.now(),
      };

      // localStorage.setItem('match3-game-state', JSON.stringify(gameState));

      // const loaded = StorageManager.load();

      // expect(loaded).not.toBeNull();
      // expect(loaded?.score).toBe(2000);
      // expect(loaded?.moves).toBe(25);
      // expect(loaded?.phase).toBe('paused');
    });

    it('should return null if no save exists', () => {
      // const loaded = StorageManager.load();
      // expect(loaded).toBeNull();
    });

    it('should return null if save is corrupted', () => {
      // localStorage.setItem('match3-game-state', 'invalid json');

      // const loaded = StorageManager.load();
      // expect(loaded).toBeNull();
    });
  });

  describe.skip('저장 데이터 삭제', () => {
    it('should clear saved game state', () => {
      const gameState: GameStateData = {
        phase: 'playing',
        score: 1000,
        moves: 15,
        grid: [[]],
        timestamp: Date.now(),
      };

      // StorageManager.save(gameState);
      // expect(StorageManager.load()).not.toBeNull();

      // StorageManager.clear();
      // expect(StorageManager.load()).toBeNull();
    });
  });

  describe.skip('저장 데이터 존재 확인', () => {
    it('should return true if save exists', () => {
      const gameState: GameStateData = {
        phase: 'playing',
        score: 1000,
        moves: 15,
        grid: [[]],
        timestamp: Date.now(),
      };

      // StorageManager.save(gameState);
      // expect(StorageManager.hasSave()).toBe(true);
    });

    it('should return false if no save exists', () => {
      // expect(StorageManager.hasSave()).toBe(false);
    });
  });

  describe.skip('자동 저장 타임스탬프', () => {
    it('should include timestamp in saved data', () => {
      const beforeSave = Date.now();

      const gameState: GameStateData = {
        phase: 'playing',
        score: 1000,
        moves: 15,
        grid: [[]],
        timestamp: beforeSave,
      };

      // StorageManager.save(gameState);

      const afterSave = Date.now();

      // const loaded = StorageManager.load();
      // expect(loaded?.timestamp).toBeGreaterThanOrEqual(beforeSave);
      // expect(loaded?.timestamp).toBeLessThanOrEqual(afterSave);
    });
  });
});
