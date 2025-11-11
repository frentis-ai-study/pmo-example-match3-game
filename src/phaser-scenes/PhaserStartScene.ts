import Phaser from 'phaser';
import Logger from '../utils/Logger';

/**
 * Phaser 시작 화면 씬
 */
export class PhaserStartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 배경
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // 타이틀
    this.add.text(width / 2, height / 2 - 150, '🍎 Fruit Match 🍇', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '72px',
      fontStyle: 'bold',
      color: '#ffd93d',
      stroke: '#2a2e5f',
      strokeThickness: 6,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000000',
        blur: 4,
        fill: true,
      },
    }).setOrigin(0.5);

    // 설명
    this.add.text(width / 2, height / 2 - 20,
      '🎮 같은 과일을 3개 이상 연결하세요!\n\n' +
      '💡 드래그하거나 클릭-클릭으로 블록을 교환하세요\n' +
      '⭐ 연쇄 콤보로 높은 점수를 획득하세요', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 12,
    }).setOrigin(0.5);

    // 시작 버튼
    const button = this.createButton(width / 2, height / 2 + 120, '▶️  시작하기');

    // 버튼 클릭 이벤트
    button.on('pointerdown', () => {
      Logger.info('Start button clicked');
      this.scene.start('GameScene');
    });

    // 프로젝트 정보
    this.add.text(width / 2, height - 60,
      '한국PMO협회 PMO 전문가과정\n"바이브 코딩 시대의 SDLC 혁신 전략" 데모', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    Logger.info('PhaserStartScene created');
  }

  private createButton(x: number, y: number, text: string): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    // 배경 그래픽
    const bg = this.add.graphics();
    bg.fillStyle(0x4caf50, 1);
    bg.fillRoundedRect(-120, -30, 240, 60, 15);
    bg.lineStyle(3, 0xffffff, 0.8);
    bg.strokeRoundedRect(-120, -30, 240, 60, 15);
    bg.fillStyle(0xffffff, 0.2);
    bg.fillRoundedRect(-115, -25, 230, 25, 12);

    // 버튼 텍스트
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    button.add([bg, buttonText]);

    // 인터랙티브 설정 (Phaser는 매우 간단!)
    button.setSize(240, 60);
    button.setInteractive({ useHandCursor: true });

    // 호버 효과
    button.on('pointerover', () => {
      button.setScale(1.05);
      bg.clear();
      bg.fillStyle(0x5cd65c, 1); // 밝은 녹색
      bg.fillRoundedRect(-120, -30, 240, 60, 15);
      bg.lineStyle(3, 0xffffff, 0.8);
      bg.strokeRoundedRect(-120, -30, 240, 60, 15);
      bg.fillStyle(0xffffff, 0.2);
      bg.fillRoundedRect(-115, -25, 230, 25, 12);
    });

    button.on('pointerout', () => {
      button.setScale(1);
      bg.clear();
      bg.fillStyle(0x4caf50, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 15);
      bg.lineStyle(3, 0xffffff, 0.8);
      bg.strokeRoundedRect(-120, -30, 240, 60, 15);
      bg.fillStyle(0xffffff, 0.2);
      bg.fillRoundedRect(-115, -25, 230, 25, 12);
    });

    return button;
  }
}
