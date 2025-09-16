import {
  Compass,
  CalendarDays,
  LayoutDashboard,
  User,
  ClipboardList,
  type LucideProps,
} from 'lucide-react';

export const Icons = {
  Logo: (props: LucideProps) => (
    <Compass {...props} />
  ),
  Calendar: CalendarDays,
  Dashboard: LayoutDashboard,
  Profile: User,
  ContentPlans: ClipboardList,
};
