"use client";

import { useState } from 'react';

// 色データの型定義
interface ColorCategory {
  strong: string;
  standard: string;
  soft: string;
}

interface ColorData {
  Prime: ColorCategory;
  Accent: ColorCategory;
  background: ColorCategory;
  text: ColorCategory;
}

export default function Home() {
  const [text, setText] = useState('');
  const [colorData, setColorData] = useState<ColorData | null>(null); // ColorData型を使用
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/getColor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }), // ユーザー入力のテキストを送信
      });

      const data = await response.json();

      if (data && data.color) {
        setColorData(data.color as ColorData); // ColorData型として色データを取得
      } else {
        setError('色データを取得できませんでした');
      }
    } catch (error) {
      console.error('Error fetching color data:', error);
      setError('色データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>色味生成ツール</h1>
      
      {/* 入力欄 */}
      <form onSubmit={handleSubmit}>
        <textarea
          style={{ color: '#000000', border: '2px solid #333', padding: '1rem', width: '100%' }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="文章を入力してください"
        />
        <br />
        <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? '生成中...' : '色を生成'}
        </button>
      </form>

      {/* エラーメッセージ */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 出力欄 */}
      {colorData && (
        <div style={{ marginTop: '2rem' }}>
          <h2>生成された色:</h2>
          {['Light', 'Dark'].map((mode) => (
            <div key={mode}>
              <h3>{mode}モード</h3>
              <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>カテゴリ</th>
                    <th>強い印象</th>
                    <th>標準</th>
                    <th>柔らかい印象</th>
                  </tr>
                </thead>
                <tbody>
                  {['Prime', 'Accent', 'background', 'text'].map((category) => (
                    <tr key={category}>
                      <td>{category}</td>
                      <td
                        style={{
                          backgroundColor:
                            colorData[mode as keyof ColorData][category as keyof ColorMode]?.strong || '#ffffff',
                        }}
                      >
                        {colorData[mode as keyof ColorData][category as keyof ColorMode]?.strong || 'N/A'}
                      </td>
                      <td
                        style={{
                          backgroundColor:
                            colorData[mode as keyof ColorData][category as keyof ColorMode]?.standard || '#ffffff',
                        }}
                      >
                        {colorData[mode as keyof ColorData][category as keyof ColorMode]?.standard || 'N/A'}
                      </td>
                      <td
                        style={{
                          backgroundColor:
                            colorData[mode as keyof ColorData][category as keyof ColorMode]?.soft || '#ffffff',
                        }}
                      >
                        {colorData[mode as keyof ColorData][category as keyof ColorMode]?.soft || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}







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

