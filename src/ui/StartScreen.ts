import { Container, Graphics, Text } from 'pixi.js';
import Logger from '../utils/Logger';

/**
 * StartScreen
 * 게임 시작 화면을 표시합니다.
 */
export class StartScreen {
  private container: Container;
  private overlay: Graphics;
  private onPlayCallback: (() => void) | null = null;

  constructor(width: number, height: number) {
    this.container = new Container();
    this.overlay = new Graphics();

    this.createOverlay(width, height);
    this.createUI(width, height);

    Logger.info('StartScreen created');
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
    // 게임 타이틀
    const title = new Text({
      text: '🍎 Fruit Match 🍇',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 72,
        fontWeight: 'bold',
        fill: 0xffd93d,
        stroke: { color: 0x2a2e5f, width: 6 },
        dropShadow: {
          color: 0x000000,
          angle: Math.PI / 6,
          blur: 4,
          distance: 8,
          alpha: 0.7,
        },
      },
    });
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = height / 2 - 150;
    this.container.addChild(title);

    // 게임 설명
    const instructions = new Text({
      text: '🎮 같은 과일을 3개 이상 연결하세요!\n\n' +
            '💡 드래그하거나 클릭-클릭으로 블록을 교환하세요\n' +
            '⭐ 연쇄 콤보로 높은 점수를 획득하세요',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center',
        lineHeight: 36,
      },
    });
    instructions.anchor.set(0.5);
    instructions.x = width / 2;
    instructions.y = height / 2 - 20;
    this.container.addChild(instructions);

    // 플레이 버튼
    const playButton = this.createButton('▶️  시작하기', width / 2, height / 2 + 120, () => {
      Logger.debug('Play button clicked');
      if (this.onPlayCallback) {
        Logger.debug('Calling onPlayCallback');
        this.onPlayCallback();
      } else {
        Logger.warn('onPlayCallback is null');
      }
    });
    this.container.addChild(playButton);

    // 프로젝트 정보
    const projectInfo = new Text({
      text: '한국PMO협회 PMO 전문가과정\n"바이브 코딩 시대의 SDLC 혁신 전략" 데모',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fill: 0xaaaaaa,
        align: 'center',
        lineHeight: 24,
      },
    });
    projectInfo.anchor.set(0.5);
    projectInfo.x = width / 2;
    projectInfo.y = height - 60;
    this.container.addChild(projectInfo);
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
    bg.drawRoundedRect(-120, -30, 240, 60, 15);
    bg.endFill();

    // 버튼 테두리
    bg.setStrokeStyle({ width: 3, color: 0xffffff, alpha: 0.8 });
    bg.drawRoundedRect(-120, -30, 240, 60, 15);

    // 하이라이트 효과
    bg.beginFill(0xffffff, 0.2);
    bg.drawRoundedRect(-115, -25, 230, 25, 12);
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
   * 플레이 콜백 등록
   */
  onPlay(callback: () => void): void {
    this.onPlayCallback = callback;
  }

  /**
   * 화면 표시
   */
  show(): void {
    this.container.visible = true;
    this.container.eventMode = 'static'; // 이벤트 활성화
    Logger.debug('StartScreen shown');
  }

  /**
   * 화면 숨기기
   */
  hide(): void {
    this.container.visible = false;
    this.container.eventMode = 'none'; // 이벤트 차단
    Logger.debug('StartScreen hidden');
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
    Logger.info('StartScreen destroyed');
  }
}
