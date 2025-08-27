import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime"

const fallbackResponses = {
  noCredentials: "I apologize, but I'm not properly configured at the moment. Please ensure AWS credentials are set up correctly.",
  connectionError: "I'm having trouble connecting to my backend services. Please check the AWS configuration.",
  modelError: "I'm having trouble processing your request right now. As a fallback, I can tell you that I'm here to help with job postings, understanding job categories, and providing guidance on job-related topics. What would you like to know?",
  generalError: "Something went wrong. Please try again later."
}

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json()

    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn("AWS credentials not configured")
      return Response.json({
        response: fallbackResponses.noCredentials,
        isError: true
      })
    }

    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1", // Add default region
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })

    // Add job portal context to the prompt
    const systemContext = `You are a helpful AI assistant for a job portal. You help users create job postings, understand job categories, and provide guidance on job-related topics. Always be professional and focus on job-related queries.

For job categories, you can suggest: Technology, Healthcare, Finance, Education, Sales, Marketing, Customer Service, Administrative, Engineering, and others.

When helping with job descriptions, make sure to include:
1. Clear job title
2. Role overview
3. Key responsibilities
4. Required qualifications
5. Preferred skills
6. Benefits and perks
7. Company culture
8. Location/Remote policy`

    try {
      // Build messages array properly - ensure first message is user role
      let messages = []
      
      // Add history messages
      for (const msg of history) {
        messages.push({
          role: msg.role,
          content: [{
            type: "text",
            text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
          }]
        })
      }
      
      // Add current user message
      messages.push({
        role: "user",
        content: [{
          type: "text",
          text: typeof message === 'string' ? message : JSON.stringify(message)
        }]
      })

      // Ensure first message is from user - if not, remove assistant messages from the beginning
      while (messages.length > 0 && messages[0].role !== 'user') {
        console.warn('Removing non-user message from start:', messages[0].role)
        messages.shift()
      }

      // Ensure we have at least one message and it's from user
      if (messages.length === 0 || messages[0].role !== 'user') {
        messages = [{
          role: "user",
          content: [{
            type: "text",
            text: typeof message === 'string' ? message : JSON.stringify(message)
          }]
        }]
      }

      console.log('Request payload:', {
        history: history.length,
        messageType: typeof message,
        message: message,
        totalMessages: messages.length,
        firstMessageRole: messages[0]?.role,
        messageRoles: messages.map(m => m.role)
      })

      const command = new InvokeModelCommand({
        modelId: "anthropic.claude-3-haiku-20240307-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 4000,
          temperature: 0.7,
          system: systemContext,
          messages: messages
        }),
      })

      const response = await client.send(command)
      const responseBody = JSON.parse(new TextDecoder().decode(response.body))
      
      console.log('Full response from Bedrock:', JSON.stringify(responseBody, null, 2))
      
      // Handle different response formats
      if (responseBody.content && Array.isArray(responseBody.content)) {
        const textContent = responseBody.content[0]
        if (textContent?.type === 'text' && textContent.text) {
          return Response.json({
            response: textContent.text.trim(),
            role: responseBody.role || 'assistant'  // Add role for typing indicator
          })
        }
      } else if (responseBody.completion) {
        // Legacy completion format
        return Response.json({
          response: responseBody.completion.trim(),
          role: 'assistant'
        })
      } else if (responseBody.content && responseBody.content.length === 0) {
        // Empty content array
        console.warn("Received empty content array from Bedrock")
        return Response.json({
          response: "I received your message but couldn't generate a response. Please try rephrasing your question.",
          isError: true,
          role: 'assistant'
        })
      }
      
      // If we can't find the response in expected places
      console.error("Unexpected response format:", responseBody)
      throw new Error("Could not extract response text from Bedrock response")

    } catch (modelError) {
      console.error("Model Invocation Error:", modelError)
      
      // Log the full error for debugging
      if (modelError.response) {
        console.error("Error response:", await modelError.response.text())
      }
      
      return Response.json({
        response: fallbackResponses.modelError,
        isError: true
      })
    }
  } catch (error) {
    console.error("API Error:", error)
    return Response.json({
      response: fallbackResponses.generalError,
      isError: true
    })
  }
}