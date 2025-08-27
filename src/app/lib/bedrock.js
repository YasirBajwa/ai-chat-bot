export async function callClaudeModel(message, conversationHistory = []) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history: conversationHistory,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get response from Claude")
    }

    const data = await response.json()
    return data.response
  } catch (error) {
    console.error("Error calling Claude model:", error)
    return "I'm sorry, I'm having trouble processing your request right now. Please try again."
  }
}
