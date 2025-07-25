// ---
// ScoreDisplay Component
// Shows quiz results, score, time spent, and provides sharing options (Web Share API, Twitter, Email)
// Comments are provided to help you and junior developers understand the approach and logic.
// ---
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
  // Calculate percentage score
  const percentage = Math.round((score / totalQuestions) * 100)

  // Get color for score based on performance
  const getScoreColor = () => {
    if (percentage >= 90) return 'text-green-500'
    if (percentage >= 75) return 'text-blue-500'
    if (percentage >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  // Get motivational message based on score
  const getScoreMessage = () => {
    if (percentage >= 90) return 'Outstanding! You\'re a blockchain genius! 🧠'
    if (percentage >= 75) return 'Excellent work! You know your blockchain tech! 💪'
    if (percentage >= 60) return 'Good job! You have solid blockchain knowledge! 👍'
    return 'Keep learning! There\'s always room to grow! 📚'
  }

  // Format time spent as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Share results using Web Share API or fallback to clipboard
  const shareResults = () => {
    const text = `I just scored ${score}/${totalQuestions} (${percentage}%) on BlockIQ! 🧠 Test your blockchain knowledge too!`
    const url = window.location.origin
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'BlockIQ Quiz Results',
        text: text,
        url: url,
      }).catch((error) => {
        console.log('Error sharing:', error)
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${text} ${url}`).then(() => {
        alert('Results copied to clipboard! You can paste and share anywhere.')
      }).catch(() => {
        // If clipboard fails, show the text to copy manually
        prompt('Copy this text to share your results:', `${text} ${url}`)
      })
    }
  }

  // Share results to Twitter
  const shareToTwitter = () => {
    const text = `I just scored ${score}/${totalQuestions} (${percentage}%) on BlockIQ! 🧠 Test your blockchain knowledge too!`
    const url = window.location.origin
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  // Share results via Email
  const shareViaEmail = () => {
    const subject = 'Check out my BlockIQ score!'
    const body = `I just scored ${score}/${totalQuestions} (${percentage}%) on BlockIQ! Test your blockchain knowledge too: ${window.location.origin}`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="text-center">
        <CardHeader>
          {/* Trophy icon and completion message */}
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
          <CardDescription>
            Thank you for testing your blockchain IQ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score and percentage display */}
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

          {/* Correct answers and time spent */}
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

          {/* Action buttons: review answers, restart quiz, share results */}
          <div className="flex flex-col gap-4">
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
            </div>
            {/* Share options: Web Share, Twitter, Email */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700">Share your results:</span>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" onClick={shareResults} className="flex items-center text-sm">
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" onClick={shareToTwitter} className="flex items-center text-sm">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Tweet
                </Button>
                <Button variant="outline" onClick={shareViaEmail} className="flex items-center text-sm">
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </Button>
              </div>
            </div>
          </div>

          {/* Payment confirmation message */}
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
