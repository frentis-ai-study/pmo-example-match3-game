import type { Container, FederatedPointerEvent } from 'pixi.js';
import type { Position } from '../types';
import Logger from '../utils/Logger';

/**
 * InputHandler
 * 마우스/터치 입력을 처리하고 스와이프를 감지합니다.
 */
export class InputHandler {
  private container: Container;
  private isDragging: boolean = false;
  private startBlock: { row: number; col: number } | null = null;
  private onSwipeCallback: ((from: Position, to: Position) => void) | null = null;

  constructor(container: Container, _blockSize: number, _gridPadding: number) {
    this.container = container;

    this.setupListeners();
    Logger.info('InputHandler initialized');
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupListeners(): void {
    // 마우스/터치 이벤트
    this.container.eventMode = 'static';
    this.container.on('pointerdown', this.onPointerDown.bind(this));
    this.container.on('pointerup', this.onPointerUp.bind(this));
    this.container.on('pointermove', this.onPointerMove.bind(this));
  }

  /**
   * 포인터 다운 이벤트
   */
  private onPointerDown(event: FederatedPointerEvent): void {
    const block = event.target as any;

    if (block.blockRow !== undefined && block.blockCol !== undefined) {
      this.isDragging = true;
      this.startBlock = {
        row: block.blockRow,
        col: block.blockCol,
      };

      Logger.debug('Pointer down on block', this.startBlock);
    }
  }

  /**
   * 포인터 업 이벤트
   */
  private onPointerUp(event: FederatedPointerEvent): void {
    if (!this.isDragging || !this.startBlock) {
      return;
    }

    const endBlock = event.target as any;

    if (endBlock.blockRow !== undefined && endBlock.blockCol !== undefined) {
      const endPos = {
        row: endBlock.blockRow,
        col: endBlock.blockCol,
      };

      // 시작 블록과 다른 블록이면 스와이프로 간주
      if (this.startBlock.row !== endPos.row || this.startBlock.col !== endPos.col) {
        this.handleSwipe(this.startBlock, endPos);
      }
    }

    this.isDragging = false;
    this.startBlock = null;
  }

  /**
   * 포인터 이동 이벤트
   */
  private onPointerMove(_event: FederatedPointerEvent): void {
    if (!this.isDragging || !this.startBlock) {
      return;
    }

    // 드래그 중 시각적 피드백을 추가할 수 있음
    // 현재는 기본 구현만 제공
  }

  /**
   * 스와이프 처리
   */
  private handleSwipe(from: Position, to: Position): void {
    // 인접한 블록인지 확인
    const rowDiff = Math.abs(from.row - to.row);
    const colDiff = Math.abs(from.col - to.col);

    const isAdjacent = (rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 0);

    if (!isAdjacent) {
      Logger.debug('Blocks are not adjacent, ignoring swipe', { from, to });
      return;
    }

    Logger.info('Swipe detected', { from, to });

    // 콜백 호출
    if (this.onSwipeCallback) {
      this.onSwipeCallback(from, to);
    }
  }

  /**
   * 스와이프 콜백 등록
   */
  onSwipe(callback: (from: Position, to: Position) => void): void {
    this.onSwipeCallback = callback;
  }

  /**
   * 입력 비활성화
   */
  disable(): void {
    this.container.eventMode = 'none';
    Logger.debug('InputHandler disabled');
  }

  /**
   * 입력 활성화
   */
  enable(): void {
    this.container.eventMode = 'static';
    Logger.debug('InputHandler enabled');
  }

  /**
   * 리스너 정리
   */
  destroy(): void {
    this.container.off('pointerdown');
    this.container.off('pointerup');
    this.container.off('pointermove');
    Logger.info('InputHandler destroyed');
  }
}
