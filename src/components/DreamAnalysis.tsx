
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Book } from "lucide-react";
import { toast } from "sonner";

interface DreamAnalysisProps {
  dreamContent: string;
  existingAnalysis?: string;
  onAnalysisComplete: (analysis: string) => void;
}

// This is a mock function - in a production app, this would call an actual AI service API
const mockAnalyzeDream = async (content: string): Promise<string> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate mock analysis based on keywords in the dream content
  const analysis = [];
  
  if (content.toLowerCase().includes("fall")) {
    analysis.push("Dreams about falling often represent insecurities, anxiety, or feeling out of control in your life.");
  }
  
  if (content.toLowerCase().includes("fly")) {
    analysis.push("Flying dreams typically symbolize freedom, possibility, and overcoming obstacles.");
  }
  
  if (content.toLowerCase().includes("water") || content.toLowerCase().includes("ocean") || content.toLowerCase().includes("swim")) {
    analysis.push("Water in dreams often represents your emotional state or unconscious mind. Calm water may indicate peace, while turbulent water might reflect emotional turmoil.");
  }
  
  if (content.toLowerCase().includes("chase") || content.toLowerCase().includes("running")) {
    analysis.push("Being chased in dreams often symbolizes avoiding a situation or person in waking life.");
  }
  
  if (content.toLowerCase().includes("house") || content.toLowerCase().includes("home")) {
    analysis.push("Houses or homes in dreams typically represent your sense of self, with different rooms reflecting different aspects of your personality or life.");
  }
  
  // Default analysis if no keywords match
  if (analysis.length === 0) {
    analysis.push("Your dream contains personal symbols that may relate to your current life circumstances.");
    analysis.push("Consider how the emotions in this dream mirror feelings you've experienced recently.");
    analysis.push("The characters in your dream may represent aspects of yourself or people who have been on your mind.");
  } else {
    // Add some general analysis
    analysis.push("Remember that dream interpretation is highly personal - your own associations with these symbols may differ from traditional interpretations.");
    analysis.push("Consider journaling about how these dream elements might connect to your waking life.");
  }
  
  return analysis.join("\n\n");
};

const DreamAnalysis = ({
  dreamContent,
  existingAnalysis,
  onAnalysisComplete,
}: DreamAnalysisProps) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | undefined>(existingAnalysis);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await mockAnalyzeDream(dreamContent);
      setAnalysis(result);
      onAnalysisComplete(result);
      toast.success("Dream analysis complete!");
    } catch (error) {
      console.error("Error analyzing dream:", error);
      toast.error("Failed to analyze dream. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium gradient-text flex items-center gap-2">
          <Book size={18} />
          Dream Analysis
        </h3>
        {!analysis && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={loading}
            className="border-dream-lavender text-dream-lavender hover:bg-dream-lavender/10"
          >
            {loading ? "Analyzing..." : "Analyze Dream"}
          </Button>
        )}
      </div>

      <Separator />

      {analysis ? (
        <Card className="bg-dream-purple/5 border-dream-lavender/20">
          <CardContent className="p-4 text-sm">
            {analysis.split("\n\n").map((paragraph, i) => (
              <p key={i} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Click "Analyze Dream" to get AI-powered insights into your dream's potential meanings.
        </p>
      )}
    </div>
  );
};

export default DreamAnalysis;
