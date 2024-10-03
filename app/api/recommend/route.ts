import { NextResponse } from 'next/server';
// Remove the import for node-fetch

// 在文件顶部添加接口定义
interface ClaudeResponse {
  content: Array<{
    text: string;
  }>;
}

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request: Request) {
  try {
    const { prompt, language } = await request.json();
    
    if (!CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY is not set');
      throw new Error('API key is missing');
    }

    const claudePrompt = language === 'zh' 
      ? `请用中文回答：${prompt}`
      : prompt;

    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229", 
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: claudePrompt
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error(`Claude API error: ${claudeResponse.status} ${errorText}`);
      throw new Error(`Claude API responded with status: ${claudeResponse.status}`);
    }

    const data = await claudeResponse.json() as ClaudeResponse;
    let claudeOutput = data.content[0].text;

    // Wrap the first sentence in a span with a larger font size
    const firstSentenceEnd = claudeOutput.indexOf('.') + 1;
    const firstSentence = claudeOutput.slice(0, firstSentenceEnd);
    const restOfText = claudeOutput.slice(firstSentenceEnd);
    claudeOutput = `<span class="text-lg font-semibold">${firstSentence}</span>${restOfText}`;

    return NextResponse.json({ claudeOutput });
  } catch (error) {
    console.error('API error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// 在文件末尾添这个函数
function isClaudeResponse(data: any): data is ClaudeResponse {
  return Array.isArray(data.content) && 
         data.content.length > 0 && 
         typeof data.content[0].text === 'string';
}