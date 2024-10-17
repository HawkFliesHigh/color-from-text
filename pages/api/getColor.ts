import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI();

export default async function getColor(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'テキストが必要です。' });
  }

  try {
    // OpenAI APIにリクエストを送信し、指定した文章に基づいた色スキームを生成
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
        "入力した文章の状況や感情に基づいて12色のカラーパレットを作成してください。出力する色は12色だけです。順序は常にプライマリ色、アクセント色、背景色、テキスト色の4種類の色を、明るい、中間、暗いの3段階の明度の順で出力してください。プライマリ色は感情の核心やシチュエーションを、アクセント色は周辺の雰囲気や感情を、背景色は静かな色調で、テキスト色は高いコントラストを持つようにしてください。出力はカラーコードのみを16進数で表示して、コメントは一切入れないでください。"
        },
        {
          role: "user",
          content: `
            Create a color scheme based on this text: "${text}"
          `
        }
      ]
    });

    // ChatGPTからの応答を取得
    const responseText = completion.choices[0].message.content;

    // 応答テキストがnullまたはundefinedでないかチェック
    if (!responseText) {
      throw new Error('Response text is null or undefined');
    }

    // テキストの出力から色コードを抽出する関数
    const parseColorsFromText = (text: string) => {
      const colorRegex = /#([0-9A-Fa-f]{6})/g; // 色コードを抽出するための正規表現
      const matches = text.match(colorRegex) || []; // match()を使う

      // パースした色コードを使って色スキームを構築
      return {
          "Prime": {
            "light": matches[0] || "#FFA07A", // 明るいライトサーモン
            "medium": matches[1] || "#FF6347", // 中間の赤系
            "dark": matches[2] || "#8B0000" // 暗いダークレッド
          },
          "Accent": {
            "light": matches[3] || "#87CEFA", // 明るいライトスカイブルー
            "medium": matches[4] || "#4682B4", // 中間のスチールブルー
            "dark": matches[5] || "#0B3D91" // 暗い濃いブルー
          },
          "Background": {
            "light": matches[6] || "#F8F8FF", // 明るいゴーストホワイト
            "medium": matches[7] || "#C0C0C0", // 中間のシルバーグレー
            "dark": matches[8] || "#2F4F4F" // 暗いスレートグレー
          },
          "Text": {
            "light": matches[9] || "#D3D3D3", // 明るいライトグレー
            "medium": matches[10] || "#4B4B4B", // 中間のチャコールグレー
            "dark": matches[11] || "#000000" // 暗い黒
          }
      };
    };

    // 応答テキストから色スキームをパース
    const colorScheme = parseColorsFromText(responseText);

    // パースされた色スキームをJSON形式で返す
    res.status(200).json({ color: colorScheme });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '色データの取得に失敗しました。' });
  }
}

