import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // APIキーを環境変数から取得
});

export default async function getColor(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'テキストが必要です。' });
  }

  try {
    // 関数の定義
    const functions = [
      {
        name: "generate_color_scheme",
        description: "指定されたテキストに基づいて色スキームを生成します。",
        parameters: {
          type: "object",
          properties: {
            Light: {
              type: "object",
              properties: {
                Prime: {
                  type: "object",
                  properties: {
                    strong: { type: "string" },
                    standard: { type: "string" },
                    soft: { type: "string" },
                  },
                  required: ["strong", "standard", "soft"],
                },
                // 他のカテゴリも同様に定義
              },
              required: ["Prime", "Accent", "background", "text"],
            },
            Dark: {
              type: "object",
              properties: {
                // Lightと同様の定義
              },
              required: ["Prime", "Accent", "background", "text"],
            },
          },
          required: ["Light", "Dark"],
        },
      },
    ];

    // OpenAI APIにリクエストを送信
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0613", // Function Calling対応のモデルを指定
      messages: [
        {
          role: "user",
          content: `以下のテキストに基づいて色スキームを作成してください: "${text}"`,
        },
      ],
      functions: functions,
      function_call: { name: "generate_color_scheme" },
    });

    // 関数呼び出しの結果を取得
    const responseMessage = completion.choices[0].message;

    if (responseMessage?.function_call?.arguments) {
      const colorScheme = JSON.parse(responseMessage.function_call.arguments);
      // パースされた色スキームをJSON形式で返す
      res.status(200).json({ color: colorScheme });
    } else {
      console.error('Unexpected OpenAI response:', responseMessage);
      res.status(500).json({
        error: '色データの取得に失敗しました。',
        openaiResponse: responseMessage,
      });
    }
  } catch (error: any) {
    console.error('Error during OpenAI API call:', error);

    // OpenAI APIからのエラーを詳細にチェック
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        // 認証エラー：APIキーが無効
        res.status(500).json({ error: 'OpenAI APIキーが無効です。APIキーを確認してください。' });
      } else if (status === 429) {
        // リクエスト制限超過
        res.status(500).json({ error: 'OpenAI APIのリクエスト制限を超えました。しばらくしてから再試行してください。' });
      } else if (status === 403) {
        // アクセス拒否：課金制限の可能性
        res.status(500).json({ error: 'OpenAI APIへのアクセスが拒否されました。課金状況を確認してください。' });
      } else {
        // その他のエラー
        res.status(500).json({ error: `OpenAI APIエラー: ${data.error.message}` });
      }
    } else {
      // OpenAI以外のエラー
      res.status(500).json({ error: '色データの取得に失敗しました。' });
    }
  }
}
