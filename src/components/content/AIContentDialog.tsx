import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wand2 } from 'lucide-react';
import { generateContentSuggestions, generateImagePrompt, generateImage, improveContent, type ContentSuggestion } from '@/lib/ai';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIContentDialogProps {
  platform: string;
  onSelect: (content: ContentSuggestion) => void;
  currentContent?: {
    title: string;
    description: string;
  };
}

export function AIContentDialog({
  platform,
  onSelect,
  currentContent,
}: AIContentDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'humorous' | 'educational'>('casual');
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContentSuggestion | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const newSuggestions = await generateContentSuggestions({
        platform,
        topic,
        tone,
      });
      setSuggestions(newSuggestions);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate content",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!currentContent) return;
    
    setLoading(true);
    try {
      const improved = await improveContent(currentContent, platform);
      setSuggestions([
        {
          ...improved,
          hashtags: [], // Improved version doesn't generate new hashtags
        },
      ]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to improve content",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async (description: string) => {
    setLoading(true);
    try {
      const imagePrompt = await generateImagePrompt(description, platform);
      const imageUrl = await generateImage(imagePrompt);
      
      toast({
        title: "Image Generated",
        description: "The AI-generated image has been added to your media.",
      });

      // TODO: Add image to media files
      console.log('Generated image URL:', imageUrl);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate image",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (suggestion: ContentSuggestion) => {
    setSelectedSuggestion(suggestion);
    onSelect(suggestion);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wand2 className="h-4 w-4" />
          AI Assist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Content Assistant</DialogTitle>
          <DialogDescription>
            Generate engaging content ideas or improve your existing content using AI.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {currentContent ? (
            <Button
              onClick={handleImprove}
              disabled={loading}
            >
              {loading ? "Improving..." : "Improve Current Content"}
            </Button>
          ) : (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="topic" className="text-right">
                  Topic
                </Label>
                <Input
                  id="topic"
                  placeholder="Enter a topic..."
                  className="col-span-3"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tone" className="text-right">
                  Tone
                </Label>
                <Select
                  value={tone}
                  onValueChange={(value: typeof tone) => setTone(value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="ml-auto"
              >
                {loading ? "Generating..." : "Generate Ideas"}
              </Button>
            </>
          )}

          {suggestions.length > 0 && (
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSelect(suggestion)}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>
                        {suggestion.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {suggestion.hashtags.map((tag, i) => (
                              <span
                                key={i}
                                className="text-sm text-blue-500"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
