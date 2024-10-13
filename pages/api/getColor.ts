import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai'; // 最新のインポート方法

const openai = new OpenAI();

export default async function getColor(req: NextApiRequest, res: NextApiResponse) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: "You extract color schemes based on the given text." },
        {
          role: "user",
          content: "Create a color scheme based on a sunset sky."
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "color_schema",
          schema: {
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
                      soft: { type: "string" }
                    }
                  },
                  Accent: {
                    type: "object",
                    properties: {
                      strong: { type: "string" },
                      standard: { type: "string" },
                      soft: { type: "string" }
                    }
                  },
                  background: {
                    type: "object",
                    properties: {
                      strong: { type: "string" },
                      standard: { type: "string" },
                      soft: { type: "string" }
                    }
                  },
                  text: {
                    type: "object",
                    properties: {
                      strong: { type: "string" },
                      standard: { type: "string" },
                      soft: { type: "string" }
                    }
                  }
                }
              },
              Dark: {
                type: "object",
                properties: {
                  Prime: {
                    type: "object",
                    properties: {
                      strong: { type: "string" },
                      standard: { type: "string" },
                      soft: { type: "string" }
                    }
                  },
                  Accent: {
                    type: "object",
                    properties: {
                      strong: { type: "string" },
                      standard: { type: "string" },
                      soft: { type: "string" }
                    }
                  },
                  background: {
                    type: "object",
                    properties: {
                      strong: { type: "string" },
                      standard: { type: "string" },
                      soft: { type: "string" }
                    }
                  },
                  text: {
                    type: "object",
                    properties: {
                      strong: { type: "string" },
                      standard: { type: "string" },
                      soft: { type: "string" }
                    }
                  }
                }
              }
            },
            additionalProperties: false
          }
        }
      }
    });

    console.log(completion.choices[0].message.content);
    res.status(200).json({ color: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'エラーが発生しました。' });
  }
}
