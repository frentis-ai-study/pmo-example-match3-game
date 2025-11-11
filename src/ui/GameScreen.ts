import { Application, Text } from 'pixi.js';
import { Grid } from '../game/Grid';
import { GameState } from '../game/GameState';
import { MatchDetector } from '../game/MatchDetector';
import { ScoreCalculator } from '../game/ScoreCalculator';
import { Renderer } from '../rendering/Renderer';
import { AnimationController } from '../rendering/AnimationController';
import { InputHandler } from '../rendering/InputHandler';
import { StartScreen } from './StartScreen';
import { PauseScreen } from './PauseScreen';
import { GameOverScreen } from './GameOverScreen';
import { ComboCounter } from './ComboCounter';
import { StorageManager } from '../storage/StorageManager';
import type { Position } from '../types';
import Logger from '../utils/Logger';
import EventBus from '../utils/EventBus';

/**
 * GameScreen
 * 게임의 메인 화면이자 컨트롤러 역할을 합니다.
 * 모든 게임 로직과 렌더링을 통합합니다.
 */
export class GameScreen {
  private app: Application;
  private grid: Grid;
  private gameState: GameState;
  private matchDetector: MatchDetector;
  private scoreCalculator: ScoreCalculator;
  private renderer: Renderer;
  private animationController: AnimationController;
  private inputHandler: InputHandler;
  private startScreen: StartScreen;
  private pauseScreen: PauseScreen;
  private gameOverScreen: GameOverScreen;
  private comboCounter: ComboCounter;
  private scoreText: Text | null = null;
  private pauseButton: Text | null = null;
  private movesText: Text | null = null;
  private titleText: Text | null = null;
  private isProcessing: boolean = false;

  constructor(app: Application) {
    this.app = app;

    // 게임 로직 초기화
    this.grid = new Grid();
    this.gameState = new GameState();
    this.matchDetector = new MatchDetector();
    this.scoreCalculator = new ScoreCalculator();

    // 렌더링 초기화
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

    // UI 화면 초기화
    this.startScreen = new StartScreen(app.screen.width, app.screen.height);
    this.pauseScreen = new PauseScreen(app.screen.width, app.screen.height);
    this.gameOverScreen = new GameOverScreen(app.screen.width, app.screen.height);
    this.comboCounter = new ComboCounter(app.screen.width / 2, app.screen.height / 2 - 150);

    // UI 컨테이너에 추가
    app.stage.addChild(this.startScreen.getContainer());
    app.stage.addChild(this.pauseScreen.getContainer());
    app.stage.addChild(this.gameOverScreen.getContainer());
    app.stage.addChild(this.comboCounter.getContainer());

    // 초기에는 시작 화면만 표시
    this.startScreen.show();
    this.pauseScreen.hide();
    this.gameOverScreen.hide();

    this.setupEventListeners();
    this.setupUI();
    this.setupScreenCallbacks();

    // 시작 화면에서는 게임 입력 비활성화
    this.inputHandler.disable();

    Logger.info('GameScreen initialized');
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 스와이프 이벤트
    this.inputHandler.onSwipe(this.handleSwipe.bind(this));

    // 선택 변경 이벤트 (클릭-클릭 방식)
    this.inputHandler.onSelectionChange((selected) => {
      if (selected) {
        // 블록이 선택되면 하이라이트 표시
        this.renderer.showSelectionHighlight(selected.row, selected.col);
      } else {
        // 선택 해제되면 하이라이트 제거
        this.renderer.clearSelectionHighlight();
      }
    });

    // 점수 업데이트 이벤트
    EventBus.on('scoreUpdated', (event) => {
      this.updateScoreDisplay(event.score);
    });

    // 콤보 이벤트
    EventBus.on('comboDetected', (event) => {
      this.comboCounter.update(event.comboCount);
    });
  }

  /**
   * UI 설정
   */
  private setupUI(): void {
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
    this.titleText.x = this.app.screen.width / 2;
    this.titleText.y = 15;
    this.renderer.getUIContainer().addChild(this.titleText);

    // 점수 표시 (왼쪽 상단)
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

    // 이동 횟수 표시 (왼쪽)
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

    // 일시정지 버튼 (오른쪽 상단)
    this.pauseButton = new Text('⏸️ Pause', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 22,
      fontWeight: 'bold',
      fill: 0xffffff,
      stroke: { color: 0x2a2e5f, width: 2 },
    });
    this.pauseButton.anchor.set(1, 0);
    this.pauseButton.x = this.app.screen.width - 25;
    this.pauseButton.y = 75;
    this.pauseButton.eventMode = 'static';
    this.pauseButton.cursor = 'pointer';
    this.pauseButton.on('pointerdown', () => {
      this.togglePause();
    });
    // 호버 효과
    this.pauseButton.on('pointerover', () => {
      this.pauseButton!.scale.set(1.1);
    });
    this.pauseButton.on('pointerout', () => {
      this.pauseButton!.scale.set(1);
    });
    this.renderer.getUIContainer().addChild(this.pauseButton);
  }

  /**
   * 화면 콜백 설정
   */
  private setupScreenCallbacks(): void {
    // 시작 화면 콜백
    this.startScreen.onPlay(() => {
      this.startScreen.hide();
      this.start();
    });

    // 일시정지 화면 콜백
    this.pauseScreen.onResume(() => {
      this.resume();
    });

    this.pauseScreen.onRestart(() => {
      this.pauseScreen.hide();
      this.restart();
    });

    // 게임 오버 화면 콜백
    this.gameOverScreen.onRestart(() => {
      this.gameOverScreen.hide();
      this.restart();
    });
  }

  /**
   * 일시정지 토글
   */
  private togglePause(): void {
    if (this.gameState.phase === 'playing') {
      this.pause();
    } else if (this.gameState.phase === 'paused') {
      this.resume();
    }
  }

  /**
   * 게임 시작
   */
  start(): void {
    // 저장된 게임 상태 확인
    if (StorageManager.hasSave()) {
      const savedState = StorageManager.load();
      if (savedState) {
        this.gameState.fromData(savedState);
        this.grid.setGridState(savedState.grid);
        Logger.info('Restored game from save');
      }
    }

    if (this.gameState.phase === 'idle') {
      this.gameState.start();
    }

    this.renderGame();
    this.updateScoreDisplay(this.gameState.score);
    this.updateMovesDisplay(this.gameState.moves);
    this.inputHandler.enable();

    Logger.info('Game started');
  }

  /**
   * 게임 렌더링
   */
  private renderGame(): void {
    const blocks = this.grid.getAllBlocks();
    this.renderer.renderGrid(blocks, this.grid.getRows(), this.grid.getCols());
  }

  /**
   * 스와이프 처리
   */
  private async handleSwipe(from: Position, to: Position): Promise<void> {
    if (this.isProcessing) {
      Logger.debug('Already processing, ignoring swipe');
      return;
    }

    if (this.gameState.phase !== 'playing') {
      Logger.debug('Game not in playing state, ignoring swipe');
      return;
    }

    this.isProcessing = true;
    this.inputHandler.disable();

    try {
      // 블록 교환
      const swapped = this.grid.swapBlocks(from, to);

      if (!swapped) {
        Logger.warn('Failed to swap blocks');
        this.isProcessing = false;
        this.inputHandler.enable();
        return;
      }

      // 교환 애니메이션
      await this.animationController.animateSwap(from, to);

      // 매칭 확인
      const matches = this.matchDetector.findMatches(this.grid.getAllBlocks());

      if (matches.length === 0) {
        // 매칭 없으면 되돌리기
        Logger.debug('No matches, swapping back');
        this.grid.swapBlocks(from, to);
        await this.animationController.animateSwap(to, from);

        this.isProcessing = false;
        this.inputHandler.enable();
        return;
      }

      // 이동 횟수 증가
      this.gameState.incrementMoves();
      this.updateMovesDisplay(this.gameState.moves);

      // 콤보 초기화 (첫 매칭)
      this.gameState.resetCombo();

      // 매칭 처리 (연쇄 반응 포함)
      await this.processCascades();
    } catch (error) {
      Logger.error('Error handling swipe', error);
    } finally {
      this.isProcessing = false;
      this.inputHandler.enable();
    }
  }

  /**
   * 연쇄 반응 처리 (T034)
   */
  private async processCascades(): Promise<void> {
    let hasMatches = true;
    let comboCount = 0;

    while (hasMatches) {
      const matches = this.matchDetector.findMatches(this.grid.getAllBlocks());

      if (matches.length === 0) {
        hasMatches = false;
        break;
      }

      // 점수 계산
      const isCombo = comboCount > 0;
      const score = this.scoreCalculator.calculateTotalScore(matches, isCombo, comboCount);

      this.gameState.addScore(score);

      if (isCombo) {
        this.gameState.incrementCombo();
      }

      // 매칭된 블록 수집
      const allMatchedPositions: Position[] = [];
      matches.forEach((match) => {
        allMatchedPositions.push(...match.blocks);
      });

      // 제거 애니메이션
      await this.animationController.animateRemove(allMatchedPositions);

      // 블록 제거
      this.grid.removeBlocks(allMatchedPositions);

      // 렌더링 업데이트
      this.renderGame();

      // 중력 적용
      const movedBlocks = this.grid.applyGravity();

      if (movedBlocks.length > 0) {
        // 중력 애니메이션은 생략 (즉시 적용)
        this.renderGame();
      }

      // 빈 공간 채우기
      const newBlocks = this.grid.fillEmptySpaces();

      if (newBlocks.length > 0) {
        this.renderGame();
        // 생성 애니메이션은 생략
      }

      // 콤보 카운트 증가
      comboCount++;

      // 다음 매칭 확인을 위해 짧은 딜레이
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // 연쇄 완료
    if (comboCount > 0) {
      this.gameState.resetCombo();
    }

    Logger.debug(`Cascade finished: ${comboCount} combos`);
  }

  /**
   * 점수 표시 업데이트
   */
  private updateScoreDisplay(score: number): void {
    if (this.scoreText) {
      this.scoreText.text = `💎 ${score}`;
    }
  }

  /**
   * 이동 횟수 표시 업데이트
   */
  private updateMovesDisplay(moves: number): void {
    if (this.movesText) {
      this.movesText.text = `👆 ${moves}`;
    }
  }

  /**
   * 게임 일시정지
   */
  pause(): void {
    this.gameState.pause();
    this.inputHandler.disable();
    this.pauseScreen.show();

    // 게임 상태 저장
    this.saveGameState();

    Logger.info('Game paused');
  }

  /**
   * 게임 재개
   */
  resume(): void {
    this.gameState.resume();
    this.inputHandler.enable();
    this.pauseScreen.hide();

    Logger.info('Game resumed');
  }

  /**
   * 게임 종료
   */
  gameOver(): void {
    this.gameState.gameOver();
    this.inputHandler.disable();
    this.gameOverScreen.show(this.gameState.score);

    // 저장된 게임 상태 삭제
    StorageManager.clear();

    Logger.info('Game over', { finalScore: this.gameState.score });
  }

  /**
   * 게임 재시작
   */
  restart(): void {
    this.grid.reset();
    this.gameState.reset();
    this.animationController.cancelAll();

    // 저장된 게임 상태 삭제
    StorageManager.clear();

    // 시작 화면 표시
    this.startScreen.show();

    Logger.info('Game restarted');
  }

  /**
   * 게임 상태 저장
   */
  private saveGameState(): void {
    this.gameState.setGridState(this.grid.getAllBlocks());
    const stateData = this.gameState.toData();
    StorageManager.save(stateData);
  }

  /**
   * 디버그/테스트용 getter 메서드
   */
  getGameState(): GameState {
    return this.gameState;
  }

  getGrid(): Grid {
    return this.grid;
  }

  getPauseScreen(): PauseScreen {
    return this.pauseScreen;
  }

  getGameOverScreen(): GameOverScreen {
    return this.gameOverScreen;
  }

  /**
   * 정리
   */
  destroy(): void {
    this.inputHandler.destroy();
    this.renderer.destroy();
    this.startScreen.destroy();
    this.pauseScreen.destroy();
    this.gameOverScreen.destroy();
    this.comboCounter.destroy();
    EventBus.removeAllListeners();

    Logger.info('GameScreen destroyed');
  }
}
