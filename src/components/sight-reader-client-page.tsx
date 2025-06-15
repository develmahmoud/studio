"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { UploadCloud, Volume2, PauseCircle, PlayCircle, FileText, Lightbulb, Bot, AlertTriangle, Settings2, Languages, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import useSpeechSynthesis from '@/hooks/use-speech-synthesis';
import { extractTextFromImageAction, summarizeTextAction, explainTextAction } from '@/lib/actions';
import type { ExtractTextFromImageOutput } from '@/ai/flows/extract-text-from-image';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AboutDev from './about-dev';
import AboutModalTrigger from './about-us';

export default function SightReaderClientPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractTextFromImageOutput | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const [isLoadingExtract, setIsLoadingExtract] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingExplain, setIsLoadingExplain] = useState(false);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { speak, pause, resume, cancel, isSpeaking, isPaused, isSupported, voices } = useSpeechSynthesis({
    onEnd: () => console.log("Speech finished"),
    onError: (e) => toast({ title: "Speech Error", description: e.error || "Could not play audio.", variant: "destructive" }),
  });
  
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

  useEffect(() => {
    if (voices.length > 0 && !selectedVoiceURI) {
      // Find a default English voice or first available
      const defaultVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (defaultVoice) {
        setSelectedVoiceURI(defaultVoice.voiceURI);
      }
    }
  }, [voices, selectedVoiceURI]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({ title: "Image Too Large", description: "Please upload an image smaller than 4MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageDataUri(reader.result as string);
        setExtractedData(null);
        setSummary(null);
        setExplanation(null);
        cancel(); // Stop any ongoing speech
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractText = async () => {
    if (!imageDataUri) {
      toast({ title: "No Image", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    setIsLoadingExtract(true);
    setExtractedData(null); // Clear previous results
    setSummary(null);
    setExplanation(null);
    cancel();

    try {
      const result = await extractTextFromImageAction({ photoDataUri: imageDataUri });
      if ('error' in result) {
        throw new Error(result.error);
      }
      setExtractedData(result);
      toast({ title: "Text Extracted", description: "Content has been processed from the image." });
    } catch (error) {
      console.error("Extraction error:", error);
      toast({ title: "Extraction Failed", description: (error as Error).message || "Could not extract text.", variant: "destructive" });
    } finally {
      setIsLoadingExtract(false);
    }
  };

  const handleSummarizeText = async () => {
    if (!extractedData?.extractedText) {
      toast({ title: "No Text", description: "Extract text from an image first.", variant: "destructive" });
      return;
    }
    setIsLoadingSummary(true);
    setSummary(null);
    cancel();

    try {
      const result = await summarizeTextAction({ text: extractedData.extractedText });
      if ('error' in result) {
        throw new Error(result.error);
      }
      setSummary(result.summary);
      toast({ title: "Text Summarized", description: "A summary has been generated." });
    } catch (error) {
      toast({ title: "Summarization Failed", description: (error as Error).message || "Could not summarize text.", variant: "destructive" });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleExplainText = async () => {
    if (!extractedData?.extractedText) {
      toast({ title: "No Text", description: "Extract text from an image first.", variant: "destructive" });
      return;
    }
    setIsLoadingExplain(true);
    setExplanation(null);
    cancel();

    try {
      const result = await explainTextAction({ text: extractedData.extractedText });
      if ('error' in result) {
        throw new Error(result.error);
      }
      setExplanation(result.explanation);
      toast({ title: "Explanation Generated", description: "A detailed explanation is ready." });
    } catch (error) {
      toast({ title: "Explanation Failed", description: (error as Error).message || "Could not explain text.", variant: "destructive" });
    } finally {
      setIsLoadingExplain(false);
    }
  };
  
  const handlePlayPause = () => {
    if (!extractedData?.extractedText && !summary && !explanation) {
      toast({ title: "No content to read", description: "Upload an image and extract text first.", variant: "destructive" });
      return;
    }

    let textToRead = extractedData?.extractedText || "";
    if (summary) textToRead = summary; // Prioritize summary if available for reading
    if (explanation) textToRead = explanation; // Prioritize explanation if available

    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(textToRead, undefined, speechRate, speechPitch, selectedVoiceURI);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8 items-center max-w-3xl">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center"><UploadCloud className="mr-2 h-6 w-6 text-primary" />Upload Textbook Page</CardTitle>
          <CardDescription>Capture or upload an image of a textbook page to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors bg-muted/20 hover:bg-muted/40"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();}}
            role="button"
            tabIndex={0}
            aria-label="Upload image"
          >
            <Input
              ref={fileInputRef}
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              aria-labelledby="image-upload-label"
            />
            {imagePreview ? (
              <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-md overflow-hidden">
                <Image src={imagePreview} alt="Uploaded textbook page" layout="fill" objectFit="contain" data-ai-hint="textbook page" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                <UploadCloud className="h-12 w-12" />
                <p id="image-upload-label" className="font-medium">Click or drag & drop to upload</p>
                <p className="text-sm">PNG, JPG, GIF up to 4MB</p>
              </div>
            )}
          </div>
          {imagePreview && (
            <Button onClick={handleExtractText} disabled={isLoadingExtract || !imageDataUri} className="w-full" aria-live="polite">
              {isLoadingExtract ? <LoadingSpinner className="mr-2" /> : <FileText className="mr-2 h-5 w-5" />}
              {isLoadingExtract ? 'Extracting Text...' : 'Extract Text from Image'}
            </Button>
          )}
        </CardContent>
      </Card>

      {isLoadingExtract && (
         <Card className="w-full shadow-md">
            <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner />
                    <p className="text-muted-foreground">Processing image, please wait...</p>
                </div>
                <Progress value={50} className="w-full mt-4 animate-pulse-subtle" />
            </CardContent>
        </Card>
      )}

      {extractedData && !isLoadingExtract && (
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Extracted Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="extracted-text" className="text-lg font-semibold mb-1 block">Text</Label>
              <Textarea
                id="extracted-text"
                value={extractedData.extractedText || "No text extracted."}
                readOnly
                className="min-h-[200px] bg-background/50 text-base"
                aria-label="Extracted text from image"
              />
            </div>
            {extractedData.identifiedDrawings && (
              <div>
                <Label htmlFor="identified-drawings" className="text-lg font-semibold mb-1 block">Drawing Descriptions</Label>
                <Textarea
                  id="identified-drawings"
                  value={extractedData.identifiedDrawings}
                  readOnly
                  className="min-h-[100px] bg-background/50 text-base"
                  aria-label="Description of identified drawings"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between items-center">
            {isSupported ? (
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <Button onClick={handlePlayPause} variant="outline" className="flex-grow sm:flex-grow-0" aria-label={isSpeaking && !isPaused ? "Pause reading" : "Play or resume reading"}>
                  {isSpeaking && !isPaused ? <PauseCircle className="mr-2 h-5 w-5" /> : <PlayCircle className="mr-2 h-5 w-5" />}
                  {isSpeaking && !isPaused ? 'Pause' : (isPaused ? 'Resume' : 'Read Aloud')}
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Speech settings">
                      <Settings2 className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="speech-rate">Speed: {speechRate.toFixed(1)}x</Label>
                      <Slider
                        id="speech-rate"
                        min={0.5} max={2} step={0.1}
                        value={[speechRate]}
                        onValueChange={(value) => setSpeechRate(value[0])}
                        aria-label={`Speech rate ${speechRate.toFixed(1)}`}
                      />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="speech-pitch">Pitch: {speechPitch.toFixed(1)}</Label>
                      <Slider
                        id="speech-pitch"
                        min={0.5} max={2} step={0.1}
                        value={[speechPitch]}
                        onValueChange={(value) => setSpeechPitch(value[0])}
                        aria-label={`Speech pitch ${speechPitch.toFixed(1)}`}
                      />
                    </div>
                    {voices.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="speech-voice">Voice</Label>
                         <Select value={selectedVoiceURI || undefined} onValueChange={setSelectedVoiceURI}>
                            <SelectTrigger id="speech-voice" className="w-full" aria-label="Select voice">
                                <SelectValue placeholder="Select voice" />
                            </SelectTrigger>
                            <SelectContent>
                                {voices.map(voice => (
                                    <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                                        {voice.name} ({voice.lang})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center"><AlertTriangle className="mr-2 h-4 w-4 text-destructive" />Text-to-speech not supported on this browser.</p>
            )}
             <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Button onClick={handleSummarizeText} disabled={isLoadingSummary} className="flex-grow sm:flex-grow-0" aria-live="polite">
                {isLoadingSummary ? <LoadingSpinner className="mr-2"/> : <Bot className="mr-2 h-5 w-5" />}
                {isLoadingSummary ? 'Summarizing...' : 'Summarize'}
                </Button>
                <Button onClick={handleExplainText} disabled={isLoadingExplain} className="flex-grow sm:flex-grow-0" aria-live="polite">
                {isLoadingExplain ? <LoadingSpinner className="mr-2"/> : <Lightbulb className="mr-2 h-5 w-5" />}
                {isLoadingExplain ? 'Explaining...' : 'Explain'}
                </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {isLoadingSummary && (
        <Card className="w-full shadow-md">
            <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner />
                    <p className="text-muted-foreground">Generating summary...</p>
                </div>
            </CardContent>
        </Card>
      )}

      {summary && !isLoadingSummary && (
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Bot className="mr-2 h-5 w-5 text-primary" />Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={summary}
              readOnly
              className="min-h-[150px] bg-background/50 text-base"
              aria-label="Generated summary of the text"
            />
          </CardContent>
           <CardFooter>
            <Button onClick={() => speak(summary, undefined, speechRate, speechPitch, selectedVoiceURI)} variant="outline" aria-label="Read summary aloud">
                <PlayCircle className="mr-2 h-5 w-5" /> Read Summary
            </Button>
          </CardFooter>
        </Card>
      )}

      {isLoadingExplain && (
        <Card className="w-full shadow-md">
            <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner />
                    <p className="text-muted-foreground">Generating explanation...</p>
                </div>
            </CardContent>
        </Card>
      )}

      {explanation && !isLoadingExplain && (
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-primary" />Explanation</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={explanation}
              readOnly
              className="min-h-[200px] bg-background/50 text-base"
              aria-label="Generated explanation of the text"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={() => speak(explanation, undefined, speechRate, speechPitch, selectedVoiceURI)} variant="outline" aria-label="Read explanation aloud">
                <PlayCircle className="mr-2 h-5 w-5" /> Read Explanation
            </Button>
          </CardFooter>
        </Card>
      )}
      <div className='flex space-x-2'>
          <AboutDev />
      <AboutModalTrigger />
      </div>
    </div>
  );
}
