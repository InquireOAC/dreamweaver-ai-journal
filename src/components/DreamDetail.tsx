
import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DreamEntry, DreamTag } from "@/types/dream";
import DreamAnalysis from "./DreamAnalysis";
import DreamImageGenerator from "./DreamImageGenerator";
import { Moon } from "lucide-react";

interface DreamDetailProps {
  dream: DreamEntry;
  tags: DreamTag[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<DreamEntry>) => void;
}

const DreamDetail = ({
  dream,
  tags,
  onClose,
  onUpdate,
}: DreamDetailProps) => {
  const formattedDate = format(new Date(dream.date), "EEEE, MMMM d, yyyy");
  const formattedTime = format(new Date(dream.date), "h:mm a");
  
  const dreamTags = dream.tags
    .map((tagId) => tags.find((t) => t.id === tagId))
    .filter(Boolean) as DreamTag[];

  const handleAnalysisComplete = (analysis: string) => {
    onUpdate(dream.id, { analysis });
  };

  const handleImageGenerated = (imageUrl: string, prompt: string) => {
    onUpdate(dream.id, {
      generatedImage: imageUrl,
      imagePrompt: prompt,
    });
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
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DreamDetail;
