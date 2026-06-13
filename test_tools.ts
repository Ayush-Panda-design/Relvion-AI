import { AnthropicProvider } from '@corsair-dev/mcp';
import { corsair } from './src/server/corsair';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const provider = new AnthropicProvider();
    const tools = provider.build({ corsair });
    console.log('--- COSAIR TOOLS ---');
    console.log(JSON.stringify(tools.map(t => t.name), null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
