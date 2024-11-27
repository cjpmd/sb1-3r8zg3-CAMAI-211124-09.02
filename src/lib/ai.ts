import OpenAI from 'openai';

const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'sk-your-openai-api-key') {
    return null;
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

let openaiClient: OpenAI | null = null;

const getClient = () => {
  if (!openaiClient) {
    openaiClient = getOpenAIClient();
  }
  return openaiClient;
};

export interface ContentSuggestion {
  title: string;
  description: string;
  hashtags: string[];
}

export interface ContentGenerationParams {
  platform: string;
  topic?: string;
  tone?: 'professional' | 'casual' | 'humorous' | 'educational';
  targetAudience?: string;
  contentType?: 'image' | 'video' | 'text';
}

export async function generateContentSuggestions(
  params: ContentGenerationParams
): Promise<ContentSuggestion[]> {
  const openai = getClient();
  if (!openai) {
    return [
      {
        title: 'OpenAI API key required',
        description: 'Please add your OpenAI API key to use AI-powered content generation.',
        hashtags: ['#Setup', '#Configuration'],
      }
    ];
  }

  try {
    const { platform, topic, tone = 'casual', targetAudience = 'Gen Z', contentType = 'image' } = params;

    const prompt = `Generate 3 engaging ${platform} post ideas. Each post should include a catchy title, engaging description, and relevant hashtags.

Context:
- Platform: ${platform}
- Topic: ${topic || 'trending topics'}
- Tone: ${tone}
- Target Audience: ${targetAudience}
- Content Type: ${contentType}

Requirements:
1. Title should be attention-grabbing and under 60 characters
2. Description should be platform-appropriate and engaging
3. Include 5-7 relevant hashtags
4. Match the specified tone and target audience
5. Optimize for ${platform}'s best practices

Format each suggestion as:
Title: [title]
Description: [description]
Hashtags: [hashtags]

---`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the response into structured format
    const suggestions = content.split('---').filter(Boolean).map(suggestion => {
      const lines = suggestion.trim().split('\n');
      const title = lines.find(line => line.startsWith('Title:'))?.replace('Title:', '').trim() || '';
      const description = lines.find(line => line.startsWith('Description:'))?.replace('Description:', '').trim() || '';
      const hashtags = lines.find(line => line.startsWith('Hashtags:'))?.replace('Hashtags:', '').trim().split(' ') || [];

      return {
        title,
        description,
        hashtags: hashtags.filter(tag => tag.startsWith('#')),
      };
    });

    return suggestions;
  } catch (error) {
    console.error('Error generating content suggestions:', error);
    return [
      {
        title: 'Error generating content',
        description: 'There was an error generating content. Please try again later.',
        hashtags: ['#Error'],
      }
    ];
  }
}

export async function generateImagePrompt(description: string, platform: string): Promise<string> {
  const openai = getClient();
  if (!openai) {
    return 'OpenAI API key required for image prompt generation';
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Generate a detailed DALL-E prompt for a ${platform} post image based on this description: "${description}".
          
Requirements:
1. Make it visually appealing and suitable for ${platform}
2. Include style, mood, lighting, and composition details
3. Keep it under 200 characters
4. Make it engaging and scroll-stopping
5. Ensure it's brand-safe and appropriate

Format: Just the prompt text, no explanations.`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content?.trim() || description;
  } catch (error) {
    console.error('Error generating image prompt:', error);
    return description;
  }
}

export async function generateImage(prompt: string): Promise<string> {
  const openai = getClient();
  if (!openai) {
    return '';
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    return response.data[0]?.url || '';
  } catch (error) {
    console.error('Error generating image:', error);
    return '';
  }
}

export async function improveContent(
  content: { title: string; description: string },
  platform: string
): Promise<{ title: string; description: string }> {
  const openai = getClient();
  if (!openai) {
    return content;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Improve this ${platform} post for better engagement:

Title: ${content.title}
Description: ${content.description}

Requirements:
1. Make the title more attention-grabbing
2. Optimize the description for ${platform}'s algorithm
3. Maintain the original message and tone
4. Add relevant emojis where appropriate
5. Ensure it follows ${platform}'s best practices

Format the response as:
Title: [improved title]
Description: [improved description]`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return content;
    }

    const lines = response.split('\n');
    const improvedTitle = lines.find(line => line.startsWith('Title:'))?.replace('Title:', '').trim() || content.title;
    const improvedDescription = lines.find(line => line.startsWith('Description:'))?.replace('Description:', '').trim() || content.description;

    return {
      title: improvedTitle,
      description: improvedDescription,
    };
  } catch (error) {
    console.error('Error improving content:', error);
    return content;
  }
}
