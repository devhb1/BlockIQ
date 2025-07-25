'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Brain, Star, RotateCcw, Share, Eye } from 'lucide-react'

interface ScoreDisplayProps {
  score: number
  totalQuestions: number
  timeSpent: number
  onRestart: () => void
  onShowDetailed?: () => void
}

export default function ScoreDisplay({ score, totalQuestions, timeSpent, onRestart, onShowDetailed }: ScoreDisplayProps) {
  const percentage = Math.round((score / totalQuestions) * 100)
  
  const getScoreColor = () => {
    if (percentage >= 90) return 'text-green-500'
    if (percentage >= 75) return 'text-blue-500'
    if (percentage >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreMessage = () => {
    if (percentage >= 90) return 'Outstanding! You\'re a blockchain genius! 🧠'
    if (percentage >= 75) return 'Excellent work! You know your blockchain tech! 💪'
    if (percentage >= 60) return 'Good job! You have solid blockchain knowledge! 👍'
    return 'Keep learning! There\'s always room to grow! 📚'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const shareResults = () => {
    const text = `I just scored ${score}/${totalQuestions} (${percentage}%) on the IQ Quiz Contest! 🧠 Test your blockchain knowledge too!`
    
    if (navigator.share) {
      navigator.share({
        title: 'IQ Quiz Contest Results',
        text: text,
        url: window.location.href,
      })
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(text)
      alert('Results copied to clipboard!')
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
          <CardDescription>
            Thank you for testing your blockchain IQ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor()}`}>
              {score}/{totalQuestions}
            </div>
            <div className={`text-2xl font-semibold ${getScoreColor()}`}>
              {percentage}%
            </div>
            <p className="text-lg text-muted-foreground mt-2">
              {getScoreMessage()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Brain className="h-5 w-5 mr-2 text-blue-500" />
                <span className="font-semibold">Correct Answers</span>
              </div>
              <div className="text-2xl font-bold text-blue-500">{score}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Star className="h-5 w-5 mr-2 text-purple-500" />
                <span className="font-semibold">Time Spent</span>
              </div>
              <div className="text-2xl font-bold text-purple-500">{formatTime(timeSpent)}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onShowDetailed && (
              <Button variant="outline" onClick={onShowDetailed} className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                Review Answers
              </Button>
            )}
            <Button onClick={onRestart} className="flex items-center">
              <RotateCcw className="mr-2 h-4 w-4" />
              Take Quiz Again
            </Button>
            <Button variant="outline" onClick={shareResults} className="flex items-center">
              <Share className="mr-2 h-4 w-4" />
              Share Results
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              🎉 You unlocked your results by paying 0.0001 ETH on Base network
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
