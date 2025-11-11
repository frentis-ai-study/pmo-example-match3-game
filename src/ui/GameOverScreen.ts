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

    // 오버레이는 배경일 뿐이므로 이벤트를 받지 않도록
    this.overlay.eventMode = 'none';

    this.container.addChild(this.overlay);
  }

  /**
   * UI 요소 생성
   */
  private createUI(width: number, height: number): void {
    // 제목
    const title = new Text({
      text: '🎮 게임 종료',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 64,
        fill: 0xffd93d,
        fontWeight: 'bold',
        stroke: { color: 0x2a2e5f, width: 5 },
        dropShadow: {
          color: 0x000000,
          angle: Math.PI / 6,
          blur: 6,
          distance: 8,
          alpha: 0.7,
        },
      },
    });
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = height / 2 - 160;
    this.container.addChild(title);

    // 격려 메시지
    const message = new Text({
      text: '수고하셨습니다! 🎉',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 28,
        fill: 0xffffff,
        fontWeight: 'normal',
      },
    });
    message.anchor.set(0.5);
    message.x = width / 2;
    message.y = height / 2 - 90;
    this.container.addChild(message);

    // 점수 표시
    this.scoreText = new Text({
      text: '💎 최종 점수: 0',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 48,
        fill: 0xffd93d,
        fontWeight: 'bold',
        stroke: { color: 0x2a2e5f, width: 4 },
      },
    });
    this.scoreText.anchor.set(0.5);
    this.scoreText.x = width / 2;
    this.scoreText.y = height / 2 - 10;
    this.container.addChild(this.scoreText);

    // 재시작 버튼
    const restartButton = this.createButton('🔄  다시 시작하기', width / 2, height / 2 + 90, () => {
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
    bg.beginFill(0x4caf50); // 녹색 버튼
    bg.drawRoundedRect(-140, -30, 280, 60, 15);
    bg.endFill();

    // 버튼 테두리
    bg.setStrokeStyle({ width: 3, color: 0xffffff, alpha: 0.8 });
    bg.drawRoundedRect(-140, -30, 280, 60, 15);

    // 하이라이트 효과
    bg.beginFill(0xffffff, 0.2);
    bg.drawRoundedRect(-135, -25, 270, 25, 12);
    bg.endFill();

    bg.eventMode = 'none'; // 배경은 이벤트를 받지 않도록
    button.addChild(bg);

    // 버튼 텍스트
    const buttonText = new Text({
      text,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 32,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    buttonText.anchor.set(0.5);
    buttonText.eventMode = 'none'; // 텍스트는 이벤트를 받지 않도록
    button.addChild(buttonText);

    button.x = x;
    button.y = y;

    // 인터랙티브 설정
    button.eventMode = 'static';
    button.cursor = 'pointer';

    button.on('pointerdown', onClick);

    // 호버 효과
    button.on('pointerover', () => {
      button.scale.set(1.05);
      bg.tint = 0xddffdd;
    });

    button.on('pointerout', () => {
      button.scale.set(1);
      bg.tint = 0xffffff;
    });

    return button;
  }

  /**
   * 최종 점수 설정
   */
  setFinalScore(score: number): void {
    if (this.scoreText) {
      this.scoreText.text = `💎 최종 점수: ${score}`;
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
    this.container.eventMode = 'static'; // 이벤트 활성화
    Logger.info('GameOverScreen shown', { finalScore });
  }

  /**
   * 화면 숨기기
   */
  hide(): void {
    this.container.visible = false;
    this.container.eventMode = 'none'; // 이벤트 차단
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
