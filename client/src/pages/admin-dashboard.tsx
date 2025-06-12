import React from 'react';
import { AdminRoute } from "@/components/admin-route";
import { AdminDashboard } from "@/components/admin-dashboard";

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}