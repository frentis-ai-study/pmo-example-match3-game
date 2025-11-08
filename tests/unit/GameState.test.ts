import { describe, it, expect, beforeEach } from 'vitest';

// GameState는 이미 구현되어 있으므로 실제 테스트 실행
import { GameState } from '../../src/game/GameState';

describe('GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('게임 페이즈 전환', () => {
    it('should start in idle phase', () => {
      expect(gameState.phase).toBe('idle');
    });

    it('should transition from idle to playing on start', () => {
      gameState.start();
      expect(gameState.phase).toBe('playing');
    });

    it('should transition from playing to paused on pause', () => {
      gameState.start();
      gameState.pause();
      expect(gameState.phase).toBe('paused');
    });

    it('should transition from paused to playing on resume', () => {
      gameState.start();
      gameState.pause();
      gameState.resume();
      expect(gameState.phase).toBe('playing');
    });

    it('should transition to gameover', () => {
      gameState.start();
      gameState.gameOver();
      expect(gameState.phase).toBe('gameover');
    });

    it('should not pause when not in playing state', () => {
      gameState.pause();
      expect(gameState.phase).toBe('idle');
    });

    it('should not resume when not in paused state', () => {
      gameState.resume();
      expect(gameState.phase).toBe('idle');
    });
  });

  describe('점수 관리', () => {
    it('should start with score 0', () => {
      expect(gameState.score).toBe(0);
    });

    it('should add score correctly', () => {
      gameState.addScore(100);
      expect(gameState.score).toBe(100);

      gameState.addScore(50);
      expect(gameState.score).toBe(150);
    });

    it('should not add negative score', () => {
      gameState.addScore(-50);
      expect(gameState.score).toBe(0);
    });

    it('should reset score to 0', () => {
      gameState.addScore(100);
      gameState.resetScore();
      expect(gameState.score).toBe(0);
    });
  });

  describe('이동 횟수 관리', () => {
    it('should start with 0 moves', () => {
      expect(gameState.moves).toBe(0);
    });

    it('should increment moves', () => {
      gameState.incrementMoves();
      expect(gameState.moves).toBe(1);

      gameState.incrementMoves();
      expect(gameState.moves).toBe(2);
    });

    it('should reset moves to 0', () => {
      gameState.incrementMoves();
      gameState.incrementMoves();
      gameState.resetMoves();
      expect(gameState.moves).toBe(0);
    });
  });

  describe('콤보 관리', () => {
    it('should start with 0 combo', () => {
      expect(gameState.comboCount).toBe(0);
    });

    it('should increment combo', () => {
      gameState.incrementCombo();
      expect(gameState.comboCount).toBe(1);

      gameState.incrementCombo();
      expect(gameState.comboCount).toBe(2);
    });

    it('should reset combo to 0', () => {
      gameState.incrementCombo();
      gameState.incrementCombo();
      gameState.resetCombo();
      expect(gameState.comboCount).toBe(0);
    });
  });

  describe('상태 직렬화', () => {
    it('should serialize to data object', () => {
      gameState.start();
      gameState.addScore(500);
      gameState.incrementMoves();
      gameState.incrementMoves();

      const data = gameState.toData();

      expect(data.phase).toBe('playing');
      expect(data.score).toBe(500);
      expect(data.moves).toBe(2);
      expect(data.timestamp).toBeGreaterThan(0);
    });

    it('should restore from data object', () => {
      const savedData = {
        phase: 'paused' as const,
        score: 1000,
        moves: 10,
        grid: [],
        timestamp: Date.now(),
      };

      gameState.fromData(savedData);

      expect(gameState.phase).toBe('paused');
      expect(gameState.score).toBe(1000);
      expect(gameState.moves).toBe(10);
    });
  });

  describe('게임 초기화', () => {
    it('should reset all state on reset', () => {
      gameState.start();
      gameState.addScore(500);
      gameState.incrementMoves();
      gameState.incrementCombo();

      gameState.reset();

      expect(gameState.phase).toBe('idle');
      expect(gameState.score).toBe(0);
      expect(gameState.moves).toBe(0);
      expect(gameState.comboCount).toBe(0);
    });

    it('should reset score and moves on start', () => {
      gameState.addScore(100);
      gameState.incrementMoves();

      gameState.start();

      expect(gameState.score).toBe(0);
      expect(gameState.moves).toBe(0);
      expect(gameState.phase).toBe('playing');
    });
  });
});
