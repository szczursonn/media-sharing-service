import { createContext } from "react";
import { User } from "../types";

export const UserContext = createContext<{
    user: User|null,
    setUser(user: User|null): void,
}>({
    user: null,
    setUser: ()=>{}
})