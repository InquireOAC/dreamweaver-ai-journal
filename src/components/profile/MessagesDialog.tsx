
import React from "react";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MessagesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: any[];
}

const MessagesDialog = ({
  isOpen,
  onOpenChange,
  conversations
}: MessagesDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">Messages</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((conversation: any) => (
                <div 
                  key={conversation.id} 
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.avatar_url} />
                    <AvatarFallback className="bg-dream-purple/20">
                      {conversation.username ? conversation.username[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {conversation.display_name || conversation.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Tap to view conversation
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {/* Replace with actual time */}
                    Now
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto mb-2 text-muted-foreground h-8 w-8" />
              <h3 className="font-medium mb-1">No messages yet</h3>
              <p className="text-sm text-muted-foreground">
                Connect with other dreamers to start chatting
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagesDialog;
