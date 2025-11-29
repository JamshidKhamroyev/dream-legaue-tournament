"use client"

import type { ReactNode } from "react"

interface SettingsTabProps {
  label: string
  isActive: boolean
  onClick: () => void
}

export function SettingsTab({ label, isActive, onClick }: SettingsTabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}

interface SettingsTabsProps {
  children: ReactNode
}

export function SettingsTabs({ children }: SettingsTabsProps) {
  return (
    <div className="border-b border-border">
      <div className="flex gap-1">{children}</div>
    </div>
  )
}
