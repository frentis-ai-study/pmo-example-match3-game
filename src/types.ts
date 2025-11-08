/**
 * 타입 정의 파일
 * 게임 전체에서 사용되는 핵심 타입과 인터페이스를 정의합니다.
 */

/**
 * 블록 타입 (색상)
 */
export type BlockType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink';

/**
 * 그리드 위치
 */
export interface Position {
  row: number;
  col: number;
}

/**
 * 게임 페이즈 (상태)
 */
export type GamePhase = 'idle' | 'playing' | 'paused' | 'gameover';

/**
 * 매칭 결과
 */
export interface MatchResult {
  blocks: Position[];
  score: number;
  isCombo: boolean;
  comboCount?: number;
}

/**
 * 스와이프 방향
 */
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

/**
 * 이동 정보
 */
export interface Move {
  from: Position;
  to: Position;
  direction: SwipeDirection;
}

/**
 * 게임 상태 데이터 (저장/복구용)
 */
export interface GameStateData {
  phase: GamePhase;
  score: number;
  moves: number;
  grid: (BlockType | null)[][];
  timestamp: number;
}

/**
 * 이벤트 타입
 */
export type GameEvent =
  | { type: 'scoreUpdated'; score: number }
  | { type: 'blockMatched'; matches: MatchResult }
  | { type: 'comboDetected'; comboCount: number }
  | { type: 'gameOver'; finalScore: number }
  | { type: 'gamePaused' }
  | { type: 'gameResumed' }
  | { type: 'gameStarted' };

/**
 * 로그 레벨
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 애니메이션 타입
 */
export type AnimationType = 'swap' | 'fall' | 'remove' | 'spawn';

/**
 * 애니메이션 옵션
 */
export interface AnimationOptions {
  duration: number;
  easing?: string;
  onComplete?: () => void;
}

/**
 * 그리드 설정
 */
export interface GridConfig {
  rows: number;
  cols: number;
  blockTypes: BlockType[];
}

/**
 * 게임 설정
 */
export interface GameConfig {
  grid: GridConfig;
  scoring: {
    base: number;
    combo: number;
    fourMatch: number;
    fiveMatch: number;
  };
  animation: {
    swapDuration: number;
    fallDuration: number;
    removeDuration: number;
  };
}

/**
 * 기본 게임 설정
 */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  grid: {
    rows: 8,
    cols: 8,
    blockTypes: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'],
  },
  scoring: {
    base: 10,
    combo: 5,
    fourMatch: 20,
    fiveMatch: 50,
  },
  animation: {
    swapDuration: 200,
    fallDuration: 300,
    removeDuration: 250,
  },
};
