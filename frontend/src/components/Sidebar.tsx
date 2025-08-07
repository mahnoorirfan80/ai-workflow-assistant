import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageCircle, 
  FileText, 
  Workflow, 
<<<<<<< HEAD
  Settings,
=======
  // Settings,
>>>>>>> backup-working-code
  Brain
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Files', href: '/files', icon: FileText },
  { name: 'Email', href: '/email', icon: Workflow },
<<<<<<< HEAD
  { name: 'Settings', href: '/settings', icon: Settings },
=======
  // { name: 'Settings', href: '/settings', icon: Settings },
>>>>>>> backup-working-code
];

export default function Sidebar() {
  return (
    <div className="sidebar">
      {/* Logo and App Name */}
      <div className="flex h-16 items-center gap-3 px-6 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold text-foreground">AI Workflow Assistant</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}