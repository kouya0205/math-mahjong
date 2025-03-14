export class ExpressionEvaluator {
  evaluate(expression: string): number {
    try {
      // 特殊演算子を処理
      let processedExpression = this.processSpecialOperators(expression);
      
      // 式を評価
      const result = Function('"use strict";return (' + processedExpression + ')')();
      
      // 結果が数値でない場合はエラー
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error('無効な計算結果です');
      }
      
      // 整数値に丸める
      return Math.round(result);
    } catch (error) {
      console.error('式の評価エラー:', error);
      throw new Error('式の評価に失敗しました');
    }
  }
  
  // 特殊演算子（√, !, ^）を標準的なJavaScript式に変換
  private processSpecialOperators(expression: string): string {
    // √演算子を処理（例: √9 → Math.sqrt(9)）
    expression = expression.replace(/√(\d+)/g, 'Math.sqrt($1)');
    
    // !演算子を処理（例: 5! → this.factorial(5)）
    expression = expression.replace(/(\d+)!/g, 'this.factorial($1)');
    
    // ^演算子を処理（例: 2^3 → Math.pow(2,3)）
    expression = expression.replace(/(\d+)\^(\d+)/g, 'Math.pow($1,$2)');
    
    return expression;
  }
  
  // 階乗計算
  factorial(n: number): number {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }
  
  // 式が有効かどうかをチェック
  isValidExpression(expression: string): boolean {
    try {
      const result = this.evaluate(expression);
      return Number.isInteger(result) && result >= 0;
    } catch (error) {
      return false;
    }
  }
  
  // カードから式を構築
  buildExpression(cards: { id: string; value: any; type: string; display: string }[]): string {
    return cards.map(card => card.display).join('');
  }
} 