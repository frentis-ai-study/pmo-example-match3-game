import type { GamePhase, GameStateData, BlockType } from '../types';
import Logger from '../utils/Logger';
import EventBus from '../utils/EventBus';

/**
 * GameState 클래스
 * 게임의 전체 상태를 관리합니다 (점수, 페이즈, 이동 횟수 등)
 */
export class GameState {
  private _phase: GamePhase = 'idle';
  private _score: number = 0;
  private _moves: number = 0;
  private _comboCount: number = 0;
  private _grid: (BlockType | null)[][] = [];

  constructor() {
    Logger.info('GameState initialized');
  }

  /**
   * 현재 게임 페이즈
   */
  get phase(): GamePhase {
    return this._phase;
  }

  /**
   * 게임 페이즈 설정
   */
  setPhase(newPhase: GamePhase): void {
    const oldPhase = this._phase;
    this._phase = newPhase;

    Logger.info(`Game phase changed: ${oldPhase} → ${newPhase}`);

    // 이벤트 발행
    switch (newPhase) {
      case 'playing':
        EventBus.emit({ type: 'gameStarted' });
        break;
      case 'paused':
        EventBus.emit({ type: 'gamePaused' });
        break;
      case 'gameover':
        EventBus.emit({ type: 'gameOver', finalScore: this._score });
        break;
    }
  }

  /**
   * 현재 점수
   */
  get score(): number {
    return this._score;
  }

  /**
   * 점수 추가
   */
  addScore(points: number): void {
    if (points <= 0) return;

    this._score += points;
    Logger.debug(`Score updated: +${points} → ${this._score}`);

    EventBus.emit({ type: 'scoreUpdated', score: this._score });
  }

  /**
   * 점수 초기화
   */
  resetScore(): void {
    this._score = 0;
    EventBus.emit({ type: 'scoreUpdated', score: 0 });
  }

  /**
   * 이동 횟수
   */
  get moves(): number {
    return this._moves;
  }

  /**
   * 이동 횟수 증가
   */
  incrementMoves(): void {
    this._moves++;
    Logger.debug(`Moves: ${this._moves}`);
  }

  /**
   * 이동 횟수 초기화
   */
  resetMoves(): void {
    this._moves = 0;
  }

  /**
   * 콤보 카운트
   */
  get comboCount(): number {
    return this._comboCount;
  }

  /**
   * 콤보 카운트 증가
   */
  incrementCombo(): void {
    this._comboCount++;
    Logger.debug(`Combo: ${this._comboCount}x`);

    EventBus.emit({ type: 'comboDetected', comboCount: this._comboCount });
  }

  /**
   * 콤보 카운트 초기화
   */
  resetCombo(): void {
    if (this._comboCount > 0) {
      Logger.debug(`Combo ended at ${this._comboCount}x`);
    }
    this._comboCount = 0;
  }

  /**
   * 그리드 상태 저장 (저장/복구용)
   */
  setGridState(grid: (BlockType | null)[][]): void {
    this._grid = grid.map((row) => [...row]);
  }

  /**
   * 저장된 그리드 상태 가져오기
   */
  getGridState(): (BlockType | null)[][] {
    return this._grid.map((row) => [...row]);
  }

  /**
   * 게임 일시정지
   */
  pause(): void {
    if (this._phase === 'playing') {
      this.setPhase('paused');
    }
  }

  /**
   * 게임 재개
   */
  resume(): void {
    if (this._phase === 'paused') {
      this.setPhase('playing');
      EventBus.emit({ type: 'gameResumed' });
    }
  }

  /**
   * 게임 시작
   */
  start(): void {
    this._phase = 'playing';
    this._score = 0;
    this._moves = 0;
    this._comboCount = 0;

    Logger.info('Game started');
    EventBus.emit({ type: 'gameStarted' });
  }

  /**
   * 게임 오버
   */
  gameOver(): void {
    this.setPhase('gameover');
    Logger.info(`Game over! Final score: ${this._score}, Moves: ${this._moves}`);
  }

  /**
   * 게임 상태를 데이터 객체로 직렬화
   */
  toData(): GameStateData {
    return {
      phase: this._phase,
      score: this._score,
      moves: this._moves,
      grid: this._grid.map((row) => [...row]),
      timestamp: Date.now(),
    };
  }

  /**
   * 데이터 객체에서 게임 상태 복원
   */
  fromData(data: GameStateData): void {
    this._phase = data.phase;
    this._score = data.score;
    this._moves = data.moves;
    this._grid = data.grid.map((row) => [...row]);

    Logger.info('Game state restored from data', {
      phase: data.phase,
      score: data.score,
      moves: data.moves,
    });
  }

  /**
   * 게임 상태 초기화
   */
  reset(): void {
    this._phase = 'idle';
    this._score = 0;
    this._moves = 0;
    this._comboCount = 0;
    this._grid = [];

    Logger.info('Game state reset');
  }
}
