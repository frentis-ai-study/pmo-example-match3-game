import { Application } from 'pixi.js';
import Logger from './utils/Logger';
import EventBus from './utils/EventBus';

/**
 * 게임 메인 진입점
 * PixiJS Application을 초기화하고 게임을 시작합니다.
 */

async function main() {
  Logger.info('Game initializing...');

  try {
    // PixiJS Application 생성
    const app = new Application();

    // PixiJS 초기화
    await app.init({
      width: 800,
      height: 600,
      backgroundColor: 0x1a1a2e,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Canvas를 DOM에 추가
    const appContainer = document.querySelector('#app');
    if (!appContainer) {
      throw new Error('App container not found');
    }

    appContainer.appendChild(app.canvas);
    Logger.info('PixiJS Application initialized', {
      width: app.screen.width,
      height: app.screen.height,
    });

    // 게임 시작 이벤트 발행
    EventBus.emit({ type: 'gameStarted' });

    // 임시: 간단한 텍스트 표시
    const { Text } = await import('pixi.js');
    const text = new Text({
      text: 'Match-3 Game\nComing Soon...',
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: 0xffffff,
        align: 'center',
      },
    });

    text.anchor.set(0.5);
    text.x = app.screen.width / 2;
    text.y = app.screen.height / 2;
    app.stage.addChild(text);

    Logger.info('Game started successfully');
  } catch (error) {
    Logger.error('Failed to initialize game', error);
    throw error;
  }
}

// 게임 시작
main().catch((error) => {
  console.error('Fatal error:', error);
});
