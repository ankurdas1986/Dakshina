export const appConfig = {
  brandName: "Dakshina",
  adminAppName: "Dakshina Admin",
  theme: {
    primary: "#FF9933",
    background: "#FFFDD0"
  },
  auth: {
    strategy: "supabase-email-otp-or-magic-link"
  }
} as const;
