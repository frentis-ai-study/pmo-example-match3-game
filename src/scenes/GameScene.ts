import { Application, Text } from 'pixi.js';
import { Scene } from './Scene';
import { Grid } from '../game/Grid';
import { GameState } from '../game/GameState';
import { MatchDetector } from '../game/MatchDetector';
import { ScoreCalculator } from '../game/ScoreCalculator';
import { Renderer } from '../rendering/Renderer';
import { AnimationController } from '../rendering/AnimationController';
import { InputHandler } from '../rendering/InputHandler';
import { ComboCounter } from '../ui/ComboCounter';
import type { Position } from '../types';
import Logger from '../utils/Logger';
import EventBus from '../utils/EventBus';

/**
 * GameScene
 * 실제 게임 플레이 씬
 */
export class GameScene extends Scene {
  private grid: Grid;
  private gameState: GameState;
  private matchDetector: MatchDetector;
  private scoreCalculator: ScoreCalculator;
  private renderer: Renderer;
  private animationController: AnimationController;
  private inputHandler: InputHandler;
  private comboCounter: ComboCounter;
  private scoreText: Text | null = null;
  private movesText: Text | null = null;
  private titleText: Text | null = null;
  private pauseButton: Text | null = null;
  private isProcessing: boolean = false;

  constructor(app: Application) {
    super(app);

    // 게임 로직
    this.grid = new Grid();
    this.gameState = new GameState();
    this.matchDetector = new MatchDetector();
    this.scoreCalculator = new ScoreCalculator();

    // 렌더링 (새로운 Renderer 생성하지 않고 기존 것 재사용할 수도 있지만, 깔끔하게 분리)
    this.renderer = new Renderer(app);
    this.animationController = new AnimationController(
      this.renderer.getGridContainer(),
      this.renderer.getBlockSize(),
      this.renderer.getGridPadding()
    );
    this.inputHandler = new InputHandler(
      this.renderer.getGridContainer(),
      this.renderer.getBlockSize(),
      this.renderer.getGridPadding()
    );

    this.comboCounter = new ComboCounter(app.screen.width / 2, app.screen.height / 2 - 150);
  }

  init(): void {
    // 렌더러의 컨테이너들을 이 씬의 컨테이너에 추가
    this.container.addChild(this.renderer.getGridContainer());
    this.container.addChild(this.renderer.getUIContainer());
    this.container.addChild(this.comboCounter.getContainer());

    this.setupUI();
    this.setupEventListeners();

    // 게임 시작
    this.gameState.start();
    this.renderGame();
    this.updateScoreDisplay(0);
    this.updateMovesDisplay(0);
    this.inputHandler.enable();

    Logger.info('GameScene initialized');
  }

  private setupUI(): void {
    const app = this.app;

    // 타이틀
    this.titleText = new Text('🍎 Fruit Match 🍇', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 42,
      fontWeight: 'bold',
      fill: 0xffd93d,
      stroke: { color: 0x2a2e5f, width: 4 },
      dropShadow: {
        color: 0x000000,
        angle: Math.PI / 6,
        blur: 4,
        distance: 6,
        alpha: 0.5,
      },
    });
    this.titleText.anchor.set(0.5, 0);
    this.titleText.x = app.screen.width / 2;
    this.titleText.y = 15;
    this.renderer.getUIContainer().addChild(this.titleText);

    // 점수
    this.scoreText = new Text('💎 0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 26,
      fontWeight: 'bold',
      fill: 0xffd93d,
      stroke: { color: 0x2a2e5f, width: 3 },
    });
    this.scoreText.x = 25;
    this.scoreText.y = 75;
    this.renderer.getUIContainer().addChild(this.scoreText);

    // 이동 횟수
    this.movesText = new Text('👆 0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 22,
      fontWeight: 'bold',
      fill: 0xffffff,
      stroke: { color: 0x2a2e5f, width: 2 },
    });
    this.movesText.x = 25;
    this.movesText.y = 115;
    this.renderer.getUIContainer().addChild(this.movesText);

    // 일시정지 버튼
    this.pauseButton = new Text('⏸️ Pause', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 22,
      fontWeight: 'bold',
      fill: 0xffffff,
      stroke: { color: 0x2a2e5f, width: 2 },
    });
    this.pauseButton.anchor.set(1, 0);
    this.pauseButton.x = app.screen.width - 25;
    this.pauseButton.y = 75;
    this.pauseButton.eventMode = 'static';
    this.pauseButton.cursor = 'pointer';
    this.pauseButton.on('pointerdown', () => {
      Logger.info('Pause button clicked (not implemented yet)');
    });
    this.pauseButton.on('pointerover', () => {
      this.pauseButton!.scale.set(1.1);
    });
    this.pauseButton.on('pointerout', () => {
      this.pauseButton!.scale.set(1);
    });
    this.renderer.getUIContainer().addChild(this.pauseButton);
  }

  private setupEventListeners(): void {
    this.inputHandler.onSwipe(this.handleSwipe.bind(this));

    this.inputHandler.onSelectionChange((selected) => {
      if (selected) {
        this.renderer.showSelectionHighlight(selected.row, selected.col);
      } else {
        this.renderer.clearSelectionHighlight();
      }
    });

    EventBus.on('scoreUpdated', (event) => {
      this.updateScoreDisplay(event.score);
    });

    EventBus.on('comboDetected', (event) => {
      this.comboCounter.update(event.comboCount);
    });
  }

  private renderGame(): void {
    const blocks = this.grid.getAllBlocks();
    this.renderer.renderGrid(blocks, this.grid.getRows(), this.grid.getCols());
  }

  private async handleSwipe(from: Position, to: Position): Promise<void> {
    if (this.isProcessing || this.gameState.phase !== 'playing') {
      return;
    }

    this.isProcessing = true;
    this.inputHandler.disable();

    try {
      const swapped = this.grid.swapBlocks(from, to);
      if (!swapped) {
        this.isProcessing = false;
        this.inputHandler.enable();
        return;
      }

      await this.animationController.animateSwap(from, to);

      const matches = this.matchDetector.findMatches(this.grid.getAllBlocks());

      if (matches.length === 0) {
        this.grid.swapBlocks(from, to);
        await this.animationController.animateSwap(to, from);
        this.isProcessing = false;
        this.inputHandler.enable();
        return;
      }

      this.gameState.incrementMoves();
      this.updateMovesDisplay(this.gameState.moves);
      this.gameState.resetCombo();

      await this.processCascades();
    } catch (error) {
      Logger.error('Error handling swipe', error);
    } finally {
      this.isProcessing = false;
      this.inputHandler.enable();
    }
  }

  private async processCascades(): Promise<void> {
    let hasMatches = true;
    let comboCount = 0;

    while (hasMatches) {
      const matches = this.matchDetector.findMatches(this.grid.getAllBlocks());

      if (matches.length === 0) {
        hasMatches = false;
        break;
      }

      const isCombo = comboCount > 0;
      const score = this.scoreCalculator.calculateTotalScore(matches, isCombo, comboCount);

      this.gameState.addScore(score);

      if (isCombo) {
        this.gameState.incrementCombo();
      }

      const allMatchedPositions: Position[] = [];
      matches.forEach((match) => {
        allMatchedPositions.push(...match.blocks);
      });

      await this.animationController.animateRemove(allMatchedPositions);

      this.grid.removeBlocks(allMatchedPositions);
      this.renderGame();

      const movedBlocks = this.grid.applyGravity();
      if (movedBlocks.length > 0) {
        this.renderGame();
      }

      const newBlocks = this.grid.fillEmptySpaces();
      if (newBlocks.length > 0) {
        this.renderGame();
      }

      comboCount++;

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (comboCount > 0) {
      this.gameState.resetCombo();
    }
  }

  private updateScoreDisplay(score: number): void {
    if (this.scoreText) {
      this.scoreText.text = `💎 ${score}`;
    }
  }

  private updateMovesDisplay(moves: number): void {
    if (this.movesText) {
      this.movesText.text = `👆 ${moves}`;
    }
  }

  destroy(): void {
    this.inputHandler.destroy();
    this.renderer.destroy();
    this.comboCounter.destroy();
    EventBus.removeAllListeners();
    super.destroy();
  }
}
