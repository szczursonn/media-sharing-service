import { createContext } from "react";
import { Community } from "../types";

export const CommunityContext = createContext<{
    communities: Community[]|null,
    loading: boolean
    setCommunities(communities: Community[]|null): void,
    selected: Community|null,
    select(community: Community|null): void
}>({
    communities: null,
    loading: false,
    setCommunities: ()=>{},
    selected: null,
    select: ()=>{}
})