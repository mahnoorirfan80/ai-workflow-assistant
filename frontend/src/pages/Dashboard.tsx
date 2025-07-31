import { MessageCircle, FileText, Workflow, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = [
    { name: 'Total Conversations', value: '24', icon: MessageCircle, trend: '+12%' },
    { name: 'Files Processed', value: '18', icon: FileText, trend: '+8%' },
    { name: 'Workflows Created', value: '12', icon: Workflow, trend: '+24%' },
    { name: 'Time Saved', value: '42h', icon: TrendingUp, trend: '+15%' },
  ];

  const quickActions = [
    {
      title: 'Start New Chat',
      description: 'Ask the AI assistant anything',
      icon: MessageCircle,
      href: '/chat',
      color: 'bg-blue-500',
    },
    {
      title: 'Upload Document',
      description: 'Parse and analyze your files',
      icon: FileText,
      href: '/files',
      color: 'bg-green-500',
    },
    {
      title: 'Generate Email',
      description: 'Create emails from bullet points',
      icon: Workflow,
      href: '/email',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient-primary">
          Welcome back!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your AI workflow activities.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card transition-all shadow-elegant">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.trend} from last week</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
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