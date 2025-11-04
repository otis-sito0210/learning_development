// Mock authentication for development
// Returns a hardcoded user to bypass Google OAuth

export interface MockUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}

export async function getMockUser(): Promise<MockUser> {
  return {
    id: "dev-user-123",
    email: "developer@example.com",
    name: "Developer User",
    image: undefined,
  };
}

export async function getServerSession() {
  // Always return a mock session for development
  return {
    user: await getMockUser(),
  };
}
