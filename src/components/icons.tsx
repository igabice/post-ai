import {
  Compass,
  CalendarDays,
  LayoutDashboard,
  User,
  type LucideProps,
} from 'lucide-react';

export const Icons = {
  Logo: (props: LucideProps) => (
    <Compass {...props} />
  ),
  Calendar: CalendarDays,
  Dashboard: LayoutDashboard,
  Profile: User,
};
