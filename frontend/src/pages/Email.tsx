import { useState, useRef } from 'react';
import { Mail, Sparkles, Copy } from 'lucide-react';
import { sendMessage } from '../services/api';
import { useToast } from '@/hooks/use-toast';

const predefinedTemplates: Record<string, string> = {
  "Sick Leave Request": 
    "Subject: Request for Sick Leave\n\nDear [Manager's Name],\n\nI am feeling unwell and would like to formally request sick leave from [start date] to [end date]. I will make sure to hand over any urgent tasks and remain reachable if something requires my attention. Thank you for your understanding.\n\nSincerely,\n[Your Name]",

  "Resignation Letter": 
    "Subject: Formal Resignation Notice\n\nDear [Manager's Name],\n\nI am writing to formally resign from my position as [Your Job Title] at [Company Name], effective two weeks from today, [last working date]. I am truly grateful for the opportunities to learn and grow during my time here. Please let me know how I can assist during the transition period to ensure a smooth handover.\n\nWith appreciation,\n[Your Name]",

  "Meeting Reminder": 
    "Subject: Reminder: Upcoming Meeting\n\nDear Team,\n\nThis is a kind reminder of our scheduled meeting on [date] at [time] in [location/Zoom link]. The agenda will cover [key topics]. Please come prepared with any updates or questions.\n\nThank you, and I look forward to seeing you all there.\n\nBest regards,\n[Your Name]",

  "Job Application": 
    "Subject: Application for [Job Title] Position\n\nDear [Hiring Manager's Name],\n\nI am writing to express my interest in the [Job Title] position at [Company Name], as advertised on [Job Board/Company Website]. With my background in [your field/skills], I am confident in my ability to contribute effectively to your team. Please find my resume attached for your review. I would be delighted to discuss how my skills align with your requirements.\n\nThank you for your time and consideration.\n\nSincerely,\n[Your Name]\n[Your Contact Information]",

  "Follow-Up After Interview": 
    "Subject: Thank You for the Interview\n\nDear [Interviewer’s Name],\n\nI would like to thank you for the opportunity to interview for the [Job Title] position at [Company Name] on [date]. I greatly enjoyed our conversation and learning more about the role and your team. I am very excited about the possibility of contributing my skills to [Company Name]. Please let me know if you require any additional information from me.\n\nThank you once again for your time and consideration.\n\nBest regards,\n[Your Name]",

  "Request for Recommendation": 
    "Subject: Request for Letter of Recommendation\n\nDear [Professor/Manager’s Name],\n\nI hope this message finds you well. I am applying for [program/job opportunity] and would be truly honored if you could provide me with a letter of recommendation. Your guidance and mentorship have been invaluable, and I believe your perspective on my work would provide strong support to my application. Please let me know if you would be willing to assist me in this regard.\n\nThank you very much for your consideration.\n\nSincerely,\n[Your Name]",

    "Job Offer Rejection": 
    "Subject: Response to Job Offer\n\nDear [Hiring Manager's Name],\n\nThank you very much for offering me the position of [Job Title] at [Company Name]. After careful consideration, I have decided to respectfully decline the offer at this time. This was a difficult decision, as I hold your team and organization in high regard. I am very grateful for the opportunity to interview and learn more about your company, and I hope we may cross paths in the future.\n\nWishing you and your team continued success.\n\nSincerely,\n[Your Name]",

  "Thank You Email (After Interview)": 
    "Subject: Thank You for the Interview\n\nDear [Interviewer's Name],\n\nI would like to sincerely thank you for taking the time to interview me for the [Job Title] position at [Company Name] on [date]. I greatly appreciated the opportunity to learn more about the role and the exciting projects your team is working on. I am very enthusiastic about the possibility of contributing to [specific project or company goal]. Please do not hesitate to reach out if you need any additional information from me.\n\nThank you once again for your time and consideration.\n\nBest regards,\n[Your Name]",

  "Internship Application": 
    "Subject: Application for Internship Opportunity\n\nDear [Hiring Manager's Name],\n\nI am writing to express my interest in the [Internship Position] at [Company Name]. As a [Your Current Role/Student of XYZ Program], I am eager to gain practical experience and contribute to your team’s ongoing projects. My background in [relevant skills or coursework] has equipped me with a solid foundation that I believe aligns with the requirements of the internship. I have attached my resume for your consideration.\n\nThank you very much for your time and consideration. I look forward to the possibility of contributing to your team.\n\nSincerely,\n[Your Name]",

};



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
        description: 'Please enter some points to generate an email.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `Generate a professional email using these points:\n\n${bulletPoints}\n\nPlease create a well-structured, formal email with appropriate greeting, body, and closing.`;
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

      {/* Predefined Quick Templates */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(predefinedTemplates).map((title) => (
          <button
            key={title}
            onClick={() => setGeneratedEmail(predefinedTemplates[title])}
            className="border px-3 py-1 rounded text-sm hover:bg-gray-100"
          >
            {title}
          </button>
        ))}
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
              className="bg-indigo-500 hover:bg-blue-700 text-black font-medium py-2 px-4 rounded transition"
            >
              {isGenerating ? 'Generating…' : (
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
            {isGenerating ? (
              <p className="text-gray-500 italic">Generating your email…</p>
            ) : generatedEmail ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{generatedEmail}</pre>
            ) : (
              <p className="text-gray-500 text-center">
                Your generated email will appear here
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
