import { Invitation } from "@/components/invite/Invitation";
import { getBoardPins } from "@/lib/pinterest";

// Las fotos del tablero de Pinterest se refrescan cada hora
export const revalidate = 3600;

export default async function Home() {
  const pins = await getBoardPins();
  return <Invitation guest={null} pins={pins} />;
}
