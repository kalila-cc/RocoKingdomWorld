import { petLabel, type PlannerPet } from "../planner-core";

export function PetImage({ pet, className = "" }: { pet: PlannerPet; className?: string }) {
  // Local files are shared by the hosted and standalone builds.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={`/pets/${pet.image || `${pet.id}.webp`}`} alt={petLabel(pet)} loading="lazy" />;
}
