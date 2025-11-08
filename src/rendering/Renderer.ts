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

  // 블록 색상 매핑
  private blockColors: Record<BlockType, number> = {
    red: 0xff4444,
    blue: 0x4444ff,
    green: 0x44ff44,
    yellow: 0xffff44,
    purple: 0xff44ff,
    orange: 0xffaa44,
    pink: 0xffaade,
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

    const block = new Graphics();

    // 블록 배경 (둥근 사각형)
    block.beginFill(this.blockColors[type]);
    block.drawRoundedRect(0, 0, this.blockSize, this.blockSize, 8);
    block.endFill();

    // 블록 테두리 (하이라이트 효과)
    block.lineStyle(2, 0xffffff, 0.3);
    block.drawRoundedRect(2, 2, this.blockSize - 4, this.blockSize - 4, 6);

    block.x = x;
    block.y = y;

    // 인터랙티브 설정 (클릭 가능)
    block.eventMode = 'static';
    block.cursor = 'pointer';

    // 데이터 저장 (나중에 입력 처리에 사용)
    (block as any).blockRow = row;
    (block as any).blockCol = col;
    (block as any).blockType = type;

    this.gridContainer.addChild(block);
  }

  /**
   * 빈 슬롯 렌더링
   */
  private renderEmptySlot(row: number, col: number): void {
    const x = col * (this.blockSize + this.gridPadding);
    const y = row * (this.blockSize + this.gridPadding);

    const slot = new Graphics();
    slot.beginFill(0x222222, 0.3);
    slot.drawRoundedRect(0, 0, this.blockSize, this.blockSize, 8);
    slot.endFill();

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
   * 렌더러 정리
   */
  destroy(): void {
    this.gridContainer.destroy({ children: true });
    this.uiContainer.destroy({ children: true });
    Logger.info('Renderer destroyed');
  }
}
