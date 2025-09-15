import { getTrendingTopics } from '@/components/calendar/actions';
import { CalendarClientPage } from '@/components/calendar/calendar-client-page';
import { user } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const trendingTopicData = await getTrendingTopics({
    topicPreferences: user.topicPreferences,
    postFrequency: user.postFrequency,
  });

  return <CalendarClientPage trendingTopicData={trendingTopicData} />;
}
