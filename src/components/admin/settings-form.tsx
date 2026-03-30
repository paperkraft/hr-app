"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Timer, CheckCircle, AlertCircle, Save, Loader2 } from "lucide-react"
import { updateSystemConfig } from "@/app/actions/settings"

interface SettingsFormProps {
  initialData: {
    officeStartTime: string;
    officeEndTime: string;
    graceTimeMinutes: number;
  }
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState(initialData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    const result = await updateSystemConfig(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Timing Configuration Card */}
        <Card className="shadow-sm border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Office Timing
            </CardTitle>
            <CardDescription className="text-sm">Global check-in and check-out schedule.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="officeStartTime" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Shift Start Time
              </Label>
              <Input 
                id="officeStartTime"
                type="time" 
                value={formData.officeStartTime}
                onChange={(e) => setFormData(prev => ({ ...prev, officeStartTime: e.target.value }))}
                className="h-11 bg-muted/20 border-border focus:ring-primary/20"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="officeEndTime" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Shift End Time
              </Label>
              <Input 
                id="officeEndTime"
                type="time" 
                value={formData.officeEndTime}
                onChange={(e) => setFormData(prev => ({ ...prev, officeEndTime: e.target.value }))}
                className="h-11 bg-muted/20 border-border focus:ring-primary/20"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Grace Period Card */}
        <Card className="shadow-sm border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Timer className="w-5 h-5 text-amber-500" />
              Grace Period
            </CardTitle>
            <CardDescription className="text-sm">Tolerance limit for monthly late marks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="graceTime" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Allowed Minutes (After Start)
              </Label>
              <div className="flex items-center gap-3">
                <Input 
                  id="graceTime"
                  type="number" 
                  min="0"
                  max="120"
                  value={formData.graceTimeMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, graceTimeMinutes: parseInt(e.target.value) || 0 }))}
                  className="h-11 bg-muted/20 border-border focus:ring-primary/20 text-center font-bold"
                  required
                />
                <span className="text-sm font-medium text-muted-foreground">minutes</span>
              </div>
              <p className="text-[10px] text-muted-foreground/60 italic mt-2">
                Employees punching in after {formData.officeStartTime} + {formData.graceTimeMinutes}m will be marked as "Late".
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <div className="flex-1">
          {success && (
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <CheckCircle className="w-5 h-5" />
              Configuration updated successfully!
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={loading}
          className="h-12 px-10 gap-2 font-bold shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Configuration
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
