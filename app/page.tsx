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
                  <td style={{ backgroundColor: colorData[category as keyof ColorData]?.strong || '#ffffff' }}>
                    {colorData[category as keyof ColorData]?.strong || 'N/A'}
                  </td>
                  <td style={{ backgroundColor: colorData[category as keyof ColorData]?.standard || '#ffffff' }}>
                    {colorData[category as keyof ColorData]?.standard || 'N/A'}
                  </td>
                  <td style={{ backgroundColor: colorData[category as keyof ColorData]?.soft || '#ffffff' }}>
                    {colorData[category as keyof ColorData]?.soft || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <h2>生成された色:</h2>
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
              {['PrimeD', 'AccentD', 'backgroundD', 'textD'].map((category) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td style={{ backgroundColor: colorData[category as keyof ColorData]?.strong || '#ffffff' }}>
                    {colorData[category as keyof ColorData]?.strong || 'N/A'}
                  </td>
                  <td style={{ backgroundColor: colorData[category as keyof ColorData]?.standard || '#ffffff' }}>
                    {colorData[category as keyof ColorData]?.standard || 'N/A'}
                  </td>
                  <td style={{ backgroundColor: colorData[category as keyof ColorData]?.soft || '#ffffff' }}>
                    {colorData[category as keyof ColorData]?.soft || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
