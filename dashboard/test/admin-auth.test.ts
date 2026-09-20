import { describe, expect, it } from "vitest";
import { canAccessAdminRoute, canAccessAdminSection } from "../src/admin/auth";
import { parseAdminPath } from "../src/admin/routes";

describe("development admin access rules", () => {
  it("allows super admins to use every admin section", () => {
    expect(canAccessAdminSection("super_admin", "settings")).toBe(true);
    expect(canAccessAdminRoute("super_admin", parseAdminPath("/admin/devices/new"))).toBe(true);
  });

  it("allows customer admins to manage tenant devices but not platform settings", () => {
    expect(canAccessAdminRoute("customer_admin", parseAdminPath("/admin/devices/new"))).toBe(true);
    expect(canAccessAdminSection("customer_admin", "settings")).toBe(false);
  });

  it("keeps viewers and device identities out of admin management routes", () => {
    expect(canAccessAdminSection("customer_viewer", "reports")).toBe(true);
    expect(canAccessAdminRoute("customer_viewer", parseAdminPath("/admin/devices"))).toBe(false);
    expect(canAccessAdminRoute("device", parseAdminPath("/admin"))).toBe(false);
  });
});
