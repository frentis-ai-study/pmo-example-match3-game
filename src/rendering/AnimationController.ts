import type { Container, Graphics } from 'pixi.js';
import type { Position } from '../types';
import { DEFAULT_GAME_CONFIG } from '../types';
import Logger from '../utils/Logger';

/**
 * AnimationController
 * 블록 이동, 제거, 생성 애니메이션을 관리합니다.
 */
export class AnimationController {
  private container: Container;
  private blockSize: number;
  private gridPadding: number;
  private swapDuration: number;
  private fallDuration: number;
  private removeDuration: number;

  constructor(container: Container, blockSize: number, gridPadding: number) {
    this.container = container;
    this.blockSize = blockSize;
    this.gridPadding = gridPadding;

    const config = DEFAULT_GAME_CONFIG.animation;
    this.swapDuration = config.swapDuration;
    this.fallDuration = config.fallDuration;
    this.removeDuration = config.removeDuration;

    Logger.info('AnimationController initialized');
  }

  /**
   * 블록 교환 애니메이션
   */
  async animateSwap(pos1: Position, pos2: Position): Promise<void> {
    const block1 = this.findBlockAt(pos1);
    const block2 = this.findBlockAt(pos2);

    if (!block1 || !block2) {
      Logger.warn('Cannot animate swap: blocks not found', { pos1, pos2 });
      return;
    }

    const startX1 = block1.x;
    const startY1 = block1.y;
    const startX2 = block2.x;
    const startY2 = block2.y;

    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = this.swapDuration;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in-out 함수
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // 블록 위치 보간
        block1.x = startX1 + (startX2 - startX1) * eased;
        block1.y = startY1 + (startY2 - startY1) * eased;
        block2.x = startX2 + (startX1 - startX2) * eased;
        block2.y = startY2 + (startY1 - startY2) * eased;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // 애니메이션 완료 후 위치 데이터 업데이트
          (block1 as any).blockRow = pos2.row;
          (block1 as any).blockCol = pos2.col;
          (block2 as any).blockRow = pos1.row;
          (block2 as any).blockCol = pos1.col;

          resolve();
        }
      };

      animate();
    });
  }

  /**
   * 블록 낙하 애니메이션
   */
  async animateFall(from: Position, to: Position): Promise<void> {
    const block = this.findBlockAt(from);

    if (!block) {
      return;
    }

    const startY = block.y;
    const endY = to.row * (this.blockSize + this.gridPadding);

    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = this.fallDuration;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in (중력 효과)
        const eased = progress * progress;

        block.y = startY + (endY - startY) * eased;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          (block as any).blockRow = to.row;
          (block as any).blockCol = to.col;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * 블록 제거 애니메이션 (페이드아웃 + 스케일)
   */
  async animateRemove(positions: Position[]): Promise<void> {
    const blocks = positions
      .map((pos) => this.findBlockAt(pos))
      .filter((block) => block !== null) as Graphics[];

    if (blocks.length === 0) {
      return;
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = this.removeDuration;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out
        const eased = 1 - Math.pow(1 - progress, 3);

        blocks.forEach((block) => {
          block.alpha = 1 - eased;
          block.scale.set(1 - eased * 0.5);
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // 블록 제거
          blocks.forEach((block) => {
            block.destroy();
          });
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * 블록 생성 애니메이션 (페이드인 + 스케일)
   */
  async animateSpawn(positions: Position[]): Promise<void> {
    const blocks = positions
      .map((pos) => this.findBlockAt(pos))
      .filter((block) => block !== null) as Graphics[];

    if (blocks.length === 0) {
      return;
    }

    // 초기 상태 설정
    blocks.forEach((block) => {
      block.alpha = 0;
      block.scale.set(0.5);
    });

    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = 300;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out
        const eased = 1 - Math.pow(1 - progress, 2);

        blocks.forEach((block) => {
          block.alpha = eased;
          block.scale.set(0.5 + eased * 0.5);
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * 특정 위치의 블록 찾기
   */
  private findBlockAt(pos: Position): Graphics | null {
    const children = this.container.children;

    for (const child of children) {
      const block = child as any;
      if (block.blockRow === pos.row && block.blockCol === pos.col) {
        return child as Graphics;
      }
    }

    return null;
  }

  /**
   * 모든 애니메이션 취소
   */
  cancelAll(): void {
    // 모든 블록의 애니메이션 상태 초기화
    this.container.children.forEach((child) => {
      child.alpha = 1;
      child.scale.set(1);
    });

    Logger.debug('All animations cancelled');
  }
}
