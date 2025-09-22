"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaCode, FaBriefcase, FaPalette, FaHandshake, FaHeartbeat, FaGraduationCap, FaEllipsisH, FaTimes, FaChevronDown } from 'react-icons/fa';
import './page.css';

const categoryIcons = {
  'Technical': FaCode,
  'Business': FaBriefcase,
  'Design': FaPalette,
  'Soft Skills': FaHandshake,
  'Healthcare': FaHeartbeat,
  'Education': FaGraduationCap,
  'Other': FaEllipsisH
};

const commonSkills = {
  'Technical': [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL',
    'Java', 'C++', 'AWS', 'Docker', 'Git',
    'TypeScript', 'HTML/CSS', 'Angular', 'Vue.js', 'MongoDB'
  ],
  'Business': [
    'Project Management', 'Business Strategy', 'Data Analysis',
    'Market Research', 'Financial Planning', 'Sales', 'Marketing'
  ],
  'Design': [
    'UI/UX Design', 'Graphic Design', 'Adobe Creative Suite',
    'Product Design', 'Figma', 'Sketch', 'Design Thinking'
  ],
  'Soft Skills': [
    'Leadership', 'Communication', 'Problem Solving',
    'Team Management', 'Public Speaking', 'Time Management'
  ],
  'Healthcare': [
    'Patient Care', 'Medical Terminology', 'Clinical Research',
    'Healthcare Administration', 'Medical Records', 'HIPAA'
  ],
  'Education': [
    'Teaching', 'Curriculum Development', 'Student Assessment',
    'Educational Technology', 'Special Education', 'Lesson Planning'
  ],
  'Other': ['Nothing yet']
};

export default function MentorshipInputPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [formData, setFormData] = useState({
    dreamRole: '',
    selectedSkills: new Set(),
  });
  const [error, setError] = useState(null);

  const toggleSkill = (skill) => {
    const newSkills = new Set(formData.selectedSkills);
    if (skill === 'Nothing yet') {
      newSkills.clear();
      newSkills.add('Nothing yet');
    } else {
      newSkills.delete('Nothing yet');
      if (newSkills.has(skill)) {
        newSkills.delete(skill);
      } else {
        newSkills.add(skill);
      }
    }
    setFormData({ ...formData, selectedSkills: newSkills });
  };

  const removeSkill = (skill) => {
    const newSkills = new Set(formData.selectedSkills);
    newSkills.delete(skill);
    setFormData({ ...formData, selectedSkills: newSkills });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/mentorship/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamRole: formData.dreamRole,
          currentSkills: Array.from(formData.selectedSkills).join(', ')
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate roadmap');
      }

      if (!data.roadmap) {
        throw new Error('No roadmap data received');
      }

      // Store the roadmap data in localStorage
      localStorage.setItem('mentorshipRoadmap', data.roadmap);
      localStorage.setItem('dreamRole', formData.dreamRole);

      // Navigate to the dashboard
      router.push('/dashboard/mentorship');
    } catch (err) {
      console.error('Roadmap generation error:', err);
      setError(
        err.message === 'API configuration error' 
          ? 'Service is not properly configured. Please try again later.'
          : err.message === 'Service temporarily unavailable'
          ? 'Service is temporarily unavailable. Please try again in a few minutes.'
          : 'Failed to generate your roadmap. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="input-container">
      <div className="background-blur">
        <div className="blur-blob-1" />
      </div>
      
      <div className="input-content">
        <div className="left-section">
          <div className="input-header">
            <button className="ai-logo">
              <FaStar />
              <p>AI Powered</p>
            </button>
            <h1>Career Compass</h1>
            <p>Let's create your personalized career roadmap with AI-powered guidance</p>
          </div>

          <div className="form-group">
            <label htmlFor="dreamRole">What's your dream role?</label>
            <input
              type="text"
              id="dreamRole"
              value={formData.dreamRole}
              onChange={(e) => setFormData({ ...formData, dreamRole: e.target.value })}
              placeholder="e.g. Senior Frontend Developer, Product Manager, UX Designer"
              required
              disabled={isGenerating}
            />
          </div>

          <button 
            type="submit" 
            className="primary-btn" 
            disabled={isGenerating || !formData.dreamRole}
            onClick={handleSubmit}
          >
            {isGenerating ? (
              <>
                <div className="btn-spinner"></div>
                Creating Your Career Roadmap...
              </>
            ) : (
              <>
                <FaStar />
                Generate My Career Path
              </>
            )}
          </button>
        </div>

        <div className="right-section">
          <div className="form-group">
            <label>Select your current skills</label>
            {Object.entries(commonSkills).map(([category, skills]) => {
              const Icon = categoryIcons[category];
              const hasSelectedSkills = Array.from(formData.selectedSkills).some(skill => skills.includes(skill));
              const selectedCount = Array.from(formData.selectedSkills).filter(skill => skills.includes(skill)).length;
              
              return (
                <div key={category} className="skills-dropdown">
                  <button
                    type="button"
                    className={`dropdown-trigger ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                    disabled={isGenerating}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon />
                      {category}
                      {hasSelectedSkills && ` (${selectedCount})`}
                    </span>
                    <FaChevronDown />
                  </button>
                  
                  {activeCategory === category && (
                    <div className="dropdown-content">
                      {skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          className={`skill-option ${formData.selectedSkills.has(skill) ? 'active' : ''}`}
                          onClick={() => toggleSkill(skill)}
                          disabled={isGenerating}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {formData.selectedSkills.size > 0 && (
              <div className="selected-skills">
                {Array.from(formData.selectedSkills).map((skill) => (
                  <div key={skill} className="skill-tag">
                    {skill}
                    <button onClick={() => removeSkill(skill)} disabled={isGenerating}>
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 