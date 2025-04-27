import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({ 
  options = [], 
  selected = [], 
  onChange, 
  placeholder = "Selecione...", 
  disabled = false 
}: MultiSelectProps) {
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between min-h-[2.5rem] h-auto py-2"
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 items-center w-full">
            {selected.length > 0 ? (
              selected.map((value) => (
                <Badge
                  key={value}
                  variant="secondary"
                  className="mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(value);
                  }}
                >
                  {value}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="p-2">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full px-3 py-2 border rounded-md mb-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-64 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option}
                className={cn(
                  "flex items-center px-3 py-2 cursor-pointer hover:bg-accent",
                  selected.includes(option) && "bg-accent"
                )}
                onClick={() => {
                  handleSelect(option);
                  setSearch("");
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(option) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 