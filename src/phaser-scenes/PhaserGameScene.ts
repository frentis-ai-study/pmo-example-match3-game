import Phaser from 'phaser';
import { GameController, type GameAction } from '../game/GameController';
import type { BlockType, Position } from '../types';
import Logger from '../utils/Logger';
import EventBus from '../utils/EventBus';

/**
 * Phaser 게임 플레이 씬
 */
export class PhaserGameScene extends Phaser.Scene {
  private controller!: GameController;

  private blockSize = 60;
  private gridPadding = 10;
  private gridContainer!: Phaser.GameObjects.Container;
  private blockSprites: Map<string, Phaser.GameObjects.Container> = new Map();

  private scoreText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;

  private selectedBlock: Position | null = null;
  private isProcessing = false;

  // 블록 색상
  private blockColors: Record<BlockType, number> = {
    red: 0xff6b6b,
    blue: 0x4e89ff,
    green: 0x51cf66,
    yellow: 0xffd43b,
    purple: 0xcc5de8,
    orange: 0xff922b,
    pink: 0xff6b9d,
  };

  // 블록 이모지
  private blockEmojis: Record<BlockType, string> = {
    red: '🍎',
    blue: '🫐',
    green: '🍏',
    yellow: '🍋',
    purple: '🍇',
    orange: '🍊',
    pink: '🍒',
  };

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 게임 컨트롤러 초기화
    this.controller = new GameController();

    // 그리드 컨테이너 (레이어 0 - 가장 아래)
    this.gridContainer = this.add.container(0, 0);
    this.gridContainer.setDepth(0);

    // UI 설정 (레이어 10 - 위)
    this.setupUI();

    // 이벤트 리스너
    this.setupEventListeners();

    // 게임 시작
    this.controller.start();
    this.renderGrid();

    const state = this.controller.getGameState();
    this.updateScoreDisplay(state.score);
    this.updateMovesDisplay(state.moves);

    Logger.info('PhaserGameScene created');
  }

  private setupUI(): void {
    const { width } = this.cameras.main;

    // 타이틀 (레이어 10)
    this.add.text(width / 2, 30, '🍎 Fruit Match 🍇', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#ffd93d',
      stroke: '#2a2e5f',
      strokeThickness: 4,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 4,
        fill: true,
      },
    }).setOrigin(0.5, 0).setDepth(10);

    // 점수 (레이어 10)
    this.scoreText = this.add.text(25, 75, '💎 0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#ffd93d',
      stroke: '#2a2e5f',
      strokeThickness: 3,
    }).setDepth(10);

    // 이동 횟수 (레이어 10)
    this.movesText = this.add.text(25, 115, '👆 0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#2a2e5f',
      strokeThickness: 2,
    }).setDepth(10);

    // 콤보 텍스트 (레이어 100 - 최상위)
    this.comboText = this.add.text(width / 2, this.cameras.main.height / 2 - 150, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffff00',
      stroke: '#ff0000',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0).setDepth(100);
  }

  private setupEventListeners(): void {
    EventBus.on('scoreUpdated', (event) => {
      this.updateScoreDisplay(event.score);
    });

    EventBus.on('comboDetected', (event) => {
      this.showCombo(event.comboCount);
    });
  }

  private renderGrid(): void {
    // 기존 블록 제거
    this.blockSprites.clear();
    this.gridContainer.removeAll(true);

    const blocks = this.controller.getGridState();
    const { rows, cols } = this.controller.getGridSize();

    const gridWidth = cols * (this.blockSize + this.gridPadding);
    const gridHeight = rows * (this.blockSize + this.gridPadding);

    // 그리드 중앙 배치
    const offsetX = (this.cameras.main.width - gridWidth) / 2;
    const offsetY = (this.cameras.main.height - gridHeight) / 2;

    this.gridContainer.setPosition(offsetX, offsetY);

    // 블록 렌더링
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const blockType = blocks[row][col];
        if (blockType) {
          this.createBlock(row, col, blockType);
        }
      }
    }
  }

  private createBlock(row: number, col: number, type: BlockType): void {
    const x = col * (this.blockSize + this.gridPadding);
    const y = row * (this.blockSize + this.gridPadding);

    // 블록 컨테이너 (모든 요소를 담음)
    const blockContainer = this.add.container(x, y);

    // 배경 그래픽
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.2);
    bg.fillRoundedRect(2, 2, this.blockSize, this.blockSize, 12);
    bg.fillStyle(this.blockColors[type], 1);
    bg.fillRoundedRect(0, 0, this.blockSize, this.blockSize, 12);
    bg.fillStyle(0xffffff, 0.3);
    bg.fillRoundedRect(4, 4, this.blockSize - 8, this.blockSize / 2 - 4, 8);

    // 이모지
    const emoji = this.add.text(
      this.blockSize / 2,
      this.blockSize / 2,
      this.blockEmojis[type],
      { fontSize: '36px' }
    ).setOrigin(0.5);

    // 투명한 클릭 영역
    const hitbox = this.add.rectangle(
      this.blockSize / 2,
      this.blockSize / 2,
      this.blockSize,
      this.blockSize,
      0x000000,
      0
    );
    hitbox.setInteractive({ useHandCursor: true });

    // Container에 추가
    blockContainer.add([bg, emoji, hitbox]);

    // 블록 데이터 저장
    (blockContainer as any).blockRow = row;
    (blockContainer as any).blockCol = col;

    // 클릭 이벤트
    hitbox.on('pointerdown', () => {
      const savedRow = (blockContainer as any).blockRow;
      const savedCol = (blockContainer as any).blockCol;
      this.onBlockClick(savedRow, savedCol);
    });

    // 그리드 컨테이너에 추가
    this.gridContainer.add(blockContainer);

    // Container를 저장 (애니메이션용)
    this.blockSprites.set(`${row},${col}`, blockContainer as any);
  }

  private onBlockClick(row: number, col: number): void {
    const state = this.controller.getGameState();
    if (this.isProcessing || state.phase !== 'playing') {
      return;
    }

    const clickedPos: Position = { row, col };

    // 선택된 블록이 없으면 선택
    if (!this.selectedBlock) {
      this.selectedBlock = clickedPos;
      this.showSelection(row, col);
      Logger.info('Block selected', clickedPos);
      return;
    }

    // 같은 블록 클릭 시 선택 해제
    if (this.selectedBlock.row === row && this.selectedBlock.col === col) {
      this.clearSelection();
      this.selectedBlock = null;
      Logger.info('Block deselected');
      return;
    }

    // 인접한 블록인지 확인
    const rowDiff = Math.abs(this.selectedBlock.row - row);
    const colDiff = Math.abs(this.selectedBlock.col - col);
    const isAdjacent = (rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 0);

    if (isAdjacent) {
      // 스왑 실행
      this.handleSwap(this.selectedBlock, clickedPos);
      this.clearSelection();
      this.selectedBlock = null;
    } else {
      // 새로운 블록 선택
      this.clearSelection();
      this.selectedBlock = clickedPos;
      this.showSelection(row, col);
      Logger.info('Block selection changed', clickedPos);
    }
  }

  /**
   * 블록 스왑 처리 (레이어드 아키텍처)
   *
   * 1. Controller에 스왑 요청 (로직 실행)
   * 2. 반환된 액션 리스트를 순차 실행 (렌더링)
   */
  private async handleSwap(from: Position, to: Position): Promise<void> {
    this.isProcessing = true;

    try {
      // 1. 컨트롤러에 스왑 시도 (로직만 실행)
      const result = await this.controller.trySwap(from, to);

      if (!result.success && result.actions.length === 0) {
        // 인접하지 않거나 유효하지 않은 스왑
        this.isProcessing = false;
        return;
      }

      // 2. 반환된 액션을 순차적으로 렌더링
      for (const action of result.actions) {
        await this.executeAction(action);
      }
    } catch (error) {
      Logger.error('Swap failed', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 게임 액션을 렌더링으로 변환
   */
  private async executeAction(action: GameAction): Promise<void> {
    switch (action.type) {
      case 'swap':
        await this.animateSwap(action.from, action.to);
        break;

      case 'revertSwap':
        // 원복 애니메이션
        await this.animateSwap(action.from, action.to);
        // 렌더링 완전 동기화
        this.renderGrid();
        break;

      case 'removeBlocks':
        await this.animateRemove(action.positions);
        this.renderGrid(); // 실제 제거 반영
        break;

      case 'applyGravity':
        // 중력 애니메이션은 생략하고 바로 렌더링
        this.renderGrid();
        await this.sleep(200);
        break;

      case 'fillEmpty':
        // 새 블록 채우기
        this.renderGrid();
        await this.sleep(200);
        break;

      case 'updateScore':
        this.updateScoreDisplay(action.score);
        EventBus.emit({ type: 'scoreUpdated', score: action.score });
        break;

      case 'updateMoves':
        this.updateMovesDisplay(action.moves);
        break;

      case 'combo':
        this.showCombo(action.count);
        EventBus.emit({ type: 'comboDetected', comboCount: action.count });
        break;
    }
  }

  private async animateSwap(from: Position, to: Position): Promise<void> {
    const fromKey = `${from.row},${from.col}`;
    const toKey = `${to.row},${to.col}`;

    const fromContainer = this.blockSprites.get(fromKey);
    const toContainer = this.blockSprites.get(toKey);

    if (!fromContainer || !toContainer) return;

    const fromX = from.col * (this.blockSize + this.gridPadding);
    const fromY = from.row * (this.blockSize + this.gridPadding);
    const toX = to.col * (this.blockSize + this.gridPadding);
    const toY = to.row * (this.blockSize + this.gridPadding);

    // Container만 이동하면 내부 요소들이 함께 이동
    await Promise.all([
      new Promise<void>((resolve) => {
        this.tweens.add({
          targets: fromContainer,
          x: toX,
          y: toY,
          duration: 200,
          ease: 'Power2',
          onComplete: () => resolve(),
        });
      }),
      new Promise<void>((resolve) => {
        this.tweens.add({
          targets: toContainer,
          x: fromX,
          y: fromY,
          duration: 200,
          ease: 'Power2',
          onComplete: () => resolve(),
        });
      }),
    ]);
  }

  private async animateRemove(positions: Position[]): Promise<void> {
    const containers = positions.map((pos) => this.blockSprites.get(`${pos.row},${pos.col}`)).filter(Boolean);

    await Promise.all(
      containers.map(
        (container) =>
          new Promise<void>((resolve) => {
            this.tweens.add({
              targets: container,
              alpha: 0,
              scale: 0.5,
              duration: 200,
              ease: 'Power2',
              onComplete: () => resolve(),
            });
          })
      )
    );
  }

  private showSelection(row: number, col: number): void {
    const sprite = this.blockSprites.get(`${row},${col}`);
    if (sprite) {
      // 노란색 테두리 추가
      const x = col * (this.blockSize + this.gridPadding);
      const y = row * (this.blockSize + this.gridPadding);

      const highlight = this.add.graphics();
      highlight.lineStyle(4, 0xffff00, 1);
      highlight.strokeRoundedRect(-2, -2, this.blockSize + 4, this.blockSize + 4, 10);
      highlight.fillStyle(0xffff00, 0.2);
      highlight.fillRoundedRect(0, 0, this.blockSize, this.blockSize, 8);

      highlight.setPosition(x, y);
      this.gridContainer.add(highlight);
      (highlight as any).isHighlight = true;
    }
  }

  private clearSelection(): void {
    // 하이라이트 제거
    this.gridContainer.each((child: any) => {
      if (child.isHighlight) {
        child.destroy();
      }
    });
  }

  private showCombo(comboCount: number): void {
    this.comboText.setText(`🔥 ${comboCount}x COMBO! 🔥`);
    this.comboText.setAlpha(1);

    this.tweens.add({
      targets: this.comboText,
      alpha: 0,
      duration: 1000,
      delay: 500,
    });
  }

  private updateScoreDisplay(score: number): void {
    this.scoreText.setText(`💎 ${score}`);
  }

  private updateMovesDisplay(moves: number): void {
    this.movesText.setText(`👆 ${moves}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
