type SignupKind = "invite" | "newsletter";

const signupEndpoints: Record<SignupKind, string> = {
  invite: "/api/invite",
  newsletter: "/api/newsletter",
};

export async function submitEmailSignup(kind: SignupKind, email: string): Promise<void> {
  const response = await fetch(signupEndpoints[kind], {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(`Unable to submit ${kind} signup.`);
  }
}
