import { Application } from 'pixi.js';
import Logger from './utils/Logger';
import { GameScreen } from './ui/GameScreen';

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
      height: 750,
      backgroundColor: 0x0a0e27,
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

    // GameScreen 생성 및 시작
    const gameScreen = new GameScreen(app);
    gameScreen.start();

    Logger.info('Game started successfully');

    // 전역 변수로 노출 (디버깅용)
    (window as any).gameScreen = gameScreen;
  } catch (error) {
    Logger.error('Failed to initialize game', error);
    throw error;
  }
}

// 게임 시작
main().catch((error) => {
  console.error('Fatal error:', error);
});
