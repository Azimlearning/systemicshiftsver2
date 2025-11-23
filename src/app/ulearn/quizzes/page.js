// src/app/ulearn/quizzes/page.js
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaArrowRight, FaRedo, FaTrophy } from 'react-icons/fa';
import { quizzes } from '../../../lib/quizData';

const VIEW_MODES = {
  SELECTOR: 'selector',
  TAKING: 'taking',
  RESULTS: 'results'
};

export default function QuizzesPage() {
  const [viewMode, setViewMode] = useState(VIEW_MODES.SELECTOR);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);

  // Start a quiz
  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowExplanation(false);
    setViewMode(VIEW_MODES.TAKING);
  };

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    if (showExplanation) return; // Prevent changing answer after explanation is shown
    
    const questionId = currentQuestionIndex;
    setUserAnswers({ ...userAnswers, [questionId]: answer });
    setShowExplanation(true);
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    } else {
      // Finish quiz
      setViewMode(VIEW_MODES.RESULTS);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
    }
  };

  // Retake quiz
  const retakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowExplanation(false);
    setViewMode(VIEW_MODES.TAKING);
  };

  // Back to selector
  const backToSelector = () => {
    setViewMode(VIEW_MODES.SELECTOR);
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowExplanation(false);
  };

  // Calculate score
  const calculateScore = () => {
    if (!currentQuiz) return { correct: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    currentQuiz.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    const total = currentQuiz.questions.length;
    const percentage = Math.round((correct / total) * 100);
    
    return { correct, total, percentage };
  };

  // Quiz Selector View
  if (viewMode === VIEW_MODES.SELECTOR) {
    return (
      <section className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-100 p-6 rounded-full">
              <FaQuestionCircle className="text-purple-600 text-6xl" />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Quizzes</h2>
          <p className="text-xl text-gray-600 mb-2">
            Test your knowledge about Systemic Shifts and Upstream operations.
          </p>
          <p className="text-gray-500">
            Select a quiz below to begin your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => startQuiz(quiz)}
                className="w-full text-left bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-purple-600 p-3 rounded-lg">
                    <FaQuestionCircle className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-700">{quiz.title}</h3>
                </div>
                <p className="text-gray-700 mb-4">{quiz.description}</p>
                <div className="flex items-center gap-2 text-purple-600 font-semibold">
                  <span>{quiz.questions.length} Questions</span>
                  <span>•</span>
                  <span>~{Math.ceil(quiz.questions.length * 2)} minutes</span>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  // Quiz Taking View
  if (viewMode === VIEW_MODES.TAKING && currentQuiz) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const selectedAnswer = userAnswers[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;

    return (
      <section className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={backToSelector}
            className="flex items-center gap-2 text-gray-600 hover:text-teal-700 mb-4 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Quizzes</span>
          </button>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{currentQuiz.title}</h2>
            <span className="text-gray-600 font-medium">
              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mb-6"
        >
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {currentQuestion.question}
            </h3>
            
            {/* Answer Options */}
            <div className="space-y-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => {
                const isSelected = selectedAnswer === key;
                const isCorrectOption = key === currentQuestion.correctAnswer;
                const showFeedback = showExplanation;
                
                let optionClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ";
                
                if (showFeedback) {
                  if (isCorrectOption) {
                    optionClass += "bg-green-100 border-green-500 text-green-800";
                  } else if (isSelected && !isCorrectOption) {
                    optionClass += "bg-red-100 border-red-500 text-red-800";
                  } else {
                    optionClass += "bg-gray-50 border-gray-300 text-gray-600";
                  }
                } else {
                  optionClass += isSelected
                    ? "bg-purple-100 border-purple-500 text-purple-800"
                    : "bg-white border-gray-300 text-gray-700 hover:border-purple-300 hover:bg-purple-50";
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleAnswerSelect(key)}
                    disabled={showExplanation}
                    className={optionClass}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{key.toUpperCase()}.</span>
                      <span>{value}</span>
                      {showFeedback && isCorrectOption && (
                        <FaCheckCircle className="ml-auto text-green-600" />
                      )}
                      {showFeedback && isSelected && !isCorrectOption && (
                        <FaTimesCircle className="ml-auto text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation Panel */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg border-2 ${
                  isCorrect
                    ? 'bg-green-50 border-green-300'
                    : 'bg-amber-50 border-amber-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <FaCheckCircle className="text-green-600 text-xl mt-1 flex-shrink-0" />
                  ) : (
                    <FaTimesCircle className="text-red-600 text-xl mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </p>
                    <p className="text-gray-700">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaArrowLeft />
            <span>Previous</span>
          </button>

          {showExplanation && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <span>{isLastQuestion ? 'Finish Quiz' : 'Next'}</span>
              {!isLastQuestion && <FaArrowRight />}
            </button>
          )}
        </div>
      </section>
    );
  }

  // Results View
  if (viewMode === VIEW_MODES.RESULTS && currentQuiz) {
    const score = calculateScore();
    const isPerfect = score.correct === score.total;
    const isGood = score.percentage >= 80;
    const isPassing = score.percentage >= 60;

    return (
      <section className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-4xl mx-auto">
        {/* Score Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className={`p-6 rounded-full ${
              isPerfect ? 'bg-green-100' : isGood ? 'bg-blue-100' : isPassing ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <FaTrophy className={`text-6xl ${
                isPerfect ? 'text-green-600' : isGood ? 'text-blue-600' : isPassing ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
            {isPerfect ? 'Perfect Score!' : isGood ? 'Great Job!' : isPassing ? 'Good Effort!' : 'Keep Learning!'}
          </h2>
          <p className="text-2xl font-bold text-purple-600 mb-2">
            You scored {score.correct}/{score.total} ({score.percentage}%)
          </p>
          <p className="text-gray-600">
            {currentQuiz.title}
          </p>
        </motion.div>

        {/* Complete Review */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Review Your Answers</h3>
          <div className="space-y-6">
            {currentQuiz.questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-lg border-2 ${
                    isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    {isCorrect ? (
                      <FaCheckCircle className="text-green-600 text-2xl mt-1 flex-shrink-0" />
                    ) : (
                      <FaTimesCircle className="text-red-600 text-2xl mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-700">Question {index + 1}:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          isCorrect
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800 mb-4">{question.question}</p>
                      
                      {/* Options Review */}
                      <div className="space-y-2 mb-4">
                        {Object.entries(question.options).map(([key, value]) => {
                          const isUserAnswer = userAnswer === key;
                          const isCorrectOption = key === question.correctAnswer;
                          
                          let optionClass = "p-3 rounded-lg border-2 ";
                          if (isCorrectOption) {
                            optionClass += "bg-green-100 border-green-400 text-green-800";
                          } else if (isUserAnswer && !isCorrectOption) {
                            optionClass += "bg-red-100 border-red-400 text-red-800";
                          } else {
                            optionClass += "bg-gray-50 border-gray-200 text-gray-600";
                          }

                          return (
                            <div key={key} className={optionClass}>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{key.toUpperCase()}.</span>
                                <span>{value}</span>
                                {isCorrectOption && (
                                  <span className="ml-auto text-green-600 font-semibold">✓ Correct Answer</span>
                                )}
                                {isUserAnswer && !isCorrectOption && (
                                  <span className="ml-auto text-red-600 font-semibold">✗ Your Answer</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                        <p className="font-semibold text-blue-800 mb-2">Explanation:</p>
                        <p className="text-gray-700">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={retakeQuiz}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaRedo />
            <span>Retake Quiz</span>
          </button>
          <button
            onClick={backToSelector}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Quizzes</span>
          </button>
        </div>
      </section>
    );
  }

  return null;
}
