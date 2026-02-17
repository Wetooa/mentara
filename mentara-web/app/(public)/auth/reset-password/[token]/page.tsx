import ResetPasswordClient from './ResetPasswordClient';

interface ResetPasswordTokenPageProps {
  params: { token: string };
}

export default function ResetPasswordTokenPage({ params }: ResetPasswordTokenPageProps) {
  return <ResetPasswordClient token={params.token} />;
}
