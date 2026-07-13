'use client'
import { AppError } from '@/components/app-state'
export default function ProfileError({ reset }: { reset: () => void }) { return <AppError reset={reset}/> }
