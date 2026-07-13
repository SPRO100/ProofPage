'use client'
import { AppError } from '@/components/app-state'
export default function DashboardError({ reset }: { reset: () => void }) { return <AppError reset={reset} dashboard/> }
