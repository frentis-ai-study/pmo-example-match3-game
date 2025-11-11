import Phaser from 'phaser';
import { PhaserStartScene } from './phaser-scenes/PhaserStartScene';
import { PhaserGameScene } from './phaser-scenes/PhaserGameScene';
import Logger from './utils/Logger';

/**
 * Phaser 3 게임 설정
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 750,
  backgroundColor: '#0a0e27',
  parent: 'app',
  scale: {
    mode: Phaser.Scale.NONE, // 스케일링 비활성화
    autoCenter: Phaser.Scale.NO_CENTER,
  },
  scene: [PhaserStartScene, PhaserGameScene],
};

/**
 * 게임 시작
 */
function main() {
  Logger.info('Starting Phaser game...');

  const game = new Phaser.Game(config);

  // 디버깅용 전역 변수
  (window as any).game = game;

  Logger.info('Phaser game initialized');
}

// 게임 시작
main();
