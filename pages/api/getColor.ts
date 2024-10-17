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
		strong: matches[0] || "#FF4500",
		standard: matches[1] || "#FFA500",
		soft: matches[2] || "#FFD700"
	  },
	  Light_Accent: {
		strong: matches[3] || "#8B0000",
		standard: matches[4] || "#FF6347",
		soft: matches[5] || "#FFE4B5"
	  },
	  Light_background: {
		strong: matches[6] || "#FF8C00",
		standard: matches[7] || "#F0E68C",
		soft: matches[8] || "#FFFACD"
	  },
	  Light_text: {
		strong: matches[9] || "#2F4F4F",
		standard: matches[10] || "#696969",
		soft: matches[11] || "#D3D3D3"
	  },

	  // Dark スキーム
	  Dark_Prime: {
		strong: matches[0] || "#FF4500",
		standard: matches[1] || "#FFA500",
		soft: matches[2] || "#FFD700"
	  },
	  Dark_Accent: {
		strong: matches[3] || "#8B0000",
		standard: matches[4] || "#FF6347",
		soft: matches[5] || "#FFE4B5"
	  },
	  Dark_background: {
		strong: matches[6] || "#FF8C00",
		standard: matches[7] || "#F0E68C",
		soft: matches[8] || "#FFFACD"
	  },
	  Dark_text: {
		strong: matches[9] || "#2F4F4F",
		standard: matches[10] || "#696969",
		soft: matches[11] || "#D3D3D3"
	  }
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

