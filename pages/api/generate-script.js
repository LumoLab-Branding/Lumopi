import { Anthropic } from '@anthropic-ai/sdk';
import 'dotenv/config';

const apiKey = process.env.ANTHROPIC_API_KEY;

const anthropic = new Anthropic({
  apiKey: apiKey,
  defaultHeaders: {
    'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15'
  }
});

// Updated on 2024-08-26: Added more detailed logging and error handling
// Updated on 2024-08-26: Improved error messaging

const persuasiveCommunicationPrompts = `
1. Begin by acknowledging the client's perspective without immediately agreeing or disagreeing. Use phrases like:
   - "I understand that you're feeling [emotion] about [situation]."
   - "I can see why this [issue] is important to you."

2. Ask open-ended questions to gain a deeper understanding of their concerns:
   - "Can you help me understand more about [specific aspect of their concern]?"
   - "What would an ideal solution look like from your perspective?"

3. Reframe the situation to find common ground:
   - "It seems we both want [shared goal]. Let's explore how we can achieve that together."
   - "What if we looked at this from a different angle?"

4. Use indirect language to suggest alternative viewpoints:
5. Employ future pacing to help the client visualize positive outcomes
6. Provide social proof to build credibility
7. Address potential objections proactively
8. Offer options to give the client a sense of control
9. Use sensory language to make your proposals more vivid and compelling
10. Create a collaborative atmosphere
11. If needed, use scarcity or urgency ethically
12. Close with a clear, actionable next step
    
Remember to maintain a calm, professional demeanor throughout the conversation. Listen actively, show empathy, and be prepared to adapt your approach based on the client's responses. Your goal is to find a mutually beneficial solution while preserving the client relationship.
`;

export default async function handler(req, res) {
  console.log('API route handler started');
  if (req.method === 'POST') {
    try {
      const { callee, company, context } = req.body;
      console.log('Received request:', { callee, company, context });

      console.log('API Key:', apiKey ? 'Set' : 'Not set');

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 8192,
        messages: [
          {
            role: "user",
            content: `Create a concise branching call script for calling ${callee} at ${company} based on the following context:\n${context}\n\nUse the following persuasive communication techniques:\n${persuasiveCommunicationPrompts}\n\nEnsure the script is comprehensive and incorporates the persuasive communication techniques effectively.YOUR TOP PRIORITY IS TO NOT EXCEED 2200 TOKENS IN YOUR RESPONSE.`
          }
        ],
        system: "You are an AI assistant creating a branching call script. The script must be formatted as a JSON object with an 'id', 'title', and 'content' field. The 'content' field should contain steps, each with 'content' (teleprompter text for the caller) and 'options' (possible client responses). The 'options' array should contain objects with 'text' (client's response), 'nextStep' (key for the next step), and 'emoji' (a relevant emoji for the option). The initial step should have the key 'initial'. Ensure the script has a clear beginning and end. Incorporate the provided persuasive communication techniques throughout the script, adapting them to fit the specific context. Choose appropriate emojis that reflect the sentiment or action of each option. YOUR TOP PRIORITY IS TO NOT EXCEED 2200 TOKENS IN YOUR RESPONSE."
      });

      console.log('API Response:', response);
      console.log('Token Usage:', response.usage);

      let jsonContent = response.content[0].text;
      const jsonMatch = jsonContent.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
        console.log('Extracted JSON content:', jsonContent);
      } else {
        console.log('No JSON content found in the response');
      }

      let newScript;
      try {
        newScript = JSON.parse(jsonContent);
        console.log('Parsed script:', JSON.stringify(newScript, null, 2));
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return res.status(500).json({
          error: 'Invalid JSON in the response',
          details: parseError.message,
          rawContent: jsonContent,
          tokenUsage: response.usage
        });
      }

      newScript.id = Date.now().toString();
      console.log('Processed Script:', JSON.stringify(newScript, null, 2));
      res.status(200).json({
        script: newScript,
        tokenUsage: response.usage
      });
    } catch (error) {
      console.error('Error generating script:', error);
      if (error.response) {
        console.error('API Error Response:', error.response.data);
      }
      res.status(500).json({
        error: 'Error generating script',
        details: error.message,
        apiError: error.response ? error.response.data : null,
        tokenUsage: error.response && error.response.data ? error.response.data.usage : null
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}