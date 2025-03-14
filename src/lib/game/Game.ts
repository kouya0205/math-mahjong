import { Deck } from './Deck';
import { Player } from './Player';
import { Card } from './Card';
import { ExpressionEvaluator } from './ExpressionEvaluator';

export interface GameState {
  roomId: string;
  players: Player[];
  currentPlayerIndex: number;
  deck: Deck;
  discardPile: Card[];
  targetNumber: number;
  status: 'waiting' | 'playing' | 'finished';
  winner: Player | null;
  lastAction: {
    playerId: string;
    cards: Card[];
    expression: string;
    value: number;
  } | null;
}

export class Game {
  roomId: string;
  players: Player[];
  currentPlayerIndex: number;
  deck: Deck;
  discardPile: Card[];
  targetNumber: number;
  status: 'waiting' | 'playing' | 'finished';
  winner: Player | null;
  lastAction: {
    playerId: string;
    cards: Card[];
    expression: string;
    value: number;
  } | null;
  evaluator: ExpressionEvaluator;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.players = [];
    this.currentPlayerIndex = 0;
    this.deck = new Deck();
    this.discardPile = [];
    this.targetNumber = 0;
    this.status = 'waiting';
    this.winner = null;
    this.lastAction = null;
    this.evaluator = new ExpressionEvaluator();
  }

  addPlayer(player: Player): boolean {
    // 既にゲームが始まっている場合は参加できない
    if (this.status === 'playing' || this.status === 'finished') {
      return false;
    }
    
    this.players.push(player);
    return true;
  }

  startGame(): boolean {
    // プレイヤーが2人以上いない場合は開始できない
    if (this.players.length < 2) {
      return false;
    }
    
    // ゲーム状態を初期化
    this.deck = new Deck();
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.winner = null;
    this.lastAction = null;
    
    // 目標数字を生成
    this.generateTargetNumber();
    
    // 各プレイヤーに初期手札を配る
    for (const player of this.players) {
      player.hand = [];
      player.score = 0;
      player.addCards(this.deck.drawMultiple(7));
    }
    
    this.status = 'playing';
    return true;
  }
  
  // 目標数字を生成
  private generateTargetNumber(): void {
    // 山札から3枚の数字カードを引く
    const cards = [];
    let attempts = 0;
    
    while (cards.length < 3 && attempts < 10) {
      const card = this.deck.draw();
      if (card && card.type === 'number') {
        cards.push(card);
      } else if (card) {
        // 数字カードでない場合は山札の一番下に戻す
        this.deck.cards.unshift(card);
      }
      attempts++;
    }
    
    // 3枚の数字から目標数字を生成（例: 3桁の数字）
    if (cards.length === 3) {
      this.targetNumber = parseInt(`${cards[0].value}${cards[1].value}${cards[2].value}`, 10);
    } else {
      // カードが足りない場合はランダムな3桁の数字
      this.targetNumber = Math.floor(Math.random() * 900) + 100;
    }
    
    // 使用したカードは捨て札に
    this.discardPile.push(...cards);
  }

  getCurrentPlayer(): Player | null {
    if (this.players.length === 0 || this.currentPlayerIndex >= this.players.length) {
      return null;
    }
    return this.players[this.currentPlayerIndex];
  }

  nextTurn(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  drawCard(playerId: string): Card | null {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;
    
    // 現在のプレイヤーかどうか確認
    if (this.getCurrentPlayer()?.id !== playerId) return null;
    
    // 山札が空の場合
    if (this.deck.isEmpty()) {
      // ゲーム終了処理
      this.status = 'finished';
      
      // 最高得点のプレイヤーを勝者とする
      let highestScore = -1;
      let winner: Player | null = null;
      
      for (const p of this.players) {
        if (p.score > highestScore) {
          highestScore = p.score;
          winner = p;
        }
      }
      
      this.winner = winner;
      return null;
    }
    
    // カードを引く
    const card = this.deck.draw();
    if (!card) return null;
    
    // プレイヤーの手札に追加
    player.addCards([card]);
    
    return card;
  }

  discardCard(playerId: string, cardId: string): boolean {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return false;
    
    // 現在のプレイヤーかどうか確認
    if (this.getCurrentPlayer()?.id !== playerId) return false;
    
    // カードを捨てる
    const card = player.removeCards([cardId]);
    if (card.length === 0) return false;
    
    // 捨て札に追加
    this.discardPile.push(card[0]);
    
    return true;
  }

  playCards(playerId: string, cardIds: string[]): { success: boolean; message?: string; value?: number } {
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, message: 'プレイヤーが見つかりません' };
    }
    
    // 現在のプレイヤーのターンかチェック
    if (this.getCurrentPlayer()?.id !== playerId) {
      return { success: false, message: 'あなたのターンではありません' };
    }
    
    // カードが手札にあるかチェック
    for (const cardId of cardIds) {
      if (!player.hasCard(cardId)) {
        return { success: false, message: '選択したカードが手札にありません' };
      }
    }
    
    // カードから式を構築
    const selectedCards = cardIds.map(id => player.hand.find(card => card.id === id)!);
    const expression = this.evaluator.buildExpression(selectedCards);
    
    try {
      // 式を評価
      const value = this.evaluator.evaluate(expression);
      
      // 目標数字と一致するかチェック
      if (value === this.targetNumber) {
        // 成功！プレイヤーの勝利
        this.winner = player;
        
        // 得点計算
        const score = this.calculateScore(selectedCards);
        player.addScore(score);
        
        // 最後のアクションを記録
        this.lastAction = {
          playerId,
          cards: selectedCards,
          expression,
          value
        };
        
        // ゲーム終了
        this.status = 'finished';
        
        return { success: true, value, message: '正解！' };
      } else {
        return { success: false, message: `不正解: ${expression} = ${value}, 目標: ${this.targetNumber}` };
      }
    } catch (error) {
      return { success: false, message: '無効な式です' };
    }
  }
  
  // 得点計算
  private calculateScore(cards: Card[]): number {
    let score = cards.length * 10; // 基本点: カード枚数×10点
    
    // 演算子による追加点
    for (const card of cards) {
      if (card.type === 'operator') {
        switch (card.value) {
          case '+':
          case '-':
            score += 5;
            break;
          case '*':
          case '/':
            score += 10;
            break;
          case '√':
            score += 20;
            break;
          case '!':
            score += 25;
            break;
          case '^':
            score += 30;
            break;
        }
      }
    }
    
    return score;
  }

  getGameStateForPlayer(playerId: string): any {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;
    
    // 他のプレイヤー情報を取得（手札情報を含む）
    const players = this.players.map(p => {
      // 手札情報をJSON形式に変換して含める
      const handCards = p.hand.map(card => ({
        id: card.id,
        value: card.value,
        type: card.type,
        display: card.display
      }));
      
      return {
        id: p.id,
        name: p.name,
        score: p.score,
        handCount: p.hand.length,
        isCurrentPlayer: p.id === this.getCurrentPlayer()?.id,
        hand: handCards // 手札情報を明示的に含める
      };
    });
    
    return {
      roomId: this.roomId,
      playerHand: player.hand.map(card => ({
        id: card.id,
        value: card.value,
        type: card.type,
        display: card.display
      })),
      playerScore: player.score,
      currentPlayer: this.getCurrentPlayer() ? {
        id: this.getCurrentPlayer()!.id,
        name: this.getCurrentPlayer()!.name
      } : null,
      players: players,
      targetNumber: this.targetNumber,
      deckCount: this.deck.remainingCards(),
      discardPile: this.discardPile.slice(-5).map(card => ({
        id: card.id,
        value: card.value,
        type: card.type,
        display: card.display
      })),
      status: this.status,
      lastAction: this.lastAction ? {
        playerId: this.lastAction.playerId,
        playerName: this.players.find(p => p.id === this.lastAction?.playerId)?.name || '不明',
        expression: this.lastAction.expression,
        value: this.lastAction.value
      } : null
    };
  }

  toJSON(): GameState {
    return {
      roomId: this.roomId,
      players: this.players,
      currentPlayerIndex: this.currentPlayerIndex,
      deck: this.deck,
      discardPile: this.discardPile,
      targetNumber: this.targetNumber,
      status: this.status,
      winner: this.winner,
      lastAction: this.lastAction
    };
  }
}

