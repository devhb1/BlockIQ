"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Brain,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  Trophy,
} from "lucide-react";
import PayToSeeScore from "@/components/PayToSeeScore";
import ScoreDisplay from "@/components/ScoreDisplay";
import { ClientWeb3Provider } from "@/components/ClientWeb3Provider";
import { questionPool, Question } from "../components/Quiz/quiz-questions";

/* ------------------------------------------------------------------
   Backup sdk.actions.ready() call in case FarcasterReady fails
-------------------------------------------------------------------*/

interface QuizState {
  currentQuestion: number;
  selectedAnswers: Record<number, string>;
  timeRemaining: number;
  quizStarted: boolean;
  quizCompleted: boolean;
  selectedQuestions: Question[];
  startTime: number;
}

export default function HomePage() {
  /* ------------------------- state ------------------------------ */
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    selectedAnswers: {},
    timeRemaining: 600,      // 10 min
    quizStarted: false,
    quizCompleted: false,
    selectedQuestions: [],
    startTime: 0,
  });

  const [showResults, setShowResults] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  /* ------------------------- Backup Farcaster ready call ------------------------------ */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Backup call to ensure sdk.actions.ready() is called
    const backupReadyCall = async () => {
      try {
        // Wait a bit longer than FarcasterReady to ensure it's a backup
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log("🔄 Backup: Calling Farcaster ready()...");
        
        // Use direct import like FarcasterReady
        const { sdk } = await import("@farcaster/miniapp-sdk");
        await sdk.actions.ready();
        console.log("✅ Backup: Farcaster ready() called successfully");
      } catch (err) {
        console.error("❌ Backup: Farcaster ready() failed:", err);
      }
    };

    backupReadyCall();
  }, []);

  /* ------------------------- timer ------------------------------ */
  useEffect(() => {
    if (quizState.quizStarted && !quizState.quizCompleted && quizState.timeRemaining > 0) {
      const timer = setInterval(() => {
        setQuizState((prev) => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1_000);
      return () => clearInterval(timer);
    }
    if (quizState.timeRemaining === 0 && !quizState.quizCompleted) handleSubmitQuiz();
  }, [quizState.quizStarted, quizState.quizCompleted, quizState.timeRemaining]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ------------------------- Farcaster share ------------------- */
  const handleFarcasterShare = (score: number, total: number) => {
    if (typeof window === "undefined") return;

    const shareText = `🧠 I scored ${score}/${total} on BlockIQ – the Blockchain IQ Quiz!\n\nTest your knowledge: `;
    const url = window.location.href;

    // Prefer Farcaster-native share when embedded
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: "sdk.actions.share", data: { text: shareText, url } },
        "*",
      );
    } else if (navigator.share) {
      navigator.share({ title: "BlockIQ Quiz Results", text: shareText, url });
    } else {
      navigator.clipboard.writeText(shareText + url);
      alert("Results copied to clipboard!");
    }
  };

  /* ------------------------- utilities ------------------------- */
  const isMobileView = () =>
    typeof window !== "undefined" &&
    (window.innerWidth <= 768 || window.navigator.userAgent.includes("Farcaster"));

  const getTimerColor = () => {
    if (quizState.timeRemaining <= 30) return "text-red-600";
    if (quizState.timeRemaining <= 120) return "text-orange-600";
    return "text-gray-600";
  };

  const selectRandomQuestions = useCallback(() => {
    const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, []);

  /* ------------------------- quiz flow ------------------------- */
  const startQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      selectedAnswers: {},
      timeRemaining: 600,
      quizStarted: true,
      quizCompleted: false,
      selectedQuestions: selectRandomQuestions(),
      startTime: Date.now(),
    });
  };

  const selectAnswer = (answer: string) =>
    setQuizState((prev) => ({
      ...prev,
      selectedAnswers: { ...prev.selectedAnswers, [prev.currentQuestion]: answer },
    }));

  const nextQuestion = () => {
    if (quizState.currentQuestion < quizState.selectedQuestions.length - 1) {
      setQuizState((prev) => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    } else {
      handleSubmitQuiz();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    let incorrect = 0;

    quizState.selectedQuestions.forEach((q, i) => {
      const a = quizState.selectedAnswers[i];
      if (a === q.correctAnswer) correct += 1;
      else if (a) incorrect += 1;
    });

    const base = 100;
    const correctPts = correct * 10;
    const incorrectPen = incorrect * 5;

    const mins = (Date.now() - quizState.startTime) / 1_000 / 60;
    const timeBonus = mins < 5 ? 20 : mins < 7 ? 10 : mins < 10 ? 5 : 0;

    const final = Math.max(50, Math.min(150, base + correctPts - incorrectPen + timeBonus));

    return {
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unanswered: 10 - correct - incorrect,
      baseScore: base,
      correctPoints: correctPts,
      incorrectPenalty: incorrectPen,
      timeBonus,
      finalScore: final,
      completionTime: Math.round(mins * 10) / 10,
      accuracy: Math.round((correct / 10) * 100),
    };
  };

  const handleSubmitQuiz = () => {
    setQuizState((prev) => ({ ...prev, quizCompleted: true }));
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
    setShowPayment(false);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      selectedAnswers: {},
      timeRemaining: 600,
      quizStarted: false,
      quizCompleted: false,
      selectedQuestions: [],
      startTime: 0,
    });
    setShowResults(false);
    setShowDetailedResults(false);
    setPaymentCompleted(false);
    setShowPayment(false);
  };

  const currentQuestion = quizState.selectedQuestions[quizState.currentQuestion];
  const selectedAnswer = quizState.selectedAnswers[quizState.currentQuestion];
  const progress = ((quizState.currentQuestion + 1) / 10) * 100;

  /* ------------------------- render ---------------------------- */
  return (
    <ClientWeb3Provider>
      {/* ---------- Welcome Screen ---------- */}
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
                <CardTitle className="text-2xl sm:text-4xl font-extrabold text-blue-700 tracking-tight">
                  BlockIQ
                </CardTitle>
                <CardDescription className="text-sm sm:text-lg text-gray-700 max-w-lg mx-auto px-2">
                  <span className="block font-semibold text-blue-600 mb-2">
                    Blockchain IQ Quiz
                  </span>
                  Test your knowledge of blockchain, Base, EVM, and crypto concepts.
                  <br />
                  Challenge yourself, pay to see your score, and share your results!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6">
                <div className="bg-blue-50/80 p-4 sm:p-6 rounded-xl space-y-3 sm:space-y-4 border border-blue-100">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                    How it works:
                  </h3>
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

      {/* ---------- Payment Screen ---------- */}
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
                    🎯 <strong>What you'll get:</strong>
                    <br />• Your detailed IQ score breakdown
                    <br />• Time bonus calculations
                    <br />• Review of all questions & answers
                    <br />• Shareable results for Farcaster
                  </p>
                </div>
                <PayToSeeScore onPaymentSuccess={handlePaymentSuccess} disabled={false} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ---------- Results Screen ---------- */}
      {showResults &&
        (() => {
          const s = calculateScore();
          if (paymentCompleted && !showDetailedResults) {
            return (
              <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <ScoreDisplay
                  score={s.correctAnswers}
                  totalQuestions={10}
                  timeSpent={Math.floor((Date.now() - quizState.startTime) / 1_000)}
                  onRestart={resetQuiz}
                  onShowDetailed={() => setShowDetailedResults(true)}
                  onShare={() => handleFarcasterShare(s.correctAnswers, 10)}
                />
              </div>
            );
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
                        {quizState.selectedQuestions.map((q, i) => {
                          const u = quizState.selectedAnswers[i];
                          const correct = u === q.correctAnswer;
                          const answered = u !== undefined;

                          return (
                            <div key={q.id} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-start gap-3">
                                <Badge variant={correct ? "default" : answered ? "destructive" : "secondary"}>
                                  Q{i + 1}
                                </Badge>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 mb-3">{q.question}</p>
                                  <div className="space-y-2">
                                    {q.options.map((opt, j) => {
                                      const letter = String.fromCharCode(65 + j); // A/B/C/D
                                      const isUser = u === letter;
                                      const isCorrect = q.correctAnswer === letter;
                                      return (
                                        <div
                                          key={j}
                                          className={`p-2 rounded border ${
                                            isCorrect
                                              ? "bg-green-50 border-green-200 text-green-800"
                                              : isUser && !isCorrect
                                              ? "bg-red-50 border-red-200 text-red-800"
                                              : "bg-gray-50 border-gray-200"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            {isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                                            {isUser && !isCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                                            <span className="text-sm">{opt}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {!answered && (
                                    <p className="text-sm text-gray-500 mt-2">No answer selected</p>
                                  )}
                                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                      <strong>Explanation:</strong> {q.explanation}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
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
            );
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
                    <div className="text-5xl font-bold text-blue-600 mb-2">{s.finalScore}</div>
                    <p className="text-xl text-gray-700 mb-4">Blockchain IQ Score</p>
                    <div className="text-sm text-gray-600">
                      {s.finalScore >= 130 && "Exceptional blockchain knowledge"}
                      {s.finalScore >= 115 && s.finalScore < 130 && "Above-average understanding"}
                      {s.finalScore >= 100 && s.finalScore < 115 && "Good foundational knowledge"}
                      {s.finalScore >= 85 && s.finalScore < 100 && "Developing understanding"}
                      {s.finalScore < 85 && "Room for improvement – keep learning!"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-900">Score Breakdown:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Score:</span>
                        <span>{s.baseScore} points</span>
                      </div>
                      <div className="flex justify-between text-green-700">
                        <span>Correct Answers ({s.correctAnswers}/10):</span>
                        <span>+{s.correctPoints} points</span>
                      </div>
                      <div className="flex justify-between text-red-700">
                        <span>Incorrect Answers ({s.incorrectAnswers}):</span>
                        <span>-{s.incorrectPenalty} points</span>
                      </div>
                      <div className="flex justify-between text-blue-700">
                        <span>Time Bonus:</span>
                        <span>+{s.timeBonus} points</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Final Score:</span>
                        <span>{s.finalScore} points</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg space-y-2">
                    <h3 className="font-semibold text-gray-900">Performance Summary:</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Accuracy:</span>
                        <span className="ml-2 font-medium">{s.accuracy}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Completion Time:</span>
                        <span className="ml-2 font-medium">{s.completionTime} min</span>
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
          );
        })()}

      {/* ---------- Main Quiz Interface ---------- */}
      {!showPayment && !showResults && quizState.quizStarted && (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
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
            {/* Progress */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Question {quizState.currentQuestion + 1} of 10
                </span>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {currentQuestion?.category}
                </Badge>
              </div>
              <Progress value={progress} className="h-2 sm:h-3" />
            </div>
            {/* Question */}
            <Card className="mb-6 sm:mb-8">
              <CardContent className="p-4 sm:p-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 leading-relaxed">
                  {currentQuestion?.question}
                </h2>
                <div className="space-y-3">
                  {currentQuestion?.options.map((opt, j) => {
                    const letter = String.fromCharCode(65 + j);
                    const selected = selectedAnswer === letter;
                    return (
                      <button
                        key={j}
                        onClick={() => selectAnswer(letter)}
                        className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all duration-200 touch-manipulation ${
                          selected
                            ? "border-blue-500 bg-blue-50 text-blue-900"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold">
                            {letter}
                          </span>
                          <span className="text-sm sm:text-base">{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            {/* Navigation */}
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
  );
}
