// pages/api/getColor.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

// OpenAIの設定を定義
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // 環境変数からAPIキーを取得
});

const openai = new OpenAIApi(configuration);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { text } = req.body;

  const prompt = `
  以下の文章から連想される色を、HEXカラーコードで教えてください。

  文章: "${text}"
  色:
  `;

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 10,
      temperature: 0.7,
    });

    const colorCode = completion.data.choices[0].text?.trim();
    res.status(200).json({ color: colorCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'エラーが発生しました。' });
  }
};
