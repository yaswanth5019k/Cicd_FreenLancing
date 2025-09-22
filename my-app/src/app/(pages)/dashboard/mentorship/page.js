"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';

const commonSkills = [
  'JavaScript', 'Python', 'React', 'Node.js', 'SQL',
  'Java', 'C++', 'AWS', 'Docker', 'Git',
  'TypeScript', 'HTML/CSS', 'Angular', 'Vue.js', 'MongoDB',
  'Nothing yet'
];

function parseRoadmap(text) {
  const sections = text.split('\n\n');
  const milestones = [];
  let currentMilestone = null;

  sections.forEach(section => {
    if (section.toLowerCase().includes('milestone')) {
      if (currentMilestone) {
        milestones.push(currentMilestone);
      }
      currentMilestone = {
        title: section.split('\n')[0].trim().replace(/^###\s*/, ''),
        goals: [],
        resources: [],
        timeEstimate: ''
      };
    } else if (currentMilestone) {
      if (section.toLowerCase().includes('goal') || section.match(/^\d+\./)) {
        currentMilestone.goals.push(...section.split('\n').filter(line => line.trim()));
      } else if (section.toLowerCase().includes('resource') || section.toLowerCase().includes('certification')) {
        currentMilestone.resources.push(...section.split('\n').filter(line => line.trim()));
      } else if (section.toLowerCase().includes('time') || section.toLowerCase().includes('duration')) {
        currentMilestone.timeEstimate = section.split('\n')[0].trim();
      }
    }
  });

  if (currentMilestone) {
    milestones.push(currentMilestone);
  }

  return milestones;
}

export default function MentorshipPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    dreamRole: '',
    selectedSkills: new Set(),
  });
  const [roadmap, setRoadmap] = useState(null);
  const [parsedMilestones, setParsedMilestones] = useState([]);
  const [error, setError] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [activeMilestone, setActiveMilestone] = useState(0);
  const [expandedMilestones, setExpandedMilestones] = useState({});

  useEffect(() => {
    // Load data from localStorage
    const roadmapData = localStorage.getItem('mentorshipRoadmap');
    const storedDreamRole = localStorage.getItem('dreamRole');
    const storedTasks = localStorage.getItem('completedTasks');

    if (!roadmapData || !storedDreamRole) {
      router.push('/dashboard/mentorship/input');
      return;
    }

    setRoadmap(roadmapData);
    setFormData({ ...formData, dreamRole: storedDreamRole });
    if (storedTasks) {
      setCompletedTasks(JSON.parse(storedTasks));
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (roadmap) {
      setParsedMilestones(parseRoadmap(roadmap));
    }
  }, [roadmap]);

  useEffect(() => {
    if (parsedMilestones.length > 0) {
      const totalTasks = parsedMilestones.reduce((acc, milestone) => acc + milestone.goals.length, 0);
      const completedCount = Object.values(completedTasks).filter(Boolean).length;
      setOverallProgress(Math.round((completedCount / totalTasks) * 100));
      
      // Store completed tasks in localStorage
      localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    }
  }, [completedTasks, parsedMilestones]);

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

      setRoadmap(data.roadmap);
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

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([roadmap], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.dreamRole.toLowerCase().replace(/\s+/g, '-')}-roadmap.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleTask = (milestoneIndex, taskIndex) => {
    const taskId = `${milestoneIndex}-${taskIndex}`;
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getCompletedTasksCount = (milestoneIndex) => {
    return Object.entries(completedTasks).filter(([key, value]) => 
      value && key.startsWith(`${milestoneIndex}-`)
    ).length;
  };

  const toggleMilestoneExpand = (milestoneIndex) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [milestoneIndex]: !prev[milestoneIndex]
    }));
  };

  if (isLoading) {
    return (
      <div className="mentorship-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your mentorship journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Your Journey to</h2>
          <h3>{formData.dreamRole}</h3>
        </div>
        
        <div className="progress-overview">
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#eee"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#0066FF"
                strokeWidth="2"
                strokeDasharray={`${overallProgress}, 100`}
              />
              <text x="18" y="20.35" className="percentage">{overallProgress}%</text>
            </svg>
          </div>
          <p>Overall Progress</p>
        </div>

        <div className="milestone-nav">
          {parsedMilestones.map((milestone, index) => (
            <button
              key={index}
              className={`milestone-nav-item ${index === activeMilestone ? 'active' : ''}`}
              onClick={() => {
                setActiveMilestone(index);
                document.querySelector(`milestone-${index}`).scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="milestone-nav-header">
                <span className="milestone-number">{index + 1}</span>
                <span className="milestone-title">{milestone.title.replace(/\*\*/g, '')}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-content">
            <h2>Learning Dashboard</h2>
            <p>Track your progress and complete tasks to achieve your goals</p>
          </div>
          <div className="header-buttons">
          <button 
            className="secondary-btn"
            onClick={handleDownload}
          >
            Download Plan
          </button>
          <button 
            className="secondary-btn"
            onClick={() => {
              localStorage.removeItem('mentorshipRoadmap');
              localStorage.removeItem('dreamRole');
              localStorage.removeItem('completedTasks');
              router.push('/dashboard/input');
            }}
          >
            Start Over
          </button>
          <button 
            className="secondary-btn"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </button>
          </div>
        </div>

        <div className="dashboard-grid">
          {parsedMilestones.map((milestone, milestoneIndex) => (
            <div 
              key={milestoneIndex} 
              id={`milestone-${milestoneIndex}`}
              className="dashboard-card"
            >
              <div className="card-header">
                <div className="card-title">
                  <div className="milestone-badge">{milestoneIndex + 1}</div>
                  <h3>{milestone.title.replace(/\*\*/g, '')}</h3>
                </div>
                <div className="card-time">
                  <span className="time-icon">⏱</span>
                  {milestone.timeEstimate}
                </div>
              </div>

              <div className="card-progress">
                <div className="progress-label">
                  <span>Progress</span>
                  <span>{getCompletedTasksCount(milestoneIndex)}/{milestone.goals.length} tasks</span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${(getCompletedTasksCount(milestoneIndex) / milestone.goals.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="card-preview">
                {milestone.goals.slice(0, 2).map((goal, taskIndex) => {
                  const cleanGoal = goal.replace(/\*/g, '').trim();
                  return (
                    <div 
                      key={taskIndex} 
                      className={`task-row ${completedTasks[`${milestoneIndex}-${taskIndex}`] ? 'completed' : ''}`}
                    >
                      <label className="task-checkbox">
                        <input
                          type="checkbox"
                          checked={completedTasks[`${milestoneIndex}-${taskIndex}`] || false}
                          onChange={() => toggleTask(milestoneIndex, taskIndex)}
                        />
                        <span className="checkmark"></span>
                      </label>
                      <span className="task-text">{cleanGoal}</span>
                    </div>
                  );
                })}

                <button 
                  className="view-more-btn"
                  onClick={() => toggleMilestoneExpand(milestoneIndex)}
                >
                  {expandedMilestones[milestoneIndex] ? 'Show Less' : 'View All Tasks'}
                  <span className={`arrow-icon ${expandedMilestones[milestoneIndex] ? 'expanded' : ''}`}>▼</span>
                </button>

                {expandedMilestones[milestoneIndex] && (
                  <div className="expanded-content">
                    <div className="tasks-section">
                      <h4>All Tasks</h4>
                      <div className="tasks-list">
                        {milestone.goals.slice(2).map((goal, taskIndex) => {
                          const cleanGoal = goal.replace(/\*/g, '').trim();
                          return (
                            <div 
                              key={taskIndex + 2} 
                              className={`task-row ${completedTasks[`${milestoneIndex}-${taskIndex + 2}`] ? 'completed' : ''}`}
                            >
                              <label className="task-checkbox">
                                <input
                                  type="checkbox"
                                  checked={completedTasks[`${milestoneIndex}-${taskIndex + 2}`] || false}
                                  onChange={() => toggleTask(milestoneIndex, taskIndex + 2)}
                                />
                                <span className="checkmark"></span>
                              </label>
                              <span className="task-text">{cleanGoal}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {milestone.resources.length > 0 ? (
                      <div className="resources-section">
                        <h4>Resources</h4>
                        <div className="resources-list">
                          {milestone.resources.map((resource, i) => {
                            const cleanResource = resource.replace(/\*/g, '').trim();
                            return (
                              <div key={i} className="resource-item">
                                <span className="resource-icon">📚</span>
                                {cleanResource}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="no-resources">
                        <p>No resources available for this milestone</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
