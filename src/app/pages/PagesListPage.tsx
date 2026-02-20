import React from 'react';
import { useNavigate } from 'react-router';
import Dashboard from './Dashboard';

// PagesListPage is same as Dashboard - redirect
export default function PagesListPage() {
  return <Dashboard />;
}
