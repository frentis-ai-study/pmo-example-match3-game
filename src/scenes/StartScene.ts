import { Application, Container, Graphics, Text } from 'pixi.js';
import { Scene } from './Scene';
import Logger from '../utils/Logger';

/**
 * StartScene
 * 게임 시작 화면 씬
 */
export class StartScene extends Scene {
  private onStartCallback: (() => void) | null = null;

  constructor(app: Application) {
    super(app);
  }

  init(): void {
    console.log('===== StartScene.init() CALLED =====');
    const width = this.app.screen.width;
    const height = this.app.screen.height;

    console.log('Screen dimensions:', { width, height });

    // 배경
    const bg = new Graphics();
    bg.beginFill(0x000000, 0.8);
    bg.drawRect(0, 0, width, height);
    bg.endFill();
    bg.eventMode = 'none';
    this.container.addChild(bg);

    console.log('Background added:', { eventMode: bg.eventMode });

    // 타이틀
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

    // 설명
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

    // 시작 버튼
    const startButton = this.createButton('▶️  시작하기', width / 2, height / 2 + 120);
    console.log('Start button created:', {
      x: startButton.x,
      y: startButton.y,
      eventMode: startButton.eventMode,
      cursor: startButton.cursor
    });
    this.container.addChild(startButton);
    console.log('Start button added to container');

    // 프로젝트 정보
    const info = new Text({
      text: '한국PMO협회 PMO 전문가과정\n"바이브 코딩 시대의 SDLC 혁신 전략" 데모',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fill: 0xaaaaaa,
        align: 'center',
        lineHeight: 24,
      },
    });
    info.anchor.set(0.5);
    info.x = width / 2;
    info.y = height - 60;
    this.container.addChild(info);

    console.log('===== StartScene.init() COMPLETE =====');
    console.log('Container state:', {
      children: this.container.children.length,
      visible: this.container.visible,
      eventMode: this.container.eventMode
    });

    Logger.info('StartScene initialized');
  }

  private createButton(text: string, x: number, y: number): Container {
    const button = new Container();

    // 배경
    const bg = new Graphics();
    bg.beginFill(0x4caf50);
    bg.drawRoundedRect(-120, -30, 240, 60, 15);
    bg.endFill();
    bg.setStrokeStyle({ width: 3, color: 0xffffff, alpha: 0.8 });
    bg.drawRoundedRect(-120, -30, 240, 60, 15);
    bg.beginFill(0xffffff, 0.2);
    bg.drawRoundedRect(-115, -25, 230, 25, 12);
    bg.endFill();
    bg.eventMode = 'none';
    button.addChild(bg);

    // 텍스트
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
    buttonText.eventMode = 'none';
    button.addChild(buttonText);

    button.x = x;
    button.y = y;
    button.eventMode = 'static';
    button.cursor = 'pointer';

    console.log('Setting up button events...');

    button.on('pointerdown', () => {
      console.log('***** BUTTON POINTERDOWN *****');
      Logger.info('Start button clicked');
      if (this.onStartCallback) {
        this.onStartCallback();
      }
    });

    button.on('pointerover', () => {
      console.log('***** BUTTON HOVER *****');
      button.scale.set(1.05);
      bg.tint = 0xddffdd;
    });

    button.on('pointerout', () => {
      console.log('***** BUTTON HOVER OUT *****');
      button.scale.set(1);
      bg.tint = 0xffffff;
    });

    console.log('Button events registered');

    return button;
  }

  onStart(callback: () => void): void {
    this.onStartCallback = callback;
  }
}
