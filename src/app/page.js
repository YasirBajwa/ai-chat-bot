'use client'

import { useState } from 'react'
import { JobChatbot } from "./components/job-chatbot"
import { JobPostingForm } from "./components/job-posting-form"

export default function Home() {
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    responsibilities: '',
    qualifications: '',
    benefits: '',
    salaryRange: '',
    aboutCompany: '',
  })

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Job Portal</h1>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Create your job posting using our AI assistant or fill out the form directly.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Job Posting Form */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <JobPostingForm formData={formData} setFormData={setFormData} />
            </div>

            {/* Chat Instructions */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">AI Assistant</h2>
              <p className="text-gray-600 mb-4">
                Use our AI assistant to help you create a detailed job posting. The assistant will:
              </p>
              <ul className="list-disc pl-5 mb-4 text-gray-600">
                <li>Guide you through the job posting process</li>
                <li>Help you write compelling descriptions</li>
                <li>Suggest appropriate qualifications</li>
                <li>Recommend benefits and perks</li>
              </ul>
              <p className="text-gray-600">
                Click the chat icon in the bottom right to get started!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chatbot */}
      <JobChatbot onUpdateForm={setFormData} />
    </div>
  )
}
