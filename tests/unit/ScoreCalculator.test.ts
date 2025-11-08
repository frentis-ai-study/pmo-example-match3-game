import { describe, it, expect } from 'vitest';
import type { Position } from '../../src/types';

// ScoreCalculator는 아직 구현되지 않았으므로 테스트가 실패할 것입니다

describe('ScoreCalculator', () => {
  // TODO: ScoreCalculator 구현 후 import 추가
  // import { ScoreCalculator } from '../../src/game/ScoreCalculator';

  it.skip('should calculate base score for 3-block match', () => {
    const blocks: Position[] = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ];

    // const calculator = new ScoreCalculator();
    // const score = calculator.calculateScore(blocks, false);

    // 기본 점수: 10 * 3 = 30
    // expect(score).toBe(30);
  });

  it.skip('should calculate bonus score for 4-block match', () => {
    const blocks: Position[] = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
    ];

    // const calculator = new ScoreCalculator();
    // const score = calculator.calculateScore(blocks, false);

    // 기본 점수: 10 * 4 = 40
    // 4개 보너스: 20
    // 합계: 60
    // expect(score).toBe(60);
  });

  it.skip('should calculate bonus score for 5-block match', () => {
    const blocks: Position[] = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      { row: 0, col: 4 },
    ];

    // const calculator = new ScoreCalculator();
    // const score = calculator.calculateScore(blocks, false);

    // 기본 점수: 10 * 5 = 50
    // 5개 보너스: 50
    // 합계: 100
    // expect(score).toBe(100);
  });

  it.skip('should apply combo multiplier for cascading matches', () => {
    const blocks: Position[] = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ];

    // const calculator = new ScoreCalculator();

    // 첫 번째 매칭 (콤보 아님)
    // const score1 = calculator.calculateScore(blocks, false, 0);
    // expect(score1).toBe(30);

    // 두 번째 매칭 (콤보 1배)
    // const score2 = calculator.calculateScore(blocks, true, 1);
    // 기본 점수: 30
    // 콤보 보너스: 5 * 1 = 5
    // 합계: 35
    // expect(score2).toBe(35);

    // 세 번째 매칭 (콤보 2배)
    // const score3 = calculator.calculateScore(blocks, true, 2);
    // 기본 점수: 30
    // 콤보 보너스: 5 * 2 = 10
    // 합계: 40
    // expect(score3).toBe(40);
  });

  it.skip('should handle combo count properly', () => {
    const blocks: Position[] = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
    ];

    // const calculator = new ScoreCalculator();

    // 4개 매칭 + 콤보 3배
    // const score = calculator.calculateScore(blocks, true, 3);

    // 기본 점수: 10 * 4 = 40
    // 4개 보너스: 20
    // 콤보 보너스: 5 * 3 = 15
    // 합계: 75
    // expect(score).toBe(75);
  });

  it.skip('should return 0 for empty blocks array', () => {
    const blocks: Position[] = [];

    // const calculator = new ScoreCalculator();
    // const score = calculator.calculateScore(blocks, false);

    // expect(score).toBe(0);
  });

  it.skip('should return 0 for less than 3 blocks', () => {
    const blocks: Position[] = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
    ];

    // const calculator = new ScoreCalculator();
    // const score = calculator.calculateScore(blocks, false);

    // expect(score).toBe(0);
  });
});
