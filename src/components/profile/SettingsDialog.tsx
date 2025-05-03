
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  handleSignOut: () => void;
}

const SettingsDialog = ({
  isOpen,
  onOpenChange,
  handleSignOut
}: SettingsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="gradient-text">Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">AI Credits</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Dream Analysis</span>
                <span>5/10 used</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-dream-purple h-full w-1/2" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Image Generation</span>
                <span>3/10 used</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-dream-purple h-full w-[30%]" />
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              Upgrade Subscription
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Account</h3>
            <Button 
              variant="destructive" 
              className="w-full flex items-center gap-2"
              onClick={handleSignOut}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
