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
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an assistant that generates color schemes based on the given text." },
        {
          role: "user",
          content: `Create a color scheme based on this text: "${text}"` // ユーザーが入力したテキスト
        }
      ]
    });

    // ChatGPTからの応答を取得
    const responseText = completion.choices[0].message.content;

    // テキストの出力から色コードを抽出する関数
    const parseColorsFromText = (text: string) => {
      const colorRegex = /#([0-9A-Fa-f]{6})/g; // 色コードを抽出するための正規表現
      const colors = [...text.matchAll(colorRegex)].map(match => match[0]);

      // パースした色コードを使って色スキームを構築
      return {
        Prime: {
          strong: colors[0] || "#FF4500",
          standard: colors[1] || "#FFA500",
          soft: colors[2] || "#FFD700"
        },
        Accent: {
          strong: colors[3] || "#8B0000",
          standard: colors[4] || "#FF6347",
          soft: colors[5] || "#FFE4B5"
        },
        background: {
          strong: colors[6] || "#FF8C00",
          standard: colors[7] || "#F0E68C",
          soft: colors[8] || "#FFFACD"
        },
        text: {
          strong: colors[9] || "#2F4F4F",
          standard: colors[10] || "#696969",
          soft: colors[11] || "#D3D3D3"
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
