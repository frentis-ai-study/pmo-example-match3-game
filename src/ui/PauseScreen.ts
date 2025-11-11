import { Container, Graphics, Text } from 'pixi.js';
import Logger from '../utils/Logger';

/**
 * PauseScreen
 * 일시정지 화면을 표시합니다.
 */
export class PauseScreen {
  private container: Container;
  private overlay: Graphics;
  private onResumeCallback: (() => void) | null = null;
  private onRestartCallback: (() => void) | null = null;

  constructor(width: number, height: number) {
    this.container = new Container();
    this.overlay = new Graphics();

    this.createOverlay(width, height);
    this.createUI(width, height);

    Logger.info('PauseScreen created');
  }

  /**
   * 반투명 오버레이 생성
   */
  private createOverlay(width: number, height: number): void {
    this.overlay.beginFill(0x000000, 0.7);
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
      text: 'PAUSED',
      style: {
        fontFamily: 'Arial',
        fontSize: 64,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = height / 2 - 100;
    this.container.addChild(title);

    // 재개 버튼
    const resumeButton = this.createButton('Resume', width / 2, height / 2, () => {
      if (this.onResumeCallback) {
        this.onResumeCallback();
      }
    });
    this.container.addChild(resumeButton);

    // 재시작 버튼
    const restartButton = this.createButton('Restart', width / 2, height / 2 + 80, () => {
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
    bg.beginFill(0x4444ff);
    bg.drawRoundedRect(-100, -25, 200, 50, 10);
    bg.endFill();

    bg.setStrokeStyle({ width: 2, color: 0xffffff });
    bg.drawRoundedRect(-100, -25, 200, 50, 10);

    button.addChild(bg);

    // 버튼 텍스트
    const buttonText = new Text({
      text,
      style: {
        fontFamily: 'Arial',
        fontSize: 32,
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
      bg.tint = 0xaaaaff;
    });

    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });

    return button;
  }

  /**
   * 재개 콜백 등록
   */
  onResume(callback: () => void): void {
    this.onResumeCallback = callback;
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
  show(): void {
    this.container.visible = true;
    this.container.eventMode = 'static'; // 이벤트 활성화
    Logger.debug('PauseScreen shown');
  }

  /**
   * 화면 숨기기
   */
  hide(): void {
    this.container.visible = false;
    this.container.eventMode = 'none'; // 이벤트 차단
    Logger.debug('PauseScreen hidden');
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
    Logger.info('PauseScreen destroyed');
  }
}
