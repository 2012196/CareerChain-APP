import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command";
import { cn } from "@/lib/utils";
import { FoundEvents } from "@/types/custom";

interface Props {
  foundEventTypes: FoundEvents[];
  setCurEventFilter: React.Dispatch<React.SetStateAction<string>>
}

const LiveEventComboBox = (props: Props) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[250px] justify-between text-sm">
          {value ? props.foundEventTypes.find((eventType) => eventType.value === value)?.label : "Event Type"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0">
        <Command>
          <CommandInput placeholder="Select Event" />
          <CommandEmpty>No events found.</CommandEmpty>
          <CommandGroup>
            {props.foundEventTypes.map((eventType) => (
              <CommandItem
                key={eventType.value}
                value={eventType.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  props.setCurEventFilter(currentValue)
                  setOpen(false);
                }}
              >
                <Check
                  className={cn("mr-2 h-4 w-4 text-black", value === eventType.value ? "opacity-100" : "opacity-0")}
                />
                {eventType.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default LiveEventComboBox;
