import { describe, it, expect } from 'vitest';
import type { BlockType, Position } from '../../src/types';

// MatchDetector는 아직 구현되지 않았으므로 테스트가 실패할 것입니다
// 이것이 TDD의 Red-Green-Refactor 사이클입니다

/**
 * 테스트용 그리드 헬퍼
 */
function createTestGrid(rows: BlockType[][]): BlockType[][] {
  return rows;
}

describe('MatchDetector', () => {
  // TODO: MatchDetector 구현 후 import 추가
  // import { MatchDetector } from '../../src/game/MatchDetector';

  it.skip('should detect horizontal match of 3 blocks', () => {
    const grid = createTestGrid([
      ['red', 'red', 'red', 'blue', 'green', 'yellow', 'purple', 'orange'],
      ['blue', 'green', 'yellow', 'purple', 'orange', 'red', 'blue', 'green'],
    ]);

    // const detector = new MatchDetector();
    // const matches = detector.findMatches(grid);

    // expect(matches).toHaveLength(1);
    // expect(matches[0].blocks).toHaveLength(3);
    // expect(matches[0].blocks).toEqual([
    //   { row: 0, col: 0 },
    //   { row: 0, col: 1 },
    //   { row: 0, col: 2 },
    // ]);
  });

  it.skip('should detect vertical match of 3 blocks', () => {
    const grid = createTestGrid([
      ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'red'],
      ['red', 'green', 'yellow', 'purple', 'orange', 'red', 'blue', 'green'],
      ['red', 'yellow', 'purple', 'orange', 'red', 'blue', 'green', 'yellow'],
      ['blue', 'purple', 'orange', 'red', 'blue', 'green', 'yellow', 'purple'],
    ]);

    // const detector = new MatchDetector();
    // const matches = detector.findMatches(grid);

    // expect(matches).toHaveLength(1);
    // expect(matches[0].blocks).toHaveLength(3);
    // expect(matches[0].blocks).toEqual([
    //   { row: 0, col: 0 },
    //   { row: 1, col: 0 },
    //   { row: 2, col: 0 },
    // ]);
  });

  it.skip('should detect match of 4 blocks horizontally', () => {
    const grid = createTestGrid([
      ['red', 'red', 'red', 'red', 'blue', 'green', 'yellow', 'purple'],
    ]);

    // const detector = new MatchDetector();
    // const matches = detector.findMatches(grid);

    // expect(matches).toHaveLength(1);
    // expect(matches[0].blocks).toHaveLength(4);
  });

  it.skip('should detect match of 5 blocks vertically', () => {
    const grid = createTestGrid([
      ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink', 'red'],
      ['blue', 'green', 'yellow', 'purple', 'orange', 'red', 'green', 'yellow'],
      ['blue', 'yellow', 'purple', 'orange', 'red', 'green', 'yellow', 'purple'],
      ['blue', 'purple', 'orange', 'red', 'green', 'yellow', 'purple', 'orange'],
      ['blue', 'orange', 'red', 'green', 'yellow', 'purple', 'orange', 'red'],
    ]);

    // const detector = new MatchDetector();
    // const matches = detector.findMatches(grid);

    // expect(matches).toHaveLength(1);
    // expect(matches[0].blocks).toHaveLength(5);
  });

  it.skip('should detect multiple matches in the same grid', () => {
    const grid = createTestGrid([
      ['red', 'red', 'red', 'blue', 'green', 'yellow', 'purple', 'orange'],
      ['blue', 'green', 'yellow', 'blue', 'blue', 'blue', 'green', 'yellow'],
    ]);

    // const detector = new MatchDetector();
    // const matches = detector.findMatches(grid);

    // expect(matches).toHaveLength(2);
  });

  it.skip('should return empty array when no matches exist', () => {
    const grid = createTestGrid([
      ['red', 'blue', 'red', 'blue', 'red', 'blue', 'red', 'blue'],
      ['blue', 'red', 'blue', 'red', 'blue', 'red', 'blue', 'red'],
    ]);

    // const detector = new MatchDetector();
    // const matches = detector.findMatches(grid);

    // expect(matches).toHaveLength(0);
  });

  it.skip('should detect L-shaped and T-shaped matches as separate matches', () => {
    const grid = createTestGrid([
      ['red', 'red', 'red', 'blue', 'green', 'yellow', 'purple', 'orange'],
      ['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'red', 'blue'],
      ['yellow', 'purple', 'red', 'orange', 'red', 'blue', 'green', 'yellow'],
    ]);

    // 첫 번째 행에 수평 3개, 세 번째 열에 수직 3개 = 2개의 매칭
    // const detector = new MatchDetector();
    // const matches = detector.findMatches(grid);

    // expect(matches).toHaveLength(2);
  });
});
