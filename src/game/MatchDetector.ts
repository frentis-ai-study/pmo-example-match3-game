import type { BlockType, Position, MatchResult } from '../types';
import Logger from '../utils/Logger';

/**
 * MatchDetector
 * 그리드에서 3개 이상 연속된 같은 타입의 블록을 감지합니다.
 */
export class MatchDetector {
  /**
   * 그리드에서 모든 매칭 찾기
   */
  findMatches(grid: (BlockType | null)[][]): MatchResult[] {
    const matches: MatchResult[] = [];
    const rows = grid.length;
    const cols = grid[0]?.length || 0;

    if (rows === 0 || cols === 0) {
      return matches;
    }

    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

    // 수평 매칭 찾기
    for (let row = 0; row < rows; row++) {
      let matchStart = 0;
      for (let col = 1; col <= cols; col++) {
        const current = col < cols ? grid[row][col] : null;
        const previous = grid[row][col - 1];

        // 다른 블록이거나 끝에 도달
        if (current !== previous || col === cols) {
          const matchLength = col - matchStart;
          if (matchLength >= 3 && previous !== null) {
            // 3개 이상 매칭 발견
            const matchBlocks: Position[] = [];
            for (let i = matchStart; i < col; i++) {
              matchBlocks.push({ row, col: i });
              visited[row][i] = true;
            }
            matches.push({
              blocks: matchBlocks,
              score: 0, // ScoreCalculator에서 계산
              isCombo: false,
            });
          }
          matchStart = col;
        }
      }
    }

    // 수직 매칭 찾기
    for (let col = 0; col < cols; col++) {
      let matchStart = 0;
      for (let row = 1; row <= rows; row++) {
        const current = row < rows ? grid[row][col] : null;
        const previous = grid[row - 1][col];

        // 다른 블록이거나 끝에 도달
        if (current !== previous || row === rows) {
          const matchLength = row - matchStart;
          if (matchLength >= 3 && previous !== null) {
            // 3개 이상 매칭 발견
            const matchBlocks: Position[] = [];
            for (let i = matchStart; i < row; i++) {
              // 이미 수평 매칭에 포함되지 않은 경우만 추가
              if (!visited[i][col]) {
                matchBlocks.push({ row: i, col });
              }
            }

            // 새로운 블록이 있으면 매칭 추가
            if (matchBlocks.length >= 3) {
              matches.push({
                blocks: matchBlocks,
                score: 0,
                isCombo: false,
              });
            }
          }
          matchStart = row;
        }
      }
    }

    if (matches.length > 0) {
      Logger.debug(`Found ${matches.length} matches`, {
        totalBlocks: matches.reduce((sum, m) => sum + m.blocks.length, 0),
      });
    }

    return matches;
  }

  /**
   * 특정 위치들이 매칭을 형성하는지 확인
   */
  isMatch(grid: (BlockType | null)[][], positions: Position[]): boolean {
    if (positions.length < 3) {
      return false;
    }

    // 모든 블록이 같은 타입인지 확인
    const firstType = grid[positions[0].row][positions[0].col];
    if (!firstType) {
      return false;
    }

    return positions.every((pos) => grid[pos.row][pos.col] === firstType);
  }

  /**
   * 두 블록을 교환했을 때 매칭이 발생하는지 확인
   */
  wouldCreateMatch(
    grid: (BlockType | null)[][],
    pos1: Position,
    pos2: Position
  ): boolean {
    // 임시 그리드 복사
    const tempGrid = grid.map((row) => [...row]);

    // 블록 교환
    const temp = tempGrid[pos1.row][pos1.col];
    tempGrid[pos1.row][pos1.col] = tempGrid[pos2.row][pos2.col];
    tempGrid[pos2.row][pos2.col] = temp;

    // 매칭 확인
    const matches = this.findMatches(tempGrid);
    return matches.length > 0;
  }

  /**
   * 그리드에 매칭이 하나라도 있는지 확인
   */
  hasMatches(grid: (BlockType | null)[][]): boolean {
    return this.findMatches(grid).length > 0;
  }
}
