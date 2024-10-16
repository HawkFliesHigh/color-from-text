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
         content: "You are an assistant that generates color schemes based on the given text."
       },
       {
         role: "user",
         content: `
           Create a color scheme based on this text: "${text}"
           Please provide the colors in the following categories:
           - Prime: The main colors that will be used for key elements in the design, such as buttons or highlights. These should be bold and stand out.
           - Accent: Colors that complement the Prime colors and are used for emphasis or subtle details.
           - Background: Colors that will be used as background elements. These should be soft and not too distracting.
           - Text: Colors that will be used for text. Ensure that these colors provide good contrast with the background colors for readability.
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
		Prime: {
		  strong: matches[0] || "#FF4500",
		  standard: matches[1] || "#FFA500",
		  soft: matches[2] || "#FFD700"
		},
		Accent: {
		  strong: matches[3] || "#8B0000",
		  standard: matches[4] || "#FF6347",
		  soft: matches[5] || "#FFE4B5"
		},
		background: {
		  strong: matches[6] || "#FF8C00",
		  standard: matches[7] || "#F0E68C",
		  soft: matches[8] || "#FFFACD"
		},
		text: {
		  strong: matches[9] || "#2F4F4F",
		  standard: matches[10] || "#696969",
		  soft: matches[11] || "#D3D3D3"
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

