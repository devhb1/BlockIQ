"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Brain, CheckCircle, XCircle, RotateCcw, Eye, Trophy } from "lucide-react"
import PayToSeeScore from "@/components/PayToSeeScore"
import ScoreDisplay from "@/components/ScoreDisplay"
import { sdk } from '@farcaster/frame-sdk'
import { ClientWeb3Provider } from '@/components/ClientWeb3Provider'
import { questionPool, Question } from "../components/Quiz/quiz-questions"

interface QuizState {
  currentQuestion: number
  selectedAnswers: Record<number, string>
  timeRemaining: number
  quizStarted: boolean
  quizCompleted: boolean
  selectedQuestions: Question[]
  startTime: number
}

export default function HomePage() {
  const [isAppReady, setIsAppReady] = useState(false)
  
  // Proper Farcaster SDK initialization
  useEffect(() => {
    let isMounted = true;
    
    const initializeFarcasterSDK = async () => {
      try {
        // Wait for DOM to be fully loaded
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            if (document.readyState === 'complete') {
              resolve(undefined);
            } else {
              window.addEventListener('load', resolve, { once: true });
            }
          });
        }

        // Additional delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (isMounted) {
          // Call ready with proper error handling
          await sdk.actions.ready();
          console.log('✅ Farcaster SDK ready called successfully');
          setIsAppReady(true);
        }
      } catch (error) {
        console.warn('⚠️ Farcaster SDK ready failed:', error);
        // Set app as ready even if SDK fails (for non-Farcaster environments)
        if (isMounted) {
          setIsAppReady(true);
        }
      }
    };

    initializeFarcasterSDK();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    selectedAnswers: {},
    timeRemaining: 600, // 10 minutes in seconds
    quizStarted: false,
    quizCompleted: false,
    selectedQuestions: [],
    startTime: 0,
  })
  const [showResults, setShowResults] = useState(false)
  const [showDetailedResults, setShowDetailedResults] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  // Timer effect
  useEffect(() => {
    if (quizState.quizStarted && !quizState.quizCompleted && quizState.timeRemaining > 0) {
      const timer = setInterval(() => {
        setQuizState((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }))
      }, 1000)
      return () => clearInterval(timer)
    } else if (quizState.timeRemaining === 0 && !quizState.quizCompleted) {
      // Auto-submit when time runs out
      handleSubmitQuiz()
    }
  }, [quizState.quizStarted, quizState.quizCompleted, quizState.timeRemaining])

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Farcaster-optimized share functionality for Mini App environment
  const handleFarcasterShare = (score: number, totalQuestions: number) => {
    if (typeof window !== 'undefined') {
      const shareText = `🧠 I just scored ${score}/${totalQuestions} on BlockIQ - the Blockchain IQ Quiz!\n\nTest your knowledge: `
      const shareUrl = window.location.href
      
      // Try Farcaster native sharing first
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'sdk.actions.share',
          data: {
            text: shareText,
            url: shareUrl
          }
        }, '*')
      } else {
        // Fallback to standard sharing
        if (navigator.share) {
          navigator.share({
            title: 'BlockIQ Quiz Results',
            text: shareText,
            url: shareUrl
          })
        } else {
          navigator.clipboard.writeText(shareText + shareUrl)
          alert('Results copied to clipboard!')
        }
      }
    }
  }

  // Enhanced Mobile-First Design Helper for Farcaster
  const isMobileView = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 || window.navigator.userAgent.includes('Farcaster')
    }
    return false
  }

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (quizState.timeRemaining <= 30) return "text-red-600"
    if (quizState.timeRemaining <= 120) return "text-orange-600"
    return "text-gray-600"
  }

  // Randomly select 10 questions from the pool
  const selectRandomQuestions = useCallback(() => {
    const shuffled = [...questionPool].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 10)
  }, [])

  // Start quiz
  const startQuiz = () => {
    const selectedQuestions = selectRandomQuestions()
    setQuizState({
      currentQuestion: 0,
      selectedAnswers: {},
      timeRemaining: 600,
      quizStarted: true,
      quizCompleted: false,
      selectedQuestions,
      startTime: Date.now(),
    })
  }

  // Handle answer selection
  const selectAnswer = (answer: string) => {
    setQuizState((prev) => ({
      ...prev,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [prev.currentQuestion]: answer,
      },
    }))
  }

  // Go to next question
  const nextQuestion = () => {
    if (quizState.currentQuestion < quizState.selectedQuestions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
      }))
    } else {
      handleSubmitQuiz()
    }
  }

  // Calculate score
  const calculateScore = () => {
    let correctAnswers = 0
    let incorrectAnswers = 0
    quizState.selectedQuestions.forEach((question, index) => {
      const userAnswer = quizState.selectedAnswers[index]
      if (userAnswer === question.correctAnswer) {
        correctAnswers++
      } else if (userAnswer) {
        incorrectAnswers++
      }
    })
    const baseScore = 100
    const correctPoints = correctAnswers * 10
    const incorrectPenalty = incorrectAnswers * 5
    // Time bonus calculation
    const completionTime = (Date.now() - quizState.startTime) / 1000 / 60 // in minutes
    let timeBonus = 0
    if (completionTime < 5) timeBonus = 20
    else if (completionTime < 7) timeBonus = 10
    else if (completionTime < 10) timeBonus = 5
    const finalScore = Math.max(50, Math.min(150, baseScore + correctPoints - incorrectPenalty + timeBonus))
    return {
      correctAnswers,
      incorrectAnswers,
      unanswered: 10 - correctAnswers - incorrectAnswers,
      baseScore,
      correctPoints,
      incorrectPenalty,
      timeBonus,
      finalScore,
      completionTime: Math.round(completionTime * 10) / 10,
      accuracy: Math.round((correctAnswers / 10) * 100),
    }
  }

  // Submit quiz
  const handleSubmitQuiz = () => {
    setQuizState((prev) => ({
      ...prev,
      quizCompleted: true,
    }))
    setShowPayment(true)
  }

  // Handle successful payment
  const handlePaymentSuccess = () => {
    setPaymentCompleted(true)
    setShowPayment(false)
    setShowResults(true)
  }

  // Reset quiz
  const resetQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      selectedAnswers: {},
      timeRemaining: 600,
      quizStarted: false,
      quizCompleted: false,
      selectedQuestions: [],
      startTime: 0,
    })
    setShowResults(false)
    setShowDetailedResults(false)
    setPaymentCompleted(false)
    setShowPayment(false)
  }

  const currentQuestion = quizState.selectedQuestions[quizState.currentQuestion]
  const selectedAnswer = quizState.selectedAnswers[quizState.currentQuestion]
  const progress = ((quizState.currentQuestion + 1) / 10) * 100

  // Show loading screen until app is ready
  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <Card className="shadow-xl border-0 rounded-2xl max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <img 
                src="/BlockIQ.png" 
                alt="BlockIQ Logo" 
                className="h-16 w-16 rounded-full shadow-lg border-4 border-blue-200 bg-white object-cover animate-pulse" 
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-700 mb-2">BlockIQ</h2>
              <p className="text-gray-600">Loading your blockchain IQ quiz...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ClientWeb3Provider>
      {/* Welcome Screen - Optimized for Farcaster Mini App */}
      {!quizState.quizStarted && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-2xl mx-auto">
            <Card className="shadow-xl border-0 rounded-2xl">
              <CardHeader className="text-center space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="flex justify-center mb-2">
                  <img 
                    src="/BlockIQ.png" 
                    alt="BlockIQ Logo" 
                    className="h-16 w-16 sm:h-24 sm:w-24 rounded-full shadow-lg border-4 border-blue-200 bg-white object-cover" 
                  />
                </div>
                <CardTitle className="text-2xl sm:text-4xl font-extrabold text-blue-700 tracking-tight">BlockIQ</CardTitle>
                <CardDescription className="text-sm sm:text-lg text-gray-700 max-w-lg mx-auto px-2">
                  <span className="block font-semibold text-blue-600 mb-2">Blockchain IQ Quiz</span>
                  Test your knowledge of blockchain, Base, EVM, and crypto concepts.<br />
                  Challenge yourself, pay to see your score, and share your results!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6">
                <div className="bg-blue-50/80 p-4 sm:p-6 rounded-xl space-y-3 sm:space-y-4 border border-blue-100">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg">How it works:</h3>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                      <span>10 randomly selected questions from our comprehensive database</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                      <span>10-minute time limit with automatic submission</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                      <span>IQ-style scoring system (50-150 point range)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                      <span>Pay a small ETH fee to unlock your score and detailed results</span>
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <Button 
                    onClick={startQuiz} 
                    size="lg" 
                    className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-lg sm:text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-all touch-manipulation"
                  >
                    Start Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Payment Screen - Optimized for Farcaster Mini App */}
      {showPayment && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <Card className="text-center shadow-lg">
              <CardHeader className="space-y-4">
                <div className="flex justify-center">
                  <Trophy className="h-12 w-12 text-yellow-500" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Quiz Complete!</CardTitle>
                <CardDescription className="text-sm sm:text-base px-2">
                  You've finished the BlockIQ quiz! Pay 0.0001 ETH to unlock your detailed results and share your score on Farcaster.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    🎯 <strong>What you'll get:</strong><br />
                    • Your detailed IQ score breakdown<br />
                    • Time bonus calculations<br />
                    • Review of all questions & answers<br />
                    • Shareable results for Farcaster
                  </p>
                </div>
                <PayToSeeScore 
                  onPaymentSuccess={handlePaymentSuccess}
                  disabled={false}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Results Screen */}
      {showResults && (
        (() => {
          const scoreData = calculateScore()
          if (paymentCompleted && !showDetailedResults) {
            return (
              <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <ScoreDisplay
                  score={scoreData.correctAnswers}
                  totalQuestions={10}
                  timeSpent={Math.floor((Date.now() - quizState.startTime) / 1000)}
                  onRestart={resetQuiz}
                  onShowDetailed={() => setShowDetailedResults(true)}
                  onShare={() => handleFarcasterShare(scoreData.correctAnswers, 10)}
                />
              </div>
            )
          }
          if (showDetailedResults) {
            return (
              <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-4xl mx-auto space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">Detailed Results Review</CardTitle>
                        <Button variant="outline" onClick={() => setShowDetailedResults(false)}>
                          Back to Summary
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {quizState.selectedQuestions.map((question, index) => {
                          const userAnswer = quizState.selectedAnswers[index]
                          const isCorrect = userAnswer === question.correctAnswer
                          const wasAnswered = userAnswer !== undefined
                          return (
                            <div key={question.id} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-start gap-3">
                                <Badge variant={isCorrect ? "default" : wasAnswered ? "destructive" : "secondary"}>
                                  Q{index + 1}
                                </Badge>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 mb-3">{question.question}</p>
                                  <div className="space-y-2">
                                    {question.options.map((option, optionIndex) => {
                                      const optionLetter = String.fromCharCode(65 + optionIndex) // A, B, C, D
                                      const isUserAnswer = userAnswer === optionLetter
                                      const isCorrectAnswer = question.correctAnswer === optionLetter
                                      return (
                                        <div
                                          key={optionIndex}
                                          className={`p-2 rounded border ${
                                            isCorrectAnswer
                                              ? "bg-green-50 border-green-200 text-green-800"
                                              : isUserAnswer && !isCorrectAnswer
                                                ? "bg-red-50 border-red-200 text-red-800"
                                                : "bg-gray-50 border-gray-200"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                                            {isUserAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-600" />}
                                            <span className="text-sm">{option}</span>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                  {!wasAnswered && <p className="text-sm text-gray-500 mt-2">No answer selected</p>}
                                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                      <strong>Explanation:</strong> {question.explanation}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-8 flex justify-center">
                        <Button onClick={resetQuiz} className="px-8">
                          Take New Assessment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
          }
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl">
                <CardHeader className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Brain className="h-16 w-16 text-blue-600" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900">Assessment Complete</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 mb-2">{scoreData.finalScore}</div>
                    <p className="text-xl text-gray-700 mb-4">Blockchain IQ Score</p>
                    <div className="text-sm text-gray-600">
                      {scoreData.finalScore >= 130 && "Exceptional blockchain knowledge"}
                      {scoreData.finalScore >= 115 && scoreData.finalScore < 130 && "Above average understanding"}
                      {scoreData.finalScore >= 100 && scoreData.finalScore < 115 && "Good foundational knowledge"}
                      {scoreData.finalScore >= 85 && scoreData.finalScore < 100 && "Developing understanding"}
                      {scoreData.finalScore < 85 && "Room for improvement - keep learning!"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-900">Score Breakdown:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Score:</span>
                        <span>{scoreData.baseScore} points</span>
                      </div>
                      <div className="flex justify-between text-green-700">
                        <span>Correct Answers ({scoreData.correctAnswers}/10):</span>
                        <span>+{scoreData.correctPoints} points</span>
                      </div>
                      <div className="flex justify-between text-red-700">
                        <span>Incorrect Answers ({scoreData.incorrectAnswers}):</span>
                        <span>-{scoreData.incorrectPenalty} points</span>
                      </div>
                      <div className="flex justify-between text-blue-700">
                        <span>Time Bonus:</span>
                        <span>+{scoreData.timeBonus} points</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Final Score:</span>
                        <span>{scoreData.finalScore} points</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg space-y-2">
                    <h3 className="font-semibold text-gray-900">Performance Summary:</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Accuracy:</span>
                        <span className="ml-2 font-medium">{scoreData.accuracy}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Completion Time:</span>
                        <span className="ml-2 font-medium">{scoreData.completionTime} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => setShowDetailedResults(true)} variant="outline">
                      Review Answers
                    </Button>
                    <Button onClick={resetQuiz}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retake Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })()
      )}

      {/* Main Quiz Interface */}
      {!showPayment && !showResults && quizState.quizStarted && (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header - Compact for mobile */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">BlockIQ Assessment</h1>
              </div>
              <div className={`flex items-center gap-2 text-base sm:text-lg font-mono ${getTimerColor()}`}>
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                {formatTime(quizState.timeRemaining)}
              </div>
            </div>
            {/* Progress - Enhanced for mobile */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Question {quizState.currentQuestion + 1} of 10</span>
                <Badge variant="outline" className="text-xs sm:text-sm">{currentQuestion?.category}</Badge>
              </div>
              <Progress value={progress} className="h-2 sm:h-3" />
            </div>
            {/* Question - Mobile-optimized */}
            <Card className="mb-6 sm:mb-8">
              <CardContent className="p-4 sm:p-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 leading-relaxed">
                  {currentQuestion?.question}
                </h2>
                <div className="space-y-3">
                  {currentQuestion?.options.map((option, index) => {
                    const optionLetter = String.fromCharCode(65 + index) // A, B, C, D
                    const isSelected = selectedAnswer === optionLetter
                    return (
                      <button
                        key={index}
                        onClick={() => selectAnswer(optionLetter)}
                        className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all duration-200 touch-manipulation ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 text-blue-900"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold">
                            {optionLetter}
                          </span>
                          <span className="text-sm sm:text-base">{option}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            {/* Navigation - Mobile-first */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-0 bg-gray-50 pt-4 pb-safe">
              <div className="text-sm text-gray-500 text-center sm:text-left">
                {selectedAnswer ? "Answer selected ✓" : "Select an answer to continue"}
              </div>
              <Button 
                onClick={nextQuestion} 
                disabled={!selectedAnswer} 
                size="lg" 
                className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold touch-manipulation disabled:opacity-50"
              >
                {quizState.currentQuestion === 9 ? "Submit Assessment" : "Next Question"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ClientWeb3Provider>
  )
}