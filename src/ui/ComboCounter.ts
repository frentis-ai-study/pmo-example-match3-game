import { Container, Text } from 'pixi.js';
import Logger from '../utils/Logger';

/**
 * ComboCounter
 * 콤보 카운터를 표시하는 UI 컴포넌트입니다.
 */
export class ComboCounter {
  private container: Container;
  private comboText: Text;

  constructor(x: number, y: number) {
    this.container = new Container();
    this.container.x = x;
    this.container.y = y;

    // 콤보 텍스트
    this.comboText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: 0xffaa00,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 },
      },
    });
    this.comboText.anchor.set(0.5);

    this.container.addChild(this.comboText);
    this.container.visible = false;

    Logger.info('ComboCounter created');
  }

  /**
   * 콤보 카운트 업데이트
   */
  update(comboCount: number): void {
    if (comboCount > 0) {
      this.comboText.text = `Combo x${comboCount}!`;
      this.show();

      // 애니메이션 효과
      this.comboText.scale.set(1.5);
      this.animateScale();
    } else {
      this.hide();
    }
  }

  /**
   * 스케일 애니메이션
   */
  private animateScale(): void {
    const startTime = Date.now();
    const duration = 300;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 2);

      this.comboText.scale.set(1.5 - eased * 0.5);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * 표시
   */
  private show(): void {
    this.container.visible = true;
  }

  /**
   * 숨기기
   */
  private hide(): void {
    this.container.visible = false;
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
    Logger.info('ComboCounter destroyed');
  }
}
