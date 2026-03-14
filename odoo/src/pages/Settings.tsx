import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Building, Bell, Camera, Save
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'company', label: 'Company Settings', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and application preferences.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow hover:bg-primary/90 transition-base">
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 space-y-2 p-4 rounded-xl border glass">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-base space-x-3",
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-6 rounded-xl border glass"
        >
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium leading-6 mb-1">Personal Information</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use a permanent address where you can receive mail.
                </p>
                
                <div className="mb-6 flex items-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center border text-muted-foreground">
                      <User className="h-10 w-10" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow hover:bg-primary/90 transition-base cursor-pointer">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <button className="px-4 py-2 border rounded-lg hover:bg-secondary font-medium transition-base">
                      Change Avatar
                    </button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-1 block">First Name</label>
                    <input type="text" className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" defaultValue="John" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Last Name</label>
                    <input type="text" className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" defaultValue="Doe" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">Email Address</label>
                    <input type="email" className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" defaultValue="john.doe@example.com" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">Job Role</label>
                    <input type="text" className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base cursor-not-allowed opacity-70" defaultValue="Inventory Manager" disabled />
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <h3 className="text-lg font-medium leading-6 mb-1">Security</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ensure your account is using a long, random password to stay secure.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Current Password</label>
                    <input type="password" className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" placeholder="••••••••" />
                  </div>
                  <div />
                  <div>
                    <label className="text-sm font-medium mb-1 block">New Password</label>
                    <input type="password" className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Confirm Password</label>
                    <input type="password" className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" placeholder="••••••••" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <div>
                  <h3 className="text-lg font-medium leading-6 mb-1">Company Details</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your company information and billing address.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-1 block">Company Name</label>
                      <input type="text" className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" defaultValue="Techtronics Global HQ" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-1 block">Address location</label>
                      <input type="text" className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" defaultValue="145 Silicon Valley Blvd" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">City</label>
                      <input type="text" className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" defaultValue="San Jose" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">State / Province</label>
                      <input type="text" className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" defaultValue="CA" />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'notifications' && (
             <div className="space-y-8 animate-in fade-in duration-300">
               <div>
                  <h3 className="text-lg font-medium leading-6 mb-1">Notification Preferences</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We'll always let you know about important changes, but you pick what else you want to hear about.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-xl glass hover:bg-secondary/30 transition-base cursor-pointer">
                      <div>
                        <p className="font-medium text-foreground">Email Notifications</p>
                        <p className="text-sm text-muted-foreground mt-1 text-balance">Receive a daily digest of all stock movement and low stock alerts.</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-primary">
                        <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-xl glass hover:bg-secondary/30 transition-base cursor-pointer">
                      <div>
                        <p className="font-medium text-foreground">Push Notifications</p>
                        <p className="text-sm text-muted-foreground mt-1 text-balance">Get notified in-browser when a new receipt or delivery requires your attention.</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-secondary">
                        <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-border shadow ring-0 transition duration-200 ease-in-out translate-x-0"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-xl glass hover:bg-secondary/30 transition-base cursor-pointer">
                      <div>
                        <p className="font-medium text-destructive">Low Stock Alerts</p>
                        <p className="text-sm text-muted-foreground mt-1 text-balance">Immediate warning when any high-priority item falls below the minimum stock threshold.</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 bg-destructive">
                        <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"></span>
                      </div>
                    </div>
                  </div>
               </div>
             </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
