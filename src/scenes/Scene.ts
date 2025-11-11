import { Application, Container } from 'pixi.js';

/**
 * Scene 베이스 클래스
 * 모든 씬(시작 화면, 게임 화면 등)의 기본 인터페이스
 */
export abstract class Scene {
  protected app: Application;
  protected container: Container;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    // 씬 컨테이너는 이벤트를 받아서 자식에게 전달
    this.container.eventMode = 'passive';
  }

  /**
   * 씬 초기화
   */
  abstract init(): void;

  /**
   * 씬 시작 (화면에 표시)
   */
  start(): void {
    console.log(`===== ${this.constructor.name}.start() =====`);
    console.log('Container before adding to stage:', {
      visible: this.container.visible,
      eventMode: this.container.eventMode,
      children: this.container.children.length
    });

    this.app.stage.addChild(this.container);

    console.log('Container added to stage');
    console.log('Stage children count:', this.app.stage.children.length);
  }

  /**
   * 씬 종료 (화면에서 제거)
   */
  stop(): void {
    this.app.stage.removeChild(this.container);
  }

  /**
   * 씬 정리
   */
  destroy(): void {
    this.stop();
    this.container.destroy({ children: true });
  }

  /**
   * 컨테이너 가져오기
   */
  getContainer(): Container {
    return this.container;
  }
}
