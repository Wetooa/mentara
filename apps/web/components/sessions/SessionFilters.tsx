import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Search, Filter, X, RotateCcw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { SessionFilters as SessionFiltersType, UseSessionFiltersReturn } from "@/hooks/sessions/useSessionFilters";

interface SessionFiltersProps {
  filters: SessionFiltersType;
  onFiltersChange: (filters: Partial<SessionFiltersType>) => void;
  onFilterUpdate: <K extends keyof SessionFiltersType>(key: K, value: SessionFiltersType[K]) => void;
  onReset: () => void;
  activeFilterCount: number;
  presetFilters: UseSessionFiltersReturn['presetFilters'];
  showPresets?: boolean;
  compact?: boolean;
}

const presetButtons = [
  { key: 'all', label: 'All', description: 'All sessions' },
  { key: 'today', label: 'Today', description: 'Sessions today' },
  { key: 'thisWeek', label: 'This Week', description: 'Sessions this week' },
  { key: 'upcoming', label: 'Upcoming', description: 'Scheduled sessions' },
  { key: 'completed', label: 'Completed', description: 'Finished sessions' },
  { key: 'cancelled', label: 'Cancelled', description: 'Cancelled sessions' },
];

const statusOptions = [
  { value: 'SCHEDULED', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-green-100 text-green-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'NO_SHOW', label: 'No Show', color: 'bg-orange-100 text-orange-800' },
];

const sortOptions = [
  { value: 'date-desc', label: 'Newest First', sortBy: 'date', sortOrder: 'desc' },
  { value: 'date-asc', label: 'Oldest First', sortBy: 'date', sortOrder: 'asc' },
  { value: 'status-asc', label: 'Status A-Z', sortBy: 'status', sortOrder: 'asc' },
  { value: 'therapist-asc', label: 'Therapist A-Z', sortBy: 'therapist', sortOrder: 'asc' },
];

export function SessionFilters({
  filters,
  onFiltersChange,
  onFilterUpdate,
  onReset,
  activeFilterCount,
  presetFilters,
  showPresets = true,
  compact = false
}: SessionFiltersProps) {
  // Helper function to detect which preset is currently active
  const getActivePreset = (): string | null => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

    // Check if no filters are active (ALL)
    if (!filters.status && !filters.dateFrom && !filters.dateTo && (!filters.search || filters.search === '')) {
      return 'all';
    }

    // Check for today
    if (filters.dateFrom === today && filters.dateTo === today && !filters.status) {
      return 'today';
    }

    // Check for this week
    if (filters.dateFrom === thisWeekStart.toISOString().split('T')[0] && 
        filters.dateTo === thisWeekEnd.toISOString().split('T')[0] && 
        !filters.status) {
      return 'thisWeek';
    }

    // Check for status-based presets
    if (!filters.dateFrom && !filters.dateTo) {
      if (filters.status === 'SCHEDULED') return 'upcoming';
      if (filters.status === 'COMPLETED') return 'completed';
      if (filters.status === 'CANCELLED') return 'cancelled';
    }

    return null;
  };

  const activePreset = getActivePreset();
  const handleDateFromSelect = (date: Date | undefined) => {
    onFilterUpdate('dateFrom', date ? date.toISOString().split('T')[0] : undefined);
  };

  const handleDateToSelect = (date: Date | undefined) => {
    onFilterUpdate('dateTo', date ? date.toISOString().split('T')[0] : undefined);
  };

  const handleSortChange = (value: string) => {
    const option = sortOptions.find(opt => opt.value === value);
    if (option) {
      onFiltersChange({
        sortBy: option.sortBy as SessionFiltersType['sortBy'],
        sortOrder: option.sortOrder as SessionFiltersType['sortOrder'],
      });
    }
  };

  const getCurrentSortValue = () => {
    return sortOptions.find(
      opt => opt.sortBy === filters.sortBy && opt.sortOrder === filters.sortOrder
    )?.value || 'date-desc';
  };

  const clearDateFilters = () => {
    onFiltersChange({
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  if (compact) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search sessions..."
                className="pl-10 pr-4 h-10"
                value={filters.search || ''}
                onChange={(e) => onFilterUpdate('search', e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => onFilterUpdate('status', value === 'all' ? undefined : value as SessionFiltersType['status'])}
            >
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset Button */}
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={onReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset ({activeFilterCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {showPresets && (
        <div className="flex flex-wrap gap-2">
          {presetButtons.map((preset) => {
            const isActive = activePreset === preset.key;
            return (
              <Button
                key={preset.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (preset.key === 'all') {
                    onReset();
                  } else {
                    presetFilters[preset.key as keyof typeof presetFilters]();
                  }
                }}
                className={cn(
                  "h-8 text-sm transition-all",
                  isActive && "bg-primary text-primary-foreground shadow-sm"
                )}
              >
                {preset.label}
              </Button>
            );
          })}
          
          {/* Clear filters button */}
          {activeFilterCount > 0 && activePreset !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Search and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search sessions..."
                className="pl-10 pr-4"
                value={filters.search || ''}
                onChange={(e) => onFilterUpdate('search', e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => onFilterUpdate('status', value === 'all' ? undefined : value as SessionFiltersType['status'])}
            >
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status.color.split(' ')[0]}`} />
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={getCurrentSortValue()}
              onValueChange={handleSortChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date From */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !filters.dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? (
                    format(new Date(filters.dateFrom), "MMM d, yyyy")
                  ) : (
                    "From date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                  onSelect={handleDateFromSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Date To */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !filters.dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo ? (
                    format(new Date(filters.dateTo), "MMM d, yyyy")
                  ) : (
                    "To date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                  onSelect={handleDateToSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters and Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {filters.status && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Badge variant="secondary" className="gap-1">
                      {statusOptions.find(s => s.value === filters.status)?.label}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => onFilterUpdate('status', undefined)}
                      />
                    </Badge>
                  </motion.div>
                )}
                
                {(filters.dateFrom || filters.dateTo) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Badge variant="secondary" className="gap-1">
                      Date Range
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={clearDateFilters}
                      />
                    </Badge>
                  </motion.div>
                )}

                {filters.search && filters.search.trim() && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Badge variant="secondary" className="gap-1">
                      Search: "{filters.search.slice(0, 20)}"
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => onFilterUpdate('search', '')}
                      />
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
              </span>
              {activeFilterCount > 0 && (
                <Button variant="outline" size="sm" onClick={onReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}