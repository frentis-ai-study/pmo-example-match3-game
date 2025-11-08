import { describe, it, expect, beforeEach } from 'vitest';
import type { BlockType, Position } from '../../src/types';

// Grid는 아직 구현되지 않았으므로 테스트가 실패할 것입니다

describe('Grid', () => {
  // TODO: Grid 구현 후 import 추가
  // import { Grid } from '../../src/game/Grid';

  // let grid: Grid;

  beforeEach(() => {
    // grid = new Grid(8, 8);
  });

  describe('초기화', () => {
    it.skip('should create 8x8 grid with random blocks', () => {
      // expect(grid.getRows()).toBe(8);
      // expect(grid.getCols()).toBe(8);

      // const blocks = grid.getAllBlocks();
      // expect(blocks).toHaveLength(8);
      // expect(blocks[0]).toHaveLength(8);
    });

    it.skip('should not have initial matches after creation', () => {
      // 초기 그리드는 3개 이상 연속된 블록이 없어야 함
      // const blocks = grid.getAllBlocks();

      // 수평 체크
      // for (let row = 0; row < 8; row++) {
      //   for (let col = 0; col < 6; col++) {
      //     const current = blocks[row][col];
      //     const next1 = blocks[row][col + 1];
      //     const next2 = blocks[row][col + 2];
      //     expect(current === next1 && next1 === next2).toBe(false);
      //   }
      // }

      // 수직 체크
      // for (let col = 0; col < 8; col++) {
      //   for (let row = 0; row < 6; row++) {
      //     const current = blocks[row][col];
      //     const next1 = blocks[row + 1][col];
      //     const next2 = blocks[row + 2][col];
      //     expect(current === next1 && next1 === next2).toBe(false);
      //   }
      // }
    });

    it.skip('should use all available block types', () => {
      // const blocks = grid.getAllBlocks();
      // const uniqueTypes = new Set<BlockType>();

      // blocks.forEach(row => {
      //   row.forEach(block => {
      //     if (block) uniqueTypes.add(block);
      //   });
      // });

      // 최소 5가지 블록 타입 사용
      // expect(uniqueTypes.size).toBeGreaterThanOrEqual(5);
    });
  });

  describe('블록 교환 (swapBlocks)', () => {
    it.skip('should swap two adjacent blocks horizontally', () => {
      // const pos1: Position = { row: 0, col: 0 };
      // const pos2: Position = { row: 0, col: 1 };

      // const block1 = grid.getBlock(pos1);
      // const block2 = grid.getBlock(pos2);

      // grid.swapBlocks(pos1, pos2);

      // expect(grid.getBlock(pos1)).toBe(block2);
      // expect(grid.getBlock(pos2)).toBe(block1);
    });

    it.skip('should swap two adjacent blocks vertically', () => {
      // const pos1: Position = { row: 0, col: 0 };
      // const pos2: Position = { row: 1, col: 0 };

      // const block1 = grid.getBlock(pos1);
      // const block2 = grid.getBlock(pos2);

      // grid.swapBlocks(pos1, pos2);

      // expect(grid.getBlock(pos1)).toBe(block2);
      // expect(grid.getBlock(pos2)).toBe(block1);
    });

    it.skip('should return false when swapping non-adjacent blocks', () => {
      // const pos1: Position = { row: 0, col: 0 };
      // const pos2: Position = { row: 2, col: 2 };

      // const result = grid.swapBlocks(pos1, pos2);

      // expect(result).toBe(false);
    });

    it.skip('should return false for out-of-bounds positions', () => {
      // const pos1: Position = { row: 0, col: 0 };
      // const pos2: Position = { row: -1, col: 0 };

      // const result = grid.swapBlocks(pos1, pos2);

      // expect(result).toBe(false);
    });
  });

  describe('블록 제거 (removeBlocks)', () => {
    it.skip('should remove blocks at specified positions', () => {
      // const positions: Position[] = [
      //   { row: 0, col: 0 },
      //   { row: 0, col: 1 },
      //   { row: 0, col: 2 },
      // ];

      // grid.removeBlocks(positions);

      // expect(grid.getBlock({ row: 0, col: 0 })).toBeNull();
      // expect(grid.getBlock({ row: 0, col: 1 })).toBeNull();
      // expect(grid.getBlock({ row: 0, col: 2 })).toBeNull();
    });

    it.skip('should handle empty positions array', () => {
      // const positions: Position[] = [];

      // expect(() => grid.removeBlocks(positions)).not.toThrow();
    });
  });

  describe('중력 효과 (applyGravity)', () => {
    it.skip('should make blocks fall down to fill empty spaces', () => {
      // 블록 제거 후 중력 적용 테스트
      // const positions: Position[] = [
      //   { row: 7, col: 0 }, // 맨 아래 블록 제거
      // ];

      // const blockAbove = grid.getBlock({ row: 6, col: 0 });
      // grid.removeBlocks(positions);
      // grid.applyGravity();

      // expect(grid.getBlock({ row: 7, col: 0 })).toBe(blockAbove);
      // expect(grid.getBlock({ row: 6, col: 0 })).toBeNull();
    });

    it.skip('should handle multiple empty spaces in a column', () => {
      // 열에 여러 빈 공간이 있을 때
      // const positions: Position[] = [
      //   { row: 5, col: 0 },
      //   { row: 6, col: 0 },
      //   { row: 7, col: 0 },
      // ];

      // grid.removeBlocks(positions);
      // const movedBlocks = grid.applyGravity();

      // 3개의 블록이 아래로 이동했어야 함
      // expect(movedBlocks.length).toBeGreaterThan(0);
    });
  });

  describe('새 블록 생성 (fillEmptySpaces)', () => {
    it.skip('should fill empty spaces with new random blocks', () => {
      // 블록 제거 후 빈 공간 채우기
      // const positions: Position[] = [
      //   { row: 0, col: 0 },
      //   { row: 0, col: 1 },
      //   { row: 0, col: 2 },
      // ];

      // grid.removeBlocks(positions);
      // grid.fillEmptySpaces();

      // expect(grid.getBlock({ row: 0, col: 0 })).not.toBeNull();
      // expect(grid.getBlock({ row: 0, col: 1 })).not.toBeNull();
      // expect(grid.getBlock({ row: 0, col: 2 })).not.toBeNull();
    });

    it.skip('should not create initial matches when filling', () => {
      // 새로 생성된 블록이 즉시 매칭되지 않아야 함
      // const positions: Position[] = [
      //   { row: 0, col: 0 },
      //   { row: 0, col: 1 },
      //   { row: 0, col: 2 },
      // ];

      // grid.removeBlocks(positions);
      // grid.fillEmptySpaces();

      // const block0 = grid.getBlock({ row: 0, col: 0 });
      // const block1 = grid.getBlock({ row: 0, col: 1 });
      // const block2 = grid.getBlock({ row: 0, col: 2 });

      // 세 블록이 모두 같지 않아야 함
      // expect(block0 === block1 && block1 === block2).toBe(false);
    });
  });

  describe('유효한 이동 확인 (hasValidMoves)', () => {
    it.skip('should return true when valid moves exist', () => {
      // 일반적인 그리드는 항상 유효한 이동이 있어야 함
      // const hasValidMoves = grid.hasValidMoves();
      // expect(hasValidMoves).toBe(true);
    });

    it.skip('should return false when no valid moves exist', () => {
      // 특수하게 구성된 그리드 (유효한 이동 없음)
      // 이 테스트는 Grid에 setBlock 같은 메서드가 있어야 가능
      // const customGrid = new Grid(8, 8);
      // ... 특수 그리드 구성 ...
      // const hasValidMoves = customGrid.hasValidMoves();
      // expect(hasValidMoves).toBe(false);
    });
  });
});
