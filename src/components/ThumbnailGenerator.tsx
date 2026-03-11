import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Download, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const STYLE_PRESETS = [
  { label: "Cinematic", prompt: "cinematic lighting, dramatic shadows, movie poster style" },
  { label: "Minimalist", prompt: "clean minimal design, simple shapes, modern" },
  { label: "Gaming", prompt: "vibrant neon colors, futuristic, gaming aesthetic" },
  { label: "Vlog", prompt: "bright, warm tones, lifestyle photography, YouTube style" },
  { label: "Tech", prompt: "sleek, dark, tech-inspired, futuristic UI elements" },
  { label: "Retro", prompt: "vintage 80s aesthetic, retro colors, VHS grain" },
];

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  timestamp: Date;
}

export default function ThumbnailGenerator() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  const generateThumbnail = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    const fullPrompt = selectedStyle !== null
      ? `${prompt}, ${STYLE_PRESETS[selectedStyle].prompt}`
      : prompt;

    try {
      const { data, error } = await supabase.functions.invoke("thumb-gen", {
        body: { prompt: fullPrompt },
      });

      if (error) throw new Error(error.message || "Failed to generate");
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error("No image returned");

      const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        prompt: fullPrompt,
        url: data.imageUrl,
        timestamp: new Date(),
      };

      setHistory((prev) => [newImage, ...prev]);
      toast.success("Thumbnail generated!");
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-Powered Thumbnail Generator
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-4">
            <span className="gradient-text">ThumbCraft</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Generate stunning thumbnails from text prompts. Powered by AI.
          </p>
        </motion.div>

        {/* Generator Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Describe your thumbnail
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city skyline at sunset with glowing neon signs..."
              rows={3}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Style Preset
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLE_PRESETS.map((style, i) => (
                <button
                  key={style.label}
                  onClick={() => setSelectedStyle(selectedStyle === i ? null : i)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedStyle === i
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="glow"
            size="lg"
            className="w-full text-base font-semibold h-14 rounded-xl"
            onClick={generateThumbnail}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span className="flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating… (may take 10-30s)
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Thumbnail
              </span>
            )}
          </Button>
        </motion.div>

        {/* Generated Thumbnails */}
        {history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-display font-semibold mb-4 text-foreground">
              Generated Thumbnails
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {history.map((img) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass rounded-xl overflow-hidden group"
                  >
                    <div className="relative">
                      <img src={img.url} alt={img.prompt} className="w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <a href={img.url} target="_blank" rel="noopener noreferrer" download>
                          <Button variant="secondary" size="icon" className="rounded-full">
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="rounded-full"
                          onClick={() => removeFromHistory(img.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground truncate">{img.prompt}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {history.length === 0 && !isGenerating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Your generated thumbnails will appear here</p>
          </motion.div>
        )}

        <div className="text-center mt-16 text-xs text-muted-foreground">
          Final Year Project · AI Thumbnail Generator
        </div>
      </div>
    </div>
  );
}
