"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, User, Bot, PlusCircle, ArrowLeft } from "lucide-react"
import { JobForm } from "./job-form"

export function JobChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentScreen, setCurrentScreen] = useState('home')
  const [screenTitle, setScreenTitle] = useState('')
  const [botResponses, setBotResponses] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: ''
  })
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "bot",
      role: "assistant",
      content: "Hi there 👋\nI'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const chatBodyRef = useRef(null)

  const [jobFormData, setJobFormData] = useState({
    title: "",
    category: "",
    subcategory: "",
    description: "",
    requirements: "",
    benefits: "",
    location: "",
    salary: "",
    experience: "",
    workType: "",
    companyName: "",
    companyDescription: "",
  })

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const jobInfoFields = [
    { key: 'title', label: 'job title', required: true },
    { key: 'shortDescription', label: 'short description', required: true },
    { key: 'salaryRange', label: 'salary range', required: false },
    { key: 'description', label: 'detailed description', required: false },
    { key: 'responsibilities', label: 'responsibilities', required: false },
    { key: 'qualifications', label: 'qualifications and experience', required: false },
    { key: 'benefits', label: 'benefits', required: false },
    { key: 'aboutCompany', label: 'about company', required: false },
  ]

  const predefinedOptions = [
    "I want to post a new job",
    "Tell me about job categories",
    "Help me write a job description",
    "What information do I need for posting?",
    "Let's create a job posting together",
  ]

  const addMessage = (content, type) => {
    const newMessage = {
      id: Date.now().toString(),
      type,
      role: type === "user" ? "user" : "assistant",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const addBotMessageWithTyping = async (content, delay = 500) => {
    setIsTyping(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Add minimum typing time
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          history: messages.map(m => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()
      
      // Add message immediately when we get it
      if (data.isError) {
        // Add error message with special styling
        addMessage({
          content: data.response,
          isError: true
        }, "bot")
      } else {
        addMessage(data.response, "bot")
      }
      
      // Clear typing indicator after a short delay
      setTimeout(() => {
        setIsTyping(false)
      }, 500)
    } catch (error) {
      console.error("Error getting response:", error)
      setTimeout(() => {
        setIsTyping(false)
        addMessage({
          content: "I apologize, but I'm having trouble responding right now. Please make sure all services are properly configured.",
          isError: true
        }, "bot")
      }, delay)
    }
  }

  const startJobInfoCollection = async () => {
    setCollectingJobInfo(true)
    setCurrentField(jobInfoFields[0])
    setCollectedInfo({})
    await addBotMessageWithTyping(`Let's create a job posting together! I'll help you gather all the necessary information. You can type 'skip' to skip optional fields.\n\nFirst, please provide the ${jobInfoFields[0].label}:`)
  }





  const handleOptionClick = async (option) => {
    addMessage(option, "user")

    switch (option) {
      case "Help me write a job description":
        setScreenTitle("Job Description")
        await addBotMessageWithTyping("I'll help you create a job posting. First, what's the job title?")
        setBotResponses(prev => ({ ...prev, currentStep: 'title' }))
        break
      case "I want to post a new job":
        setScreenTitle("Post a New Job")
        setCurrentScreen('form')
        setShowForm(true)
        setMessages([])
        break
      case "Tell me about job categories":
        setScreenTitle("Job Categories")
        setCurrentScreen('chat')
        await addBotMessageWithTyping(option)
        break
      case "What information do I need for posting?":
        setScreenTitle("Job Posting Requirements")
        setCurrentScreen('chat')
        await addBotMessageWithTyping(option)
        break
      default:
        await addBotMessageWithTyping(option)
    }
  }

  const handleBack = () => {
    setCurrentScreen('home')
    setScreenTitle('')
    setShowForm(false)
    setMessages([{
      id: "1",
      type: "bot",
      content: "Hi there 👋\nI'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    }])
  }

  const publishToForm = () => {
    try {
      // Find form elements by ID and update their values
      const formFields = {
        'job-title': botResponses.title,
        'job-description': botResponses.description,
        'job-responsibilities': botResponses.responsibilities,
        'job-requirements': botResponses.requirements,
        'job-benefits': botResponses.benefits
      }

      Object.entries(formFields).forEach(([id, value]) => {
        const element = document.getElementById(id)
        if (element) {
          element.value = value
        }
      })

      addMessage("Successfully published to form!", "bot")
    } catch (error) {
      console.error("Error publishing to form:", error)
      addMessage("Failed to publish to form. Please make sure the form exists with correct IDs.", "bot")
    }
  }

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    
    if (!currentInput.trim()) return

    const userMessage = currentInput
    setCurrentInput("") // Clear input immediately
    addMessage(userMessage, "user")

    if (botResponses.currentStep) {
      // Store the user's response
      setBotResponses(prev => ({
        ...prev,
        [prev.currentStep]: userMessage
      }))

      // Determine next step and prompt
      const steps = {
        title: { next: 'description', prompt: "Great! Now please provide a brief job description." },
        description: { next: 'responsibilities', prompt: "What are the key responsibilities for this role?" },
        responsibilities: { next: 'requirements', prompt: "What are the requirements and qualifications needed?" },
        requirements: { next: 'benefits', prompt: "What benefits and perks are offered?" },
        benefits: { next: null, prompt: null }
      }

      const currentStep = steps[botResponses.currentStep]
      
      if (currentStep.next) {
        // Move to next step
        await addBotMessageWithTyping(currentStep.prompt)
        setBotResponses(prev => ({ ...prev, currentStep: currentStep.next }))
      } else {
        // Finished collecting info
        setBotResponses(prev => ({ ...prev, currentStep: null }))
        await addBotMessageWithTyping("I've collected all the job information. You can now publish this to the form.")
        addMessage({
          content: "Would you like to publish this information to the form?",
          showPublishButton: true
        }, "bot")
      }
    } else {
      await addBotMessageWithTyping(userMessage)
    }
  }
  const handleJobFormSubmit = (formData) => {
    setJobFormData(formData)
    setShowForm(false)
    addMessage("Thanks for providing the job details. I'll help you review and format them.", "bot")
  }

  return (
    <div className="chatbot-container">
      <div
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X size={24} color="white" />
        ) : (
          <MessageCircle size={24} color="white" />
        )}
      </div>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="flex items-center gap-3">
              {(currentScreen !== 'home' ) && (
                <button onClick={handleBack} className="hover:opacity-80">
                  <ArrowLeft size={20} color="white" />
                </button>
              )}
              <h3>{screenTitle || 'AI Job Assistant'}</h3>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} color="white" />
            </button>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {/* Show options at the top on home screen */}
            {currentScreen === 'home' && (
              <div className="quick-options-section">
                <div className="welcome-message">
                  <h4 className="text-md font-semibold mb-0">Welcome to Job Portal Assistant</h4>
                  <p className="text-sm text-muted-foreground mb-0">How can I help you today?</p>
                </div>
                <div className="options-container">
                  {predefinedOptions.map((option, index) => (
                    <button
                      key={index}
                      className="option-button"
                      onClick={() => handleOptionClick(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages container */}
            <div className="messages-container space-y-3">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.type} ${
                    typeof message.content === 'object' && message.content.isError 
                      ? 'error-message' 
                      : ''
                  }`}
                >
                  <div className="message-content">
                    {typeof message.content === 'object' 
                      ? message.content.content 
                      : message.content}
                    {message.content?.showPublishButton && (
                      <button
                        onClick={publishToForm}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Publish to Form
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="chat-input">
            <div className="input-container">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Type your message..."
                className="input-field"
              />
              <button type="submit" className="send-button">
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {showForm && (
        <JobForm
          initialData={jobFormData}
          onSubmit={handleJobFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
    
  }

