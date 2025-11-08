import { Application, Text } from 'pixi.js';
import { Grid } from '../game/Grid';
import { GameState } from '../game/GameState';
import { MatchDetector } from '../game/MatchDetector';
import { ScoreCalculator } from '../game/ScoreCalculator';
import { Renderer } from '../rendering/Renderer';
import { AnimationController } from '../rendering/AnimationController';
import { InputHandler } from '../rendering/InputHandler';
import { PauseScreen } from './PauseScreen';
import { GameOverScreen } from './GameOverScreen';
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
  private pauseScreen: PauseScreen;
  private gameOverScreen: GameOverScreen;
  private scoreText: Text | null = null;
  private pauseButton: Text | null = null;
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
    this.pauseScreen = new PauseScreen(app.screen.width, app.screen.height);
    this.gameOverScreen = new GameOverScreen(app.screen.width, app.screen.height);

    // UI 컨테이너에 추가
    app.stage.addChild(this.pauseScreen.getContainer());
    app.stage.addChild(this.gameOverScreen.getContainer());

    // 초기에는 숨김
    this.pauseScreen.hide();
    this.gameOverScreen.hide();

    this.setupEventListeners();
    this.setupUI();
    this.setupScreenCallbacks();

    Logger.info('GameScreen initialized');
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 스와이프 이벤트
    this.inputHandler.onSwipe(this.handleSwipe.bind(this));

    // 점수 업데이트 이벤트
    EventBus.on('scoreUpdated', (event) => {
      this.updateScoreDisplay(event.score);
    });
  }

  /**
   * UI 설정
   */
  private setupUI(): void {
    // 점수 표시
    this.scoreText = this.renderer.renderText('Score: 0', 20, 20, 32);

    // 일시정지 버튼
    this.pauseButton = this.renderer.renderText(
      'Pause',
      this.app.screen.width - 100,
      20,
      28
    );
    this.pauseButton.eventMode = 'static';
    this.pauseButton.cursor = 'pointer';
    this.pauseButton.on('pointerdown', () => {
      this.togglePause();
    });
  }

  /**
   * 화면 콜백 설정
   */
  private setupScreenCallbacks(): void {
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
      this.scoreText.text = `Score: ${score}`;
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

    this.renderGame();
    this.start();

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
   * 정리
   */
  destroy(): void {
    this.inputHandler.destroy();
    this.renderer.destroy();
    this.pauseScreen.destroy();
    this.gameOverScreen.destroy();
    EventBus.removeAllListeners();

    Logger.info('GameScreen destroyed');
  }
}
