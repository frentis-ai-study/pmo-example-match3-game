import type { BlockType, Position, GridConfig } from '../types';
import { DEFAULT_GAME_CONFIG } from '../types';
import Logger from '../utils/Logger';

/**
 * Grid 클래스
 * 8x8 그리드를 관리하고, 블록 배치/교환/제거/중력/생성 로직을 담당합니다.
 */
export class Grid {
  private blocks: (BlockType | null)[][];
  private rows: number;
  private cols: number;
  private availableTypes: BlockType[];

  constructor(config: GridConfig = DEFAULT_GAME_CONFIG.grid) {
    this.rows = config.rows;
    this.cols = config.cols;
    this.availableTypes = config.blockTypes;
    this.blocks = [];

    this.initialize();
    Logger.info(`Grid initialized: ${this.rows}x${this.cols}`, {
      types: this.availableTypes.length,
    });
  }

  /**
   * 그리드 초기화 (초기 매칭이 없도록)
   */
  private initialize(): void {
    this.blocks = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.blocks[row][col] = this.getRandomBlockTypeAvoidingMatches(row, col);
      }
    }
  }

  /**
   * 랜덤 블록 타입 생성 (즉시 매칭 방지)
   */
  private getRandomBlockTypeAvoidingMatches(row: number, col: number): BlockType {
    const forbidden: Set<BlockType> = new Set();

    // 수평 체크: 왼쪽 2개가 같으면 금지
    if (col >= 2) {
      const left1 = this.blocks[row][col - 1];
      const left2 = this.blocks[row][col - 2];
      if (left1 && left2 && left1 === left2) {
        forbidden.add(left1);
      }
    }

    // 수직 체크: 위쪽 2개가 같으면 금지
    if (row >= 2) {
      const above1 = this.blocks[row - 1][col];
      const above2 = this.blocks[row - 2][col];
      if (above1 && above2 && above1 === above2) {
        forbidden.add(above1);
      }
    }

    // 금지되지 않은 타입 중 랜덤 선택
    const allowed = this.availableTypes.filter((type) => !forbidden.has(type));
    const randomIndex = Math.floor(Math.random() * allowed.length);
    return allowed[randomIndex];
  }

  /**
   * 행 수 반환
   */
  getRows(): number {
    return this.rows;
  }

  /**
   * 열 수 반환
   */
  getCols(): number {
    return this.cols;
  }

  /**
   * 특정 위치의 블록 가져오기
   */
  getBlock(pos: Position): BlockType | null {
    if (!this.isValidPosition(pos)) {
      return null;
    }
    return this.blocks[pos.row][pos.col];
  }

  /**
   * 특정 위치에 블록 설정 (테스트용)
   */
  setBlock(pos: Position, type: BlockType | null): void {
    if (!this.isValidPosition(pos)) {
      Logger.warn(`Invalid position for setBlock: ${JSON.stringify(pos)}`);
      return;
    }
    this.blocks[pos.row][pos.col] = type;
  }

  /**
   * 전체 그리드 블록 배열 반환
   */
  getAllBlocks(): (BlockType | null)[][] {
    return this.blocks.map((row) => [...row]);
  }

  /**
   * 전체 그리드 상태 설정 (저장된 게임 복구용)
   */
  setGridState(grid: (BlockType | null)[][]): void {
    if (grid.length !== this.rows || grid[0]?.length !== this.cols) {
      Logger.warn('Grid size mismatch, cannot restore state');
      return;
    }

    this.blocks = grid.map((row) => [...row]);
    Logger.info('Grid state restored');
  }

  /**
   * 위치가 유효한지 확인
   */
  private isValidPosition(pos: Position): boolean {
    return pos.row >= 0 && pos.row < this.rows && pos.col >= 0 && pos.col < this.cols;
  }

  /**
   * 두 위치가 인접한지 확인
   */
  private isAdjacent(pos1: Position, pos2: Position): boolean {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);

    return (rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 0);
  }

  /**
   * 두 블록 교환 (T021)
   */
  swapBlocks(pos1: Position, pos2: Position): boolean {
    if (!this.isValidPosition(pos1) || !this.isValidPosition(pos2)) {
      Logger.warn('Invalid positions for swap', { pos1, pos2 });
      return false;
    }

    if (!this.isAdjacent(pos1, pos2)) {
      Logger.warn('Blocks are not adjacent', { pos1, pos2 });
      return false;
    }

    // 교환
    const temp = this.blocks[pos1.row][pos1.col];
    this.blocks[pos1.row][pos1.col] = this.blocks[pos2.row][pos2.col];
    this.blocks[pos2.row][pos2.col] = temp;

    Logger.debug(`Swapped blocks: ${JSON.stringify(pos1)} ↔ ${JSON.stringify(pos2)}`);
    return true;
  }

  /**
   * 블록 제거 (T024)
   */
  removeBlocks(positions: Position[]): void {
    if (positions.length === 0) {
      return;
    }

    positions.forEach((pos) => {
      if (this.isValidPosition(pos)) {
        this.blocks[pos.row][pos.col] = null;
      }
    });

    Logger.debug(`Removed ${positions.length} blocks`);
  }

  /**
   * 중력 효과 적용 (T025)
   * 빈 공간 위의 블록들을 아래로 이동
   */
  applyGravity(): Position[] {
    const movedBlocks: Position[] = [];

    for (let col = 0; col < this.cols; col++) {
      // 각 열을 아래에서 위로 스캔
      let writeRow = this.rows - 1; // 쓰기 위치 (아래에서 시작)

      for (let readRow = this.rows - 1; readRow >= 0; readRow--) {
        const block = this.blocks[readRow][col];
        if (block !== null) {
          if (readRow !== writeRow) {
            // 블록 이동
            this.blocks[writeRow][col] = block;
            this.blocks[readRow][col] = null;
            movedBlocks.push({ row: readRow, col });
          }
          writeRow--;
        }
      }
    }

    if (movedBlocks.length > 0) {
      Logger.debug(`Gravity applied: ${movedBlocks.length} blocks moved`);
    }

    return movedBlocks;
  }

  /**
   * 빈 공간을 새 블록으로 채우기 (T026)
   */
  fillEmptySpaces(): Position[] {
    const newBlocks: Position[] = [];

    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (this.blocks[row][col] === null) {
          // 새 블록 생성 (즉시 매칭 방지)
          this.blocks[row][col] = this.getRandomBlockTypeAvoidingMatches(row, col);
          newBlocks.push({ row, col });
        }
      }
    }

    if (newBlocks.length > 0) {
      Logger.debug(`Filled ${newBlocks.length} empty spaces`);
    }

    return newBlocks;
  }

  /**
   * 유효한 이동이 있는지 확인 (게임 오버 체크용)
   * 모든 가능한 교환을 시뮬레이션하여 매칭 가능 여부 확인
   */
  hasValidMoves(): boolean {
    // 간단한 구현: 모든 인접 블록 쌍을 교환해보고 매칭 확인
    // 실제로는 MatchDetector와 연동 필요
    // 지금은 항상 true 반환 (추후 MatchDetector 구현 후 개선)
    return true;
  }

  /**
   * 그리드 상태를 문자열로 출력 (디버깅용)
   */
  toString(): string {
    const rows = this.blocks.map((row) =>
      row.map((block) => (block ? block.charAt(0).toUpperCase() : '·')).join(' ')
    );
    return rows.join('\n');
  }

  /**
   * 그리드 초기화 (재시작용)
   */
  reset(): void {
    this.initialize();
    Logger.info('Grid reset');
  }
}
