import { createFileRoute } from "@tanstack/react-router";
import {
  adminAuthConfigured,
  createAdminToken,
  jsonResponse,
  validateAdminLogin,
} from "@/lib/admin-auth.server";

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!adminAuthConfigured()) {
          return jsonResponse(
            {
              error:
                "Admin login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_JWT_SECRET on the server.",
            },
            503,
          );
        }

        try {
          const body = (await request.json()) as { email?: unknown; password?: unknown };
          const email = typeof body.email === "string" ? body.email.trim() : "";
          const password = typeof body.password === "string" ? body.password : "";

          if (!email || !password) {
            return jsonResponse({ error: "Email and password are required." }, 400);
          }

          if (!validateAdminLogin(email, password)) {
            return jsonResponse({ error: "Invalid email or password." }, 401);
          }

          const token = await createAdminToken(email);
          return jsonResponse({
            token,
            email,
            exp: Date.now() + 24 * 60 * 60 * 1000,
          });
        } catch (err) {
          return jsonResponse(
            { error: err instanceof Error ? err.message : "Login failed" },
            500,
          );
        }
      },
    },
  },
});
