import Link from "next/link";
import { buttonVariants } from "../ui/button";

export default function NavbarButton({
  content,
  redirect,
}: {
  content: string;
  redirect: string;
}) {
  return (
    <Link href={redirect} className={buttonVariants({ variant: "link" })}>
      {content}
    </Link>
  );
}
