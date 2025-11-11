import { Grid } from './Grid';
import { GameState } from './GameState';
import { MatchDetector } from './MatchDetector';
import { ScoreCalculator } from './ScoreCalculator';
import type { Position, BlockType } from '../types';
import Logger from '../utils/Logger';

/**
 * 게임 액션 타입 (렌더링 레이어에 전달)
 */
export type GameAction =
  | { type: 'swap'; from: Position; to: Position }
  | { type: 'revertSwap'; from: Position; to: Position }
  | { type: 'removeBlocks'; positions: Position[] }
  | { type: 'applyGravity'; movements: Array<{ from: Position; to: Position }> }
  | { type: 'fillEmpty'; newBlocks: Array<{ position: Position; blockType: BlockType }> }
  | { type: 'updateScore'; score: number }
  | { type: 'updateMoves'; moves: number }
  | { type: 'combo'; count: number };

/**
 * 스왑 결과
 */
export interface SwapResult {
  success: boolean;
  actions: GameAction[];
  revertNeeded: boolean;
}

/**
 * GameController
 *
 * 게임 로직과 렌더링 레이어 사이의 중간 계층
 * - 로직 실행 후 렌더링 액션 생성
 * - 트랜잭션 방식으로 상태 관리 (성공/실패)
 */
export class GameController {
  private grid: Grid;
  private gameState: GameState;
  private matchDetector: MatchDetector;
  private scoreCalculator: ScoreCalculator;

  constructor() {
    this.grid = new Grid();
    this.gameState = new GameState();
    this.matchDetector = new MatchDetector();
    this.scoreCalculator = new ScoreCalculator();
  }

  /**
   * 게임 시작
   */
  start(): void {
    this.gameState.start();
    Logger.info('GameController started');
  }

  /**
   * 그리드 전체 상태 가져오기
   */
  getGridState(): (BlockType | null)[][] {
    return this.grid.getAllBlocks();
  }

  /**
   * 게임 상태 가져오기
   */
  getGameState() {
    return {
      phase: this.gameState.phase,
      score: this.gameState.score,
      moves: this.gameState.moves,
      comboCount: this.gameState.comboCount,
    };
  }

  /**
   * 블록 스왑 시도 (트랜잭션 방식)
   *
   * 1. 로직 실행 전 상태 백업
   * 2. 스왑 & 매치 확인
   * 3. 매치 없으면 롤백
   * 4. 매치 있으면 캐스케이드 처리
   * 5. 렌더링 액션 리스트 반환
   */
  async trySwap(from: Position, to: Position): Promise<SwapResult> {
    const actions: GameAction[] = [];

    // 1. 스왑 시도
    const swapped = this.grid.swapBlocks(from, to);
    if (!swapped) {
      return { success: false, actions: [], revertNeeded: false };
    }

    actions.push({ type: 'swap', from, to });

    // 2. 매치 확인
    const matches = this.matchDetector.findMatches(this.grid.getAllBlocks());

    if (matches.length === 0) {
      // 3. 매치 없으면 원복
      this.grid.swapBlocks(from, to); // 로직 원복
      actions.push({ type: 'revertSwap', from, to });
      return { success: false, actions, revertNeeded: true };
    }

    // 4. 매치 성공 - 이동 횟수 증가
    this.gameState.incrementMoves();
    actions.push({ type: 'updateMoves', moves: this.gameState.moves });

    // 5. 콤보 리셋
    this.gameState.resetCombo();

    // 6. 캐스케이드 처리
    const cascadeActions = await this.processCascades();
    actions.push(...cascadeActions);

    return { success: true, actions, revertNeeded: false };
  }

  /**
   * 캐스케이드 처리 (연쇄 매치)
   */
  private async processCascades(): Promise<GameAction[]> {
    const actions: GameAction[] = [];
    let comboCount = 0;

    while (true) {
      const matches = this.matchDetector.findMatches(this.grid.getAllBlocks());

      if (matches.length === 0) {
        break;
      }

      const isCombo = comboCount > 0;
      const score = this.scoreCalculator.calculateTotalScore(matches, isCombo, comboCount);

      this.gameState.addScore(score);
      actions.push({ type: 'updateScore', score: this.gameState.score });

      if (isCombo) {
        this.gameState.incrementCombo();
        actions.push({ type: 'combo', count: this.gameState.comboCount });
      }

      // 매치된 블록 위치
      const allMatchedPositions: Position[] = [];
      matches.forEach((match) => {
        allMatchedPositions.push(...match.blocks);
      });

      // 블록 제거
      actions.push({ type: 'removeBlocks', positions: allMatchedPositions });
      this.grid.removeBlocks(allMatchedPositions);

      // 중력 적용
      const movedBlocks = this.grid.applyGravity();
      const movements = movedBlocks.map((from) => {
        // 중력으로 이동한 블록의 새 위치 계산
        const blocks = this.grid.getAllBlocks();

        // from 위치에서 아래로 스캔하여 실제 블록이 이동한 위치 찾기
        let toRow = from.row;
        for (let row = from.row + 1; row < blocks.length; row++) {
          if (blocks[row][from.col] === null) {
            break;
          }
          toRow = row;
        }

        return {
          from,
          to: { row: toRow, col: from.col },
        };
      });

      if (movements.length > 0) {
        actions.push({ type: 'applyGravity', movements });
      }

      // 빈 공간 채우기
      const newBlocks = this.grid.fillEmptySpaces();
      const fillActions = newBlocks.map((position) => ({
        position,
        blockType: this.grid.getAllBlocks()[position.row][position.col]!,
      }));

      if (fillActions.length > 0) {
        actions.push({ type: 'fillEmpty', newBlocks: fillActions });
      }

      comboCount++;
    }

    if (comboCount > 0) {
      this.gameState.resetCombo();
    }

    return actions;
  }

  /**
   * 일시정지
   */
  pause(): void {
    this.gameState.pause();
  }

  /**
   * 재개
   */
  resume(): void {
    this.gameState.resume();
  }

  /**
   * 게임 오버 처리
   */
  gameOver(): void {
    this.gameState.setPhase('gameover');
  }

  /**
   * 그리드 크기
   */
  getGridSize() {
    return {
      rows: this.grid.getRows(),
      cols: this.grid.getCols(),
    };
  }
}
