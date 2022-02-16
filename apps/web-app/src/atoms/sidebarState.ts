import { atom } from "recoil";

export const sidebarState = atom({
  key: "sidebarState",
  default: {
    isOpen: false,
    mobileShown: false,
  },
});
