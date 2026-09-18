import { useState, useEffect } from 'react'
import { useOS } from '../../hooks/useOS.js'
import { fileSystemService } from '../../services/fileSystemService.js'

const SYSTEM_BOOT_TIME = Date.now()

export default function SystemStatsWidget() {
  const { windows, activeSpace } = useOS()
  const [uptimeSec, setUptimeSec] = useState(0)
  const [cpuPulse, setCpuPulse] = useState(18)

  useEffect(() => {
    const timer = setInterval(() => {
      const sec = Math.floor((Date.now() - SYSTEM_BOOT_TIME) / 1000)
      setUptimeSec(sec)
      setCpuPulse(Math.floor(12 + Math.random() * 24 + (windows?.length || 0) * 3))
    }, 2000)
    return () => clearInterval(timer)
  }, [windows?.length])

  const stats = fileSystemService.getStorageStats()
  const memUsed = ((windows?.length || 0) * 4.2 + 18.5).toFixed(1)
  const memPercent = Math.min(100, Math.round((parseFloat(memUsed) / 128) * 100))

  const hours = Math.floor(uptimeSec / 3600)
  const mins = Math.floor((uptimeSec % 3600) / 60)
  const secs = uptimeSec % 60
  const uptimeString = `${hours}h ${mins}m ${secs}s`

  return (
    <div className="flex flex-col justify-between h-full space-y-1.5 font-mono text-[10px]">
      {/* CPU Bar */}
      <div className="space-y-0.5">
        <div className="flex justify-between font-bold">
          <span>CPU Usage</span>
          <span>{cpuPulse}%</span>
        </div>
        <div className="w-full h-2 border border-[var(--os-border)] bg-[var(--os-bg)] p-[1px]">
          <div
            className="h-full bg-[var(--os-fg)] transition-all duration-300"
            style={{ width: `${cpuPulse}%` }}
          />
        </div>
      </div>

      {/* Memory RAM Bar */}
      <div className="space-y-0.5">
        <div className="flex justify-between font-bold">
          <span>RAM ({memUsed}MB)</span>
          <span>{memPercent}%</span>
        </div>
        <div className="w-full h-2 border border-[var(--os-border)] bg-[var(--os-bg)] p-[1px]">
          <div
            className="h-full bg-[var(--os-fg)] transition-all duration-300"
            style={{ width: `${memPercent}%` }}
          />
        </div>
      </div>

      {/* VFS Storage Bar */}
      <div className="space-y-0.5">
        <div className="flex justify-between font-bold">
          <span>Storage VFS</span>
          <span>{stats.usedPercent}%</span>
        </div>
        <div className="w-full h-2 border border-[var(--os-border)] bg-[var(--os-bg)] p-[1px]">
          <div
            className="h-full bg-[var(--os-fg)]"
            style={{ width: `${Math.min(100, parseFloat(stats.usedPercent) || 0)}%` }}
          />
        </div>
      </div>

      {/* Footer Info: Windows & Uptime */}
      <div className="border-t border-[var(--os-border)] pt-1 flex justify-between items-center text-[9px] opacity-75">
        <span>Win: {windows?.length || 0} | Space: {activeSpace || 1}</span>
        <span>Up: {uptimeString}</span>
      </div>
    </div>
  )
}
