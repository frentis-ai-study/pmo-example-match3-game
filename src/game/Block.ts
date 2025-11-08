import type { BlockType, Position } from '../types';

/**
 * Block 엔티티
 * 그리드의 기본 단위로, 타입(색상)과 위치 정보를 가집니다.
 */
export class Block {
  private _type: BlockType;
  private _position: Position;
  private _id: string;

  constructor(type: BlockType, position: Position) {
    this._type = type;
    this._position = position;
    this._id = `${position.row}-${position.col}-${Date.now()}`;
  }

  /**
   * 블록 타입 (색상) 가져오기
   */
  get type(): BlockType {
    return this._type;
  }

  /**
   * 블록 타입 변경
   */
  set type(newType: BlockType) {
    this._type = newType;
  }

  /**
   * 블록 위치 가져오기
   */
  get position(): Position {
    return { ...this._position };
  }

  /**
   * 블록 위치 변경
   */
  set position(newPosition: Position) {
    this._position = newPosition;
    // ID 업데이트 (위치 변경 시 고유성 유지)
    this._id = `${newPosition.row}-${newPosition.col}-${this._id.split('-')[2]}`;
  }

  /**
   * 블록 고유 ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * 두 블록이 같은 타입인지 확인
   */
  isSameType(other: Block): boolean {
    return this._type === other._type;
  }

  /**
   * 두 블록이 인접한지 확인 (수평 또는 수직)
   */
  isAdjacentTo(other: Block): boolean {
    const rowDiff = Math.abs(this._position.row - other._position.row);
    const colDiff = Math.abs(this._position.col - other._position.col);

    // 수평 인접: 같은 행, 열 차이 1
    // 수직 인접: 같은 열, 행 차이 1
    return (rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 0);
  }

  /**
   * 블록 복제
   */
  clone(): Block {
    return new Block(this._type, this._position);
  }

  /**
   * 디버깅용 문자열 표현
   */
  toString(): string {
    return `Block(${this._type} at [${this._position.row},${this._position.col}])`;
  }
}
