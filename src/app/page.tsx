import { getSiteData } from "@/lib/data";
import { SiteClient } from "@/components/SiteClient";

export const revalidate = 300;

export default async function HomePage() {
  const { cafes, categoryPicks, yetToTry } = await getSiteData();

  return (
    <SiteClient
      cafes={cafes}
      categoryPicks={categoryPicks}
      yetToTry={yetToTry}
    />
  );
}
