'use client';

import { Key } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ApiKeyList } from '@/components/settings/ApiKeyList';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="max-w-[800px] mx-auto px-6 py-8">
          <h1 className="text-[20px] font-semibold text-[#333] mb-6">Settings</h1>

          <div className="space-y-8">
            {/* API Keys Section */}
            <section>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#f2f2f2]">
                <Key className="size-4 text-[#828282]" />
                <h2 className="text-[15px] font-medium text-[#333]">API Keys</h2>
              </div>
              <p className="text-[13px] text-[#828282] mb-4">
                Manage API keys for integrating your applications with Mujarrad.
                Keys provide programmatic access to spaces and nodes.
              </p>
              <ApiKeyList />
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
