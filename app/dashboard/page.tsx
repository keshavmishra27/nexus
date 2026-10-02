import Link from "next/link";
import { TeamProgress } from "@/components/dashboard/team-progress";
import { buttonVariants } from "@/components/ui/button";
import { getTeamMembersData } from "@/app/dashboard/actions";
import { requireUser } from "@/lib/session";

export const dynamic = 'force-dynamic'; // Ensure we get fresh data on every load

export default async function DashboardPage() {
  const user = await requireUser();
  const members = await getTeamMembersData(user.id);

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] tracking-[0.24em] text-primary uppercase sm:text-xs">Team Nexus</p>
          <h1 className="mt-1 font-heading text-2xl tracking-tight sm:mt-2 sm:text-3xl">Hi, {user.name.split(" ")[0]}</h1>
          <p className="mt-1.5 max-w-xl text-xs text-muted-foreground sm:mt-2 sm:text-sm">
            Submit achievements and follow overall Nexus progress. Individual records and points stay
            with Core until official calculation.
          </p>
        </div>
        <Link href="/dashboard/submit" className={buttonVariants({ className: "w-full sm:w-auto shrink-0 justify-center" })}>
          Submit achievement
        </Link>
      </div>
      <TeamProgress data={{ members } as any} user={user} />
    </>
  );
}
