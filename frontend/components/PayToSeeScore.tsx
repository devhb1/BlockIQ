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

// Replace with your actual ETH address
const RECEIVER_ADDRESS = '0xd1c9BD2a14b00C99803B5Ded4571814D227566C7' as `0x${string}`
const PAYMENT_AMOUNT = '0.0001' // ETH

interface PayToSeeScoreProps {
  onPaymentSuccess: () => void
  disabled?: boolean
}

export default function PayToSeeScore({ onPaymentSuccess, disabled = false }: PayToSeeScoreProps) {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

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

  // Handle transaction hash update
  useEffect(() => {
    if (sendData) {
      setTxHash(sendData)
      setPaymentStatus('pending')
    }
  }, [sendData])

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      setPaymentStatus('success')
      setTimeout(() => {
        onPaymentSuccess()
      }, 2000) // Show success message for 2 seconds before revealing score
    }
  }, [isConfirmed, txHash, onPaymentSuccess])

  // Handle errors
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

  const isLoading = paymentStatus === 'pending' || isSendPending || isConfirming
  const isSuccess = paymentStatus === 'success'

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center">
          <Brain className="mr-2 h-6 w-6" />
          Unlock Your IQ Score
        </CardTitle>
        <CardDescription>
          Pay {PAYMENT_AMOUNT} ETH on Base network to see your quiz results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {errorMessage && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

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
