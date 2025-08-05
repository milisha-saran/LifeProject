import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type LucideProps } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<LucideProps>;
  color: string;
  onClick?: () => void;
}

export function StatsCard({ title, value, description, icon: Icon, color, onClick }: StatsCardProps) {
  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}