import ResetPasswordClient from './ResetPasswordClient';

export function generateStaticParams() {
  return [];
}

interface ResetPasswordTokenPageProps {
  params: { token: string };
}

export default function ResetPasswordTokenPage({ params }: ResetPasswordTokenPageProps) {
  return <ResetPasswordClient token={params.token} />;
}
