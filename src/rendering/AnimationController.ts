import { Container, Graphics } from 'pixi.js';
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
   * 블록 낙하 애니메이션 (중력 + 바운스 효과)
   */
  async animateFall(from: Position, to: Position): Promise<void> {
    const block = this.findBlockAt(from);

    if (!block) {
      return;
    }

    const startY = block.y;
    const endY = to.row * (this.blockSize + this.gridPadding);
    const distance = endY - startY;

    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = this.fallDuration;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in-out with bounce (중력 + 바운스 효과)
        let eased: number;
        if (progress < 0.8) {
          // 떨어지는 단계 (가속)
          const t = progress / 0.8;
          eased = t * t; // ease-in
        } else {
          // 바운스 단계
          const t = (progress - 0.8) / 0.2;
          eased = 1 - Math.abs(Math.sin(t * Math.PI)) * 0.1; // 작은 바운스
        }

        block.y = startY + distance * eased;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // 최종 위치 보정
          block.y = endY;
          (block as any).blockRow = to.row;
          (block as any).blockCol = to.col;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * 블록 제거 애니메이션 (페이드아웃 + 스케일 + 파티클 이펙트)
   */
  async animateRemove(positions: Position[]): Promise<void> {
    const blocks = positions
      .map((pos) => this.findBlockAt(pos))
      .filter((block) => block !== null) as Container[];

    if (blocks.length === 0) {
      return;
    }

    // 각 블록 위치에 파티클 생성
    const particles = blocks.map((block) => this.createParticles(block.x, block.y));

    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = this.removeDuration;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out
        const eased = 1 - Math.pow(1 - progress, 3);

        // 블록 애니메이션
        blocks.forEach((block) => {
          block.alpha = 1 - eased;
          block.scale.set(1 + eased * 0.3); // 커지면서 사라지기
        });

        // 파티클 애니메이션
        particles.forEach((particleGroup) => {
          particleGroup.forEach((particle: any) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.5; // 중력 효과
            particle.alpha = 1 - eased;
            particle.scale.set(particle.scale.x * 0.95);
          });
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // 블록 제거
          blocks.forEach((block) => {
            block.destroy();
          });
          // 파티클 제거
          particles.forEach((particleGroup) => {
            particleGroup.forEach((particle: any) => {
              particle.destroy();
            });
          });
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * 파티클 생성 (반짝이는 별 효과)
   */
  private createParticles(x: number, y: number): Graphics[] {
    const particles: Graphics[] = [];
    const particleCount = 8;
    const centerX = x + this.blockSize / 2;
    const centerY = y + this.blockSize / 2;

    for (let i = 0; i < particleCount; i++) {
      const particle = new Graphics();

      // 별 모양
      particle.beginFill(0xffff00, 1);
      particle.drawStar(0, 0, 5, 4, 2);
      particle.endFill();

      particle.x = centerX;
      particle.y = centerY;

      // 랜덤한 방향으로 날아가기
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 2;
      (particle as any).vx = Math.cos(angle) * speed;
      (particle as any).vy = Math.sin(angle) * speed - 2; // 위로 튀어오르기

      this.container.addChild(particle);
      particles.push(particle);
    }

    return particles;
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
