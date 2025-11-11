import type { Container, FederatedPointerEvent } from 'pixi.js';
import type { Position } from '../types';
import Logger from '../utils/Logger';

/**
 * InputHandler
 * 마우스/터치 입력을 처리하고 스와이프 및 클릭-클릭 방식을 지원합니다.
 */
export class InputHandler {
  private container: Container;
  private isDragging: boolean = false;
  private startBlock: { row: number; col: number } | null = null;
  private selectedBlock: { row: number; col: number } | null = null;
  private onSwipeCallback: ((from: Position, to: Position) => void) | null = null;
  private onSelectionChangeCallback: ((selected: Position | null) => void) | null = null;

  constructor(container: Container, _blockSize: number, _gridPadding: number) {
    this.container = container;

    this.setupListeners();
    Logger.info('InputHandler initialized (supports drag and click-click)');
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupListeners(): void {
    // 마우스/터치 이벤트
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
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

      // 드래그 앤 드롭: 시작 블록과 다른 블록이면 스와이프로 간주
      if (this.startBlock.row !== endPos.row || this.startBlock.col !== endPos.col) {
        this.handleSwipe(this.startBlock, endPos);
        this.isDragging = false;
        this.startBlock = null;
        return;
      }

      // 클릭-클릭: 같은 위치에서 pointerdown과 pointerup이 발생한 경우
      this.handleClick(endPos);
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
   * 클릭 처리 (클릭-클릭 방식)
   */
  private handleClick(clickedPos: Position): void {
    // 선택된 블록이 없으면 블록 선택
    if (!this.selectedBlock) {
      this.selectedBlock = { ...clickedPos };
      Logger.info('Block selected', this.selectedBlock);

      // 선택 변경 콜백 호출
      if (this.onSelectionChangeCallback) {
        this.onSelectionChangeCallback(this.selectedBlock);
      }
      return;
    }

    // 같은 블록을 다시 클릭하면 선택 취소
    if (
      this.selectedBlock.row === clickedPos.row &&
      this.selectedBlock.col === clickedPos.col
    ) {
      Logger.info('Block deselected', this.selectedBlock);
      this.selectedBlock = null;

      // 선택 변경 콜백 호출
      if (this.onSelectionChangeCallback) {
        this.onSelectionChangeCallback(null);
      }
      return;
    }

    // 인접한 블록인지 확인
    const rowDiff = Math.abs(this.selectedBlock.row - clickedPos.row);
    const colDiff = Math.abs(this.selectedBlock.col - clickedPos.col);
    const isAdjacent = (rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 0);

    if (isAdjacent) {
      // 인접한 블록이면 스왑 실행
      Logger.info('Adjacent block clicked, swapping', {
        from: this.selectedBlock,
        to: clickedPos,
      });

      if (this.onSwipeCallback) {
        this.onSwipeCallback(this.selectedBlock, clickedPos);
      }

      // 선택 해제
      this.selectedBlock = null;
      if (this.onSelectionChangeCallback) {
        this.onSelectionChangeCallback(null);
      }
    } else {
      // 인접하지 않은 블록이면 새로운 블록 선택
      Logger.info('Non-adjacent block clicked, changing selection', clickedPos);
      this.selectedBlock = { ...clickedPos };

      // 선택 변경 콜백 호출
      if (this.onSelectionChangeCallback) {
        this.onSelectionChangeCallback(this.selectedBlock);
      }
    }
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
   * 선택 변경 콜백 등록
   */
  onSelectionChange(callback: (selected: Position | null) => void): void {
    this.onSelectionChangeCallback = callback;
  }

  /**
   * 현재 선택된 블록 가져오기
   */
  getSelectedBlock(): Position | null {
    return this.selectedBlock ? { ...this.selectedBlock } : null;
  }

  /**
   * 선택 해제
   */
  clearSelection(): void {
    if (this.selectedBlock) {
      Logger.debug('Selection cleared');
      this.selectedBlock = null;
      if (this.onSelectionChangeCallback) {
        this.onSelectionChangeCallback(null);
      }
    }
  }

  /**
   * 입력 비활성화
   */
  disable(): void {
    this.container.eventMode = 'none';
    this.clearSelection(); // 입력 비활성화 시 선택도 해제
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
