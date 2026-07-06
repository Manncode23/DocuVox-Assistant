// client/components/ui/MobileHeader.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface MobileHeaderProps {
  onToggleSidebar: () => void;
}

const MobileHeader = ({ onToggleSidebar }: MobileHeaderProps) => {
  return (
    // The `md:hidden` class makes this component disappear on screens 768px and wider
    <header className="md:hidden flex items-center h-14 px-4 border-b border-border">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      {/* We can add a logo or title here later */}
    </header>
  );
};

export default MobileHeader;