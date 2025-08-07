import { useState, useRef } from 'react';
import { Mail, Sparkles, Copy } from 'lucide-react';
import { sendMessage } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function Email() {
  const [bulletPoints, setBulletPoints] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();


  const sessionId = useRef<string>(Math.floor(Math.random() * 100000).toString());

  const handleGenerateEmail = async () => {
    if (!bulletPoints.trim()) {
      toast({
        title: 'No content provided',
        description: 'Please enter some bullet points to generate an email.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `Generate a professional email using these bullet points:\n\n${bulletPoints}\n\nPlease create a well-structured, formal email with appropriate greeting, body, and closing.`;

     
      const response = await sendMessage(prompt, sessionId.current);
      setGeneratedEmail(response.output);

      toast({
        title: 'Email generated successfully',
        description: 'Your professional email has been created.',
      });
    } catch (error) {
      console.error('Error generating email:', error);
      toast({
        title: 'Generation failed',
        description: 'Failed to generate email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      toast({
        title: 'Copied to clipboard',
        description: 'The email has been copied to your clipboard.',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Copy failed',
        description: 'Failed to copy email to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold">Email Generator</h1>
        <p className="text-muted-foreground mt-2">
          Transform your bullet points into professional, well-structured emails.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <div className="card p-4 border rounded-lg shadow">
          <div className="mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Input
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="bullet-points" className="block font-medium mb-1">Bullet Points</label>
              <textarea
                id="bullet-points"
                placeholder="• Meeting scheduled for next week\n• Need to review quarterly reports\n• Budget approval required"
                value={bulletPoints}
                onChange={(e) => setBulletPoints(e.target.value)}
                rows={8}
                className="w-full border rounded p-2"
              />
            </div>

            <button
              onClick={handleGenerateEmail}
              disabled={isGenerating || !bulletPoints.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
            >
              {isGenerating ? 'Generating...' : (
                <>
                  <Sparkles className="inline h-4 w-4 mr-2" />
                  Generate Email
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="card p-4 border rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Generated Email
            </h2>
            {generatedEmail && (
              <button
                onClick={handleCopyEmail}
                className="border px-3 py-1 rounded hover:bg-gray-100 transition"
              >
                <Copy className="inline h-4 w-4 mr-1" />
                Copy
              </button>
            )}
          </div>
          <div className="min-h-96 bg-gray-50 p-4 rounded overflow-auto">
            {generatedEmail ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{generatedEmail}</pre>
            ) : (
              <p className="text-gray-500 text-center">
                Your generated email will appear here
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-lg mt-8 bg-gray-50">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Tips for Better Results
        </h3>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Be specific and clear in your bullet points</li>
          <li>Include the purpose or context of the email</li>
          <li>Mention any deadlines or important dates</li>
          <li>Specify the tone you want (formal, casual, etc.)</li>
          <li>Include recipient information if relevant</li>
        </ul>
      </div>
    </div>
  );
}
