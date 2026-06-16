import { getSession } from '@/lib/auth/getSession';
import LandingPage from '@/components/landing/LandingPage';

export default async function Page() {
  const session = await getSession();
  return <LandingPage session={session} />;
}
