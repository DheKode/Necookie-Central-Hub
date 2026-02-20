import React from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import AllowanceCard from '../components/dashboard/AllowanceCard';
import BMIWidget from '../components/dashboard/BMIWidget';
import MealTracker from '../components/dashboard/MealTracker';
import SleepTracker from '../components/dashboard/SleepTracker';
import WorkoutCard from '../components/dashboard/WorkoutCard';
import ActivityTimer from '../components/dashboard/ActivityTimer';
import TaskWidget from '../components/dashboard/TaskWidget';
import RecentLogs from '../components/dashboard/RecentLogs';
import AIBlogCard from '../components/dashboard/AIBlogCard';

/**
 * Dashboard Page
 * 
 * This is the main landing page of the application after a user logs in.
 * It acts as a "container" component, meaning it doesn't hold much business logic itself,
 * but rather composes many smaller, specialized components (Widgets/Cards) together.
 * 
 * Layout Strategy:
 * We use CSS Grid (Tailwind's `grid`) to create a responsive dashboard.
 * On mobile, everything stacks in 1 column (`grid-cols-1`).
 * On medium screens, it splits into 2 columns (`md:grid-cols-2`).
 * On large screens, it uses a 4-column layout (`lg:grid-cols-4`).
 */
const Dashboard = () => {
  return (
    <div className="p-4 md:p-8 pb-24 space-y-6 max-w-[1600px] mx-auto">

      <DashboardHeader />

      {/* 2. THE GRID SYSTEM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* --- LEFT SECTION (Spans 3 cols on Desktop) --- */}
        <div className="lg:col-span-3 space-y-6">

          {/* A. AI INSIGHT */}
          <div className="w-full">
            <AIBlogCard />
          </div>

          {/* B. KEY STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
            <div className="md:col-span-2 h-full">
              <AllowanceCard />
            </div>
            <div className="md:col-span-1 h-full">
              <BMIWidget />
            </div>
          </div>

          {/* C. TRACKERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
            <div className="h-full">
              <SleepTracker />
            </div>
            <div className="h-full">
              <ActivityTimer />
            </div>
          </div>

          {/* D. ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
            <div className="h-full">
              <MealTracker />
            </div>
            <div className="h-full">
              <TaskWidget />
            </div>
            <div className="h-full">
              <WorkoutCard />
            </div>
          </div>

        </div>

        {/* --- RIGHT SECTION (Side Feed) --- */}
        <div className="lg:col-span-1 lg:h-full">
          <div className="h-[500px] lg:h-full lg:sticky lg:top-6">
            <RecentLogs />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;