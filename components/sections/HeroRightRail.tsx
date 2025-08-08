import AccoladesCard from "./AccoladesCard";
import ExpertTeaserCard from "./ExpertTeaserCard";

export default function HeroRightRail() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-[400px]">
      <AccoladesCard />
      <ExpertTeaserCard />
    </div>
  );
}