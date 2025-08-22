import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { getKnowledgeTopicQuestions } from '../../lib/api/getKnowledgeTopicQuestions.ts';
import './KnowledgeContributionModal.css';

const KnowledgeContributionModal = ({ isOpen, onClose, knowledgeTopic }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset modal state when closed or topic changes
  useEffect(() => {
    if (!isOpen) {
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setError('');
    }
  }, [isOpen]);

  // Load questions when modal opens and topic is available
  useEffect(() => {
    const loadQuestions = async () => {
      if (isOpen && knowledgeTopic?.id) {
        setIsLoading(true);
        setError('');
        
        try {
          const topicQuestions = await getKnowledgeTopicQuestions(knowledgeTopic.id);
          setQuestions(topicQuestions || []);
          
          if (!topicQuestions || topicQuestions.length === 0) {
            setError('No questions found for this topic.');
          }
        } catch (err) {
          console.error('Error loading questions:', err);
          setError('Failed to load questions. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadQuestions();
  }, [isOpen, knowledgeTopic]);

  const handleAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // TODO: Handle submission in next step
    console.log('Submitting answers:', answers);
    onClose();
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex] || '';
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswer = currentAnswer.trim().length > 0;

  // Progress calculation
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answeredQuestions = Object.keys(answers).filter(key => answers[key].trim().length > 0).length;

  const actions = (
    <>
      <button 
        type="button" 
        className="btn-secondary"
        onClick={onClose}
      >
        Cancel
      </button>
      
      {!isFirstQuestion && (
        <button 
          type="button" 
          className="btn-outline"
          onClick={handlePrevious}
        >
          Previous
        </button>
      )}
      
      {!isLastQuestion ? (
        <button 
          type="button" 
          className="btn-primary"
          onClick={handleNext}
          disabled={!hasAnswer}
        >
          Next
        </button>
      ) : (
        <button 
          type="button" 
          className="btn-primary"
          onClick={handleSubmit}
          disabled={answeredQuestions < questions.length}
        >
          Submit
        </button>
      )}
    </>
  );

  return (
    <div className="knowledge-contribution-modal">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Contribute to ${knowledgeTopic?.title || 'Knowledge Topic'}`}
        actions={actions}
        maxWidth="600px"
        maxHeight="90vh"
      >
        <div className="contribution-modal-content">
          {isLoading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading questions...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <div className="error-message">
                {error}
              </div>
            </div>
          )}

          {!isLoading && !error && questions.length > 0 && (
            <>
              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-info">
                  <span className="progress-text">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="answered-count">
                    {answeredQuestions} answered
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Question */}
              <div className="question-section">
                <div className="question-header">
                  <div className="question-number">
                    Q{currentQuestionIndex + 1}
                  </div>
                </div>
                
                <div className="question-text">
                  {currentQuestion}
                </div>

                <div className="answer-section">
                  <label htmlFor="answer-input" className="answer-label">
                    Your Answer
                  </label>
                  <textarea
                    id="answer-input"
                    className="answer-textarea"
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Share your knowledge and expertise..."
                    rows={6}
                  />
                  <div className="answer-help">
                    Provide detailed, helpful information that demonstrates your expertise in this area.
                  </div>
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="question-navigation">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    className={`nav-dot ${
                      index === currentQuestionIndex ? 'active' : ''
                    } ${answers[index]?.trim().length > 0 ? 'answered' : ''}`}
                    onClick={() => setCurrentQuestionIndex(index)}
                    aria-label={`Go to question ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default KnowledgeContributionModal;
