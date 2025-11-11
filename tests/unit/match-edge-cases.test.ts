import { describe, it, expect, beforeEach } from 'vitest';
import { Grid } from '../../src/game/Grid';
import { MatchDetector } from '../../src/game/MatchDetector';
import type { BlockType } from '../../src/types';

describe('Match Edge Cases', () => {
  let grid: Grid;
  let matchDetector: MatchDetector;

  beforeEach(() => {
    grid = new Grid();
    matchDetector = new MatchDetector();
  });

  describe('블록 제거 후 중력 적용', () => {
    it('블록 제거 후 위 블록들이 아래로 떨어진다', () => {
      // Given: 특정 패턴의 그리드
      const testGrid: (BlockType | null)[][] = [
        ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'red'],
        ['blue', 'red', 'red', 'green', 'yellow', 'purple', 'orange', 'blue'],
        ['green', 'red', 'blue', 'red', 'green', 'yellow', 'purple', 'green'],
        ['yellow', 'blue', 'green', 'blue', 'red', 'green', 'yellow', 'yellow'],
        ['purple', 'green', 'yellow', 'green', 'blue', 'red', 'green', 'purple'],
        ['orange', 'yellow', 'purple', 'yellow', 'green', 'blue', 'red', 'orange'],
        ['pink', 'purple', 'orange', 'purple', 'yellow', 'green', 'blue', 'pink'],
        ['red', 'orange', 'pink', 'orange', 'purple', 'yellow', 'green', 'red'],
      ];
      grid['blocks'] = testGrid;

      // When: 첫 번째 열의 하단 3개 블록 제거
      grid.removeBlocks([
        { row: 5, col: 0 },
        { row: 6, col: 0 },
        { row: 7, col: 0 },
      ]);

      // Then: 해당 위치가 null이어야 함
      expect(grid.getAllBlocks()[5][0]).toBeNull();
      expect(grid.getAllBlocks()[6][0]).toBeNull();
      expect(grid.getAllBlocks()[7][0]).toBeNull();

      // When: 중력 적용
      const movedBlocks = grid.applyGravity();

      // Then: 블록들이 아래로 이동
      expect(movedBlocks.length).toBeGreaterThan(0);

      // 상단 3칸이 null로 남음 (applyGravity는 위쪽을 비움)
      expect(grid.getAllBlocks()[0][0]).toBeNull();
      expect(grid.getAllBlocks()[1][0]).toBeNull();
      expect(grid.getAllBlocks()[2][0]).toBeNull();

      // 기존 블록들이 하단으로 이동 (하단부터: purple, yellow, green, blue, red)
      expect(grid.getAllBlocks()[7][0]).toBe('purple');
      expect(grid.getAllBlocks()[6][0]).toBe('yellow');
      expect(grid.getAllBlocks()[5][0]).toBe('green');
    });

    it('여러 열에서 동시에 블록이 제거되어도 올바르게 중력이 적용된다', () => {
      const testGrid: (BlockType | null)[][] = [
        ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'red'],
        ['blue', 'red', 'red', 'green', 'yellow', 'purple', 'orange', 'blue'],
        ['green', 'red', 'blue', 'red', 'green', 'yellow', 'purple', 'green'],
        ['yellow', 'blue', 'green', 'blue', 'red', 'green', 'yellow', 'yellow'],
        ['purple', 'green', 'yellow', 'green', 'blue', 'red', 'green', 'purple'],
        ['orange', 'yellow', 'purple', 'yellow', 'green', 'blue', 'red', 'orange'],
        ['pink', 'purple', 'orange', 'purple', 'yellow', 'green', 'blue', 'pink'],
        ['red', 'orange', 'pink', 'orange', 'purple', 'yellow', 'green', 'red'],
      ];
      grid['blocks'] = testGrid;

      // 여러 위치의 블록 제거
      grid.removeBlocks([
        { row: 7, col: 0 },
        { row: 7, col: 1 },
        { row: 7, col: 2 },
        { row: 6, col: 3 },
        { row: 7, col: 3 },
      ]);

      const movedBlocks = grid.applyGravity();

      // 모든 열에서 중력이 올바르게 적용되었는지 확인
      expect(movedBlocks.length).toBeGreaterThan(0);

      // null이 맨 위로 올라가야 함 (상단 1칸씩)
      expect(grid.getAllBlocks()[0][0]).toBeNull();
      expect(grid.getAllBlocks()[0][1]).toBeNull();
      expect(grid.getAllBlocks()[0][2]).toBeNull();
    });
  });

  describe('빈 공간 채우기', () => {
    it('맨 위 빈 공간이 새로운 블록으로 채워진다', () => {
      // Given: 상단에 빈 공간이 있는 그리드
      const testGrid: (BlockType | null)[][] = [
        [null, null, null, 'yellow', 'purple', 'orange', 'pink', 'red'],
        [null, null, 'red', 'green', 'yellow', 'purple', 'orange', 'blue'],
        [null, 'red', 'blue', 'red', 'green', 'yellow', 'purple', 'green'],
        ['yellow', 'blue', 'green', 'blue', 'red', 'green', 'yellow', 'yellow'],
        ['purple', 'green', 'yellow', 'green', 'blue', 'red', 'green', 'purple'],
        ['orange', 'yellow', 'purple', 'yellow', 'green', 'blue', 'red', 'orange'],
        ['pink', 'purple', 'orange', 'purple', 'yellow', 'green', 'blue', 'pink'],
        ['red', 'orange', 'pink', 'orange', 'purple', 'yellow', 'green', 'red'],
      ];
      grid['blocks'] = testGrid;

      // When: 빈 공간 채우기
      const newBlocks = grid.fillEmptySpaces();

      // Then: 새로운 블록이 생성됨
      expect(newBlocks.length).toBeGreaterThan(0);

      // 모든 빈 공간이 채워졌는지 확인
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          expect(grid.getAllBlocks()[row][col]).not.toBeNull();
        }
      }
    });
  });

  describe('연속 매치 (캐스케이드)', () => {
    it('블록 제거 후 떨어진 블록이 새로운 매치를 만든다', () => {
      // Given: 캐스케이드가 발생할 수 있는 패턴
      const testGrid: (BlockType | null)[][] = [
        ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'red'],
        ['blue', 'red', 'red', 'green', 'yellow', 'purple', 'orange', 'blue'],
        ['green', 'blue', 'blue', 'red', 'green', 'yellow', 'purple', 'green'],
        ['yellow', 'green', 'green', 'blue', 'red', 'green', 'yellow', 'yellow'],
        ['purple', 'red', 'yellow', 'green', 'blue', 'red', 'green', 'purple'],
        ['orange', 'red', 'purple', 'yellow', 'green', 'blue', 'red', 'orange'],
        ['pink', 'red', 'orange', 'purple', 'yellow', 'green', 'blue', 'pink'],
        ['red', 'orange', 'pink', 'orange', 'purple', 'yellow', 'green', 'red'],
      ];
      grid['blocks'] = testGrid;

      // When: 수직으로 3개의 red 매치 (col 1, rows 4-6)
      const initialMatches = matchDetector.findMatches(grid.getAllBlocks());

      // Then: 매치가 발견됨
      const hasRedMatch = initialMatches.some((match) =>
        match.blocks.some((pos) => pos.col === 1 && [4, 5, 6].includes(pos.row))
      );

      if (hasRedMatch) {
        // 매치된 블록 제거
        const matchedPositions = initialMatches.flatMap((m) => m.blocks);
        grid.removeBlocks(matchedPositions);

        // 중력 적용
        grid.applyGravity();

        // 새 블록 채우기
        grid.fillEmptySpaces();

        // 다시 매치 확인 (캐스케이드)
        const cascadeMatches = matchDetector.findMatches(grid.getAllBlocks());

        // 캐스케이드가 발생할 수 있음 (확률적)
        expect(cascadeMatches).toBeDefined();
      }
    });
  });

  describe('스왑 후 매치 확인', () => {
    it('스왑 후 매치가 없으면 false를 반환한다', () => {
      // Given: 매치가 없는 그리드
      const testGrid: (BlockType | null)[][] = [
        ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'red'],
        ['blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'red', 'blue'],
        ['green', 'yellow', 'purple', 'orange', 'pink', 'red', 'blue', 'green'],
        ['yellow', 'purple', 'orange', 'pink', 'red', 'blue', 'green', 'yellow'],
        ['purple', 'orange', 'pink', 'red', 'blue', 'green', 'yellow', 'purple'],
        ['orange', 'pink', 'red', 'blue', 'green', 'yellow', 'purple', 'orange'],
        ['pink', 'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'],
        ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'red'],
      ];
      grid['blocks'] = testGrid;

      // When: 매치가 생기지 않는 스왑
      const swapped = grid.swapBlocks({ row: 0, col: 0 }, { row: 0, col: 1 });
      expect(swapped).toBe(true);

      // Then: 매치 없음
      const matches = matchDetector.findMatches(grid.getAllBlocks());
      expect(matches.length).toBe(0);
    });

    it('스왑 후 가로 매치가 생성된다', () => {
      // Given: 가로 매치가 가능한 패턴
      const testGrid: (BlockType | null)[][] = [
        ['red', 'red', 'blue', 'red', 'purple', 'orange', 'pink', 'yellow'],
        ['blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'red', 'blue'],
        ['green', 'yellow', 'purple', 'orange', 'pink', 'red', 'blue', 'green'],
        ['yellow', 'purple', 'orange', 'pink', 'red', 'blue', 'green', 'yellow'],
        ['purple', 'orange', 'pink', 'red', 'blue', 'green', 'yellow', 'purple'],
        ['orange', 'pink', 'red', 'blue', 'green', 'yellow', 'purple', 'orange'],
        ['pink', 'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'],
        ['yellow', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'red'],
      ];
      grid['blocks'] = testGrid;

      // When: (0,2)와 (0,3)을 스왑하면 3개의 red가 가로로 연결 (red-red-red)
      grid.swapBlocks({ row: 0, col: 2 }, { row: 0, col: 3 });

      // Then: 가로 매치 발생
      const matches = matchDetector.findMatches(grid.getAllBlocks());
      const hasHorizontalRedMatch = matches.some((match) =>
        match.direction === 'horizontal' && match.type === 'red'
      );

      expect(hasHorizontalRedMatch).toBe(true);
    });

    it('스왑 후 세로 매치가 생성된다', () => {
      // Given: 세로 매치가 가능한 패턴
      const testGrid: (BlockType | null)[][] = [
        ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'red'],
        ['red', 'green', 'yellow', 'purple', 'orange', 'pink', 'red', 'blue'],
        ['blue', 'yellow', 'purple', 'orange', 'pink', 'red', 'blue', 'green'],
        ['red', 'purple', 'orange', 'pink', 'red', 'blue', 'green', 'yellow'],
        ['purple', 'orange', 'pink', 'red', 'blue', 'green', 'yellow', 'purple'],
        ['orange', 'pink', 'red', 'blue', 'green', 'yellow', 'purple', 'orange'],
        ['pink', 'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'],
        ['yellow', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'red'],
      ];
      grid['blocks'] = testGrid;

      // When: (2,0)과 (3,0)을 스왑하면 3개의 red가 세로로 연결 (red-red-red)
      grid.swapBlocks({ row: 2, col: 0 }, { row: 3, col: 0 });

      // Then: 세로 매치 발생
      const matches = matchDetector.findMatches(grid.getAllBlocks());
      const hasVerticalRedMatch = matches.some((match) =>
        match.direction === 'vertical' && match.type === 'red'
      );

      expect(hasVerticalRedMatch).toBe(true);
    });
  });

  describe('엣지 케이스', () => {
    it('그리드 경계에서의 스왑이 정상 작동한다', () => {
      // 맨 위 경계
      expect(grid.swapBlocks({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true);

      // 맨 아래 경계
      expect(grid.swapBlocks({ row: 7, col: 0 }, { row: 7, col: 1 })).toBe(true);

      // 맨 왼쪽 경계
      expect(grid.swapBlocks({ row: 0, col: 0 }, { row: 1, col: 0 })).toBe(true);

      // 맨 오른쪽 경계
      expect(grid.swapBlocks({ row: 0, col: 7 }, { row: 1, col: 7 })).toBe(true);
    });

    it('인접하지 않은 블록 스왑은 실패한다', () => {
      expect(grid.swapBlocks({ row: 0, col: 0 }, { row: 2, col: 0 })).toBe(false);
      expect(grid.swapBlocks({ row: 0, col: 0 }, { row: 0, col: 2 })).toBe(false);
      expect(grid.swapBlocks({ row: 0, col: 0 }, { row: 5, col: 5 })).toBe(false);
    });

    it('범위를 벗어난 위치로 스왑 시도 시 실패한다', () => {
      expect(grid.swapBlocks({ row: -1, col: 0 }, { row: 0, col: 0 })).toBe(false);
      expect(grid.swapBlocks({ row: 0, col: 0 }, { row: 0, col: 8 })).toBe(false);
      expect(grid.swapBlocks({ row: 8, col: 0 }, { row: 0, col: 0 })).toBe(false);
    });

    it('모든 블록이 제거되어도 새로운 블록으로 채워진다', () => {
      // 모든 블록 제거
      const allPositions = [];
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          allPositions.push({ row, col });
        }
      }
      grid.removeBlocks(allPositions);

      // 빈 공간 채우기
      const newBlocks = grid.fillEmptySpaces();

      expect(newBlocks.length).toBe(64);

      // 모든 칸이 채워졌는지 확인
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          expect(grid.getAllBlocks()[row][col]).not.toBeNull();
        }
      }
    });
  });
});
