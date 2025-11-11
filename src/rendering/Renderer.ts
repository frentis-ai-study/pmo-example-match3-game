import { Application, Container, Graphics, Text } from 'pixi.js';
import type { BlockType } from '../types';
import Logger from '../utils/Logger';

/**
 * Renderer
 * PixiJS Application을 래핑하고 게임 렌더링을 담당합니다.
 */
export class Renderer {
  private app: Application;
  private gridContainer: Container;
  private uiContainer: Container;
  private blockSize: number = 60;
  private gridPadding: number = 10;
  private selectionHighlight: Graphics | null = null;

  // 블록 이모지 매핑
  private blockEmojis: Record<BlockType, string> = {
    red: '🍎',
    blue: '🫐',
    green: '🍏',
    yellow: '🍋',
    purple: '🍇',
    orange: '🍊',
    pink: '🍒',
  };

  // 블록 배경색 (이모지 뒤 배경)
  private blockColors: Record<BlockType, number> = {
    red: 0xff6b6b,
    blue: 0x4e89ff,
    green: 0x51cf66,
    yellow: 0xffd43b,
    purple: 0xcc5de8,
    orange: 0xff922b,
    pink: 0xff6b9d,
  };

  constructor(app: Application) {
    this.app = app;
    this.gridContainer = new Container();
    this.uiContainer = new Container();

    this.app.stage.addChild(this.gridContainer);
    this.app.stage.addChild(this.uiContainer);

    Logger.info('Renderer initialized');
  }

  /**
   * 그리드 렌더링
   */
  renderGrid(grid: (BlockType | null)[][], rows: number, cols: number): void {
    // 기존 그리드 제거
    this.gridContainer.removeChildren();

    const gridWidth = cols * (this.blockSize + this.gridPadding);
    const gridHeight = rows * (this.blockSize + this.gridPadding);

    // 그리드를 화면 중앙에 배치
    const offsetX = (this.app.screen.width - gridWidth) / 2;
    const offsetY = (this.app.screen.height - gridHeight) / 2;

    this.gridContainer.x = offsetX;
    this.gridContainer.y = offsetY;

    // 각 블록 렌더링
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const blockType = grid[row][col];
        if (blockType) {
          this.renderBlock(row, col, blockType);
        } else {
          // 빈 공간은 어두운 사각형으로 표시
          this.renderEmptySlot(row, col);
        }
      }
    }

    Logger.debug(`Grid rendered: ${rows}x${cols}`);
  }

  /**
   * 단일 블록 렌더링
   */
  private renderBlock(row: number, col: number, type: BlockType): void {
    const x = col * (this.blockSize + this.gridPadding);
    const y = row * (this.blockSize + this.gridPadding);

    // 블록 컨테이너
    const blockContainer = new Container();
    blockContainer.x = x;
    blockContainer.y = y;

    // 블록 배경 (둥근 사각형 + 그림자 효과)
    const background = new Graphics();

    // 그림자
    background.beginFill(0x000000, 0.2);
    background.drawRoundedRect(2, 2, this.blockSize, this.blockSize, 12);
    background.endFill();

    // 메인 배경
    background.beginFill(this.blockColors[type]);
    background.drawRoundedRect(0, 0, this.blockSize, this.blockSize, 12);
    background.endFill();

    // 하이라이트 효과 (상단)
    background.beginFill(0xffffff, 0.3);
    background.drawRoundedRect(4, 4, this.blockSize - 8, this.blockSize / 2 - 4, 8);
    background.endFill();

    blockContainer.addChild(background);

    // 이모지 텍스트
    const emoji = new Text(this.blockEmojis[type], {
      fontSize: 36,
      align: 'center',
    });
    emoji.anchor.set(0.5);
    emoji.x = this.blockSize / 2;
    emoji.y = this.blockSize / 2;
    blockContainer.addChild(emoji);

    // 인터랙티브 설정 (클릭 가능)
    blockContainer.eventMode = 'static';
    blockContainer.cursor = 'pointer';

    // 데이터 저장 (나중에 입력 처리에 사용)
    (blockContainer as any).blockRow = row;
    (blockContainer as any).blockCol = col;
    (blockContainer as any).blockType = type;

    this.gridContainer.addChild(blockContainer);
  }

  /**
   * 빈 슬롯 렌더링
   */
  private renderEmptySlot(row: number, col: number): void {
    const x = col * (this.blockSize + this.gridPadding);
    const y = row * (this.blockSize + this.gridPadding);

    const slot = new Graphics();

    // 어두운 배경
    slot.beginFill(0x1a1f3a, 0.5);
    slot.drawRoundedRect(0, 0, this.blockSize, this.blockSize, 12);
    slot.endFill();

    // 테두리
    slot.lineStyle(1, 0x2d3561, 0.8);
    slot.drawRoundedRect(1, 1, this.blockSize - 2, this.blockSize - 2, 11);

    slot.x = x;
    slot.y = y;

    this.gridContainer.addChild(slot);
  }

  /**
   * UI 텍스트 렌더링 (점수 등)
   */
  renderText(text: string, x: number, y: number, size: number = 24): Text {
    const textObj = new Text({
      text,
      style: {
        fontFamily: 'Arial',
        fontSize: size,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });

    textObj.x = x;
    textObj.y = y;

    this.uiContainer.addChild(textObj);

    return textObj;
  }

  /**
   * 그리드 컨테이너 가져오기 (애니메이션용)
   */
  getGridContainer(): Container {
    return this.gridContainer;
  }

  /**
   * UI 컨테이너 가져오기
   */
  getUIContainer(): Container {
    return this.uiContainer;
  }

  /**
   * PixiJS Application 가져오기
   */
  getApp(): Application {
    return this.app;
  }

  /**
   * 블록 크기 가져오기
   */
  getBlockSize(): number {
    return this.blockSize;
  }

  /**
   * 그리드 패딩 가져오기
   */
  getGridPadding(): number {
    return this.gridPadding;
  }

  /**
   * 선택된 블록 하이라이트 표시
   */
  showSelectionHighlight(row: number, col: number): void {
    // 기존 하이라이트 제거
    this.clearSelectionHighlight();

    const x = col * (this.blockSize + this.gridPadding);
    const y = row * (this.blockSize + this.gridPadding);

    this.selectionHighlight = new Graphics();

    // 노란색 테두리로 선택 표시
    this.selectionHighlight.lineStyle(4, 0xffff00, 1);
    this.selectionHighlight.drawRoundedRect(-2, -2, this.blockSize + 4, this.blockSize + 4, 10);

    // 반투명 노란색 오버레이
    this.selectionHighlight.beginFill(0xffff00, 0.2);
    this.selectionHighlight.drawRoundedRect(0, 0, this.blockSize, this.blockSize, 8);
    this.selectionHighlight.endFill();

    this.selectionHighlight.x = x;
    this.selectionHighlight.y = y;

    // 최상위에 표시 (eventMode는 none으로 설정하여 클릭 방해하지 않음)
    this.selectionHighlight.eventMode = 'none';
    this.gridContainer.addChild(this.selectionHighlight);

    Logger.debug('Selection highlight shown', { row, col });
  }

  /**
   * 선택 하이라이트 제거
   */
  clearSelectionHighlight(): void {
    if (this.selectionHighlight) {
      this.gridContainer.removeChild(this.selectionHighlight);
      this.selectionHighlight.destroy();
      this.selectionHighlight = null;
      Logger.debug('Selection highlight cleared');
    }
  }

  /**
   * 렌더러 정리
   */
  destroy(): void {
    this.clearSelectionHighlight();
    this.gridContainer.destroy({ children: true });
    this.uiContainer.destroy({ children: true });
    Logger.info('Renderer destroyed');
  }
}
