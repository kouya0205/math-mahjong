import { Card, OperatorType } from './Card';

export class Deck {
  cards: Card[];

  constructor() {
    this.cards = [];
    this.initialize();
  }

  initialize() {
    // 数字カード (0-9を各4枚ずつ)
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j < 4; j++) {
        this.cards.push(new Card(i, 'number'));
      }
    }

    // 演算子カード (+, -, *, /, √, !, ^ を各4枚ずつ)
    const operators: OperatorType[] = ['+', '-', '*', '/', '√', '!', '^'];
    for (const op of operators) {
      for (let j = 0; j < 4; j++) {
        this.cards.push(new Card(op, 'operator'));
      }
    }

    // デッキをシャッフル
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(): Card | undefined {
    return this.cards.pop();
  }

  drawMultiple(count: number): Card[] {
    const drawnCards: Card[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.draw();
      if (card) drawnCards.push(card);
    }
    return drawnCards;
  }

  isEmpty(): boolean {
    return this.cards.length === 0;
  }

  remainingCards(): number {
    return this.cards.length;
  }
} 