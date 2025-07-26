// ---
// PayToSeeScore Component
// Handles payment gating for quiz results using Web3 (wagmi, RainbowKit, Base L2)
// Explains wallet connection, transaction flow, error handling, and UI logic for onboarding and learning.
// ---
'use client'

import { useState, useEffect } from 'react'
import { useAccount, useDisconnect, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { base } from 'wagmi/chains'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Wallet, CheckCircle, XCircle, Brain } from 'lucide-react'

// Address to receive payment for unlocking results
const RECEIVER_ADDRESS = '0xd1c9BD2a14b00C99803B5Ded4571814D227566C7' as `0x${string}`
// Amount required to unlock results (in ETH)
const PAYMENT_AMOUNT = '0.0001'

interface PayToSeeScoreProps {
  onPaymentSuccess: () => void
  disabled?: boolean
}

export default function PayToSeeScore({ onPaymentSuccess, disabled = false }: PayToSeeScoreProps) {
  const { address, isConnected, chain } = useAccount() // Current wallet/account info
  const { disconnect } = useDisconnect() // Disconnect wallet
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined) // Transaction hash
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle') // Payment state
  const [errorMessage, setErrorMessage] = useState<string>('') // Error message

  // wagmi hooks for sending transaction and waiting for confirmation
  const { 
    sendTransaction, 
    error: sendError, 
    isPending: isSendPending,
    data: sendData 
  } = useSendTransaction()

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError 
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })
  // ---
  // Debug logging for payment flow state
  useEffect(() => {
    console.log('[PayToSeeScore] txHash:', txHash)
    console.log('[PayToSeeScore] isConfirmed:', isConfirmed)
    console.log('[PayToSeeScore] paymentStatus:', paymentStatus)
  }, [txHash, isConfirmed, paymentStatus])

  // ---
  // Effects to handle transaction lifecycle and errors
  // ---

  // When transaction is sent, update hash and status
  useEffect(() => {
    if (sendData) {
      setTxHash(sendData)
      setPaymentStatus('pending')
    }
  }, [sendData])

  // When transaction is confirmed, show success and call parent callback
  useEffect(() => {
    if (isConfirmed && txHash) {
      setPaymentStatus('success')
      setTimeout(() => {
        onPaymentSuccess()
      }, 2000) // Show success message for 2 seconds before revealing score
    }
  }, [isConfirmed, txHash, onPaymentSuccess])

  // Handle errors from sending or confirming transaction
  useEffect(() => {
    if (sendError) {
      setErrorMessage(`Transaction failed: ${sendError.message}`)
      setPaymentStatus('error')
    }
    if (confirmError) {
      setErrorMessage(`Confirmation failed: ${confirmError.message}`)
      setPaymentStatus('error')
    }
  }, [sendError, confirmError])

  // ---
  // Main payment handler: checks wallet, network, sends transaction
  // ---
  const handlePay = async () => {
    if (!isConnected || !address) {
      return // RainbowKit will handle wallet connection
    }

    // Check if we're on the right network (Base)
    if (chain?.id !== base.id) {
      setErrorMessage('Please switch to Base network')
      setPaymentStatus('error')
      return
    }

    try {
      setPaymentStatus('pending')
      setErrorMessage('')
      // Send ETH to receiver address
      await sendTransaction({
        to: RECEIVER_ADDRESS,
        value: parseEther(PAYMENT_AMOUNT),
        chainId: base.id,
      })
    } catch (error) {
      setPaymentStatus('error')
      setErrorMessage('Payment failed. Please try again.')
    }
  }

  // ---
  // Button text and icon logic for user feedback
  // ---
  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet First'
    if (chain?.id !== base.id) return 'Switch to Base Network'
    if (paymentStatus === 'pending' || isSendPending) return 'Processing Payment...'
    if (isConfirming) return 'Confirming Transaction...'
    if (paymentStatus === 'success') return 'Payment Successful!'
    return `Pay ${PAYMENT_AMOUNT} ETH to See Score`
  }

  const getButtonIcon = () => {
    if (paymentStatus === 'pending' || isSendPending || isConfirming) {
      return <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    }
    if (paymentStatus === 'success') {
      return <CheckCircle className="mr-2 h-4 w-4" />
    }
    if (paymentStatus === 'error') {
      return <XCircle className="mr-2 h-4 w-4" />
    }
    return <Wallet className="mr-2 h-4 w-4" />
  }

  // Loading and success state helpers
  const isLoading = paymentStatus === 'pending' || isSendPending || isConfirming
  const isSuccess = paymentStatus === 'success'

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        {/* Title and description for payment gating */}
        <CardTitle className="flex items-center justify-center">
          <Brain className="mr-2 h-6 w-6" />
          Unlock Your IQ Score
        </CardTitle>
        <CardDescription>
          Pay {PAYMENT_AMOUNT} ETH on Base network to see your quiz results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show connected wallet info and network status */}
        {isConnected && (
          <div className="text-sm text-muted-foreground text-center">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            {chain && (
              <div className="text-xs mt-1">
                Network: {chain.name} {chain.id !== base.id && '⚠️ Switch to Base'}
              </div>
            )}
          </div>
        )}

        {/* Wallet connect UI using RainbowKit */}
        {!isConnected ? (
          <div className="space-y-4">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted
                const connected = ready && account && chain

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button
                            onClick={openConnectModal}
                            className="w-full"
                          >
                            <Wallet className="mr-2 h-4 w-4" />
                            Connect Wallet
                          </Button>
                        )
                      }

                      if (chain.unsupported) {
                        return (
                          <Button
                            onClick={openChainModal}
                            variant="destructive"
                            className="w-full"
                          >
                            Wrong network
                          </Button>
                        )
                      }

                      return null
                    })()}
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        ) : (
          // Payment button: triggers ETH transaction
          <Button
            onClick={handlePay}
            disabled={disabled || isLoading || isSuccess}
            className="w-full"
            variant={isSuccess ? "default" : "default"}
          >
            {getButtonIcon()}
            {getButtonText()}
          </Button>
        )}

        {/* Error alert for payment or network issues */}
        {errorMessage && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Show transaction hash and link to BaseScan explorer */}
        {txHash && (
          <div className="text-sm text-center space-y-2">
            <p className="text-muted-foreground">Transaction Hash:</p>
            <a 
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs break-all text-blue-500 hover:text-blue-700"
            >
              {txHash}
            </a>
          </div>
        )}

        {/* Disconnect wallet button for user control */}
        {isConnected && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => disconnect()}
            className="w-full"
          >
            Disconnect Wallet
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
