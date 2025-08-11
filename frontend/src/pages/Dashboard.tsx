import { MessageCircle, FileText, Workflow, TrendingUp, MessageSquare, MessageCircleCodeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const tips = [
  " Upload your resume and get a summary in seconds. Use metrics like 'Increased sales by 20%' for extra impact.",
  " Tailor your resume to each job title. One-size-fits-all resumes rarely work.",
  " Use data to prove your impact — numbers grab recruiters' attention instantly.",
  "Avoid listing responsibilities. Focus on achievements using action verbs like 'Spearheaded' or 'Optimized'.",
  "Save your summarized resume directly to Google Docs for quick editing and sharing.",
  " Use bullet points — they help hiring managers scan your resume faster.",
  " Don’t forget to add a custom email when sending — generic messages are ignored.",
  " Focus the top third of your resume on your biggest wins — that’s what recruiters see first.",
  " Always include relevant certifications or awards, even if small — they show credibility.",
  " Keep it under 2 pages — hiring managers spend only 6-7 seconds on the first scan.",
  " Use keywords from the job description — many resumes are filtered by bots first.",
  " Save your favorite jobs and resumes in Google Drive to stay organized.",
  " Use LLMs to improve phrasing or fix grammar before sending applications.",
  " Consider adding a link to your personal portfolio, GitHub, or a short video intro.",
  " Want to stand out? Add a short summary at the top of your resume that highlights your value.",
  " Use tools like Canva or Notion to design clean, modern resumes.",
  " Save copies of each application you submit so you can follow up properly.",
  "You can Ask ChatGPT to generate a personalized cover letter with your resume content.",
  " Set reminders in your calendar to follow up after submitting applications.",
  " Regularly refresh your resume even if you’re not actively applying — you never know when opportunity knocks.",
]


const randomTip = tips[Math.floor(Math.random() * tips.length)];

export default function Dashboard() {
  // const stats = [
  //   { name: 'Total Conversations', value: '24', icon: MessageCircle, trend: '+12%' },
  //   { name: 'Files Processed', value: '18', icon: FileText, trend: '+8%' },
  //   { name: 'Workflows Created', value: '12', icon: Workflow, trend: '+24%' },
  //   { name: 'Time Saved', value: '42h', icon: TrendingUp, trend: '+15%' },
  // ];
  

  const quickActions = [
    {
      title: 'New Chat',
      description: 'Ask the AI assistant anything',
      icon: MessageCircle,
      href: '/chat',
      color: 'bg-blue-50',
    },
    {
      title: 'Resume summarizer',
      description: 'Parse and summarise your resume into google docs',
      icon: FileText,
      href: '/files',
      color: 'bg-green-5',
    },
    {
      title: 'Generate Email',
      description: 'Create emails from bullet points',
      icon: Workflow,
      href: '/email',
      color: 'bg-maroon-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
        <span className="text-black">Welcome to </span>
        <span className="text-gradient-primary">AI Workflow Assistant!</span>
        </h1>

        <p className="text-muted-foreground mt-2">
          Here's an overview of your AI workflow activities.
        </p>
      </div>

     
<div className="card shadow-elegant">
  <div className="card-content p-6">
    <h2 className="text-xl font-semibold mb-4 text-purple-700">✨ Helpful Resources</h2>
    <ul className="space-y-3 text-sm">
      <li>
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-purple-600 !no-underline hover:text-purple-800 transition-colors"
        >
          Gmail – Compose and send emails
        </a>
      </li>
      <li>
        <a
          href="https://www.linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-purple-600 !no-underline hover:text-purple-800 transition-colors"
        >
          LinkedIn – View candidate profiles
        </a>
      </li>
      <li>
        <a
          href="https://chat.openai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-purple-600 !no-underline hover:text-purple-800 transition-colors"
        >
          ChatGPT – Access instant AI assistance
        </a>
      </li>
      <li>
        <a
          href="https://docs.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-purple-600 !no-underline hover:text-purple-800 transition-colors"
        >
          Google Docs – Store and organize your notes
        </a>
      </li>
    </ul>
  </div>
</div>

 <div className="card shadow-elegant bg-gradient-to-r from-indigo-100 to-indigo-200">
        <div className="card-content p-6">
          <h2 className="text-xl font-semibold mb-2">💡 Tip of the Day</h2>
          <p className="text-sm text-gray-800">{randomTip}</p>
        </div>
      </div>


      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <div key={action.title} className="card transition-all shadow-elegant group">
              <div className="card-content p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-12 w-12 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                <Link to={action.href} className="btn btn-primary btn-full transition-all">
                  Get Started
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
      
}