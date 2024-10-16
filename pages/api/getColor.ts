// pages/api/getColor.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // APIキーを環境変数から取得
});

interface ColorCategory {
  strong: string;
  standard: string;
  soft: string;
}

interface ColorMode {
  Prime: ColorCategory;
  Accent: ColorCategory;
  background: ColorCategory;
  text: ColorCategory;
}

interface ColorData {
  Light: ColorMode;
  Dark: ColorMode;
}

interface OpenAIErrorResponse {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

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
                Accent: {
                  type: "object",
                  properties: {
                    strong: { type: "string" },
                    standard: { type: "string" },
                    soft: { type: "string" },
                  },
                  required: ["strong", "standard", "soft"],
                },
                background: {
                  type: "object",
                  properties: {
                    strong: { type: "string" },
                    standard: { type: "string" },
                    soft: { type: "string" },
                  },
                  required: ["strong", "standard", "soft"],
                },
                text: {
                  type: "object",
                  properties: {
                    strong: { type: "string" },
                    standard: { type: "string" },
                    soft: { type: "string" },
                  },
                  required: ["strong", "standard", "soft"],
                },
              },
              required: ["Prime", "Accent", "background", "text"],
            },
            Dark: {
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
                Accent: {
                  type: "object",
                  properties: {
                    strong: { type: "string" },
                    standard: { type: "string" },
                    soft: { type: "string" },
                  },
                  required: ["strong", "standard", "soft"],
                },
                background: {
                  type: "object",
                  properties: {
                    strong: { type: "string" },
                    standard: { type: "string" },
                    soft: { type: "string" },
                  },
                  required: ["strong", "standard", "soft"],
                },
                text: {
                  type: "object",
                  properties: {
                    strong: { type: "string" },
                    standard: { type: "string" },
                    soft: { type: "string" },
                  },
                  required: ["strong", "standard", "soft"],
                },
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
      const colorScheme: ColorData = JSON.parse(responseMessage.function_call.arguments);
      // パースされた色スキームをJSON形式で返す
      res.status(200).json({ color: colorScheme });
    } else {
      console.error('Unexpected OpenAI response:', responseMessage);
      res.status(500).json({
        error: '色データの取得に失敗しました。',
        openaiResponse: responseMessage,
      });
    }
  } catch (error: unknown) {
    console.error('Error during OpenAI API call:', error);

    if (error instanceof Error) {
      // OpenAIのエラーレスポンスがある場合
      if ('response' in error && error.response) {
        const err = error as any; // 具体的な型が不明な場合は慎重に扱う
        const status = err.response?.status;
        const data = err.response?.data as OpenAIErrorResponse;

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
          res.status(500).json({ error: `OpenAI APIエラー: ${data?.error?.message || '不明なエラー'}` });
        }
      } else {
        // OpenAI以外のエラー
        res.status(500).json({ error: '色データの取得に失敗しました。' });
      }
    } else {
      // エラーがErrorインスタンスでない場合
      res.status(500).json({ error: '色データの取得に失敗しました。' });
    }
  }
}
