import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatWidgetProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  description?: string;
  progress?: number;
  progressColor?: string;
  className?: string;
}

export function StatWidget({
  title,
  value,
  unit,
  icon,
  description,
  progress,
  progressColor = "bg-primary",
  className
}: StatWidgetProps) {
  return (
    <Card className={cn("shadow-sm border-border/40 overflow-hidden hover:shadow-md transition-shadow duration-200", className)}>
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="p-2 rounded-lg bg-muted/40 text-muted-foreground">
            {icon}
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>
        
        <div className="space-y-2">
          {description && (
            <p className="text-[11px] text-muted-foreground font-medium">
              {description}
            </p>
          )}
          
          {progress !== undefined && (
            <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-500", progressColor)} 
                style={{ width: `${Math.min(100, progress)}%` }} 
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
