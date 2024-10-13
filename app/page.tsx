// app/page.tsx

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [colorData, setColorData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/getColor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setColorData(data.color);
    } catch (error) {
      console.error('Error fetching color data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>色味生成ツール</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          cols={50}
          placeholder="文章を入力してください"
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? '生成中...' : '色を生成'}
        </button>
      </form>
      {colorData && (
        <div>
          <h2>生成された色:</h2>
          <pre>{JSON.stringify(colorData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
