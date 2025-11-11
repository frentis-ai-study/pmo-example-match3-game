import { Application } from 'pixi.js';
import Logger from './utils/Logger';
import { Scene } from './scenes/Scene';
import { StartScene } from './scenes/StartScene';
import { GameScene } from './scenes/GameScene';

/**
 * 게임 메인 진입점
 * Scene Manager 패턴으로 시작 화면과 게임 화면을 관리합니다.
 */

class SceneManager {
  private app: Application;
  private currentScene: Scene | null = null;

  constructor(app: Application) {
    this.app = app;
  }

  switchTo(SceneClass: typeof Scene): Scene {
    // 기존 씬 정리
    if (this.currentScene) {
      this.currentScene.destroy();
    }

    // 새 씬 생성 및 시작
    const newScene = new (SceneClass as any)(this.app) as Scene;
    newScene.init();
    newScene.start();
    this.currentScene = newScene;

    Logger.info(`Switched to ${SceneClass.name}`);

    return newScene;
  }

  getCurrentScene(): Scene | null {
    return this.currentScene;
  }
}

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

    // Scene Manager 생성
    const sceneManager = new SceneManager(app);

    // 시작 화면 표시
    const startScene = sceneManager.switchTo(StartScene) as StartScene;

    // 시작 버튼 클릭 시 게임 화면으로 전환
    startScene.onStart(() => {
      Logger.info('Starting game...');
      sceneManager.switchTo(GameScene);
    });

    Logger.info('Game initialized successfully');

    // 전역 변수로 노출 (디버깅용)
    (window as any).sceneManager = sceneManager;
  } catch (error) {
    Logger.error('Failed to initialize game', error);
    throw error;
  }
}

// 게임 시작
main().catch((error) => {
  console.error('Fatal error:', error);
});
