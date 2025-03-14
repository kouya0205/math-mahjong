export type CardType = 'number' | 'operator';
export type OperatorType = '+' | '-' | '*' | '/' | '√' | '!' | '^';

export interface CardData {
  id: string;
  value: number | OperatorType;
  type: CardType;
  display: string;
}

export class Card {
  id: string;
  value: number | OperatorType;
  type: CardType;
  display: string;

  constructor(value: number | OperatorType, type: CardType) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.value = value;
    this.type = type;
    this.display = this.getDisplayValue();
  }

  private getDisplayValue(): string {
    if (this.type === 'number') {
      return String(this.value);
    } else {
      return String(this.value);
    }
  }

  toJSON(): CardData {
    return {
      id: this.id,
      value: this.value,
      type: this.type,
      display: this.display
    };
  }

  static fromJSON(data: CardData): Card {
    const card = new Card(data.value as any, data.type);
    card.id = data.id;
    card.display = data.display;
    return card;
  }
} 