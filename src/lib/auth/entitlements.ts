import type { Plan } from '@/types/database'

export interface PlanLimits {
  maxProjects: number
  canUseProThemes: boolean
  canVerifyRevenue: boolean
  canConnectProviders: boolean
}

const LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxProjects: 1,
    canUseProThemes: false,
    canVerifyRevenue: false,
    canConnectProviders: false,
  },
  pro: {
    maxProjects: Infinity,
    canUseProThemes: true,
    canVerifyRevenue: true,
    canConnectProviders: true,
  },
}

export function getLimits(plan: Plan): PlanLimits {
  return LIMITS[plan]
}

export function canAddProject(plan: Plan, currentProjectCount: number): boolean {
  return currentProjectCount < LIMITS[plan].maxProjects
}
