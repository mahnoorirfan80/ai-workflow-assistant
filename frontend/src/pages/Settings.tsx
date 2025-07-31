import { Settings as SettingsIcon, User, Bell, Shield } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-gap-8 lg:grid-cols-2">
        {/* Profile Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </h2>
          </div>
          <div className="card-content space-y-4">
            <div>
              <label htmlFor="name" className="label">Full Name</label>
              <input id="name" placeholder="Enter your name" className="input mt-2" />
            </div>
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <input id="email" type="email" placeholder="Enter your email" className="input mt-2" />
            </div>
            <div>
              <label htmlFor="company" className="label">Company</label>
              <input id="company" placeholder="Enter your company" className="input mt-2" />
            </div>
            <button className="btn btn-primary btn-full">Save Changes</button>
          </div>
        </div>

        {/* API Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              API Configuration
            </h2>
          </div>
          <div className="card-content space-y-4">
            <div>
              <label htmlFor="api-url" className="label">Backend API URL</label>
              <input 
                id="api-url" 
                placeholder="http://localhost:8000" 
                className="input mt-2" 
                defaultValue="http://localhost:8000"
              />
            </div>
            <button className="btn btn-primary btn-full">Update Configuration</button>
          </div>
        </div>
      </div>
    </div>
  );
}