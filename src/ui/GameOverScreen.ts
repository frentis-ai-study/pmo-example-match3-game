import { Container, Graphics, Text } from 'pixi.js';
import Logger from '../utils/Logger';

/**
 * GameOverScreen
 * 게임 오버 화면을 표시합니다.
 */
export class GameOverScreen {
  private container: Container;
  private overlay: Graphics;
  private scoreText: Text | null = null;
  private onRestartCallback: (() => void) | null = null;

  constructor(width: number, height: number) {
    this.container = new Container();
    this.overlay = new Graphics();

    this.createOverlay(width, height);
    this.createUI(width, height);

    Logger.info('GameOverScreen created');
  }

  /**
   * 반투명 오버레이 생성
   */
  private createOverlay(width: number, height: number): void {
    this.overlay.beginFill(0x000000, 0.8);
    this.overlay.drawRect(0, 0, width, height);
    this.overlay.endFill();

    this.container.addChild(this.overlay);
  }

  /**
   * UI 요소 생성
   */
  private createUI(width: number, height: number): void {
    // 제목
    const title = new Text({
      text: 'GAME OVER',
      style: {
        fontFamily: 'Arial',
        fontSize: 64,
        fill: 0xff4444,
        fontWeight: 'bold',
      },
    });
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = height / 2 - 150;
    this.container.addChild(title);

    // 점수 표시
    this.scoreText = new Text({
      text: 'Final Score: 0',
      style: {
        fontFamily: 'Arial',
        fontSize: 40,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    this.scoreText.anchor.set(0.5);
    this.scoreText.x = width / 2;
    this.scoreText.y = height / 2 - 50;
    this.container.addChild(this.scoreText);

    // 재시작 버튼
    const restartButton = this.createButton('Play Again', width / 2, height / 2 + 50, () => {
      if (this.onRestartCallback) {
        this.onRestartCallback();
      }
    });
    this.container.addChild(restartButton);
  }

  /**
   * 버튼 생성
   */
  private createButton(
    text: string,
    x: number,
    y: number,
    onClick: () => void
  ): Container {
    const button = new Container();

    // 버튼 배경
    const bg = new Graphics();
    bg.beginFill(0x44ff44);
    bg.drawRoundedRect(-120, -30, 240, 60, 10);
    bg.endFill();

    bg.lineStyle(3, 0xffffff);
    bg.drawRoundedRect(-120, -30, 240, 60, 10);

    button.addChild(bg);

    // 버튼 텍스트
    const buttonText = new Text({
      text,
      style: {
        fontFamily: 'Arial',
        fontSize: 36,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    buttonText.anchor.set(0.5);
    button.addChild(buttonText);

    button.x = x;
    button.y = y;

    // 인터랙티브 설정
    button.eventMode = 'static';
    button.cursor = 'pointer';

    button.on('pointerdown', onClick);

    // 호버 효과
    button.on('pointerover', () => {
      bg.tint = 0xaaffaa;
    });

    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });

    return button;
  }

  /**
   * 최종 점수 설정
   */
  setFinalScore(score: number): void {
    if (this.scoreText) {
      this.scoreText.text = `Final Score: ${score}`;
    }
  }

  /**
   * 재시작 콜백 등록
   */
  onRestart(callback: () => void): void {
    this.onRestartCallback = callback;
  }

  /**
   * 화면 표시
   */
  show(finalScore: number): void {
    this.setFinalScore(finalScore);
    this.container.visible = true;
    Logger.info('GameOverScreen shown', { finalScore });
  }

  /**
   * 화면 숨기기
   */
  hide(): void {
    this.container.visible = false;
    Logger.debug('GameOverScreen hidden');
  }

  /**
   * 컨테이너 가져오기
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * 정리
   */
  destroy(): void {
    this.container.destroy({ children: true });
    Logger.info('GameOverScreen destroyed');
  }
}
