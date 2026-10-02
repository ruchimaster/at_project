export function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString();
}

export function getErrorMessage(error) {
  return (
    error?.response?.data?.message || "Something went wrong. Please try again."
  );
}

export function mapsUrl(donorAddress, receiverAddress) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    donorAddress || "",
  )}&destination=${encodeURIComponent(
    receiverAddress || "",
  )}&travelmode=driving`;
}
