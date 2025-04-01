import { SearchIcon } from "lucide-react";
import React from "react";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { Input } from "../../../../components/ui/input";

export const HeaderSection = (): JSX.Element => {
  return (
    <div className="flex w-full items-start bg-gray-5 rounded-lg overflow-hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-[132px] items-center gap-[11px] p-4 bg-white rounded-none h-auto"
          >
            <span className="font-medium text-grey-50 [font-family:'Kumbh_Sans',Helvetica] text-sm">
              Add filter
            </span>
            <img
              className="w-[8.49px] h-[5.66px]"
              alt="Vector"
              src="/vector-3.svg"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Filter option 1</DropdownMenuItem>
          <DropdownMenuItem>Filter option 2</DropdownMenuItem>
          <DropdownMenuItem>Filter option 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-4 pl-4 pr-5 py-4 flex-1 bg-[#fbf9f9]">
        <SearchIcon className="w-4 h-4 text-grey-200" />
        <Input
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 [font-family:'Kumbh_Sans',Helvetica] font-medium text-grey-200 text-sm"
          placeholder="SearchIcon for a teachers by name or email"
        />
      </div>
    </div>
  );
};
