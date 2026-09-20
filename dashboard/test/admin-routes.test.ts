import { describe, expect, it } from "vitest";
import { getActiveAdminSection, parseAdminPath } from "../src/admin/routes";

describe("admin route parsing", () => {
  it("routes /admin to the admin overview", () => {
    expect(parseAdminPath("/admin")).toEqual({ kind: "section", section: "overview" });
    expect(parseAdminPath("/admin/overview")).toEqual({ kind: "section", section: "overview" });
  });

  it("recognises device list and add/edit workflows", () => {
    expect(parseAdminPath("/admin/devices")).toEqual({ kind: "section", section: "devices" });
    expect(parseAdminPath("/admin/devices/new")).toEqual({ kind: "device-new" });
    expect(parseAdminPath("/admin/devices/device-hawick-mppt/edit")).toEqual({
      kind: "device-edit",
      deviceId: "device-hawick-mppt"
    });
  });

  it("keeps device workflows under the devices navigation item", () => {
    expect(getActiveAdminSection(parseAdminPath("/admin/devices/new"))).toBe("devices");
    expect(getActiveAdminSection(parseAdminPath("/admin/devices/device-1/edit"))).toBe("devices");
  });
});
