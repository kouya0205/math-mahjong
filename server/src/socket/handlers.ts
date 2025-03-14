import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import Room from '../models/Room';
import Game from '../models/Game';
import { Game as GameLogic } from '../../../src/lib/game/Game';
import { Player } from '../../../src/lib/game/Player';
import mongoose from 'mongoose';

// ゲームインスタンスを保持するマップ
const gameInstances: Map<string, GameLogic> = new Map();

export const setupSocketHandlers = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`クライアント接続: ${socket.id}`);

    // エラーイベントのリスナー
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // 切断時の処理
    socket.on('disconnect', async () => {
      console.log(`クライアント切断: ${socket.id}`);
      try {
        // ユーザーを検索
        const user = await User.findOne({ socketId: socket.id });
        if (user) {
          // ユーザーが参加しているルームを検索
          const room = await Room.findOne({ 'players.userId': user._id });
          if (room) {
            // ルームから退出
            socket.leave(room.roomId);
            
            // プレイヤーリストから削除
            room.players = room.players.filter(p => p.userId.toString() !== user._id.toString());
            
            // ルームが空になった場合は削除
            if (room.players.length === 0) {
              await Room.deleteOne({ _id: room._id });
              // ゲームインスタンスも削除
              if (gameInstances.has(room.roomId)) {
                gameInstances.delete(room.roomId);
              }
            } else {
              // ホストが退出した場合、新しいホストを設定
              if (!room.players.some(p => p.isHost)) {
                room.players[0].isHost = true;
              }
              await room.save();
              
              // ルーム情報を更新
              io.to(room.roomId).emit('roomUpdate', {
                roomId: room.roomId,
                players: room.players,
                status: room.status
              });
            }
          }
          
          // ユーザーを削除
          await User.deleteOne({ _id: user._id });
        }
      } catch (error) {
        console.error('切断処理エラー:', error);
      }
    });

    // ルーム作成
    socket.on('createRoom', async ({ playerName, gameMode }, callback) => {
      try {
        console.log('ルーム作成リクエスト:', { playerName, gameMode });
        
        // コールバックが関数かどうかチェック
        if (typeof callback !== 'function') {
          console.error('コールバックが関数ではありません');
          return;
        }
        
        // 入力検証
        if (!playerName) {
          return callback({ success: false, message: 'プレイヤー名は必須です' });
        }
        
        // ユーザー作成
        const user = new User({
          name: playerName,
          socketId: socket.id
        });
        
        await user.save();
        console.log('ユーザー作成成功:', user);
        
        // ルームID生成
        const roomId = uuidv4().substring(0, 8);
        
        // ルーム作成
        const room = new Room({
          roomId,
          gameMode,
          players: [{
            userId: user._id,
            name: playerName,
            isHost: true
          }]
        });
        
        await room.save();
        console.log('ルーム作成成功:', room);
        
        // ソケットをルームに参加させる
        socket.join(roomId);
        
        // ゲームインスタンス作成
        const gameInstance = new GameLogic(roomId);
        gameInstance.addPlayer(new Player(user._id.toString(), playerName));
        gameInstances.set(roomId, gameInstance);
        
        // 成功レスポンス
        callback({
          success: true,
          roomId
        });
      } catch (error) {
        console.error('ルーム作成エラー:', error);
        if (typeof callback === 'function') {
          callback({
            success: false,
            message: 'ルームの作成に失敗しました'
          });
        }
      }
    });

    // ルーム参加
    socket.on('joinRoom', async ({ playerName, roomId }, callback) => {
      try {
        console.log('ルーム参加リクエスト:', { playerName, roomId });
        
        // コールバックが関数かどうかチェック
        if (typeof callback !== 'function') {
          console.error('コールバックが関数ではありません');
          return;
        }
        
        // 入力検証
        if (!playerName || !roomId) {
          return callback({ success: false, message: 'プレイヤー名とルームIDは必須です' });
        }
        
        // ルーム検索
        const room = await Room.findOne({ roomId });
        if (!room) {
          return callback({ success: false, message: '指定されたルームが見つかりません' });
        }
        
        // ゲームが既に始まっている場合は参加できない
        if (room.status !== 'waiting') {
          return callback({ success: false, message: 'ゲームは既に開始されています' });
        }
        
        // ユーザー作成
        const user = new User({
          name: playerName,
          socketId: socket.id
        });
        
        await user.save();
        console.log('ユーザー作成成功:', user);
        
        // ルームにプレイヤーを追加
        room.players.push({
          userId: user._id,
          name: playerName,
          isHost: false
        });
        await room.save();
        console.log('ルーム参加成功:', room);
        
        // ソケットルームに参加
        socket.join(roomId);
        
        // ゲームインスタンスにプレイヤーを追加
        const gameInstance = gameInstances.get(roomId);
        if (gameInstance) {
          const player = new Player(user._id.toString(), playerName);
          gameInstance.addPlayer(player);
        }
        
        // ルーム情報を更新
        io.to(roomId).emit('roomUpdate', {
          roomId: room.roomId,
          players: room.players,
          status: room.status
        });
        
        callback({ success: true });
      } catch (error) {
        console.error('ルーム参加エラー:', error);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'ルームへの参加に失敗しました' });
        }
      }
    });

    // ゲーム開始
    socket.on('startGame', async ({ roomId }, callback) => {
      try {
        console.log('ゲーム開始リクエスト:', { roomId });
        
        // ルーム検索
        const room = await Room.findOne({ roomId });
        if (!room) {
          console.error('ゲーム開始エラー: ルームが見つかりません', { roomId });
          if (typeof callback === 'function') {
            callback({ success: false, message: 'ルームが見つかりません' });
          }
          return;
        }
        
        // ユーザー検索
        const user = await User.findOne({ socketId: socket.id });
        if (!user) {
          console.error('ゲーム開始エラー: ユーザーが見つかりません', { socketId: socket.id });
          if (typeof callback === 'function') {
            callback({ success: false, message: 'ユーザーが見つかりません' });
          }
          return;
        }
        
        // ホストかどうか確認
        const isHost = room.players.some(p => p.userId.toString() === user._id.toString() && p.isHost);
        if (!isHost) {
          console.error('ゲーム開始エラー: ホストではありません', { userId: user._id });
          if (typeof callback === 'function') {
            callback({ success: false, message: 'ゲームを開始できるのはホストのみです' });
          }
          return;
        }
        
        // プレイヤーが2人以上いるか確認
        if (room.players.length < 2) {
          console.error('ゲーム開始エラー: プレイヤーが不足しています', { playerCount: room.players.length });
          if (typeof callback === 'function') {
            callback({ success: false, message: 'ゲームを開始するには2人以上のプレイヤーが必要です' });
          }
          return;
        }
        
        // ゲームインスタンス作成
        const gameInstance = new GameLogic(roomId);
        
        // プレイヤー追加
        for (const player of room.players) {
          const playerUser = await User.findById(player.userId);
          if (playerUser) {
            const gamePlayer = new Player(playerUser._id.toString(), player.name);
            gameInstance.addPlayer(gamePlayer);
          }
        }
        
        // ゲーム開始
        const started = gameInstance.startGame();
        if (!started) {
          console.error('ゲーム開始エラー: ゲームを開始できませんでした');
          if (typeof callback === 'function') {
            callback({ success: false, message: 'ゲームを開始できませんでした' });
          }
          return;
        }
        
        // ゲームインスタンスを保存
        gameInstances.set(roomId, gameInstance);
        
        // ルームのステータスを更新
        room.status = 'playing';
        await room.save();
        
        // ゲームデータをDBに保存
        const game = new Game({
          roomId,
          players: room.players.map(p => ({
            userId: p.userId,
            name: p.name,
            score: 0,
            handCount: 6 // 初期手札数
          })),
          currentPlayerIndex: 0,
          status: 'playing',
          targetNumber: gameInstance.targetNumber
        });
        await game.save();
        
        // ルームにゲームIDを関連付け
        room.gameId = game._id;
        await room.save();
        
        // 全プレイヤーにゲーム開始を通知
        io.to(roomId).emit('gameStarted', { roomId });
        
        if (typeof callback === 'function') {
          callback({ success: true });
        }
      } catch (error) {
        console.error('ゲーム開始エラー:', error);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'サーバーエラーが発生しました' });
        }
      }
    });

    // ゲーム状態取得
    socket.on('getGameState', async ({ roomId }) => {
      try {
        console.log('ゲーム状態リクエスト:', { roomId, socketId: socket.id });
        
        // ユーザー検索
        const user = await User.findOne({ socketId: socket.id });
        if (!user) {
          console.error('ゲーム状態取得エラー: ユーザーが見つかりません', { socketId: socket.id });
          socket.emit('gameError', 'ユーザーが見つかりません');
          return;
        }
        
        // ゲームインスタンス取得
        const gameInstance = gameInstances.get(roomId);
        if (!gameInstance) {
          console.error('ゲーム状態取得エラー: ゲームインスタンスが見つかりません', { roomId });
          socket.emit('gameError', 'ゲームが見つかりません');
          return;
        }
        
        // プレイヤー固有のゲーム状態を送信
        const gameState = gameInstance.getGameStateForPlayer(user._id.toString());
        
        // デバッグ用にゲーム状態をログに出力
        console.log('ゲーム状態送信:', {
          userId: user._id.toString(),
          playerName: user.name,
          hasPlayers: !!gameState.players,
          playerCount: gameState.players ? gameState.players.length : 0
        });
        
        socket.emit('gameState', gameState);
      } catch (error) {
        console.error('ゲーム状態取得エラー:', error);
        socket.emit('gameError', 'ゲーム状態の取得に失敗しました');
      }
    });

    // カードを引く
    socket.on('drawCard', async ({ roomId }, callback) => {
      try {
        console.log('カードを引くリクエスト:', { roomId, socketId: socket.id });
        
        // ユーザー検索
        const user = await User.findOne({ socketId: socket.id });
        if (!user) {
          console.error('カードを引くエラー: ユーザーが見つかりません', { socketId: socket.id });
          if (typeof callback === 'function') {
            callback({ success: false, message: 'ユーザーが見つかりません' });
          }
          return;
        }
        
        // ゲームインスタンス取得
        const gameInstance = gameInstances.get(roomId);
        if (!gameInstance) {
          console.error('カードを引くエラー: ゲームインスタンスが見つかりません', { roomId });
          if (typeof callback === 'function') {
            callback({ success: false, message: 'ゲームが見つかりません' });
          }
          return;
        }
        
        // 現在のプレイヤーかどうか確認
        const currentPlayer = gameInstance.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== user._id.toString()) {
          console.error('カードを引くエラー: 現在のプレイヤーではありません', { 
            userId: user._id.toString(), 
            currentPlayerId: currentPlayer?.id 
          });
          if (typeof callback === 'function') {
            callback({ success: false, message: 'あなたのターンではありません' });
          }
          return;
        }
        
        // カードを引く
        const drawnCard = gameInstance.drawCard(user._id.toString());
        if (!drawnCard) {
          console.error('カードを引くエラー: カードを引けませんでした');
          if (typeof callback === 'function') {
            callback({ success: false, message: '山札からカードを引けませんでした' });
          }
          return;
        }
        
        // ゲーム状態をDBに保存
        await updateGameState(roomId, gameInstance);
        
        // 全プレイヤーにゲーム状態を送信
        for (const player of gameInstance.players) {
          const playerSocket = await findSocketByUserId(io, player.id);
          if (playerSocket) {
            const playerGameState = gameInstance.getGameStateForPlayer(player.id);
            playerSocket.emit('gameState', playerGameState);
          }
        }
        
        if (typeof callback === 'function') {
          callback({ success: true, card: drawnCard });
        }
      } catch (error) {
        console.error('カードを引くエラー:', error);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'サーバーエラーが発生しました' });
        }
      }
    });

    // カードを捨てる
    socket.on('discardCard', async ({ roomId, cardId }, callback) => {
      try {
        console.log('カードを捨てるリクエスト:', { roomId, cardId, socketId: socket.id });
        
        // ユーザー検索
        const user = await User.findOne({ socketId: socket.id });
        if (!user) {
          console.error('カードを捨てるエラー: ユーザーが見つかりません', { socketId: socket.id });
          if (typeof callback === 'function') {
            callback({ success: false, message: 'ユーザーが見つかりません' });
          }
          return;
        }
        
        // ゲームインスタンス取得
        const gameInstance = gameInstances.get(roomId);
        if (!gameInstance) {
          console.error('カードを捨てるエラー: ゲームインスタンスが見つかりません', { roomId });
          if (typeof callback === 'function') {
            callback({ success: false, message: 'ゲームが見つかりません' });
          }
          return;
        }
        
        // 現在のプレイヤーかどうか確認
        const currentPlayer = gameInstance.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== user._id.toString()) {
          console.error('カードを捨てるエラー: 現在のプレイヤーではありません', { 
            userId: user._id.toString(), 
            currentPlayerId: currentPlayer?.id 
          });
          if (typeof callback === 'function') {
            callback({ success: false, message: 'あなたのターンではありません' });
          }
          return;
        }
        
        // カードを捨てる
        const discarded = gameInstance.discardCard(user._id.toString(), cardId);
        if (!discarded) {
          console.error('カードを捨てるエラー: カードを捨てられませんでした', { cardId });
          if (typeof callback === 'function') {
            callback({ success: false, message: 'カードを捨てられませんでした' });
          }
          return;
        }
        
        // 次のプレイヤーに進む
        gameInstance.nextTurn();
        
        // ゲーム状態をDBに保存
        await updateGameState(roomId, gameInstance);
        
        // 全プレイヤーにゲーム状態を送信
        for (const player of gameInstance.players) {
          const playerSocket = await findSocketByUserId(io, player.id);
          if (playerSocket) {
            const playerGameState = gameInstance.getGameStateForPlayer(player.id);
            playerSocket.emit('gameState', playerGameState);
          }
        }
        
        if (typeof callback === 'function') {
          callback({ success: true });
        }
      } catch (error) {
        console.error('カードを捨てるエラー:', error);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'サーバーエラーが発生しました' });
        }
      }
    });

    // カードを出す（式を作成）
    socket.on('playCards', async ({ roomId, cardIds }, callback) => {
      try {
        // ユーザー検索
        const user = await User.findOne({ socketId: socket.id });
        if (!user) {
          if (typeof callback === 'function') {
            callback({ success: false, message: 'ユーザーが見つかりません' });
          }
          return;
        }
        
        // ゲームインスタンス取得
        const gameInstance = gameInstances.get(roomId);
        if (!gameInstance) {
          if (typeof callback === 'function') {
            callback({ success: false, message: 'ゲームが見つかりません' });
          }
          return;
        }
        
        // カードを出す
        const result = gameInstance.playCards(user._id.toString(), cardIds);
        
        if (!result.success) {
          if (typeof callback === 'function') {
            callback(result);
          }
          return;
        }
        
        // ゲーム状態をDBに保存
        await updateGameState(roomId, gameInstance);
        
        // 全プレイヤーに結果を通知
        io.to(roomId).emit('cardsPlayed', {
          playerId: user._id.toString(),
          playerName: user.name,
          expression: gameInstance.lastAction?.expression,
          value: gameInstance.lastAction?.value
        });
        
        // ゲームが終了した場合
        if (gameInstance.status === 'finished') {
          // ルームのステータスを更新
          const room = await Room.findOne({ roomId });
          if (room) {
            room.status = 'finished';
            await room.save();
          }
          
          // 全プレイヤーにゲーム終了を通知
          io.to(roomId).emit('gameFinished', {
            winner: {
              id: gameInstance.winner?.id,
              name: gameInstance.winner?.name,
              score: gameInstance.winner?.score
            }
          });
        }
        
        if (typeof callback === 'function') {
          callback(result);
        }
      } catch (error) {
        console.error('カードを出すエラー:', error);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'サーバーエラーが発生しました' });
        }
      }
    });

    // ルーム情報取得
    socket.on('getRoomInfo', async ({ roomId }, callback) => {
      try {
        console.log('ルーム情報リクエスト:', { roomId });
        
        // コールバックが関数かどうかチェック
        if (typeof callback !== 'function') {
          console.error('コールバックが関数ではありません');
          return;
        }
        
        const room = await Room.findOne({ roomId });
        if (!room) {
          return callback({ success: false, message: 'ルームが見つかりません' });
        }
        
        // ルーム情報を返す
        callback({
          success: true,
          roomId: room.roomId,
          players: room.players,
          status: room.status
        });
        
        // ルーム情報を更新
        socket.join(roomId);
        socket.emit('roomUpdate', {
          roomId: room.roomId,
          players: room.players,
          status: room.status
        });
      } catch (error) {
        console.error('ルーム情報取得エラー:', error);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'サーバーエラーが発生しました' });
        }
      }
    });
  });
};

// ユーザーIDからソケットを検索する関数
async function findSocketByUserId(io: Server, userId: string): Promise<any> {
  try {
    const user = await User.findById(userId);
    if (!user || !user.socketId) return null;
    
    const sockets = await io.fetchSockets();
    return sockets.find(s => s.id === user.socketId) || null;
  } catch (error) {
    console.error('ソケット検索エラー:', error);
    return null;
  }
}

// ゲーム状態をDBに保存する関数
async function updateGameState(roomId: string, gameInstance: GameLogic) {
  try {
    const game = await Game.findOne({ roomId, status: 'playing' });
    if (!game) return;
    
    game.currentPlayerIndex = gameInstance.currentPlayerIndex;
    game.status = gameInstance.status;
    
    // プレイヤー情報を更新
    for (const player of gameInstance.players) {
      const playerIndex = game.players.findIndex(p => p.userId.toString() === player.id);
      if (playerIndex !== -1) {
        game.players[playerIndex].score = player.score;
        game.players[playerIndex].handCount = player.hand.length;
      }
    }
    
    // 最後のアクションを更新
    if (gameInstance.lastAction) {
      game.lastAction = {
        playerId: new mongoose.Types.ObjectId(gameInstance.lastAction.playerId),
        expression: gameInstance.lastAction.expression,
        value: gameInstance.lastAction.value,
        timestamp: new Date()
      };
    }
    
    // 勝者を更新
    if (gameInstance.winner) {
      game.winner = {
        userId: new mongoose.Types.ObjectId(gameInstance.winner.id),
        name: gameInstance.winner.name,
        score: gameInstance.winner.score
      };
    }
    
    await game.save();
  } catch (error) {
    console.error('ゲーム状態保存エラー:', error);
  }
} 