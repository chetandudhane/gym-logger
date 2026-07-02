import { Dumbbell, Calendar, User, Users } from 'lucide-react';

// Shared by BottomNav (mobile) and Sidebar (desktop) so the tab set/order/icons
// can't drift between the two. Kept in its own module (rather than exported
// alongside a component) so Vite's fast-refresh doesn't complain about a
// non-component export living in a component file.
export const NAV_ITEMS = [
  { key: 'log', label: 'Log', icon: Dumbbell },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
  { key: 'me', label: 'Me', icon: User },
  { key: 'community', label: 'Community', icon: Users },
];
