import { describe, expect, it } from "vitest";
import {
  createBlankDeviceFormValues,
  formValuesToDevice,
  parseTags,
  validateDeviceForm
} from "../src/admin/device-form";

describe("device form helpers", () => {
  it("validates required device identity and ownership fields", () => {
    const values = createBlankDeviceFormValues("", "");
    const errors = validateDeviceForm(values);

    expect(errors.name).toBe("Required");
    expect(errors.deviceCode).toBe("Required");
    expect(errors.customerId).toBe("Required");
    expect(errors.installationId).toBe("Required");
  });

  it("validates upload interval and coordinates", () => {
    const values = {
      ...createBlankDeviceFormValues("customer-1", "installation-1"),
      name: "Logger",
      deviceCode: "logger-001",
      deviceModel: "EPEVER Tracer",
      locationAddress: "Field shed",
      uploadIntervalMinutes: "0",
      latitude: "95",
      longitude: "-190"
    };

    const errors = validateDeviceForm(values);
    expect(errors.uploadIntervalMinutes).toBe("Use 1 to 1440 minutes");
    expect(errors.latitude).toBe("Use -90 to 90");
    expect(errors.longitude).toBe("Use -180 to 180");
  });

  it("normalises tags and converts form values into a device model", () => {
    const values = {
      ...createBlankDeviceFormValues("customer-1", "installation-1"),
      name: "Logger",
      deviceCode: "logger_001",
      deviceModel: "EPEVER Tracer",
      hardwareVersion: "HW-1",
      firmwareVersion: "1.0.0",
      locationAddress: "Field shed",
      latitude: "55.5",
      longitude: "-2.5",
      tags: " demo, rs485,, epever "
    };

    expect(parseTags(values.tags)).toEqual(["demo", "rs485", "epever"]);
    expect(validateDeviceForm(values)).toEqual({});
    expect(formValuesToDevice(values, "device-1")).toMatchObject({
      id: "device-1",
      deviceCode: "logger_001",
      latitude: 55.5,
      longitude: -2.5,
      tags: ["demo", "rs485", "epever"],
      mpptProtocol: "modbus_rtu_rs485",
      cloudTransport: "https_rest"
    });
  });
});
