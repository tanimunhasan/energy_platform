import { useMemo, useState, type FormEvent } from "react";
import {
  cloudTransportOptions,
  deviceStatusOptions,
  mpptProtocolOptions,
  type CustomerAccount,
  type Installation
} from "../device-models";
import {
  type DeviceFormErrors,
  type DeviceFormValues,
  hasDeviceFormErrors,
  validateDeviceForm
} from "../device-form";
import { SelectField, TextAreaField, TextField } from "./FormControls";

interface DeviceFormProps {
  mode: "create" | "edit";
  initialValues: DeviceFormValues;
  customers: CustomerAccount[];
  installations: Installation[];
  deviceCodeInUse: (deviceCode: string) => boolean;
  onCancel: () => void;
  onSubmit: (values: DeviceFormValues) => void;
}

type DeviceField = keyof DeviceFormValues;

export function DeviceForm({
  mode,
  initialValues,
  customers,
  installations,
  deviceCodeInUse,
  onCancel,
  onSubmit
}: DeviceFormProps) {
  const [values, setValues] = useState<DeviceFormValues>(initialValues);
  const [errors, setErrors] = useState<DeviceFormErrors>({});

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name
  }));

  const installationOptions = useMemo(() => {
    return installations
      .filter((installation) => installation.customerId === values.customerId)
      .map((installation) => ({ value: installation.id, label: installation.name }));
  }, [installations, values.customerId]);

  function update(field: DeviceField, value: string) {
    setValues((current) => {
      if (field === "customerId") {
        const nextInstallation = installations.find((installation) => installation.customerId === value);
        return {
          ...current,
          customerId: value,
          installationId: nextInstallation?.id ?? "",
          locationAddress: nextInstallation?.address ?? current.locationAddress,
          timeZone: nextInstallation?.timeZone ?? current.timeZone
        };
      }

      if (field === "installationId") {
        const installation = installations.find((item) => item.id === value);
        return {
          ...current,
          installationId: value,
          locationAddress: installation?.address ?? current.locationAddress,
          timeZone: installation?.timeZone ?? current.timeZone
        };
      }

      return { ...current, [field]: value };
    });

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateDeviceForm(values);
    if (deviceCodeInUse(values.deviceCode)) {
      nextErrors.deviceCode = "Device ID already exists";
    }
    setErrors(nextErrors);
    if (!hasDeviceFormErrors(nextErrors)) onSubmit(values);
  }

  return (
    <div className="admin-page">
      <form className="panel admin-panel device-form" onSubmit={submit}>
        <div className="admin-section-heading">
          <div>
            <span>MOCK DEVICE WORKFLOW</span>
            <h2>{mode === "create" ? "Add device" : "Edit device"}</h2>
          </div>
          <div className="form-actions top-actions">
            <button className="admin-ghost-button" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button className="admin-primary-button" type="submit">
              {mode === "create" ? "Create device" : "Save changes"}
            </button>
          </div>
        </div>

        <section className="form-section">
          <h3>Identity</h3>
          <div className="form-grid">
            <TextField label="Device name" value={values.name} error={errors.name} onChange={(value) => update("name", value)} />
            <TextField label="Unique device ID or serial number" value={values.deviceCode} error={errors.deviceCode} onChange={(value) => update("deviceCode", value)} />
            <TextField label="Device type" value={values.deviceType} error={errors.deviceType} onChange={(value) => update("deviceType", value)} />
            <TextField label="Device model" value={values.deviceModel} error={errors.deviceModel} onChange={(value) => update("deviceModel", value)} />
            <TextField label="Hardware version" value={values.hardwareVersion} error={errors.hardwareVersion} onChange={(value) => update("hardwareVersion", value)} />
            <TextField label="Firmware version" value={values.firmwareVersion} error={errors.firmwareVersion} onChange={(value) => update("firmwareVersion", value)} />
          </div>
        </section>

        <section className="form-section">
          <h3>Ownership</h3>
          <div className="form-grid">
            <SelectField label="Customer/owner" value={values.customerId} options={customerOptions} error={errors.customerId} onChange={(value) => update("customerId", value)} />
            <SelectField label="Installation" value={values.installationId} options={installationOptions} error={errors.installationId} onChange={(value) => update("installationId", value)} />
            <TextField label="Installation date" type="date" value={values.installationDate} error={errors.installationDate} onChange={(value) => update("installationDate", value)} />
            <SelectField label="Status" value={values.status} options={deviceStatusOptions} error={errors.status} onChange={(value) => update("status", value)} />
          </div>
        </section>

        <section className="form-section">
          <h3>Location</h3>
          <div className="form-grid">
            <TextField label="Location/address" value={values.locationAddress} error={errors.locationAddress} onChange={(value) => update("locationAddress", value)} />
            <TextField label="Time zone" value={values.timeZone} error={errors.timeZone} onChange={(value) => update("timeZone", value)} />
            <TextField label="Latitude" type="number" step="0.000001" value={values.latitude} error={errors.latitude} onChange={(value) => update("latitude", value)} />
            <TextField label="Longitude" type="number" step="0.000001" value={values.longitude} error={errors.longitude} onChange={(value) => update("longitude", value)} />
          </div>
        </section>

        <section className="form-section">
          <h3>Configuration</h3>
          <div className="form-grid">
            <TextField label="Upload interval" type="number" min="1" max="1440" value={values.uploadIntervalMinutes} error={errors.uploadIntervalMinutes} onChange={(value) => update("uploadIntervalMinutes", value)} />
            <SelectField label="MPPT protocol" value={values.mpptProtocol} options={mpptProtocolOptions} error={errors.mpptProtocol} onChange={(value) => update("mpptProtocol", value)} />
            <SelectField label="Cloud transport" value={values.cloudTransport} options={cloudTransportOptions} error={errors.cloudTransport} onChange={(value) => update("cloudTransport", value)} />
            <TextField label="Tags" value={values.tags} error={errors.tags} placeholder="demo, epever, rs485" onChange={(value) => update("tags", value)} />
          </div>
        </section>

        <section className="form-section">
          <h3>Description</h3>
          <TextAreaField label="Editable description" value={values.description} error={errors.description} onChange={(value) => update("description", value)} />
        </section>

        <div className="form-actions">
          <button className="admin-ghost-button" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="admin-primary-button" type="submit">
            {mode === "create" ? "Create device" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
