import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, Copy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

function SeoAnalysis() {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);

  const analyze = async () => {
    if (!url) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/agents/seo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResult(data);
      toast.success('SEO analysis complete');
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Textarea
          placeholder="Enter URL to analyze (e.g., https://yoursite.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="min-h-[80px]"
        />
        <Button onClick={analyze} disabled={analyzing} className="self-end">
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
          Analyze
        </Button>
      </div>

      {result && (
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">Score</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-400">{result.seoScore}/100</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">Performance</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>SEO</span><Badge variant="outline">{result.seoScore}/100</Badge></div>
                <div className="flex justify-between text-sm"><span>Performance</span><Badge variant="outline">{result.performance}/100</Badge></div>
                <div className="flex justify-between text-sm"><span>Accessibility</span><Badge variant="outline">{result.accessibility}/100</Badge></div>
                <div className="flex justify-between text-sm"><span>Best Practices</span><Badge variant="outline">{result.bestPractices}/100</Badge></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {result?.suggestions && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Recommendations</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {result.suggestions.map((s: string, i: number) => (
                <li key={i} className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />{s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WriterAgent() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('long');
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const generate = async () => {
    if (!topic) return;
    setGenerating(true);
    setContent('');
    try {
      const res = await fetch('/api/agents/writer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, length }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        full += chunk;
        setContent(full);
      }
      toast.success('Content generated');
      queryClient.invalidateQueries({ queryKey: ['content'] });
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Topic</Label>
          <Textarea
            placeholder="What should the content be about?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <Label>Tone</Label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="academic">Academic</option>
            <option value="persuasive">Persuasive</option>
            <option value="humorous">Humorous</option>
          </select>
          <Label>Length</Label>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="short">Short (100-300 words)</option>
            <option value="medium">Medium (300-600 words)</option>
            <option value="long">Long (600-1000+ words)</option>
          </select>
        </div>
      </div>

      <Button onClick={generate} disabled={generating || !topic} className="w-full">
        {generating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
        Generate Content
      </Button>

      {content && (
        <div className="relative">
          <div className="absolute top-2 right-2 flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(content)}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <Card>
            <CardContent className="p-4 whitespace-pre-wrap text-sm leading-relaxed max-h-[400px] overflow-y-auto">
              {content}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export function GeneratePage() {
  return (
    <div className="space-y-4 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Content Generation</h1>
        <p className="text-muted-foreground">Generate SEO analysis, articles, and more with AI agents</p>
      </div>

      <Tabs defaultValue="seo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
          <TabsTrigger value="writer">Writer</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Analysis</CardTitle>
              <CardDescription>Enter a URL and get a comprehensive SEO audit</CardDescription>
            </CardHeader>
            <CardContent>
              <SeoAnalysis />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="writer">
          <Card>
            <CardHeader>
              <CardTitle>Content Writer</CardTitle>
              <CardDescription>Generate articles, blog posts, and more</CardDescription>
            </CardHeader>
            <CardContent>
              <WriterAgent />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support Agent</CardTitle>
              <CardDescription>Generate FAQ responses and support content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p>Support agent generation coming soon.</p>
                <p className="text-sm">Configure your knowledge base in Agent settings.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
