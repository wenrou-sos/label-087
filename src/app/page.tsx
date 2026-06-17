'use client'

import AppLayout from '@/components/layout/AppLayout'
import StatsCards from '@/components/dashboard/StatsCards'
import IncidentList from '@/components/dashboard/IncidentList'
import ResourceOverview from '@/components/dashboard/ResourceOverview'

export default function DashboardPage() {
  return (
    <AppLayout title="指挥总览">
      <div className="space-y-6">
        <StatsCards />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <IncidentList />
          </div>
          <div>
            <ResourceOverview />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
