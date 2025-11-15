# Claude AI Integration Setup

This app uses Claude AI (Anthropic) to provide intelligent journaling assistance, including:
- 📝 Journal prompts and suggestions
- 💡 Mood-specific journal prompts
- 🔍 Entry analysis and insights
- ✨ Entry enhancement and expansion

## Setup Instructions

### 1. Get Your Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (starts with `sk-ant-...`)

### 2. Add API Key to Environment Variables

Add your API key to the `.env` file in the `webspahack` directory:

```bash
VITE_ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

**Important:** 
- The `VITE_` prefix is required for Vite to expose the variable to the client
- Never commit your `.env` file to version control (it's already in `.gitignore`)
- Keep your API key secure and don't share it publicly
- **Security Note**: The API key will be exposed in the browser bundle. For production apps, consider using a backend proxy to keep your API key secure. The current implementation uses `dangerouslyAllowBrowser: true` which is required for client-side usage but means anyone can view your API key in the browser's developer tools.

### 3. Restart the Dev Server

After adding the API key, restart your development server:

```bash
npm run dev
```

Or for AVP mode:

```bash
XR_ENV=avp npm run dev
```

## Usage

Once set up, you'll see the **✨ AI Assistant** panel in the journal creation view with these features:

- **📝 Prompts**: Get general journal prompts to spark reflection
- **💡 Suggestions**: Get mood-specific prompts based on your selected mood
- **🔍 Analyze**: Get insights and reflections on your journal entry
- **✨ Enhance**: Expand and deepen your thoughts with AI assistance

Click on any suggestion to add it directly to your journal entry!

## Troubleshooting

If the AI Assistant shows errors:

1. **Check API Key**: Make sure `VITE_ANTHROPIC_API_KEY` is set in your `.env` file
2. **Restart Server**: Environment variables are loaded at startup
3. **Check Console**: Look for error messages in the browser console
4. **API Limits**: Ensure your Anthropic account has available credits/quota

## API Costs

Claude API usage is billed per token. Check [Anthropic Pricing](https://www.anthropic.com/pricing) for current rates. The app uses:
- `claude-3-5-sonnet-20241022` model
- Relatively short prompts to minimize costs
- Responses are limited to 300-500 tokens

