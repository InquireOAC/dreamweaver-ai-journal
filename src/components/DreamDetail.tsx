import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DreamEntry, DreamTag } from "@/types/dream";
import DreamAnalysis from "./DreamAnalysis";
import DreamImageGenerator from "./DreamImageGenerator";
import { Moon, Globe, Trash2, Lock } from "lucide-react";

interface DreamDetailProps {
  dream: DreamEntry;
  tags: DreamTag[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<DreamEntry>) => void;
  onDelete: (id: string) => void;
  isAuthenticated: boolean;
}

const DreamDetail = ({
  dream,
  tags,
  onClose,
  onUpdate,
  onDelete,
  isAuthenticated,
}: DreamDetailProps) => {
  const formattedDate = format(new Date(dream.date), "EEEE, MMMM d, yyyy");
  const formattedTime = format(new Date(dream.date), "h:mm a");
  
  const dreamTags = dream.tags
    .map((tagId) => tags.find((t) => t.id === tagId))
    .filter(Boolean) as DreamTag[];
  
  const [isPublic, setIsPublic] = useState(dream.is_public || false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleAnalysisComplete = (analysis: string) => {
    onUpdate(dream.id, { analysis });
  };

  const handleImageGenerated = (imageUrl: string, prompt: string) => {
    onUpdate(dream.id, {
      generatedImage: imageUrl,
      imagePrompt: prompt,
    });
  };
  
  const handleShareToggle = (checked: boolean) => {
    if (!isAuthenticated) {
      // Show authentication message
      return;
    }
    
    setIsPublic(checked);
    onUpdate(dream.id, { is_public: checked });
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-text">
            {dream.title}
          </DialogTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Moon size={14} className="mr-1" /> {formattedDate} at {formattedTime}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-1 mb-3">
              {dreamTags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{ backgroundColor: tag.color + "40", color: tag.color }}
                  className="text-xs font-normal border"
                >
                  {tag.name}
                </Badge>
              ))}
              {dream.lucid && (
                <Badge
                  variant="secondary"
                  className="text-xs font-normal bg-dream-lavender/20 text-dream-lavender"
                >
                  Lucid
                </Badge>
              )}
              {dream.mood && (
                <Badge
                  variant="outline"
                  className="text-xs font-normal"
                >
                  Mood: {dream.mood}
                </Badge>
              )}
            </div>

            <p className="whitespace-pre-wrap">
              {dream.content}
            </p>
          </div>
          
          {isAuthenticated && (
            <>
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="share-dream"
                    checked={isPublic}
                    onCheckedChange={handleShareToggle}
                  />
                  <Label htmlFor="share-dream" className="flex gap-1 items-center">
                    {isPublic ? (
                      <>
                        <Globe size={16} className="text-dream-purple" />
                        <span>Shared to Lucid Repo</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Private</span>
                      </>
                    )}
                  </Label>
                </div>
                
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive border-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
              </div>
            </>
          )}
          
          <Separator />
          
          <DreamAnalysis
            dreamContent={dream.content}
            existingAnalysis={dream.analysis}
            onAnalysisComplete={handleAnalysisComplete}
          />
          
          <Separator />
          
          <DreamImageGenerator
            dreamContent={dream.content}
            existingPrompt={dream.imagePrompt}
            existingImage={dream.generatedImage}
            onImageGenerated={handleImageGenerated}
          />
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this dream from your journal.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete(dream.id);
                setDeleteDialogOpen(false);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default DreamDetail;
