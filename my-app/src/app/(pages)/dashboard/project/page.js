"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';
function parseProjectPlan(text) {
  const sections = text.split('\n\n');
  const phases = [];
  let currentPhase = null;

  sections.forEach(section => {
    if (section.toLowerCase().includes('phase')) {
      if (currentPhase) {
        phases.push(currentPhase);
      }
      currentPhase = {
        title: section.split('\n')[0].trim().replace(/^###\s*/, ''),
        tasks: [],
        deliverables: [],
        timeEstimate: ''
      };
    } else if (currentPhase) {
      if (section.toLowerCase().includes('task') || section.match(/^\d+\./)) {
        currentPhase.tasks.push(...section.split('\n').filter(line => line.trim()));
      } else if (section.toLowerCase().includes('deliverable')) {
        currentPhase.deliverables.push(...section.split('\n').filter(line => line.trim()));
      } else if (section.toLowerCase().includes('time') || section.toLowerCase().includes('duration')) {
        currentPhase.timeEstimate = section.split('\n')[0].trim();
      }
    }
  });

  if (currentPhase) {
    phases.push(currentPhase);
  }

  return phases;
}

export default function ProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
  });
  const [projectPlan, setProjectPlan] = useState(null);
  const [parsedPhases, setParsedPhases] = useState([]);
  const [error, setError] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [activePhase, setActivePhase] = useState(0);
  const [expandedPhases, setExpandedPhases] = useState({});

  useEffect(() => {
    // Load data from localStorage
    const planData = localStorage.getItem('projectPlan');
    const storedTitle = localStorage.getItem('projectTitle');
    const storedDescription = localStorage.getItem('projectDescription');
    const storedTasks = localStorage.getItem('completedProjectTasks');

    if (!planData || !storedTitle) {
      router.push('/dashboard/project/input');
      return;
    }

    setProjectPlan(planData);
    setProjectData({ 
      title: storedTitle, 
      description: storedDescription 
    });
    if (storedTasks) {
      setCompletedTasks(JSON.parse(storedTasks));
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (projectPlan) {
      setParsedPhases(parseProjectPlan(projectPlan));
    }
  }, [projectPlan]);

  useEffect(() => {
    if (parsedPhases.length > 0) {
      const totalTasks = parsedPhases.reduce((acc, phase) => acc + phase.tasks.length, 0);
      const completedCount = Object.values(completedTasks).filter(Boolean).length;
      setOverallProgress(Math.round((completedCount / totalTasks) * 100));
      
      // Store completed tasks in localStorage
      localStorage.setItem('completedProjectTasks', JSON.stringify(completedTasks));
    }
  }, [completedTasks, parsedPhases]);

  const toggleTask = (phaseIndex, taskIndex) => {
    const taskId = `${phaseIndex}-${taskIndex}`;
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getCompletedTasksCount = (phaseIndex) => {
    return Object.entries(completedTasks).filter(([key, value]) => 
      value && key.startsWith(`${phaseIndex}-`)
    ).length;
  };

  const togglePhaseExpand = (phaseIndex) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseIndex]: !prev[phaseIndex]
    }));
  };

  if (isLoading) {
    return (
      <div className="dashboard-layout dark-theme">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout dark-theme">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Project Progress</h2>
          <h3>{projectData.title}</h3>
          <p className="project-description">{projectData.description}</p>
        </div>
        
        <div className="progress-overview">
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#00ff9d"
                strokeWidth="2"
                strokeDasharray={`${overallProgress}, 100`}
              />
              <text x="18" y="20.35" className="percentage">{overallProgress}%</text>
            </svg>
          </div>
          <p>Overall Progress</p>
        </div>

        <div className="phase-nav">
          {parsedPhases.map((phase, index) => (
            <button
              key={index}
              className={`phase-nav-item ${index === activePhase ? 'active' : ''}`}
              onClick={() => {
                setActivePhase(index);
                document.getElementById(`phase-${index}`).scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="phase-nav-header">
                <span className="phase-number">{index + 1}</span>
                <span className="phase-title">{phase.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-content">
            <h2>Project Dashboard</h2>
            <p>Track your progress and complete tasks to achieve your project goals</p>
          </div>
          <div className="header-buttons">
            <button 
              className="secondary-btn"
              onClick={() => {
                localStorage.removeItem('projectPlan');
                localStorage.removeItem('projectTitle');
                localStorage.removeItem('projectDescription');
                localStorage.removeItem('completedProjectTasks');
                router.push('/dashboard/project/input');
              }}
            >
              Start New Project
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
          {parsedPhases.map((phase, phaseIndex) => (
            <div 
              key={phaseIndex} 
              id={`phase-${phaseIndex}`}
              className="dashboard-card"
            >
              <div className="card-header">
                <div className="card-title">
                  <div className="phase-badge">{phaseIndex + 1}</div>
                  <h3>{phase.title}</h3>
                </div>
                <div className="card-time">
                  <span className="time-icon">⏱</span>
                  {phase.timeEstimate}
                </div>
              </div>

              <div className="card-progress">
                <div className="progress-label">
                  <span>Progress</span>
                  <span>{getCompletedTasksCount(phaseIndex)}/{phase.tasks.length} tasks</span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${(getCompletedTasksCount(phaseIndex) / phase.tasks.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="card-preview">
                {phase.tasks.slice(0, 2).map((task, taskIndex) => (
                  <div 
                    key={taskIndex} 
                    className={`task-row ${completedTasks[`${phaseIndex}-${taskIndex}`] ? 'completed' : ''}`}
                  >
                    <label className="task-checkbox">
                      <input
                        type="checkbox"
                        checked={completedTasks[`${phaseIndex}-${taskIndex}`] || false}
                        onChange={() => toggleTask(phaseIndex, taskIndex)}
                      />
                      <span className="checkmark"></span>
                    </label>
                    <span className="task-text">{task}</span>
                  </div>
                ))}

                {phase.tasks.length > 2 && (
                  <button 
                    className="view-more-btn"
                    onClick={() => togglePhaseExpand(phaseIndex)}
                  >
                    {expandedPhases[phaseIndex] ? 'Show Less' : 'View All Tasks'}
                    <span className={`arrow-icon ${expandedPhases[phaseIndex] ? 'expanded' : ''}`}>▼</span>
                  </button>
                )}

                {expandedPhases[phaseIndex] && (
                  <div className="expanded-content">
                    <div className="tasks-section">
                      <h4>All Tasks</h4>
                      <div className="tasks-list">
                        {phase.tasks.slice(2).map((task, taskIndex) => (
                          <div 
                            key={taskIndex + 2} 
                            className={`task-row ${completedTasks[`${phaseIndex}-${taskIndex + 2}`] ? 'completed' : ''}`}
                          >
                            <label className="task-checkbox">
                              <input
                                type="checkbox"
                                checked={completedTasks[`${phaseIndex}-${taskIndex + 2}`] || false}
                                onChange={() => toggleTask(phaseIndex, taskIndex + 2)}
                              />
                              <span className="checkmark"></span>
                            </label>
                            <span className="task-text">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {phase.deliverables.length > 0 && (
                      <div className="deliverables-section">
                        <h4>Deliverables</h4>
                        <div className="deliverables-list">
                          {phase.deliverables.map((deliverable, i) => (
                            <div key={i} className="deliverable-item">
                              <span className="deliverable-icon">📦</span>
                              {deliverable}
                            </div>
                          ))}
                        </div>
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