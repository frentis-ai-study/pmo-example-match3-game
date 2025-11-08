import type { Position } from '../types';
import { DEFAULT_GAME_CONFIG } from '../types';
import Logger from '../utils/Logger';

/**
 * ScoreCalculator
 * 매칭된 블록에 대한 점수를 계산합니다.
 * - 3개 매칭: 기본 점수
 * - 4개 매칭: 기본 점수 + 보너스
 * - 5개 이상: 기본 점수 + 큰 보너스
 * - 콤보: 연쇄 반응마다 추가 점수
 */
export class ScoreCalculator {
  private baseScore: number;
  private comboBonus: number;
  private fourMatchBonus: number;
  private fiveMatchBonus: number;

  constructor() {
    const config = DEFAULT_GAME_CONFIG.scoring;
    this.baseScore = config.base;
    this.comboBonus = config.combo;
    this.fourMatchBonus = config.fourMatch;
    this.fiveMatchBonus = config.fiveMatch;
  }

  /**
   * 매칭된 블록의 점수 계산
   * @param blocks 매칭된 블록 위치 배열
   * @param isCombo 콤보 여부
   * @param comboCount 콤보 횟수 (0부터 시작)
   * @returns 계산된 점수
   */
  calculateScore(blocks: Position[], isCombo: boolean = false, comboCount: number = 0): number {
    if (blocks.length < 3) {
      return 0;
    }

    let score = 0;

    // 기본 점수: 블록 개수 * 기본 점수
    score += blocks.length * this.baseScore;

    // 블록 개수별 보너스
    if (blocks.length === 4) {
      score += this.fourMatchBonus;
    } else if (blocks.length >= 5) {
      score += this.fiveMatchBonus;
    }

    // 콤보 보너스
    if (isCombo && comboCount > 0) {
      score += this.comboBonus * comboCount;
    }

    Logger.debug(`Score calculated: ${score}`, {
      blocks: blocks.length,
      isCombo,
      comboCount,
    });

    return score;
  }

  /**
   * 여러 매칭의 총 점수 계산
   */
  calculateTotalScore(
    matches: { blocks: Position[] }[],
    isCombo: boolean = false,
    comboCount: number = 0
  ): number {
    return matches.reduce((total, match) => {
      return total + this.calculateScore(match.blocks, isCombo, comboCount);
    }, 0);
  }
}
