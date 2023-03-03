import { CastMember } from "./CastMember";
import { CrewMember } from "./CrewMember";

export interface Credits {
  credits: { id: number; cast: CastMember[]; crew: CrewMember[] };
}

export interface CombinedCredits {
  combined_credits: { id: number; cast: CastMember[]; crew: CrewMember[] };
}