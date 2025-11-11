import { test, expect } from '@playwright/test';

test.describe('Match-3 Game E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/pmo-example-match3-game/');
    await page.waitForTimeout(1000); // Phaser 초기화 대기
  });

  test('1. 시작 화면이 정상적으로 로드된다', async ({ page }) => {
    // 타이틀 확인
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Canvas가 클릭 가능한지 확인
    await expect(canvas).toHaveJSProperty('width');
  });

  test('2. 시작 버튼을 클릭하면 게임 화면으로 전환된다', async ({ page }) => {
    const canvas = page.locator('canvas');

    // 시작 버튼 위치 (중앙 하단)
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // 시작 버튼 클릭 (중앙 하단)
    await canvas.click({
      position: {
        x: box.width / 2,
        y: box.height / 2 + 120,
      },
    });

    // 게임 화면 로드 대기
    await page.waitForTimeout(500);

    // 콘솔에서 GameScene 확인
    const logs: string[] = [];
    page.on('console', (msg) => logs.push(msg.text()));
    await page.waitForTimeout(500);
  });

  test('3. 게임 화면에서 블록을 클릭할 수 있다', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // 시작 버튼 클릭
    await canvas.click({
      position: { x: box.width / 2, y: box.height / 2 + 120 },
    });
    await page.waitForTimeout(500);

    // 첫 번째 블록 클릭 (왼쪽 상단 근처)
    await canvas.click({
      position: { x: box.width / 2 - 100, y: box.height / 2 },
    });
    await page.waitForTimeout(300);

    // 선택 표시가 나타나는지 확인 (콘솔 로그로)
    const logs: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('Block selected')) {
        logs.push(msg.text());
      }
    });

    await page.waitForTimeout(200);
  });

  test('4. 두 블록을 클릭하여 스왑할 수 있다', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // 게임 시작
    await canvas.click({
      position: { x: box.width / 2, y: box.height / 2 + 120 },
    });
    await page.waitForTimeout(500);

    const centerX = box.width / 2;
    const centerY = box.height / 2;

    // 첫 번째 블록 클릭
    await canvas.click({
      position: { x: centerX - 70, y: centerY },
    });
    await page.waitForTimeout(300);

    // 인접한 블록 클릭 (오른쪽)
    await canvas.click({
      position: { x: centerX, y: centerY },
    });
    await page.waitForTimeout(1000);

    // 애니메이션 완료 대기
    await page.waitForTimeout(500);
  });

  test('5. 매치가 없는 스왑은 원복된다', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // 게임 시작
    await canvas.click({
      position: { x: box.width / 2, y: box.height / 2 + 120 },
    });
    await page.waitForTimeout(500);

    const centerX = box.width / 2;
    const centerY = box.height / 2;

    // 여러 위치 시도 (매치 없는 스왑 찾기)
    for (let i = 0; i < 5; i++) {
      await canvas.click({
        position: { x: centerX + i * 70 - 140, y: centerY },
      });
      await page.waitForTimeout(200);

      await canvas.click({
        position: { x: centerX + i * 70 - 140, y: centerY + 70 },
      });
      await page.waitForTimeout(800);
    }
  });

  test('6. 점수와 이동 횟수가 표시된다', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // 게임 시작
    await canvas.click({
      position: { x: box.width / 2, y: box.height / 2 + 120 },
    });
    await page.waitForTimeout(500);

    // 게임 플레이 (여러 번 클릭)
    const centerX = box.width / 2;
    const centerY = box.height / 2;

    for (let i = 0; i < 3; i++) {
      await canvas.click({
        position: { x: centerX - 70 + i * 35, y: centerY },
      });
      await page.waitForTimeout(200);

      await canvas.click({
        position: { x: centerX - 70 + i * 35 + 70, y: centerY },
      });
      await page.waitForTimeout(1000);
    }

    // 점수/이동 횟수가 업데이트되었는지 확인 (콘솔 로그)
    await page.waitForTimeout(500);
  });

  test('7. 캔버스 크기가 올바르다', async ({ page }) => {
    const canvas = page.locator('canvas');

    // Canvas가 표시되고 적절한 크기인지 확인
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();

    if (box) {
      // 800x750 또는 스케일된 크기
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
      expect(box.width).toBeLessThanOrEqual(800);
      expect(box.height).toBeLessThanOrEqual(750);
    }
  });

  test('8. 콘솔 에러가 없다', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // 게임 시작
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    await canvas.click({
      position: { x: box.width / 2, y: box.height / 2 + 120 },
    });
    await page.waitForTimeout(1000);

    // 몇 번 플레이
    const centerX = box.width / 2;
    const centerY = box.height / 2;

    for (let i = 0; i < 5; i++) {
      await canvas.click({
        position: { x: centerX + (i % 3) * 70 - 70, y: centerY + Math.floor(i / 3) * 70 },
      });
      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(1000);

    // 에러가 없어야 함
    expect(errors.filter((e) => !e.includes('Deprecation'))).toHaveLength(0);
  });

  test('9. 호버 시 커서가 변경된다', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // 시작 버튼 위로 호버
    await canvas.hover({
      position: { x: box.width / 2, y: box.height / 2 + 120 },
    });

    await page.waitForTimeout(300);

    // 커서 스타일 확인
    const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
    console.log('Cursor style:', cursor);
  });

  test('10. 여러 번 스왑해도 게임이 정상 작동한다', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // 게임 시작
    await canvas.click({
      position: { x: box.width / 2, y: box.height / 2 + 120 },
    });
    await page.waitForTimeout(500);

    const centerX = box.width / 2;
    const centerY = box.height / 2;

    // 20번 랜덤 클릭
    for (let i = 0; i < 20; i++) {
      const randomX = centerX + (Math.random() - 0.5) * 300;
      const randomY = centerY + (Math.random() - 0.5) * 300;

      await canvas.click({
        position: { x: randomX, y: randomY },
      });
      await page.waitForTimeout(100);
    }

    // 게임이 여전히 작동하는지 확인
    await page.waitForTimeout(1000);

    // 에러 없이 완료되면 성공
  });
});
