"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaCode, FaTimes } from 'react-icons/fa';
import './page.css';

export default function ProjectInputPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/project/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('Failed to parse response:', text);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate project plan');
      }

      if (!data.plan) {
        throw new Error('No project plan received');
      }

      // Store the project data in localStorage
      localStorage.setItem('projectPlan', data.plan);
      localStorage.setItem('projectTitle', formData.title);
      localStorage.setItem('projectDescription', formData.description);
      
      // Navigate to the project dashboard
      router.push('/dashboard/project');
    } catch (err) {
      console.error('Project plan generation error:', err);
      setError(err.message || 'Failed to generate your project plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="input-container dark-theme">
      <div className="input-content">
        <div className="form-section">
          <div className="input-header">
            <button className="ai-logo">
              <FaStar />
              <p>AI Powered</p>
            </button>
            <h1>Project Planner</h1>
            <p>Let's break down your project into manageable phases</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Project Title</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. E-commerce Website, Mobile App, Portfolio Site"
                required
                disabled={isGenerating}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Project Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project goals and main features..."
                required
                disabled={isGenerating}
                rows={4}
              />
            </div>

            <button 
              type="submit" 
              className="primary-btn" 
              disabled={isGenerating || !formData.title || !formData.description}
            >
              {isGenerating ? (
                <>
                  <div className="btn-spinner"></div>
                  Creating Your Project Plan...
                </>
              ) : (
                <>
                  <FaStar />
                  Generate Project Plan
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 