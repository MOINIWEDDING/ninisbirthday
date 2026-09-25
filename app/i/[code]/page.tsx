import type { Metadata } from "next";
import { Invitation } from "@/components/invite/Invitation";
import { EVENT } from "@/lib/event";
import { getGuestByCode } from "@/lib/store";
import { getBoardPins } from "@/lib/pinterest";
import { toPublic } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

async function load(code: string) {
  try {
    return await getGuestByCode(code);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const guest = await load(code);
  const first = guest?.name.split(" ")[0];
  return {
    title: first ? `${first}, estás invitad@ · ${EVENT.title}` : `${EVENT.title} · ${EVENT.age}`,
    robots: { index: false, follow: false },
  };
}

export default async function GuestInvite({ params }: Props) {
  const { code } = await params;
  const [guest, pins] = await Promise.all([load(code), getBoardPins()]);
  return <Invitation guest={guest ? toPublic(guest) : null} invalidCode={!guest} pins={pins} />;
}
