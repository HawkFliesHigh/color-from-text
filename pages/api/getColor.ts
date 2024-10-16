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
        {
          role: "system",
          content: `
あなたは指定されたテキストに基づいて色スキームを生成するアシスタントです。
LightモードとDarkモードの両方について、以下の正確なJSON構造で色スキームを作成してください：
\`\`\`json
{
  "Light": {
    "Prime": { "strong": "#hex", "standard": "#hex", "soft": "#hex" },
    "Accent": { "strong": "#hex", "standard": "#hex", "soft": "#hex" },
    "background": { "strong": "#hex", "standard": "#hex", "soft": "#hex" },
    "text": { "strong": "#hex", "standard": "#hex", "soft": "#hex" }
  },
  "Dark": {
    "Prime": { "strong": "#hex", "standard": "#hex", "soft": "#hex" },
    "Accent": { "strong": "#hex", "standard": "#hex", "soft": "#hex" },
    "background": { "strong": "#hex", "standard": "#hex", "soft": "#hex" },
    "text": { "strong": "#hex", "standard": "#hex", "soft": "#hex" }
  }
}
\`\`\`
追加の説明やテキストは一切含めず、結果を**純粋なJSON形式**で出力してください。
          `
        },
        {
          role: "user",
          content: `以下のテキストに基づいて色スキームを作成してください: "${text}"`
        }
      ]
    });

    // ChatGPTからの応答を取得
    const responseText = completion.choices[0].message.content;

    // 応答テキストがnullまたはundefinedでないかチェック
    if (!responseText) {
      throw new Error('Response text is null or undefined');
    }

    // レスポンスからJSON部分を抽出
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('レスポンスからJSONを抽出できませんでした。');
    }

    const jsonString = jsonMatch[0];

    // 応答テキストをJSONとしてパース
    let colorScheme;
    try {
      colorScheme = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('レスポンスのパースに失敗しました。');
    }

    // パースされた色スキームをJSON形式で返す
    res.status(200).json({ color: colorScheme });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '色データの取得に失敗しました。' });
  }
}
