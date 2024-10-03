import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

# Now you can use the environment variables
curl https://api.anthropic.com/v1/messages \
--header f"anthropic-api-key: {os.environ['ANTHROPIC_API_KEY']}"

" \
  --header "content-type: application/json" \
  --header "anthropic-version: 2023-06-01" \
  --data '{
    "model": "claude-3-opus-20240229",
    "max_tokens": 1000,
    "messages": [{"role": "user", "content": "Hello, Claude!"}]
  }'
