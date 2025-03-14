import { Card } from './Card';

export interface PlayerData {
  id: string;
  name: string;
  hand: Card[];
  score: number;
}

export class Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
  socketId?: string;

  constructor(id: string, name: string, socketId?: string) {
    this.id = id;
    this.name = name;
    this.hand = [];
    this.score = 0;
    this.socketId = socketId;
  }

  addCards(cards: Card[]) {
    this.hand.push(...cards);
  }

  removeCards(cardIds: string[]): Card[] {
    const removedCards: Card[] = [];
    
    for (const cardId of cardIds) {
      const index = this.hand.findIndex(card => card.id === cardId);
      if (index !== -1) {
        removedCards.push(...this.hand.splice(index, 1));
      }
    }
    
    return removedCards;
  }

  hasCard(cardId: string): boolean {
    return this.hand.some(card => card.id === cardId);
  }

  addScore(points: number) {
    this.score += points;
  }

  toJSON(): PlayerData {
    return {
      id: this.id,
      name: this.name,
      hand: this.hand,
      score: this.score
    };
  }

  static fromJSON(data: PlayerData): Player {
    const player = new Player(data.id, data.name);
    player.hand = data.hand.map(cardData => Card.fromJSON(cardData));
    player.score = data.score;
    return player;
  }
} 