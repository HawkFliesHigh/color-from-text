import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // APIキーの設定
});

export default async function getColor(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
            "入力されるテキストはラノベの文章の一部である。入力された文章から、以下の１と２の項目を出力形式通りに出力すること。それ以外のコメントや解説は出力してはならない。１．入力された文章から、以下の要素を抽出し、それに合った配色を出力形式通りに出力すること。* 場面設定: 文章で描かれている主な場面はどこか？(例：夜の街、森の中、部屋の中など)* 感情: 登場人物が抱いている主な感情は何か？(例：喜び、悲しみ、怒り、孤独など)* 雰囲気: 文章全体の雰囲気はどのようなものか？(例：明るい、暗い、幻想的、現実的など)* キーワード: 文章中に繰り返し登場する単語や、印象的な単語は何か？* 世界観: この物語の世界観は、どのような特徴を持っているか？(例：ファンタジー、SF、現代など)配色:* プライマリカラー: (場面)と(感情)を考慮し、(色相)の(明度)の色を提案してください。* アクセントカラー: (キーワード)や(雰囲気)を表現する色として、(色相)の(彩度)の色を提案してください。* 背景色: (場面)と(世界観)を考慮し、(明るさ)の(色相)の色を提案してください。* 文字色: (感情)と(視認性)を考慮し、背景色とのコントラストがはっきりする(色相)の色を提案してください。その他:* 配色全体の調和を重視し、(デザインスタイル)に合う配色を提案してください。* (ターゲット層)を考慮した配色も検討してください。* 色彩心理学に基づいた配色も提案してください。* 上記の要素に加えて、(任意の要素)も考慮してください。例:* (場面): 夜の雨降る街* (感情): 孤独、寂しさ* (雰囲気): メランコリック、ノスタルジック* (キーワード): 雨、ネオン、夜、孤独* (世界観): 近未来都市* (デザインスタイル): スチームパンク* (ターゲット層): 10代後半～20代前半の女性* (任意の要素): 物語のテーマ（例えば、成長、友情など）色の出力形式:出力の先頭にカラーコードの16進数で、次に示すの4種類のみを必ずこの順番で表示すること。プライマリ色、アクセント色、背景色、文字色。２．入力された文章について解読し、其の雰囲気や世界観や文体を考慮して、簡潔でありながらキャッチ―な言葉で口上を出力して。一人称や同じ言葉の多重使いは文章の質を下げるので避けるようにし、文章との整合性のない表現は避け、出力は口上だけにして、文章そのものについての解説は避けるようにして。口上の出力形式:カラーコードの次に改行して、括弧{}で括ったなかに口上を出力すること。「口上：」といった文字列は不要。"
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

      // パースした色コードを使って色スキームを構築（４色の構成）
      return {
        "PrimaryColor": matches[0] || "#FFFFFF", // プライマリカラー
        "AccentColor": matches[1] || "#FFFFFF", // アクセントカラー
        "BackgroundColor": matches[2] || "#FFFFFF", // 背景色
        "TextColor": matches[3] || "#000000" // 文字色
      };
    };

    // 応答テキストから口上を抽出する関数
    const parseKoujouFromText = (text: string) => {
      const koujouRegex = /\{([^}]+)\}/; // {}で囲まれた口上を抽出する正規表現
      const match = text.match(koujouRegex);
      return match ? match[1] : "No Koujou Found";
    };

    // 応答テキストから色スキームをパース
    const colorScheme = parseColorsFromText(responseText);

    // 応答テキストから口上をパース
    const koujou = parseKoujouFromText(responseText);

    // パースされた色スキームと口上をJSON形式で返す
    res.status(200).json({ color: colorScheme, koujou: koujou });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '色データの取得に失敗しました。' });
  }
}
