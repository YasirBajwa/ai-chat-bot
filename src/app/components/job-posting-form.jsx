'use client'

import { useState } from 'react'

export function JobPostingForm({ formData, setFormData }) {
  return (
    <div className="job-posting-form overflow-y-auto max-h-[800px] pr-4">
      <h2 className="text-2xl font-bold mb-6 sticky top-0 bg-white pb-4">Job Posting Form</h2>
      <form className="space-y-6">
        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Job Title</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Short Description</label>
          <textarea
            value={formData.shortDescription || ''}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Brief overview of the position"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Detailed Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded"
            rows="5"
            placeholder="Detailed job description"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Responsibilities</label>
          <textarea
            value={formData.responsibilities || ''}
            onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="Key responsibilities and tasks"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Qualifications & Experience</label>
          <textarea
            value={formData.qualifications || ''}
            onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="Required qualifications and experience"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Benefits</label>
          <textarea
            value={formData.benefits || ''}
            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Company benefits and perks"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Salary Range</label>
          <input
            type="text"
            value={formData.salaryRange || ''}
            onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="e.g., $80,000 - $100,000"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">About Company</label>
          <textarea
            value={formData.aboutCompany || ''}
            onChange={(e) => setFormData({ ...formData, aboutCompany: e.target.value })}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Information about the company"
          />
        </div>
      </form>
    </div>
  )
}
