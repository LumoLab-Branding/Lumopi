require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

const API_KEY = process.env.API_KEY;
const API_URL = "https://api.anthropic.com/v1/messages";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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

4. Use indirect language to suggest alternative viewpoints. Employ future pacing to help the client visualize positive outcomes
5. Provide social proof to build credibility
6. Address potential objections proactively. Offer options to give the client a sense of control
7. Use sensory language to make your proposals more vivid and compelling. Create a collaborative atmosphere
8. If needed, use scarcity or urgency ethically
9. Close with a clear, actionable next step
    
Remember to maintain a calm, professional demeanor throughout the conversation. Listen actively, show empathy, and be prepared to adapt your approach based on the client's responses. Your goal is to find a mutually beneficial solution while preserving the client relationship.
`;

app.post('/api/generate-script', async (req, res) => {
  try {
    const { callee, company, context } = req.body;
    console.log('Received request:', { callee, company, context });

    const response = await axios.post(API_URL, {
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: `Create a concise branching call script for calling ${callee} at ${company} based on the following context:\n${context}\n\nUse the following persuasive communication techniques:\n${persuasiveCommunicationPrompts}\n\nEnsure the script is comprehensive and incorporates the persuasive communication techniques effectively.YOUR TOP PRIORITY IS TO NOT EXCEED 900 TOKENS IN YOUR RESPONSE WITH EACH CONTENT POINT NO MORE THAN 40 WORDS AND NO MORE THAN 10 CONTENT POINTS.`
        }
      ],
      extra_headers: {"anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15"},
      system: "You are an AI assistant creating a branching call script. The script must be formatted as a JSON object with an 'id', 'title', and 'content' field. The 'content' field should contain steps, each with 'content' (teleprompter text for the caller) and 'options' (possible client responses). The 'options' array should contain objects with 'text' (client's response), 'nextStep' (key for the next step), and 'emoji' (a relevant emoji for the option). The initial step should have the key 'initial'. Ensure the script has a clear beginning and end. Incorporate the provided persuasive communication techniques throughout the script, adapting them to fit the specific context. Choose appropriate emojis that reflect the sentiment or action of each option. YOUR TOP PRIORITY IS TO NOT EXCEED 900 TOKEN IN YOUR RESPONSE WITH EACH CONTENT POINT NO MORE THAN 40 WORDS AND NO MORE THAN 10 CONTENT POINTS.",
      temperature: 0.1,
      top_p: 0.2,
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      }
    });

    console.log('API Response:', response.data);
    console.log('Token Usage:', response.data.usage);

    let jsonContent = response.data.content[0].text;
    const jsonMatch = jsonContent.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    let newScript;
    try {
      newScript = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return res.status(500).json({
        error: 'Invalid JSON in the response',
        details: parseError.message,
        rawContent: jsonContent,
        tokenUsage: response.data.usage
      });
    }

    newScript.id = Date.now();
    console.log('Processed Script:', newScript);
    res.json({
      script: newScript,
      tokenUsage: response.data.usage
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
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});