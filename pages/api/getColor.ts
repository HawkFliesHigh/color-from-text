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
            "あなたは色彩の印象についての専門家です。私が入力するテキストの状況、雰囲気、情景、感情に適した色を、以下に示す順番で項目の要件に見合った色で出力してください。出力は16進数（#000000)のカラーコードだけで良いです。他のコメントは入れないようにしてください。出力項目：全部で24色。これより多くても少なくてもいけない。１．ライトモード：背景色は明るく、文字色は暗い、標準的な色味構成⇒プライムカラー１：ややビビッドな色,プライムカラー２：標準的な色,プライムカラー３：やや淡い色,アクセントカラー１：ややビビッドな色,アクセントカラー２：標準的な色,アクセントカラー３：やや淡い色,背景カラー１：ややビビッドな色,背景カラー２：標準的な色,背景カラー３：やや淡い色,文字カラー１：ややビビッドな色,文字カラー２：標準的な色,文字カラー３：やや淡い色,２．ダークモード：背景色は暗く、文字色は明るい、標準的な明度を反転させた色味構成⇒プライムカラー１：ややビビッドな色,プライムカラー２：標準的な色,プライムカラー３：やや淡い色,アクセントカラー１：ややビビッドな色,アクセントカラー２：標準的な色,アクセントカラー３：やや淡い色,背景カラー１：ややビビッドな色,背景カラー２：標準的な色,背景カラー３：やや淡い色,文字カラー１：ややビビッドな色,文字カラー２：標準的な色,文字カラー３：やや淡い色"
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
        // Light スキーム
        Light_Prime: {
          strong: matches[0] || "#FF6347", // ビビッドな赤系
          standard: matches[1] || "#FFA07A", // 標準的なサーモン
          soft: matches[2] || "#FFDAB9" // やや淡いピーチパフ
        },
        Light_Accent: {
          strong: matches[3] || "#4682B4", // ビビッドなスチールブルー
          standard: matches[4] || "#87CEFA", // 標準的なライトスカイブルー
          soft: matches[5] || "#B0E0E6" // やや淡いパウダーブルー
        },
        Light_background: {
          strong: matches[6] || "#FFFFFF", // 明るい白
          standard: matches[7] || "#F8F8FF", // 標準的なゴーストホワイト
          soft: matches[8] || "#F5F5F5" // やや淡いライトグレー
        },
        Light_text: {
          strong: matches[9] || "#000000", // 強い黒
          standard: matches[10] || "#4B4B4B", // 標準的なチャコールグレー
          soft: matches[11] || "#696969" // ソフトなダークグレー
        },

        // Dark スキーム
        Dark_Prime: {
          strong: matches[12] || "#FF4500", // 強いオレンジレッド
          standard: matches[13] || "#FFA500", // 標準的なオレンジ
          soft: matches[14] || "#FFD700" // 淡いゴールド
        },
        Dark_Accent: {
          strong: matches[15] || "#1E90FF", // ビビッドなドッジャーブルー
          standard: matches[16] || "#4682B4", // 標準的なスチールブルー
          soft: matches[17] || "#87CEFA" // ソフトなライトスカイブルー
        },
        Dark_background: {
          strong: matches[18] || "#2F4F4F", // ダークスレートグレー
          standard: matches[19] || "#1C1C1C", // 標準的なブラックチャコール
          soft: matches[20] || "#000000" // ブラック
        },
        Dark_text: {
          strong: matches[21] || "#FFFFFF", // 明るい白
          standard: matches[22] || "#D3D3D3", // 標準的なライトグレー
          soft: matches[23] || "#A9A9A9" // ソフトなダークグレー
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
