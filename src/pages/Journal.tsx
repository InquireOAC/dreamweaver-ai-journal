
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Book, Moon, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useDreamStore } from "@/store/dreamStore";
import DreamCard from "@/components/DreamCard";
import DreamEntryForm from "@/components/DreamEntryForm";
import DreamDetail from "@/components/DreamDetail";
import { DreamEntry } from "@/types/dream";

const Journal = () => {
  const { entries, tags, addEntry, updateEntry } = useDreamStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingDream, setIsAddingDream] = useState(false);
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);

  const handleAddDream = async (dreamData: {
    title: string;
    content: string;
    tags: string[];
    lucid: boolean;
    mood: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      // Add the new dream entry to the store
      addEntry({
        ...dreamData,
        date: new Date().toISOString(),
      });
      setIsAddingDream(false);
    } catch (error) {
      console.error("Error adding dream:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen dream-background p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text flex items-center gap-2">
          <Moon className="animate-float" />
          DreamWeaver
        </h1>
        <p className="text-muted-foreground">
          Record and analyze your dreams with the help of AI
        </p>
      </header>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <Button 
          onClick={() => setIsAddingDream(true)}
          className="bg-gradient-to-r from-dream-lavender to-dream-purple hover:opacity-90 flex items-center gap-2"
        >
          <Pencil size={16} />
          <span>Record Dream</span>
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="all" className="text-sm">
            All Dreams
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-sm">
            Recent Dreams
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <Book size={32} className="mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">Your dream journal is empty</h3>
              <p className="text-muted-foreground">
                Record your first dream to get started
              </p>
              <Button 
                onClick={() => setIsAddingDream(true)}
                variant="outline"
                className="mt-4 border-dream-lavender text-dream-lavender hover:bg-dream-lavender/10"
              >
                Record Dream
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries.map((dream) => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  tags={tags}
                  onClick={() => setSelectedDream(dream)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries
              .slice(0, 6)
              .map((dream) => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  tags={tags}
                  onClick={() => setSelectedDream(dream)}
                />
              ))}
            {entries.length === 0 && (
              <div className="text-center py-12 col-span-3">
                <p className="text-muted-foreground">
                  No recent dreams yet
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Dream Dialog */}
      <Dialog open={isAddingDream} onOpenChange={setIsAddingDream}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="gradient-text">Record New Dream</DialogTitle>
          </DialogHeader>
          <DreamEntryForm
            onSubmit={handleAddDream}
            tags={tags}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Dream Detail Dialog */}
      {selectedDream && (
        <DreamDetail
          dream={selectedDream}
          tags={tags}
          onClose={() => setSelectedDream(null)}
          onUpdate={updateEntry}
        />
      )}
    </div>
  );
};

export default Journal;
