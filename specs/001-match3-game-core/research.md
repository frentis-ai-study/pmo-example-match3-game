# Research: Match-3 게임 코어 기능

**Date**: 2025-11-07
**Feature**: Match-3 게임 코어 기능
**Purpose**: 렌더링 라이브러리 선택 및 기술 스택 결정

## 리서치 질문

### Q1: 렌더링 라이브러리/방식 선택

**Context**: Match-3 게임은 8x8 그리드에서 블록을 부드럽게 애니메이션하며, 60fps 성능과 3초 이내 로딩을 요구합니다.

**옵션 비교**:

| 평가 항목 | Vanilla Canvas | PixiJS v8 | Phaser 3/4 |
|----------|---------------|-----------|-----------|
| 번들 크기 | 0 KB | 120-222 KB | 233-335 KB |
| 60fps 달성 | ⚠️ 최적화 필수 | ✅ 보장 | ✅ 보장 |
| 개발 속도 | ⚠️ 6-8주 | ✅ 3-4주 | ✅ 1-2주 |
| 단순성 (YAGNI) | ✅ 최고 | ✅ 우수 | ⚠️ 과다 기능 |
| 3초 로딩 | ✅ | ✅ | ⚠️ 제약 있음 |
| 학습 곡선 | ⚠️ 가파름 | ✅ 완만 | ⚠️ 중간 |

**Decision**: **PixiJS v8** 선택

**Rationale**:
1. **단순성과 성능의 균형**: YAGNI 원칙을 준수하면서도 60fps를 보장합니다.
2. **번들 크기 목표 달성**: 150KB(PixiJS 120KB + 게임 로직 30KB) ≈ 1.5초 로딩으로 3초 목표를 여유있게 달성합니다.
3. **개발 속도**: Canvas 대비 2배 빠르며, Phaser의 불필요한 복잡성을 회피합니다.
4. **WebGL 자동 최적화**: 일관되게 60fps를 달성하며 텍스처 배칭과 GPU 가속을 자동으로 처리합니다.
5. **라이브러리 건강도**: 2025년 10월 최신(v8.14.0), 46,000+ 스타, 활발한 커뮤니티

**Alternatives Considered**:
- **Vanilla Canvas**: 번들 크기는 0KB로 최고지만, 부드러운 애니메이션 구현이 복잡하고 60fps 보장이 어렵습니다. 개발 시간이 2배 이상 소요됩니다.
- **Phaser 3/4**: 가장 빠른 개발 속도를 제공하지만, 물리엔진/사운드 등 불필요한 기능(50%+)을 포함하여 YAGNI 원칙에 위배됩니다. 번들 크기가 233KB로 3초 로딩 목표 달성에 여유가 적습니다.

---

## 기술 스택 결정

### Core Technologies

| 항목 | 결정 | 근거 |
|------|------|------|
| **언어** | TypeScript 5.x | 타입 안정성, IDE 지원, 유지보수성 |
| **번들러** | Vite | 빠른 개발 서버, 최적화된 프로덕션 빌드 |
| **패키지 매니저** | pnpm | Constitution 요구사항, 디스크 효율성 |
| **렌더링** | PixiJS v8.14.0 | 위 분석 참조 |
| **애니메이션** | GSAP 또는 PixiJS Tween | 부드러운 블록 이동/낙하 |
| **테스트** | Vitest + Playwright | 유닛 테스트 + E2E 테스트 |

### Development Dependencies

```json
{
  "dependencies": {
    "pixi.js": "^8.14.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 아키텍처 결정

### 1. 레이어 분리 전략

```
게임 로직 (game/) ← 순수 TypeScript, PixiJS 독립
    ↓
렌더링 (rendering/) ← PixiJS 의존, 게임 로직 참조
    ↓
UI (ui/) ← DOM + PixiJS 혼합
```

**근거**: 게임 로직을 렌더링으로부터 분리하여 테스트와 유지보수를 용이하게 합니다. 필요 시 렌더링 방식 변경이 가능합니다.

### 2. 상태 관리

**Decision**: 간단한 EventBus 패턴 사용

**Rationale**:
- 게임 상태가 복잡하지 않음 (점수, 그리드, 일시정지)
- Redux/MobX는 오버엔지니어링
- 이벤트 기반으로 UI와 게임 로직 분리

```typescript
// 예시
EventBus.emit('scoreUpdated', { score: 1000 });
EventBus.on('blockMatched', (blocks) => { ... });
```

### 3. 애니메이션 전략

**Decision**: PixiJS 내장 AnimatedSprite + GSAP (선택적)

**Rationale**:
- 블록 제거: AnimatedSprite로 충분
- 블록 이동/낙하: GSAP의 easing 함수가 부드러움
- 복잡한 연쇄 반응: GSAP Timeline으로 제어

---

## 성능 최적화 전략

### 1. 렌더링 최적화

```typescript
// 텍스처 아틀라스 사용
const spritesheet = PIXI.Assets.load('blocks.json');

// 스프라이트 풀링 (64개 블록 재사용)
const pool = new ObjectPool<BlockSprite>(64);

// 배치 렌더링 (PixiJS 자동)
```

### 2. 메모리 관리

- 게임 오버 시 스프라이트 destroy()
- 이벤트 리스너 정리
- 텍스처 캐싱

### 3. 로딩 최적화

```typescript
// 코드 스플리팅
const GameOverScreen = () => import('./ui/GameOverScreen');

// 텍스처 사전 로딩
await PIXI.Assets.load(['blocks.png', 'background.png']);
```

---

## 테스트 전략

### 유닛 테스트 (Vitest)

**테스트 대상**:
- `MatchDetector`: 3개 이상 매칭 감지 로직
- `ScoreCalculator`: 점수 계산 (3개, 4개, 콤보)
- `Grid`: 블록 교환, 중력, 새 블록 생성
- `StorageManager`: localStorage 저장/복구

```typescript
describe('MatchDetector', () => {
  it('should detect horizontal match of 3', () => {
    const grid = createTestGrid([
      ['red', 'red', 'red'],
      ['blue', 'green', 'yellow']
    ]);
    const matches = detector.findMatches(grid);
    expect(matches).toHaveLength(1);
    expect(matches[0].length).toBe(3);
  });
});
```

### E2E 테스트 (Playwright)

**테스트 시나리오**:
1. 게임 시작 → 블록 스와이프 → 매칭 → 점수 증가
2. 일시정지 → 재개
3. 페이지 새로고침 → 상태 복구

```typescript
test('basic gameplay flow', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("게임 시작")');

  // 블록 스와이프
  const block1 = page.locator('#block-0-0');
  const block2 = page.locator('#block-0-1');
  await block1.dragTo(block2);

  // 점수 확인
  const score = await page.locator('#score').textContent();
  expect(Number(score)).toBeGreaterThan(0);
});
```

---

## 브라우저 호환성

**Target**: 모던 브라우저 최신 2개 버전

| 브라우저 | 최소 버전 | WebGL 지원 |
|---------|----------|-----------|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |

**Fallback**: WebGL 미지원 시 Canvas2D로 자동 전환 (PixiJS 내장)

---

## 베스트 프랙티스

### 1. 코드 구조

```typescript
// 게임 로직: 순수 함수 + 클래스
export class Grid {
  private blocks: Block[][];

  swapBlocks(pos1: Position, pos2: Position): boolean {
    // 순수 로직, PixiJS 없음
  }
}

// 렌더링: PixiJS 컴포넌트
export class GridRenderer {
  constructor(private grid: Grid, private app: Application) {}

  render(): void {
    // PixiJS 렌더링
  }
}
```

### 2. 타입 안정성

```typescript
// 엄격한 타입 정의
type BlockType = 'red' | 'blue' | 'green' | 'yellow' | 'purple';
type Position = { row: number; col: number };
type GamePhase = 'playing' | 'paused' | 'gameover';

interface MatchResult {
  blocks: Position[];
  score: number;
  isCombo: boolean;
}
```

### 3. 에러 처리

```typescript
try {
  const state = StorageManager.load();
} catch (error) {
  Logger.error('Failed to load game state', error);
  // 새 게임으로 시작
  GameState.initialize();
}
```

---

## 참고 자료

- PixiJS 공식 문서: https://pixijs.com/
- PixiJS Examples: https://pixijs.io/examples/
- Vite 문서: https://vitejs.dev/
- Vitest 문서: https://vitest.dev/
- Match-3 알고리즘: https://gamedevelopment.tutsplus.com/series/how-to-make-a-match-3-game--cms-1091

---

## 다음 단계

1. ✅ 렌더링 라이브러리 결정 완료 (PixiJS v8)
2. → Phase 1: 데이터 모델 설계 (data-model.md)
3. → Phase 1: 계약 정의 (contracts/)
4. → Phase 1: 빠른 시작 가이드 (quickstart.md)
